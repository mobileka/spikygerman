export type Route =
  | { name: "home" }
  | { name: "summary" }
  | { name: "section"; id: string; questionId?: string };

export const SUMMARY_HASH = "#/summary";
export const LEVEL_HASH = "#level-1";

export function sectionHash(id: string, questionId?: string): string {
  return questionId ? `#/s/${id}/${questionId}` : `#/s/${id}`;
}

export function parseHash(hash: string): Route | null {
  if (hash === "" || hash === "#" || hash === "#/") return { name: "home" };
  if (hash === LEVEL_HASH) return { name: "home" };
  if (hash === SUMMARY_HASH) return { name: "summary" };
  const match = hash.match(/^#\/s\/([a-z0-9-]+)(?:\/([a-z0-9]+))?/i);
  if (!match) return null;
  return { name: "section", id: match[1], questionId: match[2] };
}
