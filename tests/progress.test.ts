import { describe, expect, it } from "vitest";
import {
  continueSectionId,
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

describe("totalQuestions", () => {
  it("sums the questions of every section", () => {
    expect(totalQuestions(sections)).toBe(4);
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
