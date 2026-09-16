# Level 1 audio — hear the German

**Status:** draft, ready for a ticket.
**Source of decisions:** Grill 2.1, 15 September 2026.
**Relation to other docs:** this is a Level 1 feature spec. Level 0
(`docs/specs/level-0-reading.md`) reuses the same speech module; once the module
exists, Level 0's section 10.2 shrinks to a pointer at this file and its speech
ticket becomes wiring, not building.

## How to use this document

- **Designer.** Section 6 lists the one new control and its states. It is small on
  purpose; if it is worth a design addendum, draw it once and the three placements
  follow.
- **Engineering manager.** One ticket, at the bottom. No dependencies on Level 0.
- **Developer.** Sections 4–7 are the module, the text preparation and the
  integration points; section 9 is the tests.

## 1. Why

Two groups get real value:

- **Learners who read Russian but not Latin script.** Level 1 asks them to write
  German sentences; hearing the question read out loud is the difference between
  a task and a wall.
- **Blind learners.** Their screen reader reads German with a Russian voice,
  mangling pronunciation. Tapping a button that speaks with a German voice is the
  only way they can hear the sentences correctly.

This reverses one line in the frozen Level 1 journal (`docs/context.md` §13, "no
text-to-speech in the MVP"). The reversal is **playback only**: no recording, no
uploads, no dictation. Q12 stays skipped.

## 2. What gets a speaker button

Exactly three things, each with a rule:

| Where | Rule | Coverage today |
| --- | --- | --- |
| The question's German `ask` | button only if the ask is a plain sentence: no `___`, and `type != "translate"` | 17 of 36 questions (q01–05, q13–16, q18–21, q22–25) |
| The example block, where the text is German (`german = true`) | the section examples get it; translate-type examples are Russian and stay silent | 6 section examples |
| The model answer inside Feedback, next to `model_answer` | shown wherever Feedback shows the model, i.e. `status != "empty"`; it is German for every question type | all 36 questions |

Deliberately silent:

- Gaps and choice asks with blanks: `Herr Meier, woher ___ ___?`,
  `___ Käse ist gelb.`, `Ich ___ (sein) müde.` — TTS would read a sentence that
  does not exist. The section example carries the audio for those sections.
- The two translation asks (`Нам нужны перец, яйца и рыба.`) — Russian, the screen
  reader already reads them well.
- The Russian question examples of q17 and q40.

The decide-what-to-speak logic is a pure function, `speakableAsk(question)`, so
the rule above is testable and identical everywhere.

## 3. Behaviour

- **Tap only, never autoplay.** Nothing speaks on page load, focus, scroll or
  check. This respects browsers, saves battery, and avoids fighting the screen
  reader.
- **One utterance at a time.** Starting any speech cancels the previous one and
  cancels the browser queue.
- **Navigation stops speech.** Changing the route (hash change) calls
  `stopGerman()`. A sentence must not follow the learner to another screen.
- **Second tap stops.** While a button is speaking, tapping it again stops and
  returns it to idle.
- **No German voice, no buttons.** If the device has no `de-*` voice (or no
  `speechSynthesis` at all), no speaker button renders anywhere. Level 1 stays
  exactly as it is today; nothing else changes for that learner.
- **Rate** 0.85, `lang = "de-DE"`. Slow enough for beginners, not robotic.
- **Failure is silent.** If an utterance errors, the button returns to idle; no
  error message, no console noise.

## 4. The module: `src/lib/speech.ts`

A plain `.ts` module so vitest runs it in the node environment. Everything is
guarded behind `typeof globalThis !== "undefined"` checks, because the test
environment has no `window`, and `globalThis.speechSynthesis` is where the browser
exposes it anyway.

API:

```ts
export function speechSupported(): boolean;
// "speechSynthesis" in globalThis && "SpeechSynthesisUtterance" in globalThis

export function hasGermanVoice(): boolean;
// true when germanVoice() is not null

export function germanVoice(): SpeechSynthesisVoice | null;
// first voice whose lang starts with "de", preferring:
//   1. exact "de-DE" over "de-AT"/"de-CH"
//   2. localService === true over network voices

export function onVoicesChanged(callback: () => void): () => void;
// subscribes to the speechSynthesis "voiceschanged" event, returns unsubscribe.
// Needed because Chrome populates getVoices() asynchronously; the button appears
// when the voice list arrives, not only at first render.

export function speakGerman(text: string): void;
// cleans nothing; caller passes text that is meant to be spoken.
// cancels any current utterance, then speaks with lang = "de-DE" and rate 0.85.

export function stopGerman(): void;

export function isSpeaking(): boolean;

export function onSpeakingChange(callback: (speaking: boolean) => void): () => void;
// lets SpeakButton render idle/playing without polling.
```

Pure helpers in the same module, both unit-tested:

```ts
export function cleanForSpeech(text: string): string;
export function speakableAsk(question: Question): string | null;
```

`speakableAsk` returns `cleanForSpeech(question.ask)` or `null` when
`question.type === "translate"` or the raw ask contains `___`.

## 5. Preparing text to speak

Content is written for reading; some of it must not reach a voice unchanged. The
rules, fixed by example so tests can assert them:

| Input | Spoken as |
| --- | --- |
| `Herr Meier, woher ___ ___?` | never spoken — skipped before cleaning |
| `Ich ___ (sein) müde.` | never spoken — skipped before cleaning |
| `Hunger (haben) → Ich habe Hunger.` | `Hunger. Ich habe Hunger.` |
| `Wie heißen Sie? — Ich heiße Anna.` | `Wie heißen Sie? Ich heiße Anna.` |
| `Ja, wir haben Milch. / Nein, wir haben keine Milch.` | `Ja, wir haben Milch. Nein, wir haben keine Milch.` |

Rules behind the examples:

1. Remove parenthesised annotations: `(haben)`, `(она)`.
2. Replace separators `→`, `—`, `–`, ` / ` with a sentence break.
3. Collapse duplicate punctuation that step 2 can create
   (`?.` → `?`, `..` → `.`, `, .` → `.`).
4. Collapse whitespace, trim.

`cleanForSpeech` is idempotent: cleaning an already clean sentence changes nothing.
The model answer never contains blanks or annotations, but the same function runs
on it anyway so there is one path.

## 6. The control: `SpeakButton.svelte`

- One icon button, minimum 44×44. Icon: a speaker; while speaking it becomes a
  stop icon (or the same speaker with a visible playing state — designer's call,
  but the state must not be colour-only).
- Visible: always rendered where a button is allowed and speech is available; no
  text label on the button itself, the surrounding sentence is the label.
- Accessible name, Russian, from `strings.ru.toml`:
  - idle, next to the ask: `speak_question = "Прослушать вопрос"`
  - idle, in an example: `speak_example = "Прослушать пример"`
  - idle, next to the model: `speak_model = "Прослушать правильный ответ"`
  - while speaking, all three: `speak_stop = "Остановить"`
- The name does not repeat the sentence, so screen reader users are not read a
  long duplicate.
- No `aria-live`: the button state change is enough; announcements would talk over
  the German voice.
- Keyboard: standard button, Enter and Space work; the global Enter-to-check
  handler in `App.svelte` already ignores events whose target is a button.

Design note: reuse the existing icon-button styling and dark-mode tokens. If the
designer prefers, fold the states (idle/playing, light/dark, focus ring) into the
Level 0 design pass; otherwise a one-frame addendum is enough.

## 7. Integration points

| File | Change |
| --- | --- |
| `src/lib/speech.ts` | new module (section 4) |
| `src/lib/components/SpeakButton.svelte` | new component (section 6) |
| `src/lib/components/QuestionCard.svelte` | one button above the widget, with `text={speakableAsk(question)}`; renders nothing on `null` |
| `src/lib/components/ExampleBlock.svelte` | one button when `german` is true and the cleaned example is non-empty |
| `src/lib/components/Feedback.svelte` | one button on the model line, inside the existing `status != "empty"` branch |
| `src/App.svelte` | `stopGerman()` in the existing hash-change effect |
| `content/strings.ru.toml` | four new `[ui]` keys from section 6 |
| `src/lib/content/validate.ts` | add the four keys to `REQUIRED_UI_KEYS` |

Placing the ask button in `QuestionCard` instead of inside the five widgets keeps
this to one integration point; the button sits above the widget, directly above
the German ask it speaks.

No content changes: nothing in `test.toml`, `countries.toml` or the grading is
touched. Level 0 will import `speakGerman` / `stopGerman` / `hasGermanVoice` and
`SpeakButton` unchanged.

## 8. Accessibility notes

- The button is additive: every German text stays on screen and is still read by
  the screen reader. TTS does not replace anything.
- TTS and the screen reader can speak at once; the app cannot detect this. Known
  limitation, documented so it is not filed as a bug.
- No hover, no drag, no timing, no gesture beyond a tap.
- A blind learner reaches the ask button immediately after the instruction, the
  example button after the example label, and the model button after «Правильный
  ответ».

## 9. Testing

Unit, `tests/speech.test.ts`, node environment with a fake
`globalThis.speechSynthesis` and a fake `SpeechSynthesisUtterance`:

- availability: no API → `speechSupported()` false; API without German voices →
  `hasGermanVoice()` false, no button anywhere;
- voice preference: `de-DE` beats `de-AT`; local beats network; any `de-*` works;
- `speakGerman`: sets `lang` and rate, cancels a previous utterance before
  speaking, notifies speaking listeners true then false on end and on error;
- `stopGerman`: cancels, notifies false;
- `cleanForSpeech`: every row of the table in section 5 plus idempotence;
- `speakableAsk`: sentence/yesno/price asks pass; `___` asks return null;
  translate returns null; empty cleaning returns null.

Manual, on a phone:

- 390×844 in light and dark: the three buttons sit where the spec says, 44 px,
  no layout shift when a button appears after `voiceschanged`.
- VoiceOver and TalkBack: button name changes to «Остановить» while speaking,
  second tap stops, a wrong tap does not disturb the form.
- Navigation during speech: the sentence stops on section change.
- A device without a German voice: no buttons at all, everything else unchanged.
- `bun run typecheck`, `bun test`, `bun run check`, `bun run build` pass.

## 10. Out of scope

- Recording, upload, dictation — Q12 stays skipped.
- Autoplay, read-the-whole-card, reading on focus or on check.
- Audio for the Russian instructions, hints or explanations.
- Speaking radio options (`der`, `die`, `das`), gap choices, or individual words.
- Recorded human audio (that stays a Level 0 concern, behind its `audio` field).
- Any vendor-specific audio unlocking beyond the tap gesture.

## 11. Parked

- Speak a chosen option when the learner taps a radio (`der` / `die` / `das`).
- Speak the learner's own typed answer back before checking it.
- Recorded German for the Level 1 sentences once recordings exist; the module is
  the single place to swap playback.
- Ukrainian interface strings when `strings.uk.toml` arrives.

## 12. Decision log

### Grill 2.1 — 15 September 2026

Started from: "it would be better to start with TTS implementation with the
existing module/level 1 first." Decisions:

1. **TTS ships in Level 1 first**, before Level 0; the speech module is built
   once and reused.
2. **First ship includes all three placements** — ask, example, model answer —
   because ask-only leaves the nineteen blank and translation asks silent, and the
   model answer is the highest-value piece for the blind student.
3. **Asks containing `___` are skipped entirely** rather than spoken with pauses or
   with the answer filled in; the section example carries the audio there.
4. **Playback only.** The frozen «no audio / no dictation» line in `context.md`
   §13 is reversed for listening, and only for listening.
5. **The module is shared**, so Level 0's speech ticket becomes wiring of the
   existing `speech.ts` and `SpeakButton.svelte`.

## 13. Ticket

One ticket, to be written after this spec is approved:
`docs/tickets/level-1-audio/01-tts.md`. It contains the module, the component, the
integration points from section 7, the unit tests and the manual phone pass.
No other ticket depends on it; Level 0's build order changes only in that its
speech step stops being its own build.
