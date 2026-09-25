import { describe, expect, it } from "vitest";
import content from "../src/generated/content.ru.json";
import { summarize, summarizeProgress } from "../src/lib/grading/summary.ts";
import { gapField } from "../src/lib/grading/grade.ts";
import type {
  CompiledContent,
  Country,
  Question,
  Section,
} from "../src/lib/content/types.ts";

const countries: Country[] = [
  {
    name: "Ukraine",
    article: "die",
    aus: "aus der Ukraine",
    ru: "Украина",
  },
];

const sections: Section[] = [
  {
    id: "s1",
    title: "S1",
    instruction: "",
    questions: [
      { id: "q01", type: "yesno", ask: "A?", answer: "Ja, das ist gut." },
      { id: "q02", type: "yesno", ask: "B?", answer: "Nein, das ist schlecht." },
    ],
  },
  {
    id: "s2",
    title: "S2",
    instruction: "",
    questions: [
      {
        id: "q03",
        type: "sentence",
        ask: "C?",
        starts_with: "Ich komme aus",
        country: true,
      },
      { id: "q04", type: "yesno", ask: "D?", answer: "Ja." },
      {
        id: "q05",
        type: "gaps",
        ask: "a) ___ b) ___",
        answers: [["kein"], ["keinen"]],
      },
    ],
  },
];

describe("summarize", () => {
  it("counts every correct answer", () => {
    const summary = summarize(
      sections,
      {
        q01: { answer: "Ja, das ist gut." },
        q02: { answer: "Nein, das ist schlecht." },
        q03: { answer: "Ich komme aus Deutschland" },
        q04: { answer: "Ja." },
        q05: { g0: "kein", g1: "keinen" },
      },
      countries,
    );
    expect(summary.total).toBe(5);
    expect(summary.answered).toBe(5);
    expect(summary.correct).toBe(5);
    expect(summary.almost).toBe(0);
    expect(summary.incorrect).toBe(0);
    expect(summary.empty).toBe(0);
    expect(summary.issues).toEqual([]);
    expect(summary.sections.map((entry) => entry.correct)).toEqual([2, 3]);
  });

  it("separates almost, incorrect and empty answers", () => {
    const summary = summarize(
      sections,
      {
        q01: { answer: "Ja, das ist gut." },
        q02: { answer: "Nein, das ist gut." },
        q03: { answer: "Ich komme aus Ukraine" },
      },
      countries,
    );
    expect(summary.correct).toBe(1);
    expect(summary.incorrect).toBe(1);
    expect(summary.almost).toBe(1);
    expect(summary.empty).toBe(2);
    expect(summary.answered).toBe(3);
    expect(summary.issues.map((issue) => issue.question.id)).toEqual([
      "q02",
      "q03",
      "q04",
      "q05",
    ]);
    expect(summary.issues.map((issue) => issue.status)).toEqual([
      "incorrect",
      "almost",
      "empty",
      "empty",
    ]);
    expect(summary.sections[0]).toMatchObject({ answered: 2, correct: 1, total: 2 });
    expect(summary.sections[1]).toMatchObject({ answered: 1, correct: 0, total: 3 });
  });

  it("does not count a half-filled answer as correct", () => {
    const summary = summarize(
      sections,
      { q05: { g0: "kein" } },
      countries,
    );
    expect(summary.correct).toBe(0);
    expect(summary.almost).toBe(1);
    expect(summary.empty).toBe(4);
    expect(summary.issues.map((issue) => issue.question.id)).toEqual([
      "q05",
      "q01",
      "q02",
      "q03",
      "q04",
    ]);
    expect(summary.issues.map((issue) => issue.status)).toEqual([
      "almost",
      "empty",
      "empty",
      "empty",
      "empty",
    ]);
  });

  it("lists errors first, then almosts, then unanswered", () => {
    const summary = summarize(
      sections,
      {
        q01: { answer: "Nein, das ist gut." },
        q03: { answer: "Ich komme aus Ukraine" },
      },
      countries,
    );
    expect(summary.issues.map((issue) => issue.question.id)).toEqual([
      "q01",
      "q03",
      "q02",
      "q04",
      "q05",
    ]);
    expect(summary.issues.map((issue) => issue.status)).toEqual([
      "incorrect",
      "almost",
      "empty",
      "empty",
      "empty",
    ]);
  });

  it("handles the empty test", () => {
    const summary = summarize(sections, {}, countries);
    expect(summary.answered).toBe(0);
    expect(summary.empty).toBe(5);
    expect(summary.issues.map((issue) => issue.status)).toEqual([
      "empty",
      "empty",
      "empty",
      "empty",
      "empty",
    ]);
  });

  it("counts typed-but-unchecked answers as empty when a checked list is given", () => {
    const summary = summarize(
      sections,
      {
        q01: { answer: "Ja, das ist gut." },
        q02: { answer: "Nein, das ist schlecht." },
      },
      countries,
      ["q01"],
    );
    expect(summary.answered).toBe(1);
    expect(summary.correct).toBe(1);
    expect(summary.empty).toBe(4);
    expect(summary.issues.map((issue) => issue.question.id)).toEqual([
      "q02",
      "q03",
      "q04",
      "q05",
    ]);
    expect(summary.issues.every((issue) => issue.status === "empty")).toBe(true);
  });
});

