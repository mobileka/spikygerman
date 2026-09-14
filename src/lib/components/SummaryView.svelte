<script lang="ts">
  import { content, t } from "../content";
  import { summarize, type IssueStatus } from "../grading/summary";
  import { progress } from "../state.svelte";
  import { format } from "../format";
  import { sectionHash } from "../routing";

  const batch = 3;

  let heading: HTMLHeadingElement | undefined = $state();
  let shown = $state(batch);

  const summary = $derived(
    summarize(content.sections, progress.answers, content.countries),
  );
  const visibleIssues = $derived(summary.issues.slice(0, shown));
  const remaining = $derived(summary.issues.length - shown);

  function showMore(): void {
    shown += batch;
  }

  const statusKeys: Record<IssueStatus, string> = {
    almost: "result_almost",
    incorrect: "result_incorrect",
    empty: "result_empty",
  };

  function questionNumber(questionId: string): number {
    return Number(questionId.replace(/^q0*/, ""));
  }

  function percent(correct: number, total: number): number {
    return total ? Math.round((correct / total) * 100) : 0;
  }

  $effect(() => {
    requestAnimationFrame(() => heading?.focus());
  });
</script>

<header class="hero">
  <h1 tabindex="-1" bind:this={heading}>{t("summary_title")}</h1>
</header>

<div class="stat-strip">
  <div class="od-stat st-ok">
    <strong>{summary.correct}</strong>
    <span>{t("summary_count_correct")}</span>
  </div>
  <div class="od-stat st-al">
    <strong>{summary.almost}</strong>
    <span>{t("summary_count_almost")}</span>
  </div>
  <div class="od-stat st-bad">
    <strong>{summary.incorrect}</strong>
    <span>{t("summary_count_incorrect")}</span>
  </div>
  <div class="od-stat st-emp">
    <strong>{summary.empty}</strong>
    <span>{t("summary_count_empty")}</span>
  </div>
</div>

<div class="sum-list">
  {#each summary.sections as entry, index (entry.section.id)}
    <a class="section-link" href={sectionHash(entry.section.id)}>
      <span class="section-num">{String(index + 1).padStart(2, "0")}</span>
      <span class="st">
        <span class="t">{entry.section.title}</span>
        <span class="s">
          {format(t("summary_section_line"), {
            correct: entry.correct,
            total: entry.total,
          })}
        </span>
      </span>
      <span class="meta">
        <span
          class={percent(entry.correct, entry.total) === 100
            ? "badge done"
            : "badge"}
        >
          {percent(entry.correct, entry.total)}%
        </span>
      </span>
    </a>
  {/each}

  <section class="issues" aria-label={t("summary_issues_title")}>
    <h2>{t("summary_issues_title")}</h2>
    {#if summary.issues.length}
      <div class="issues-list">
        {#each visibleIssues as issue (issue.question.id)}
          <a
            class="issue-link is-{issue.status}"
            href={sectionHash(issue.section.id, issue.question.id)}
          >
            <span class="issue-txt">
              <span class="issue-title">
                {format(t("question_label"), {
                  n: questionNumber(issue.question.id),
                })}
              </span>
              <span class="issue-sub">{issue.section.title}</span>
            </span>
            <span class="issue-chip">{t(statusKeys[issue.status])}</span>
            <svg
              class="issue-chev"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                d="M8 5l5 5-5 5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        {/each}
      </div>
      {#if remaining > 0}
        <div class="issues-more">
          <button class="btn btn-secondary" type="button" onclick={showMore}>
            {format(t("summary_show_more"), {
              n: Math.min(batch, remaining),
            })}
          </button>
        </div>
      {/if}
    {:else}
      <p class="issues-empty">{t("summary_no_issues")}</p>
    {/if}
  </section>
</div>
