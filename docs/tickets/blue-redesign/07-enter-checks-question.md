# 07: Enter checks the question

**What to build:** pressing Enter in an answer field checks that question, so phone and desktop keyboard users do not have to reach for the check button. The shortcut belongs to the question the field is in, and typing a newline in a multi-line answer is not hijacked.

Design source of truth: `designs/00001 - Blue/` shared `keydown` handler (present in every section file).

**Blocked by:** 03 (needs the question cards on screen).

**Status:** done

- [x] Enter inside a question card (text field, gap, or select) triggers that card's «Проверить», same as tapping it.
- [x] Enter with Shift, Ctrl, Meta or Alt is ignored.
- [x] Multi-line answers keep Enter for newlines and are never checked by the shortcut.
- [x] Nothing changes when focus is outside a question card.
- [x] Checking twice in a row stays safe: feedback is not duplicated and focus moves exactly as it does today.
- [x] Keyboard and screen-reader walkthrough: answering with Enter announces the feedback as before.
- [x] `npm test`, `npm run typecheck` and `npm run check` pass.
