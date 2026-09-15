# 19: Component parity with the frozen screens

**What to build:** align each Svelte component's markup to the design-system class contracts already proven in `designs/themes/Arctic Blue/00002 – Dark mode/`, and delete the superseded rules from the old `app.css` body as each component is confirmed — never two sources for one rule.

**Blocked by:** 17, 18 (contracts and scoping must be in place first).

**Status:** done except Settings (deferred by owner — needs its own ticket)

- [x] Shell/frame: `TopBar.svelte` renders brand row (`.brand-text`, right-pinned `.theme-toggle`, chip + optional gear where designed) with the level `.lvl-progress` block inside the header on non-home screens; `TabBar.svelte` keeps the floating pill with the footer pinned to the grid's last row.
- [x] Home: level block (`.lvl-progress` under the head, collapsed by default), `.sec-tile.is-home` tiles with `.sec-n` ring counters painted from stored results.
- [x] Drills: hero instruction in foreground color, question (`.q-ask`/`.qn`) sizing, empty `.feedback` slots hidden, segmented header bar, `secPick` navigation, umlaut rail behavior unchanged.
- [x] Summary: centered `.od-stat` squares (tiles deviate — see notes), section rows with `.sec-n` rings and right-pinned percent badges, nowrap issue chips, issues list rendering.
- [ ] Settings: `.kv` one-pair-per-row layout, `.seg` equal segments, `.panel-b` rhythm, theme seg/header-toggle two-way sync, danger zone, footer/main placement with no inline overrides. **Deferred:** no `#/settings` route or gear was added; nothing settings-related was touched.
- [x] Behavior gaps ported into Svelte state/grading with tests where they exist: per-section ring tallies, segmented counts from checked results, `role="status"` captions.
- [x] `bun run typecheck`, `bun run test` and `bun run build` pass; browser pass per screen (light + dark, empty + answered + checked states) against the frozen `designs/` reference.

**Implementation notes (where this ticket deviated from its letter):**

- **Settings is explicitly out of scope for now** (owner decision): no route, no gear, no `.kv`/`.seg`/danger-zone port. It stays a follow-up ticket.
- **Choices stay native radios**, restyled by an app-level `fieldset.choice` block instead of the DS `button.choice[aria-pressed="true"]` — owner decision: radios announce «option N of M» for free on phones.
- **Summary counts are checked-gated.** `summarize()` now takes the same optional `checked` list as `summarizeProgress()`, so typed-but-unchecked answers count as «Без ответа» and the summary can never disagree with the header bar again.
- **The footer kept the pill and gained a full-bleed surface behind it** after an owner review on wide desktop windows: `.app > footer` carries `--surface` + the same hairline as the topbar, the rail's own top border is suppressed inside it, and the look is identical on every viewport (no media queries).
- **DS fixes made during the review:** `.level-chip` absorbs the free space so the chip + toggle cluster right-pins on wide viewports (the toggle used to float mid-bar), and `.od-stat` is a content-height tile instead of an `aspect-ratio: 1` square (the squares ballooned to ~146px on desktop and read as ragged).
- `app.css` now imports `components.css` + `modules.css` and every superseded rule was deleted (~1400 → ~350 lines). What remains: tokens/font-faces plus the product-shell additions (`fieldset.choice`, sr-only price table, field-line helpers, fixed `100dvh` shell where only `.screen` scrolls, one shared `--content-max` column for header/main/footer). `legacy-bridge.css` and `design-stage.css` remain unimported by the app.
