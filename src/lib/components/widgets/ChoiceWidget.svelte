<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Question } from "../../content/types";
  import type { QuestionResult } from "../../grading/grade";
  import { CHOICE_FIELD, fieldStatus } from "../../grading/grade";
  import { t } from "../../content";
  import { setAnswer } from "../../state.svelte";

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
  const options = $derived(question.options ?? []);
  const selected = $derived(values[CHOICE_FIELD] ?? "");
  const describedBy = $derived(
    result ? `${askId} ${question.id}-feedback` : askId,
  );
</script>

<span class="q-ask" id={askId} lang="de">
  <span class="qn">{number}.</span>
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
</span>

{@render media?.()}

<fieldset class="choice" aria-describedby={describedBy}>
  <legend class="sr-only">{t("answer_label")}</legend>
  {#each options as option (option)}
    <label>
      <input
        type="radio"
        name={question.id}
        value={option}
        checked={selected === option}
        onchange={() => setAnswer(levelId, question.id, CHOICE_FIELD, option)}
      />
      <span lang="de">{option}</span>
    </label>
  {/each}
</fieldset>
