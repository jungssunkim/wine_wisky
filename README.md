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

The camera flow and pairing results use bundled demo data. Added bottles, tasting notes, ratings and finished/owned status are saved in this browser's localStorage. Data is not synced between devices; clearing browser site data removes it. Corrupt/unsupported saved data is preserved and a warning is shown. Failed writes leave the previous collection unchanged. Real photo recognition, source lookup, cloud sync and AI pairing remain future work.

## Local collection and tasting journal

Open a bottle to save a rating and tasting note. “다 마신 술로 기록” asks for confirmation, keeps the bottle in History, and removes it from owned-bottle pairing recommendations. “보유 술장으로 되돌리기” reverses that status without losing notes.

With the dev server running, `npm run test:persistence` verifies reload persistence, finish/restore, rating/note edits, pairing exclusion, empty collections, malformed saved data and storage write failures at all four mobile widths. GitHub Actions runs both mobile suites after the production build.

## Register your own bottles and photos

Use “내 술 직접 등록 · 사진 첨부” in Add Bottle. Enter a name, category, ABV and volume; brand, country, region, purchase price, description and pairing foods are optional. Unknown prices remain marked as unentered. “술 정보 수정” edits an existing bottle without changing its identity, owned/finished status, rating or tasting notes.

Photo capture uses the device file picker with a rear-camera hint; the exact picker depends on the phone/browser. JPG, PNG and WebP files up to 10MB and 50 megapixels are decoded on-device, resized to at most 800px and re-encoded to JPEG. Only the reduced image (up to 360,000 data-URL characters) is saved. Originals and metadata are not uploaded or stored. HEIC is not supported. Browser storage is limited; if saving fails, the editor retains its draft and the existing collection remains unchanged. Removing a photo restores the category silhouette; unreadable photos also fall back to it.

Real photo recognition/OCR remains a demo. Uploaded photos are not sent for identification. Manually entered pairing foods power the existing matching logic.

Run `npm run test:manual` with the dev server running to verify registration, photo processing, editing/cancel, invalid uploads, storage errors, reload persistence, history and pairing at all four mobile widths. Actions runs all three browser suites.
