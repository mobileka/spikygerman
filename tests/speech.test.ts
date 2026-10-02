import { describe, expect, it } from "vitest";
import { cleanSpeechText } from "../src/lib/speech.svelte";

describe("cleanSpeechText", () => {
  it("keeps letters, umlauts and digits", () => {
    expect(cleanSpeechText("heiße")).toBe("heiße");
    expect(cleanSpeechText("möchte")).toBe("möchte");
    expect(cleanSpeechText("2026")).toBe("2026");
  });

  it("strips quotes and sentence punctuation around a word", () => {
    expect(cleanSpeechText("«Hallo!»")).toBe("Hallo");
    expect(cleanSpeechText("„Guten Morgen,“")).toBe("Guten Morgen");
    expect(cleanSpeechText("Deutschland.")).toBe("Deutschland");
    expect(cleanSpeechText("?")).toBe("");
  });
});
