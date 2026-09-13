# Raw Input — SpikyGerman Online Test MVP

Source: grill-with-docs session, 2026-09-13.
Sample PDF: `resources/sample_test.pdf` (40 questions + Antworten).

## Project context

- SpikyGerman: volunteering project teaching refugees absolute basics of German (A0).
- Values from README: multilingual from day one (MVP targets Russian), accessible is a must (blind learners, most promising student is blind).
- Status: skeleton only, no app code yet.
- Mascots (der Igel / die Igli): explicitly deferred for MVP. Focus on functionality.

## Pivot

- Already had a couple of classes. Students asked to be quizzed.
- Instead of paper-based, make an online test.
- MVP = replicate the sample PDF test online.

## Global constraints (locked)

- Audience: Russian-speakers in Germany, blind learners included from day one.
- Responsive, mobile-first. Learners use phones.
- Interactive app (not static site).
- Russian instructions + German prompts stay side-by-side (bilingual UI from day one).
- Q12 dictation: skipped. No audio dictation in MVP.

## Test structure (from PDF)

- Q1–5: Free full sentences about self (Wie heißen Sie? Woher kommen Sie? Wo wohnen Sie? Was sprechen Sie? Wie alt sind Sie?). Antworten: "Wir sollen selbst checken".
- Q6–8: Fill gaps in dialogues (Sie/du endings + aus / aus der). e.g. Herr Meier, woher komm___ ___? / Ich komme ___ Deutschland. / Petro, woher kommst du? / Ich komme aus der Ukraine.
- Q9–11: Bio builder from Niko example. Das ist ___ / Sie-er kommt/kommen aus ___ / wohnt-wohnen in ___ / in der ___. Pronoun select er/sie/sie-plural. Couple (Metin und Elif) = plural. Data: Thi Giang/Vietnam/Dresden/Müllerstraße; Afo/Togo/Österreich/Wien/Burgstraße; Metin und Elif/Türkei/Deutschland/Köln/Schillerstraße.
- Q12: Phone dictation — SKIPPED.
- Q13–16: Sandra/Tom fridge inventory. Haben wir Bananen/Eier/Paprika/Tomaten? Ja/Nein + haben/keine full sentences.
- Q17 + Q40: RU→DE translation free text. Q17: Нам нужны перец, яйца и рыба. → Wir brauchen Paprika, Eier und Fisch. Q40: Мне нужен йогурт, но у меня нет молока. → Ich brauche einen Joghurt, aber ich habe keine Milch.
- Q18–21: Image ID with Ja, das ist ein/eine... / Nein, das ist kein/keine/kein... + correction. Tomato, fish (kein Brötchen, ist ein Fisch), Kuchen, Paprika (keine Banane).
- Q22–25: Price reading from REWE flyer. Die Tomaten kosten 1,11 Euro. / Der Käse kostet 66 Cent. / Der Joghurt kostet 28 Cent. / Der Kaffee kostet 3,42 Euro.
- Q26–31 + Q39: Articles / negation. der Käse, eine Tomate, einen Apfel (Akkusativ), einen Joghurt, kein/keinen Apfel, keine Milch, Die Äpfel (plural always die).
- Q32–38: Verb conjugation. sein (ich bin), haben (wir haben), wohnen (er wohnt), kommen (du kommst), möchten (ich möchte), brauchen (wir brauchen), essen (sie isst — irregular!).

## Interaction taxonomy (7 widgets, not 40 screens)

1. Pattern sentence (1–5)
2. Inline fill-the-gap with 1–n blanks (6–8, 28–38)
3. Pronoun select er/sie/sie-plural (9–11)
4. Single-choice der/die/das, ein/eine (26–27, 39)
5. Ja/Nein + correction two-sentence (13–16, 18–21)
6. Price sentence from table (22–25)
7. RU→DE translation (17, 40)

## Decisions (locked)

