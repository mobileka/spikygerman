import type { Section } from "./content/types";

export function totalQuestions(sections: Section[]): number {
  return sections.reduce(
    (total, section) => total + section.questions.length,
    0,
  );
}

export function countAnswered(
  sections: Section[],
  answers: Record<string, Record<string, string>>,
): number {
  let answered = 0;
  for (const section of sections) {
    for (const question of section.questions) {
      const values = answers[question.id];
      if (
        values &&
        Object.values(values).some((value) => value.trim() !== "")
      ) {
        answered++;
      }
    }
  }
  return answered;
}

export function progressPercent(answered: number, total: number): number {
  return total ? Math.round((answered / total) * 100) : 0;
}
