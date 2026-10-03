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

## Backup and restore

Open **백업·복원** next to the cabinet's local-save notice. **백업 파일 저장** downloads a versioned JSON file containing photos, product information, ratings, tasting notes and finished status. Keep this file outside the browser before clearing site data or switching devices; this is not automatic cloud sync.

Import first validates and previews a file. The default mode adds new bottle IDs and preserves current records for matching IDs. Reimporting the same backup does not duplicate bottles. Replacement restores exactly the file contents, including an empty collection, and requires explicit confirmation. The app supports up to 1,000 bottles and 10MB backup files; actual browser storage may fill sooner.

Malformed/unsupported files, invalid records, duplicate IDs and external image URLs are rejected before writes. A failed storage write leaves the original collection unchanged. If stored data is unreadable, export its exact original text or recover from a valid backup using confirmed replacement. The unreadable original is copied to `wine-wisky:recovery:v1` before recovery; if that copy or replacement fails, the original remains intact. Writes also refuse to overwrite data changed by another tab: reload before retrying.

With the dev server running, `npm run test:backup` verifies downloads, photo/journal roundtrips, merge deduplication, replace confirmation/cancel, empty restores, invalid inputs, quota failures, recovery and stale-write protection at all four mobile widths.

## English label OCR and source-backed candidates

“사진으로 술 찾기 · 영문 라벨” now reads a selected photo with real, on-device Tesseract.js OCR. The pinned browser engine (6.0.1), core (6.0.0) and English model are loaded from public CDNs when the user starts recognition. Internet access is required for those assets; photos are processed locally and are not uploaded. Recognition can fail on glare, curved bottles or ornate/small type. Cancel/error paths keep manual entry available.

This is a bounded catalogue matcher, not full-web identification or authenticity verification. The four supported products are Balvenie DoubleWood 12, Johnnie Walker Black Label, Glenfiddich 12 and Macallan Sherry Oak 12. Manufacturer pages were checked on 2026-10-03. Users review OCR text, choose a candidate, open its source, explicitly confirm identity, and review/edit ABV and volume before saving. Unread volume and price are left blank; no prices or pairings are invented. Unknown products have an external search link and manual registration fallback. Source links survive storage/backups and are cleared when product identity is changed.

References:
- https://github.com/naptha/tesseract.js/blob/v6.0.1/docs/api.md
- https://github.com/naptha/tesseract.js/blob/v6.0.1/docs/local-installation.md
- https://www.williamgrant.com/nutritional-information/?brand-nutrition=glenfiddich
- https://www.johnniewalker.com/en/our-whisky/core-range/johnnie-walker-black-label
- https://www.themacallan.com/en-sg/single-malt-scotch-whisky/sherry-oak-12-years-old

`npm run test:ocr` includes a real-engine browser smoke test on a generated English label, four-width confirmation/persistence flows, misleading-variant rejection, and isolated network-failure/cancellation tests. It does not establish accuracy on real bottle photos or physical-phone camera compatibility. Non-English OCR, unrestricted product search, cloud recognition and live prices remain future work. Older camera demo buttons remain explicitly labelled as examples.
