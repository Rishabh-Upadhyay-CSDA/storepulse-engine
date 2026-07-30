import os
import requests
import psycopg2
import resend
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

def fetch_shopify_products(store_url):
    endpoint = f"{store_url.rstrip('/')}/products.json"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    try:
        response = requests.get(endpoint, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get('products', [])
        return []
    except Exception:
        return []

def run_pipeline():
    print("Starting StorePulse Batch Pipeline...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, user_email, product_name, store_url, target_price FROM tracked_products;")
    tracked_items = cursor.fetchall()

    for item in tracked_items:
        prod_id, user_email, name, url, target_price = item
        print(f"\nProcessing product: '{name}'...")
        
        products = fetch_shopify_products(url)
        if not products:
            continue

        first_product = products[0]
        variants = first_product.get('variants', [])
        
        if variants:
            current_price = float(variants[0].get('price', 0.0))
            is_available = variants[0].get('available', False)

            # Insert price record
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