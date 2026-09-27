export type QuestionType =
  | "sentence"
  | "gaps"
  | "person"
  | "choice"
  | "yesno"
  | "price"
  | "translate";

export type Pronoun = "er" | "sie" | "sie-plural";

export interface Question {
  id: string;
  type: QuestionType;
  ask: string;
  instruction?: string;
  explanation?: string;
  translation?: string;
  example?: string;
  photo?: string;
  alt?: string;
  sr_data?: string;
  starts_with?: string;
  ends_with?: string;
  country?: boolean;
  answers?: string[][];
  answer_alternatives?: string[];
  gap_choices?: string[][];
  pronoun?: Pronoun;
  name?: string;
  from?: string;
  residence?: string;
  city?: string;
  street?: string;
  options?: string[];
  answer?: string;
  table?: string;
  frame?: string;
  answer_keywords?: string[];
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  example?: string;
  example_photo?: string;
  example_alt?: string;
  photo?: string;
  alt?: string;
  sr_data?: string;
  table?: string;
  questions: Question[];
}

export interface PriceTableRow {
  item: string;
  price: string;
}

export interface PriceTable {
  title: string;
  rows: PriceTableRow[];
}

export interface Country {
  name: string;
  article: "" | "die" | "der" | "plural";
  aus: string;
  local: string;
}

// One entry of src/generated/languages.json: what the language calls itself.
// The settings picker is built from this list only, so a new content/<code>/
// folder appears there without code changes.
export interface LanguageInfo {
  code: string;
  name: string;
}

export interface CompiledLevel {
  id: string;
  number: number;
  title: string;
  sections: Section[];
  tables: Record<string, PriceTable>;
}

export interface CompiledContent {
  lang: string;
  ui: Record<string, string>;
  levels: CompiledLevel[];
  countries: Country[];
}

// Raw shapes as parsed from TOML, before validation.

export interface RawQuestion {
  id?: string;
  type?: string;
  ask?: string;
  [key: string]: unknown;
}

export interface RawSection {
  id?: string;
  title?: string;
  instruction?: string;
  example?: string;
  example_photo?: string;
  example_alt?: string;
  photo?: string;
  alt?: string;
  sr_data?: string;
  table?: string;
  question?: RawQuestion[];
}

export interface RawCountry {
  name?: string;
  article?: string;
  aus?: string;
  local?: string;
}

export interface RawPriceTable {
  title?: string;
  row?: { item?: string; price?: string }[];
}

// One level in one language: content/ru/level-1.toml.
// German tasks and the file's own language live together.
export interface RawLevelFile {
  level?: { id?: string; number?: number; title?: string };
  section?: RawSection[];
  table?: Record<string, RawPriceTable>;
}

// How a language presents itself in the settings picker.
export interface RawLanguage {
  name?: string;
}

// Raw UI strings, one file per language: content/ru/ui.toml.
export interface RawUiFile {
  language?: RawLanguage;
  ui?: Record<string, unknown>;
}
