import { existsSync, readFileSync, readdirSync } from "node:fs";
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
  RawCountry,
  RawLevelFile,
  RawUiFile,
} from "../src/lib/content/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

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

const errors: string[] = [];
const warnings: string[] = [];
const levelEntries: LanguageLevel[] = [];
const countryEntries: LanguageCountries[] = [];
const summaries: string[] = [];

for (const lang of languageDirs()) {
  const dir = join(contentDir, lang);
  const ui = parse(readFileSync(join(dir, "ui.toml"), "utf8")) as unknown as RawUiFile;
  const countriesPath = `content/${lang}/countries.toml`;
  const countries =
    (parse(read(countriesPath)) as unknown as { country?: RawCountry[] }).country ?? [];
  countryEntries.push({ lang, path: countriesPath, countries });

  const files = levelFiles(lang);
  if (!files.length) errors.push(`content/${lang}/: no level-*.toml file.`);

  for (const name of files) {
    const path = `content/${lang}/${name}`;
    const raw = parse(read(path)) as unknown as RawLevelFile;
    const report = validateContent(raw, ui, countries, {
      publicDir: join(root, "public"),
      levelFile: path,
      uiFile: `content/${lang}/ui.toml`,
      countriesFile: countriesPath,
    });
    errors.push(...report.errors);
    warnings.push(...report.warnings);

    levelEntries.push({ lang, path, level: raw });
    const sections = raw.section ?? [];
    const questionCount = sections.reduce(
      (total, section) => total + (section.question?.length ?? 0),
      0,
    );
    summaries.push(
      `${lang} level ${raw.level?.number ?? "?"}: ${questionCount} questions in ${sections.length} sections`,
    );
  }
}

const consistency = validateLanguageConsistency(levelEntries, countryEntries);
errors.push(...consistency.errors);
warnings.push(...consistency.warnings);

for (const warning of warnings) console.warn(`warning: ${warning}`);
for (const error of errors) console.error(`error: ${error}`);

if (errors.length) {
  console.error(
    `\n${errors.length} problem(s) found. Fix them and run "bun run check" again.`,
  );
  process.exit(1);
}

console.log("All good.");
for (const summary of summaries) console.log(`  ${summary}`);
