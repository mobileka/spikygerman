<script lang="ts">
  import type { CompiledLevel, Question, Section } from "../content/types";
  import type { QuestionResult as Result } from "../grading/grade";
  import { countries, t } from "../content";
  import { sectionHash, summaryHash } from "../routing";
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
    level,
    section,
    questionId,
  }: { level: CompiledLevel; section: Section; questionId?: string } = $props();

  const sectionIndex = $derived(
    level.sections.findIndex((candidate) => candidate.id === section.id),
  );
  const previous = $derived(
    sectionIndex > 0 ? level.sections[sectionIndex - 1] : null,
  );
  const next = $derived(
    sectionIndex < level.sections.length - 1
      ? level.sections[sectionIndex + 1]
      : null,
  );

  function onPick(event: Event): void {
    const target = event.currentTarget as HTMLSelectElement;
    if (target.value && target.value !== section.id) {
      window.location.hash = sectionHash(level.number, target.value);
    }
  }

  function resultFor(question: Question): Result | undefined {
    if (!isQuestionChecked(level.id, question.id)) return undefined;
    return gradeQuestion(question, getValues(level.id, question.id), countries);
  }

  $effect(() => {
    const target = questionId;
    if (!target) return;
    untrack(() => markQuestionChecked(level.id, target));
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
      {#each level.sections as candidate (candidate.id)}
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
  {#if section.photo}
    <div class="sr-only">
      <PriceTable table={level.tables[section.table]} />
    </div>
  {:else}
    <div class="panel">
      <div class="panel-b">
        <PriceTable table={level.tables[section.table]} />
      </div>
    </div>
  {/if}
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
        levelId={level.id}
        {question}
        values={getValues(level.id, question.id)}
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
        href={previous ? sectionHash(level.number, previous.id) : "#/"}
        >{t("back")}</a
      >
      <a
        class="btn btn-secondary od-fill"
        href={next ? sectionHash(level.number, next.id) : summaryHash(level.number)}
      >
        {next ? t("next") : t("summary_title")}
      </a>
    </div>
  </div>
</div>
