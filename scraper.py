import os
import re
import requests
import psycopg2
import resend
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_URI = os.getenv("DATABASE_URL")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def get_db_connection():
    return psycopg2.connect(DB_URI)

def send_price_drop_email(to_email, product_name, current_price, target_price, store_url):
    """Sends a transactional email notification using Resend."""
    if not RESEND_API_KEY:
        print("RESEND_API_KEY missing. Skipping email notification.")
        return

    try:
        resend.Emails.send({
            "from": "StorePulse Alerts <onboarding@resend.dev>",
            "to": [to_email],
            "subject": f"Price Drop Alert: {product_name} is now ${current_price:.2f}!",
            "html": f"""
                <h2>Great news!</h2>
                <p>The price for <strong>{product_name}</strong> has dropped below your target price of <strong>${target_price:.2f}</strong>!</p>
                <p><strong>Current Price:</strong> ${current_price:.2f}</p>
                <p><a href="{store_url}" style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Buy Now on Store</a></p>
            """
        })
        print(f"   Alert email sent to {to_email}!")
    except Exception as e:
        print(f"   Failed to send email: {e}")

def fetch_via_shopify_json(store_url):
    """Primary method: Extract data from Shopify's public JSON API."""
    endpoint = f"{store_url.rstrip('/')}/products.json"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(endpoint, headers=headers, timeout=10)
        if response.status_code == 200:
            products = response.json().get('products', [])
            if products:
                first_product = products[0]
                variants = first_product.get('variants', [])
                if variants:
                    price = float(variants[0].get('price', 0.0))
                    is_available = variants[0].get('available', True)
                    return price, is_available
    except Exception as e:
        print(f"   Shopify JSON API bypass failed: {e}")
    
    return None, None

def fetch_via_html_fallback(store_url):
    """Fallback method: Parse metadata tags from raw HTML using BeautifulSoup."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
    }

    try:
        response = requests.get(store_url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"   HTTP Error {response.status_code} when fetching page.")
            return None, None

        soup = BeautifulSoup(response.text, 'html.parser')

        # 1. Search for OpenGraph price meta tags (Standard across 95%+ of e-commerce sites)
        price_meta = (
            soup.find("meta", property="product:price:amount") or 
            soup.find("meta", property="og:price:amount") or
            soup.find("meta", attrs={"name": "twitter:data1"})
        )

        price = None
        if price_meta and price_meta.get("content"):
            # Clean string like "$50.00" or "50.00 USD" down to float
            raw_price = price_meta["content"]
            cleaned_price = re.sub(r'[^\d.]', '', raw_price)
            if cleaned_price:
                price = float(cleaned_price)

        # 2. Search for Stock Availability meta tag
        availability_meta = (
            soup.find("meta", property="product:availability") or
            soup.find("meta", property="og:availability")
        )

        is_available = True
        if availability_meta and availability_meta.get("content"):
            content = availability_meta["content"].lower()
            if "out of stock" in content or "oom" in content or "false" in content:
                is_available = False

        return price, is_available

    except Exception as e:
        print(f"   HTML Fallback parsing error: {e}")
        return None, None

def scrape_product(store_url):
    """Coordinates scraping using primary JSON API with HTML parsing fallback."""
    # Try Primary Shopify API
    price, is_available = fetch_via_shopify_json(store_url)
    if price is not None:
        print("   Extracted via Shopify JSON API.")
        return price, is_available

    # Try HTML Fallback
    print("   ℹPrimary API blocked/empty. Trying BeautifulSoup HTML Fallback...")
    price, is_available = fetch_via_html_fallback(store_url)
    if price is not None:
        print(f"   Extracted via HTML Fallback: ${price:.2f}")
        return price, is_available

    print("   All extraction methods failed for this URL.")
    return None, None

def run_pipeline():
    print("Starting StorePulse Batch Pipeline...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, user_email, product_name, store_url, target_price FROM tracked_products;")
    tracked_items = cursor.fetchall()

    for item in tracked_items:
        prod_id, user_email, name, url, target_price = item
        print(f"\nProcessing product: '{name}' ({url})...")
        
        current_price, is_available = scrape_product(url)
        if current_price is None:
            continue

        # Insert price record into database
        cursor.execute(
            "INSERT INTO price_history (product_id, price, in_stock) VALUES (%s, %s, %s)",
            (prod_id, current_price, is_available)
        )
        
        # Check for target price trigger
        if target_price and current_price <= float(target_price):
            print(f"   ALERT: Price dropped to ${current_price:.2f}!")
            send_price_drop_email(user_email, name, current_price, float(target_price), url)

    conn.commit()
    cursor.close()
    conn.close()
    print("\nPipeline Execution Complete!")

if __name__ == "__main__":
    run_pipeline()