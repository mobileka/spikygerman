import type { Country, Question } from "../content/types";
import {
  containsPhrase,
  expectedEquals,
  fillBlanks,
  normalize,
  splitSentences,
  umlautTip,
} from "./normalize";

export type Status = "correct" | "almost" | "incorrect" | "empty";

export type Hint =
  | { kind: "start_with"; expected: string }
  | { kind: "end_with"; expected: string }
  | { kind: "country"; name: string; article: string; aus: string }
  | { kind: "missing"; keywords: string[] }
  | { kind: "missing_sentence"; expected: string }
  | { kind: "frame"; expected: string }
  | { kind: "umlaut"; expected: string };

export interface FieldResult {
  id: string;
  status: Status;
  hint?: Hint;
}

export interface QuestionResult {
  status: Status;
  fields: FieldResult[];
  model: string;
  /**
   * The correct answer as the learner produced it, when the task allows more
   * than one wording (gaps, person) or the model is only a pattern (sentence).
   * Set on correct answers only; the UI speaks this instead of `model`.
   */
  assembled?: string;
}

export const ANSWER_FIELD = "answer";
export const CHOICE_FIELD = "choice";
export const PRONOUN_FIELD = "pronoun";

export function gapField(index: number): string {
  return `g${index}`;
}

export function fieldStatus(
  result: QuestionResult | undefined,
  id: string,
): Status | undefined {
  return result?.fields.find((field) => field.id === id)?.status;
}

function field(id: string, status: Status, hint?: Hint): FieldResult {
  return hint ? { id, status, hint } : { id, status };
}

function exactAny(id: string, input: string, alternatives: string[]): FieldResult {
  if (!input.trim()) return field(id, "empty");
  for (const expected of alternatives) {
    if (!expectedEquals(input, expected)) continue;
    const tip = umlautTip(input, expected);
    return tip
      ? field(id, "correct", { kind: "umlaut", expected: tip })
      : field(id, "correct");
  }
  return field(id, "incorrect");
}

function exact(id: string, input: string, expected: string): FieldResult {
  return exactAny(id, input, [expected]);
}

function exactLoose(
  id: string,
  input: string,
  expected: string,
  strip: RegExp,
): FieldResult {
  if (!input.trim()) return field(id, "empty");
  const cleaned = normalize(input).replace(strip, "").trim();
  if (cleaned !== normalize(expected)) return field(id, "incorrect");
  const tip = umlautTip(input, expected);
  return tip ? field(id, "correct", { kind: "umlaut", expected: tip }) : field(id, "correct");
}

function aggregate(fields: FieldResult[]): Status {
  if (!fields.length || fields.every((f) => f.status === "empty")) return "empty";
  if (fields.some((f) => f.status === "incorrect")) return "incorrect";
  if (fields.some((f) => f.status === "almost")) return "almost";
  if (fields.some((f) => f.status === "empty")) return "almost";
  return "correct";
}

function findCountry(name: string, countries: Country[]): Country | undefined {
  const target = normalize(name);
  return countries.find((c) => normalize(c.name) === target);
}

function ausWithoutAus(country: Country): string {
  return normalize(country.aus).replace(/^aus\s+/, "");
}

function countryHint(country: Country): Hint {
  return {
    kind: "country",
    name: country.name,
    article: country.article,
    aus: country.aus,
  };
}

function checkCountryRest(
  rawRest: string,
  countries: Country[],
): { status: Status; hint?: Hint } | null {
  const rest = normalize(rawRest).replace(/^aus\s+/, "");
  if (!rest) return { status: "incorrect" };
  const withArticle = rest.match(/^(der|die|das|dem|den)\s+(.+)$/);
  for (const country of countries) {
    const name = normalize(country.name);
    const aus = ausWithoutAus(country);
    if (rest === aus || rest.startsWith(aus + " ")) return { status: "correct" };
    if (rest === name || rest.startsWith(name + " ")) {
      return country.article === ""
        ? { status: "correct" }
        : { status: "almost", hint: countryHint(country) };
    }
    if (withArticle && withArticle[2] === name) {
      return aus.startsWith(withArticle[1] + " ")
        ? { status: "correct" }
        : { status: "almost", hint: countryHint(country) };
    }
  }
  return null;
}

