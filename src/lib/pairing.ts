import type { Bottle } from "../types";

const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, "");
// Explicit equivalent food names only; no category-based or partial-word inference.
const aliases = [
  ["치즈", "cheese"], ["스테이크", "steak"], ["초콜릿", "초콜렛", "chocolate"],
  ["피자", "pizza"], ["파스타", "pasta"], ["삼겹살", "pork belly"],
  ["초밥", "스시", "sushi"],
];
export function foodKey(value: string): string {
  const key = normalize(value);
  return aliases.find(group => group.some(item => normalize(item) === key))?.[0] ?? key;
}
export function availableFoods(bottles: Bottle[]): string[] {
  const seen = new Set<string>();
  return bottles.filter(b => b.status === "owned").flatMap(b => b.pairings).filter(food => {
    const key = foodKey(food);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export function findPairings(bottles: Bottle[], food: string) {
  const key = foodKey(food);
  if (!key) return [];
  return bottles.filter(b => b.status === "owned").flatMap(bottle => {
    const matchedFood = bottle.pairings.find(item => foodKey(item) === key);
    return matchedFood ? [{ bottle, matchedFood }] : [];
  });
}
