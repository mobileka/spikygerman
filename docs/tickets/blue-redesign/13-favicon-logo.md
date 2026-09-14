# 13: Favicon shows the logo

**What to build:** the browser tab shows the hedgehog logo instead of the generic blue "S" square. The artwork is the same hedgehog mark the topbar renders (the `.mark` SVG in `TopBar.svelte`); it moves into a real `public/favicon.svg` referenced from `index.html`, and the data-URI "S" favicon goes away.

Design source of truth: the hedgehog SVG in `src/lib/components/TopBar.svelte` (paths, viewBox, colors); current placeholder in `index.html` (`rel="icon"` data URI with the white "S").

**Blocked by:** None (the logo artwork already ships on every screen).

**Status:** ready-for-agent

- [ ] `public/favicon.svg` contains the hedgehog mark (same shapes and colors as the topbar logo, legible at 16×16).
- [ ] `index.html` references it via `<link rel="icon" ...>`; the data-URI "S" favicon is removed.
- [ ] The file is served from the build output (under `public/`, so it survives `npm run build` and the Pages deploy) — no oversized inline data URI in `index.html`.
- [ ] The tab shows the hedgehog in a desktop browser; the SVG also renders when opened directly.
- [ ] `npm test`, `npm run typecheck` and `npm run check` pass.
