# SpikyGerman Online Test — Everything We Decided (Grill Session 1)

This is the whole story of our first grill session, written down in one place
so nobody has to re-read the entire chat. If you are opening this file for
the first time, start at the top and read it like a story. By the end you
will know exactly what we are building, why, and what we deliberately
left out.

Sample paper test this is based on: `resources/sample_test.pdf`
(40 questions plus the Antworten section at the end).
Earlier checkpoint from the same session: `docs/raw_input.md`.
This file replaces that checkpoint with everything that came after it.

---

## 1. Where this project comes from

SpikyGerman — *German without the sharp edges* — is a small volunteering
project. We teach refugees the absolute basics of German, level A0.

Two things were true from the very first README and never changed:

1. **Multilingual from day one.** Many of our learners cannot read Latin
   script yet. The first MVP targets **Russian**. The architecture must not
   assume German-only or English-only. If we ever support 700 languages,
   we should be able to add them without rewriting every test.

2. **Accessible is a must, not a nice-to-have.** We have blind learners,
   and our most promising student is blind. If the online test does not
   work with a screen reader on a phone, it has failed — even if it looks
   beautiful for everyone else.

Right now the repo is a skeleton. No app code, no learning content yet.
There are two hedgehog mascots in the concept — der Igel and die Igli —
but we explicitly parked them. For this MVP: **functionality first,
mascots later.**

---

## 2. The pivot: from paper to an online quiz

We had already held a couple of real classes. The students asked us to
quiz them. On paper that meant printing the sample test, handing it out,
and checking it by hand.

The pivot we agreed on is simple:

> **The MVP is an online version of that exact paper test.**
> Replicate it faithfully. Do not invent a new course yet.

That decision settled the earlier “what should the MVP contain?” debate.
We stopped thinking about alphabet apps, survival-phrase packs, or a full
A0 course. Content for now = this one test. Functionality for now = make
that test work online for Russian speakers, blind learners included,
on their phones.

One question from the paper test is explicitly **skipped**:

- **Q12 — phone-number dictation.** The paper says “record a voice message.”
  We decided: no dictation, no audio upload, no text-to-speech in the MVP.
  So the online test has 39 questions, not 40.

---

## 3. Who it is for, and on what device

- **Learners:** Russian speakers in Germany, absolute beginners. Many are
  from Ukraine. They read Cyrillic confidently, Latin script less so.
- **Blind learners included from day one.** Not “later.” The most
  promising student is blind, so every question must have a non-visual
  path from the start.
- **Phones first.** They will use this on their phones, in portrait,
  often on cheap Androids with flaky data. Responsive and mobile-first
  is not a slogan — it means big tap targets, stacked inputs instead of
  tiny inline gaps, pages that stay light, and progress that survives
  a closed browser tab.
- **Screen readers: phones first.** The explicit target is VoiceOver on
  iOS and TalkBack on Android. Desktop NVDA/JAWS support is welcome if
  it comes for free, but we test and optimise for the phones first,
  because that is what our blind student actually uses.
- **Interactive app, not a static site.** Learners type, tap, choose,
  get checked, and see explanations. But there is no login, no backend,
  no teacher dashboard in the MVP. Progress lives in the browser.

Russian instructions and German prompts stay side by side everywhere.
The learner always sees Russian guidance (“Напишите полным предложением”)
next to the German task (“Wie heißen Sie?”). That bilingual pairing is
part of the product, not a temporary hack.

---

## 4. What the paper test actually contains

Read once, then never again — the app replaces it. Here is the full map
so builders know what each widget must handle:

- **Q1–5: About yourself, full sentences.**
  Wie heißen Sie? Woher kommen Sie? Wo wohnen Sie? Was sprechen Sie?
  Wie alt sind Sie? The Antworten say “Wir sollen selbst checken” —
  the teacher checks by hand on paper. Online we check the *shape*,
  not the personal facts (see grading below).

- **Q6–8: Fill gaps in dialogues.**
  Herr Meier, woher komm___ ___? / Ich komme ___ Deutschland.
  Petro, woher komm___ du? / Ich ___ aus ___ Ukraine.
  Frau Saccon, woher komm___ ___? / Aus Italien.
  This teaches formal Sie (-en) versus du (-st), plus aus versus
  aus der.

