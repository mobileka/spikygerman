# 12: Home level progress and header chip

**What to build:** two home-screen fixes that supersede earlier calls and match the design. The topbar level chip disappears on home — the level picker is where you choose a level, the chip belongs inside a level. And home gets the design's in-content progress block under the «Уровень 1 · …» button, so a learner can see the level's progress without opening a section.

Design source of truth: `designs/00003 – Blue – Dark/index.html` (the `.lvl-progress` block with `.progress-line`/`.progress-text` right under the level button, outside the collapsible panel; the home topbar has no `.level-chip`) and the section/summary files plus `designs/00001 - Blue/design-spec.md` (the chip belongs to `sich-vorstellen.html`, `dialoge.html`, `einkaufen.html`, `was-ist-das.html`, `preise.html`, `artikel-und-verben.html`, `summary.html` — not home).

**Blocked by:** None.

**Status:** done

- [x] The topbar shows the level chip on section and summary screens only; on home it is gone. Supersedes the ticket-11 bullet "the level chip stays on every screen per ticket 01".
- [x] Home renders the `.lvl-progress` block between the level button and the collapsible panel, visible collapsed and expanded; `.lvl-progress { margin-top: 12px }` added to `app.css`.
- [x] The block's bar and text are the shared `ProgressBar` component and the `progress_answered` string; the counting rules and segment colors are ticket 15 (checked questions only, green/amber/red).
- [x] The home progress text is `role="status"` and the only live region on home (the topbar progress line stays hidden there, as in ticket 11).
- [x] `bun run typecheck`, `bun test` (141 pass) and `bun run check` pass.
- [x] Visual check at 390×844 in light and dark: chip absent on home and present in a section; the progress block stays visible collapsed and expanded; no horizontal overflow.
