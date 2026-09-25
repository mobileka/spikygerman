import { existsSync } from "node:fs";
import { join } from "node:path";
import { countBlanks } from "../grading/normalize";
import type {
  RawCountry,
  RawLevelFile,
  RawQuestion,
  RawSection,
  RawUiFile,
} from "./types";

export interface ValidationReport {
  errors: string[];
  warnings: string[];
}

export interface ValidateOptions {
  publicDir: string;
  /** Teacher-facing paths, used in messages. */
  levelFile?: string;
  uiFile?: string;
  countriesFile?: string;
}

const DEFAULT_LEVEL_FILE = "level.toml";
const DEFAULT_UI_FILE = "ui.toml";
const DEFAULT_COUNTRIES_FILE = "countries.toml";

const QUESTION_TYPES = [
  "sentence",
  "gaps",
  "person",
  "choice",
  "yesno",
  "price",
  "translate",
] as const;

const PRONOUNS = ["er", "sie", "sie-plural"];

const REQUIRED_UI_KEYS = [
  "skip_link",
  "logo_home_label",
  "brand_subtitle",
  "level_chip",
  "theme_to_dark",
  "theme_to_light",
  "progress_answered",
  "home_hero",
  "level_summary",
  "main_nav_label",
  "tab_home",
  "tab_continue",
  "check",
  "back",
  "next",
  "home",
  "section_picker_label",
  "select_placeholder",
  "example_label",
  "model_answer",
  "explanation_label",
  "result_correct",
  "result_almost",
  "result_incorrect",
  "result_empty",
  "hint_start_with",
  "hint_end_with",
  "hint_country",
  "hint_missing",
  "hint_missing_sentence",
  "hint_frame",
  "hint_umlaut",
  "article_die",
  "article_der",
  "article_plural",
  "gap_label",
  "answer_label",
  "pronoun_label",
  "pronoun_er",
  "pronoun_sie",
  "pronoun_sie_plural",
  "name_label",
  "from_label",
  "residence_label",
  "city_label",
  "street_label",
  "question_label",
  "summary_title",
  "summary_count_correct",
  "summary_count_almost",
  "summary_count_incorrect",
  "summary_count_empty",
  "summary_section_line",
  "summary_issues_title",
  "summary_show_more",
  "summary_no_issues",
  "reset",
  "reset_confirm",
];

interface QuestionContext {
  label: string;
  countryNames: Set<string>;
  tables: Set<string>;
  publicDir: string;
  countriesFile: string;
  err: (message: string) => void;
  warn: (message: string) => void;
}

