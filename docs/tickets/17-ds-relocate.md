# 17: Relocate the design system into src (no visual change)

**What to build:** move the Arctic Blue design system from `designs/themes/Arctic Blue/_design_system/` to `src/styles/` and make it the single source of truth for app styling, with zero visual change to the app.

**Blocked by:** None.

**Status:** todo

- [ ] `git add` the design system (currently untracked) and `git mv` it to `src/styles/`: `tokens/` (`tokens.css`, `legacy-bridge.css` only if still referenced, `tokens.json` kept as the documented token source) and `components/` (`components.css`, `modules.css`).
- [ ] Split out design-only scaffolding (phone frame, `.od-stage`, status bar, gesture indicator, spec-demo helpers) so it does not ship: either a `designs/`-only stylesheet or deleted, with the screens updated if they reference it.
- [ ] `src/app.css` keeps font-faces and global resets; everything else becomes `@import` of the moved files. No old rules are deleted yet.
- [ ] The app renders byte-identical: `bun run typecheck`, `bun run test` and `bun run build` pass, plus a browser pass over home, one drill, summary and settings in light and dark against the frozen `designs/` screens.
