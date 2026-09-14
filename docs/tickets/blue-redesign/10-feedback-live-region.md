# 10: Feedback live region

**What to build:** the feedback block carries `role="status"` so screen readers announce the result when a question is checked. The design's `paint()` renders `<div class="feedback" ... role="status">`; the app's `Feedback` root has no role and relies only on moving focus to the anchor wrapper.

Design source of truth: the shared `paint()` function in `designs/00001 - Blue/` section files (feedback markup with `role="status"`).

**Blocked by:** 03 (needs the question cards and their feedback).

**Status:** in-review

- [x] The `Feedback` root element has `role="status"`.
- [x] The existing focus move to the feedback anchor is unchanged (no double announcement: one announcement per check, verified with a screen reader or by inspecting that only one live region announces).
- [x] Checking twice in a row stays safe: feedback is not duplicated and focus moves exactly as it does today.
- [x] Keyboard and screen-reader walkthrough on a section screen: checking with the button and with Enter both announce the feedback exactly once.
- [x] `npm test`, `npm run typecheck` and `npm run check` pass.
