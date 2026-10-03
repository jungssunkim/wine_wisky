import type { Bottle } from "../types";
export type SortOrder = "default" | "name" | "rating" | "price-low" | "price-high";
export function sortBottles(bottles: Bottle[], order: SortOrder): Bottle[] {
  return [...bottles].sort((a, b) => {
    if (order === "name") return a.name.localeCompare(b.name, "ko");
    if (order === "rating") return (b.rating ?? -1) - (a.rating ?? -1);
    if (order === "price-low" || order === "price-high") {
      if (!!a.priceIsUnknown !== !!b.priceIsUnknown) return a.priceIsUnknown ? 1 : -1;
      if (a.priceIsUnknown && b.priceIsUnknown) return 0;
      return order === "price-low" ? a.price - b.price : b.price - a.price;
    }
    return 0;
  });
}
export function matchesBottle(bottle: Bottle, query: string): boolean {
  return [bottle.name, bottle.brand, bottle.country, bottle.tastingNote ?? ""].join(" ").normalize("NFKC").toLowerCase().includes(query.trim().normalize("NFKC").toLowerCase());
}