function gradeSentence(
  q: Question,
  values: Record<string, string>,
  countries: Country[],
): QuestionResult {
  const input = values[ANSWER_FIELD] ?? "";
  const startsWith = q.starts_with ?? "";
  const model = `${startsWith} …${q.ends_with ? ` ${q.ends_with}` : ""}`;
  if (!input.trim()) {
    return { status: "empty", fields: [field(ANSWER_FIELD, "empty")], model };
  }
  const normalized = normalize(input);
  const prefix = normalize(startsWith);
  if (prefix && !normalized.startsWith(prefix)) {
    return {
      status: "incorrect",
      fields: [
        field(ANSWER_FIELD, "incorrect", { kind: "start_with", expected: startsWith }),
      ],
      model,
    };
  }
  if (q.ends_with && !normalized.endsWith(normalize(q.ends_with))) {
    return {
      status: "incorrect",
      fields: [
        field(ANSWER_FIELD, "incorrect", { kind: "end_with", expected: q.ends_with }),
      ],
      model,
    };
  }
  if (q.country) {
    const rest = normalized.slice(prefix.length).trim();
    const check = checkCountryRest(rest, countries);
    if (check && check.status !== "correct") {
      return {
        status: check.status,
        fields: [field(ANSWER_FIELD, check.status, check.hint)],
        model,
      };
    }
    if (check && check.status === "correct") {
      return {
        status: "correct",
        fields: [field(ANSWER_FIELD, "correct")],
        model,
        assembled: input.trim(),
      };
    }
  }
  return {
    status: "correct",
    fields: [field(ANSWER_FIELD, "correct")],
    model,
    assembled: input.trim(),
  };
}

function gradeGaps(q: Question, values: Record<string, string>): QuestionResult {
  const answers = q.answers ?? [];
  const fields = answers.map((alternatives, index) =>
    exactAny(gapField(index), values[gapField(index)] ?? "", alternatives),
  );
  const status = aggregate(fields);
  const result: QuestionResult = {
    status,
    fields,
    model: fillBlanks(
      q.ask,
      answers.map((alternatives) => alternatives[0] ?? ""),
    ),
  };
  if (status === "correct") {
    result.assembled = fillBlanks(
      q.ask,
      answers.map((_alternatives, index) =>
        (values[gapField(index)] ?? "").trim(),
      ),
    );
  }
  return result;
}

function gradeChoice(q: Question, values: Record<string, string>): QuestionResult {
  const input = values[CHOICE_FIELD] ?? "";
  const model = fillBlanks(q.ask, [q.answer ?? "…"]);
  const status: Status = !input ? "empty" : input === q.answer ? "correct" : "incorrect";
  return { status, fields: [field(CHOICE_FIELD, status)], model };
}

