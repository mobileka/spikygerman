import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";
import { describe, expect, it } from "vitest";
import {
  validateContent,
  validateLanguageConsistency,
} from "../src/lib/content/validate.ts";
import type {
  CompiledContent,
  RawCountry,
  RawLevelFile,
  RawUiFile,
} from "../src/lib/content/types.ts";
import content from "../src/generated/content.ru.json";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

const LEVEL_FILE = "content/ru/level-1.toml";
const UI_FILE = "content/ru/ui.toml";
const COUNTRIES_FILE = "content/ru/countries.toml";

const rawLevel = parse(read(LEVEL_FILE)) as unknown as RawLevelFile;
const rawUi = parse(read(UI_FILE)) as unknown as RawUiFile;
const rawCountries = parse(read(COUNTRIES_FILE)) as unknown as {
  country?: RawCountry[];
};

const realOptions = {
  publicDir: join(root, "public"),
  levelFile: LEVEL_FILE,
  uiFile: UI_FILE,
  countriesFile: COUNTRIES_FILE,
};

describe("content validation", () => {
  it("passes with no errors", () => {
    const report = validateContent(
      rawLevel,
      rawUi,
      rawCountries.country ?? [],
      realOptions,
    );
    expect(report.errors).toEqual([]);
  });
});

describe("content validation errors are teacher-friendly", () => {
  const ui = rawUi;

  it("explains a wrong choice answer", () => {
    const report = validateContent(
      {
        level: { id: "t", number: 1, title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "Переведите на немецкий.",
            question: [
              {
                id: "q01",
                type: "choice",
                ask: "___ Käse ist gelb.",
                options: ["der", "die", "das"],
                answer: "den",
              },
            ],
          },
        ],
      },
      ui,
      rawCountries.country ?? [],
      { publicDir: join(root, "public") },
    );
    expect(
      report.errors.some((error) =>
        error.includes('Did you mean one of der/die/das?'),
      ),
    ).toBe(true);
  });

  it("explains a gap count mismatch", () => {
    const report = validateContent(
      {
        level: { id: "t", number: 1, title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "Переведите на немецкий.",
            question: [
              {
                id: "q01",
                type: "gaps",
                ask: "Ich ___ aus ___ Ukraine.",
                answers: ["komme"],
              },
            ],
          },
        ],
      },
      ui,
      rawCountries.country ?? [],
      { publicDir: join(root, "public") },
    );
    expect(
      report.errors.some((error) => error.includes("They must be equal.")),
    ).toBe(true);
  });

  it("flags gap choices that do not contain the answer", () => {
    const report = validateContent(
      {
        level: { id: "t", number: 1, title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "Переведите на немецкий.",
            question: [
              {
                id: "q01",
                type: "gaps",
                ask: "Herr Meier, woher ___?",
                answers: ["kommen"],
                gap_choices: ["kommst|komme"],
              },
            ],
          },
        ],
      },
      ui,
      rawCountries.country ?? [],
      { publicDir: join(root, "public") },
    );
    expect(
      report.errors.some((error) =>
        error.includes('does not contain the answer "kommen"'),
      ),
    ).toBe(true);
  });

  it("flags a section photo without alt", () => {
    const report = validateContent(
      {
        level: { id: "t", number: 1, title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "Переведите на немецкий.",
            photo: "img/fridge.webp",
            sr_data: "test",
            question: [
              {
                id: "q01",
                type: "yesno",
                ask: "Ist das eine Tomate?",
                answer: "Ja, das ist eine Tomate.",
              },
            ],
          },
        ],
      },
      ui,
      rawCountries.country ?? [],
      { publicDir: join(root, "public") },
    );
    expect(
      report.errors.some((error) => error.includes("photo without alt")),
    ).toBe(true);
  });

  it("flags a photo that does not exist", () => {
    const report = validateContent(
      {
        level: { id: "t", number: 1, title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "Переведите на немецкий.",
            question: [
              {
                id: "q01",
                type: "yesno",
                ask: "Ist das eine Tomate?",
                answer: "Ja, das ist eine Tomate.",
                photo: "img/does-not-exist.webp",
                alt: "test",
                sr_data: "test",
              },
            ],
          },
        ],
      },
      ui,
      rawCountries.country ?? [],
      { publicDir: join(root, "public") },
    );
    expect(
      report.errors.some((error) => error.includes("was not found in public/")),
    ).toBe(true);
  });
});

