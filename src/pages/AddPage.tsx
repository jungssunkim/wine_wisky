import { useEffect, useState } from "react";
import { Camera, ChevronLeft, Wine } from "lucide-react";
import { BottleFigure } from "../components/BottleFigure";
import { bottles } from "../data/mockBottles";
import type { Bottle } from "../types";

export function AddPage({ onSave }: { onSave: (bottle: Bottle) => void }) {
  const [step, setStep] = useState<"camera" | "analyzing" | "candidates" | "confirm">("camera");
  const [selected, setSelected] = useState(bottles[0]);
  const [name, setName] = useState(bottles[0].name);
  const [price, setPrice] = useState(String(bottles[0].price));
  useEffect(() => {
    if (step !== "analyzing") return;
    const timer = window.setTimeout(() => setStep("candidates"), 900);
    return () => window.clearTimeout(timer);
  }, [step]);
  return <main className="page">
    <header className="topbar"><div><span className="eyebrow">CAMERA FIRST</span><h1>새로운 한 병</h1></div>{step !== "camera" && <button className="icon-button" aria-label="촬영으로 돌아가기" onClick={() => setStep("camera")}><ChevronLeft /></button>}</header>
    <p className="intro-copy">사진 인식 체험 · 실제 촬영·검색 없이 예시 제품으로 진행해요. 추가한 병은 이 브라우저에 저장됩니다.</p>
    {step === "camera" && <section className="camera-stage">
      <div className="scan-frame"><div className="scan-corner tl" /><div className="scan-corner tr" /><div className="scan-corner bl" /><div className="scan-corner br" /><div className="scan-placeholder"><Wine size={72} strokeWidth={1} /><p>라벨이 잘 보이도록<br />술병 전체를 맞춰주세요</p></div><div className="scan-line" /></div>
      <button className="camera-button" onClick={() => setStep("analyzing")}><Camera size={24} />예시 사진으로 촬영 체험</button>
      <button className="secondary-button" onClick={() => setStep("candidates")}>예시 제품 목록에서 선택</button>
    </section>}
    {step === "analyzing" && <section className="scan-frame analyzing" role="status"><Wine size={56} /><h2>라벨을 살펴보는 중…</h2><p>예시 제품 후보를 준비하고 있어요.</p><button className="secondary-button" onClick={() => setStep("camera")}>취소</button></section>}
    {step === "candidates" && <section><h2>어떤 제품인가요?</h2><p className="intro-copy">라벨과 용량을 비교한 뒤 선택해 주세요.</p>{bottles.slice(0, 3).map(bottle => <button className="candidate" key={bottle.id} onClick={() => { setSelected(bottle); setName(bottle.name); setPrice(String(bottle.price)); setStep("confirm"); }}><BottleFigure bottle={bottle} /><span><strong>{bottle.name}</strong><small>{bottle.country} · {bottle.abv}% · {bottle.volumeMl} ml</small><small>출처: 앱에 포함된 예시 데이터</small></span></button>)}</section>}
    {step === "confirm" && <form className="confirm-form" onSubmit={e => { e.preventDefault(); if (!name.trim()) return; onSave({...selected, id: crypto.randomUUID(), name: name.trim(), shortName: name.trim() === selected.name ? selected.shortName : name.trim(), price: Number(price), status: "owned", rating: undefined, tastingNote: undefined, finishedAt: undefined}); }}>
      <BottleFigure bottle={selected} /><h2>내 술장에 들이기</h2>
      <label>제품명<input required maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>
      <label>구매 가격 (원)<input type="number" required min="0" max="1000000000" step="1" value={price} onChange={e => setPrice(e.target.value)} /></label>
      <p>{selected.country} · {selected.abv}% · {selected.volumeMl} ml</p><p className="intro-copy">{selected.note}<br />출처: 앱 예시 데이터. 실제 제품 식별 결과나 실시간 가격이 아닙니다.</p>
      <button className="camera-button" type="submit">이 제품이 맞아요 · 술장에 추가</button><button className="secondary-button" type="button" onClick={() => setStep("candidates")}>다른 후보 선택</button>
    </form>}
  </main>;
}
