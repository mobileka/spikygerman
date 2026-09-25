import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";
import {
  validateContent,
  validateLanguageConsistency,
  type LanguageCountries,
  type LanguageLevel,
} from "../src/lib/content/validate.ts";
import type {
  CompiledContent,
  CompiledLevel,
  Country,
  PriceTable,
  Pronoun,
  Question,
  QuestionType,
  RawCountry,
  RawLevelFile,
  RawQuestion,
  RawUiFile,
  Section,
} from "../src/lib/content/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const generatedDir = join(root, "src/generated");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length ? value : undefined;
}

function parseGapChoices(raw: unknown): string[][] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.map((entry) =>
    typeof entry === "string" && entry.trim()
      ? entry.split("|").map((option) => option.trim()).filter(Boolean)
      : [],
  );
}

function compileQuestion(raw: RawQuestion): Question {
  return {
    id: String(raw.id),
    type: raw.type as QuestionType,
    ask: String(raw.ask),
    ...(optionalString(raw.instruction) && { instruction: String(raw.instruction) }),
    ...(optionalString(raw.explanation) && { explanation: String(raw.explanation) }),
    ...(optionalString(raw.example) && { example: String(raw.example) }),
    ...(optionalString(raw.photo) && { photo: String(raw.photo) }),
    ...(optionalString(raw.alt) && { alt: String(raw.alt) }),
    ...(optionalString(raw.sr_data) && { sr_data: String(raw.sr_data) }),
    ...(optionalString(raw.starts_with) && { starts_with: String(raw.starts_with) }),
    ...(optionalString(raw.ends_with) && { ends_with: String(raw.ends_with) }),
    ...(raw.country === true && { country: true }),
    ...(raw.type === "yesno" && Array.isArray(raw.answers) && {
      answer_alternatives: raw.answers.map(String),
    }),
    ...(raw.type !== "yesno" && Array.isArray(raw.answers) && {
      answers: raw.answers.map((entry) =>
        Array.isArray(entry) ? entry.map(String) : [String(entry)],
      ),
    }),
    ...(parseGapChoices(raw.gap_choices) && {
      gap_choices: parseGapChoices(raw.gap_choices),
    }),
    ...(optionalString(raw.pronoun) && { pronoun: raw.pronoun as Pronoun }),
    ...(optionalString(raw.name) && { name: String(raw.name) }),
    ...(optionalString(raw.from) && { from: String(raw.from) }),
    ...(optionalString(raw.residence) && { residence: String(raw.residence) }),
    ...(optionalString(raw.city) && { city: String(raw.city) }),
    ...(optionalString(raw.street) && { street: String(raw.street) }),
    ...(Array.isArray(raw.options) && { options: raw.options.map(String) }),
    ...(optionalString(raw.answer) && { answer: String(raw.answer) }),
    ...(optionalString(raw.table) && { table: String(raw.table) }),
    ...(optionalString(raw.frame) && { frame: String(raw.frame) }),
    ...(Array.isArray(raw.answer_keywords) && {
      answer_keywords: raw.answer_keywords.map(String),
    }),
  };
}

function compileSections(rawLevel: RawLevelFile): Section[] {
  return (rawLevel.section ?? []).map((section) => ({
    id: String(section.id),
    title: String(section.title),
    instruction: section.instruction ? String(section.instruction) : "",
    ...(optionalString(section.example) && { example: String(section.example) }),
    ...(optionalString(section.example_photo) && {
      example_photo: String(section.example_photo),
    }),
    ...(optionalString(section.example_alt) && { example_alt: String(section.example_alt) }),
    ...(optionalString(section.photo) && { photo: String(section.photo) }),
    ...(optionalString(section.alt) && { alt: String(section.alt) }),
    ...(optionalString(section.sr_data) && { sr_data: String(section.sr_data) }),
    ...(optionalString(section.table) && { table: String(section.table) }),
    questions: (section.question ?? []).map(compileQuestion),
  }));
}

