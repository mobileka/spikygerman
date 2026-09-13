# 05: Live progress bar

**What to build:** the shell's topbar progress bar stops being a placeholder and follows the learner's answers on every screen. It shows how many questions have any answer and how many there are in total, and updates as the learner types, picks, or resets.

Design source of truth: `designs/00001 - Blue/index.html` (the `upd()` function that fills `progressFill` and `progressText`).

**Blocked by:** 01 (needs the shell and its initial placeholder state).

**Status:** ready-for-agent

- [ ] The topbar bar width reflects answered / total questions; the text reads «Отвечено: X из 36».
- [ ] A question counts as answered when at least one of its fields is non-empty — including selects, radios and multi-gap questions.
- [ ] The bar and text update immediately after typing or answering, and after reset they return to zero.
- [ ] The same state is visible on home, section screens and summary.
- [ ] The initial «Прогресс сохраняется на Вашем устройстве» placeholder is replaced by the live count, matching the design's behaviour.
- [ ] The answered-count and total logic is extracted into a testable helper and covered by unit tests.
- [ ] `npm test`, `npm run typecheck` and `npm run check` pass.
- [ ] Visual check at 390×844: bar matches the design; no horizontal overflow on wider viewports.