- **Q9–11: Write about the person in the photo, like Niko.**
  The book shows Niko as a worked example: “Niko kommt aus der Ukraine.
  Er wohnt in München, in der Rosenheimer Straße.” Then three cases:
  Thi Giang / Vietnam / Deutschland / Dresden / Müllerstraße (sie);
  Afo / Togo / Österreich / Wien / Burgstraße (er);
  Metin und Elif / Türkei / Deutschland / Köln / Schillerstraße
  (plural — sie kommen / wohnen). The paper suggests a dropdown so the
  learner can pick between er and sie. We keep that, plus sie-plural
  for the couple.

- **Q13–16: Help Sandra and Tom with the shopping list.**
  A fridge drawing plus “Haben wir Bananen? / Eier? / Paprika? /
  Tomaten?” Learners answer in full sentences:
  “Ja, wir haben Bananen.” / “Nein, wir haben keine Eier.”

- **Q17 + Q40: Translate from Russian to German.**
  Q17: Нам нужны перец, яйца и рыба. → Wir brauchen Paprika, Eier und Fisch.
  Q40: Мне нужен йогурт, но у меня нет молока. → Ich brauche einen
  Joghurt, aber ich habe keine Milch.

- **Q18–21: Look at the picture. Is it what the question claims?**
  Tomato → Ja, das ist eine Tomate.
  Fish asked as “Ist das ein Brötchen?” → Nein, das ist kein Brötchen.
  Das ist ein Fisch.
  Cake → Ja, das ist ein Kuchen.
  Red pepper asked as “Ist das eine Banane?” → Nein, das ist keine
  Banane. Das ist eine Paprika.
  So a “No” always needs a second sentence with the correction.

- **Q22–25: Read the prices from the REWE flyer.**
  Die Tomaten kosten 1,11 Euro. / Der Käse kostet 66 Cent. /
  Der Joghurt kostet 28 Cent. / Der Kaffee kostet 3,42 Euro.
  On paper this is a dense scanned flyer. Online it cannot stay a scan
  (see accessibility below).

- **Q26–31 + Q39: Articles and negation.**
  der Käse. / eine Tomate. / Ich möchte einen Apfel (Akkusativ). /
  Ich brauche einen Joghurt. / Das ist kein Apfel. / Ich habe keinen
  Apfel. / Ich brauche Milch, aber ich habe keine Milch. /
  Die Äpfel sind rot (plural is always die).

- **Q32–38: Conjugate the verb in brackets.**
  Ich ___ (sein) müde → Ich bin müde.
  Wir ___ (haben) keine Tomaten → Wir haben.
  Er ___ (wohnen) in Berlin → Er wohnt.
  Du ___ (kommen) aus Polen? → Du kommst.
  Ich ___ (möchten) einen Apfel → Ich möchte.
  Wir ___ (brauchen) Milch → Wir brauchen.
  Sie (она) ___ (essen) gern Obst → Sie isst (irregular — er/sie/es isst!).

The yellow highlights in the Antworten are precious. Notes like
“du → -st”, “die Ukraine → aus der Ukraine”, “plural always uses die”,
and “essen is irregular” become the instant explanations shown after
the learner presses Check.

---

## 5. Seven widgets, not forty screens

Forty questions sound like a lot. In practice there are only seven
interaction shapes. We build each shape once and reuse it:

1. **Pattern sentence** (Q1–5) — a full-sentence box where we check the
   frame and accept anything in the personal slot.
2. **Inline gap-fill with one or more blanks** (Q6–8, Q28–38) — type the
   missing ending or word.
3. **Pronoun select** (Q9–11) — dropdown er / sie / sie-plural plus text
   boxes for name, country, city, street.
4. **Single choice** (Q26–27, Q39) — radio buttons der / die / das,
   ein / eine.
5. **Ja/Nein plus correction** (Q13–16, Q18–21) — two-sentence answers
   with haben/keine and ein/kein patterns.
6. **Price sentence from a table** (Q22–25) — full sentence with a number
   plus Euro or Cent.
7. **Russian-to-German translation** (Q17, Q40) — free text with flexible
   matching (see grading).

Naming these seven shapes matters because the teacher uses the same
names when writing tests in Zed (see Section 10).

---

## 6. Flow: sectioned, saveable, forgiving

The paper test is one long scroll. Online we split it. The learner works
section by section, can close the phone and come back, and checks each
section as they go.

Agreed sections:

