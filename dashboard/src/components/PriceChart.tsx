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

export function PriceChart({ data }: { data: PriceHistoryPoint[] }) {
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
            tickFormatter={(val) => {
              const strVal = String(val);
              const d = new Date(strVal.endsWith("Z") ? strVal : strVal.replace(" ", "T") + "Z");
              return isNaN(d.getTime())
                ? strVal
                : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }}
            stroke="#9CA3AF"
            fontSize={12}
          />
          
          <YAxis stroke="#9CA3AF" fontSize={12} />
          
          <Tooltip
            labelFormatter={(label) => formatLocalTimestamp(label ? String(label) : "")}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Price"]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderRadius: "0.5rem",
              borderColor: "#E5E7EB",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
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