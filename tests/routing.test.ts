import { describe, expect, it } from "vitest";
import { SUMMARY_HASH, parseHash, sectionHash } from "../src/lib/routing.ts";

describe("routing", () => {
  it("parses home", () => {
    expect(parseHash("")).toEqual({ name: "home" });
    expect(parseHash("#")).toEqual({ name: "home" });
    expect(parseHash("#/")).toEqual({ name: "home" });
    expect(parseHash("#level-1")).toEqual({ name: "home" });
  });

  it("parses the summary", () => {
    expect(parseHash("#/summary")).toEqual({ name: "summary" });
  });

  it("parses sections and deep links to a question", () => {
    expect(parseHash("#/s/einkaufen")).toEqual({
      name: "section",
      id: "einkaufen",
    });
    expect(parseHash("#/s/einkaufen/q13")).toEqual({
      name: "section",
      id: "einkaufen",
      questionId: "q13",
    });
  });

  it("ignores foreign hashes such as the skip link", () => {
    expect(parseHash("#content")).toBe(null);
  });

  it("builds hashes", () => {
    expect(sectionHash("preise")).toBe("#/s/preise");
    expect(sectionHash("preise", "q22")).toBe("#/s/preise/q22");
    expect(SUMMARY_HASH).toBe("#/summary");
  });
});
