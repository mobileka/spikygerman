<script lang="ts">
  import type { Question } from "../../content/types";
  import type { QuestionResult } from "../../grading/grade";
  import { ANSWER_FIELD, fieldStatus } from "../../grading/grade";
  import { t } from "../../content";
  import { setAnswer } from "../../state.svelte";
  import AnswerInput from "../AnswerInput.svelte";

  let {
    question,
    number,
    values,
    result,
  }: {
    question: Question;
    number: number;
    values: Record<string, string>;
    result?: QuestionResult;
  } = $props();

  const askId = $derived(`${question.id}-ask`);
  const status = $derived(fieldStatus(result, ANSWER_FIELD));
  const describedBy = $derived(
    result ? `${askId} ${question.id}-feedback` : askId,
  );
</script>

<p
  class="ask-text"
  id={askId}
  lang={question.type === "translate" ? "ru" : "de"}
>
  <span class="question-number">{number}.</span>
  {question.ask}
</p>

<AnswerInput
  id={`${question.id}-answer`}
  label={t("answer_label")}
  value={values[ANSWER_FIELD] ?? ""}
  {status}
  {describedBy}
  multiline
  oninput={(value) => setAnswer(question.id, ANSWER_FIELD, value)}
/>
