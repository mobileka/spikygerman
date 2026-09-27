// Which UI language to use, kept free of Svelte so it can be tested directly.
// The bundle loading itself lives in content.svelte.ts.

export const LANG_STORAGE_KEY = "spiky-lang";

// Russian stays the fallback for everyone else (most learners read it), but
// only while content/ru/ exists.
export const FALLBACK_LANG = "ru";

export function readSavedLanguage(): string | null {
  try {
    const value = localStorage.getItem(LANG_STORAGE_KEY);
    return value && value.trim() ? value.trim() : null;
  } catch {
    // Private mode: no saved choice, the session still works.
    return null;
  }
}

export function saveLanguage(code: string): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, code);
  } catch {
    // Private mode or full storage: the choice still applies for this session.
  }
}

// Browser preferences, most specific first: "uk-UA" → "uk".
export function browserLanguages(): string[] {
  if (typeof navigator === "undefined") return [];
  const tags = navigator.languages?.length
    ? [...navigator.languages]
    : [navigator.language];
  return tags
    .filter((tag): tag is string => typeof tag === "string" && tag.length > 0)
    .map((tag) => tag.toLowerCase().split("-")[0]);
}

// Saved choice wins, then the browser, then FALLBACK_LANG, then whatever
// content exists. An unknown saved code (its content was removed) is ignored.
export function pickLanguage(
  saved: string | null,
  browser: readonly string[],
  available: readonly string[],
): string {
  const savedCode = saved?.trim().toLowerCase() ?? "";
  if (savedCode && available.includes(savedCode)) return savedCode;
  for (const tag of browser) {
    const code = tag.toLowerCase().split("-")[0];
    if (available.includes(code)) return code;
  }
  if (available.includes(FALLBACK_LANG)) return FALLBACK_LANG;
  return available[0] ?? FALLBACK_LANG;
}
