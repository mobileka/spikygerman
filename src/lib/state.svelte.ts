import { content } from "./content";

interface Progress {
  answers: Record<string, Record<string, string>>;
  checked: string[];
}

const storageKey = `spikygerman:${content.test.id}:v2`;
const legacyStorageKey = `spikygerman:${content.test.id}:v1`;

function empty(): Progress {
  return { answers: {}, checked: [] };
}

function load(): Progress {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>;
      return {
        answers: parsed.answers ?? {},
        checked: Array.isArray(parsed.checked) ? parsed.checked : [],
      };
    }
    // v1 stored checked section ids; keep the answers, re-check questions fresh.
    const legacy = localStorage.getItem(legacyStorageKey);
    if (legacy) {
      const parsed = JSON.parse(legacy) as Partial<Progress>;
      return { answers: parsed.answers ?? {}, checked: [] };
    }
    return empty();
  } catch {
    return empty();
  }
}

export const progress = $state<Progress>(load());

function save(): void {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ answers: progress.answers, checked: progress.checked }),
    );
  } catch {
    // Private mode or full storage: answers still work for this session.
  }
}

export function getValues(questionId: string): Record<string, string> {
  return progress.answers[questionId] ?? {};
}

export function setAnswer(questionId: string, field: string, value: string): void {
  if (!progress.answers[questionId]) progress.answers[questionId] = {};
  progress.answers[questionId][field] = value;
  save();
}

export function isQuestionChecked(questionId: string): boolean {
  return progress.checked.includes(questionId);
}

export function markQuestionChecked(questionId: string): void {
  if (!isQuestionChecked(questionId)) progress.checked.push(questionId);
  save();
}

export function resetAll(): void {
  progress.answers = {};
  progress.checked = [];
  save();
}