1. Sich vorstellen (Q1–5)
2. Dialoge (Q6–8)
3. Personen (Q9–11)
4. Einkaufen (Q13–17)
5. Was ist das? (Q18–21)
6. Preise (Q22–25)
7. Artikel und Verben (Q26–40)

Each section works the same way: answer at your own pace → press a big
Check button → see what was right, the model answer, and a short
explanation in Russian (the former yellow highlights). Progress is saved
in the browser’s local storage. No accounts, no server, no exam timer,
no one-shot attempts in the MVP.

On a phone this means: gaps stack vertically instead of sitting inline,
dropdowns and radios are at least finger-sized, the Check / Back / Next
buttons are large and sticky enough to find without scrolling back up,
and there is never a time limit that punishes screen-reader users.

---

## 7. Grading: flexible, never pedantic

The rule we locked: **check the frame, tolerate the human.**

Phones, Russian keyboards, beginners — strict character-for-character
matching would fail almost everyone for the wrong reasons. So:

- **Q1–5: fixed phrase plus placeholder.**
  We check that the sentence starts correctly and accept anything after it.
  Normalise first: lowercase, trim spaces and `. ! ?`.
  - Ich heiße ___ (any name)
  - Ich komme aus ___ / aus der ___ (any country, article handled separately)
  - Ich wohne in ___ (any city/street)
  - Ich spreche ___ (any language)
  - Ich bin ___ Jahre alt (any age)
  Typing just “Maria” for Q1 fails gently with “Start with «Ich heiße…»”.
  Typing “Ich heiße Maria” passes, whatever Maria is.

- **Q6–11, Q13–16, Q18–39: tolerant exact match.**
  The Antworten are deterministic. We compare case-insensitively,
  ignore extra spaces and trailing punctuation, and accept both
  `1,11` and `1.11` styles for prices. Endings and articles must still
  be right (-st versus -en, der versus die), because that is the point
  of the exercise.

- **Q17 and Q40 translations: flexible auto-check (locked).**
  We considered three options and you picked flexible. Concretely, for
  Q17 (“Нам нужны перец, яйца и рыба.”, model “Wir brauchen Paprika,
  Eier und Fisch.”):
  - *Flexible (chosen):* accept any order and casing if the frame
    “wir brauchen” is there and all three keywords (Paprika, Eier, Fisch)
    appear. “wir brauchen Eier, Fisch und Paprika” passes. Missing “Eier”
    fails with “Missing: Eier. Compare with the model.”
  - *Self-compare only (rejected):* no auto-check, just show the model
    and ask “were you right?” — too vague for progress.
  - *Strict exact match (rejected):* lowercase “w” or swapped order fails —
    technically easy, horrible on phones.

- **Q22–25 prices:** accept `1,11 Euro`, `1.11 Euro`, `66 Cent`,
  `3,42 Euro` variants. The number plus the Euro/Cent word must be right;
  punctuation style may vary.

No regex is ever shown to the teacher (see authoring below). The app turns
“frame plus keywords” into tolerant matching internally.

---

## 8. Examples: one hidden answer that teaches, never spoils

Every question where an example helps gets a collapsed helper:

> **[Показать пример]** → click → example appears → button becomes **[Скрыть пример]**

Rules, all locked:

- Hidden by default. Does not affect grading. Works with keyboard and
  screen reader (`aria-expanded`, real `<button>`, focus stays logical).
- It is **a single plausible answer to a similar case** — never the real
  answer. The question itself is the task; the example only shows the shape.
  - Q1 ask “Wie heißen Sie?” → example “Ich heiße Anna.” (different name)
  - Q17 ask “Нам нужны перец…” → example “Wir brauchen Käse.”
    (same shape, different food)
  - Q9–11 share the familiar Niko sentence: “Niko kommt aus der Ukraine.
    Er wohnt in München.” (from the book, not the answer to this photo)
- **One example per pattern, not per item**, to avoid nagging. Q6/7/8 share
  one Sie-versus-du example. Q13–16 share one
  “Haben wir Milch? → Ja, wir haben Milch. / Nein, wir haben keine Milch.”
  Q18–21 share one “Ist das ein Apfel? → Nein, das ist kein Apfel.
  Das ist eine Birne.” Q22–25 share one
  “Wie viel kostet die Milch? → Die Milch kostet 99 Cent.” Q28–31 share one
  Akkusativ example. Q32–38 share one “Ich ___ (haben) Hunger → Ich habe
  Hunger” that teaches “write the conjugated form, not the infinitive.”
  Q1–5 are the exception: each has its own, because each frame is different.
