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
  example?: string;
  photo?: string;
  alt?: string;
  sr_data?: string;
  starts_with?: string;
  ends_with?: string;
  country?: boolean;
  answers?: string[][];
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
  ru: string;
}

export interface StringsData {
  ui: Record<string, string>;
  instruction: Record<string, string>;
  explanation: Record<string, string>;
}

export interface CompiledContent {
  test: { id: string; title: string };
  lang: string;
  sections: Section[];
  tables: Record<string, PriceTable>;
  countries: Country[];
  strings: StringsData;
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
  ru?: string;
}

export interface RawPriceTable {
  title?: string;
  row?: { item?: string; price?: string }[];
}

export interface RawTestFile {
  test?: { id?: string; title?: string };
  section?: RawSection[];
  table?: Record<string, RawPriceTable>;
}

export interface RawStringsFile {
  ui?: Record<string, unknown>;
  instruction?: Record<string, unknown>;
  explanation?: Record<string, unknown>;
}
