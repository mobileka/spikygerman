import data from "../generated/content.ru.json";
import type { CompiledContent, CompiledLevel, Country } from "./content/types";
import { format } from "./format";

const compiled = data as unknown as CompiledContent;

// One language is bundled today; switching languages is a later step.
export const lang = compiled.lang;
export const ui = compiled.ui;
export const countries: Country[] = compiled.countries;
export const levels: CompiledLevel[] = compiled.levels;

export function levelByNumber(number: number): CompiledLevel | undefined {
  return levels.find((level) => level.number === number);
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const template = ui[key] ?? key;
  return vars ? format(template, vars) : template;
}
