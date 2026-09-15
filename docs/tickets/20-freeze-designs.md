# 20: Freeze designs/ as reference

**What to build:** retire `designs/` from active use once the app replicates it, keeping it purely as the frozen visual reference for the current and future themes.

**Blocked by:** 19 (nothing may reference `designs/` as a source once frozen).

**Status:** todo

- [ ] No build, import, test or script references `designs/` (verify with a repo-wide search); `src/styles/` is the only styling source of truth.
- [ ] `00001 - Initial design` is either removed (it was kept for historic reasons only) or explicitly marked historic — decision recorded here before closing.
- [ ] A short note at the top of `designs/` (README or the existing `DESIGN-HANDOFF.md` pattern) states: read-only visual reference, do not edit, do not import; all changes go to `src/styles/` + components.
- [ ] Final verification: `git status` shows only the freeze note itself as changed, `bun run typecheck`, `bun run test` and `bun run build` pass.
