import type { Bottle, BottleCategory } from "../types";

export const categories: { value: BottleCategory; label: string; shape: Bottle["shape"]; tone: Bottle["tone"] }[] = [
  { value: "whisky", label: "위스키", shape: "classic", tone: "amber" },
  { value: "wine", label: "와인", shape: "wine", tone: "ruby" },
  { value: "sake", label: "사케", shape: "sake", tone: "clear" },
  { value: "beer", label: "맥주", shape: "tall", tone: "amber" },
  { value: "baijiu", label: "바이주", shape: "short", tone: "clear" },
  { value: "brandy", label: "브랜디", shape: "short", tone: "dark" },
  { value: "gin", label: "진", shape: "tall", tone: "clear" },
  { value: "rum", label: "럼", shape: "classic", tone: "dark" },
  { value: "tequila", label: "테킬라", shape: "short", tone: "clear" },
  { value: "other", label: "기타", shape: "classic", tone: "green" }
];
