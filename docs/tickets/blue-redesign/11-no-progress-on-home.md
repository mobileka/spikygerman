# 11: No progress bar on home

**What to build:** the topbar progress bar (line + text) is hidden on the home screen and stays live on section and summary screens. Progress doesn't make sense until the level is selected, so the main page shows no progress bar — matching the design, whose home topbar has neither progress bar nor chip and keeps progress in the content instead. (The level chip stays on every screen per ticket 01; only the progress bar goes away on home.)

Design source of truth: `designs/00001 - Blue/index.html` (home topbar without progress) versus the section and `summary.html` topbars (with progress line and text).

**Blocked by:** 01 (needs the shell topbar), 05 (needs the live progress bar). Supersedes the ticket-05 bullet "the same state is visible on home" for the home screen.

**Status:** ready-for-agent

- [ ] On `#/` and `#level-1` the topbar shows the brand row and level chip but no progress line and no progress text.
- [ ] On section screens and summary the live bar and «Отвечено: X из 36» are unchanged and keep updating as the learner types, picks, checks or resets.
- [ ] The topbar does not jump or leave an empty gap on home when navigating between screens.
- [ ] Keyboard and screen-reader check: nothing focusable or announced is lost on home; the progress `role="status"` is simply absent there.
- [ ] `npm test`, `npm run typecheck` and `npm run check` pass.
- [ ] Visual check of home (collapsed and expanded) against the design at 390×844 and 360×800, no horizontal overflow on wider viewports.
