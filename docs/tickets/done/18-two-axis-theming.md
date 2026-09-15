# 18: Two-axis theming (design theme × color mode)

**What to build:** separate the future *design* theme axis from the existing light/dark color-mode axis, so a full re-skin composes with both modes instead of multiplying files. No switcher UI: exactly one design theme is compiled in.

**Blocked by:** 17 (the layers being scoped live in `src/styles/`).

**Status:** done (2026-09-15, uncommitted — do not push per owner request)

- [x] `<html>` carries `data-design="arctic-blue"` alongside the existing `data-theme="light|dark"` (see `src/lib/theme.svelte.ts`, which owns color mode and stays untouched in behavior).
- [x] Token layers are scoped under `[data-design="arctic-blue"]`; component layers stay global except where a re-skin would override them, in which case they are scoped the same way. Document the rule in `src/styles/README.md` (or the existing DS README): tokens always scoped per design, components global by default.
- [x] A future theme is defined as: one new tokens file under a new `data-design` value plus optional component overrides — no changes to markup or state. Prove it with a 5-line sketch token override in the ticket review (not shipped).
- [x] No visual change: `bun run typecheck`, `bun run test` and `bun run build` pass; browser pass in light and dark confirms identical rendering with the new attribute present.

**Implementation notes:**

- Scoped `tokens/tokens.css` (`:root` → `:root[data-design="arctic-blue"]`,
  dark → `:root[data-design="arctic-blue"][data-theme="dark"]`) and the same
  two selectors in `tokens/legacy-bridge.css`. Primitives, components,
  modules and stage untouched — including the two component dark rules
  (theme-toggle icon swap, large-picker arrow), deliberately left global.
- `data-design="arctic-blue"` added to the app `index.html` (static; boot
  script and `theme.svelte.ts` untouched), all 17 frozen screens, the spec
  sheet and the probe template. `app.css` keeps its global `:root` blocks as
  fallback — ticket 19 owns that file.
- Safety was checked, not assumed: all 36 textual diffs between the DS and
  app `:root` blocks compute identically (e.g. `0.72` vs `0.720`,
  `calc(12px * 1)` vs `12px`), so the specificity flip changes nothing.
- Verification: typecheck 0 errors, 142/142 tests, build clean; browser pass
  — light home sentinels match the ticket-17 baseline exactly (`main` y=65),
  dark body/qcard/summary values identical, drill + summary render in both
  modes, attribute confirmed shipped in `dist/index.html`.
- Future-theme sketch (not shipped):
  `:root[data-design="forest"] { --accent: #2f7d4f; --bg: #f2f6f1; }` plus
  the matching dark block — one tokens file, no markup or state changes.
- Follow-up fix: the mock hrefs first landed as `../../../src/styles/` (three
  levels — resolves to `designs/src/styles/`, 404). Corrected to
  `../../../../src/styles/` in all 17 screens; verified styled via local http.
