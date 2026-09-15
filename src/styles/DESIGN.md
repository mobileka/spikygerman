---
version: alpha
name: SpikyGerman Design System
description: iPhone-framed German-learning screens for Russian speakers. Extracted from nine static HTML screens in the repository root. Dark-theme tokens are OKLch derivations of the same hue family, listed in tokens/tokens.json; the hex values below are their sRGB-clamped equivalents.
colors:
  bg: "#f5f8ff"
  surface: "#ffffff"
  surfaceWarm: "#eaf1ff"
  text: "#101828"
  textSecondary: "#344054"
  muted: "#667085"
  border: "#d7e0ef"
  borderSoft: "#edf2f8"
  accent: "#2563eb"
  accentOn: "#ffffff"
  success: "#16a34a"
  warn: "#f59e0b"
  danger: "#ef4444"
  successInk: "#15803d"
  warnInk: "#b45309"
  dangerInk: "#b91c1c"
  dangerSolid: "#dc2626"
  dangerInkSolid: "#ffffff"
  darkBg: "#131821"
  darkSurface: "#1f2530"
  darkSurfaceWarm: "#2c3343"
  darkText: "#f1f3f8"
  darkTextSecondary: "#cdd1d9"
  darkMuted: "#9ea5b2"
  darkBorder: "#39404f"
  darkAccent: "#6b9aff"
  darkAccentOn: "#0b0f18"
  darkSuccess: "#52cd7d"
  darkWarn: "#f9b73f"
  darkDanger: "#fe6c66"
typography:
  display:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0em"
  title:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
  subtitle:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.5
  meta:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
  numeral:
    fontFamily: Inter
    fontFeature: tabular-nums
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  pill: 9999px
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 20px
  "6": 24px
  "8": 32px
  "12": 48px
components:
  button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accentOn}"
    rounded: "{rounded.lg}"
    padding: 10px 14px
    height: 44px
  buttonSecondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
  sectionLink:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 14px 16px
    textColor: "{colors.text}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    height: 44px
  badge:
    backgroundColor: "{colors.surfaceWarm}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  tabbar:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: 64px
---

# SpikyGerman Design System

## Overview

SpikyGerman teaches German to Russian speakers inside a phone mock: every screen renders a
390 × 844 CSS-pixel iPhone surface, framed by device chrome, in light and dark themes. `lang="ru"`
on the document, German lesson content in the body — mixed-script text is the norm, not the edge
case.

The interface is deliberately quiet. Lesson content is the loudest thing on any screen; chrome,
tabs and surfaces recede to one neutral blue-white family plus a single blue accent. Two moods are
supported: **study** (calm surface, generous 16px app padding, one accent per screen) and
**review** (dense stat strips, minibars and issue lists that report performance after a drill).

This document is the authority for colours, type, spacing, radius, elevation and component shape.
It was extracted from the nine screens in the repository root; those files were **not modified**.
Where the screens disagreed, the canonical choice is recorded under *Drift* below.

The workspace root [`../DESIGN.md`](../DESIGN.md) restates the same frontmatter tokens for tooling and
carries the condensed rules; this file stays the detailed authority. Keep both frontmatter blocks in
sync whenever a token changes.

## Layout

A screen is always the same four-row grid — chrome, progress, scrolling content, bottom bar —
because muscle memory matters more than novelty in a drill app.

- Device: 390 × 844 px screen, 10px bezel, 52px outer radius, 42px screen radius.
- Safe areas: 50px top (status bar + dynamic island), 29px bottom (gesture indicator).
- App padding: 16px (`--app-pad`); section gap 16px (`--space-4`); row gap 8px (`--od-gap`).
- Tap targets: 44px minimum everywhere, including inside compact segmented controls.
- The content row is the only scroll container (`overscroll-behavior: contain`), so the tab bar
  never detaches from the screen.
- At ≤480px viewport the device frame drops away and the app fills the viewport — mobile-first is
  the default state, the frame is for desktop preview.

Density ladder: `--space-1` 4px is for icon-to-label gaps only. Never use it for section spacing;
if a layout needs more air, move up the ladder instead of inventing a value.

## Colors

