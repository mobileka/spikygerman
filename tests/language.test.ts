import { describe, expect, it } from "vitest";
import {
  FALLBACK_LANG,
  browserLanguages,
  pickLanguage,
} from "../src/lib/language";

describe("pickLanguage", () => {
  const available = ["ru", "uk"];

  it("keeps a saved language that still exists", () => {
    expect(pickLanguage("uk", ["ru"], available)).toBe("uk");
    expect(pickLanguage(" RU ", ["uk"], available)).toBe("ru");
  });

  it("ignores a saved language whose content is gone", () => {
    expect(pickLanguage("de", ["uk"], available)).toBe("uk");
  });

  it("follows the browser when nothing is saved", () => {
    expect(pickLanguage(null, ["uk-UA", "ru"], available)).toBe("uk");
    expect(pickLanguage(null, ["ru-RU"], available)).toBe("ru");
    expect(pickLanguage(null, ["en", "uk"], available)).toBe("uk");
  });

  it("falls back to Russian when no browser language matches", () => {
    expect(pickLanguage(null, ["en-US", "de"], available)).toBe(FALLBACK_LANG);
    expect(pickLanguage(null, [], available)).toBe("ru");
  });

  it("falls back to whatever content exists when ru is not there", () => {
    expect(pickLanguage(null, ["en"], ["uk"])).toBe("uk");
  });

  it("does not break without content", () => {
    expect(pickLanguage(null, ["en"], [])).toBe(FALLBACK_LANG);
  });
});

describe("browserLanguages", () => {
  it("returns lowercase language subtags without the region", () => {
    for (const tag of browserLanguages()) {
      expect(tag).toBe(tag.toLowerCase());
      expect(tag).not.toContain("-");
    }
  });
});