function validateQuestion(q: RawQuestion, ctx: QuestionContext): void {
  const { label, err, warn } = ctx;
  const type = typeof q.type === "string" ? q.type : "";

  if (!q.id) err(`${label}: you forgot id = "qNN".`);
  if (!type) err(`${label}: you forgot type = "...".`);
  else if (!(QUESTION_TYPES as readonly string[]).includes(type)) {
    err(
      `${label}: type = "${type}" is unknown. Use one of: ${QUESTION_TYPES.join(", ")}.`,
    );
  }
  if (!q.ask) err(`${label}: you forgot ask = "..." (the task in German).`);
  if (!q.explanation) {
    warn(`${label}: no explanation. Add explanation = "…" in the file's language.`);
  }

  if (q.photo) {
    if (!q.alt) err(`${label}: photo without alt. Add alt = "one short sentence".`);
    if (!q.sr_data) {
      err(`${label}: photo without sr_data. Add sr_data = "what a blind learner hears".`);
    }
    if (!existsSync(join(ctx.publicDir, String(q.photo)))) {
      err(
        `${label}: photo = "${q.photo}" was not found in public/. Check the file name.`,
      );
    }
  } else if (q.alt || q.sr_data) {
    warn(`${label}: alt/sr_data without photo — did you forget photo = "img/..."?`);
  }

  if (q.example && !String(q.example).trim()) {
    warn(`${label}: example is empty. Remove the line.`);
  }

  switch (type) {
    case "sentence": {
      if (!q.starts_with) {
        err(`${label}: sentence needs starts_with = "..." (how the sentence starts).`);
      }
      if (q.country && !String(q.starts_with ?? "").toLowerCase().includes("komme aus")) {
        warn(`${label}: country = true is meant for "Ich komme aus …".`);
      }
      break;
    }
    case "gaps": {
      const answers = q.answers;
      if (!Array.isArray(answers) || !answers.length) {
        err(`${label}: gaps needs answers = ["..."] (one entry per gap).`);
      } else {
        const blanks = countBlanks(String(q.ask ?? ""));
        if (blanks !== answers.length) {
          err(
            `${label}: ask has ${blanks} gap(s) (___) but answers has ${answers.length}. They must be equal.`,
          );
        }
        answers.forEach((answer, index) => {
          const alternatives = Array.isArray(answer) ? answer : [answer];
          if (
            !alternatives.length ||
            alternatives.some(
              (alternative) => typeof alternative !== "string" || !alternative.trim(),
            )
          ) {
            err(
              `${label}: answers[${index}] is empty. Write "word" or ["word", "alternative"].`,
            );
          }
        });

        const alternativesFor = (index: number): string[] => {
          const answer = answers[index];
          return (Array.isArray(answer) ? answer : [answer]).map(String);
        };

        const choices = q.gap_choices;
        if (choices !== undefined) {
          if (!Array.isArray(choices)) {
            err(`${label}: gap_choices must be a list, one entry per gap.`);
          } else {
            if (choices.length !== answers.length) {
              err(
                `${label}: gap_choices has ${choices.length} entries but there are ${answers.length} gaps. Use "" for a text field.`,
              );
            }
            choices.forEach((entry, index) => {
              const text = String(entry ?? "");
              if (!text.trim()) return;
              const options = text.split("|").map((option) => option.trim()).filter(Boolean);
              if (options.length < 2) {
                err(
                  `${label}: gap_choices[${index}] = "${text}" needs at least two options, e.g. "kommen|kommst".`,
                );
              }
              const missing = alternativesFor(index).filter(
                (alternative) => !options.includes(alternative),
              );
              if (missing.length) {
                err(
                  `${label}: gap_choices[${index}] = "${text}" does not contain the answer "${missing[0]}".`,
                );
              }
            });
          }
        }
      }
      break;
    }
    case "person": {
      if (!(PRONOUNS as readonly string[]).includes(String(q.pronoun))) {
        err(`${label}: person needs pronoun = "er", "sie" or "sie-plural".`);
      }
      for (const fieldName of ["name", "from", "residence", "city", "street"]) {
        if (!q[fieldName]) err(`${label}: person needs ${fieldName} = "...".`);
      }
      for (const fieldName of ["from", "residence"]) {
        const value = q[fieldName];
        if (value && !ctx.countryNames.has(String(value).toLowerCase())) {
          warn(
            `${label}: ${fieldName} = "${value}" is not in ${ctx.countriesFile} — no article hint there.`,
          );
        }
      }
      break;
    }
    case "choice": {
      const options = q.options;
      if (!Array.isArray(options) || options.length < 2) {
        err(`${label}: choice needs options = ["...", "..."].`);
      }
      if (!q.answer) {
        err(`${label}: choice needs answer = "..." (one of the options).`);
      } else if (Array.isArray(options) && !options.includes(q.answer)) {
        err(
          `${label}: answer = "${q.answer}" is not one of the options ${options.join(" / ")}. Did you mean one of ${options.join("/")}?`,
        );
      }
      break;
    }
    case "yesno": {
      if (!q.answer) err(`${label}: yesno needs answer = "..." (the full sentence).`);
      break;
    }
    case "price": {
      if (!q.answer) err(`${label}: price needs answer = "..." (the full sentence).`);
      if (q.table && !ctx.tables.has(String(q.table))) {
        err(`${label}: table = "${q.table}" is not defined as [table.${q.table}].`);
      }
      break;
    }
    case "translate": {
      if (!q.frame) err(`${label}: translate needs frame = "..." (e.g. "wir brauchen").`);
      const keywords = q.answer_keywords;
      if (!Array.isArray(keywords) || !keywords.length) {
        err(`${label}: translate needs answer_keywords = ["...", "..."] .`);
      }
      if (!q.answer) err(`${label}: translate needs answer = "..." (the model answer).`);
      break;
    }
  }
}

