# 04: Summary screen

**What to build:** the summary screen matches the Blue design: four color-coded stat cards, one row per section with its number, «верно X из Y» and a percent badge that turns into a done state at 100%, and the «Над чем ещё поработать» list with color-coded issue links. All issues are rendered at once for now; the «Показать ещё» button arrives in ticket 08.

Design source of truth: `designs/00001 - Blue/summary.html` (stat strip, section rows, issue list, empty state).

**Blocked by:** 01 (needs the tokens and shell).

**Status:** in-review

- [x] The four stat cards — Верно / Почти / Ошибки / Без ответа — show the design's colors and the current counts.
- [x] Each section row shows its number circle, title, «верно X из Y» and a percent badge; at 100% the badge uses the done state.
- [x] Section rows link to their sections.
- [x] Issue links show the colored left border and status chip for almost / incorrect / no answer, plus the chevron, and use the existing Russian status labels.
- [x] Tapping an issue still deep-links to the question, focuses it and marks it checked so feedback is visible on arrival.
- [x] The no-issues and no-answers states match the design's texts.
- [x] New interface strings live in the Russian strings file and pass `npm run check`; `npm test` and `npm run typecheck` pass.
- [x] Visual check against the design at 390×844 and 360×800, no horizontal overflow on wider viewports.
