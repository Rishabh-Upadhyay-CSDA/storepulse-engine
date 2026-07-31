// src/lib/utils.ts

// Converts UTC ISO strings from Neon/PostgreSQL into local browser time with local timezone code
export function formatLocalTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return "Never";

  let cleanStr = String(isoString).trim();

  // If DB output is "2026-07-31 12:00:00", convert space to T and append Z to mark UTC
  if (!cleanStr.includes("T")) {
    cleanStr = cleanStr.replace(" ", "T");
  }
  if (!cleanStr.endsWith("Z") && !cleanStr.includes("+") && !cleanStr.includes("-")) {
    cleanStr += "Z";
  }

  const date = new Date(cleanStr);

  if (isNaN(date.getTime())) return String(isoString);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short", // Displays IST, EST, PST, etc.
  }).format(date);
}

// Formats numbers into currency strings based on product currency code (USD, INR, EUR, etc.)
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "USD"
): string {
  if (amount == null || isNaN(amount)) return "$0.00";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if an invalid currency code is supplied
    return `$${Number(amount).toFixed(2)}`;
  }
}