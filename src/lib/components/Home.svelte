<script lang="ts">
  import { content, t, instructionText } from "../content";
  import { progress, isQuestionChecked, resetAll } from "../state.svelte";
  import { format } from "../format";

  function answeredCount(sectionId: string): number {
    const section = content.sections.find((candidate) => candidate.id === sectionId);
    if (!section) return 0;
    return section.questions.filter((question) => {
      const values = progress.answers[question.id];
      return values && Object.values(values).some((value) => value.trim() !== "");
    }).length;
  }

  function sectionTotal(sectionId: string): number {
    return (
      content.sections.find((candidate) => candidate.id === sectionId)?.questions
        .length ?? 0
    );
  }

  function allChecked(sectionId: string): boolean {
    const section = content.sections.find((candidate) => candidate.id === sectionId);
    return (
      !!section &&
      section.questions.length > 0 &&
      section.questions.every((question) => isQuestionChecked(question.id))
    );
  }

  function onReset(): void {
    if (window.confirm(t("reset_confirm"))) {
      resetAll();
    }
  }
</script>

<header class="page-header">
  <h1>{content.test.title}</h1>
  <p class="muted">{t("sections_intro")}</p>
</header>

<nav aria-label="Разделы">
  <ol class="section-list">
    {#each content.sections as section (section.id)}
      <li>
        <a class="section-link" href={`#/s/${section.id}`}>
          <span>
            <span class="section-title">{section.title}</span>
            <span class="muted"> — {instructionText(section.instruction)}</span>
          </span>
          <span class="section-meta">
            {#if allChecked(section.id)}
              <span class="badge">{t("section_checked")}</span>
            {/if}
            <span>
              {format(t("section_progress"), {
                answered: answeredCount(section.id),
                total: sectionTotal(section.id),
              })}
            </span>
          </span>
        </a>
      </li>
    {/each}
  </ol>
</nav>

<footer class="page-footer">
  <a class="button" href="#/summary">{t("summary_title")}</a>
  <button type="button" onclick={onReset}>{t("reset")}</button>
</footer>