function compileTables(rawLevel: RawLevelFile): Record<string, PriceTable> {
  const tables: Record<string, PriceTable> = {};
  for (const [id, table] of Object.entries(rawLevel.table ?? {})) {
    tables[id] = {
      title: String(table.title ?? id),
      rows: (table.row ?? []).map((row) => ({
        item: String(row.item ?? ""),
        price: String(row.price ?? ""),
      })),
    };
  }
  return tables;
}

function stringRecord(source: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

// One directory per language: content/ru/, content/uk/, …
function languageDirs(): string[] {
  return readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((lang) => existsSync(join(contentDir, lang, "ui.toml")))
    .sort();
}

function levelFiles(lang: string): string[] {
  return readdirSync(join(contentDir, lang))
    .filter((name) => /^level-\d+\.toml$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

interface LanguageBundle {
  lang: string;
  ui: RawUiFile;
  countries: RawCountry[];
  countriesPath: string;
  levels: Array<{ path: string; raw: RawLevelFile }>;
}

function loadLanguage(lang: string): LanguageBundle {
  const dir = join(contentDir, lang);
  return {
    lang,
    ui: parse(readFileSync(join(dir, "ui.toml"), "utf8")) as unknown as RawUiFile,
    countries: (
      parse(readFileSync(join(dir, "countries.toml"), "utf8")) as unknown as {
        country?: RawCountry[];
      }
    ).country ?? [],
    countriesPath: `content/${lang}/countries.toml`,
    levels: levelFiles(lang).map((name) => ({
      path: `content/${lang}/${name}`,
      raw: parse(readFileSync(join(dir, name), "utf8")) as unknown as RawLevelFile,
    })),
  };
}

const languages = languageDirs().map(loadLanguage);

const errors: string[] = [];
const warnings: string[] = [];

for (const language of languages) {
  if (!language.levels.length) {
    errors.push(`${language.countriesPath.replace(/countries\.toml$/, "")}: no level-*.toml file.`);
  }
  for (const level of language.levels) {
    const report = validateContent(level.raw, language.ui, language.countries, {
      publicDir: join(root, "public"),
      levelFile: level.path,
      uiFile: `content/${language.lang}/ui.toml`,
      countriesFile: language.countriesPath,
    });
    errors.push(...report.errors);
    warnings.push(...report.warnings);
  }
}

const consistency = validateLanguageConsistency(
  languages.flatMap<LanguageLevel>((language) =>
    language.levels.map((level) => ({
      lang: language.lang,
      path: level.path,
      level: level.raw,
    })),
  ),
  languages.map<LanguageCountries>((language) => ({
    lang: language.lang,
    path: language.countriesPath,
    countries: language.countries,
  })),
);
errors.push(...consistency.errors);
warnings.push(...consistency.warnings);

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}

mkdirSync(generatedDir, { recursive: true });

for (const language of languages) {
  const levels: CompiledLevel[] = language.levels.map((entry) => ({
    id: String(entry.raw.level?.id),
    number: Number(entry.raw.level?.number),
    title: String(entry.raw.level?.title ?? ""),
    sections: compileSections(entry.raw),
    tables: compileTables(entry.raw),
  }));

  const countries: Country[] = language.countries.map((country) => ({
    name: String(country.name),
    article: (country.article ?? "") as Country["article"],
    aus: String(country.aus),
    ru: String(country.ru ?? ""),
  }));

  const content: CompiledContent = {
    lang: language.lang,
    ui: stringRecord(language.ui.ui),
    levels,
    countries,
  };

  const file = join(generatedDir, `content.${language.lang}.json`);
  writeFileSync(file, `${JSON.stringify(content, null, 2)}\n`);

  const questionCount = levels.reduce(
    (total, level) =>
      total + level.sections.reduce((sum, section) => sum + section.questions.length, 0),
    0,
  );
  console.log(
    `content: ${language.lang} — ${levels.length} level(s), ${questionCount} questions, ${countries.length} countries → src/generated/content.${language.lang}.json`,
  );
}
