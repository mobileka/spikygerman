<script lang="ts">
  import type { Question } from "../../content/types";
  import type { QuestionResult } from "../../grading/grade";
  import { fieldStatus, gapField } from "../../grading/grade";
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
  const answers = $derived(question.answers ?? []);
  const parts = $derived(question.ask.split(/_{3,}/));
  const describedBy = $derived(
    result ? `${askId} ${question.id}-feedback` : askId,
  );

  function choicesFor(index: number): string[] {
    return question.gap_choices?.[index] ?? [];
  }
</script>

<p class="ask-text" id={askId} lang="de">
  <span class="question-number">{number}.</span>
  {#each parts as part, index (index)}
    <span>{part}</span>{#if index < parts.length - 1}<span class="blank-chip"
        ><span aria-hidden="true">{index + 1}</span
        ><span class="sr-only">пропуск {index + 1}</span></span
      >{/if}
  {/each}
</p>

{#each answers as _answer, index (index)}
  {@const field = gapField(index)}
  {@const choices = choicesFor(index)}
  {#if choices.length}
    <div class="field">
      <label class="field-label" for={`${question.id}-${field}`}>
        {t("gap_label", { n: index + 1 })}
      </label>
      <select
        id={`${question.id}-${field}`}
        value={values[field] ?? ""}
        data-status={fieldStatus(result, field) ?? ""}
        aria-invalid={fieldStatus(result, field) === "incorrect" ? "true" : undefined}
        aria-describedby={describedBy}
        onchange={(event) => setAnswer(question.id, field, event.currentTarget.value)}
      >
        <option value="">—</option>
        {#each choices as choice (choice)}
          <option value={choice} lang="de">{choice}</option>
        {/each}
      </select>
    </div>
  {:else}
    <AnswerInput
      id={`${question.id}-${field}`}
      label={t("gap_label", { n: index + 1 })}
      value={values[field] ?? ""}
      status={fieldStatus(result, field)}
      {describedBy}
      oninput={(value) => setAnswer(question.id, field, value)}
    />
  {/if}
{/each}
