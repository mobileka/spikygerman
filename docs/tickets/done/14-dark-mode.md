# 14: Dark mode

**What to build:** the app gets the dark theme from `designs/00003 – Blue – Dark`: the dark token layer (OKLCh derivations of the Kumo blue system), a topbar sun/moon toggle, system preference as the default, and an explicit choice remembered in the browser. The light design is unchanged — the two are one token system with a `data-theme="dark"` override.

Design source of truth: `designs/00003 – Blue – Dark/` (the `:root[data-theme="dark"]` token block, the theme boot script in `<head>`, the `.theme-toggle` topbar button with its sun/moon SVGs, and the toggle wiring script). The `--paper` and `--code-bg` tokens and the `white` → `var(--paper)` swaps in the choice/feedback backgrounds come from the same export.

**Blocked by:** None (the light tokens from ticket 01 are the base).

**Status:** done

- [x] `:root[data-theme="dark"]` overrides every blue token in OKLCH (bg, surface, surface-warm, fg, fg-2, muted, meta, border, border-soft, accent, accent-on, hover/active, success/warn/danger, paper, code-bg, border-strong, elev-raised, focus-ring); the light theme keeps its current values via `--paper`/`--code-bg`.
- [x] Dark-only fixes from the design: light `.mark` tile for the hedgehog, `.title-select` chevron in `#80b0ff`, `.skip-link`, `.od-stat.st-al strong` and `.issue-chip` mixing with white, `input::placeholder`.
- [x] `index.html` sets `<meta name="color-scheme" content="light dark" />` and runs the boot script before first paint, so a saved or system dark theme never flashes light; the key is `spiky-theme`, matching the design.
- [x] `src/lib/theme.svelte.ts` owns the state: reads the applied attribute, `toggleTheme()` persists the explicit choice, and a `prefers-color-scheme` listener applies system changes only while no choice is saved.
- [x] The topbar shows a 44×44 toggle after the level chip, with the design's sun/moon icons, `aria-pressed`, and `aria-label`/`title` from `theme_to_dark`/`theme_to_light` in `content/strings.ru.toml`; Russian labels stay in the content file, not the component.
- [x] `bun run typecheck`, `bun test` and `bun run check` pass; `theme_to_dark`/`theme_to_light` are in `REQUIRED_UI_KEYS`.
- [x] Visual check at 390×844: home, a section (input, select chevron, checked feedback, progress bar) and summary (stat cards, issue chips) render dark correctly; toggling back restores the light design and the choice survives a reload.
