# Level 0 — Учимся читать (reading level)

**Status:** draft, ready for design and ticket breakdown.
**Source of decisions:** Grill 2, 15 September 2026 (record at the bottom).
**Supersedes:** nothing. This is the first spec in `docs/specs/`; `docs/context.md`
is the frozen journal of Level 1 and does not grow any more.

## How to use this document

Three people read it, for three different jobs:

- **Designer (frontend engineer).** Section 8 (screens and states) and section 12
  (design requirements) list every screen, sheet, state and string to draw. Do not
  invent behaviour that is not here; if something is missing, it is a spec bug —
  ask, and we add it here first.
- **Engineering manager.** Section 17 is the ticket breakdown with dependencies
  and acceptance criteria. Tickets go to `docs/tickets/level-0/` in the same shape
  as `docs/tickets/blue-redesign/`.
- **Developer.** Sections 5–11, 13–16: data model, TOML schema, validation rules,
  progress storage, routing, drills, speech, tests, reuse map, edge cases.

Everything in this document is a decision, unless it says "open" or "parked".

---

## 1. The problem

Some of our learners cannot read German/Latin letters. They do not know what the
letters or letter combinations sound like. The current app (Level 1) is a test:
it hands them German text and asks them to type German. A person who cannot decode
`Sch` or `ei` is blocked before question one.

What these learners **do** have:

- They read Cyrillic confidently. The interface, instructions and hints in Russian
  work for them. The level can speak to them in Russian, and it should teach them
  the specific letter-sound correspondences they do not have.
- Real hazards are predictable. A Latin reader who only knows Cyrillic already
  owns six letters for free (А, Е, К, М, О, Т look and mostly sound as in Russian),
  and gets actively fooled by others: В, Н, Р, С, У, Х look Cyrillic but read
  differently. Russian approximations are honest for roughly half the alphabet and
  lie for the rest: German «z» is «ц», «v» is usually «ф», «w» is «в», «ü» and «ö»
  have no Russian equivalent at all, and `ch` is two different sounds depending on
  the preceding vowel.

What the level must therefore do: teach the **sounds of the German alphabet and its
letter combinations**, in Russian, with the example words coming from Level 1
vocabulary wherever possible, and let the learner hear the words.

## 2. Who it is for

- Russian-speaking learners who read Cyrillic but not Latin script.
- Phones first, portrait, cheap Androids, flaky data — same rules as Level 1.
- Blind learners: the level must not crash for them, and screen reader semantics
  must be correct, but learning letter *shapes* is inherently visual. What the
  level promises them is honest audio and correct announcements (section 11).
- The teacher authors and reviews all content (section 6).

## 3. Goals and non-goals

Goals:

1. A learner can find any German letter or combination, tap it, and immediately
   understand in Russian how it is read, with a word they will meet again in
   Level 1.
2. A learner can hear the example words (device speech for now, recordings later).
3. The learner can practise a single sound, and train on everything mixed.
4. The level shows which sounds are learned and makes no sound count as "learned"
   just because the learner opened it.
5. The level is quick, light, offline-tolerant and fully keyboard/screen reader
   reachable.

Non-goals for v0 (see section 15): letter names (Be, Ce, De), writing/spelling
drills, recorded audio, numbers, grammar.

## 4. Where it sits in the app

- The home screen hero already says «Выберите уровень». **Уровень 0** is the first
  tile, above **Уровень 1** (the existing test). Levels are independent; adding
  Level 0 changes no Level 1 behaviour, storage or grading.
- Each level keeps its own progress. Level 0 shows learned sounds; Level 1 keeps
  its test progress. They are separate stores and separate progress bars.
- Level 0 is never part of the Level 1 summary and never a gate for starting the
  test.
- The topbar level chip becomes route-aware: «Уровень 0» inside Level 0,
  «Уровень 1» inside the test. The chip is still **not** a switcher; the switcher
  stays parked per `designs/00001 - Blue/design-spec.md` (both levels are visible
  on home anyway).

## 5. The sound model

**The unit of teaching is a sound (a grapheme), not a letter.** A card is keyed by
the thing the learner sees: `a`, `ß`, `sch`, `ei`, `ch`.

Card fields: tile text, group, Russian hint, one or two example words (German +
Russian), an optional warning note, an `easy` flag, an optional future audio path,
and 0–n drill items.

Three groups, rendered as three visual blocks on one screen:

1. **`letter`** — the 26 letters, 26 cards. Tile shows the pair (`Aa`, `Bb`, …).
2. **`special`** — `Ää Öö Üü ßß`, 4 cards. Umlauts and ß get their own block,
   not folded into A–Z, because they are new characters to a Cyrillic reader.
3. **`combo`** — letter combinations, 15 cards by default: `ch`, `sch`, `ei`,
   `ie`, `eu`, `äu`, `au`, `qu`, `ck`, `ng`, `tz`, `sp`, `st`, `-er`, `-chen`.
   The teacher may trim or extend this list; the validator treats it as content.

Total default: **45 cards**, of which **6 are easy** (`a e k m o t`) and therefore
count as learned from the first open. A fresh learner starts at «Выучено: 6 из 45».

