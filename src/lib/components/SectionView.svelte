<script lang="ts">
  import type { Question, Section } from "../content/types";
  import type { QuestionResult as Result } from "../grading/grade";
  import { content, t } from "../content";
  import { sectionHash } from "../routing";
  import {
    getValues,
    isQuestionChecked,
    markQuestionChecked,
  } from "../state.svelte";
  import { gradeQuestion } from "../grading/grade";
  import { untrack } from "svelte";
  import ExampleBlock from "./ExampleBlock.svelte";
  import ImageBlock from "./ImageBlock.svelte";
  import PriceTable from "./PriceTable.svelte";
  import QuestionCard from "./QuestionCard.svelte";

  let {
    section,
    questionId,
  }: { section: Section; questionId?: string } = $props();

  const sectionIndex = content.sections.findIndex(
    (candidate) => candidate.id === section.id,
  );
  const previous = sectionIndex > 0 ? content.sections[sectionIndex - 1] : null;
  const next =
    sectionIndex < content.sections.length - 1
      ? content.sections[sectionIndex + 1]
      : null;

  function onPick(event: Event): void {
    const target = event.currentTarget as HTMLSelectElement;
    if (target.value && target.value !== section.id) {
      window.location.hash = sectionHash(target.value);
    }
  }

  function resultFor(question: Question): Result | undefined {
    if (!isQuestionChecked(question.id)) return undefined;
    return gradeQuestion(question, getValues(question.id), content.countries);
  }

  $effect(() => {
    const target = questionId;
    if (!target) return;
    untrack(() => markQuestionChecked(target));
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(target);
      if (!element) return;
      element.scrollIntoView({ block: "start" });
      element.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  });
</script>

<header class="hero">
  <h1 class="sr-only">{section.title}</h1>
  <div>
    <select
      id="secPick"
      class="select-lg"
      aria-label={t("section_picker_label")}
      value={section.id}
      onchange={onPick}
    >
      {#each content.sections as candidate (candidate.id)}
        <option value={candidate.id}>{candidate.title}</option>
      {/each}
    </select>
  </div>
  <p>{section.instruction}</p>
</header>

{#if section.photo}
  <div class="panel">
    <div class="panel-b">
      <ImageBlock
        photo={section.photo}
        alt={section.alt}
        srData={section.sr_data}
      />
    </div>
  </div>
{/if}
{#if section.table}
  <div class="sr-only">
    <PriceTable table={content.tables[section.table]} />
  </div>
{/if}
{#if section.example}
  <ExampleBlock
    example={section.example}
    photo={section.example_photo}
    alt={section.example_alt}
  />
{/if}

<ol class="questions">
  {#each section.questions as question (question.id)}
    <li>
      <QuestionCard
        {question}
        values={getValues(question.id)}
        result={resultFor(question)}
      />
    </li>
  {/each}
</ol>

<div class="panel">
  <div class="panel-b">
    <div class="od-row">
      <a
        class="btn btn-secondary od-fill"
        href={previous ? sectionHash(previous.id) : "#/"}>{t("back")}</a
      >
      <a
        class="btn btn-secondary od-fill"
        href={next ? sectionHash(next.id) : "#/summary"}
      >
        {next ? t("next") : t("summary_title")}
      </a>
    </div>
  </div>
</div>
