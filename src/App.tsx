import { BottleFigure } from "./components/BottleFigure";
import { AddPage } from "./pages/AddPage";
import { useMemo, useState } from "react";
import {
  Camera, ChevronLeft, ChevronRight, GlassWater, History, Home,
  Search, Sparkles, UtensilsCrossed, Wine
} from "lucide-react";
import { bottles as initialBottles } from "./data/mockBottles";
import type { Bottle } from "./types";

type Tab = "cabinet" | "history" | "add" | "pairing";
type Screen = { type: "tab"; tab: Tab } | { type: "detail"; bottle: Bottle; from: Tab };

export function Header({ title, eyebrow, onBack }: { title: string; eyebrow?: string; onBack?: () => void }) {
  return (
    <header className="topbar">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
      </div>
      {onBack ? (
        <button className="icon-button" onClick={onBack} aria-label="뒤로"><ChevronLeft size={20} /></button>
      ) : <Wine size={22} className="header-mark" aria-hidden="true" />}
    </header>
  );
}

function Cabinet({ onBottle, bottles }: { onBottle: (bottle: Bottle) => void; bottles: Bottle[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const owned = bottles.filter((b) => b.status === "owned");
  const filtered = owned.filter(b => (category === "all" || b.category === category) && `${b.name} ${b.country} ${b.brand}`.toLowerCase().includes(query.trim().toLowerCase()));
  const shelves = Array.from({length: Math.ceil(filtered.length / 3)}, (_, i) => filtered.slice(i * 3, i * 3 + 3));

  return (
    <main className="page">
      <Header title="나의 술장" eyebrow="PRIVATE COLLECTION" />
      <section className="collection-summary">
        <div><span>현재 보유</span><strong>{owned.length}병의 컬렉션</strong></div>
        <div className="summary-badge"><Sparkles size={16} /> 취향을 담은 선반</div>
      </section>
      <label className="cabinet-search"><Search size={18} /><input aria-label="술 검색" placeholder="술 이름, 브랜드, 원산지 검색" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <div className="filter-row" aria-label="술 종류">{[["all", "전체"], ["whisky", "위스키"], ["wine", "와인"], ["sake", "사케"], ["baijiu", "바이주"]].map(([value, label]) => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{label}</button>)}</div>
      <section className="cabinet-shell" aria-label="보유 술 선반">
        {!filtered.length && <p className="empty-state">조건에 맞는 술이 없어요.<br />다른 이름이나 종류로 찾아보세요.</p>}
        <div className="cabinet-top-glow" />
        {shelves.map((shelf, i) => (
          <div className="shelf" key={i}>
            <div className="shelf-bottles">
              {shelf.map((bottle) => (
                <BottleFigure bottle={bottle} key={bottle.id} onClick={() => onBottle(bottle)} />
              ))}
            </div>
            <div className="shelf-board" />
          </div>
        ))}
      </section>
      <section className="section-block">
        <div className="section-title-row">
          <div><span className="eyebrow">QUICK PICK</span><h2>오늘 한 잔</h2></div>
          <button className="text-button" onClick={() => onBottle(owned[0])}>자세히 보기 <ChevronRight size={16} /></button>
        </div>
        <div className="recommend-card">
          <div>
            <span className="recommend-kicker">Tonight's pick</span>
            <h3>Balvenie 12</h3>
            <p>달콤한 몰트와 은은한 오크. 천천히 마시기 좋은 밤.</p>
          </div>
          <GlassWater size={34} />
        </div>
      </section>
    </main>
  );
}

function HistoryPage({ onBottle, bottles }: { onBottle: (bottle: Bottle) => void; bottles: Bottle[] }) {
  const finished = bottles.filter((b) => b.status === "finished");
  return (
    <main className="page">
      <Header title="비워낸 기록" eyebrow="TASTED & REMEMBERED" />
      <p className="intro-copy">다 마신 술도 사라지지 않아요. 당신의 취향이 쌓인 선반입니다.</p>
      <section className="empty-grid">
        {finished.map((bottle) => (
          <div className="empty-card" key={bottle.id}>
            <BottleFigure bottle={bottle} empty onClick={() => onBottle(bottle)} />
            <div className="empty-meta">
              <strong>{bottle.name}</strong>
              <span>{bottle.finishedAt}</span>
              {bottle.rating && <span>★ {bottle.rating.toFixed(1)}</span>}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function PairingPage({ onBottle, bottles }: { onBottle: (bottle: Bottle) => void; bottles: Bottle[] }) {
  const [food, setFood] = useState("삼겹살");
  const [submitted, setSubmitted] = useState("삼겹살");
  const suggestions = useMemo(() => {
    const owned = bottles.filter((b) => b.status === "owned");
    const exact = owned.filter((b) => b.pairings.some((p) => p.includes(submitted) || submitted.includes(p)));
    return submitted ? exact.slice(0, 3) : [];
  }, [submitted, bottles]);

  return (
    <main className="page">
      <Header title="음식과 한 잔" eyebrow="FROM YOUR CABINET" />
      <section className="pairing-hero">
        <UtensilsCrossed size={30} />
        <h2>오늘 뭐 먹어요?</h2>
        <p>내 술장 안에서 가장 잘 어울리는 한 병을 골라볼게요.</p>
        <form className="food-input-wrap" onSubmit={e => { e.preventDefault(); setSubmitted(food.trim()); }}>
          <input aria-label="페어링할 음식" value={food} onChange={(e) => setFood(e.target.value)} placeholder="예: 삼겹살, 회, 파스타" />
          <button type="submit">추천</button>
        </form>
      </section>
      <section className="pairing-results">
        <span className="eyebrow">내가 가진 술에서 추천</span>
        <p className="intro-copy pairing-status" role="status">{!submitted ? "음식 이름을 입력해 주세요." : suggestions.length ? `${submitted}에 어울리는 ${suggestions.length}병 · 데모 데이터 기준` : `“${submitted}”에 맞는 보유 술이 없어요. 삼겹살, 회, 치즈로 시도해 보세요.`}</p>
        {suggestions.map((bottle, index) => (
          <button className="pairing-card" key={bottle.id} onClick={() => onBottle(bottle)}>
            <span className="rank">0{index + 1}</span>
            <div className="mini-bottle-wrap"><BottleFigure bottle={bottle} /></div>
            <div className="pairing-copy">
              <strong>{bottle.shortName}</strong>
              <span>{bottle.country} · {bottle.abv}%</span>
              <p>{bottle.note}</p>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>
    </main>
  );
}

function DetailPage({ bottle, onBack }: { bottle: Bottle; onBack: () => void }) {
  return (
    <main className="page detail-page">
      <Header title="한 병의 이야기" eyebrow={bottle.category.toUpperCase()} onBack={onBack} />
      <section className="detail-hero">
        <div className="detail-bottle-stage"><BottleFigure bottle={bottle} empty={bottle.status === "finished"} /></div>
        <div className="detail-headline">
          <span>{bottle.brand}</span>
          <p className="bottle-status">{bottle.status === "finished" ? `완병 · ${bottle.finishedAt}` : "보유 중"}</p>
          <h2>{bottle.name}</h2>
          <div className="detail-tags">
            <span>{bottle.country}</span><span>{bottle.region ?? bottle.category}</span><span>{bottle.abv}%</span>
          </div>
        </div>
      </section>
      <section className="detail-section">
        <span className="eyebrow">PROFILE</span>
        <p className="detail-note">{bottle.note}</p>
        <div className="stat-grid">
          <div><span>용량</span><strong>{bottle.volumeMl} ml</strong></div>
          <div><span>도수</span><strong>{bottle.abv}%</strong></div>
          <div><span>예시 구매 가격</span><strong>₩{bottle.price.toLocaleString()}</strong></div>
          <div><span>내 평점</span><strong>{bottle.rating ? "★ " + bottle.rating : "—"}</strong></div>
        </div>
      </section>
      <section className="detail-section">
        <span className="eyebrow">PAIRING</span>
        <div className="chip-row">{bottle.pairings.map((p) => <span className="chip" key={p}>{p}</span>)}</div>
      </section>
      <section className="detail-section source-preview">
        <span className="eyebrow">SOURCE PREVIEW</span>
        <p>실제 제품 식별 기능에서는 공식 홈페이지, 판매처, 검색 출처 링크가 여기에 표시됩니다.</p>
      </section>
    </main>
  );
}

function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      <button className={active === "cabinet" ? "active" : ""} onClick={() => onChange("cabinet")}><Home size={20} /><span>술장</span></button>
      <button className={active === "history" ? "active" : ""} onClick={() => onChange("history")}><History size={20} /><span>기록</span></button>
      <button className={"nav-add " + (active === "add" ? "active" : "")} onClick={() => onChange("add")} aria-label="술 추가"><Camera size={23} /></button>
      <button className={active === "pairing" ? "active" : ""} onClick={() => onChange("pairing")}><UtensilsCrossed size={20} /><span>페어링</span></button>
    </nav>
  );
}

export default function App() {
  const [bottles, setBottles] = useState(initialBottles);
  const [screen, setScreen] = useState<Screen>({ type: "tab", tab: "cabinet" });
  const activeTab = screen.type === "tab" ? screen.tab : screen.from;
  const openBottle = (bottle: Bottle) => setScreen({ type: "detail", bottle, from: activeTab });

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      {screen.type === "detail" ? (
        <DetailPage bottle={screen.bottle} onBack={() => setScreen({ type: "tab", tab: screen.from })} />
      ) : (
        <>
          {screen.tab === "cabinet" && <Cabinet bottles={bottles} onBottle={openBottle} />}
          {screen.tab === "history" && <HistoryPage bottles={bottles} onBottle={openBottle} />}
          {screen.tab === "add" && <AddPage onSave={bottle => { setBottles(current => [...current, bottle]); setScreen({type: "tab", tab: "cabinet"}); }} />}
          {screen.tab === "pairing" && <PairingPage bottles={bottles} onBottle={openBottle} />}
          <BottomNav active={activeTab} onChange={(tab) => setScreen({ type: "tab", tab })} />
        </>
      )}
    </div>
  );
}