Two themes, one semantic contract. Screens reference semantic names only — no component may pick a
raw hex.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f5f8ff` | `#131821` | app canvas |
| `--surface` | `#ffffff` | `#1f2530` | cards, panels, bars |
| `--surface-warm` | `#eaf1ff` | `#2c3343` | tinted fills, active tabs, badges |
| `--fg` | `#101828` | `#f1f3f8` | primary text |
| `--fg-2` | `#344054` | `#cdd1d9` | secondary text |
| `--muted` | `#667085` | `#9ea5b2` | meta, icons, placeholders |
| `--accent` | `#2563eb` | `#6b9aff` | primary action, links, progress |
| `--accent-on` | `#ffffff` | `#0b0f18` | text on accent |
| `--success` | `#16a34a` | `#52cd7d` | correct answers |
| `--warn` | `#f59e0b` | `#f9b73f` | close/near-miss answers |
| `--danger` | `#ef4444` | `#fe6c66` | wrong answers, destructive actions |
| `--success-ink` | `#15803d` | brightened success mix (see `tokens.css`) | text on success tints |
| `--warn-ink` | `#b45309` | brightened warn mix (see `tokens.css`) | text on warn tints |
| `--danger-ink` | `#b91c1c` | brightened danger mix (see `tokens.css`) | text on danger tints, destructive buttons |
| `--danger-solid` / `--danger-ink-solid` | `#dc2626` / `#ffffff` | danger fill / dark ink | solid destructive button + its text |

Rules that follow from this table:

- **The accent brightens in dark, the ink flips.** Dark buttons are dark-on-blue, not
  white-on-blue, because `--accent-on` deliberately changes value per theme.
- **Status fills are never text.** `--success`, `--warn` and `--danger` are fill colours; small
  text uses `--success-ink`, `--warn-ink` and `--danger-ink`, and solid destructive buttons use
  `--danger-solid` with `--danger-ink-solid`. This is what keeps badges and error labels readable.
- **No pure black.** Dark canvas is OKLch at hue 264, not `#000`; text peaking at `#101828`.
- Colour never carries meaning alone — every correct/incorrect state also states the result in words.

## Typography

One family (Inter) across display and body; the mono stack is reserved for code-like content.
Seven steps, no more: **30 / 24 / 20 / 16 / 14 / 13 / 12** (`--text-3xl` … `--text-xs`).

- `--text-3xl` 30px — screen-level hero (used sparingly; most screens start at 24px).
- `--text-2xl` 24px — question text, screen titles.
- `--text-xl` 20px — hero stat values, large pickers.
- `--text-lg` 16px — section link titles, tile titles, stat values.
- `--text-base` 14px — body copy, buttons, inputs.
- `--text-sm` 13px — labels, destructive help text.
- `--text-xs` 12px — meta, badges, tab labels, progress captions. This is the floor.

Body leading is 1.5, display leading 1.2, display tracking 0. Numerals that sit in a row or update
over time (stats, prices, progress, counts) get `font-variant-numeric: tabular-nums` so values do
not jitter. German lesson text is frequently long — compound nouns like
"Lebensmittelgeschäft" must wrap, never truncate mid-word without an ellipsis.

## Elevation and shape

The system has exactly three elevation states, and no more:

- `--elev-flat` — nothing. Used by content that sits directly on `--bg`.
- `--elev-ring` + `--elev-raised` — the canonical card treatment: a 1px ring in `--border` plus a
  1px soft shadow. Always applied as a pair; a card with a shadow and no ring looks blurry in dark.
- `--surface-warm` tint — the "pressed/selected" alternative to elevation for tab bars and choices.

Radius ladder: 4px chips and swatches, 6px small controls and icon tiles, 8px cards, buttons,
inputs and links, pill for badges, progress, segments and the tab bar. Device radii (52/42px) are
geometry, not part of the ladder.

Focus is a single 4px blue halo (`--focus-ring`), plus a 2px accent outline for plain
links and native controls. Both must stay visible against `--bg` and `--surface`.

## Motion

Two durations, one curve: `--motion-fast` 150ms for colour and state, `--motion-base` 250ms for
size and position, both `cubic-bezier(0.77, 0, 0.175, 1)`. Press feedback is a 1px downward shift,
never a scale. Progress bars animate width only (segmented fills and ring arcs animate their
length/width only). Everything collapses to ~0ms under
`prefers-reduced-motion: reduce`, and no state change depends on an animation completing.

## Components

