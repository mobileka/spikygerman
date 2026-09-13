import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";
import { describe, expect, it } from "vitest";
import { validateContent } from "../src/lib/content/validate.ts";
import type {
  CompiledContent,
  RawCountry,
  RawStringsFile,
  RawTestFile,
} from "../src/lib/content/types.ts";
import content from "../src/generated/content.json";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

const rawTest = parse(read("content/test.toml")) as unknown as RawTestFile;
const rawStrings = parse(read("content/strings.ru.toml")) as unknown as RawStringsFile;
const rawCountries = parse(read("content/countries.toml")) as unknown as {
  country?: RawCountry[];
};

describe("content validation", () => {
  it("passes with no errors", () => {
    const report = validateContent(
      rawTest,
      rawStrings,
      rawCountries.country ?? [],
      { publicDir: join(root, "public") },
    );
    expect(report.errors).toEqual([]);
  });
});

describe("content validation errors are teacher-friendly", () => {
  const strings = rawStrings as unknown as RawStringsFile;

  it("explains a wrong choice answer", () => {
    const report = validateContent(
      {
        test: { id: "t", title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "translate",
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
      strings,
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
        test: { id: "t", title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "translate",
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
      strings,
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
        test: { id: "t", title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "translate",
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
      strings,
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
        test: { id: "t", title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "translate",
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
      strings,
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
        test: { id: "t", title: "T" },
        section: [
          {
            id: "s",
            title: "S",
            instruction: "translate",
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
      strings,
      rawCountries.country ?? [],
      { publicDir: join(root, "public") },
    );
    expect(
      report.errors.some((error) => error.includes("was not found in public/")),
    ).toBe(true);
  });
});

describe("compiled content", () => {
  const data = content as unknown as CompiledContent;
  const questions = data.sections.flatMap((section) => section.questions);

  it("contains 36 questions without q12 and without Personen", () => {
    expect(questions).toHaveLength(36);
    expect(questions.some((question) => question.id === "q12")).toBe(false);
    expect(data.sections.some((section) => section.id === "personen")).toBe(false);
  });

  it("keeps every question inside a known section", () => {
    const sectionIds = new Set(data.sections.map((section) => section.id));
    expect(sectionIds.size).toBe(6);
  });

  it("has an explanation for every question", () => {
    const missing = questions
      .filter((question) => !(question.id in data.strings.explanation))
      .map((question) => question.id);
    expect(missing).toEqual([]);
  });

  it("has a visible example on every section", () => {
    const missing = data.sections
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
    for (const section of data.sections) {
      if (section.photo) expect(section.alt, section.id).toBeTruthy();
      if (section.example_photo) expect(section.example_alt, section.id).toBeTruthy();
    }
  });

  it("references existing tables and countries", () => {
    for (const question of questions) {
      if (question.table) expect(data.tables[question.table], question.id).toBeTruthy();
      for (const field of [question.from, question.residence]) {
        if (!field) continue;
        const known = data.countries.some(
          (country) => country.name.toLowerCase() === field.toLowerCase(),
        );
        expect(known, `${question.id}: ${field}`).toBe(true);
      }
    }
    for (const section of data.sections) {
      if (section.table) expect(data.tables[section.table], section.id).toBeTruthy();
    }
  });
});