describe("language consistency", () => {
  function question(overrides: Record<string, unknown> = {}) {
    return {
      id: "q01",
      type: "gaps",
      ask: "Ich ___ müde.",
      explanation: "sein: ich bin.",
      answers: ["bin"],
      ...overrides,
    };
  }

  function level(overrides: Record<string, unknown> = {}) {
    return {
      level: { id: "sample-test-1", number: 1, title: "Test 1" },
      section: [
        { id: "s", title: "S", instruction: "Задание", question: [question()] },
      ],
      ...overrides,
    };
  }

  it("passes when two languages have the same answers", () => {
    const report = validateLanguageConsistency(
      [
        { lang: "ru", path: "content/ru/level-1.toml", level: level() },
        { lang: "uk", path: "content/uk/level-1.toml", level: level() },
      ],
      [],
    );
    expect(report.errors).toEqual([]);
  });

  it("allows translated instructions and explanations", () => {
    const translated = level();
    translated.section[0].instruction = "Завдання";
    translated.section[0].question[0].explanation = "sein: я є.";
    const report = validateLanguageConsistency(
      [
        { lang: "ru", path: "content/ru/level-1.toml", level: level() },
        { lang: "uk", path: "content/uk/level-1.toml", level: translated },
      ],
      [],
    );
    expect(report.errors).toEqual([]);
  });

  it("flags an answer that differs between languages", () => {
    const other = level();
    other.section[0].question[0].answers = ["bist"];
    const report = validateLanguageConsistency(
      [
        { lang: "ru", path: "content/ru/level-1.toml", level: level() },
        { lang: "uk", path: "content/uk/level-1.toml", level: other },
      ],
      [],
    );
    expect(report.errors.some((error) => error.includes("answers must be"))).toBe(
      true,
    );
  });

  it("flags a missing question", () => {
    const other = level();
    other.section[0].question = [];
    const report = validateLanguageConsistency(
      [
        { lang: "ru", path: "content/ru/level-1.toml", level: level() },
        { lang: "uk", path: "content/uk/level-1.toml", level: other },
      ],
      [],
    );
    expect(
      report.errors.some((error) => error.includes("Questions must match")),
    ).toBe(true);
  });

  it("flags a country whose article differs", () => {
    const country = { name: "Ukraine", article: "die", aus: "aus der Ukraine", ru: "Украина" };
    const report = validateLanguageConsistency(
      [],
      [
        {
          lang: "ru",
          path: "content/ru/countries.toml",
          countries: [country],
        },
        {
          lang: "uk",
          path: "content/uk/countries.toml",
          countries: [{ ...country, article: "" }],
        },
      ],
    );
    expect(
      report.errors.some((error) => error.includes("article must be")),
    ).toBe(true);
  });
});

describe("compiled content", () => {
  const data = content as unknown as CompiledContent;
  const level = data.levels[0];
  const questions = level.sections.flatMap((section) => section.questions);

  it("carries the level number", () => {
    expect(level.number).toBe(1);
  });

  it("contains 36 questions without q12 and without Personen", () => {
    expect(questions).toHaveLength(36);
    expect(questions.some((question) => question.id === "q12")).toBe(false);
    expect(level.sections.some((section) => section.id === "personen")).toBe(false);
  });

  it("keeps every question inside a known section", () => {
    const sectionIds = new Set(level.sections.map((section) => section.id));
    expect(sectionIds.size).toBe(6);
  });

  it("has an explanation for every question", () => {
    const missing = questions
      .filter((question) => !question.explanation)
      .map((question) => question.id);
    expect(missing).toEqual([]);
  });

  it("has a visible example on every section", () => {
    const missing = level.sections
      .filter((section) => !section.example)
      .map((section) => section.id);
    expect(missing).toEqual([]);
  });

  it("keeps question-level examples only where the question has its own task", () => {
    const withExample = questions
      .filter((question) => question.example)
      .map((question) => question.id);
    expect(withExample).toEqual(["q17", "q40"]);
  });

  it("writes prices in words, not digits", () => {
    for (const question of questions.filter((candidate) => candidate.type === "price")) {
      expect(/\d/.test(question.answer ?? ""), question.id).toBe(false);
    }
  });

  it("offers select options for conjugation questions", () => {
    for (const id of ["q06", "q07", "q08", "q32", "q33", "q34", "q35", "q36", "q37", "q38"]) {
      const question = questions.find((candidate) => candidate.id === id);
      expect(question, id).toBeTruthy();
      expect(question?.gap_choices?.some((choices) => choices.length > 1), id).toBe(true);
    }
  });

  it("has photo, alt and sr_data together wherever a photo is used", () => {
    for (const question of questions) {
      if (question.photo) {
        expect(question.alt, question.id).toBeTruthy();
        expect(question.sr_data, question.id).toBeTruthy();
      }
    }
    for (const section of level.sections) {
      if (section.photo) expect(section.alt, section.id).toBeTruthy();
      if (section.example_photo) expect(section.example_alt, section.id).toBeTruthy();
    }
  });

  it("references existing tables and countries", () => {
    for (const question of questions) {
      if (question.table) expect(level.tables[question.table], question.id).toBeTruthy();
      for (const field of [question.from, question.residence]) {
        if (!field) continue;
        const known = data.countries.some(
          (country) => country.name.toLowerCase() === field.toLowerCase(),
        );
        expect(known, `${question.id}: ${field}`).toBe(true);
      }
    }
    for (const section of level.sections) {
      if (section.table) expect(level.tables[section.table], section.id).toBeTruthy();
    }
  });
});
