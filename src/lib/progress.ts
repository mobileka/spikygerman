import type { Section } from "./content/types";

export function totalQuestions(sections: Section[]): number {
  return sections.reduce(
    (total, section) => total + section.questions.length,
    0,
  );
}

export function continueSectionId(
  sections: Section[],
  checked: string[],
): string | null {
  const done = new Set(checked);
  for (const section of sections) {
    if (section.questions.some((question) => !done.has(question.id))) {
      return section.id;
    }
  }
  return sections[0]?.id ?? null;
}
