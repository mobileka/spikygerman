# Drift report — SpikyGerman screens

Audit of the nine screens in the repository root, performed **read-only**: no source file was
modified while producing `_design_system/`. This report records every divergence found, the evidence
for it, and how the extracted system resolves it.

## Scope and method

| Step | What was read |
|---|---|
| Token layer | `index.html` lines 51–272 (Kumo binding block + theme layer) |
| Confirm the layer is shared | the head of the token block in `was-ist-das`, `artikel-und-verben`, `sich-vorstellen`, `einkaufen`, `dialoge`, `summary`, `preise` — identical through the sampled declarations |
| Product CSS | `index.html`, `dialoge.html`, `summary.html`, `einstellungen.html` |
| Layout primitives | `index.html` lines 17–48 (verbatim extraction → `tokens/od-layout-primitives.css`) |
| Documentation | `DESIGN-HANDOFF.md`, `DESIGN-MANIFEST.json` |

Resolution vocabulary used below and throughout the system: **resolved** = the screens disagreed and
the system picks one canonical value · **hardened** = an undefined name is now defined, or a literal
is now themable · **verified** = the source already did this correctly and the system preserves it.

## Findings

### D1 · Two token generations in one product — *high*

**Evidence.** Eight screens (`index`, `was-ist-das`, `artikel-und-verben`, `sich-vorstellen`,
`einkaufen`, `dialoge`, `summary`, `preise`) carry the "Cloudflare Kumo UI — OpenDesign semantic
bindings" block. `einstellungen.html` carries the older "KUMO token layer".

**Where they disagree.**

| Token | Legacy (`einstellungen`) | Canonical (8 screens) |
|---|---|---|
| `--bg` | `#eef1f6` | `#f5f8ff` |
| `--surface-warm` | `#f5f8ff` | `#eaf1ff` |
| `--fg` | `#111827` | `#101828` |
| `--fg-2` | `#3f4653` | `#344054` |
| `--muted` | `#6b7280` | `#667085` |
| `--border` / `--border-soft` | `#d8dee8` / `#e9edf4` | `#d7e0ef` / `#edf2f8` |
| `--accent-hover` | literal `#1d4ed8` | `color-mix(accent, black 8%)` |
| `--accent-active` | literal `#1e40af` | `color-mix(accent, black 14%)` |
| `--success` / `--warn` / `--danger` | `#15803d` / `#b45309` / `#b91c1c` | `#16a34a` / `#f59e0b` / `#ef4444` |
| `--radius-sm/md/lg` | `8 / 10 / 14px` | `4 / 6 / 8px` |
| `--text-base` | `15px` | `14px` |
| `--text-xl/2xl/3xl` | `18 / 22 / 28px` | `20 / 24 / 30px` |
| `--motion-fast/base` | `120ms / 220ms` | `150ms / 250ms` |

**Resolution.** The canonical block wins — it is what eight screens and the entry file render.
`tokens/legacy-bridge.css` maps every legacy name that can be expressed in canonical tokens. The
collisions above cannot be aliased (they would restyle the eight canonical screens), so they are
listed as open work inside that file. Migration effect on Настройки: slightly cooler neutrals, ~1px
tighter text, one step less radius, status colours moving from the dark 700/800 range to the
brighter 500/600 range. It will read *sharper*, not worse — the legacy ladder was authored for a
poster-like layout.

### D2 · Names used in `einstellungen.html` that the canonical layer never defines — *high*

`--surface-muted`, `--radius-full`, `--border-strong` and `--stage-base` exist only inside that one
screen. Any markup moved from Настройки into a canonical screen silently loses them: pills stop
being pills (the canonical name is `--radius-pill`), tinted tracks go transparent, and the dashed
placeholder ring falls back. **Resolution:** all four are now defined in `tokens/legacy-bridge.css`
(`--radius-full` → `--radius-pill`, `--surface-muted` → `--surface-warm`, `--border-strong` →
`--muted`, `--stage-base` → `--phone-stage-bg`).

### D3 · Zero shared stylesheets — *high*

`DESIGN-MANIFEST.json` declares `"css": []`, and its `sourceFiles` lists HTML only. The token block
and the layout primitives are therefore pasted into all nine files; D1 is the inevitable result of
that, and the next screen would drift again. **Resolution:** the system lives in `tokens/` +
`components/`; the screens keep their inline copies until they are migrated one at a time, because
the layers are idempotent when loaded together.

### D4 · Hard-coded grid column counts — *medium*

The tab bar is pinned to three columns and the stat strip to four. Adding a fourth tab or a
three-stat summary leaves a phantom column. **Resolution (hardened):** `.tabbar` reads `--tab-count`
(default 3) and `.stat-strip` reads `--strip-cols` (default 4) — the defaults reproduce today's
layout exactly.

### D5 · Conflicting stat value size — *low*

The canonical block sets stat values at `--text-xl` (20px); a later patch in the same files pins
`.stat-strip` values at 18px. Both were live. **Resolution:** 20px stays the hero/stat default, 18px
is the 4-up strip value, declared once in `components.css` with a comment instead of an override
that hides the token.

