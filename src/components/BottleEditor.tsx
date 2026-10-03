import { validMetadata } from "../lib/bottleMetadata";
import { useEffect, useRef, useState } from "react";
import type { Bottle } from "../types";
import { categories } from "../data/categories";
import { prepareBottlePhoto } from "../lib/bottlePhoto";
import { BottleFigure } from "./BottleFigure";

export function BottleEditor({ initial, seed, saveDisabled = false, onSave, onCancel }: {
  initial?: Bottle; seed?: Bottle; saveDisabled?: boolean; onSave: (bottle: Bottle) => boolean; onCancel: () => void;
}) {
  const preset = initial ?? seed;
  const [name, setName] = useState(preset?.name ?? "");
  const [brand, setBrand] = useState(preset?.brand ?? "");
  const [category, setCategory] = useState<Bottle["category"]>(preset?.category ?? "whisky");
  const [country, setCountry] = useState(preset?.country ?? "");
  const [region, setRegion] = useState(preset?.region ?? "");
  const [abv, setAbv] = useState(initial ? String(initial.abv) : seed && seed.abv > 0 ? String(seed.abv) : "");
  const [volume, setVolume] = useState(initial ? String(initial.volumeMl) : seed ? (seed.volumeMl > 0 ? String(seed.volumeMl) : "") : "700");
  const [price, setPrice] = useState(preset && !preset.priceIsUnknown ? String(preset.price) : "");
  const [purchaseDate, setPurchaseDate] = useState(preset?.purchaseDate ?? "");
  const [purchasePlace, setPurchasePlace] = useState(preset?.purchasePlace ?? "");
  const [ageYears, setAgeYears] = useState(preset?.ageYears === undefined ? "" : String(preset.ageYears));
  const [vintage, setVintage] = useState(preset?.vintage === undefined ? "" : String(preset.vintage));
  const [note, setNote] = useState(preset?.note ?? "");
  const [pairings, setPairings] = useState(preset?.pairings.join(", ") ?? "");
  const [photo, setPhoto] = useState(preset?.bottleImageUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  useEffect(() => () => { request.current += 1; }, []);
  const appearance = categories.find(c => c.value === category)!;
  const draft: Bottle = {
    ...preset, id: initial?.id ?? "preview", name: name.trim() || "새로운 한 병",
    shortName: name.trim() || "새로운 한 병", brand: brand.trim(), category, country: country.trim(),
    region: region.trim() || undefined, abv: Number(abv), volumeMl: Number(volume), price: Number(price),
    purchaseDate: purchaseDate || undefined, purchasePlace: purchasePlace.trim() || undefined,
    ageYears: ageYears.trim() ? Number(ageYears) : undefined, vintage: vintage.trim() ? Number(vintage) : undefined,
    priceIsUnknown: !price.trim(), note: note.trim(),
    pairings: [...new Set(pairings.split(",").map(p => p.trim()).filter(Boolean))],
    shape: preset?.category === category ? preset.shape : appearance.shape,
    tone: preset?.category === category ? preset.tone : appearance.tone,
    status: initial?.status ?? "owned", bottleImageUrl: photo, entrySource: "manual",
    sourceLinks: preset && name.trim() === preset.name && brand.trim() === preset.brand && category === preset.category ? preset.sourceLinks : undefined
  };
  async function selectPhoto(file?: File) {
    if (!file) return;
    const token = ++request.current;
    setBusy(true); setError("");
    try {
      const result = await prepareBottlePhoto(file);
      if (request.current === token) setPhoto(result);
    } catch (e) {
      if (request.current === token) setError(e instanceof Error ? e.message : "사진을 처리하지 못했어요.");
    } finally {
      if (request.current === token) setBusy(false);
    }
  }
  return <form className="confirm-form bottle-editor" onSubmit={e => {
    e.preventDefault();
    if (busy || saveDisabled) return;
    setError("");
    if (!name.trim()) { setError("제품명을 입력해 주세요."); return; }
    if (!abv.trim() || !Number.isFinite(draft.abv) || draft.abv < 0 || draft.abv > 100 ||
        !volume.trim() || !Number.isInteger(draft.volumeMl) || draft.volumeMl < 1 || draft.volumeMl > 100000 ||
        !Number.isInteger(draft.price) || draft.price < 0 || draft.price > 1000000000) {
      setError("도수·용량·가격을 확인해 주세요."); return;
    }
    if (!validMetadata(draft)) { setError("구매일·구매처·숙성 연수·빈티지를 확인해 주세요."); return; }
    if (draft.pairings.length > 20 || draft.pairings.some(p => p.length > 60)) {
      setError("페어링 음식은 20개까지, 이름은 각각 60자 이내로 입력해 주세요."); return;
    }
    if (!onSave({ ...draft, id: initial?.id ?? crypto.randomUUID(), shortName: preset?.name === draft.name ? preset.shortName : draft.name })) {
      setError("저장하지 못했어요. 입력 내용은 유지됩니다. 사진을 빼거나 브라우저 저장 설정을 확인한 뒤 다시 시도해 주세요.");
    }
  }}>
    <div className="editor-preview"><BottleFigure bottle={draft} empty={draft.status === "finished"} /></div>
    <div className="photo-actions">
      <input hidden ref={cameraRef} type="file" aria-label="술병 사진 촬영 파일" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e => { void selectPhoto(e.target.files?.[0]); e.target.value = ""; }} />
      <input hidden ref={albumRef} type="file" aria-label="술병 사진 파일" accept="image/jpeg,image/png,image/webp" onChange={e => { void selectPhoto(e.target.files?.[0]); e.target.value = ""; }} />
      <button type="button" className="secondary-button" disabled={busy} onClick={() => cameraRef.current?.click()}>사진 촬영</button>
      <button type="button" className="secondary-button" disabled={busy} onClick={() => albumRef.current?.click()}>사진 선택</button>
      {photo && <button type="button" className="text-button" disabled={busy} onClick={() => { setPhoto(undefined); setError(""); }}>사진 제거</button>}
    </div>
    <p className="intro-copy" role="status">{busy ? "사진 크기를 줄이고 있어요…" : "사진은 이 브라우저에만 저장돼요. 라벨 읽기는 등록 메뉴의 사진으로 술 찾기를 이용해 주세요. JPG·PNG·WebP, 최대 10MB."}</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <label>제품명 *<input required maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="예: 발베니 더블우드 12" /></label>
    <label>술 종류<select value={category} onChange={e => setCategory(e.target.value as Bottle["category"])}>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
    <label>브랜드<input maxLength={100} value={brand} onChange={e => setBrand(e.target.value)} placeholder="선택 입력" /></label>
    <div className="editor-fields">
      <label>원산지<input maxLength={80} value={country} onChange={e => setCountry(e.target.value)} placeholder="예: 스코틀랜드" /></label>
      <label>지역<input maxLength={80} value={region} onChange={e => setRegion(e.target.value)} placeholder="예: 스페이사이드" /></label>
      <label>도수 (%) *<input type="number" required min="0" max="100" step="0.1" value={abv} onChange={e => setAbv(e.target.value)} /></label>
      <label>용량 (ml) *<input type="number" required min="1" max="100000" step="1" value={volume} onChange={e => setVolume(e.target.value)} /></label>
    </div>
    <label>구매 가격 (원)<input type="number" min="0" max="1000000000" step="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="모르면 비워 두세요" /></label>
    <div className="editor-fields">
      <label>구매일<input type="date" min="0001-01-01" max="9999-12-31" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} /></label>
      <label>구매처<input maxLength={100} value={purchasePlace} onChange={e => setPurchasePlace(e.target.value)} placeholder="선택 입력" /></label>
      <label>숙성 연수 (년)<input type="number" min="0" max="200" step="1" value={ageYears} onChange={e => setAgeYears(e.target.value)} placeholder="미표기 시 비워 두세요" /></label>
      <label>빈티지 (연도)<input type="number" min="1000" max="9999" step="1" value={vintage} onChange={e => setVintage(e.target.value)} placeholder="예: 2020" /></label>
    </div>
    <label>술 설명<textarea rows={3} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} placeholder="라벨에 적힌 특징이나 기억할 정보를 남겨보세요." /></label>
    <label>페어링 음식<textarea rows={2} maxLength={1200} value={pairings} onChange={e => setPairings(e.target.value)} placeholder="치즈, 스테이크처럼 쉼표로 구분해 주세요." /></label>
    <button className="camera-button" type="submit" disabled={busy || saveDisabled}>{initial ? "변경사항 저장" : "내 술장에 저장"}</button>
    <button className="secondary-button" type="button" onClick={onCancel}>취소</button>
  </form>;
}
