<script lang="ts">
  import type { Question } from "../../content/types";
  import type { QuestionResult } from "../../grading/grade";
  import { CHOICE_FIELD, fieldStatus } from "../../grading/grade";
  import { t } from "../../content";
  import { setAnswer } from "../../state.svelte";

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
  const options = $derived(question.options ?? []);
  const selected = $derived(values[CHOICE_FIELD] ?? "");
  const status = $derived(fieldStatus(result, CHOICE_FIELD));
  const describedBy = $derived(
    result ? `${askId} ${question.id}-feedback` : askId,
  );
</script>

<p class="ask-text" id={askId} lang="de">
  <span class="question-number">{number}.</span>
  {#each question.ask.split(/(_{3,})/) as part, index (index)}
    {#if /^_{3,}$/.test(part)}
      <span class="blank-chip"
        ><span aria-hidden="true">{selected || "…"}</span
        ><span class="sr-only">{selected || "пропуск"}</span></span
      >
    {:else}
      <span>{part}</span>
    {/if}
  {/each}
</p>

<fieldset class="choice-group" aria-describedby={describedBy}>
  <legend class="sr-only">{t("answer_label")}</legend>
  {#each options as option (option)}
    <label class="choice-option" data-selected={selected === option}>
      <input
        type="radio"
        name={question.id}
        value={option}
        checked={selected === option}
        onchange={() => setAnswer(question.id, CHOICE_FIELD, option)}
      />
      <span lang="de">{option}</span>
    </label>
  {/each}
</fieldset>