function modelValues(question: Question): Record<string, string> {
  switch (question.type) {
    case "sentence":
      return {
        answer: `${question.starts_with} Anna${
          question.ends_with ? ` ${question.ends_with}` : ""
        }`,
      };
    case "gaps":
      return Object.fromEntries(
        (question.answers ?? []).map((alternatives, index) => [
          gapField(index),
          alternatives[0] ?? "",
        ]),
      );
    case "person":
      return {
        pronoun: question.pronoun ?? "",
        name: question.name ?? "",
        from: question.from ?? "",
        residence: question.residence ?? "",
        city: question.city ?? "",
        street: question.street ?? "",
      };
    case "choice":
      return { choice: question.answer ?? "" };
    case "yesno":
    case "price":
    case "translate":
      return { answer: question.answer ?? "" };
  }
}

describe("summarizeProgress", () => {
  it("splits checked answers into correct, almost and incorrect", () => {
    const counts = summarizeProgress(
      sections,
      {
        q01: { answer: "Ja, das ist gut." },
        q02: { answer: "Nein, das ist gut." },
        q03: { answer: "Ich komme aus Ukraine" },
      },
      countries,
      ["q01", "q02", "q03"],
    );
    expect(counts).toMatchObject({
      total: 5,
      answered: 3,
      correct: 1,
      almost: 1,
      incorrect: 1,
    });
    expect(counts.sections).toEqual([
      { total: 2, answered: 2, correct: 1, almost: 0, incorrect: 1 },
      { total: 3, answered: 1, correct: 0, almost: 1, incorrect: 0 },
    ]);
  });

  it("ignores answers that have not been checked yet", () => {
    const counts = summarizeProgress(
      sections,
      { q01: { answer: "Ja, das ist gut." } },
      countries,
      [],
    );
    expect(counts.answered).toBe(0);
    expect(counts.correct).toBe(0);
    expect(counts.total).toBe(5);
  });

  it("does not count a checked question that has no answer", () => {
    const counts = summarizeProgress(sections, {}, countries, ["q04", "q05"]);
    expect(counts.answered).toBe(0);
    expect(counts.total).toBe(5);
  });
});

describe("summarize with the real content", () => {
  const data = content as unknown as CompiledContent;

  it("counts every level's model answers as correct", () => {
    for (const level of data.levels) {
      const answers: Record<string, Record<string, string>> = {};
      const questions = level.sections.flatMap((section) => section.questions);
      for (const question of questions) {
        answers[question.id] = modelValues(question);
      }
      const summary = summarize(level.sections, answers, data.countries);
      expect(summary.total, level.id).toBe(questions.length);
      expect(summary.correct, level.id).toBe(questions.length);
      expect(summary.issues, level.id).toEqual([]);
    }
  });

  it("counts 36 and 40 questions in the two real levels", () => {
    const totals = data.levels.map((level) =>
      level.sections.reduce((total, section) => total + section.questions.length, 0),
    );
    expect(totals).toEqual([36, 40]);
  });

  it("gives every section its own checked counts", () => {
    const level = data.levels[0];
    const answers: Record<string, Record<string, string>> = {};
    for (const section of level.sections) {
      for (const question of section.questions) {
        answers[question.id] = modelValues(question);
      }
    }
    const counts = summarizeProgress(
      level.sections,
      answers,
      data.countries,
      Object.keys(answers),
    );
    expect(counts.sections).toHaveLength(6);
    expect(counts.sections.every((entry) => entry.correct === entry.total)).toBe(
      true,
    );
    expect(counts.correct).toBe(36);
  });
});
