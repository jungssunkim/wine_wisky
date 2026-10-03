import { useRef, useState } from "react";
export function DeleteBottle({ name, onDelete }: { name: string; onDelete: () => boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  return <section className="detail-section delete-section">
    <button ref={trigger} className="text-button" onClick={() => { setConfirming(true); setError(""); }}>잘못 등록한 병 삭제</button>
    {confirming && <div role="group" aria-label="병 삭제 확인">
      <p><strong>{name}</strong>을 삭제할까요? 사진과 시음 기록도 함께 삭제됩니다. 복구하려면 미리 내보낸 백업이 필요합니다.</p>
      <p>다 마신 병은 완병 기록 기능으로 남겨 주세요.</p>
      {error && <p role="alert">{error}</p>}
      <button autoFocus className="secondary-button" onClick={() => { setConfirming(false); trigger.current?.focus(); }}>삭제 취소</button>
      <button className="secondary-button delete-confirm" onClick={() => { if (!onDelete()) setError("삭제하지 못했어요. 기존 병과 기록은 유지됩니다."); }}>사진·기록까지 삭제</button>
    </div>}
  </section>;
}
