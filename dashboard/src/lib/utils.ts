// src/lib/utils.ts

// Converts UTC ISO strings from Neon/PostgreSQL into local browser time with local timezone code
export function formatLocalTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return "Never";

  let cleanStr = String(isoString).trim();

  // Handle standard SQL strings like "2026-07-31 12:00:00"
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