- **No example where it makes no sense.** Choosing der/die/das (Q26, Q27)
  or die-plural (Q39) is self-explanatory from the buttons plus the short
  Russian instruction. Those blocks have no example line at all, and no
  toggle is rendered. Q12 has nothing because Q12 does not exist.

Earlier drafts mistakenly split this into `example_task` plus
`example_answer`. That was wrong and confusing. There is only one field:
`example = "..."`.

---

## 9. Countries: the Ukraine rule and the whole list

Our learners are mostly from Ukraine, so this will be the most common
mistake in the entire test. We handle it explicitly and kindly.

Most countries take no article: aus Deutschland, aus Polen, aus Vietnam,
aus Togo, aus Italien. A few do:

- feminine die → **aus der**: die Ukraine, die Türkei, die Schweiz,
  die Slowakei…
- masculine der → **aus dem**: der Iran, der Irak, der Jemen, der Sudan…
- plural → **aus den**: die USA, die Niederlande…

Behaviour, locked:

- Typing `Ich komme aus Ukraine` does not fail red. It corrects yellow:
  “Almost! Ukraine is feminine: **aus der Ukraine**. Like: die Ukraine
  → aus der Ukraine.”
- Same for `aus Türkei` → “aus der Türkei”.
- Applies everywhere `kommen aus` appears: Q2, Q6–8, Q9–11.

To make this reliable we keep **one shared country table** as the source
of truth. Each row has the German name, its article class, the ready-made
`aus`-form, and the Russian label for hints:

- Ukraine — die — aus der Ukraine — Украина
- Türkei — die — aus der Türkei — Турция
- Deutschland — (none) — aus Deutschland — Германия
- USA — plural — aus den USA — США

Scope, locked: **P0 for MVP** is about 25 classroom-relevant countries
(Ukraine, Deutschland, Polen, Russland, Türkei, Vietnam, Togo, Österreich,
Italien, Frankreich, Syrien, and neighbours). **P1** is the full list of
around 190 from the Auswärtiges Amt Länderverzeichnis. The teacher never
writes der/die logic per question — they write `country = true` and the
app looks it up.

---

## 10. Accessibility, polished: option B plus the keyboard toolbar

This is where we moved furthest from the first draft, so read carefully.

**Images: B, not A (locked).** Sighted learners see the photo. Blind
learners hear an equivalent list. They are written together so they
cannot drift apart, but only one is presented visually:

- Photo visible + short `alt` (one sentence, also the fallback if the
  image fails on a cheap phone).
- `sr_data` list next to it in the same question block — VoiceOver and
  TalkBack read it, sighted learners never see it.
- You explicitly rejected the safety toggle (“show as list” for sighted).
  So: **alt text only** as the sighted fallback. No extra button in the MVP.

Concretely:

- Fridge (Q13–16) → photo plus hidden list in Russian
  (“В холодильнике: бананы, помидоры…”) that the screen reader
  announces as a list. The image is processed in their language,
  so the hint stays in Russian — the learner still produces
  the German answer themselves.
- Food photos (Q18–21) → photo plus hidden label (“Tomate, rot, rund”).
- Portraits (Q9–11) → photo plus hidden word bank (name, country, city,
  street — the data already printed in the book).
- REWE flyer (Q22–25) → never a scanned flyer. Even sighted learners get
  a tiny accessible price table in the MVP, because a flyer scan is
  unreadable on a phone. The hidden equivalent mirrors that table row
  for row. Alt text alone would never carry a flyer — that is why the
  table exists at all.

**German on Russian phones: a small helper row, not a full keyboard
(locked).** Learners keep their own phone keyboard. Above the answer
field we add one sticky row: `ä ö ü ß Ä Ö Ü €`. Tapping inserts the
character at the cursor without losing focus, and the screen reader
announces it. A full custom keyboard would break autofill and TalkBack
typing and is explicitly out. Combined with tolerant input (`ae` → `ä`,
`ss` → `ß` accepted with a gentle “tip: ä” note), nobody is blocked by
not having a German keyboard installed.

---

## 11. Mobile-first, concretely

- Portrait phones first, then everything else. Gaps stack vertically.
  Radios and dropdowns are finger-sized. Check / Back / Next are big
  and reachable without scrolling back up.
