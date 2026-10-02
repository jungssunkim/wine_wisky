import { useState } from "react";
import { bottles as initialBottles } from "../data/mockBottles";
import type { Bottle } from "../types";

export const STORAGE_KEY = "wine-wisky:cabinet:v1";
type Snapshot = { bottles: Bottle[]; error: string; blocked: boolean };

function isBottle(value: unknown): value is Bottle {
  if (!value || typeof value !== "object") return false;
  const b = value as Record<string, unknown>;
  return ["id", "name", "shortName", "brand", "country", "note"].every(key => typeof b[key] === "string")
    && typeof b.id === "string" && b.id.length > 0
    && ["whisky", "wine", "sake", "beer", "baijiu", "brandy", "other"].includes(String(b.category))
    && ["owned", "finished"].includes(String(b.status))
    && ["classic", "wine", "sake", "short", "tall"].includes(String(b.shape))
    && ["amber", "ruby", "clear", "green", "dark"].includes(String(b.tone))
    && ["abv", "volumeMl", "price"].every(key => typeof b[key] === "number" && Number.isFinite(b[key]) && (b[key] as number) >= 0)
    && Array.isArray(b.pairings) && b.pairings.every(p => typeof p === "string")
    && (b.rating === undefined || (typeof b.rating === "number" && Number.isFinite(b.rating) && b.rating >= 0 && b.rating <= 5))
    && ["region", "finishedAt", "tastingNote"].every(key => b[key] === undefined || typeof b[key] === "string");
}

function readCabinet(): Snapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { bottles: initialBottles, error: "", blocked: false };
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !Array.isArray(parsed.bottles) || !parsed.bottles.every(isBottle)
      || new Set(parsed.bottles.map((b: Bottle) => b.id)).size !== parsed.bottles.length) throw new Error("Invalid cabinet");
    return { bottles: parsed.bottles, error: "", blocked: false };
  } catch {
    return { bottles: initialBottles, error: "저장된 술장을 읽을 수 없어 예시 술장을 표시합니다. 기존 데이터 보호를 위해 변경은 저장하지 않습니다.", blocked: true };
  }
}

export function useCabinet() {
  const [snapshot, setSnapshot] = useState(readCabinet);
  function commit(next: Bottle[]): boolean {
    if (snapshot.blocked) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, bottles: next }));
      setSnapshot({ bottles: next, error: "", blocked: false });
      return true;
    } catch {
      setSnapshot(current => ({ ...current, error: "저장 공간이 부족하거나 브라우저 저장이 차단되어 변경하지 못했어요. 저장 설정을 확인한 뒤 다시 시도해 주세요." }));
      return false;
    }
  }
  return {
    bottles: snapshot.bottles,
    storageError: snapshot.error,
    addBottle: (bottle: Bottle) => commit([...snapshot.bottles, bottle]),
    updateBottle: (bottle: Bottle) => commit(snapshot.bottles.map(b => b.id === bottle.id ? bottle : b))
  };
}
