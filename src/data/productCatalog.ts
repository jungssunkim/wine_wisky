import type { Bottle } from "../types";

export interface CatalogProduct {
  id: string; name: string; brand: string; country: string; abv: number;
  note: string; source: string; matches: (text: string) => boolean;
}
// A small, explicitly bounded catalogue checked against manufacturer pages on 2026-10-03.
// Volumes and prices vary by market and are not inferred from the catalogue.
export const productCatalog: CatalogProduct[] = [
  { id: "balvenie-doublewood-12", name: "The Balvenie DoubleWood 12", brand: "The Balvenie", country: "Scotland", abv: 40,
    note: "12년 숙성 싱글몰트 스카치 위스키. 병의 도수와 용량을 직접 확인해 주세요.",
    source: "https://www.williamgrant.com/nutritional-information/?brand-nutrition=glenfiddich",
    matches: t => /balvenie|발베니/.test(t) && /double\s*wood|더블우드/.test(t) && /\b12\b/.test(t) && !/\b(14|17|21|25|30)\b/.test(t) },
  { id: "johnnie-black", name: "Johnnie Walker Black Label", brand: "Johnnie Walker", country: "Scotland", abv: 40,
    note: "12년 이상 숙성한 몰트·그레인 위스키를 블렌딩한 스카치 위스키.",
    source: "https://www.johnniewalker.com/en/our-whisky/core-range/johnnie-walker-black-label",
    matches: t => /johnnie\s*walker|조니\s*워커/.test(t) && /black\s*label|블랙\s*라벨/.test(t) && !/double|더블/.test(t) },
  { id: "glenfiddich-12", name: "Glenfiddich 12 Year Old", brand: "Glenfiddich", country: "Scotland", abv: 40,
    note: "12년 숙성 싱글몰트 스카치 위스키. 병의 도수와 용량을 직접 확인해 주세요.",
    source: "https://www.williamgrant.com/nutritional-information/?brand-nutrition=glenfiddich",
    matches: t => /glenfiddich|글렌피딕/.test(t) && /\b12\b/.test(t) && !/\b(14|15|18|21|30)\b/.test(t) },
  { id: "macallan-sherry-12", name: "The Macallan Sherry Oak 12", brand: "The Macallan", country: "Scotland", abv: 0,
    note: "셰리 시즈닝 오크통 숙성의 싱글몰트. 말린 과일과 생강·향신료 계열의 특징.",
    source: "https://www.themacallan.com/en-sg/single-malt-scotch-whisky/sherry-oak-12-years-old",
    matches: t => /macallan|맥캘란|맥켈란/.test(t) && /sherry\s*oak|셰리\s*오크|쉐리\s*오크/.test(t) && /\b12\b/.test(t) && !/double|triple|\b(18|25|30)\b/.test(t) }
];
export function matchProducts(text: string) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9가-힣]+/g, " ");
  return productCatalog.filter(p => p.matches(normalized));
}
export function makeScanDraft(text: string, photo?: string, product?: CatalogProduct): Bottle {
  const abv = text.match(/(\d{1,2}(?:\.\d+)?)\s*%/);
  const volume = text.match(/\b(\d{2,4})\s*(ml|cl)\b/i);
  const volumeMl = volume ? Number(volume[1]) * (volume[2].toLowerCase() === "cl" ? 10 : 1) : 0;
  return {
    id: "scan-draft", name: product?.name ?? text.split("\n").find(t => t.trim())?.trim().slice(0, 100) ?? "",
    shortName: product?.name ?? text.split("\n").find(t => t.trim())?.trim().slice(0, 100) ?? "", brand: product?.brand ?? "", category: product ? "whisky" : "other",
    country: product?.country ?? "", abv: abv ? Number(abv[1]) : product?.abv ?? 0,
    volumeMl: volumeMl > 0 && volumeMl <= 100000 ? volumeMl : 0,
    price: 0, priceIsUnknown: true, note: product?.note ?? "", pairings: [],
    shape: "classic", tone: product ? "amber" : "clear", status: "owned", entrySource: "manual", bottleImageUrl: photo,
    sourceLinks: product ? [{title: product.brand + " 공식 정보", url: product.source}] : undefined
  };
}
