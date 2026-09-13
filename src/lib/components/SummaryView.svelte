<script lang="ts">
  import { content, t } from "../content";
  import { summarize } from "../grading/summary";
  import { progress } from "../state.svelte";
  import { format } from "../format";

  let heading: HTMLHeadingElement | undefined = $state();

  const summary = $derived(
    summarize(content.sections, progress.answers, content.countries),
  );

  function questionNumber(questionId: string): number {
    return Number(questionId.replace(/^q0*/, ""));
  }

  function statusKey(status: string): string {
    return status === "almost" ? "result_almost" : "result_incorrect";
  }

  $effect(() => {
    requestAnimationFrame(() => heading?.focus());
  });
</script>

<h1 tabindex="-1" bind:this={heading}>{t("summary_title")}</h1>

<p>
  {format(t("summary_answered"), {
    answered: summary.answered,
    total: summary.total,
  })}
</p>

{#if summary.answered === 0}
  <p class="muted">{t("summary_empty_state")}</p>
{:else}
  <dl class="summary-counts">
    <div>
      <dt>{t("summary_count_correct")}</dt>
      <dd>{summary.correct}</dd>
    </div>
    <div>
      <dt>{t("summary_count_almost")}</dt>
      <dd>{summary.almost}</dd>
    </div>
    <div>
      <dt>{t("summary_count_incorrect")}</dt>
      <dd>{summary.incorrect}</dd>
    </div>
    <div>
      <dt>{t("summary_count_empty")}</dt>
      <dd>{summary.empty}</dd>
    </div>
  </dl>

  <h2>{t("summary_sections_title")}</h2>
  <ul class="summary-sections">
    {#each summary.sections as entry (entry.section.id)}
      <li>
        <a class="section-link" href={`#/s/${entry.section.id}`}>
          <span class="section-title">{entry.section.title}</span>
          <span class="section-meta">
            {format(t("summary_section_line"), {
              correct: entry.correct,
              total: entry.total,
            })}
          </span>
        </a>
      </li>
    {/each}
  </ul>

  <h2>{t("summary_issues_title")}</h2>
  {#if summary.issues.length}
    <ul class="summary-issues">
      {#each summary.issues as issue (issue.question.id)}
        <li>
          <a
            class="issue-link"
            href={`#/s/${issue.section.id}/${issue.question.id}`}
          >
            <span class="issue-heading">
              {format(t("summary_issue"), {
                n: questionNumber(issue.question.id),
                status: t(statusKey(issue.status)),
              })}
            </span>
            <span class="issue-ask" lang="de">{issue.question.ask}</span>
          </a>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="muted">{t("summary_no_issues")}</p>
  {/if}
{/if}

<p class="summary-actions">
  <a class="button" href="#/">{t("home")}</a>
</p>