Uppercase and lowercase are taught together. The tile shows the pair; the card
heading repeats it; the example words are ordinary lowercase text. This was a
deliberate choice: text these learners will read is almost all lowercase, but
alphabet charts everywhere else teach uppercase first, so both are shown at once
and neither is "the real one".

**Sounds only, no letter names.** The card teaches how the letter is read in words
(«B — это «б»»). German letter names (Be, Ce, De, Efe) are a spelling-aloud topic
and are parked.

### 5.1 The easy letters and the traps

Easy letters are flagged in the content file (`easy = true`), not in code. The
default list — А, Е, К, М, О, Т — was decided in the grill and is pre-filled by the
content ticket. The card for an easy sound shows the note (Russian template, the
letter substituted):

> «Это легко! Это та же буква, что и в русском — K!»

The `easy` flag means: learned from the start, no drill needed, excluded from the
mixed training. The card and its drills may still exist and may still be opened.

The opposite group — look-alike traps — is content, not a flag. Every trap is
explained in the card's `note`, and the validator does not manage the list. The
default traps to cover in the authored content:

- **B** looks like Cyrillic В, reads «б».
- **H** looks like Cyrillic Н, reads «х» (and is silent after a vowel).
- **P** looks like Cyrillic Р, reads «п».
- **C** looks like Cyrillic С, reads «ц» before e/i, «к» elsewhere.
- **У / Y** looks like Cyrillic У, is not «у» («ü»/«ю»/«й»).
- **X** looks like Cyrillic Х, reads «кс».
- **V** looks like Cyrillic В, reads «ф» in native words.
- **Z** looks like nothing in Cyrillic but Russian speakers expect «з», reads «ц».

## 6. Content: `content/alphabet.toml`

Content lives in a new file, `content/alphabet.toml`, separate from `test.toml`,
authored by the teacher in Zed, drafted with AI, reviewed by a human. The file
opens with a plain-language tutorial in the same voice as `test.toml` (German,
one idea at a time, real examples), then one block per sound.

### 6.1 TOML schema, with a complete example

```toml
# Eine Datei = der ganze Lese-Level. Ein Block = ein Laut/Zeichen.

[[sound]]
id = "sch"                 # slug, unique, [a-z0-9-], used in the URL
tile = "sch"               # what the tile and card heading show
group = "combo"            # "letter" | "special" | "combo"
easy = false               # true = same letter and sound as in Russian
hint = "«ш» — один звук, как в слове «школа»"
words = [
  { de = "Fisch", ru = "рыба" },
]
note = "Не «сх» и не «сч»."
audio = ""                 # later: "audio/sch.ogg"; empty = device speech

[[sound.drill]]
kind = "hint"              # case h: see grapheme, choose the sound in Russian
options = ["«ш»", "«х»", "«с»"]
answer = "«ш»"

[[sound.drill]]
kind = "pair"              # minimal pair: hear a word, choose the written word
say = "Fisch"
options = ["Fisch", "Fich"]
answer = "Fisch"
```

Rules the validator enforces (see 6.3):

- `id`: required, unique, matches `^[a-z0-9-]+$`, also usable as a URL fragment.
- `tile`: required, non-empty. By convention the pair for `letter` (`Aa`), the
  grapheme for `special`/`combo`.
- `group`: one of `letter`, `special`, `combo`.
- `hint`: required, non-empty.
- `words`: 1–2 entries, each `de` and `ru` non-empty.
- `note`: optional; one plain sentence; the card renders it as a warning block.
- `audio`: optional; if present, an existing file under `public/`.
- `easy`: optional boolean, default `false`.
- `drill`: optional array; each item is one of the five kinds (section 9).

### 6.2 Example drills per kind

```toml
[[sound.drill]]                     # 1. hear the word -> tap the grapheme
kind = "letter"
say = "Banane"
options = ["b", "d", "p"]
answer = "b"

[[sound.drill]]                     # 2. hear the word -> tap the written word
kind = "pair"
say = "Bein"
options = ["Bein", "Bien"]
answer = "Bein"

[[sound.drill]]                     # 3. see the grapheme -> tap the Russian sound
kind = "hint"
options = ["«ц»", "«з»", "«с»"]
answer = "«ц»"

[[sound.drill]]                     # 4. read the word -> tap the translation
kind = "meaning"
word = "Banane"
options = ["банан", "помидор", "яблоко"]
answer = "банан"
say = "Banane"                      # optional listen button

[[sound.drill]]                     # 5. read the word -> tap the picture
kind = "picture"
word = "Tomate"
options = ["img/food-tomate.webp", "img/food-kuchen.webp", "img/food-paprika.webp"]
answer = "img/food-tomate.webp"
```

Picture options may only point at files that already exist under `public/`. In v0
that is the four Level 1 food photos (`img/food-fisch.webp`, `img/food-kuchen.webp`,
`img/food-paprika.webp`, `img/food-tomate.webp`). No new images, no emoji.

### 6.3 Validation rules (new `validateAlphabet`, wired into both scripts)

`bun run check` and `bun run build` must fail on a broken alphabet file, with the
same plain-language messages the test validator uses.

Error when:

