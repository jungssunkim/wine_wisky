import { ChevronRight, UtensilsCrossed } from "lucide-react";
import { Header } from "../App";
import { BottleFigure } from "../components/BottleFigure";
import { availableFoods, findPairings, foodKey } from "../lib/pairing";
import type { Bottle } from "../types";

type PairingView = { food: string; submitted: string };
export function PairingPage({ onBottle, bottles, view, onView }: { onBottle: (bottle: Bottle) => void; bottles: Bottle[]; view: PairingView; onView: (view: PairingView) => void }) {
  const { food, submitted } = view;
  const setFood = (food: string) => onView({ ...view, food });
  const setSubmitted = (submitted: string) => onView({ ...view, submitted });
  const suggestions = findPairings(bottles, submitted);
  const foods = availableFoods(bottles);
  const ownedCount = bottles.filter(b => b.status === "owned").length;

  return (
    <main className="page">
      <Header title="음식과 한 잔" eyebrow="FROM YOUR CABINET" />
      <section className="pairing-hero">
        <UtensilsCrossed size={30} />
        <h2>오늘 뭐 먹어요?</h2>
        <p>내가 등록한 페어링 음식으로 보유 중인 술을 찾아보세요.</p>
        <form className="food-input-wrap" onSubmit={e => { e.preventDefault(); setSubmitted(food.trim()); }}>
          <input maxLength={100} aria-label="페어링할 음식" value={food} onChange={(e) => setFood(e.target.value)} placeholder="예: 삼겹살, 회, 파스타" />
          <button type="submit">추천</button>
        </form>
      </section>
      {foods.length > 0 && <section className="pairing-foods" aria-label="등록된 페어링 음식">
        <p>술장에 등록된 음식</p>
        <div className="chip-row">{foods.map(item => <button key={foodKey(item)} className="food-chip" aria-pressed={foodKey(submitted) === foodKey(item)} onClick={() => { onView({ food: item, submitted: item }); }}>{item}</button>)}</div>
      </section>}
      <section className="pairing-results">
        <span className="eyebrow">내가 가진 술에서 추천</span>
        <p className="intro-copy pairing-status" role="status">{!ownedCount ? "보유 중인 술이 없어요. 술을 등록하면 여기에서 찾을 수 있어요." : !submitted ? "음식 이름을 입력해 주세요." : suggestions.length ? `${submitted}에 어울리는 ${suggestions.length}병 · 등록한 페어링 음식 기준` : !foods.length ? "등록된 페어링 음식이 없어요. 술 상세의 정보 수정에서 음식을 추가해 주세요." : `“${submitted}”에 맞는 보유 술이 없어요. 위의 등록된 음식을 선택하거나 술 정보에 음식을 추가해 주세요.`}</p>
        <p className="pairing-help">등록된 음식 이름과 일부 한영 표기를 비교합니다. AI 추천이나 맛의 궁합 평가가 아닙니다.</p>
        {suggestions.map(({ bottle, matchedFood }, index) => (
          <button className="pairing-card" key={bottle.id} onClick={() => onBottle(bottle)}>
            <span className="rank">{String(index + 1).padStart(2, "0")}</span>
            <div className="mini-bottle-wrap"><BottleFigure bottle={bottle} /></div>
            <div className="pairing-copy">
              <strong>{bottle.shortName}</strong>
              <span>{bottle.country} · {bottle.abv}%</span>
              <p>등록한 음식: {matchedFood}</p>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>
    </main>
  );
}

