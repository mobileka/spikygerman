# 🚧 WIP — Work in Progress 🚧

> This project is just getting started. Everything here is subject to change.

# SpikyGerman

*German without the sharp edges.*

A volunteering project teaching refugees the absolute basics of German (level A0),
guided by two hedgehog mascots: **der Igel** (the big one) and **die Igli** (the small, cute one).

## Screenshots

<p align="center">
  <img src="docs/screenshots/preview.png?v=2" width="880" alt="Light theme: home with level 1 expanded into six sections, a Was ist das? question answered correctly with feedback, and the summary with per-section percentages">
</p>

<p align="center">
  <img src="docs/screenshots/preview-dark.png?v=2" width="880" alt="Dark theme: the same three screens">
</p>

## Values

- **Multilingual from day one.** Many learners can't read Latin script yet (e.g. Ukrainians
  who only read Cyrillic). The architecture must support translations from the start;
  the first MVP targets **Russian**. Transliteration and click-to-pronounce audio are
  planned for later versions.
- **Accessible — this is a must.** We have blind learners, and our most promising student
  is blind. The site must be fully usable with screen readers.
- **Mobile-first**

## Development

Bun 1.3+ (same as CI).

```sh
bun install
bun run dev        # build the content, then start the dev server
bun run test       # unit tests (vitest)
bun run typecheck  # svelte-check
bun run build      # content check + production build
```

## License

[MIT](LICENSE)
