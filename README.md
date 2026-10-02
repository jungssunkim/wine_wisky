# Wine & Whisky Cabinet

개인 술 컬렉션을 실제 술장처럼 보여주는 모바일 우선 UI 프로토타입입니다.

## 현재 목표

첫 버전은 서버/로그인 없이 UI와 사용 흐름을 검증합니다.

- 보유 술: 진열된 병처럼 표시
- 마신 술: 빈 병 아카이브
- 술 상세 정보
- 카메라 기반 등록 Mock
- 음식 입력 → 보유 술 페어링 추천 Mock

전체 제품 방향은 [DESIGN.md](./DESIGN.md)를 참고하세요.

## 실행

```bash
npm install
npm run dev
```

## 기술 스택

- React
- TypeScript
- Vite
- CSS

## 우선순위

1. 술장 UI 완성도
2. 모바일 사용성
3. 보유/완병 상태 구분
4. 사진 등록 UX
5. 이후 실제 검색/AI/DB 연동

## Mobile prototype validation

- Run `npm install`, then `npm run dev -- --host 0.0.0.0`.
- In another terminal, run `npx playwright install chromium` and `npm run test:mobile`.
- The browser check covers 360, 390, 412 and 430px: all five screens, search/category filtering, detail return navigation, empty pairing input, camera candidate confirmation, and adding a seventh bottle on a new shelf. It also checks horizontal overflow, nested buttons, runtime errors and minimum button dimensions.
- `npm run build` validates TypeScript and production assets.

The camera flow and pairing results use bundled demo data. Added bottles are held in memory and reset on reload. Real photo recognition, source lookup, persistence and AI pairing remain future work.