function gradeYesNo(q: Question, values: Record<string, string>): QuestionResult {
  const input = values[ANSWER_FIELD] ?? "";
  const expected = q.answer ?? "";
  const model = expected;
  if (!input.trim()) {
    return { status: "empty", fields: [field(ANSWER_FIELD, "empty")], model };
  }
  const alternatives = q.answer_alternatives?.length
    ? q.answer_alternatives
    : [expected];

  for (const alternative of alternatives) {
    if (!expectedEquals(input, alternative)) continue;
    const tip = umlautTip(input, alternative);
    return {
      status: "correct",
      fields: [
        tip
          ? field(ANSWER_FIELD, "correct", { kind: "umlaut", expected: tip })
          : field(ANSWER_FIELD, "correct"),
      ],
      model,
    };
  }

  for (const alternative of alternatives) {
    const sentences = splitSentences(alternative);
    if (sentences.length > 1 && expectedEquals(input, sentences[0])) {
      return {
        status: "almost",
        fields: [
          field(ANSWER_FIELD, "almost", {
            kind: "missing_sentence",
            expected: sentences.slice(1).join(" "),
          }),
        ],
        model,
      };
    }
  }

  // A bare "Ja" or "Nein" pointing the right way is on track, not wrong: the
  // learner knows the answer, the full sentence is what is missing. The hint
  // shows the sentence to write.
  const particle = bareParticle(input);
  if (particle) {
    for (const alternative of alternatives) {
      if (firstWord(alternative) !== particle) continue;
      return {
        status: "almost",
        fields: [
          field(ANSWER_FIELD, "almost", {
            kind: "missing_sentence",
            expected: alternative,
          }),
        ],
        model,
      };
    }
  }

  return { status: "incorrect", fields: [field(ANSWER_FIELD, "incorrect")], model };
}

function bareParticle(input: string): string | null {
  const cleaned = normalize(input);
  return cleaned === "ja" || cleaned === "nein" ? cleaned : null;
}

function firstWord(sentence: string): string {
  return normalize(splitSentences(sentence)[0] ?? "").split(" ")[0] ?? "";
}