- `id` missing, duplicated, or not `[a-z0-9-]`.
- `tile`, `hint` missing/empty.
- `group` not one of `letter` / `special` / `combo`.
- `words` empty, more than two, or a missing `de`/`ru`.
- `audio` set and the file is missing from `public/`.
- `easy = true` on a `combo` or `special` sound (the concept is letters).
- A drill item: unknown `kind`; `options` fewer than two or with duplicates;
  `answer` missing or not among `options`; `say` missing on `letter`/`pair`;
  `word` missing on `meaning`/`picture`; `pair` with more or fewer than two
  options; `picture` option that is not `img/...` or not found in `public/`.
- The alphabet has no `sound` blocks at all.

Warn when:

- A `letter` group is missing one of `a`–`z` (the reference should be complete).
- Two sounds share a `tile`.
- A non-easy sound has no drills (it can then only be learned via self-mark).

`scripts/check-content.ts` prints a summary line, e.g.
`All good: 36 questions in 6 sections, 25 countries, 45 sounds (26 letters, 4 special, 15 combos).`

### 6.4 Build pipeline

`scripts/build-content.ts` parses `content/alphabet.toml` in addition to the test
files and adds one key to `src/generated/content.json`:

```jsonc
{
  "test": { … },            // unchanged
  "sections": [ … ],        // unchanged
  "alphabet": {
    "sounds": [
      {
        "id": "sch",
        "tile": "sch",
        "group": "combo",
        "easy": false,
        "hint": "…",
        "words": [{ "de": "Fisch", "ru": "рыба" }],
        "note": "…",
        "audio": "",
        "drills": [
          { "kind": "hint", "options": ["…"], "answer": "…" }
        ]
      }
    ]
  }
}
```

Level 1 consumers of `content.json` are untouched. New TypeScript types go to
`src/lib/content/types.ts`: `SoundGroup`, `SoundCard`, `SoundWord`, `DrillItem`,
`DrillKind`, `CompiledAlphabet`. The raw TOML shape (`RawSound`) lives next to
them and is only used by scripts and the validator.

### 6.5 The authoring ticket

The 45 cards are authored as AI draft + teacher review, in the ticket that
follows the schema work. Appendix A is the agreed starting content: hints, words
and notes for every card. The teacher may change any of it; the spec fixes the
system, not the final wording.

## 7. Progress

### 7.1 States

Per sound, exactly one of:

- **не начато** — nothing happened.
- **начато** — the card was opened at least once.
- **выучено** — one of: `easy = true`; every renderable drill item of this sound
  was answered correctly at least once; or the learner pressed «Я это выучил».

Note the third path is manual on purpose: some learners will already read some
letters and should not be forced through drills to prove it. Toggling
«Я это выучил» off removes it again, unless the drills (or `easy`) say otherwise.

### 7.2 Storage

The Level 1 store is untouched. Level 0 gets its own localStorage key:

```
spikygerman:alphabet:v1
```

Shape:

```ts
interface AlphabetProgress {
  opened: string[];     // sound ids whose card was opened
  passed: string[];     // drill item ids answered correctly at least once
  selfMarked: string[]; // sound ids marked with «Я это выучил»
}
```

Drill item id is `${soundId}:${index}` (index = position in the TOML array). If
the teacher reorders or removes drill items of a sound, that sound's drill
progress is lost; acceptable in v0, documented here so nobody reports it as a bug.

`easy` is **derived** from the content every time, never stored. If the teacher
flips a flag later, progress follows, and a fresh learner starts at 6/45.

Learned is derived too:

```
learned(sound) =
  sound.easy ||
  selfMarked.has(sound.id) ||
  renderableDrills(sound).every(item => passed.has(item.id))
```

`renderableDrills` excludes audio-only kinds when the device has no German voice
(section 10) — otherwise those learners could never reach «выучено».

A new module stores and derives this: `src/lib/alphabet/state.svelte.ts`, with
functions `markOpened(id)`, `markItemPassed(id)`, `toggleSelfMarked(id)`,
`isOpened(id)`, `isLearned(sound, speechAvailable)`, `learnedCount()`,
`resetAlphabet()`. The existing `resetAll()` on the home screen clears both stores
(the confirm text stays generic).

## 8. Screens, routes and states

### 8.1 Routes

| Hash | Shows |
| --- | --- |
| `#/l0` | Level 0 chart, no sheet |
| `#/l0/<sound-id>` | chart + that sound's card sheet |
| `#/l0/<sound-id>/drill` | chart + that sound's drill sheet |
| `#/l0/train` | chart + training sheet |

`parseHash` gets three new route shapes: `{ name: "level0" }`,
`{ name: "level0-sound"; id: string; drill?: boolean }`,
`{ name: "level0-train" }`. Order of parsing matters: `#/l0/train` must be matched
before `#/l0/<id>`. An unknown sound id renders the chart with no sheet (and the
URL is left alone; correcting it is not a v0 concern).

Why routes for sheets: on a phone the back gesture must close a card and return to
the chart, and the teacher can deep-link a single sound during a lesson.

### 8.2 Home

Two level tiles, stacked, Level 0 first:

- **Level 0 tile** — a link (not an expander) to `#/l0`:
  «Уровень 0 · Учимся читать · 45 карточек»
  Under it the shared `.lvl-progress` block: the existing `ProgressBar` with one
  segment (learned / total) and the text «Выучено: 6 из 45», `role="status"`.