### D6 · `einstellungen.html` is missing from the manifest — *medium*

`DESIGN-MANIFEST.json` lists eight source files; the working tree has nine. That is almost certainly
why Настройки is the drifted screen: it was authored after the manifest was generated and never
folded into the Kumo pass. **Resolution:** the system treats it as a first-class screen (module D,
settings) and documents its bridge rather than hiding it. Action for the repo owner: regenerate the
manifest.

### D7 · Manifest title is a bare identifier — *low*

`DESIGN-MANIFEST.json` carries `"title": "38c38188-edbe-4a30-b120-2e5c7d3a5ab2"`. Nothing in the
design artefacts names the product, so the system takes its name from the screens' own brand text
(`SpikyGerman`). **Resolution:** the name is fixed in `DESIGN.md`; the manifest title is untouched.

### D8 · Duplicated inline patch layers — *low*

Each screen carries a trailing patch block that re-declares overflow and wrap behaviour after its
product CSS. It works, but one layout bug is fixed nine times (and forgotten nine times).
**Resolution:** those rules are folded into the base section of `components/components.css`; the
per-screen patches can be deleted as each screen is migrated, with no change to the rendered result.

## System additions (not source defects)

These are the system's own choices; none contradicts a screen's intent:

- `prefers-reduced-motion: reduce` collapses both durations and removes press shifts.
- A shared `:focus-visible` treatment (4px halo for components, 2px accent outline for native
  controls) so every interactive class has a visible focus state.
- Status **ink** tokens (`--success-ink`, `--warn-ink`, `--danger-ink`, `--danger-solid`,
  `--danger-ink-solid`): status fills are tuned for area, not for 12px text, so small labels and
  destructive buttons read from tinted, contrast-checked values instead.
- `font-variant-numeric: tabular-nums` wherever a number can change in place (stats, prices,
  progress, level chips, quiz counters).
- 44px minimum tap targets on segmented controls and swatches.
- `.od-stage` wrapper: the source centred the phone by styling `<body>`; the system moves that to a
  stage class so screens can also be embedded in docs and galleries.
- `--tab-count` / `--strip-cols` variables (see D4).

### D9 · Production progress patterns back-ported — *resolved*

**Evidence.** The static screens only had a single-accent `.progress-line --progress`
and per-item `.minibar` cells. The production app (`ProgressBar.svelte`,
`ProgressRing.svelte`, `Home.svelte` level-1 tiles) reports results as proportional
tri-color: segmented bar (`correct → almost → incorrect`, empty = track) and section
ring pies (56 viewBox, r=24, 3.5 stroke, same order/arcs). The system had neither.

**Resolution.** `components.css` gains `.progress-line.is-segmented` +
`.progress-seg.seg-correct|.almost|.incorrect` (legacy single-span API untouched)
and reusable `.sec-ring` + `.ring-track|.correct|.almost|.incorrect` under
`.sec-n:has(.sec-ring)`. No new colours — status fills only; meaning stays paired
with `.progress-text` copy. Tokens frozen in `tokens.json`
(`components.progressSegmented`, `components.sectionRing`).

### D10 · Screens migrated onto the system — *resolved*

**Evidence.** All 26 screens (00001 ×8, 00002 ×9, 00003 ×9) carried pasted
token/primitive/theme layers plus screen-local product CSS, including shell
drift the system never had: pseudo-element status chrome, a 3-row `.app`
grid, `data-status` card contracts, radio-matrix choices, `st-*` stat
modifiers and `title-select` pickers.

**Resolution.** Every screen now links the five system layers and carries no
inline `<style>`: canonical `.od-stage` phone shell with element status bar,
island and gesture indicator; 4-row `.app` grid (progress extracted to row 2;
settings pins screen/footer rows explicitly); DS module contracts
(`data-state`, button `.choice`, `.select-lg`, `.is-*` stats, `.sec-grid`
tiles, `.seg` settings controls); the shared drill engine, summary builders
and settings scripts updated to the same contracts. System additions made
along the way: `.tab`/`.topbar-icon` svg sizing, `.bottombar[hidden]`,
`.tt-sun`/`.tt-moon` swap, `.field[data-state]`, `.feedback` body/glyph/empty
variants, `.issues` block and per-status issue chips. Verified by
screenshot in both themes and by exercising quiz, progress, summary,
settings and theme flows in a live browser.

## Migration checklist (per screen)

1. Delete the inline token `<style>` block; link `tokens/tokens.css`,
   `tokens/legacy-bridge.css` and `tokens/od-layout-primitives.css` instead.
2. Delete the inline product CSS; link `components/components.css` + `components/modules.css`.
3. Replace the `<body>` stage styling with `.od-stage` (or drop the frame on small viewports).
4. Re-check the four states on every control (rest, hover, pressed, focus-visible) in both themes.
5. Re-check Russian and German strings at `--text-xs` (12px) — the floor.
6. Remove the screen's trailing patch block once the base layer covers it.
