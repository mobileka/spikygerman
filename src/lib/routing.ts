export type Route =
  | { name: "home" }
  | { name: "summary"; level?: number }
  | { name: "section"; level: number; id: string; questionId?: string };

export const LEVEL_HASH = "#level-1";
export const SUMMARY_HASH = "#/summary";

// Level 1 keeps its original section hashes; every later level is namespaced.
export function sectionHash(
  level: number,
  id: string,
  questionId?: string,
): string {
  if (level === 1) return questionId ? `#/s/${id}/${questionId}` : `#/s/${id}`;
  return questionId ? `#/l${level}/${id}/${questionId}` : `#/l${level}/${id}`;
}

export function summaryHash(level: number): string {
  return `#/l${level}/summary`;
}

export function parseHash(hash: string): Route | null {
  if (hash === "" || hash === "#" || hash === "#/") return { name: "home" };
  if (hash === LEVEL_HASH) return { name: "home" };
  // The bare summary is the overview of every level.
  if (hash === SUMMARY_HASH) return { name: "summary" };

  const legacy = hash.match(/^#\/s\/([a-z0-9-]+)(?:\/([a-z0-9]+))?/i);
  if (legacy) {
    return { name: "section", level: 1, id: legacy[1], questionId: legacy[2] };
  }

  const namespaced = hash.match(
    /^#\/l(\d+)(?:\/([a-z0-9-]+))?(?:\/([a-z0-9]+))?/i,
  );
  if (!namespaced) return null;
  const level = Number(namespaced[1]);
  const segment = namespaced[2];
  if (!segment) return { name: "home" };
  if (segment === "summary") return { name: "summary", level };
  return { name: "section", level, id: segment, questionId: namespaced[3] };
}
