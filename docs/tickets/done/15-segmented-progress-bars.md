# 15: Segmented progress bars

**What to build:** the progress bars stop being a single accent-blue fill. Both bars in the app — the topbar bar on section and summary screens and the home bar under the level button — become segmented stacked bars: green for correct answers, amber for almost, red for incorrect, with the rest as the neutral track. The bars count **checked** questions only, so they update when the learner taps «Проверить», not while typing; the text reads «Отвечено: X из 36» with X being the checked questions that have an answer.

Design source of truth: the Итоги stat cards in `designs/00003 – Blue – Dark/summary.html` / `designs/00001 - Blue/summary.html` (`.st-ok` success, `.st-al` warn, `.st-bad` danger, `.st-emp` muted). The bars themselves have no segmented precedent in the design (`.progress-line` is a single accent fill), so this is a deliberate extension of that component, not design parity.

**Blocked by:** None.

**Status:** done

- [x] `ProgressBar.svelte` renders three segments — correct / almost / incorrect — sized as counts of the total, over the existing neutral track. Supersedes ticket 12's "correct count, live" decision: the bars are gated on `progress.checked` and update on «Проверить».
- [x] Segment colors reuse the Итоги tokens: `--success`, `--warn`, `--danger`; the unanswered remainder stays `--surface-warm`. The almost text on Итоги mixes warn with black/white for contrast, but the hue is the same.
- [x] Checking a question changes the bar; typing into an unchecked question does not. A checked question with no answer is not counted (its status is `empty`).
- [x] `summarizeProgress(sections, answers, countries, checked)` in `grading/summary.ts` computes the counts; it shares `gradeQuestion` with the Итоги screen, and `summarize` itself is unchanged for Итоги.
- [x] The topbar bar (section + summary) and the home bar both render through the same `ProgressBar` component, so "all bars" can never drift apart.
- [x] The text uses the existing `progress_answered` string; `home_progress` is removed from `content/strings.ru.toml` and `REQUIRED_UI_KEYS`.
- [x] Dead helpers `countAnswered` and `progressPercent` are removed from `src/lib/progress.ts` along with their tests; `totalQuestions` now serves `Home`, `continueSectionId` is untouched.
- [x] `bun run typecheck`, `bun test` (141 pass) and `bun run check` pass.
- [x] Visual check at 390×844 in light and dark: typing into q04 left the bar at «Отвечено: 3 из 36», tapping «Проверить» moved it to 4 with a third green segment; correct/almost/incorrect all render with the matching colors and widths; home and topbar bars agree.