function validateCountries(
  countries: RawCountry[],
  countriesFile: string,
  err: (message: string) => void,
  warn: (message: string) => void,
): void {
  if (!countries.length) warn(`${countriesFile}: no countries yet.`);
  const seen = new Set<string>();
  countries.forEach((country, index) => {
    const label = country.name ? `country "${country.name}"` : `country #${index + 1}`;
    if (!country.name) err(`${label}: you forgot name = "...".`);
    if (!country.aus) err(`${label}: you forgot aus = "aus …".`);
    else if (!country.aus.startsWith("aus ")) {
      err(`${label}: aus = "${country.aus}" must start with "aus " (e.g. "aus der Ukraine").`);
    }
    if (!country.ru) warn(`${label}: no ru = "…" (Russian label for hints).`);
    if (!["", "die", "der", "plural"].includes(String(country.article ?? ""))) {
      err(
        `${label}: article = "${country.article}" is not valid. Use "", "die", "der" or "plural".`,
      );
    }
    if (country.name) {
      const key = country.name.toLowerCase();
      if (seen.has(key)) err(`${label}: duplicate country.`);
      seen.add(key);
    }
  });
}

function validateSectionAssets(
  section: RawSection,
  context: {
    label: string;
    publicDir: string;
    tables: Set<string>;
    err: (message: string) => void;
    warn: (message: string) => void;
  },
): void {
  const { label, publicDir, tables, err, warn } = context;

  if (section.example_photo) {
    if (!section.example_alt) {
      err(`${label}: example_photo without example_alt. Add example_alt = "one short sentence".`);
    }
    if (!existsSync(join(publicDir, String(section.example_photo)))) {
      err(
        `${label}: example_photo = "${section.example_photo}" was not found in public/. Check the file name.`,
      );
    }
  } else if (section.example_alt) {
    warn(`${label}: example_alt without example_photo — did you forget example_photo = "img/..."?`);
  }

  if (section.photo) {
    if (!section.alt) err(`${label}: photo without alt. Add alt = "one short sentence".`);
    if (!section.sr_data && !section.table) {
      warn(
        `${label}: photo without sr_data and without table — blind learners have no equivalent text.`,
      );
    }
    if (!existsSync(join(publicDir, String(section.photo)))) {
      err(
        `${label}: photo = "${section.photo}" was not found in public/. Check the file name.`,
      );
    }
  } else if (section.alt || section.sr_data) {
    warn(`${label}: alt/sr_data without photo — did you forget photo = "img/..."?`);
  }

  if (section.table && !tables.has(String(section.table))) {
    err(`${label}: table = "${section.table}" is not defined as [table.${section.table}].`);
  }

  if (section.example !== undefined && !String(section.example).trim()) {
    warn(`${label}: example is empty. Remove the line.`);
  }
}

