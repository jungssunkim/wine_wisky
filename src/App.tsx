import { useMemo, useState } from "react";
import {
  Camera, ChevronLeft, ChevronRight, GlassWater, History, Home,
  Search, Sparkles, UtensilsCrossed, Wine
} from "lucide-react";
import { bottles } from "./data/mockBottles";
import type { Bottle } from "./types";

type Tab = "cabinet" | "history" | "add" | "pairing";
type Screen = { type: "tab"; tab: Tab } | { type: "detail"; bottle: Bottle };

function BottleFigure({ bottle, empty = false, onClick }: {
  bottle: Bottle; empty?: boolean; onClick?: () => void;
}) {
  const classes = "bottle bottle--" + bottle.shape + " bottle--" + bottle.tone;
  return (
    <button className={"bottle-item " + (empty ? "is-empty" : "")} onClick={onClick} aria-label={bottle.name}>
      <div className={classes}>
        <div className="bottle-cap" />
        <div className="bottle-neck" />
        <div className="bottle-body">
          <div className="bottle-glass-shine" />
          <div className="bottle-label">
            <span className="label-brand">{bottle.brand.slice(0, 12)}</span>
            <strong>{bottle.shortName}</strong>
            <small>{bottle.abv}%</small>
          </div>
          {empty && <div className="empty-line" />}
        </div>
      </div>
      <span className="bottle-name">{bottle.shortName}</span>
    </button>
  );
}

function Header({ title, eyebrow, onBack }: { title: string; eyebrow?: string; onBack?: () => void }) {
  return (
    <header className="topbar">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
      </div>
      {onBack ? (
        <button className="icon-button" onClick={onBack} aria-label="뒤로"><ChevronLeft size={20} /></button>
      ) : (
        <button className="icon-button" aria-label="검색"><Search size={20} /></button>
      )}
    </header>
  );
}

function Cabinet({ onBottle }: { onBottle: (bottle: Bottle) => void }) {
  const owned = bottles.filter((b) => b.status === "owned");
  const shelves = [owned.slice(0, 3), owned.slice(3, 6)];

  return (
    <main className="page">
      <Header title="My Cabinet" eyebrow="PRIVATE COLLECTION" />
      <section className="collection-summary">
        <div><span>현재 보유</span><strong>{owned.length} bottles</strong></div>
        <div className="summary-badge"><Sparkles size={16} /> Curated by you</div>
      </section>
      <section className="cabinet-shell">
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
          <button className="text-button">전체 보기 <ChevronRight size={16} /></button>
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

function HistoryPage({ onBottle }: { onBottle: (bottle: Bottle) => void }) {
  const finished = bottles.filter((b) => b.status === "finished");
  return (
    <main className="page">
      <Header title="Empty Bottles" eyebrow="TASTED & REMEMBERED" />
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

function AddPage() {
  return (
    <main className="page">
      <Header title="Add Bottle" eyebrow="CAMERA FIRST" />
      <section className="camera-stage">
        <div className="scan-frame">
          <div className="scan-corner tl" /><div className="scan-corner tr" />
          <div className="scan-corner bl" /><div className="scan-corner br" />
          <div className="scan-placeholder">
            <Wine size={72} strokeWidth={1} />
            <p>라벨이 잘 보이도록<br />술병 전체를 맞춰주세요</p>
          </div>
          <div className="scan-line" />
        </div>
        <button className="camera-button"><Camera size={24} /><span>술병 촬영하기</span></button>
        <button className="secondary-button">사진 보관함에서 선택</button>
      </section>
      <section className="flow-card">
        <span className="eyebrow">HOW IT WORKS</span>
        <div className="flow-row"><b>1</b><span>사진에서 라벨과 제품명 인식</span></div>
        <div className="flow-row"><b>2</b><span>가장 가까운 제품 후보 확인</span></div>
        <div className="flow-row"><b>3</b><span>원산지·도수·가격·페어링 자동 입력</span></div>
      </section>
    </main>
  );
}

function PairingPage({ onBottle }: { onBottle: (bottle: Bottle) => void }) {
  const [food, setFood] = useState("삼겹살");
  const suggestions = useMemo(() => {
    const owned = bottles.filter((b) => b.status === "owned");
    const exact = owned.filter((b) => b.pairings.some((p) => p.includes(food) || food.includes(p)));
    return [...exact, ...owned.filter((b) => !exact.includes(b))].slice(0, 3);
  }, [food]);

  return (
    <main className="page">
      <Header title="Food Pairing" eyebrow="FROM YOUR CABINET" />
      <section className="pairing-hero">
        <UtensilsCrossed size={30} />
        <h2>오늘 뭐 먹어요?</h2>
        <p>내 술장 안에서 가장 잘 어울리는 한 병을 골라볼게요.</p>
        <div className="food-input-wrap">
          <input value={food} onChange={(e) => setFood(e.target.value)} placeholder="예: 삼겹살, 회, 파스타" />
          <button>추천</button>
        </div>
      </section>
      <section className="pairing-results">
        <span className="eyebrow">TOP MATCHES</span>
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
      <Header title="Bottle Detail" eyebrow={bottle.category.toUpperCase()} onBack={onBack} />
      <section className="detail-hero">
        <div className="detail-bottle-stage"><BottleFigure bottle={bottle} empty={bottle.status === "finished"} /></div>
        <div className="detail-headline">
          <span>{bottle.brand}</span>
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
          <div><span>Volume</span><strong>{bottle.volumeMl} ml</strong></div>
          <div><span>ABV</span><strong>{bottle.abv}%</strong></div>
          <div><span>Price</span><strong>₩{bottle.price.toLocaleString()}</strong></div>
          <div><span>Rating</span><strong>{bottle.rating ? "★ " + bottle.rating : "—"}</strong></div>
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
    <nav className="bottom-nav">
      <button className={active === "cabinet" ? "active" : ""} onClick={() => onChange("cabinet")}><Home size={20} /><span>Cabinet</span></button>
      <button className={active === "history" ? "active" : ""} onClick={() => onChange("history")}><History size={20} /><span>History</span></button>
      <button className="nav-add" onClick={() => onChange("add")} aria-label="술 추가"><Camera size={23} /></button>
      <button className={active === "pairing" ? "active" : ""} onClick={() => onChange("pairing")}><UtensilsCrossed size={20} /><span>Pairing</span></button>
      <button disabled><Sparkles size={20} /><span>More</span></button>
    </nav>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: "tab", tab: "cabinet" });
  const activeTab = screen.type === "tab" ? screen.tab : "cabinet";
  const openBottle = (bottle: Bottle) => setScreen({ type: "detail", bottle });

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      {screen.type === "detail" ? (
        <DetailPage bottle={screen.bottle} onBack={() => setScreen({ type: "tab", tab: "cabinet" })} />
      ) : (
        <>
          {screen.tab === "cabinet" && <Cabinet onBottle={openBottle} />}
          {screen.tab === "history" && <HistoryPage onBottle={openBottle} />}
          {screen.tab === "add" && <AddPage />}
          {screen.tab === "pairing" && <PairingPage onBottle={openBottle} />}
          <BottomNav active={activeTab} onChange={(tab) => setScreen({ type: "tab", tab })} />
        </>
      )}
    </div>
  );
}
