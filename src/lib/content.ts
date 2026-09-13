import data from "../generated/content.json";
import type { CompiledContent } from "./content/types";
import { format } from "./format";

export const content = data as unknown as CompiledContent;

export function t(key: string, vars?: Record<string, string | number>): string {
  const template = content.strings.ui[key] ?? key;
  return vars ? format(template, vars) : template;
}

export function instructionText(key: string): string {
  return content.strings.instruction[key] ?? "";
}

export function explanationText(questionId: string): string | undefined {
  return content.strings.explanation[questionId];
}
