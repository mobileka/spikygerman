# 06: Smart «Продолжить»

**What to build:** the «Продолжить» tab stops being a fixed link and points at the first section that still has unchecked questions. It recomputes as the learner checks questions, so the tab always leads to the next unfinished work. When every question is checked it falls back to the first section, matching the design.

Design source of truth: `designs/00001 - Blue/index.html` (the `SECMAP` loop that rewrites `continueTab`'s href).

**Blocked by:** 01 (needs the tab bar).

**Status:** done

- [x] «Продолжить» points at the first section with at least one unchecked question.
- [x] The destination updates after a question is checked, on every screen.
- [x] A section counts as done only when all of its questions are checked (the existing checked state).
- [x] When all questions are checked, the tab falls back to the first section (design behaviour).
- [x] The destination logic is extracted into a testable helper and covered by unit tests, including the all-done fallback.
- [x] `npm test`, `npm run typecheck` and `npm run check` pass.
- [x] Keyboard and screen-reader check: the tab's purpose is clear and its link target is announced correctly when it changes.
