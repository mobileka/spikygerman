---
name: app-screenshots
description: Regenerate the README preview screenshots — the light and dark composites of the live app wrapped in the design-system iPhone shell. Use when asked to take/redo README screenshots.
---

# Regenerate the README screenshots

Produces two files, both committed and both shown in the README:

- `docs/screenshots/preview.png` — light theme, three phones side by side: Home (level 1 expanded), Was ist das? with a checked answer, Summary.
- `docs/screenshots/preview-dark.png` — the same three screens in dark theme.

The phones are real app renderings: each screen is an iframe of the live dev server placed inside the `.phone-frame` mockup from `src/styles/components/design-stage.css` (the same shell the files in `designs/` use). Nothing is hand-drawn in an image editor.

## Run it

```sh
bun install                    # once, or after dependency changes
bun run dev                    # note the "Local:" URL, e.g. http://localhost:5173
node .opencode/skills/app-screenshots/capture.mjs
```

If Vite picked another port (5173 was busy):

```sh
BASE=http://localhost:5174 node .opencode/skills/app-screenshots/capture.mjs
```

The script prints the output paths and the progress line of each phone. It refuses to write a theme's PNG if any phone's top bar ended up off-screen, so a broken capture fails the run instead of silently replacing a good image. It takes ~30 seconds. It temporarily writes `screenshot-harness.html` to the repo root, serves it through Vite, and deletes it afterwards (the file name is in `.gitignore`, so a crashed run cannot pollute `git status`).

## Caching: readers may still see the old image

The output paths never change, so after a push GitHub's raw image endpoint and readers' browsers can keep serving the previous PNG. This has already produced a false "the middle phone is broken" report: the file on `main` was correct, the reader's browser had the old bytes. When you ship new previews, bump the `?v=N` query on both README image URLs (GitHub preserves it, which changes the cache key) and ask the reader to hard-refresh before debugging the capture itself. Check the live bytes if unsure:

```sh
shasum -a 256 docs/screenshots/preview.png
curl -sL https://raw.githubusercontent.com/mobileka/spikygerman/main/docs/screenshots/preview.png | shasum -a 256
```

## Verify before committing

Read the two PNGs back with OCR or a vision model and check all six screens show their top bar (`SpikyGerman` brand row) and the expected state; the middle phone must show `18. Ist das eine Tomate?` with the green `Верно` feedback. On this machine the OCR helper lives at `~/dev/opencode/config/skills/ocr-attached-image/scripts/ocr_attachment.py` (`--file docs/screenshots/preview.png --engine model` gives a description). Also sanity-check the size:

```sh
sips -g pixelWidth -g pixelHeight docs/screenshots/preview.png   # 2908 x 2088 at DPR 2
```

## Why the script works this way (do not break these)

- **The harness must be served by the dev server, never injected with `page.setContent`.** The app reads/writes `localStorage` on module load; a page loaded from `about:blank` has an opaque origin, and the iframe then throws `SecurityError: Access is denied for this document`, so the app never mounts and the phones come out blank. Serving `screenshot-harness.html` from the Vite origin keeps the iframe same-origin.
- **Phone chrome comes from the design system.** `design-stage.css` defines `.phone-frame`, `.phone-screen`, `.status-bar`, `.status-cutout-zone`, `.gesture-indicator` and `.hardware-button`. The harness links the same CSS layers, in the same order, as the frozen pages in `designs/`.
- **The iframe is 390 x 765.** The phone screen is 390 x 844 (`--phone-screen-width/height`); `.app { padding: var(--phone-safe-top) 0 var(--phone-safe-bottom) }` reserves 50 px at the top and 29 px at the bottom for the status bar and gesture indicator, leaving 765 px for the app.
- **Never deep-link a question in the middle phone.** `#/s/was-ist-das/q18` makes `SectionView` call `scrollIntoView` on the question, which scrolls the app top bar out of the iframe and leaves the screenshot looking "off". Use the plain section route `#/s/was-ist-das`; the seeded answer means q18 still shows its checked feedback first.
- **Scroll every frame back to the top before shooting**, then wait a moment, then screenshot the `.od-stage` element (`deviceScaleFactor: 2`, viewport 1600 x 1300).
- **Wait for lazy images with a timeout.** Some content images are `loading="lazy"` and never fire `load` inside a short iframe; waiting on them without a `Promise.race` timeout hangs forever.
- **Two independent contexts, one per theme.** `spiky-theme` is seeded in `localStorage` before load (the boot script in `index.html` reads it pre-paint), and `colorScheme` is set on the context so system-driven styles agree.
- **Stage background stays square on purpose** (no `border-radius` on `.od-stage`); rounded corners were tried and looked wrong.

## The seeded state

The screens must tell the same story as before, so the script seeds `localStorage` key `spikygerman:sample-test-1:v2` (level id from `src/generated/content.ru.json`; bump the `:vN` suffix if the progress schema changes) with:

- 21 of 36 questions checked: q01–q07, q13–q15, q18, q22–q23, q26–q33.
- q02 answered wrong on purpose (wrong prefix) and q07 missing its last gap → 19 correct, 1 almost, 1 wrong, 15 empty.
- Per section: 4/5, 1/3, 3/5, 1/4, 2/4, 8/15 correct, which is what the README's percentages and "58%" progress bar used to show.

If the content changes (new questions, new section), update `seed` and `ROUTES` in `capture.mjs` and keep the per-section correct counts above in sync with any numbers quoted in the README.

## README wiring

Both images are embedded, centered, stacked — light first. There is deliberately no `<picture>` theme swap: with `prefers-color-scheme` only one file is ever visible and readers on a dark OS never see the light set.

```html
<p align="center">
  <img src="docs/screenshots/preview.png" width="880" alt="Light theme: home with level 1 expanded into six sections, a Was ist das? question answered correctly with feedback, and the summary with per-section percentages">
</p>

<p align="center">
  <img src="docs/screenshots/preview-dark.png" width="880" alt="Dark theme: the same three screens">
</p>
```

## Dependencies

`playwright-core` (devDependency) drives the system Chrome via `channel: "chrome"`; it downloads no browsers. If Chrome is missing, the script falls back to a bundled Chromium — install it with `bunx playwright-core install chromium`.
