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
- Next: export/import for backup, then real identification with verified product sources.
