# 12: Home progress display

**What to build:** settle whether home shows progress. Ticket 11 removed the topbar progress bar from home, so home currently shows no progress at all — but the design home shows «Отвечено: N из 36» in content under the level button (`.lvl-progress`). Either confirm the progress-free home or implement the design's in-content block. The bar stays out of the topbar on home either way.

Design source of truth: `designs/00001 - Blue/index.html` (the `.lvl-progress` block with `progressFill`/`progressText`, fed by the shared `upd()` function).

**Blocked by:** 05 (needs the answered-count helper), 11 (needs the progress-free home topbar).

**Status:** ready-for-agent

- [ ] Decision recorded here: progress-free home (close this ticket, no code) or design parity (implement the items below).
- [ ] If design parity: home renders the `.lvl-progress` block (line + «Отвечено: X из 36») under the level button on `#/` and `#level-1`, collapsed and expanded, fed by the existing `countAnswered`/`totalQuestions` helpers.
- [ ] If design parity: the topbar on home stays progress-free; section and summary screens are untouched.
- [ ] If design parity: keyboard and screen-reader check — the in-content text keeps `role="status"` like the design, and it is the only live region on home.
- [ ] If design parity: `npm test`, `npm run typecheck` and `npm run check` pass.
- [ ] If design parity: visual check of home (collapsed and expanded) against the design at 390×844 and 360×800, no horizontal overflow on wider viewports.
