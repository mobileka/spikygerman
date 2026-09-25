<script lang="ts">
  import { countries, levels, t } from "../content";
  import { summarizeProgress } from "../grading/summary";
  import { progressFor } from "../state.svelte";
  import { format } from "../format";
  import { summaryHash } from "../routing";
  import ProgressRing from "./ProgressRing.svelte";

  let heading: HTMLHeadingElement | undefined = $state();

  const rows = $derived(
    levels.map((level) => {
      const store = progressFor(level.id);
      return {
        level,
        counts: summarizeProgress(
          level.sections,
          store.answers,
          countries,
          store.checked,
        ),
      };
    }),
  );

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

<div class="sum-list">
  {#each rows as row, index (row.level.id)}
    <a class="section-link" href={summaryHash(row.level.number)}>
      <span class="sec-n">
        <ProgressRing counts={row.counts} />
        {String(index + 1).padStart(2, "0")}
      </span>
      <span class="issue-txt">
        <span class="issue-title">
          {format(t("level_summary"), {
            level: row.level.number,
            sections: row.level.sections.length,
            questions: row.counts.total,
          })}
        </span>
        <span class="issue-sub">
          {format(t("summary_section_line"), {
            correct: row.counts.correct,
            total: row.counts.total,
          })}
        </span>
      </span>
      <span
        class={percent(row.counts.correct, row.counts.total) === 100
          ? "badge is-done"
          : "badge is-soon"}
      >
        {percent(row.counts.correct, row.counts.total)}%
      </span>
    </a>
  {/each}
</div>
