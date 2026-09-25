import data from "../generated/content.ru.json";
import type { CompiledContent } from "./content/types";
import { format } from "./format";

const compiled = data as unknown as CompiledContent;

// One language is bundled today; switching languages is a later step.
export const lang = compiled.lang;

// The app presents one level at a time. The level rails (choosing between
// levels on home) come with Level 2; everything below reads the first level.
const level = compiled.levels[0];

export const content = {
  lang: compiled.lang,
  ui: compiled.ui,
  countries: compiled.countries,
  test: { id: level.id, title: level.title },
  sections: level.sections,
  tables: level.tables,
};

export function t(key: string, vars?: Record<string, string | number>): string {
  const template = content.ui[key] ?? key;
  return vars ? format(template, vars) : template;
}
