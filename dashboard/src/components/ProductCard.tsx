"use client";

import { formatLocalTimestamp } from "@/lib/utils";
import { PriceChart } from "./PriceChart";

interface Product {
  id: string;
  title: string;
  current_price: number;
  target_price: number;
  product_url: string;
  image_url?: string;
  last_scanned: string;
  price_history: { scanned_at: string; price: number }[];
}

export function ProductCard({ product }: { product: Product }) {
  const isTargetMet = product.current_price <= product.target_price;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:underline line-clamp-1"
          >
            {product.title}
          </a>
          
          {/* Last Scanned formatted to local browser time + timezone */}
          <p className="mt-1 text-xs text-gray-500">
            Last Scanned:{" "}
            <span className="font-medium text-gray-700">
              {formatLocalTimestamp(product.last_scanned)}
            </span>
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isTargetMet
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isTargetMet ? "Target Met" : "Tracking"}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            ${product.current_price.toFixed(2)}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            (Target: ${product.target_price.toFixed(2)})
          </span>
        </div>
      </div>

      {/* Interactive Price Chart Component */}
      <PriceChart data={product.price_history} />
    </div>
  );
}