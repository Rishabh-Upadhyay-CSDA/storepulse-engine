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

// DELETE: Remove product from database (Cascade deletes price_history automatically)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await pool.query('DELETE FROM tracked_products WHERE id = $1;', [id]);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Database Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}