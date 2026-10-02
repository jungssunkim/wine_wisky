import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Download, Upload } from "lucide-react";
import type { Bottle } from "../types";
import { downloadText, serializeBackup, parseBackup, MAX_BACKUP_BYTES, MAX_BACKUP_BOTTLES } from "../lib/cabinetData";

export function BackupPage({ bottles, blocked, originalData, onRestore, onBack }: {
  bottles: Bottle[]; blocked: boolean; originalData?: string | null;
  onRestore: (incoming: Bottle[], mode: "merge" | "replace") => boolean; onBack: () => void;
}) {
  const [pending, setPending] = useState<{ bottles: Bottle[]; filename: string } | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">(blocked ? "replace" : "merge");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  useEffect(() => () => { request.current += 1; }, []);
  const existingIds = new Set(bottles.map(b => b.id));
  const additions = pending?.bottles.filter(b => !existingIds.has(b.id)).length ?? 0;
  const duplicates = (pending?.bottles.length ?? 0) - additions;
  const tooMany = mode === "merge" && bottles.length + additions > MAX_BACKUP_BOTTLES;
  async function chooseFile(file?: File) {
    if (!file) return;
    const token = ++request.current;
    setPending(null); setConfirmed(false); setError(""); setMessage(""); setBusy(true);
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("10MB 이하의 백업 파일을 선택해 주세요.");
      const parsed = parseBackup(await file.text());
      if (request.current === token) { setPending({ bottles: parsed, filename: file.name }); setMode(blocked ? "replace" : "merge"); }
    } catch (e) {
      if (request.current === token) setError(e instanceof Error ? e.message : "파일을 읽지 못했어요.");
    } finally {
      if (request.current === token) setBusy(false);
    }
  }
  function exportData() {
    setError(""); setMessage("");
    try {
      const date = new Date().toISOString().slice(0, 10);
      downloadText("wine-wisky-backup-" + date + ".json", serializeBackup(bottles));
      setMessage("백업 파일 다운로드를 요청했어요. 다운로드 폴더에서 확인해 주세요.");
    } catch (e) { setError(e instanceof Error ? e.message : "백업 파일을 만들지 못했어요."); }
  }
  return <main className="page backup-page">
    <header className="topbar"><div><span className="eyebrow">KEEP YOUR COLLECTION</span><h1>백업·복원</h1></div><button className="icon-button" aria-label="술장으로 돌아가기" onClick={onBack}><ChevronLeft /></button></header>
    <p className="intro-copy">사진, 평점, 시음 메모와 빈 병 기록을 하나의 파일에 담아요. 다른 기기에서도 이 파일로 술장을 옮길 수 있어요.</p>
    <section className="backup-section">
      <h2>내 술장 보관하기</h2>
      <p>{blocked ? "현재 표시된 예시 술장은 백업하지 않습니다." : "현재 " + bottles.length + "병 · 보유 " + bottles.filter(b => b.status === "owned").length + "병 · 기록 " + bottles.filter(b => b.status === "finished").length + "병"}</p>
      <button className="camera-button" disabled={blocked} onClick={exportData}><Download size={18} />백업 파일 저장</button>
      {blocked && typeof originalData === "string" && <button className="secondary-button" onClick={() => {
        try { downloadText("wine-wisky-unreadable-original.json", originalData); setMessage("원본 파일 다운로드를 요청했어요. 정상 백업 파일은 아닙니다."); }
        catch { setError("원본 파일을 내려받지 못했어요."); }
      }}>읽지 못한 원본 파일 저장</button>}
      <p className="backup-help">파일에는 내 사진과 메모가 포함돼요. 브라우저 데이터를 지우기 전에 파일을 보관해 주세요. 자동 동기화는 아닙니다.</p>
    </section>
    <section className="backup-section">
      <h2>파일에서 술장 가져오기</h2>
      <input hidden type="file" accept=".json,application/json" aria-label="술장 백업 파일" ref={fileRef} onChange={e => { void chooseFile(e.target.files?.[0]); e.target.value = ""; }} />
      <button className="secondary-button" disabled={busy} onClick={() => fileRef.current?.click()}><Upload size={18} />백업 파일 선택</button>
      <p className="backup-help">이 앱의 JSON 백업 파일 · 최대 10MB / 1,000병. 파일은 기기 안에서만 읽습니다.</p>
      {busy && <p role="status">파일을 확인하고 있어요…</p>}
      {pending && <div className="backup-preview">
        <h3>복원 미리보기</h3>
        <p className="backup-filename">{pending.filename}</p>
        <p>파일 속 {pending.bottles.length}병 · 사진 {pending.bottles.filter(b => b.bottleImageUrl).length}장</p>
        <ul>{pending.bottles.slice(0, 5).map(b => <li key={b.id}>{b.name} <span>{b.status === "finished" ? "완병" : "보유"}</span></li>)}</ul>
        {pending.bottles.length > 5 && <p>외 {pending.bottles.length - 5}병</p>}
        <fieldset className="restore-options"><legend>복원 방법</legend>
          <label><input type="radio" name="restore-mode" value="merge" checked={mode === "merge"} disabled={blocked} onChange={() => { setMode("merge"); setConfirmed(false); }} /><span>현재 술장에 추가</span></label>
          <label><input type="radio" name="restore-mode" value="replace" checked={mode === "replace"} onChange={() => { setMode("replace"); setConfirmed(false); }} /><span>백업 내용으로 교체</span></label>
        </fieldset>
        {mode === "merge" ? <p>새로 추가 {additions}병 · 같은 ID {duplicates}병은 현재 기록을 유지합니다.</p> : <p>{blocked ? "읽지 못한 기존 데이터의 원본을 이 브라우저에 별도 보관한 뒤 교체합니다." : "현재 술장 전체를 파일 속 " + pending.bottles.length + "병으로 교체합니다. 파일에 없는 병은 없어집니다."}</p>}
        {mode === "replace" && <label className="restore-confirm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span>현재 데이터가 교체되는 것을 확인했습니다</span></label>}
        {tooMany && <p className="form-error">추가하면 1,000병을 초과합니다. 더 작은 백업 파일을 선택해 주세요.</p>}
        <button className="camera-button" disabled={busy || tooMany || (mode === "replace" && !confirmed) || (mode === "merge" && additions === 0)} onClick={() => {
          setError(""); setMessage("");
          if (!onRestore(pending.bottles, mode)) { setError("복원하지 못했어요. 기존 술장은 그대로입니다. 저장 공간과 상단 안내를 확인해 주세요."); return; }
          setMessage(mode === "merge" ? additions + "병을 추가했어요." : pending.bottles.length + "병으로 술장을 복원했어요.");
          setPending(null); setConfirmed(false);
        }}>이 내용으로 복원</button>
        <button className="secondary-button" onClick={() => { setPending(null); setConfirmed(false); setError(""); }}>복원 취소</button>
      </div>}
    </section>
    {error && <p className="form-error" role="alert">{error}</p>}
    <p className="backup-message" role="status">{message}</p>
  </main>;
}
