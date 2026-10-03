import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { useRef, useState } from "react";
import type { Bottle } from "../types";

export function BottleJournal({ bottle, onUpdate }: { bottle: Bottle; onUpdate: (bottle: Bottle) => boolean }) {
  const [rating, setRating] = useState(bottle.rating === undefined ? "" : String(bottle.rating));
  const [note, setNote] = useState(bottle.tastingNote ?? "");
  const [message, setMessage] = useState("");
  const [confirmFinish, setConfirmFinish] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  useUnsavedChanges(rating !== (bottle.rating === undefined ? "" : String(bottle.rating)) || note !== (bottle.tastingNote ?? ""));
  function changeStatus() {
    if (!form.current?.reportValidity()) return;
    setMessage("");
    const today = new Date();
    const finishedAt = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join(".");
    const finished = bottle.status === "owned";
    if (onUpdate({ ...bottle, rating: rating === "" ? undefined : Number(rating), tastingNote: note.trim(), status: finished ? "finished" : "owned", finishedAt: finished ? finishedAt : undefined })) {
      setNote(note.trim()); setRating(rating === "" ? "" : String(Number(rating)));
      setConfirmFinish(false);
      setMessage(finished ? "빈 병 기록에 남겼어요." : "보유 술장으로 되돌렸어요.");
    }
  }
  return <section className="detail-section journal">
    <span className="eyebrow">MY TASTING JOURNAL</span>
    <h2>나의 시음 기록</h2>
    <form ref={form} className="confirm-form" onSubmit={e => {
      e.preventDefault();
      setMessage("");
      if (onUpdate({ ...bottle, rating: rating === "" ? undefined : Number(rating), tastingNote: note.trim() })) { setNote(note.trim()); setMessage("평점과 메모를 저장했어요."); }
    }}>
      <label>내 평점 (0~5)<input type="number" min="0" max="5" step="0.1" value={rating} onChange={e => { setRating(e.target.value); setMessage(""); }} placeholder="아직 평가하지 않았어요" /></label>
      <label>시음 메모<textarea maxLength={2000} rows={4} value={note} onChange={e => { setNote(e.target.value); setMessage(""); }} placeholder="기억하고 싶은 향과 맛, 함께한 음식을 남겨보세요." /></label>
      <button className="camera-button" type="submit">시음 기록 저장</button>
    </form>
    <div className="status-actions">
      {bottle.status === "finished" ? <button className="secondary-button" onClick={changeStatus}>보유 술장으로 되돌리기</button>
        : confirmFinish ? <div className="finish-confirm"><p>이 병을 다 마셨나요? 작성 중인 평점과 메모도 함께 저장하고 페어링 추천에서는 제외합니다.</p><button className="camera-button" onClick={changeStatus}>네, 다 마셨어요</button><button className="secondary-button" onClick={() => setConfirmFinish(false)}>취소</button></div>
        : <button className="secondary-button" onClick={() => setConfirmFinish(true)}>다 마신 술로 기록</button>}
    </div>
    <p className="journal-message" role="status">{message}</p>
  </section>;
}
