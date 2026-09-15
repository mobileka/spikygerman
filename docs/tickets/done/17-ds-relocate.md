# 17: Relocate the design system into src (no visual change)

**What to build:** move the Arctic Blue design system from `designs/themes/Arctic Blue/_design_system/` to `src/styles/` and make it the single source of truth for app styling, with zero visual change to the app.

**Blocked by:** None.

**Status:** done (2026-09-15, uncommitted — do not push per owner request)

- [x] `git add` the design system (currently untracked) and `git mv` it to `src/styles/`: `tokens/` (`tokens.css`, `legacy-bridge.css` only if still referenced, `tokens.json` kept as the documented token source) and `components/` (`components.css`, `modules.css`).
- [x] Split out design-only scaffolding (phone frame, `.od-stage`, status bar, gesture indicator, spec-demo helpers) so it does not ship: either a `designs/`-only stylesheet or deleted, with the screens updated if they reference it.
- [x] `src/app.css` keeps font-faces and global resets; everything else becomes `@import` of the moved files. No old rules are deleted yet.
- [x] The app renders byte-identical: `bun run typecheck`, `bun run test` and `bun run build` pass, plus a browser pass over home, one drill, summary and settings in light and dark against the frozen `designs/` screens.

**Implementation notes (where this ticket deviated from its letter):**

- `legacy-bridge.css` was moved but is NOT imported: nothing in `src/` uses the
  legacy-only names, and its `--accent-soft`/`--border-strong` values differ
  from `app.css`, so importing it would itself be a visual change.
- Scaffolding went to `src/styles/components/design-stage.css` (mocks-only,
  never imported by the app): `.od-stage`, phone frame/screen, status bar,
  cut-out, gesture indicator, hardware buttons, frame-scaling queries, plus
  the `.app` safe-area padding (it exists only to clear device chrome).
  All 17 frozen screens now link `../../../src/styles/*` + `design-stage.css`;
  spec sheet, probe template and DS README load order updated the same way.
- `app.css` imports only `tokens.css` + `od-layout-primitives.css` (both
  provably inert: tokens add variables `app.css` overrides or never reads;
  primitives are `@layer`ed and match no markup). `components.css` /
  `modules.css` are deliberately NOT wired in yet: a literal import shifted
  the layout (DS `.app` padding 0 → 50/29px, DS `.topbar` flex column pushing
  the header 65px → 89px, measured in the browser). Wiring those layers in is
  ticket 19's per-component convergence, which owns exactly that
  markup-vs-contract alignment. No old rules were deleted.
- Verification: typecheck 0 errors, 142/142 tests, build clean, shipped bundle
  contains zero `phone-frame`/`od-stage` selectors, and computed-style
  sentinels match the pre-change baseline exactly (`div.app` padding 0,
  `main` at y=65, body tokens) on home; drill, summary rendered in light +
  dark. No settings route exists in the app yet, so that leg of the browser
  pass is not applicable until it lands.
