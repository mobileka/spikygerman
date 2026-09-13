import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";
import { validateContent } from "../src/lib/content/validate.ts";
import type {
  RawCountry,
  RawStringsFile,
  RawTestFile,
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
for (const error of report.errors) console.error(`error: ${error}`);

const sections = rawTest.section ?? [];
const questionCount = sections.reduce(
  (total, section) => total + (section.question?.length ?? 0),
  0,
);

if (report.errors.length) {
  console.error(
    `\n${report.errors.length} problem(s) found. Fix them and run "npm run check" again.`,
  );
  process.exit(1);
}

console.log(
  `All good: ${questionCount} questions in ${sections.length} sections, ${
    (rawCountries.country ?? []).length
  } countries.`,
);
