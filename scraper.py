import os
import requests
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DB_URI = os.getenv("DATABASE_URL")

def get_db_connection():
    """Establishes a connection to your Neon PostgreSQL database."""
    return psycopg2.connect(DB_URI)

def fetch_shopify_products(store_url):
    """
    Fetches the public product catalog from a Shopify store via /products.json
    """
    endpoint = f"{store_url.rstrip('/')}/products.json"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    try:
        response = requests.get(endpoint, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get('products', [])
        else:
            print(f"Failed to fetch {store_url}. Status code: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching {store_url}: {e}")
        return []

def run_pipeline():
    print("Starting StorePulse Batch Pipeline...")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Fetch all items currently listed in tracked_products
    cursor.execute("SELECT id, product_name, store_url, target_price FROM tracked_products;")
    tracked_items = cursor.fetchall()
    
    if not tracked_items:
        print("No products found in the database to track.")
        return

    for item in tracked_items:
        prod_id, name, url, target_price = item
        print(f"\nProcessing product: '{name}' from {url}...")
        
        products = fetch_shopify_products(url)
        
        if not products:
            continue

        # Look at the first available product & variant in the catalog
        first_product = products[0]
        variants = first_product.get('variants', [])
        
        if variants:
            current_price = float(variants[0].get('price', 0.0))
            is_available = variants[0].get('available', False)
            title = first_product.get('title', name)

            print(f"   Found: {title}")
            print(f"   Current Price: ${current_price:.2f} | In Stock: {is_available}")

            # 2. Log this snapshot into price_history
            cursor.execute(
                "INSERT INTO price_history (product_id, price, in_stock) VALUES (%s, %s, %s)",
                (prod_id, current_price, is_available)
            )
            
            # 3. Check for alert condition
            if target_price and current_price <= float(target_price):
                print(f"   ALERT: Price dropped to ${current_price:.2f}! (Target was ${target_price})")

    # Save changes and close connection
    conn.commit()
    cursor.close()
    conn.close()
    print("\nPipeline Execution Complete!")

if __name__ == "__main__":
    run_pipeline()