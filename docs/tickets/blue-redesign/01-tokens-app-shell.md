# 01: Blue tokens + app shell

**What to build:** the Blue design system and the global chrome that wraps every screen. The app picks up the design's palette, typography, spacing, radii, elevation and focus ring, and gets a sticky topbar and a sticky bottom tab bar shared by home, all sections and summary. The tab bar is navigable from the start; the pieces that need new behaviour (live progress, smart continue) are rendered in their design's initial state and wired in tickets 05 and 06.

Design sources of truth: all files in `designs/00001 - Blue/` (topbar and footer markup), `index.html` (shell CSS and tab bar), `design-spec.md` (level chip rules).

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Design tokens from the Blue files are applied app-wide: page background, surface, foreground, muted, border, accent, success/warn/danger, radii, elevation, focus ring, motion timing/easing; Inter with the design's type scale and line height.
- [x] Every screen shows a sticky topbar with the hedgehog SVG mark linking home, the brand name and subtitle.
- [x] The topbar shows the static, non-clickable «Уровень 1» chip. No level switcher is added (levels 2+ stay deferred).
- [x] The topbar progress bar renders in the design's initial state: empty bar plus «Прогресс сохраняется на Вашем устройстве».
- [x] Every screen shows the sticky bottom tab bar with Главная / Продолжить / Итоги, each with its icon; the current tab carries `aria-current="page"`. «Продолжить» points at the first section for now.
- [x] The umlaut helper row docks above the tab bar and still appears only while a text field is focused, without losing focus when tapped.
- [x] The phone frame, status bar, camera dot and gesture indicator are not ported.
- [x] Existing behaviour is unchanged: routing, grading, answer persistence, reset, deep links, skip link.
- [x] Layout holds from 360×800 up to desktop with no horizontal scrolling.
- [x] New interface strings live in the Russian strings file and pass `npm run check`; `npm test` and `npm run typecheck` pass.