export function validateContent(
  level: RawLevelFile,
  ui: RawUiFile,
  countries: RawCountry[],
  options: ValidateOptions,
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const err = (message: string) => errors.push(message);
  const warn = (message: string) => warnings.push(message);
  const levelFile = options.levelFile ?? DEFAULT_LEVEL_FILE;
  const uiFile = options.uiFile ?? DEFAULT_UI_FILE;
  const countriesFile = options.countriesFile ?? DEFAULT_COUNTRIES_FILE;

  if (!level.level?.id) err(`${levelFile} [level]: you forgot id = "..."`);
  if (typeof level.level?.number !== "number") {
    err(`${levelFile} [level]: you forgot number = 1 (or 2, …).`);
  }
  if (!level.level?.title) warn(`${levelFile} [level]: no title.`);

  const uiKeys = new Set(Object.keys(ui.ui ?? {}));
  for (const key of REQUIRED_UI_KEYS) {
    if (!uiKeys.has(key)) err(`${uiFile} [ui]: you forgot ${key} = "..."`);
  }

  validateCountries(countries, countriesFile, err, warn);
  const countryNames = new Set(
    countries.map((country) => String(country.name ?? "").toLowerCase()),
  );

  const tables = level.table ?? {};
  for (const [id, table] of Object.entries(tables)) {
    if (!table.title) warn(`[table.${id}]: no title.`);
    const rows = table.row ?? [];
    if (!rows.length) err(`[table.${id}]: no rows. Add [[table.${id}.row]] item = "...", price = "...".`);
    rows.forEach((row, index) => {
      if (!row.item) err(`[table.${id}] row #${index + 1}: you forgot item = "...".`);
      if (!row.price) err(`[table.${id}] row #${index + 1}: you forgot price = "...".`);
    });
  }

  const sections = level.section ?? [];
  if (!sections.length) err(`${levelFile}: at least one [[section]] is needed.`);

  const seenSectionIds = new Set<string>();
  const seenQuestionIds = new Set<string>();
  let questionCount = 0;

  sections.forEach((section, sectionIndex) => {
    const where = section.id
      ? `section "${section.id}"`
      : `section #${sectionIndex + 1}`;
    if (!section.id) err(`${where}: you forgot id = "...".`);
    else if (seenSectionIds.has(section.id)) err(`${where}: duplicate section id.`);
    seenSectionIds.add(String(section.id ?? ""));

    if (!section.title) warn(`${where}: no title.`);
    if (section.instruction !== undefined && !String(section.instruction).trim()) {
      warn(`${where}: instruction is empty. Remove the line or write the task.`);
    }

    validateSectionAssets(section, {
      label: where,
      publicDir: options.publicDir,
      tables: new Set(Object.keys(tables)),
      err,
      warn,
    });

    const questions = section.question ?? [];
    if (!questions.length) warn(`${where}: no questions.`);

    questions.forEach((question, questionIndex) => {
      const label = question.id ? String(question.id) : `${where} question #${questionIndex + 1}`;
      questionCount++;
      if (!question.id) err(`${where} question #${questionIndex + 1}: you forgot id = "qNN".`);
      else if (seenQuestionIds.has(question.id)) err(`${label}: duplicate question id.`);
      else seenQuestionIds.add(question.id);

      validateQuestion(question, {
        label,
        countryNames,
        tables: new Set(Object.keys(tables)),
        publicDir: options.publicDir,
        countriesFile,
        err,
        warn,
      });
    });
  });

  if (questionCount && questionCount !== seenQuestionIds.size) {
    warn(`${levelFile}: some questions have no id, so progress cannot be saved for them.`);
  }

  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Cross-language consistency
// ---------------------------------------------------------------------------
//
// Every language carries its own copy of a level. The German task and the
// answers must not drift apart, while instructions, explanations, alt and
// sr_data are allowed (and expected) to differ. This check compares the
// answer-bearing parts of every language against the first language.

export interface LanguageLevel {
  lang: string;
  path: string;
  level: RawLevelFile;
}

export interface LanguageCountries {
  lang: string;
  path: string;
  countries: RawCountry[];
}

// Fields that must match in every language. Text fields — ask (for translate),
// instruction, explanation, example, alt, sr_data — are intentionally absent.
const COMPARED_QUESTION_FIELDS = [
  "type",
  "starts_with",
  "ends_with",
  "country",
  "answers",
  "gap_choices",
  "pronoun",
  "name",
  "from",
  "residence",
  "city",
  "street",
  "options",
  "answer",
  "table",
  "frame",
  "answer_keywords",
  "photo",
] as const;

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function show(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function compareLevels(
  reference: LanguageLevel,
  other: LanguageLevel,
  err: (message: string) => void,
): void {
  const subject = `${other.path}`;
  const referencePath = reference.path;
  const referenceLevel = reference.level.level ?? {};
  const otherLevel = other.level.level ?? {};

  if (otherLevel.id !== referenceLevel.id) {
    err(
      `${subject} [level]: id = "${otherLevel.id}" must match "${referenceLevel.id}" in ${referencePath}.`,
    );
  }

  const referenceSections = reference.level.section ?? [];
  const otherSections = other.level.section ?? [];

  if (otherSections.length !== referenceSections.length) {
    err(
      `${subject}: ${otherSections.length} section(s) but ${referencePath} has ${referenceSections.length}. Sections must match.`,
    );
  }

  const count = Math.max(referenceSections.length, otherSections.length);
  for (let index = 0; index < count; index++) {
    const referenceSection = referenceSections[index];
    const otherSection = otherSections[index];
    if (!referenceSection) {
      err(`${subject}: section "${otherSection?.id}" is not in ${referencePath}.`);
      continue;
    }
    if (!otherSection) {
      err(`${subject}: section "${referenceSection.id}" is missing.`);
      continue;
    }

    const where = `section "${otherSection.id ?? index + 1}"`;
    if (otherSection.id !== referenceSection.id) {
      err(
        `${subject}: ${where}: id must be "${referenceSection.id}" (as in ${referencePath}).`,
      );
      continue;
    }
    for (const field of ["photo", "example_photo", "table"] as const) {
      if (!sameValue(otherSection[field], referenceSection[field])) {
        err(
          `${subject}: ${where}: ${field} must be ${show(referenceSection[field])} (as in ${referencePath}).`,
        );
      }
    }

    const referenceQuestions = referenceSection.question ?? [];
    const otherQuestions = otherSection.question ?? [];
    if (otherQuestions.length !== referenceQuestions.length) {
      err(
        `${subject}: ${where}: ${otherQuestions.length} question(s) but ${referencePath} has ${referenceQuestions.length}. Questions must match.`,
      );
    }

    const questionCount = Math.max(referenceQuestions.length, otherQuestions.length);
    for (let qIndex = 0; qIndex < questionCount; qIndex++) {
      const referenceQuestion = referenceQuestions[qIndex];
      const otherQuestion = otherQuestions[qIndex];
      if (!referenceQuestion) {
        err(`${subject}: ${where}: question "${otherQuestion?.id}" is not in ${referencePath}.`);
        continue;
      }
      if (!otherQuestion) {
        err(`${subject}: ${where}: question "${referenceQuestion.id}" is missing.`);
        continue;
      }
      const label = `${where} ${otherQuestion.id ?? qIndex + 1}`;
      if (otherQuestion.id !== referenceQuestion.id) {
        err(
          `${subject}: ${where} #${qIndex + 1}: question id must be "${referenceQuestion.id}" (as in ${referencePath}).`,
        );
        continue;
      }
      for (const field of COMPARED_QUESTION_FIELDS) {
        if (!sameValue(otherQuestion[field], referenceQuestion[field])) {
          err(
            `${subject}: ${label}: ${field} must be ${show(referenceQuestion[field])} (as in ${referencePath}).`,
          );
        }
      }
      // The ask is German for every type except translate, where it is the
      // sentence to translate and therefore written in the file's language.
      if (
        referenceQuestion.type === otherQuestion.type &&
        referenceQuestion.type !== "translate" &&
        !sameValue(otherQuestion.ask, referenceQuestion.ask)
      ) {
        err(
          `${subject}: ${label}: ask must be "${referenceQuestion.ask}" (as in ${referencePath}).`,
        );
      }
    }
  }

  const referenceTables = reference.level.table ?? {};
  const otherTables = other.level.table ?? {};
  const tableNames = new Set([
    ...Object.keys(referenceTables),
    ...Object.keys(otherTables),
  ]);
  for (const name of tableNames) {
    if (!sameValue(otherTables[name]?.row, referenceTables[name]?.row)) {
      err(
        `${subject}: [table.${name}] rows must match ${referencePath}. The prices are part of the answers.`,
      );
    }
  }
}

function compareCountries(
  reference: LanguageCountries,
  other: LanguageCountries,
  err: (message: string) => void,
): void {
  const key = (country: RawCountry) => String(country.name ?? "").toLowerCase();
  const byName = new Map(reference.countries.map((country) => [key(country), country]));

  for (const country of other.countries) {
    const match = byName.get(key(country));
    if (!match) {
      err(`${other.path}: "${country.name}" is not in ${reference.path}. Country lists must match.`);
      continue;
    }
    for (const field of ["article", "aus"] as const) {
      if (!sameValue(country[field], match[field])) {
        err(
          `${other.path}: ${country.name}: ${field} must be ${show(match[field])} (as in ${reference.path}).`,
        );
      }
    }
    byName.delete(key(country));
  }

  for (const missing of byName.values()) {
    err(`${other.path}: "${missing.name}" is missing (it is in ${reference.path}).`);
  }
}

export function validateLanguageConsistency(
  levels: LanguageLevel[],
  countryLists: LanguageCountries[],
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const err = (message: string) => errors.push(message);

  if (levels.length >= 2) {
    const byNumber = new Map<number, LanguageLevel[]>();
    for (const entry of levels) {
      const number = entry.level.level?.number;
      if (typeof number !== "number") continue;
      const group = byNumber.get(number) ?? [];
      group.push(entry);
      byNumber.set(number, group);
    }

    for (const group of byNumber.values()) {
      const [reference, ...others] = group;
      for (const other of others) compareLevels(reference, other, err);
    }
  }

  if (countryLists.length >= 2) {
    const [reference, ...others] = countryLists;
    for (const other of others) compareCountries(reference, other, err);
  }

  return { errors, warnings };
}
