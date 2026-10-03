import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Camera, ImagePlus } from "lucide-react";
import type { Bottle } from "../types";
import { prepareBottlePhoto } from "../lib/bottlePhoto";
import { readLabel } from "../lib/labelOcr";
import { makeScanDraft, matchProducts, productCatalog, type CatalogProduct } from "../data/productCatalog";
import { BottleEditor } from "../components/BottleEditor";

export function ScanPage({onSave, onBack}: {onSave: (bottle: Bottle) => boolean; onBack: () => void}) {
  const [photo, setPhoto] = useState<string>();
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [seed, setSeed] = useState<Bottle>();
  const [confirmed, setConfirmed] = useState(false);
  const camera = useRef<HTMLInputElement>(null);
  const album = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const task = useRef<ReturnType<typeof readLabel>>();
  useEffect(() => () => { generation.current++; task.current?.cancel(); }, []);
  function cancel() { generation.current++; task.current?.cancel(); task.current = undefined; setBusy(false); setMessage("인식을 취소했어요. 글자를 직접 입력할 수도 있어요."); }
  async function selectPhoto(file?: File) {
    if (!file) return;
    const token = ++generation.current;
    task.current?.cancel(); setBusy(true); setError(""); setMessage("사진을 준비하고 있어요…");
    try {
      const prepared = await prepareBottlePhoto(file);
      if (token !== generation.current) return;
      setPhoto(prepared); setText(""); setQuery(""); setSearched(false); setMessage("사진을 확인한 뒤 라벨 읽기를 눌러 주세요.");
    } catch(e) { if (token === generation.current) setError(e instanceof Error ? e.message : "사진을 읽지 못했어요."); }
    finally { if (token === generation.current) setBusy(false); }
  }
  async function recognize() {
    if (!photo || busy) return;
    const token = ++generation.current;
    setBusy(true); setError(""); setSearched(false);
    const job = readLabel(photo, value => { if (generation.current === token) setMessage(value); });
    task.current = job;
    try {
      const result = await job.promise;
      if (generation.current !== token) return;
      setText(result); setQuery(result); setSearched(true);
      setMessage(result ? "읽은 글자를 확인해 주세요. 제품 후보는 확정 결과가 아닙니다." : "읽을 수 있는 영문을 찾지 못했어요. 글자를 입력하거나 다시 촬영해 주세요.");
    } catch(e) { if (generation.current === token) setError(e instanceof Error ? e.message : "인식에 실패했어요."); }
    finally { if (generation.current === token) { setBusy(false); task.current = undefined; } }
  }
  function choose(product?: CatalogProduct) {
    setSeed(makeScanDraft(text, photo, product)); setConfirmed(!product); setError("");
  }
  if (seed) return <main className="page scan-page">
    <header className="topbar"><div><span className="eyebrow">CONFIRM YOUR BOTTLE</span><h1>제품 확인</h1></div><button className="icon-button" aria-label="인식 결과로 돌아가기" onClick={() => setSeed(undefined)}><ChevronLeft /></button></header>
    <p className="intro-copy">제품명·연산을 확인하고 실제 병에 적힌 도수와 용량을 검토해 주세요. 가격과 페어링은 추정해서 채우지 않습니다.</p>
    {seed.sourceLinks?.map(link => <a className="source-link" href={link.url} key={link.url} target="_blank" rel="noopener noreferrer">{link.title} 열기 ↗</a>)}
    {!!seed.sourceLinks?.length && <label className="restore-confirm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span>라벨과 비교했고 이 제품이 맞습니다</span></label>}
    <BottleEditor seed={seed} saveDisabled={!confirmed} onSave={onSave} onCancel={() => setSeed(undefined)} />
  </main>;
  const matches = matchProducts(query);
  return <main className="page scan-page">
    <header className="topbar"><div><span className="eyebrow">READ THE LABEL</span><h1>사진으로 술 찾기</h1></div><button className="icon-button" aria-label="등록 메뉴로 돌아가기" onClick={onBack}><ChevronLeft /></button></header>
    <p className="intro-copy">영문 라벨 읽기 · 사진은 기기 안에서 처리합니다. 첫 실행에는 인식 엔진 다운로드를 위한 인터넷 연결이 필요해요.</p>
    <input hidden ref={camera} type="file" aria-label="라벨 촬영 파일" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e => { void selectPhoto(e.target.files?.[0]); e.target.value = ""; }} />
    <input hidden ref={album} type="file" aria-label="라벨 사진 파일" accept="image/jpeg,image/png,image/webp" onChange={e => { void selectPhoto(e.target.files?.[0]); e.target.value = ""; }} />
    <div className="photo-actions">
      <button className="secondary-button" disabled={busy} onClick={() => camera.current?.click()}><Camera size={18} />라벨 촬영</button>
      <button className="secondary-button" disabled={busy} onClick={() => album.current?.click()}><ImagePlus size={18} />라벨 사진 선택</button>
    </div>
    {photo && <img className="scan-photo" src={photo} alt="선택한 술 라벨" />}
    <p className="backup-help">라벨을 크게, 반사광 없이 찍어 주세요. 현재 한글·중문 OCR은 지원하지 않습니다.</p>
    <button className="camera-button scan-read" disabled={!photo || busy} onClick={() => void recognize()}>영문 라벨 읽기</button>
    {busy && <button className="secondary-button scan-read" onClick={cancel}>인식 취소</button>}
    <p className="backup-message" role="status">{message}</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <form className="confirm-form scan-query" onSubmit={e => { e.preventDefault(); setQuery(text.trim()); setSearched(true); }}>
      <label>라벨 글자 확인·수정<textarea rows={4} maxLength={2000} value={text} disabled={busy} onChange={e => { setText(e.target.value); setSearched(false); }} placeholder="예: JOHNNIE WALKER BLACK LABEL 40% 700ml" /></label>
      <button className="secondary-button" disabled={busy || !text.trim()} type="submit">글자로 제품 후보 찾기</button>
    </form>
    <p className="backup-help">앱 내 공식 출처 확인 제품 {productCatalog.length}종과 글자를 대조합니다. 전체 웹 검색이나 제품 인증 결과가 아닙니다.</p>
    <details className="supported-products"><summary>현재 지원 제품 보기</summary><ul>{productCatalog.map(p => <li key={p.id}>{p.name}</li>)}</ul></details>
    {searched && <section className="scan-results"><h2>확인할 제품 후보</h2>
      {!matches.length && <p role="status">일치하는 등록 제품이 없어요. 글자를 수정하거나 직접 등록해 주세요.</p>}
      {matches.map(p => <div className="scan-candidate" key={p.id}>
        <h3>{p.name}</h3><p>{p.note}</p>
        <a className="source-link" href={p.source} target="_blank" rel="noopener noreferrer">{p.brand} 공식 정보 ↗</a>
        <button className="camera-button" onClick={() => choose(p)}>이 후보 확인 · {p.name}</button>
      </div>)}
      {!!text.trim() && <a className="source-link" href={"https://www.google.com/search?q=" + encodeURIComponent(text.trim().slice(0, 250))} target="_blank" rel="noopener noreferrer">이 글자로 웹에서 검색하기 ↗</a>}
      <button className="secondary-button scan-read" onClick={() => choose()}>직접 입력으로 진행</button>
    </section>}
  </main>;
}
