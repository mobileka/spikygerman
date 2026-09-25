<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Question } from "../../content/types";
  import type { QuestionResult } from "../../grading/grade";
  import { ANSWER_FIELD, fieldStatus } from "../../grading/grade";
  import { t } from "../../content";
  import { setAnswer } from "../../state.svelte";
  import AnswerInput from "../AnswerInput.svelte";

  let {
    levelId,
    question,
    number,
    values,
    result,
    media,
  }: {
    levelId: string;
    question: Question;
    number: number;
    values: Record<string, string>;
    result?: QuestionResult;
    media?: Snippet;
  } = $props();

  const askId = $derived(`${question.id}-ask`);
  const status = $derived(fieldStatus(result, ANSWER_FIELD));
  const describedBy = $derived(
    result ? `${askId} ${question.id}-feedback` : askId,
  );
</script>

<span
  class="q-ask"
  id={askId}
  lang={question.type === "translate" ? "ru" : "de"}
>
  <span class="qn">{number}.</span>
  {question.ask}
</span>

{@render media?.()}

<AnswerInput
  id={`${question.id}-answer`}
  label={t("answer_label")}
  value={values[ANSWER_FIELD] ?? ""}
  {status}
  {describedBy}
  oninput={(value) => setAnswer(levelId, question.id, ANSWER_FIELD, value)}
/>