Shared component layers live in `_design_system/components/`; load order is
`tokens.css` → `legacy-bridge.css` → `od-layout-primitives.css` → `components.css` → `modules.css`.

- **Device shell** — `.phone-frame`, `.phone-screen`, `.status-bar`, `.status-cutout-zone`,
  `.gesture-indicator`, `.hardware-button`. Presentation only; content never enters the chrome.
- **App frame** — `.app` (4-row grid), `.topbar`, `.brand-row`, `.mark`, `.brand-text`,
  `.level-chip`,
  `.topbar-icon`, `.theme-toggle` (right-pinned; 8px behind `.level-chip` on drill bars), `.progress-line` (+`.is-segmented`/`.progress-seg.seg-correct|.almost|.incorrect`
  for results everywhere: level, drills, summary, settings), `.screen`, `.bottombar`, `.tabbar`/`.tab`.
- **Surfaces** — `.panel` (+`-h`/`-b`), `.section-list`/`.section-link`/`.section-num`,
  `.sec-grid`/`.sec-tile` (+`.is-home` tall centered home card)/`.sec-n` (+`.sec-ring` with `.ring-track`/`.ring-correct|.almost|.incorrect`
  for section progress pies; empty is the track), `.badge.is-done`/`.is-soon`, `.stat-strip`/`.od-stat`.
- **Controls** — `.btn` with `-primary`/`-secondary`/`-danger`/`-danger-solid`, `.field`,
  `.select-lg`, `.choice`, `.lvl-btn`, `.lvl-panel` (tiles under the level head), `.lvl-progress` (shared bar + caption pair on index, drills, summary), `.umlaut`, `.seg`, `.swatch`.
- **Modules** — exercise (`.qcard`, `.q-instr`, `.q-ask`, `.qn`, `.example`, `.gap-line`,
  `.feedback.correct|.almost|.incorrect|.is-empty` + `.fb-glyph`/`.fb-main`/`.model`/`.tip`,
  `.field[data-state]`), commerce (`.price-table`, `.price-row`, `.price-total`,
  `.food-photo`, `.photo-ph`), summary (`.minibar`, `.kv`, `.sum-list`, `.issues-list`,
  `.issue-link` + `.is-almost`/`.is-empty` chip variants, `.issues`/`.issues-empty`/`.issues-more`), settings (`.set-row`, `.sr-i`, `.sr-t`, `.set-note`, `.set-reset`,
  `.set-status`, `.danger-zone`, `.confirm-actions`).

Every interactive component must define four states: rest, hover, pressed/selected, focus-visible,
plus a disabled or empty form where the state can occur. Compose from the od-layout primitives
(`.od-stack`, `.od-row`, `.od-grid`, `.od-rail`, `.od-scroll`) instead of adding new flex wrappers.

## Do's and Don'ts

**Do**

- Reach for an existing token or class before writing a new one; if a new value is genuinely needed,
  add it to `tokens.css` and `tokens.json` in the same change.
- Keep one accent action per screen; a drill screen has one primary button, full width.
- Pair every colour-coded result with a sentence ("Правильно: der Tisch").
- Keep bottom bars and tab bars as `--surface` with a `--border-soft` hairline so content scrolling
  underneath reads as depth, not bleed.
- Test at 12px (`--text-xs`) with Russian and German strings before shipping.

**Don't**

- Don't use literal hex, oklch, px radius, ms duration or shadow values in a screen stylesheet.
- Don't use `--muted` for interactive text or `--success`/`--danger` directly as text colour.
- Don't add a fourth elevation level, a second accent hue, or a third duration.
- Don't invent a new card radius or mix 6px and 8px radii inside one card.
- Don't tint the phone chrome with theme colours — the frame is device hardware, the same in both
  themes; only its darker variant is theme-aware.
- Don't truncate German lesson words with `white-space: nowrap`; wrap them.

## Drift

Eight screens share a byte-identical token block; `einstellungen.html` (Настройки) still uses the
older KUMO names and a softer ladder (radius 8/10/14px, `--text-base` 15px, `--text-2xl` 22px,
literal hover hex). It is bridged by `tokens/legacy-bridge.css` for everything that can be aliased;
the colliding names are listed as open work in `docs/drift-report.md`, together with the four
undefined tokens and the two hard-coded column counts that were hardened here.
