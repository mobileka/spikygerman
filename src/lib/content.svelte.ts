import languagesIndex from "../generated/languages.json";
import type {
  CompiledContent,
  CompiledLevel,
  Country,
  LanguageInfo,
} from "./content/types";
import { format } from "./format";
import {
  browserLanguages,
  pickLanguage,
  readSavedLanguage,
  saveLanguage,
} from "./language";

// Every language is a separate chunk (content.<code>.json), so the entry
// bundle always ships exactly one language and adding another one changes
// nothing on startup. The list of what exists comes from the build.
const loaders = import.meta.glob<{ default: CompiledContent }>(
  "../generated/content.*.json",
);

export const availableLanguages: LanguageInfo[] = languagesIndex;

let current = $state<CompiledContent | null>(null);

function loaded(): CompiledContent {
  if (!current) {
    throw new Error("Content is not loaded yet — call initLanguage() first.");
  }
  return current;
}

export function getLang(): string {
  return loaded().lang;
}

export function getLevels(): CompiledLevel[] {
  return loaded().levels;
}

export function getCountries(): Country[] {
  return loaded().countries;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const template = loaded().ui[key] ?? key;
  return vars ? format(template, vars) : template;
}

export async function setLanguage(code: string): Promise<void> {
  const load = loaders[`../generated/content.${code}.json`];
  if (!load) throw new Error(`Unknown language: ${code}`);
  const content = (await load()).default;
  current = content;
  if (typeof document !== "undefined") {
    document.documentElement.lang = content.lang;
  }
  saveLanguage(content.lang);
}

// Saved choice → browser language → Russian fallback. Awaited in main.ts
// before the app mounts, so every consumer can read content synchronously.
export async function initLanguage(): Promise<void> {
  const code = pickLanguage(
    readSavedLanguage(),
    browserLanguages(),
    availableLanguages.map((language) => language.code),
  );
  await setLanguage(code);
}