// "und" and "Cent" are optional in a price: "ein Euro und elf Cent",
// "ein Euro elf Cent", "ein Euro elf" and "elf" all match the same number.
function stripPriceFillers(text: string): string {
  return normalize(text)
    .replace(/\bund\b/g, " ")
    .replace(/\bcent\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// "Der Käse kostet drei Euro …" also passes as the bare price "drei Euro …":
// the task is reading the price, the full sentence is the model.
function priceAlternatives(expected: string): string[] {
  const alternatives = [expected];
  const part = expected.match(/\b(?:kostet|kosten)\s+(.+)$/i)?.[1]?.trim();
  if (part) alternatives.push(part);
  return alternatives;
}

function gradePrice(q: Question, values: Record<string, string>): QuestionResult {
  const input = values[ANSWER_FIELD] ?? "";
  const expected = q.answer ?? "";
  const model = expected;
  if (!input.trim()) {
    return { status: "empty", fields: [field(ANSWER_FIELD, "empty")], model };
  }
  for (const alternative of priceAlternatives(expected)) {
    if (stripPriceFillers(input) !== stripPriceFillers(alternative)) continue;
    const tip = umlautTip(input, alternative);
    return {
      status: "correct",
      fields: [
        tip
          ? field(ANSWER_FIELD, "correct", { kind: "umlaut", expected: tip })
          : field(ANSWER_FIELD, "correct"),
      ],
      model,
    };
  }
  return { status: "incorrect", fields: [field(ANSWER_FIELD, "incorrect")], model };
}

function gradeTranslate(q: Question, values: Record<string, string>): QuestionResult {
  const input = values[ANSWER_FIELD] ?? "";
  const model = q.answer ?? "";
  if (!input.trim()) {
    return { status: "empty", fields: [field(ANSWER_FIELD, "empty")], model };
  }
  const frame = q.frame ?? "";
  if (frame && !containsPhrase(input, frame)) {
    return {
      status: "incorrect",
      fields: [field(ANSWER_FIELD, "incorrect", { kind: "frame", expected: frame })],
      model,
    };
  }
  const missing = (q.answer_keywords ?? []).filter(
    (keyword) => !containsPhrase(input, keyword),
  );
  if (missing.length) {
    return {
      status: "incorrect",
      fields: [field(ANSWER_FIELD, "incorrect", { kind: "missing", keywords: missing })],
      model,
    };
  }
  return { status: "correct", fields: [field(ANSWER_FIELD, "correct")], model };
}

interface PersonParts {
  pronoun?: string;
  name?: string;
  from?: string;
  residence?: string;
  city?: string;
  street?: string;
}

// Both the canonical model (from the question) and the assembled answer (from
// the learner's fields) go through here, so "aus", "in" and "in der" are never
// doubled when the learner typed the prefix again.
function stripLeading(value: string | undefined, pattern: RegExp): string {
  return (value ?? "").trim().replace(pattern, "").trim();
}

function personSentence(person: PersonParts, countries: Country[]): string {
  const plural = person.pronoun === "sie-plural";
  const pronoun = plural ? "Sie" : person.pronoun === "er" ? "Er" : "Sie";
  const kommt = plural ? "kommen" : "kommt";
  const wohnt = plural ? "wohnen" : "wohnt";
  const first = plural ? "Das sind" : "Das ist";
  const country = person.from ? findCountry(person.from, countries) : undefined;
  const from = (person.from ?? "").trim();
  const aus = country
    ? country.aus
    : /^aus\s+/i.test(from)
      ? from
      : `aus ${from}`;
  return [
    `${first} ${(person.name ?? "").trim()}.`,
    `${pronoun} ${kommt} ${aus}.`,
    `${pronoun} ${wohnt} in ${stripLeading(person.residence, /^in\s+/i)}.`,
    `${pronoun} ${wohnt} in ${stripLeading(person.city, /^in\s+/i)}, in der ${stripLeading(person.street, /^(in\s+der\s+|in\s+|der\s+)/i)}.`,
  ].join(" ");
}

function personModel(q: Question, countries: Country[]): string {
  return personSentence(q, countries);
}

function gradePerson(
  q: Question,
  values: Record<string, string>,
  countries: Country[],
): QuestionResult {
  const fields: FieldResult[] = [];
  const model = personModel(q, countries);

  const pronoun = values[PRONOUN_FIELD] ?? "";
  if (!pronoun) fields.push(field(PRONOUN_FIELD, "empty"));
  else if (pronoun === q.pronoun) fields.push(field(PRONOUN_FIELD, "correct"));
  else fields.push(field(PRONOUN_FIELD, "incorrect"));

  fields.push(exact("name", values.name ?? "", q.name ?? ""));

  const fromInput = values.from ?? "";
  if (!fromInput.trim()) {
    fields.push(field("from", "empty"));
  } else {
    const country = q.from ? findCountry(q.from, countries) : undefined;
    if (country) {
      const check = checkCountryRest(fromInput, [country]);
      fields.push(
        check ? field("from", check.status, check.hint) : field("from", "incorrect"),
      );
    } else {
      fields.push(exact("from", fromInput, q.from ?? ""));
    }
  }

  fields.push(
    exactLoose("residence", values.residence ?? "", q.residence ?? "", /^in\s+/),
  );
  fields.push(exact("city", values.city ?? "", q.city ?? ""));
  fields.push(
    exactLoose(
      "street",
      values.street ?? "",
      q.street ?? "",
      /^(in\s+der\s+|in\s+|der\s+)/,
    ),
  );

  const status = aggregate(fields);
  const result: QuestionResult = { status, fields, model };
  if (status === "correct") {
    result.assembled = personSentence(
      {
        pronoun: values[PRONOUN_FIELD],
        name: values.name,
        from: values.from,
        residence: values.residence,
        city: values.city,
        street: values.street,
      },
      countries,
    );
  }
  return result;
}

export function gradeQuestion(
  q: Question,
  values: Record<string, string>,
  countries: Country[],
): QuestionResult {
  switch (q.type) {
    case "sentence":
      return gradeSentence(q, values, countries);
    case "gaps":
      return gradeGaps(q, values);
    case "person":
      return gradePerson(q, values, countries);
    case "choice":
      return gradeChoice(q, values);
    case "yesno":
      return gradeYesNo(q, values);
    case "price":
      return gradePrice(q, values);
    case "translate":
      return gradeTranslate(q, values);
  }
}
