'use client';

import { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Plus, Store, CheckCircle, AlertCircle, Clock, PackageCheck, PackageX, Trash2 
} from 'lucide-react';

interface PricePoint {
  price: number;
  date: string;
  in_stock: boolean;
}

interface Product {
  id: number;
  product_name: string;
  store_url: string;
  target_price: number | null;
  history: PricePoint[] | null;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !storeUrl) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          storeUrl,
          targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        }),
      });

      if (res.ok) {
        setName('');
        setStoreUrl('');
        setTargetPrice('');
        fetchProducts();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to stop tracking this product?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Store className="w-8 h-8 text-blue-600" />
              StorePulse Intelligence
            </h1>
            <p className="text-slate-500 mt-1">
              Automated E-Commerce Price & Competitor Tracking Dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Batch Engine Active
            </div>

            {/* Clerk User Profile & Sign Out Avatar */}
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Add Competitor Product to Track
          </h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Product Label (e.g. Wool Runners)"
              className="p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="Shopify Store URL (e.g. https://allbirds.com)"
              className="p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Target Alert Price ($)"
              className="p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Track Product'}
            </button>
          </form>
        </div>

        {/* Product Cards & Charts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Tracked Items</h2>

          {loading ? (
            <p className="text-slate-500 text-sm">Loading tracked products from Neon PostgreSQL...</p>
          ) : products.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border text-slate-500">
              No products tracked yet. Add a Shopify URL above to start monitoring!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {products.map((product) => {
                const history = product.history || [];
                const latestRecord = history.length > 0 ? history[history.length - 1] : null;
                const latestPrice = latestRecord ? latestRecord.price : null;
                const isStocked = latestRecord ? latestRecord.in_stock : true;

                const lastScrapedFormatted = latestRecord
                  ? new Date(latestRecord.date).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : null;

                const chartData = history.map((item) => {
                  const dateObj = new Date(item.date);
                  return {
                    price: Number(item.price),
                    date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
                    timestamp: dateObj.toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short',
                    }),
                  };
                });

                return (
                  <div key={product.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    
                    {/* Left Details */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-slate-900">{product.product_name}</h3>
                            
                            {/* Stock Status Badge */}
                            {latestRecord && (
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                isStocked 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {isStocked ? (
                                  <>
                                    <PackageCheck className="w-3.5 h-3.5" /> In Stock
                                  </>
                                ) : (
                                  <>
                                    <PackageX className="w-3.5 h-3.5" /> Out of Stock
                                  </>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingId === product.id}
                            title="Remove tracked product"
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <a href={product.store_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline block truncate mt-1">
                          {product.store_url}
                        </a>
                      </div>
                      
                      <div>
                        <span className="text-xs text-slate-500">Current Tracked Price</span>
                        <div className="text-2xl font-extrabold text-slate-900">
                          {latestPrice ? `$${Number(latestPrice).toFixed(2)}` : 'Awaiting Batch Scan'}
                        </div>
                      </div>

                      {/* Timestamps & Alerts */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        {lastScrapedFormatted && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Last scanned: <strong>{lastScrapedFormatted}</strong></span>
                          </div>
                        )}

                        {product.target_price && (
                          <div className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded w-fit">
                            <AlertCircle className="w-3 h-3" /> Target Price: ${Number(product.target_price).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Interactive Chart */}
                    <div className="md:col-span-2 h-44 w-full">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <XAxis 
                              dataKey="timestamp" 
                              stroke="#94a3b8" 
                              fontSize={11} 
                              tickFormatter={(val) => val.split(',')[0]} 
                            />
                            <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
                            
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                                      <p className="text-slate-400 font-medium">{data.timestamp}</p>
                                      <p className="text-sm font-bold text-blue-400">${Number(data.price).toFixed(2)}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#2563eb" 
                              strokeWidth={3} 
                              dot={{ r: 5, fill: '#2563eb' }} 
                              activeDot={{ r: 7 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 text-xs">
                          Pending price history. Data will render after the next batch run.
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}