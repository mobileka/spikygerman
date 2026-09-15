# 09: Single-line answer fields

**What to build:** free-text answers (sentence, yes/no, price, translate) render as single-line text inputs instead of tall resizable textareas. None of the eight design files contains a `<textarea>`; every answer field there is a single-line input or select. With no textareas left, Enter in a free-text field checks its question, same as gaps and selects.

Design sources of truth: `sich-vorstellen.html`, `einkaufen.html`, `was-ist-das.html`, `preise.html`, `artikel-und-verben.html` in `designs/00001 - Blue/` (every `Ваш ответ` field is a one-line input); the shared `keydown` handler (its `textarea` exemption becomes dead code).

**Blocked by:** 03 (needs the question cards), 07 (changes what Enter does in free-text fields).

**Status:** done

- [x] Sentence, yes/no, price and translate answers render `input[type="text"]`, ~48px tall, no resize handle.
- [x] The unused `multiline` branch is removed from `AnswerInput` (gaps already use it single-line).
- [x] Enter in a free-text field triggers that card's «Проверить», same as tapping it; Shift, Ctrl, Meta or Alt with Enter is still ignored.
- [x] No `<textarea>` is rendered anywhere in the app (grep to confirm); the `textarea` guard in the global keydown handler is removed or kept harmlessly — either way it never fires.
- [x] Checking twice in a row stays safe: feedback is not duplicated and focus moves exactly as it does today.
- [x] Keyboard and screen-reader walkthrough: answering a free-text question with Enter announces the feedback as before.
- [x] `npm test`, `npm run typecheck` and `npm run check` pass.
- [x] Visual check of all affected screens against the design at 390×844 and 360×800, no horizontal overflow on wider viewports.
