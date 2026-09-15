# 19: Component parity with the frozen screens

**What to build:** align each Svelte component's markup to the design-system class contracts already proven in `designs/themes/Arctic Blue/00002 – Dark mode/`, and delete the superseded rules from the old `app.css` body as each component is confirmed — never two sources for one rule.

**Blocked by:** 17, 18 (contracts and scoping must be in place first).

**Status:** todo

- [ ] Shell/frame: `TopBar.svelte` renders brand row (`.brand-text`, right-pinned `.theme-toggle`, chip + optional gear where designed) with the level `.lvl-progress` block inside the header on non-home screens; `TabBar.svelte` keeps the floating pill with the footer pinned to the grid's last row.
- [ ] Home: level block (`.lvl-progress` under the head, collapsed by default), `.sec-tile.is-home` tiles with `.sec-n` ring counters painted from stored results.
- [ ] Drills: hero instruction in foreground color, question (`.q-ask`/`.qn`) sizing, empty `.feedback` slots hidden, segmented header bar, `secPick` navigation, umlaut rail behavior unchanged.
- [ ] Summary: centered `.od-stat` squares, section rows with `.sec-n` rings and right-pinned percent badges, nowrap issue chips, issues list rendering.
- [ ] Settings: `.kv` one-pair-per-row layout, `.seg` equal segments, `.panel-b` rhythm, theme seg/header-toggle two-way sync, danger zone, footer/main placement with no inline overrides.
- [ ] Behavior gaps ported into Svelte state/grading with tests where they exist: per-section ring tallies, segmented counts from checked results, `role="status"` captions.
- [ ] `bun run typecheck`, `bun run test` and `bun run build` pass; browser pass per screen (light + dark, empty + answered + checked states) against the frozen `designs/` reference.