- **Level 1 tile** — exactly as today: expander with six sections and its own
  progress block.
- The reset button stays where it is and clears both levels.

### 8.3 Level 0 chart (`#/l0`)

One screen, three blocks in order:

1. **Буквы** — grid of 26 letter tiles, A–Z order, tile shows the pair (`Aa`).
2. **Особые буквы** — `Ää Öö Üü ßß`, same tile style.
3. **Сочетания** — the combo tiles (`sch`, `ei`, …), same tile style.

Each tile is a real `<button>`, minimum 64×64 (comfortably above the 44 px
guideline), showing the tile text and a state mark that is never colour alone:
✓ when learned, a lighter dot/ring when started, nothing when untouched. The
screen reader label announces letter and state («sch, сочетание, выучено»).

Above the blocks, one short Russian instruction (to be drafted by the designer
from the strings in Appendix B) that says what to do: tap a letter to open its
card. No audio plays from tiles.

### 8.4 Sound card sheet (`#/l0/<id>`)

A modal sheet over the chart (bottom sheet on phones; dialog on wider screens).
Contents, in order:

1. Big pair/grapheme (for example `Bb`), plus the state word
   («не начато» / «начато» / «выучено»).
2. Hint line: «Как читается: «б»».
3. For easy sounds, the easy note instead of a generic tone:
   «Это легко! Это та же буква, что и в русском — B!»
4. Example words: each `de` word in a large tappable row with a listen button
   («Послушать: Banane»), its Russian translation beneath. 1–2 words.
5. `note`, if present, as a warning block (traps: «Внимание: …»).
6. Buttons: «Проверить себя» (goes to `#/l0/<id>/drill`), «Я это выучил» as a
   toggle (pressed state visible and announced), «Закрыть».
7. If there is no German voice on the device, the listen buttons are replaced by
   one muted note (section 10.3).

Opening the sheet marks the sound as **начато**.

### 8.5 Drill sheet (`#/l0/<id>/drill`)

Same overlay pattern. One item at a time:

- The prompt for the kind (Appendix B strings).
- The item body: big options as real buttons (graphemes, words, translations or
  photos depending on kind); a listen button for audio kinds.
- Instant feedback: tapping an option immediately shows Верно / Почти. Correct
  answers lock the item and advance after a short beat; wrong answers stay,
  show the correct option marked, and let the learner tap again (the item stays
  open until answered correctly — retries are unlimited and unpunished).
- A quiet counter «Задание 2 из 4» and a «Закрыть» button.
- When the last renderable item is correct: «Отлично! Все задания выполнены.»,
  and the sound is learned if its condition is met.

The hint from the card is deliberately **not** shown inside its own drill —
practice is recall.

### 8.6 Training sheet (`#/l0/train`)

Mixed practice over the whole alphabet:

- The queue contains every renderable drill item of every non-easy sound, in
  random order. Wrong answers go back to the end of the queue. Passing an item
  here counts exactly like passing it on the card.
- The counter shows «Осталось: N».
- The session ends when the queue is empty: «Тренировка завершена», the counts of
  this run (верно / с ошибкой), «Ещё раз», «К буквам».
- Training never includes `easy` sounds, and never asks about sounds that have no
  renderable items on this device.

### 8.7 Empty and edge states

- No German voice: listen buttons gone, audio-only drills skipped, one note on
  the affected sheets (section 10.3). The level must stay fully usable.
- Zero drills on a sound: the drill button opens a sheet saying there is nothing
  to practise yet (an authoring gap, not a learner error) — text in Appendix B.
- Deep link to an unknown sound id: chart, no sheet.
- All 45 learned: Level 0 home text reads «Выучено: 45 из 45», nothing else
  happens — no confetti, no certificate (parked).
- localStorage unavailable/full: the level works for the session, same as
  Level 1.

## 9. Drills

Five item kinds. All answering is by tapping; nothing is typed in Level 0 (typing
belongs to Level 1; this level teaches reading, not spelling).

| Kind | Shows | Plays | Learner taps | Audio needed |
| --- | --- | --- | --- | --- |
| `letter` | prompt + grapheme options | the `say` word | the grapheme the word starts with | yes |
| `pair` | two similar-looking words | one of them | the word that was spoken | yes |
| `hint` | the grapheme | nothing | the Russian sound description | no |
| `meaning` | the `word` | optional listen button | the Russian translation | no |
| `picture` | the `word` | optional listen button | the matching photo | no |

Two of the five need device speech to exist at all (`letter`, `pair`); on a device
without a German voice they are skipped everywhere (card drill, training,
completion). The remaining three are fully usable in silence, which is what keeps
the level honest when TTS fails.

Feedback wording follows Level 1's spirit but never blocks: «Верно» on the first
tap of the right option; «Почти! Правильно: …» when a wrong option is tapped, with
the correct option marked in place; the item stays until it is right. Correct and
wrong are distinguished by icon + text, not only colour.

Completion rule for a sound: every item that is renderable on this device has been
answered correctly at least once (`passed` set in 7.2). A sound with no renderable
items cannot be learned by drills; self-mark and `easy` still work.

## 10. Audio

### 10.1 The decision

