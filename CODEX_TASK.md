# Codex Cloud — Next Task

Read `AGENTS.md` and `DESIGN.md` before changing code.

## Goal
Polish and validate the first mobile UI prototype for Wine & Whisky Cabinet.

## Required work
1. Run `npm install`.
2. Run `npm run build` and keep the build green.
3. Preview at 360px, 390px, 412px, and 430px widths.
4. Improve visual polish while preserving the real dark-wood liquor cabinet concept.
5. Verify these flows:
   - Cabinet
   - Empty Bottles / History
   - Bottle Detail
   - Add Bottle camera mock
   - Food Pairing mock
6. Fix overflow, clipped text, touch-target, and bottom-navigation issues.
7. Keep bottle silhouettes as fallbacks. Do not require external images.
8. Do not add backend, auth, database, or paid APIs yet.
9. Commit all fixes to the current branch.

## Product constraints
- The bottle should visually dominate over generic cards.
- Cabinet must feel like a collection display, not an admin dashboard.
- Finished bottles should feel like empty-memory/archive bottles, not deleted items.
- Camera registration remains the primary future feature.
- Pairing recommendations default to bottles already owned by the user.

## Finish criteria
- `npm run build` passes.
- Main flows are usable on a phone.
- No obvious horizontal scrolling at 360px.
- Summarize changes and remaining UX issues.

## Follow-up: local collection (2026-10-02)
- Browser-local persistence for added bottles, ratings and tasting notes.
- Confirm finished status, retain empty bottles in History, and allow restoring owned status.
- Keep pairing limited to owned bottles and support an empty collection.
- Preserve unreadable stored data; report storage failures without false success.
- Validate production build and both four-width mobile browser suites in Actions.
- Real photo recognition and cloud sync remain future work.

## Follow-up: manual bottles and local photos
- Register actual bottles with their category, product information and pairing foods.
- Attach a camera/gallery photo; resize on-device and retain silhouette fallbacks.
- Edit details and remove/replace photos without losing the bottle's journal or history.
- Accept optional purchase prices without treating unknown prices as zero-cost purchases.
- Preserve existing v1 saved collections and explicitly label manual vs demo information.
- Validate build and mobile, persistence, and manual/photo browser suites in Actions.
- Backup/restore is implemented below. Real identification with verified product sources remains a future step.

## Follow-up: portable backups
- Export photos, bottle data and journals in a versioned JSON backup.
- Preview validated imports; default to merging new IDs while preserving existing records.
- Require explicit confirmation for replacement, including empty backups.
- Keep previous data intact on parse, quota and stale-tab failures.
- Support recovery from unreadable storage while preserving its original text.
- Validate build and all four mobile browser suites in Actions.

## Follow-up: actual English OCR
- Load a pinned browser OCR engine on demand; keep photos on-device.
- Match against four explicitly supported, manufacturer-sourced products.
- Require text review, source access, candidate confirmation and ABV/volume review.
- Keep unknown product/manual, cancel and network-error paths usable.
- Persist/backup safe HTTPS source links; discard stale attribution on identity edits.
- Validate all earlier suites plus real-engine OCR and candidate flows.
- Do not describe this as universal bottle identification; real-world photo accuracy remains unmeasured.

## Follow-up: owned-food pairing
- Extract the pairing screen and food matching into dedicated modules.
- Match complete normalized food names and a small explicit Korean/English alias list.
- Show selectable foods from owned bottles and explain which saved food matched.
- Show all matches; never include finished bottles or invent pairing recommendations.
- Cover aliases, partial-name rejection, empty states and mobile detail navigation in CI.

## Follow-up: everyday collection management
- Confirm deletion of incorrectly registered bottles; retain records on failed or stale writes.
- Keep completion/archive separate from permanent deletion.
- Add optional purchase date/place, age and vintage to editing, detail, local persistence and backups.
- Validate metadata while retaining compatibility with existing v1 collections.
- Add stable name/rating/price sorting (unknown values last) and History search including tasting notes.
- Verify mobile flows and all previous suites in Actions before main integration.

## Follow-up: web deployment
- Publish only verified main builds to GitHub Pages with a separate least-privilege deployment job.
- Smoke-test production assets under the repository URL path at four mobile widths.
- Preserve downloadable mobile screenshots in Actions.
- Document one-time Pages activation, reruns, local-data transfer and final phone review.
- Verify deployment status before presenting the expected address as a working link.

## Review fixes
- Keep unknown OCR bottle names nonempty; normalize legacy empty short names and validate writes using backup-compatible bottle rules.
- Guard unsaved forms on tab/back/cancel and browser unload; save the current journal atomically when finishing/restoring a bottle.
- Preserve Cabinet/History search, filter, sort and Pairing input/results during in-app navigation.
- Own the native OCR worker before initialization; terminate at cancellation, timeout, success and any initialization failure.
- Verify regressions at four widths, all worker lifecycle stages, and the real pinned OCR engine.
