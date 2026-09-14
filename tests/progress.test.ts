import { describe, expect, it } from "vitest";
import {
  continueSectionId,
  countAnswered,
  progressPercent,
  totalQuestions,
} from "../src/lib/progress.ts";
import type { Section } from "../src/lib/content/types.ts";

const sections: Section[] = [
  {
    id: "s1",
    title: "S1",
    instruction: "",
    questions: [
      { id: "q01", type: "sentence", ask: "A?", starts_with: "Ich" },
      { id: "q02", type: "gaps", ask: "__ __", answers: [["a"], ["b"]] },
    ],
  },
  {
    id: "s2",
    title: "S2",
    instruction: "",
    questions: [
      {
        id: "q03",
        type: "choice",
        ask: "C?",
        options: ["der", "die"],
        answer: "der",
      },
      { id: "q04", type: "yesno", ask: "D?", answer: "Ja." },
    ],
  },
];

describe("countAnswered", () => {
  it("counts a question when any field has text", () => {
    expect(countAnswered(sections, { q01: { answer: "Ich heiße Anna" } })).toBe(
      1,
    );
  });

  it("counts a select or radio answer stored under its own field", () => {
    expect(countAnswered(sections, { q03: { choice: "der" } })).toBe(1);
  });

  it("counts a multi-gap question when at least one gap is filled", () => {
    expect(countAnswered(sections, { q02: { g1: "b" } })).toBe(1);
  });

  it("ignores empty and whitespace-only values", () => {
    expect(countAnswered(sections, { q01: { answer: "   " } })).toBe(0);
    expect(countAnswered(sections, { q02: { g0: "", g1: " " } })).toBe(0);
  });

  it("counts each answered question once", () => {
    expect(
      countAnswered(sections, {
        q01: { answer: "Ich heiße Anna" },
        q02: { g0: "a", g1: "b" },
      }),
    ).toBe(2);
  });

  it("returns zero when nothing is answered", () => {
    expect(countAnswered(sections, {})).toBe(0);
  });

  it("ignores answers for questions that are not in the test", () => {
    expect(countAnswered(sections, { q99: { answer: "x" } })).toBe(0);
  });
});

describe("totalQuestions", () => {
  it("sums the questions of every section", () => {
    expect(totalQuestions(sections)).toBe(4);
  });
});

describe("progressPercent", () => {
  it("rounds to the nearest percent", () => {
    expect(progressPercent(8, 36)).toBe(22);
    expect(progressPercent(36, 36)).toBe(100);
    expect(progressPercent(0, 36)).toBe(0);
  });

  it("handles an empty test", () => {
    expect(progressPercent(0, 0)).toBe(0);
  });
});

describe("continueSectionId", () => {
  it("points at the first section with an unchecked question", () => {
    expect(continueSectionId(sections, [])).toBe("s1");
  });

  it("skips sections whose questions are all checked", () => {
    expect(continueSectionId(sections, ["q01", "q02"])).toBe("s2");
  });

  it("stays on a section when only one question is checked", () => {
    expect(continueSectionId(sections, ["q01"])).toBe("s1");
  });

  it("falls back to the first section when everything is checked", () => {
    expect(continueSectionId(sections, ["q01", "q02", "q03", "q04"])).toBe(
      "s1",
    );
  });

  it("ignores checked ids that belong to no question", () => {
    expect(continueSectionId(sections, ["q99"])).toBe("s1");
  });

  it("returns null when there are no sections", () => {
    expect(continueSectionId([], [])).toBeNull();
  });
});
