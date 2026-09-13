# 03: Section screens

**What to build:** all six question screens match the Blue design: a compact header with the section picker, the task instruction, the photo/table/example blocks, the question cards with their widgets and feedback, and an in-content Назад / Дальше panel at the end (Дальше becomes Итоги on the last section). The sticky navigation row is replaced by the tab bar from ticket 01. Grading, saved answers, per-question checking and deep links keep working exactly as they do today.

Design sources of truth: `sich-vorstellen.html`, `dialoge.html`, `einkaufen.html`, `was-ist-das.html`, `preise.html`, `artikel-und-verben.html` in `designs/00001 - Blue/` (pick is the same markup everywhere; questions differ in widget type).

**Blocked by:** 01 (needs the tokens and shell).

**Status:** done

- [x] Each section screen shows an `sr-only` h1 with the section title and a «Раздел» select that navigates to the chosen section; the instruction paragraph sits below.
- [x] The picker marks the current section as selected and jumps correctly from any section.
- [x] Photo tasks (fridge, food, REWE flyer), the screen-reader price table, task-level examples and per-question examples match the design's presentation.
- [x] Question cards match the design: number before the question text, per-question Russian instruction where present, choice/gap/free-text widgets, check button, feedback block with status, model answer and explanation.
- [x] Gap inputs keep the numbered gap chip in the sentence; select gaps keep the full-form choices; alternatives grading is untouched.
- [x] The bottom panel offers Назад / Дальше in content; on the last section the forward button reads «Итоги» and goes to the summary.
- [x] The umlaut helper row keeps working from the shell (ticket 01), and no separate sticky nav row remains.
- [x] Deep links to a question still scroll to it, focus it, mark it checked and show feedback.
- [x] New interface strings live in the Russian strings file and pass `npm run check`; `npm test` and `npm run typecheck` pass.
- [x] Visual check of all six screens against the design at 390×844 and 360×800, no horizontal overflow on wider viewports.
