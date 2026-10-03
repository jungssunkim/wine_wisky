import { validMetadata } from "./bottleMetadata";
import { categories } from "../data/categories";
import { isLocalPhoto } from "./bottlePhoto";
import type { Bottle } from "../types";

export function isSourceLink(value: unknown): value is { title: string; url: string } {
  if (!value || typeof value !== "object") return false;
  const link = value as Record<string, unknown>;
  if (typeof link.title !== "string" || !link.title.trim() || link.title.length > 150 || typeof link.url !== "string" || link.url.length > 2000) return false;
  try { const url = new URL(link.url); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}

export function isBottle(value: unknown): value is Bottle {
  if (!value || typeof value !== "object") return false;
  const b = value as Record<string, unknown>;
  return validMetadata(b) && ["id", "name", "shortName", "brand", "country", "note"].every(key => typeof b[key] === "string")
    && typeof b.id === "string" && b.id.length > 0
    && categories.some(c => c.value === b.category)
    && ["owned", "finished"].includes(String(b.status))
    && ["classic", "wine", "sake", "short", "tall"].includes(String(b.shape))
    && ["amber", "ruby", "clear", "green", "dark"].includes(String(b.tone))
    && ["abv", "volumeMl", "price"].every(key => typeof b[key] === "number" && Number.isFinite(b[key]) && (b[key] as number) >= 0)
    && Array.isArray(b.pairings) && b.pairings.every(p => typeof p === "string")
    && (b.rating === undefined || (typeof b.rating === "number" && Number.isFinite(b.rating) && b.rating >= 0 && b.rating <= 5))
    && (b.sourceLinks === undefined || (Array.isArray(b.sourceLinks) && b.sourceLinks.length <= 3 && b.sourceLinks.every(isSourceLink)))
    && (b.bottleImageUrl === undefined || isLocalPhoto(b.bottleImageUrl))
    && (b.priceIsUnknown === undefined || typeof b.priceIsUnknown === "boolean")
    && (b.entrySource === undefined || b.entrySource === "manual" || b.entrySource === "demo")
    && ["region", "finishedAt", "tastingNote"].every(key => b[key] === undefined || typeof b[key] === "string");
}


export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
export const MAX_BACKUP_BOTTLES = 1000;

export function isImportable(b: unknown): b is Bottle {
  if (!isBottle(b)) return false;
  return b.name.trim().length > 0 && b.shortName.trim().length > 0 &&
    b.id.length <= 200 && b.name.length <= 100 && b.shortName.length <= 100 &&
    b.brand.length <= 100 && b.country.length <= 80 && b.note.length <= 2000 &&
    (b.region?.length ?? 0) <= 80 && (b.tastingNote?.length ?? 0) <= 2000 &&
    (b.finishedAt?.length ?? 0) <= 40 &&
    b.abv <= 100 && Number.isInteger(b.volumeMl) && b.volumeMl >= 1 && b.volumeMl <= 100000 &&
    Number.isInteger(b.price) && b.price <= 1000000000 &&
    b.pairings.length <= 20 && b.pairings.every(p => p.trim().length > 0 && p.length <= 60);
}

// Copy only supported fields. Unknown fields from imported JSON never enter app state.
function cleanBottle(b: Bottle): Bottle {
  return {
    id: b.id, name: b.name, shortName: b.shortName.trim() || b.name.trim(), brand: b.brand,
    category: b.category, country: b.country, region: b.region,
    abv: b.abv, volumeMl: b.volumeMl, price: b.price,
    status: b.status, note: b.note, pairings: [...b.pairings],
    shape: b.shape, tone: b.tone, rating: b.rating,
    finishedAt: b.finishedAt, tastingNote: b.tastingNote,
    bottleImageUrl: b.bottleImageUrl, priceIsUnknown: b.priceIsUnknown, entrySource: b.entrySource,
    purchaseDate: b.purchaseDate, purchasePlace: b.purchasePlace, ageYears: b.ageYears, vintage: b.vintage,
    sourceLinks: b.sourceLinks?.map(link => ({title: link.title, url: link.url}))
  };
}

export function parseBackup(text: string): Bottle[] {
  if (new Blob([text]).size > MAX_BACKUP_BYTES) throw new Error("10MB 이하의 백업 파일을 선택해 주세요.");
  let data: unknown;
  try { data = JSON.parse(text.replace(/^\uFEFF/, "")); }
  catch { throw new Error("백업 파일을 읽을 수 없어요. 올바른 JSON 파일인지 확인해 주세요."); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("술장 백업 파일이 아닙니다.");
  const d = data as Record<string, unknown>;
  if (d.version !== 1) throw new Error("지원하지 않는 백업 버전입니다. 버전 1 파일을 선택해 주세요.");
  if (d.format !== undefined && d.format !== "wine-wisky-cabinet") throw new Error("다른 앱의 백업 파일입니다.");
  if (!Array.isArray(d.bottles) || d.bottles.length > MAX_BACKUP_BOTTLES || !d.bottles.every(isImportable)) {
    throw new Error("술 정보가 올바르지 않거나 1,000병을 초과한 파일입니다. 기존 술장은 변경하지 않았어요.");
  }
  const bottles = d.bottles as Bottle[];
  if (new Set(bottles.map(b => b.id)).size !== bottles.length) throw new Error("파일 안에 중복된 병 ID가 있어요. 원본 백업을 다시 선택해 주세요.");
  return bottles.map(cleanBottle);
}

export function serializeBackup(bottles: Bottle[]): string {
  const data = JSON.stringify({ format: "wine-wisky-cabinet", version: 1, exportedAt: new Date().toISOString(), bottles: bottles.map(cleanBottle) }, null, 2);
  // Never create a backup that this version cannot import again.
  parseBackup(data);
  return data;
}

export function mergeBottles(current: Bottle[], incoming: Bottle[]): Bottle[] {
  const ids = new Set(current.map(b => b.id));
  return [...current, ...incoming.filter(b => !ids.has(b.id))];
}

export function downloadText(filename: string, contents: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: "application/json;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link);
  try { link.click(); }
  finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
