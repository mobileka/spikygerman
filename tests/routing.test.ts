import { describe, expect, it } from "vitest";
import { parseHash, sectionHash, summaryHash } from "../src/lib/routing.ts";

describe("routing", () => {
  it("parses home", () => {
    expect(parseHash("")).toEqual({ name: "home" });
    expect(parseHash("#")).toEqual({ name: "home" });
    expect(parseHash("#/")).toEqual({ name: "home" });
    expect(parseHash("#level-1")).toEqual({ name: "home" });
    expect(parseHash("#/l2")).toEqual({ name: "home" });
  });

  it("parses the summary", () => {
    expect(parseHash("#/summary")).toEqual({ name: "summary", level: 1 });
    expect(parseHash("#/l2/summary")).toEqual({ name: "summary", level: 2 });
  });

  it("parses level 1 sections and deep links to a question", () => {
    expect(parseHash("#/s/einkaufen")).toEqual({
      name: "section",
      level: 1,
      id: "einkaufen",
    });
    expect(parseHash("#/s/einkaufen/q13")).toEqual({
      name: "section",
      level: 1,
      id: "einkaufen",
      questionId: "q13",
    });
  });

  it("parses level 2 sections and deep links", () => {
    expect(parseHash("#/l2/familie")).toEqual({
      name: "section",
      level: 2,
      id: "familie",
    });
    expect(parseHash("#/l2/familie/q01")).toEqual({
      name: "section",
      level: 2,
      id: "familie",
      questionId: "q01",
    });
  });

  it("matches l2/summary before a section id", () => {
    expect(parseHash("#/l2/summary")).toEqual({ name: "summary", level: 2 });
  });

  it("ignores foreign hashes such as the skip link", () => {
    expect(parseHash("#content")).toBe(null);
  });

  it("builds hashes", () => {
    expect(sectionHash(1, "preise")).toBe("#/s/preise");
    expect(sectionHash(1, "preise", "q22")).toBe("#/s/preise/q22");
    expect(sectionHash(2, "familie")).toBe("#/l2/familie");
    expect(sectionHash(2, "familie", "q01")).toBe("#/l2/familie/q01");
    expect(summaryHash(1)).toBe("#/summary");
    expect(summaryHash(2)).toBe("#/l2/summary");
  });
});
