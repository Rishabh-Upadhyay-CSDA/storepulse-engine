// src/lib/utils.ts

export function formatLocalTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return "Never";

  // Ensure string is recognized as UTC if it lacks 'Z' or offset
  let formattedString = isoString.trim();
  if (!formattedString.endsWith("Z") && !formattedString.includes("+")) {
    formattedString = formattedString.replace(" ", "T") + "Z";
  }

  const date = new Date(formattedString);

  if (isNaN(date.getTime())) return isoString; // Fallback if invalid date

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short", // Force 3-letter timezone (e.g., IST, EST, PST)
  }).format(date);
}