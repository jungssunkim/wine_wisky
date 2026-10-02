# wine_wisky 제품 설계서

## 1. 프로젝트 한 줄 정의

**내가 가진 술을 실제 술장처럼 진열하고, 마신 술은 빈 병으로 기록하며, 술병 사진 한 장으로 정보를 찾아 채워주는 개인 술 보관함 앱.**

핵심은 단순한 술 목록이 아니라 **"디지털 술장"의 감성 + 사진 기반 자동 등록 + 보유 술 기반 음식 페어링 추천**이다.

---

## 2. 제품 목표

### 핵심 목표
1. 앱을 열었을 때 진짜 술장을 보는 느낌이 난다.
2. 보유 중인 술과 다 마신 술을 시각적으로 구분한다.
3. 술병 사진을 찍으면 이름을 식별하고 관련 정보를 자동으로 채운다.
4. 원산지, 가격, 도수, 종류, 페어링 등 정보를 보기 좋게 정리한다.
5. 음식명을 입력하면 현재 내가 가진 술 중 어울리는 술을 추천한다.

### MVP에서 가장 중요한 우선순위
1. **예쁜 술장 UI**
2. **보유 술 / 마신 술 구분**
3. **술 상세 화면**
4. **사진 등록 UI**
5. 이후 실제 이미지 인식/검색 연동

---

## 3. 개발 전략

### Phase 0 — UI 시범작
먼저 기능 연동 없이 UI/UX를 만든다.

- 모바일 우선 Responsive Web
- PWA 확장 가능 구조
- Mock Data 사용
- 카메라/검색/API는 동작하는 척하는 Demo Flow로 구현
- 실제 사용하면서 UI 방향을 먼저 확정

추천 기술 스택:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- Local mock JSON

이유:
- Codex Cloud에서 빠르게 실행 가능
- 모바일 브라우저에서 바로 확인 가능
- 초기 UI 반복 수정이 빠름
- 이후 API 서버 또는 Android 앱으로 확장하기 쉬움

### Phase 1 — 개인 술장 MVP
- 술 등록/수정/삭제
- 보유 / 완병 상태
- 검색/필터
- 로컬 저장 또는 간단한 DB
- 직접 사진 업로드

### Phase 2 — 사진 기반 자동 등록
- 술병 촬영
- 이미지/OCR 분석
- 제품 후보 검색
- 후보 중 사용자 확인
- 자동 정보 입력
- 참고 링크 제공

### Phase 3 — 스마트 기능
- 음식 → 보유 술 페어링 추천
- 취향 기반 추천
- 구매 가격/평균 가격 비교
- 테이스팅 기록
- 소비 통계

---

## 4. 디자인 컨셉

### 키워드

**Dark / Premium / Warm / Glass / Wood / Bottle-focused**

앱 자체가 일반적인 카드 목록처럼 보이면 안 된다.

첫 화면은 다음 느낌을 목표로 한다.

> 어두운 원목 술장 안에 실제 술병들이 놓여 있고, 사용자가 자신의 컬렉션을 훑어보는 느낌.

### 기본 컬러 방향

- Background: 거의 검정에 가까운 charcoal
- Cabinet: dark walnut / brown
- Accent: amber / gold
- Text: ivory / warm white
- Glass highlight: 약한 반투명 흰색

정확한 컬러값은 UI 시범작을 보고 조정한다.

### 술병 표현

가능하면 일반 카드보다 **병 자체가 주인공**이 되도록 한다.

각 술:

- 실제 촬영 이미지가 있으면 투명 배경 느낌으로 병을 크게 표시
- 이미지가 없으면 카테고리별 Bottle Silhouette 사용
- 라벨 아래에 이름을 짧게 표시
- 선택하면 상세 화면으로 확대

카테고리별 기본 병 모양:

- Whisky
- Wine
- Sake
- Beer
- Cognac / Brandy
- Gin
- Rum
- Tequila
- Baijiu
- Other

---

## 5. 주요 화면

## 5.1 Home — My Cabinet

앱의 핵심 화면.

상단:

- "My Cabinet"
- 보유 병 수
- 검색
- 필터
- + Add Bottle

중앙:

실제 술장처럼 2~4개의 선반을 보여준다.

예:

```
┌─────────────────────────────┐
│          MY CABINET         │
│                             │
│ 🥃   🍷    🥃   🍶          │
│ ──────────────────────────  │
│ 🍾   🥃    🍷   🍶          │
│ ──────────────────────────  │
│                             │
└─────────────────────────────┘
```

병을 탭하면 Bottle Detail.

### 보기 모드

상단 토글:

- Cabinet
- List

Cabinet은 감성 중심.
List는 관리/검색 중심.

---

## 5.2 Finished — Empty Bottles

이미 마신 술 기록.

단순히 삭제하지 않는다.

**빈 병 컬렉션**으로 남긴다.

표현:

- 원래 병 사진
- 채도 낮춤
- 투명도 감소
- 빈 병처럼 보이는 효과
- "Finished" 작은 표시
- 마신 날짜 표시 가능

예:

```
EMPTY BOTTLES

[empty bottle] [empty bottle]
Balvenie 12    Dassai 39
2026.08        2026.09
```

이 화면은 개인 음주 히스토리이자 컬렉션 아카이브 역할을 한다.

---

## 5.3 Add Bottle — Camera First

가장 중요한 기능.

Add 버튼을 누르면 첫 선택:

### 📷 Scan Bottle
술병 사진으로 자동 등록

### ✏️ Add Manually
직접 입력

Scan Bottle Flow:

```
Camera
 ↓
Bottle photo
 ↓
Analyzing...
 ↓
후보 1~3개 표시
 ↓
사용자가 제품 선택
 ↓
자동으로 정보 채움
 ↓
확인 / 수정
 ↓
My Cabinet 저장
```

중요:

AI가 찾은 결과를 바로 저장하지 않는다.

**반드시 사용자에게 후보와 출처를 보여주고 확인 후 저장한다.**

---

## 5.4 Bottle Detail

술병 이미지를 크게 보여준다.

### 기본 정보

- Product Name
- Category
- Brand / Producer
- Country
- Region
- ABV
- Volume
- Vintage / Age
- Purchase Price
- Purchase Date
- Purchase Place

### 설명

- 술 특징
- 향
- 맛
- 피니시
- 제조 방식/숙성 정보

### Pairing

추천 음식 예:

- Steak
- Cheese
- Sushi
- Chocolate

### My Notes

- 별점
- 내 테이스팅 노트
- 다시 살 의향
- 마신 날짜

### Sources

정보가 자동 검색된 경우:

- 공식 홈페이지
- 제조사
- 판매처
- 참고 검색 결과

링크를 열어 원문 확인 가능하게 한다.

---

## 5.5 Pairing — What Should I Drink?

음식 입력:

```
오늘 먹을 음식은?

[ 삼겹살                          ]
```

결과:

```
내 술장 추천

1. 화요 41
   매콤하고 기름진 음식과 잘 어울림

2. Johnnie Walker Black
   구운 고기 풍미와 잘 맞음

3. Asahi Super Dry
   부담 없이 곁들이기 좋음
```

중요한 원칙:

**인터넷 전체에서 술을 추천하는 것이 아니라, 기본 결과는 "현재 내가 가진 술" 안에서 추천한다.**

추후 옵션:

- My Cabinet
- 전체 제품

---

## 6. 네비게이션 구조

모바일 Bottom Navigation:

```
Cabinet     History      +      Pairing      Profile
  🥃           ◇         📷        🍽          ⚙
```

추천 탭:

### Cabinet
현재 보유

### History
다 마신 술

### 중앙 Camera/Add
가장 중요한 행동이므로 강조

### Pairing
음식 기반 추천

### Profile / Settings
설정/통계

---

## 7. 데이터 모델

초기 Bottle 모델:

```ts
type BottleStatus = "owned" | "finished" | "wishlist";

interface Bottle {
  id: string;

  name: string;
  brand?: string;

  category:
    | "whisky"
    | "wine"
    | "sake"
    | "beer"
    | "brandy"
    | "gin"
    | "rum"
    | "tequila"
    | "baijiu"
    | "other";

  country?: string;
  region?: string;

  abv?: number;
  volumeMl?: number;

  vintage?: number;
  ageYears?: number;

  bottleImageUrl?: string;

  purchasePrice?: number;
  purchaseCurrency?: string;
  purchaseDate?: string;
  purchasePlace?: string;

  description?: string;

  aroma?: string[];
  taste?: string[];
  finish?: string[];

  pairings?: string[];

  rating?: number;
  tastingNote?: string;
  wouldBuyAgain?: boolean;

  status: BottleStatus;

  openedAt?: string;
  finishedAt?: string;

  sourceLinks?: SourceLink[];

  createdAt: string;
  updatedAt: string;
}

interface SourceLink {
  title: string;
  url: string;
  sourceType:
    | "official"
    | "shop"
    | "review"
    | "search";
}
```

사진 자동 인식 관련 메타데이터는 별도 구조로 둔다.

```ts
interface BottleIdentification {
  uploadedImageUrl: string;

  detectedText?: string[];

  candidates: ProductCandidate[];

  selectedCandidateId?: string;

  confidence?: number;
}
```

---

## 8. 사진 검색 기능 설계

사진 기반 등록은 다음 세 단계를 분리한다.

### 1. Image Recognition

사진에서:

- 라벨 문자 OCR
- 브랜드명
- 제품명
- 숫자
- 연산/빈티지
- ABV

등을 추출한다.

### 2. Product Search

추출 키워드로 웹/제품 데이터 검색.

예:

```
"Ballantine's 30 Year Old 40%"
```

후보 결과를 만든다.

### 3. Information Enrichment

선택한 제품에 대해:

- 공식 제품명
- 제조사
- 국가/지역
- 카테고리
- 도수
- 용량
- 숙성 연수
- 제품 설명
- 일반적인 음식 페어링
- 가격 참고 정보
- Source URL

을 채운다.

### 가격 처리

가격은 절대 하나의 "정답 가격"처럼 저장하지 않는다.

구분:

- 내가 산 가격
- 현재 검색 가격
- 국가/판매처
- 검색 날짜

향후 PriceObservation 형태로 별도 관리 가능.

---

## 9. 검색 신뢰도 UX

자동 검색에서 잘못된 제품이 들어가는 것을 막기 위해:

```
사진 분석 결과

87%  Balvenie DoubleWood 12
72%  Balvenie Caribbean Cask 14
45%  Balvenie 17
```

후보 이미지 + 이름 + 도수 등을 보여준다.

사용자가 선택하면 상세 정보를 미리 보여주고:

**[이 제품이 맞아요]**

버튼으로 확정한다.

---

## 10. 첫 UI 시범작 범위

이번 첫 작업에서는 실제 서버/AI를 붙이지 않는다.

### 구현할 화면

1. Splash
2. Cabinet
3. Empty Bottles
4. Bottle Detail
5. Add Bottle / Camera Mock
6. Pairing Mock
7. Bottom Navigation

### Mock Bottle

최소 8~12개 데이터를 넣는다.

종류를 다양하게 구성:

- Scotch Whisky
- Bourbon
- Red Wine
- White Wine
- Sake
- Beer
- Baijiu
- Cognac

사진이 아직 없다면 병 실루엣 또는 임시 이미지 사용.

### 첫 Demo에서 반드시 확인할 것

- 술장이 실제로 예쁜가?
- 병이 카드보다 먼저 눈에 들어오는가?
- 빈 병 목록이 재미있는가?
- 등록 버튼이 명확한가?
- 한 손 모바일 사용이 편한가?

---

## 11. 폴더 구조 제안

```
wine_wisky/
├─ src/
│  ├─ app/
│  ├─ components/
│  │  ├─ cabinet/
│  │  ├─ bottle/
│  │  ├─ navigation/
│  │  └─ common/
│  │
│  ├─ pages/
│  │  ├─ CabinetPage.tsx
│  │  ├─ HistoryPage.tsx
│  │  ├─ BottleDetailPage.tsx
│  │  ├─ AddBottlePage.tsx
│  │  └─ PairingPage.tsx
│  │
│  ├─ data/
│  │  └─ mockBottles.ts
│  │
│  ├─ models/
│  │  └─ bottle.ts
│  │
│  └─ assets/
│
├─ public/
├─ DESIGN.md
├─ README.md
└─ package.json
```

---

## 12. Codex 첫 작업 지시

다음 작업은 아래 범위만 한다.

### Task 01 — UI Prototype

목표:

**"실제로 술장을 열어보는 느낌의 모바일 UI Prototype"**

Codex 구현 요구사항:

1. React + TypeScript + Vite 프로젝트 생성
2. 모바일 우선 Responsive UI
3. Dark premium liquor cabinet 디자인
4. Cabinet 화면 구현
5. Mock Bottle 8~12개 생성
6. 병을 선반 위에 실제 진열된 것처럼 표현
7. Bottle Detail 화면
8. Finished Bottle 화면
9. Add Bottle Camera mock 화면
10. Pairing mock 화면
11. Bottom navigation
12. 실제 API/로그인/DB는 구현하지 않음

### 구현 원칙

- 기능보다 디자인 완성도 우선
- 일반적인 admin dashboard 스타일 금지
- 과도한 카드 UI 금지
- 병 이미지/실루엣을 크게 사용
- 모바일 360~430px 폭을 가장 먼저 고려
- 터치 영역 최소 44px
- 애니메이션은 부드럽고 절제되게 사용
- UI 문자열은 처음에는 한국어 중심
- 추후 다국어 적용 가능 구조 유지

---

## 13. MVP 이후 확장 후보

- 카메라 실시간 OCR
- Barcode Scan
- AI Bottle Recognition
- 실제 Web Search
- 사용자 계정
- Cloud Sync
- 술 구매 Wishlist
- 보유 수량
- 여러 병 보유
- 개봉 후 남은 양
- 친구에게 추천/공유
- 술장 통계
- 총 구매금액
- 카테고리 분포
- 국가별 컬렉션
- 취향 분석
- "이 음식에 뭘 마실까?"
- "오늘 기분에 뭘 마실까?"
- Android Native App

---

## 14. 현재 우선순위

현재 단계에서는 아래 순서로 진행한다.

**1. UI Prototype → 2. 실제 사용감 확인 → 3. 데이터 저장 → 4. 사진 자동 인식 → 5. 페어링 AI**

사진 인식이 최종적으로 가장 중요한 기능이지만, 먼저 **사용자가 계속 열어보고 싶은 술장 UI**를 만드는 것이 1차 목표다.
