# StorePulse

> **Real-time, automated e-commerce price tracking and market intelligence platform.**

StorePulse monitors product prices across online stores, logs price history in PostgreSQL, formats local user time zones automatically, and provides a sleek dashboard interface with historical charts and target price alerts.

---

## Key Features

- **Automated Scraping Engine**: Scheduled background Python scraper to fetch real-time e-commerce prices.
- **Timezone Awareness**: Converts UTC timestamps from Neon/PostgreSQL into exact local time in browser charts and cards.
- **Visual Analytics**: Interactive price history trend charts powered by Recharts.
- **Secure Authentication**: User management and protected dashboard routes powered by Clerk.
- **Modern Dark UI**: Ambient background gradients, glassmorphic cards, and system status indicators.

---

## Architecture & Tech Stack

- **Frontend / Dashboard**: Next.js 14 (App Router), React, Tailwind CSS, Recharts
- **Database**: Serverless PostgreSQL (Neon)
- **Authentication**: Clerk (@clerk/nextjs)
- **Scraper Engine**: Python (requests, BeautifulSoup4, psycopg2)
- **Automation / CI/CD**: GitHub Actions (Cron runner for scraper pipeline)
- **Hosting**: Vercel (Next.js Application)

---

## Repository Structure

```text
storepulse-engine/
├── .github/
│   └── workflows/
│       └── scheduled_pipeline.yml   # Cron workflow for automated python scraping
├── dashboard/                       # Next.js frontend application
│   ├── public/                      # Static assets & icons
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages & API routes
│   │   │   ├── api/products/        # REST endpoints for products & price trends
│   │   │   ├── sign-in/             # Clerk authentication routes
│   │   │   ├── sign-up/
│   │   │   ├── globals.css          # Tailwind CSS global styles
│   │   │   ├── layout.tsx           # Root layout with gradient ambient UI & footer
│   │   │   └── page.tsx             # Main dashboard grid page
│   │   ├── components/
│   │   │   ├── PriceChart.tsx       # Recharts price trend visualization
│   │   │   └── ProductCard.tsx      # Product price card component
│   │   └── lib/
│   │       └── utils.ts             # Timezone and timestamp formatters
│   ├── middleware.ts                # Clerk authentication middleware
│   ├── next.config.ts               # Next.js configuration
│   ├── package.json                 # Node.js dependencies
│   └── tsconfig.json                # TypeScript settings
├── scraper.py                       # Python e-commerce price scraper script
├── requirements.txt                 # Python dependencies
└── README.md
```

---

## Complete Setup Guide

### 1. Database Configuration (Neon PostgreSQL)

Run the following DDL statements in your Neon SQL Console to create tables with TIMESTAMPTZ timezone support:

```text
CREATE TABLE tracked_products (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    store_url TEXT NOT NULL,
    target_price NUMERIC(10, 2),
    created_at TIMESTAMPZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES tracked_products(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    in_stock BOOLEAN NOT NULL,
    scraped_at TIMESTAMPZ DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. Frontend Local Setup (/dashboard)

1. Navigate to the dashboard directory:
   cd dashboard

2. Install dependencies:
   npm install

3. Create a .env.local file inside dashboard/:
   ```text
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   DATABASE_URL=postgresql://user:...@...neon.tech/neondb?sslmode=require
   ```

4. Start the Next.js development server:
   npm run dev

5. Open http://localhost:3000 in your browser.

---

### 3. Python Scraper Local Setup

1. From the project root directory, set up a Python virtual environment:
   ```text
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
   
2. Install requirements:
   pip install -r requirements.txt

3. Set environment variables:
   export DATABASE_URL="postgresql://user:password@ep-example.neon.tech/neondb?sslmode=require"

4. Run the scraper manually:
   python scraper.py

---

## Deployment Guide

### Deploying Dashboard to Vercel

1. Import your repository into Vercel.
2. Under Project Settings -> General:
   - Set Root Directory to dashboard.
3. Under Environment Variables, add:
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   - DATABASE_URL
4. Deploy!

### Deploying Automated Scraper via GitHub Actions

1. Open your GitHub Repository -> Settings -> Secrets and variables -> Actions.
2. Add a new Repository Secret:
   - Name: DATABASE_URL
   - Value: Your production Neon database connection string.
3. The workflow in .github/workflows/scheduled_pipeline.yml will run automatically according to the scheduled cron expression.

---

## License

This project is open-source and available under the MIT License.
