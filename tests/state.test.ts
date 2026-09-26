import { beforeEach, describe, expect, it } from "vitest";
import { levels } from "../src/lib/content";
import {
  getValues,
  isQuestionChecked,
  markQuestionChecked,
  resetAll,
  resetLevel,
  setAnswer,
} from "../src/lib/state.svelte";

const first = levels[0];
const second = levels[1];
const firstQuestion = first.sections[0].questions[0].id;
const secondQuestion = second.sections[0].questions[0].id;

describe("resetLevel", () => {
  beforeEach(() => {
    resetAll();
  });

  it("clears answers and checks for one level only", () => {
    setAnswer(first.id, firstQuestion, "field", "a");
    markQuestionChecked(first.id, firstQuestion);
    setAnswer(second.id, secondQuestion, "field", "b");
    markQuestionChecked(second.id, secondQuestion);

    resetLevel(first.id);

    expect(getValues(first.id, firstQuestion)).toEqual({});
    expect(isQuestionChecked(first.id, firstQuestion)).toBe(false);
    expect(getValues(second.id, secondQuestion)).toEqual({ field: "b" });
    expect(isQuestionChecked(second.id, secondQuestion)).toBe(true);
  });
});
