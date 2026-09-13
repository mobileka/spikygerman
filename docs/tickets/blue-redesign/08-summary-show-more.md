# 08: Summary «Показать ещё 3»

**What to build:** the «Над чем ещё поработать» list stops dumping every issue at once. It reveals three at a time behind a button, so a long list stays short and the button disappears when there is nothing left to show.

Design source of truth: `designs/00001 - Blue/summary.html` (the `paintIssues` function and the `moreIssues` button).

**Blocked by:** 04 (needs the summary issue list).

**Status:** ready-for-agent

- [ ] Three issues are visible when the list loads.
- [ ] The button reads «Показать ещё N» with the correct remaining count and reveals the next three on tap/click/Enter.
- [ ] The button disappears when all issues are shown.
- [ ] The no-issues state stays unchanged.
- [ ] Deep links from newly revealed issues still focus and check their question.
- [ ] The button is a real button, reachable by keyboard, and screen readers announce the newly revealed items in order.
- [ ] New interface strings live in the Russian strings file and pass `npm run check`; `npm test` and `npm run typecheck` pass.
- [ ] Visual check against the design at 390×844 and 360×800.
