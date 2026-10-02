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
