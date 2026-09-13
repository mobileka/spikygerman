import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";
import { validateContent } from "../src/lib/content/validate.ts";
import type {
  CompiledContent,
  Country,
  Pronoun,
  PriceTable,
  Question,
  QuestionType,
  RawCountry,
  RawQuestion,
  RawStringsFile,
  RawTestFile,
  Section,
  StringsData,
} from "../src/lib/content/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

const rawTest = parse(read("content/test.toml")) as unknown as RawTestFile;
const rawStrings = parse(read("content/strings.ru.toml")) as unknown as RawStringsFile;
const rawCountries = parse(read("content/countries.toml")) as unknown as {
  country?: RawCountry[];
};

const report = validateContent(
  rawTest,
  rawStrings,
  rawCountries.country ?? [],
  { publicDir: join(root, "public") },
);
for (const warning of report.warnings) console.warn(`warning: ${warning}`);
if (report.errors.length) {
  for (const error of report.errors) console.error(`error: ${error}`);
  process.exit(1);
}

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
  const question: Question = {
    id: String(raw.id),
    type: raw.type as QuestionType,
    ask: String(raw.ask),
    ...(optionalString(raw.instruction) && { instruction: String(raw.instruction) }),
    ...(optionalString(raw.example) && { example: String(raw.example) }),
    ...(optionalString(raw.photo) && { photo: String(raw.photo) }),
    ...(optionalString(raw.alt) && { alt: String(raw.alt) }),
    ...(optionalString(raw.sr_data) && { sr_data: String(raw.sr_data) }),
    ...(optionalString(raw.starts_with) && { starts_with: String(raw.starts_with) }),
    ...(optionalString(raw.ends_with) && { ends_with: String(raw.ends_with) }),
    ...(raw.country === true && { country: true }),
    ...(Array.isArray(raw.answers) && {
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
  return question;
}

function stringRecord(source: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

const sections: Section[] = (rawTest.section ?? []).map((section) => ({
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

const tables: Record<string, PriceTable> = {};
for (const [id, table] of Object.entries(rawTest.table ?? {})) {
  tables[id] = {
    title: String(table.title ?? id),
    rows: (table.row ?? []).map((row) => ({
      item: String(row.item ?? ""),
      price: String(row.price ?? ""),
    })),
  };
}

const countries: Country[] = (rawCountries.country ?? []).map((country) => ({
  name: String(country.name),
  article: (country.article ?? "") as Country["article"],
  aus: String(country.aus),
  ru: String(country.ru ?? ""),
}));

const strings: StringsData = {
  ui: stringRecord(rawStrings.ui),
  instruction: stringRecord(rawStrings.instruction),
  explanation: stringRecord(rawStrings.explanation),
};

const content: CompiledContent = {
  test: {
    id: String(rawTest.test?.id),
    title: String(rawTest.test?.title ?? ""),
  },
  lang: "ru",
  sections,
  tables,
  countries,
  strings,
};

const questionCount = sections.reduce(
  (total, section) => total + section.questions.length,
  0,
);

mkdirSync(join(root, "src/generated"), { recursive: true });
writeFileSync(
  join(root, "src/generated/content.json"),
  `${JSON.stringify(content, null, 2)}\n`,
);
console.log(
  `content: ${questionCount} questions in ${sections.length} sections, ${countries.length} countries → src/generated/content.json`,
);