Audio is what makes this level teach pronunciation rather than theory, and the
grill decided to use **browser speech synthesis (TTS) as the stopgap**: no audio
files, works today, replaceable later. The card's listen button was requested by
the teacher from the start («in the future, will have an audio button, which would
pronounce the word»); TTS delivers that now, recordings will deliver it better.

### 10.2 Module behaviour

New module `src/lib/speech.ts`:

- `speechSupported()` — `"speechSynthesis" in window`.
- `germanVoice()` — first voice whose `lang` starts with `de`, preferring an exact
  `de-DE` and a local/offline voice. Voice lists on some browsers arrive late, so
  the module listens for `voiceschanged` and exposes availability reactively.
- `speakGerman(text, { rate = 0.85 })` — cancels any current utterance, speaks
  `text` with `lang = "de-DE"` and the chosen voice. Never autoplays: only a user
  tap calls it. Leaving a sheet or a route cancels speech.
- The module never speaks a bare phoneme. TTS saying «ch» or «ei» produces letter
  names or garbage; the listening button always speaks a **word** (`words[].de` or
  the drill's `say`).

### 10.3 No German voice

If the device has no German voice (or no speech synthesis at all): listen buttons
are not rendered, audio-only drill kinds are skipped, and the card shows
«На этом устройстве нет немецкого голоса. Включите его в настройках телефона.»
One muted line, no error styling. This is exactly what the audio-required
filtering in sections 7.2 and 9 depends on.

### 10.4 Recordings later

Every sound card has an `audio` field, empty today. When recordings exist, the
listen button plays the file when `audio` is set and falls back to TTS otherwise —
a card-by-card replacement, no code change, no schema change. Recordings stay
committed like the images and require no backend.

## 11. Accessibility

Level 0 inherits the project's bar: usable with VoiceOver on iOS and TalkBack on
Android, on a phone, before anything else.

- Chart is a `<ul>` of `<li><button>`; each button carries the visible tile plus a
  screen-reader-only state and type («sch, сочетание, выучено»). State is never
  conveyed by colour alone.
- Sheets are proper dialogs: `role="dialog"`, `aria-modal="true"`, labelled by the
  card heading; focus moves to the heading on open and returns to the tile on
  close; Escape closes; the backdrop is tappable but is not the only way out (a
  real «Закрыть» button exists).
- Feedback for a drill item sits in a `role="status"` live region, like Level 1's
  `Feedback.svelte`.
- Listen buttons have full labels («Послушать: Banane»), so a screen reader user
  knows what will be spoken before tapping.
- Screen reader speech and TTS speech can overlap; the level does not try to
  detect that. It is a known limitation, noted here so it is not reported as a bug.
- No hover-only, drag-only or timing-based interaction. Tap targets at least
  44×44, tiles 64×64. Animations respect `prefers-reduced-motion`.
- Theme: dark mode must be complete, using the existing token set in `src/app.css`.
- Keyboard: all tiles, options and buttons reachable with Tab; Enter/Space
  activate; the Level 1 global Enter handler does not interfere with sheets.

## 12. Design requirements (for the design pass)

The design pass happens **before** the build tickets, in the existing design
language, and produces annotated screens the developer implements literally.

Screens to draw, each in light and dark, at 390×844 and one wider view:

1. **Home** — Level 0 tile + progress block above the Level 1 tile; collapsed and
   expanded Level 1 states unchanged.
2. **Level 0 chart** — three blocks (Буквы / Особые буквы / Сочетания) with tile
   states: untouched, начато, выучено, easy (learned from the start — visually it
   may share the learned state; if it gets its own treatment, it must still be
   colour-blind safe).
3. **Sound card sheet** — normal card, easy card, card with a trap note, card
   without a German voice, each with all buttons in default/pressed states.
4. **Drill sheet** — one frame per item kind (five), correct state, wrong state,
   completed state, counter.
5. **Training sheet** — running state, empty state at the end, no-voice variant.
6. **Topbar on Level 0 screens** — chip «Уровень 0» and the Level 0 progress line
   instead of the test counts.

Annotation requirements for the developer:

- Exact strings from Appendix B, no designer-invented copy.
- Tap sizes, spacing, focus rings, and behaviour of sheets (height, scroll, close).
- Which existing component visuals are reused: `ProgressBar` (single segment for
  Level 0), buttons, `.lvl-progress`, topbar, tabbar.
- What is parked: level switcher chip, mascots, confetti, recordings UI.

Suggested folder, following the existing convention: `designs/00004 – Level 0 – Reading/`
with the screen files and a `design-spec.md` that records any decisions the design
adds. If the design contradicts this spec, this spec changes first.

## 13. Reuse map

| Piece | What happens |
| --- | --- |
| `ProgressBar.svelte` | reused as-is; Level 0 passes one segment (learned / total) |
| `ProgressRing.svelte` | not used in v0 (it visualises correct/almost/incorrect) |
| `Feedback.svelte` | not reused (question-shaped); drills get a small own component in the same visual language |
| `state.svelte.ts` (Level 1) | untouched; `resetAll()` additionally calls `resetAlphabet()` |
| `content.ts` (`t`, `format`) | reused; new strings keyed in `strings.ru.toml` under `[ui]` and `[l0]` |
| `validate.ts`, `build-content.ts`, `check-content.ts` | extended, existing behaviour unchanged |
| `routing.ts`, `App.svelte`, `TopBar.svelte`, `TabBar.svelte` | extended with Level 0 routes and level-aware progress/chip |
| `public/img/*` | the four food photos reused by `picture` drills; no new assets |
| `app.css` tokens | reused; Level 0 adds no new colour system |

New components, suggested names: `AlphabetView.svelte` (chart + blocks),
`SoundTile.svelte`, `SoundCard.svelte` (sheet), `SoundDrill.svelte`,
`TrainingView.svelte`, plus `src/lib/alphabet/state.svelte.ts` and
`src/lib/speech.ts`.

## 14. Testing

Unit (vitest, `tests/`):

- `alphabet-content.test.ts` — every validation rule in 6.3, error and warning
  paths, the happy path with the real file.
- `alphabet-progress.test.ts` — load/save with malformed JSON, easy derived not
  stored, self-mark on/off, all-items-passed learns a sound, audio-only items
  excluded when speech is unavailable, reset clears only Level 0.
- `drills.test.ts` — answer checking per kind, retry keeps item open, training
  queue requeues wrong items to the end, queue excludes easy and unrenderable
  items, run counts, empty queue finishes.
- `routing.test.ts` (extended) — the four hashes, `train` matched before an id,
  unknown id falls back to the chart, existing routes untouched.

Manual, on a phone, before done:

- 390×844, light and dark: the six screens from section 12 at real size, no
  horizontal overflow.
- VoiceOver (iOS) and TalkBack (Android): open a tile, hear the card, play a word,
  run one drill, finish training, return and find the state persisted.
- A device/browser without a German voice: no listen buttons anywhere, no
  audio-only drill, the level still completes.
- Offline after first load; reload with storage disabled.
- `bun run typecheck`, `bun test`, `bun run check`, `bun run build` all pass.

## 15. Out of scope for v0

- Letter names (Be, Ce, De) and spelling aloud.
- Writing/typing/tracing the letters; all answering is tapping.
- Recorded audio files (the `audio` field is the hook; TTS is the audio).
- Numbers and dates.
- An adaptive repetition algorithm beyond the training queue's wrong-answer
  requeue.
- Blind-specific alphabet methodology beyond correct semantics and audio.
- Mascots, celebration animation, certificates.
- The level switcher chip (parked with the designs).
- Emoji or new images as drill options.

## 16. Parked, worth revisiting

- Record the 45 cards in German (letter sound + words) and drop TTS card by card.
- Level switcher in the topbar chip once a third level exists.
- «Повторить ошибки» for Level 0 (same topic that Level 1 parked).
- A «Звуки вокруг» practice mode using street signs and products.
- Ukrainian interface (`strings.uk.toml`) — this level is the one where it matters
  most for the current classroom.

## 17. Ticket breakdown (for the engineering manager)

Suggested folder `docs/tickets/level-0/`, same file shape as
`docs/tickets/blue-redesign/`: title, what to build, design source of truth,
blocked by, status, checklist. Order and dependencies:

1. **Design pass — Level 0 screens.** Draw section 12 in the existing language;
   deliver `designs/00004 – Level 0 – Reading/`. No code.
   *Done when:* designer, teacher and the Level 1 developer have reviewed the
   screens and any spec contradictions are fixed in this file.
2. **Alphabet content model, validator, build.** `content/alphabet.toml` skeleton
   with the tutorial header and 2–3 example sounds; types; `validateAlphabet`;
   both scripts; summary line; `alphabet-content.test.ts`.
   *Blocked by:* 1 (not strictly, but keeps naming stable).
   *Done when:* `bun run check` fails helpfully on every rule in 6.3, passes on the
   real file, `content.json` carries `alphabet`, `bun test` and `typecheck` pass.
3. **Speech module.** `src/lib/speech.ts` per section 10, including late voice
   lists and the no-voice state; unit tests with mocked `speechSynthesis`.
   *Done when:* availability is reactive, `speakGerman` cancels prior speech, a
   bare phoneme has no code path.
4. **Level 0 progress store.** `src/lib/alphabet/state.svelte.ts` per 7.2, plus
   `resetAll()` integration; `alphabet-progress.test.ts`.
   *Done when:* derivation matches the formula in 7.2, storage failures degrade
   silently, Level 1 progress is untouched by reset except being cleared as before.
5. **Home, topbar, tabbar, routing.** Level 0 tile with progress, route-aware
   chip, «Продолжить» behaviour on Level 0 routes (next not-learned sound, or
   `#/l0` when all are learned), new hashes; routing tests.
   *Done when:* both levels coexist on home, back/forward work, no Level 1
   regression (`bun test` green).
6. **Level 0 chart.** Three blocks, tile states, sheet routing on tap, a11y
   semantics of the grid, empty and unknown-id fallbacks.
   *Done when:* tapping a tile opens the card route; state marks are
   screen-reader-correct; phone visual check passes.
7. **Sound card sheet.** Layout from the design, hint/words/note/easy note, state
   chip, listen buttons with no-voice fallback, self-mark toggle, «Проверить
   себя» entry.
   *Done when:* opening marks начато, self-mark toggles learned, TTS speaks the
   word, no-voice note appears instead of buttons.
8. **Drills.** All five kinds, instant feedback, retries, completion rule,
   `drills.test.ts`.
   *Done when:* every kind renders and checks, audio-only kinds skip cleanly
   without voice, completing all items learns the sound.
9. **Training.** Queue, requeue on wrong, counter, finish state, `Ещё раз`.
   *Done when:* queue excludes easy and unrenderable items, passes count toward
   learned, finishing and restarting works.
10. **Author the 45 cards.** AI draft from Appendix A + teacher review of every
    hint, word and note; drills authored per sound (2–4 items, mixing kinds);
    `easy = true` on `a e k m o t`.
    *Done when:* the teacher has read every card aloud in class terms, `bun run
    check` passes, and a native speaker has sanity-checked the hints.
11. **Accessibility and phone pass, docs.** Run section 14's manual checklist on
    the real devices; fix findings; add screenshots to `README.md`; note the level
    in `README.md` values and the values section's «transliteration and
    click-to-pronounce audio are planned» line (partly delivered now).

Parallelisation: 2–4 are independent of each other; 5–9 depend on 2–4; 10 depends
on 2 only and can run in parallel with 5–9; 11 is last.

## 18. Decision log

### Grill 2 — 15 September 2026

The session started from the teacher's request:

> "In the group of refugees, some people can't read German/Latin letters and they
> don't know the letters or letter combinations sound. In order to help them learn,
> I would like to introduce a new level which is Уровень 0 – Учимся читать. It
> should come before Уровень 1. […] I foresee an alphabet with clickable letters.
> When a person clicks a letter, we open a pop-up card that explains how to read
> it, gives an example word and, in the future, will have an audio button, which
> would pronounce the word."

Decisions, in the order they were made:

1. **Who it is for:** learners read Russian confidently; only the Latin mapping is
   missing. Russian text, instructions and hints are allowed to carry the level.
2. **Audio:** browser TTS as the stopgap; recordings later, card by card, behind the
   `audio` field. No audio files in v0.
3. **Unit of teaching:** sounds, including the letter combinations that actually
   break Russian readers — not a letters-only alphabet.
4. **Shape:** a reference chart **plus** practice, not a passive poster.
5. **Place in the app:** its own level, own progress, placed before Level 1; the
   level shows which sounds are already learned; it is not the test and not a gate.
6. **Order on screen:** a plain A–Z chart with checkmarks (not similarity groups).
7. **Learned means:** «both signals» — card opened is начато; drill passed or
   «Я это выучил» is выучено.
8. **Easy letters:** letters that match Russian are marked done automatically and
   their card says «Это легко! Это та же буква, что и в русском — K!». The flag is
   authored in TOML (pre-filled by AI with A, E, K, M, O, T for review), not
   hardcoded.
9. **Drills:** a combination of all four shapes — word→letter/picture,
   minimal pairs, letter→Russian sound, word→meaning. Written up as five kinds in
   section 9 (word→letter and word→picture are separate renderings).
10. **Where drills live:** from the card («Проверить себя») and as one mixed
    training screen; wrong answers come back.
11. **Strictness:** instant feedback with unlimited retries, not a test-style check.
12. **Content file:** `content/alphabet.toml`, separate from `test.toml`, teacher
    editable, checked by `bun run check`.
13. **Sounds only:** no German letter names in v0.
14. **Case:** uppercase and lowercase taught together — tiles show pairs (`Aa`).

Project-process decisions made the same day:

15. Specs get their own directory, `docs/specs/`, one file per level. This is the
    first. `docs/context.md` freezes as the Level 1 journal; it can move to
    `docs/journal/grill-01.md` later without splitting its story.

## Appendix A — Draft card content (45 cards)

Starting point for ticket 10. Hints are Russian, words are German with Russian
translations, Level 1 vocabulary is preferred. `*` marks the easy letters.

### Letters (26)

| id | tile | hint | words | note |
| --- | --- | --- | --- | --- |
| a * | Aa | «а» | Banane — банан | |
| b | Bb | «б» | Banane — банан | Заглавная B похожа на русскую В, но читается «б»! |
| c | Cc | «ц» перед e, i; «к» в остальных словах | Cent — цент | Чаще всего в заимствованиях. |
| d | Dd | «д» | Deutschland — Германия | |
| e * | Ee | «э» | Eier — яйца | В конце слова звучит слабо, почти как безударное «э» (Banane). |
| f | Ff | «ф» | Fisch — рыба | |
| g | Gg | «г» | gern — охотно | В конце слова как «к» (Tag). |
| h | Hh | «х» | Herr — господин | После гласной не читается, а тянет её (wohnen, heißen). |
| i | Ii | «и» | Fisch — рыба | |
| j | Jj | «й» | Joghurt — йогурт | |
| k * | Kk | «к» | Kuchen — пирог | |
| l | Ll | «л» | Milch — молоко | |
| m * | Mm | «м» | Milch — молоко | |
| n | Nn | «н» | Banane — банан | |
| o * | Oo | «о» | Tomate — помидор | |
| p | Pp | «п» | Paprika — перец | Заглавная P похожа на русскую Р, но читается «п»! |
| q | Qq | «к», только в сочетании qu — «кв» | Quelle — источник | Без u почти не встречается. |
| r | Rr | «р», но гортанный, не раскатистый | Brötchen — булочка | После гласной на конце почти «а» (Vater). |
| s | Ss | «з» перед гласной, «с» на конце и перед согласной | sie — она | В начале перед p, t — «ш» (см. sp, st). |
| t * | Tt | «т» | Tomate — помидор | |
| u | Uu | «у» | Kuchen — пирог | |
| v | Vv | «ф» | viel — много | В заимствованиях бывает «в» (Vase). Заглавная V похожа на русскую В! |
| w | Ww | «в» | wohnen — жить | |
| x | Xx | «кс» | Text — текст | Похожа на русскую Х, но это «кс». |
| y | Yy | «ü»/«ю», иногда «й» | Typ — тип | Похожа на русскую У, но «у» не читается! |
| z | Zz | «ц» | Zucker — сахар | Не «з»! |

### Special letters (4)

| id | tile | hint | words | note |
| --- | --- | --- | --- | --- |
| ae | Ää | «э» | Äpfel — яблоки | Не «я»! |
| oe | Öö | губы как «о», язык как «э» | möchte — хотел бы | Точного русского звука нет; не «ё». |
| ue | Üü | губы как «у», язык как «и» | müde — усталый | Точного русского звука нет; не «у» и не «ю». |
| ss | ßß | «с» | heiße — зовусь | Никогда не в начале слова. |

Ids for specials are ASCII on purpose (`ae`, `oe`, `ue`, `ss`) because ids become
URL fragments; the tile carries the real character.

### Combinations (15)

| id | tile | hint | words | note |
| --- | --- | --- | --- | --- |
| ch | ch | «х» после a, o, u; мягкое «хь» после e, i, ä, ö, ü | Kuchen — пирог; Milch — молоко | Два разных звука; в начале слова иногда «к» (Chaos), в заимствованиях «ш» (Chef). |
| sch | sch | «ш» | Fisch — рыба | Не «сх» и не «сч»! |
| ei | ei | «ай» | Ei — яйцо | Не «ей»! |
| ie | ie | долгое «и» | sie — она | Просто «и», а не «ие». |
| eu | eu | «ой» | Euro — евро | Не «эу»! |
| aeu | äu | «ой» | Häuser — дома | Звучит так же, как eu. |
| au | au | «ау» | brauchen — нуждаться | Обе буквы читаются. |
| qu | qu | «кв» | Quelle — источник | q только с u. |
| ck | ck | «к» | Zucker — сахар | То же, что kk. |
| ng | ng | носовое «н» | Wohnung — квартира | «г» отдельно не произносится. |
| tz | tz | «ц» | Katze — кошка | Коротко после гласной. |
| sp | sp | «шп» в начале слова, «сп» внутри | sprechen — говорить | В начале слова «ш», не «с»! |
| st | st | «шт» в начале слова, «ст» внутри | Straße — улица | ist — «ист», но Stunde — «штунде». |
| er | -er | на конце слова почти «а» | Vater — отец | На конце не «эр». |
| chen | -chen | «хьен» | Brötchen — булочка | Частый уменьшительный суффикс. |

## Appendix B — New strings for `strings.ru.toml`

To be written under `[ui]` (existing section) unless noted. The designer works from
these exact texts; the teacher may reword them, the developer takes them from the
file.

```toml
# Level 0 — home and shell
level_chip_0 = "Уровень 0"
level0_summary = "Уровень 0 · Учимся читать · {sounds} карточек"
level0_learned = "Выучено: {learned} из {total}"
level0_open = "Как это читается?"

# Chart
level0_title = "Учимся читать"
level0_intro = "Нажмите на букву или сочетание, чтобы открыть карточку."
level0_letters = "Буквы"
level0_special = "Особые буквы"
level0_combos = "Сочетания"
level0_state_new = "не начато"
level0_state_started = "начато"
level0_state_learned = "выучено"
level0_tile_label = "{sound}, открыть карточку"

# Card sheet
card_hint_label = "Как читается"
card_words_label = "Примеры"
card_listen = "Послушать: {word}"
card_easy_note = "Это легко! Это та же буква, что и в русском — {letter}!"
card_practise = "Проверить себя"
card_self_mark = "Я это выучил"
card_close = "Закрыть"
card_no_drills = "Для этого звука пока нет заданий."
tts_missing = "На этом устройстве нет немецкого голоса. Включите его в настройках телефона."

# Drills
drill_prompt_letter = "Послушайте слово и выберите букву, с которой оно начинается."
drill_prompt_pair = "Послушайте и выберите слово."
drill_prompt_hint = "Как это читается?"
drill_prompt_meaning = "Что это значит?"
drill_prompt_picture = "Прочитайте и выберите картинку."
drill_counter = "Задание {n} из {total}"
drill_correct = "Верно"
drill_almost = "Почти! Правильно: {answer}"
drill_done = "Отлично! Все задания выполнены."

# Training
train_title = "Тренировка"
train_remaining = "Осталось: {n}"
train_done = "Тренировка завершена"
train_score = "Верно: {correct}, с ошибкой: {wrong}"
train_again = "Ещё раз"
train_back = "К буквам"
```
