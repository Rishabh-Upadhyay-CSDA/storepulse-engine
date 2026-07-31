"use client";

import { useState } from "react";
import { formatLocalTimestamp, formatCurrency } from "@/lib/utils";
import { PriceChart } from "./PriceChart";
import { EditProductModal } from "./EditProductModal";

interface Product {
  id: string;
  title: string;
  current_price: number;
  target_price: number;
  currency?: string;
  product_url: string;
  image_url?: string;
  last_scanned: string;
  price_history: { scanned_at: string; price: number }[];
}

export function ProductCard({
  product,
  onRefresh,
}: {
  product: Product;
  onRefresh?: () => void;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const currency = product.currency || "USD";
  const isTargetMet = product.current_price <= product.target_price;

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-blue-500/5">
        
        {/* Top Gradient Highlight Accent Bar */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${isTargetMet ? "from-emerald-500 to-teal-400" : "from-blue-600 to-indigo-500"}`} />

        {/* Card Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-100 transition hover:text-blue-400 line-clamp-1"
            >
              {product.title}
            </a>
            
            <p className="text-xs text-slate-400">
              Last Scanned:{" "}
              <span className="font-medium text-slate-300">
                {formatLocalTimestamp(product.last_scanned)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Edit
            </button>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isTargetMet
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              {isTargetMet ? "Target Met" : "Tracking"}
            </span>
          </div>
        </div>

        {/* Price Display */}
        <div className="mt-5 flex items-baseline justify-between border-t border-slate-800/60 pt-4">
          <div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-2xl font-bold text-transparent">
              {formatCurrency(product.current_price, currency)}
            </span>
            <span className="ml-2 text-xs text-slate-400">
              Target: {formatCurrency(product.target_price, currency)}
            </span>
          </div>
        </div>

        {/* Price History Chart */}
        <div className="mt-2">
          <PriceChart data={product.price_history} currency={currency} />
        </div>
      </div>

      {/* Edit Modal Component */}
      <EditProductModal
        product={{
          id: product.id,
          title: product.title,
          target_price: product.target_price,
          currency: currency,
        }}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}