### Flow: sectioned + local save
- Not one giant scroll. Paginated by topic, progress saved in browser (no login for MVP).
- Proposed sections: Sich vorstellen (1–5) / Dialoge (6–8) / Personen (9–11) / Einkaufen (13–17) / Was ist das? (18–21) / Preise (22–25) / Artikel & Verben (26–40).
- Each section: answer → Check → model answer + explanation (yellow highlights from Antworten become instant explanations: du → -st, die Ukraine → aus der Ukraine, plural always die, essen: er/sie/es isst irregular, etc.).
- Big tap targets, gaps stack vertically on phones.

### Grading: flexible auto-check
- Q1–5: fixed phrase + placeholder. Check the frame, accept anything in the slot. Normalized (lowercase, trim .!?).
  - Ich heiße .+ / Ich komme aus (der )? .+ / Ich wohne in .+ / Ich spreche .+ / Ich bin .+ Jahre alt
- Q6–11, 13–16, 18–39: deterministic Antworten, exact match on endings/articles with case/space/punctuation tolerance.
- Q17/Q40: flexible auto-check (locked). Accept word-order / case / article variants if keywords match, show model answer after. NOT strict exact match, NOT self-compare-only.
- Q22–25 prices: accept 1,11 Euro / 1.11 Euro variants, Euro/Cent forms.

### Examples: "Показать пример" collapsed, parallel only
- Every question where it makes sense gets a collapsed example. Button `Показать пример` / `Скрыть пример`, `aria-expanded`, keyboard + screen-reader accessible. Does not affect grading.
- Parallel pattern example, never the actual solution.
- Needs example (one shared per pattern block to avoid repetition):
  - Q1–5: one each (different frames). e.g. Q1: Wie heißt du? → Ich heiße Anna.
  - Q6–8: one shared (Sie vs du). e.g. Herr Ali, woher kommst du? / Ich komme aus Syrien.
  - Q9–11: one shared — existing Niko example. Niko kommt aus der Ukraine. Er wohnt in München...
  - Q13–16: one shared. Haben wir Milch? → Ja, wir haben Milch. / Nein, wir haben keine Milch.
  - Q17, Q40: one each. e.g. Q17: Нам нужен сыр. → Wir brauchen Käse.
  - Q18–21: one shared. Ist das ein Apfel? → Nein, das ist kein Apfel. Das ist eine Birne.
  - Q22–25: one shared. Wie viel kostet die Milch? → Die Milch kostet 99 Cent.
  - Q28–31: one shared (Akkusativ / kein vs keinen). Ich möchte ___ Orange. → eine Orange / einen Apfel.
  - Q32–38: one shared (write conjugated form, not infinitive). Ich ___ (haben) Hunger. → Ich habe Hunger.
- No example needed:
  - Q26, 27, 39 (der/die/das, ein/eine choice) — UI self-explanatory, Russian instruction suffices.
  - Q12 — skipped.

### Ukraine / country articles (locked)
- Very common pattern (students from Ukraine): if learner writes `aus Ukraine`, correct to `aus der Ukraine` with explanation (feminine).
- Same for Türkei, Schweiz (die → aus der), Iran/Irak/Jemen/Sudan (der → aus dem), USA/Niederlande (plural → aus den).
- Single `countries.json` source of truth: `{ de_name, article, aus-form }` + Russian label for hints (Украина → die Ukraine → aus der Ukraine).
- Scope: P0 MVP ~25 classroom-relevant countries; P1 full ~190 from Auswärtiges Amt Länderverzeichnis.
- Applies to Q2, Q6–8, Q9–11.

### Accessibility: text equivalents (locked)
- No image-only tasks. Every image gets text equivalent:
  - Fridge (Q13–16) → item list (Im Kühlschrank: Bananen, Tomaten...).
  - Food pics (Q18–21) → labelled figure + alt text.
  - Portraits (Q9–11) → existing word banks as text (already in PDF).
  - REWE flyer (Q22–25) → small price table, not a scan.
- Alt-text alone insufficient for flyer; tables/lists required for equal blind experience.

## Out of scope for MVP

- Dictation audio (Q12), uploadable audio, TTS.
- Login/accounts, teacher inbox, scores/attempts/exam mode.
- Mascots, learning content beyond this test, offline PWA (online-only okay, but light/low-bandwidth).
- Backend (localStorage progress, static + JSON test definition proposed).
