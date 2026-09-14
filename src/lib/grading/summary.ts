import type { Country, Question, Section } from "../content/types";
import type { Status } from "./grade";
import { gradeQuestion } from "./grade";

export interface SectionSummary {
  section: Section;
  answered: number;
  correct: number;
  total: number;
}

export type IssueStatus = Exclude<Status, "correct">;

const ISSUE_PRIORITY: Record<IssueStatus, number> = {
  incorrect: 0,
  almost: 1,
  empty: 2,
};

export interface SummaryIssue {
  question: Question;
  section: Section;
  status: IssueStatus;
}

export interface TestSummary {
  total: number;
  answered: number;
  correct: number;
  almost: number;
  incorrect: number;
  empty: number;
  sections: SectionSummary[];
  issues: SummaryIssue[];
}

export function summarize(
  sections: Section[],
  answers: Record<string, Record<string, string>>,
  countries: Country[],
): TestSummary {
  const summary: TestSummary = {
    total: 0,
    answered: 0,
    correct: 0,
    almost: 0,
    incorrect: 0,
    empty: 0,
    sections: [],
    issues: [],
  };

  for (const section of sections) {
    const sectionSummary: SectionSummary = {
      section,
      answered: 0,
      correct: 0,
      total: section.questions.length,
    };

    for (const question of section.questions) {
      const result = gradeQuestion(question, answers[question.id] ?? {}, countries);
      summary.total++;

      if (result.status === "empty") {
        summary.empty++;
        summary.issues.push({ question, section, status: result.status });
      } else {
        summary.answered++;
        sectionSummary.answered++;
      }

      if (result.status === "correct") {
        summary.correct++;
        sectionSummary.correct++;
      } else if (result.status === "almost") {
        summary.almost++;
        summary.issues.push({ question, section, status: result.status });
      } else if (result.status === "incorrect") {
        summary.incorrect++;
        summary.issues.push({ question, section, status: result.status });
      }
    }

    summary.sections.push(sectionSummary);
  }

  summary.issues.sort(
    (a, b) => ISSUE_PRIORITY[a.status] - ISSUE_PRIORITY[b.status],
  );

  return summary;
}
