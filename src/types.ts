export type BottleStatus = "owned" | "finished";

export type BottleCategory =
  | "whisky"
  | "wine"
  | "sake"
  | "beer"
  | "baijiu"
  | "brandy"
  | "other";

export interface Bottle {
  id: string;
  name: string;
  shortName: string;
  brand: string;
  category: BottleCategory;
  country: string;
  region?: string;
  abv: number;
  volumeMl: number;
  price: number;
  status: BottleStatus;
  note: string;
  pairings: string[];
  shape: "classic" | "wine" | "sake" | "short" | "tall";
  tone: "amber" | "ruby" | "clear" | "green" | "dark";
  rating?: number;
  finishedAt?: string;
  tastingNote?: string;
}
