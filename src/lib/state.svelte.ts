import { levels } from "./content";

interface Progress {
  answers: Record<string, Record<string, string>>;
  checked: string[];
}

// Level 1 has lived through two schema revisions; every new level starts at v1.
const SCHEMA_VERSION: Record<string, number> = { "sample-test-1": 2 };

function keyFor(levelId: string): string {
  return `spikygerman:${levelId}:v${SCHEMA_VERSION[levelId] ?? 1}`;
}

function legacyKeyFor(levelId: string): string | null {
  // v1 stored checked section ids; keep the answers, re-check questions fresh.
  return levelId === "sample-test-1" ? `spikygerman:${levelId}:v1` : null;
}

function empty(): Progress {
  return { answers: {}, checked: [] };
}

function load(levelId: string): Progress {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(keyFor(levelId));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>;
      return {
        answers: parsed.answers ?? {},
        checked: Array.isArray(parsed.checked) ? parsed.checked : [],
      };
    }
    const legacyKey = legacyKeyFor(levelId);
    const legacy = legacyKey ? localStorage.getItem(legacyKey) : null;
    if (legacy) {
      const parsed = JSON.parse(legacy) as Partial<Progress>;
      return { answers: parsed.answers ?? {}, checked: [] };
    }
    return empty();
  } catch {
    return empty();
  }
}

const stores = new Map<string, Progress>();
for (const level of levels) {
  const store = $state<Progress>(load(level.id));
  stores.set(level.id, store);
}

export function progressFor(levelId: string): Progress {
  const existing = stores.get(levelId);
  if (existing) return existing;
  const created = $state<Progress>(empty());
  stores.set(levelId, created);
  return created;
}

function save(levelId: string): void {
  try {
    const store = progressFor(levelId);
    localStorage.setItem(
      keyFor(levelId),
      JSON.stringify({ answers: store.answers, checked: store.checked }),
    );
  } catch {
    // Private mode or full storage: answers still work for this session.
  }
}

export function getValues(
  levelId: string,
  questionId: string,
): Record<string, string> {
  return progressFor(levelId).answers[questionId] ?? {};
}

export function setAnswer(
  levelId: string,
  questionId: string,
  field: string,
  value: string,
): void {
  const store = progressFor(levelId);
  if (!store.answers[questionId]) store.answers[questionId] = {};
  store.answers[questionId][field] = value;
  save(levelId);
}

export function isQuestionChecked(levelId: string, questionId: string): boolean {
  return progressFor(levelId).checked.includes(questionId);
}

export function markQuestionChecked(levelId: string, questionId: string): void {
  if (!isQuestionChecked(levelId, questionId)) {
    progressFor(levelId).checked.push(questionId);
  }
  save(levelId);
}

export function resetLevel(levelId: string): void {
  const store = progressFor(levelId);
  store.answers = {};
  store.checked = [];
  save(levelId);
}

export function resetAll(): void {
  for (const level of levels) {
    resetLevel(level.id);
  }
}
