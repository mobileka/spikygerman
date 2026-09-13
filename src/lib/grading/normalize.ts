export function fold(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue");
}

export function normalize(s: string): string {
  return fold(s)
    .replace(/€/g, " euro ")
    .replace(/[.,!?;:"«»„“”'’()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function expectedEquals(input: string, expected: string): boolean {
  return normalize(input) === normalize(expected);
}

export function umlautTip(input: string, expected: string): string | undefined {
  if (!/(ae|oe|ue|ss)/i.test(input)) return undefined;
  if (!/[äöüß]/i.test(expected)) return undefined;
  if (!expectedEquals(input, expected)) return undefined;
  return expected;
}

const KEYWORD_BOUNDARY = "a-z0-9";

export function containsPhrase(haystack: string, phrase: string): boolean {
  const escaped = normalize(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return false;
  const re = new RegExp(`(?:^|[^${KEYWORD_BOUNDARY}])${escaped}(?=$|[^${KEYWORD_BOUNDARY}])`);
  return re.test(normalize(haystack));
}

export function splitBlanks(ask: string): string[] {
  return ask.split(/_{3,}/);
}

export function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = "";
  for (const character of text) {
    current += character;
    if (character === "." || character === "!" || character === "?") {
      if (current.trim()) sentences.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) sentences.push(current.trim());
  return sentences;
}

export function countBlanks(ask: string): number {
  return splitBlanks(ask).length - 1;
}

export function fillBlanks(ask: string, answers: string[]): string {
  const parts = splitBlanks(ask);
  let out = parts[0] ?? "";
  for (let i = 1; i < parts.length; i++) {
    out += (answers[i - 1] ?? "…") + (parts[i] ?? "");
  }
  return out;
}
