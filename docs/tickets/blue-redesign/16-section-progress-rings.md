# 16: Section progress rings on home

**What to build:** in the home level panel, each section tile gets a ring (donut) progress indicator around its number badge — 01, 02, … The ring shows that section's checked answers in the same status colors as the bars and the Итоги stat cards: green for correct, amber for almost, red for incorrect, with the rest as the neutral track. Together with ticket 15 this makes the home screen show progress at both levels: the level bar under the button and a ring per section.

Design source of truth: none in the design — the export's `.sec-n` is a static tinted pill with no progress. This is a deliberate extension of the ticket-15 bars; the colors come from the Итоги stat cards (`.st-ok` / `.st-al` / `.st-bad`). Ring geometry (viewBox 56, r 24, stroke 3.5) leaves the existing 44×44 badge as the centre, so the design's tile layout is unchanged.

**Blocked by:** 15 (shares `summarizeProgress` and the status colors).

**Status:** done

- [x] `ProgressRing.svelte` draws an SVG ring with a track plus correct / almost / incorrect arcs, sized by each section's checked counts over that section's total; a section with nothing checked shows only the track.
- [x] `summarizeProgress` now returns a `ProgressSummary`: the level totals as before plus a `sections` array aligned with `content.sections`, so the tile counts and the level bar always agree.
- [x] `Home.svelte` renders the ring inside each tile's `.sec-n` badge; the number stays centred and the ring sits just outside the badge (badge is `position: relative`, ring `inset: -6px`).
- [x] Ring colors reuse `--success`, `--warn`, `--danger` with the `--surface-warm` track; `ProgressBar` still receives the base `ProgressCounts`, so nothing about the bars changed.
- [x] The ring is decorative (`aria-hidden`); the tile's accessible name is unchanged. Textual progress stays on the summary screen.
- [x] Tests: `summarizeProgress` asserts per-section breakdowns (unit fixtures and the real test's six sections); `bun run typecheck`, `bun test` (142 pass) and `bun run check` pass.
- [x] Visual check at 390×844: with q01 correct, q02 almost and q03 incorrect checked, the `01` tile shows two-fifths of the ring coloured (one green, one amber, one red) starting at 12 o'clock; unchecked sections show only the track; the user reviewed it live and approved.
