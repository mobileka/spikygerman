# SpikyGerman — design system

A shared token, component and module layer extracted from the nine German-learning screens in the
repository root. The screens themselves were **not modified**; this directory is additive and can be
adopted screen by screen.

Start here → **[`index.html`](index.html)** is a live spec sheet: every colour, ladder and component
rendered from the system files, in both themes.

## Contents

| File | What it is |
|---|---|
| [`DESIGN.md`](DESIGN.md) | The baton — colours, type, layout, elevation, components, do's and don'ts |
| [`index.html`](index.html) | Live spec sheet (self-contained; open it in a browser) |
| [`_probe.html`](_probe.html) | Starter template for a new screen — five links, theme boot, app grid |
| [`tokens/tokens.css`](tokens/tokens.css) | Canonical tokens, light + dark, plus two optional levers |
| [`tokens/tokens.json`](tokens/tokens.json) | The same values, frozen and machine-readable, for a framework port |
| [`tokens/legacy-bridge.css`](tokens/legacy-bridge.css) | Maps the older KUMO names onto canonical tokens |
| [`tokens/od-layout-primitives.css`](tokens/od-layout-primitives.css) | The `@layer od-layout` primitives, verbatim |
| [`components/components.css`](components/components.css) | Device shell, chrome, navigation, controls, metrics, utilities |
| [`components/design-stage.css`](components/design-stage.css) | Phone frame, stage, status bar and gesture chrome — mocks only, never shipped to the app |
| [`components/modules.css`](components/modules.css) | Exercise, commerce, summary and settings modules |
| [`docs/drift-report.md`](docs/drift-report.md) | Every divergence found in the screens, with evidence and resolution |

## Two-axis theming (ticket 18)

Two independent axes, both carried on `<html>`:

- `data-design="arctic-blue"` — the *design* theme. Exactly one is compiled
  in; there is no switcher UI.
- `data-theme="light|dark"` — the *color mode*, owned by
  `src/lib/theme.svelte.ts` as before.

Scoping rule, kept deliberately boring:

- **Tokens are always scoped per design**: `:root[data-design="arctic-blue"]`
  and `:root[data-design="arctic-blue"][data-theme="dark"]`. This applies to
  `tokens/tokens.css` and `tokens/legacy-bridge.css` alike.
- **Components stay global by default**, including their `data-theme` dark
  adaptations (theme-toggle icon swap, large-picker arrow). A re-skin that
  needs different component shapes adds its own scoped overrides later —
  nothing is pre-scoped on speculation.

A future theme is therefore: one new tokens file under a new `data-design`
value, plus optional scoped component overrides. No markup or state changes.
Sketch (not shipped):

```css
:root[data-design="forest"] { --accent: #2f7d4f; --bg: #f2f6f1; }
:root[data-design="forest"][data-theme="dark"] { --accent: #7cc79a; }
```

## Load order

```html
<link rel="stylesheet" href="tokens/tokens.css" />
<link rel="stylesheet" href="tokens/legacy-bridge.css" />
<link rel="stylesheet" href="tokens/od-layout-primitives.css" />
<link rel="stylesheet" href="components/components.css" />
<link rel="stylesheet" href="components/design-stage.css" />
<link rel="stylesheet" href="components/modules.css" />
```

The app (`src/app.css`) imports everything above except `legacy-bridge.css`
(nothing in the app uses the legacy names) and `design-stage.css` (device
chrome the app never renders).

Order matters in one place: `od-layout-primitives.css` lives in `@layer od-layout`, so every later
unlayered rule beats it without extra specificity. Keep the primitives first, keep product CSS
unlayered.

The theme is still the screen's job, and it must happen before first paint:

```html
<html lang="ru" data-design="arctic-blue" data-theme="light">
<script>(function(){try{var t=localStorage.getItem("spiky-theme");
  if(t!=="dark"&&t!=="light"){t=(window.matchMedia&&window.matchMedia(
  "(prefers-color-scheme: dark)").matches)?"dark":"light";}
  document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>
```

## Levers

Two custom properties are multiplied into the ladders, both defaulting to `1` so the frozen values
stay exact:

- `--kumo-radius-scale` — rounds the radius ladder (0.6 → 1.8 keeps cards sane).
- `--kumo-space-scale` — opens or tightens the 4→48px spacing ladder.

`--kumo-type-scale` exists in the token file for the same purpose but is left at `1`; changing type
size re-flows drill cards, so treat it as a layout change, not a preference.

The spec sheet wires the first two to the renderer's tweak panel, which is how you can watch the
radius and spacing ladders move without editing a file.

## Adopting it

1. **Read [`docs/drift-report.md`](docs/drift-report.md) first.** Eight screens share one binding
   layer; `einstellungen.html` predates it and is bridged, not silently repainted.
2. **Migrate one screen at a time.** Delete its inline token `<style>` block, link the five
   stylesheets above, then delete its product CSS. The classes are the same names the screens
   already use, so markup usually needs no edit at all.
3. **Regenerate [`DESIGN-MANIFEST.json`](../DESIGN-MANIFEST.json)** — it currently lists eight files
   while the tree has nine, which is the root cause of the drift in the first place.
4. **Add to the system, not to the screen.** A new value goes into `tokens/tokens.css` *and*
   `tokens/tokens.json` in the same change.

## Extraction deltas

Small, deliberate differences between the source screens and this system. Each is documented at its
declaration site too.

| Delta | Why |
|---|---|
| `<body>` stage styling became `.od-stage` | Screens can be embedded in docs and galleries instead of owning the viewport |
| Trailing per-screen overflow patches folded into `components.css` base | One bug fixed once |
| `.tabbar` / `.stat-strip` column counts became `--tab-count` / `--strip-cols` | Adding a tab no longer breaks the grid |
| Progress line gained a width transition and an `.is-lg` modifier | Resolves the 6px/8px split between the canonical and settings definitions |
| Status ink tokens added | Status fills are area colours; 12px text on them failed contrast |
| `--kumo-radius-scale` / `--kumo-space-scale` added | Lets the ladders be inspected without forking the tokens; identity by default |

## Not in scope

No build step, no framework, no JavaScript components, no icon set (the screens use inline SVG, and
this system keeps it that way), and no change to any file outside `_design_system/`.