- Light pages. No heavy frameworks for the MVP if avoidable. Text-first;
  photos compressed; no auto-playing media.
- Online-only is acceptable, but low-bandwidth tolerant. The test must
  still be usable on a slow connection, and progress must survive a
  closed tab (local storage).
- German umlauts available via the helper row above. Russian and German
  keyboards both work. No question requires hovering, dragging, or any
  desktop-only gesture.

---

## 12. Writing tests in Zed: TOML with a tutorial on top

The teacher is confident, edits in Zed, and may let AI draft — but a
human stays in charge. That profile drove three hard decisions:

**1. No per-language fields. Ever.**
An early draft had `prompt_ru` inside every question. You killed it:
“What if we have 700 languages?” Correct. The teacher writes German
only (or the Russian sentence to translate, which *is* the task).
Reusable interface strings — “Write in full sentences”, “Choose”,
“Show example”, “Check” — live once in `strings.ru.toml`. Adding
Ukrainian tomorrow means adding `strings.uk.toml`. Zero test changes.

**2. TOML, not YAML or Markdown fences.**
YAML punishes one wrong space. Markdown fences break when someone forgets
to close three backticks. TOML is `key = "value"`, `# comments`,
`[question.q01]` blocks — the calmest thing to open in Zed, with syntax
highlighting out of the box. JSON was rejected outright (no comments,
escaping pain).

**3. No regex for humans.**
You called it madness, correctly. The teacher picks a shape and lists
words. The app does the tolerant matching internally:
- radio/dropdown → `answer = "der"` (one word)
- open text → `starts_with = "Ich heiße"` (frame) or
  `frame = "wir brauchen"` plus `answer_keywords = ["Paprika", "Eier", "Fisch"]`
- country → `country = true` (look up the shared table)
A raw `match_regex` escape hatch may exist for developers later, but it
is hidden from teachers and never required.

The file teaches itself. It opens with a plain-language tutorial that
lists every type with a real classroom example, in full sentences, one
idea at a time — not a dense spec. Each question then has exactly four
things: `type`, `ask`, the answer (`answer` / `starts_with`+keywords /
`options`+`answer` / `country`), and a single `example`. Copy a block,
paste at the end, change the words, run `npm run check` — which speaks
plainly (“q22: you forgot answer = … did you mean one of der/die/das?”).
Nothing breaks silently.

Photos and their screen-reader equivalents live in the same block
(`photo` + `alt` + `sr_data`) so they can never drift apart. The shared
country table and the shared Russian strings live outside the test file,
referenced by key.

---

## 13. Out of scope — said plainly so nobody re-litigates it

- Q12 dictation and any audio recording, upload, or text-to-speech.
- Accounts, sync across devices, teacher inbox, scores, attempts, timers,
  exam mode.
- Mascots, new learning content beyond this test, offline PWA.
- Backend of any kind. Browser storage only.
- Full custom on-screen keyboard. Helper row only.
- The “show as list” sighted toggle for images. Alt-only, per your call.

---

## 14. What happens next

This file is the input to the spec (`to-spec` in our skills language):
problem, solution, user stories, implementation and testing decisions,
out of scope, notes. The build then follows the main flow — spec to
tickets to implementation with tests — keeping this file as the primary
source. If anything here changes, change it here first.

Thank you for pushing through the frustrating middle part. The sharp
corrections — single example field, no per-language prompts, TOML with a
human tutorial, option B for images, toolbar over keyboard — are what
turned a clever draft into something a real teacher and a real blind
student can actually use.

---

## 15. Grill 1.1 — changes after the first prototype review

Prototype 1 was tested on a phone. These decisions replace the older ones
above where they disagree:

- **Check is per question, not per section.** Each question has its own
  «Проверить» button and only shows its own feedback. Progress is stored per
  question; the “Проверено” badge on the home screen means the whole section
  was checked.
- **Examples are visible task content.** Every section shows its example
  under the task instruction (for Q1–5 one combined example with all five
  frames). The «Показать пример» toggle is gone. Q17 and Q40 keep their own
  example because they have their own task. The Niko example is part of the
  Personen task: his photo and the sentence are shown from the start.
- **Gaps replace the whole word with the gap number.** For “woher komm___”,
  the sentence now reads “woher 1”; the answer row shows the fixed beginning
  plus the input: `komm[en]`. The learner still types only the ending. In
  TOML: `answers = ["komm|en", "Sie", "aus"]`.
