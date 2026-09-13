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

{#snippet questionMedia()}
  {#if question.example}
    <ExampleBlock
      example={question.example}
      german={question.type !== "translate"}
    />
  {/if}
  {#if question.photo}
    <ImageBlock
      photo={question.photo}
      alt={question.alt}
      srData={question.sr_data}
    />
  {/if}
{/snippet}

<article
  class="qcard"
  id={question.id}
  tabindex="-1"
  data-status={result?.status ?? ""}
  aria-label={format(t("question_label"), { n: number })}
>
  {#if question.instruction}
    <p class="q-instr">{instructionText(question.instruction)}</p>
  {/if}
  {#if question.type === "gaps"}
    <GapsWidget {question} {number} {values} {result} media={questionMedia} />
  {:else if question.type === "choice"}
    <ChoiceWidget {question} {number} {values} {result} media={questionMedia} />
  {:else if question.type === "person"}
    <PersonWidget {question} {values} {result} media={questionMedia} />
  {:else}
    <FreeTextWidget {question} {number} {values} {result} media={questionMedia} />
  {/if}
  <button type="button" class="btn btn-primary check-button" onclick={onCheck}>
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4 10.5 8.5 15 16 6"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span>{t("check")}</span>
  </button>
  {#if result}
    <div class="feedback-anchor" bind:this={feedbackAnchor} tabindex="-1">
      <Feedback {question} {result} id={feedbackId} />
    </div>
  {/if}
</article>
