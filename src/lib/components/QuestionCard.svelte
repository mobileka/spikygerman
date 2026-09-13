<script lang="ts">
  import type { Question } from "../content/types";
  import type { QuestionResult } from "../grading/grade";
  import { instructionText, t } from "../content";
  import { format } from "../format";
  import { markQuestionChecked } from "../state.svelte";
  import ExampleBlock from "./ExampleBlock.svelte";
  import Feedback from "./Feedback.svelte";
  import ImageBlock from "./ImageBlock.svelte";
  import ChoiceWidget from "./widgets/ChoiceWidget.svelte";
  import FreeTextWidget from "./widgets/FreeTextWidget.svelte";
  import GapsWidget from "./widgets/GapsWidget.svelte";
  import PersonWidget from "./widgets/PersonWidget.svelte";

  let {
    question,
    values,
    result,
  }: {
    question: Question;
    values: Record<string, string>;
    result?: QuestionResult;
  } = $props();

  const number = $derived(Number(question.id.replace(/^q0*/, "")));
  const feedbackId = $derived(`${question.id}-feedback`);
  let feedbackAnchor: HTMLDivElement | undefined = $state();

  function onCheck(): void {
    markQuestionChecked(question.id);
    requestAnimationFrame(() => feedbackAnchor?.focus());
  }
</script>

<article
  class="question"
  id={question.id}
  tabindex="-1"
  data-status={result?.status ?? ""}
  aria-label={format(t("question_label"), { n: number })}
>
  {#if question.instruction}
    <p class="instruction">{instructionText(question.instruction)}</p>
  {/if}
  {#if question.example}
    <ExampleBlock
      example={question.example}
      german={question.type !== "translate"}
    />
  {/if}
  {#if question.photo}
    <ImageBlock photo={question.photo} alt={question.alt} srData={question.sr_data} />
  {/if}
  {#if question.type === "gaps"}
    <GapsWidget {question} {number} {values} {result} />
  {:else if question.type === "choice"}
    <ChoiceWidget {question} {number} {values} {result} />
  {:else if question.type === "person"}
    <PersonWidget {question} {values} {result} />
  {:else}
    <FreeTextWidget {question} {number} {values} {result} />
  {/if}
  <button type="button" class="button-primary check-button" onclick={onCheck}>
    {t("check")}
  </button>
  {#if result}
    <div
      class="feedback-anchor"
      bind:this={feedbackAnchor}
      tabindex="-1"
    >
      <Feedback {question} {result} id={feedbackId} />
    </div>
  {/if}
</article>
