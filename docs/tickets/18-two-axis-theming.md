# 18: Two-axis theming (design theme × color mode)

**What to build:** separate the future *design* theme axis from the existing light/dark color-mode axis, so a full re-skin composes with both modes instead of multiplying files. No switcher UI: exactly one design theme is compiled in.

**Blocked by:** 17 (the layers being scoped live in `src/styles/`).

**Status:** todo

- [ ] `<html>` carries `data-design="arctic-blue"` alongside the existing `data-theme="light|dark"` (see `src/lib/theme.svelte.ts`, which owns color mode and stays untouched in behavior).
- [ ] Token layers are scoped under `[data-design="arctic-blue"]`; component layers stay global except where a re-skin would override them, in which case they are scoped the same way. Document the rule in `src/styles/README.md` (or the existing DS README): tokens always scoped per design, components global by default.
- [ ] A future theme is defined as: one new tokens file under a new `data-design` value plus optional component overrides — no changes to markup or state. Prove it with a 5-line sketch token override in the ticket review (not shipped).
- [ ] No visual change: `bun run typecheck`, `bun run test` and `bun run build` pass; browser pass in light and dark confirms identical rendering with the new attribute present.
