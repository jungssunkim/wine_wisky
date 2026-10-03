import { useState } from "react";
import { bottles as initialBottles } from "../data/mockBottles";
import { isBottle, mergeBottles, MAX_BACKUP_BOTTLES } from "../lib/cabinetData";
import type { Bottle } from "../types";

export const STORAGE_KEY = "wine-wisky:cabinet:v1";
export const RECOVERY_KEY = "wine-wisky:recovery:v1";
type Snapshot = { bottles: Bottle[]; error: string; blocked: boolean; raw: string | null | undefined };

function readCabinet(): Snapshot {
  let raw: string | null | undefined;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { bottles: initialBottles, error: "", blocked: false, raw };
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !Array.isArray(parsed.bottles) || !parsed.bottles.every(isBottle)
      || new Set(parsed.bottles.map((b: Bottle) => b.id)).size !== parsed.bottles.length) throw new Error("Invalid cabinet");
    return { bottles: parsed.bottles, error: "", blocked: false, raw };
  } catch {
    return { bottles: initialBottles, error: "저장된 술장을 읽을 수 없어 예시 술장을 표시합니다. 일반 변경은 저장하지 않습니다. 백업·복원에서 원본을 보관하거나 정상 백업으로 복구할 수 있어요.", blocked: true, raw };
  }
}

export function useCabinet() {
  const [snapshot, setSnapshot] = useState(readCabinet);
  function commit(next: Bottle[], recover = false): boolean {
    if (snapshot.blocked && !recover) return false;
    try {
      // Refuse stale writes from another tab instead of silently overwriting them.
      if (snapshot.raw === undefined || localStorage.getItem(STORAGE_KEY) !== snapshot.raw) {
        setSnapshot(current => ({ ...current, error: "다른 탭에서 술장이 변경됐거나 저장소를 읽을 수 없어요. 새로고침 후 다시 시도해 주세요." }));
        return false;
      }
      if (next.length > MAX_BACKUP_BOTTLES) {
        setSnapshot(current => ({ ...current, error: "술장은 최대 1,000병까지 저장할 수 있어요." }));
        return false;
      }
      const raw = JSON.stringify({ version: 1, bottles: next });
      // Before replacing unreadable data, retain its exact bytes in a recovery slot.
      if (snapshot.blocked && snapshot.raw !== null) localStorage.setItem(RECOVERY_KEY, snapshot.raw);
      localStorage.setItem(STORAGE_KEY, raw);
      setSnapshot({ bottles: next, error: "", blocked: false, raw });
      return true;
    } catch {
      setSnapshot(current => ({ ...current, error: "저장 공간이 부족하거나 브라우저 저장이 차단되어 변경하지 못했어요. 기존 데이터는 유지됩니다." }));
      return false;
    }
  }
  return {
    bottles: snapshot.bottles,
    storageError: snapshot.error,
    storageBlocked: snapshot.blocked,
    originalData: snapshot.blocked ? snapshot.raw : undefined,
    addBottle: (bottle: Bottle) => commit([...snapshot.bottles, bottle]),
    deleteBottle: (id: string) => snapshot.bottles.some(b => b.id === id) && commit(snapshot.bottles.filter(b => b.id !== id)),
    updateBottle: (bottle: Bottle) => commit(snapshot.bottles.map(b => b.id === bottle.id ? bottle : b)),
    restoreBottles: (incoming: Bottle[], mode: "merge" | "replace") => {
      if (snapshot.blocked && mode !== "replace") return false;
      return commit(mode === "merge" ? mergeBottles(snapshot.bottles, incoming) : incoming, mode === "replace");
    }
  };
}
