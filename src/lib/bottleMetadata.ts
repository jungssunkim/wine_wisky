export function isPurchaseDate(value: unknown): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= "0001-01-01";
}
export function validMetadata(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const b = value as Record<string, unknown>;
  return (b.purchaseDate === undefined || isPurchaseDate(b.purchaseDate))
    && (b.purchasePlace === undefined || typeof b.purchasePlace === "string" && b.purchasePlace.length <= 100)
    && (b.ageYears === undefined || typeof b.ageYears === "number" && Number.isInteger(b.ageYears) && b.ageYears >= 0 && b.ageYears <= 200)
    && (b.vintage === undefined || typeof b.vintage === "number" && Number.isInteger(b.vintage) && b.vintage >= 1000 && b.vintage <= 9999);
}
