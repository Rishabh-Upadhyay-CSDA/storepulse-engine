import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Converts UTC ISO strings from Neon/PostgreSQL into local browser time with local timezone code
export function formatLocalTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return "Never";

  const date = new Date(isoString);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short", // Displays local timezone code (e.g., IST, EST, PST)
  }).format(date);
}