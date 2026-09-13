<script lang="ts">
  import type { Question, Section } from "../content/types";
  import type { QuestionResult as Result } from "../grading/grade";
  import { content, instructionText, t } from "../content";
  import { getValues, isQuestionChecked } from "../state.svelte";
  import { gradeQuestion } from "../grading/grade";
  import ExampleBlock from "./ExampleBlock.svelte";
  import ImageBlock from "./ImageBlock.svelte";
  import PriceTable from "./PriceTable.svelte";
  import QuestionCard from "./QuestionCard.svelte";
  import UmlautRow from "./UmlautRow.svelte";

  let { section }: { section: Section } = $props();

  const sectionIndex = content.sections.findIndex(
    (candidate) => candidate.id === section.id,
  );
  const previous = sectionIndex > 0 ? content.sections[sectionIndex - 1] : null;
  const next =
    sectionIndex < content.sections.length - 1
      ? content.sections[sectionIndex + 1]
      : null;

  function resultFor(question: Question): Result | undefined {
    if (!isQuestionChecked(question.id)) return undefined;
    return gradeQuestion(question, getValues(question.id), content.countries);
  }
</script>

<header class="page-header">
  <h2>{section.title}</h2>
  <p class="muted">{instructionText(section.instruction)}</p>
</header>

{#if section.photo}
  <ImageBlock photo={section.photo} alt={section.alt} srData={section.sr_data} />
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
      <QuestionCard {question} values={getValues(question.id)} result={resultFor(question)} />
    </li>
  {/each}
</ol>

<div class="bottom-bar">
  <UmlautRow />
  <div class="nav-row">
    <a class="button" href={previous ? `#/s/${previous.id}` : "#/"}>{t("back")}</a>
    <a class="button" href={next ? `#/s/${next.id}` : "#/"}>
      {next ? t("next") : t("home")}
    </a>
  </div>
</div>
