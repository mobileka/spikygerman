# 02: Home screen

**What to build:** the home screen matches the Blue design: a «Выберите уровень» hero, one collapsible level entry listing the real counts, and a two-column grid of numbered section tiles. The accordion works (keyboard and screen reader included); the current flat list with per-section progress and badges goes away, because overall progress now lives in the topbar.

Design source of truth: `designs/00001 - Blue/index.html` (markup, `lvl-*` styles, accordion script, `#level-1` hash handling).

**Blocked by:** 01 (needs the tokens and shell).

**Status:** done

- [x] Home shows the hero «Выберите уровень».
- [x] The level button reads «Уровень 1 · 6 разделов · 36 вопросов», with counts derived from the content, not hardcoded.
- [x] The button toggles the section panel: `aria-expanded` flips, the chevron rotates, the panel is hidden when collapsed, and opening the URL with `#level-1` starts expanded.
- [x] The panel is a two-column grid of tiles numbered 01–06 with the section titles; each tile navigates to its section.
- [x] Tiles have the design's hover state (lift + accent border) and visible keyboard focus.
- [x] The reset button sits below the grid and keeps its existing confirmation.
- [x] Per-section progress and the «Проверено» badge no longer appear on home (per design).
- [x] The extension point for level 2+ is left in place with a comment.
- [x] New interface strings live in the Russian strings file and pass `npm run check`; `npm test` and `npm run typecheck` pass.
- [x] Visual check against the design at 390×844 and 360×800, and no horizontal overflow on wider viewports.
