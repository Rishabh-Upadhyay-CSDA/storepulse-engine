import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET() {
  try {
    const productsQuery = await pool.query(`
      SELECT p.id, p.product_name, p.store_url, p.target_price,
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'price', ph.price, 
              'date', ph.scraped_at,
              'in_stock', ph.in_stock
            )
            ORDER BY ph.scraped_at ASC
          )
          FROM price_history ph WHERE ph.product_id = p.id
        ) as history
      FROM tracked_products p;
    `);

    return NextResponse.json({ products: productsQuery.rows });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, storeUrl, targetPrice } = await request.json();

    const insertQuery = await pool.query(
      `INSERT INTO tracked_products (user_email, product_name, store_url, target_price)
       VALUES ($1, $2, $3, $4) RETURNING *;`,
      ['user@example.com', name, storeUrl, targetPrice]
    );

    return NextResponse.json({ product: insertQuery.rows[0] });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}