- **Prices: sighted learners see the flyer, blind learners get the table.**
  The REWE image is visible; the price table is a screen-reader-only
  equivalent generated from `[table.rewe]`, so it can never drift. The
  example uses a price above one euro. (This reverses the earlier
  “never a scanned flyer” rule.)
- **Task-level images.** The fridge belongs to the whole Einkaufen task and
  is visible for Q13–16, not only at Q13.
- **Translations stay flexible on word order, but Q40 is strict about the
  Akkusativ article:** `einen` is a required keyword.
- **Umlaut row:** no €; one row that switches between `ä ö ü ß` and
  `Ä Ö Ü ẞ` depending on what the learner is typing; it only appears while a
  text field is focused.
- **No auto-capitalization** in any answer field (`autocapitalize="none"`).

---

## 16. Grill 1.2 — second prototype review

- **Personen (Q9–11) is removed.** The section is gone from the test; the
  test now has 36 questions. The `person` type stays supported in the app
  and the validator, in case it comes back with better material.
- **Conjugation gaps are selects.** Where the learner has to choose a verb
  form (Q6–8, Q32–38), the task is a select box with the full forms
  (`kommen`, `kommst`, `komme`, …). TOML: `gap_choices = ["kommen|kommst|komme", …]`.
  Article gaps (Q28–31) stay text fields.
- **Question numbers sit inline** with the question text: “6. Herr Meier,
  woher …?” instead of the number on its own line.
- **Image descriptions must be answerable.** Every `sr_data` now describes
  what is on the picture in enough detail to answer the questions: the
  fridge lists what is and is not inside, each food photo says what the
  food is, what colour it has, and what it is not.
- **Instructions are explicit and per question.** Each question states
  whether a full sentence is required; the conjugation questions each say
  which verb is being practised instead of one instruction covering a
  group.
- **Umlaut row case works as a toggle.** It follows the case the keyboard
  is currently producing; it is not tied to holding Shift.

---

## 17. Grill 1.3 — third prototype review

- **Formal and informal are both correct in Q6 and Q8.** The example shows
  “kommst du”, so `kommst du` must pass next to `kommen Sie`. Gaps can now
  carry alternatives in TOML: `answers = [["kommen", "kommst"], ["Sie", "du"], "aus"]`.
  The first alternative is the model answer.
- **A missing correction is «Почти!», not an error.** In Was ist das?,
  writing only “Nein, das ist kein Brötchen.” now shows almost with
  “Не хватает: «Das ist ein Fisch.»”. The same rule applies to Q21 and to
  any yes/no answer that expects two sentences.
- **The Preise example uses real products from the flyer.** Pringles
  (1,34 Euro) and Wirsing (75 Cent) replace the invented Saft/Tee example,
  and both rows were added to the screen-reader price table.

---

## 18. Grill 1.4 — prices in words

- Prices in Preise are written out in words: **“ein Euro elf Cent”**
  (also accepted: “ein Euro und elf Cent”). Digits — “1,11 Euro” — are an
  error and the model answer shows the word form.
- The section example uses real flyer products in word form:
  “Die Pringles kosten ein Euro vierunddreißig Cent.”,
  “Der Wirsing kostet fünfundsiebzig Cent.”
- The screen-reader price table keeps the digits, because it mirrors what
  the flyer prints; the learner turns them into words.

---

## 19. Copyright / repository hygiene

- `resources/sample_test.pdf` and the images extracted from it
  (`public/img/*.webp`) are **not** part of the git repository. They stay on
  the teacher's machine and are ignored by git.
- The app and its tests need those files locally. A fresh clone shows
  missing images until they are copied back; `npm run check` names every
  missing file and says where it belongs.

---

## 20. Grill 1.5 — summary screen

- The last section's «Дальше» leads to **«Итоги»** (`#/summary`); the home
  screen links there as well.
- The summary grades every answer as it stands; unanswered counts as
  «Без ответа». Counts only — no percentage, no praise.
- It shows the four counts, every section with «верно X из Y», and a list of
  almost/wrong questions. Each item deep-links to the card
  (`#/s/<section>/<question>`), scrolls to it, focuses it, and marks just
  that question checked so the feedback is visible on arrival.
- «Повторить ошибки» is deliberately not built yet.
- Bug found on the way: a half-filled answer (some gaps filled, some empty)
  used to count as correct. It is now «Почти!» and never counts as correct.
