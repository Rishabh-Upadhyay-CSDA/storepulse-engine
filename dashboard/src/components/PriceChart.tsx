"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatLocalTimestamp } from "@/lib/utils";

interface PriceHistoryPoint {
  scanned_at: string;
  price: number;
}

interface PriceChartProps {
  data: PriceHistoryPoint[];
}

export function PriceChart({ data }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        No price history recorded yet.
      </div>
    );
  }

  return (
    <div className="h-48 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="scanned_at"
            tickFormatter={(value) =>
              new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis stroke="#9CA3AF" fontSize={12} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const point = payload[0].payload as PriceHistoryPoint;
                return (
                  <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-md">
                    <p className="text-xs font-semibold text-gray-900">
                      ${point.price.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatLocalTimestamp(point.scanned_at)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ r: 3, fill: "#2563EB" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}