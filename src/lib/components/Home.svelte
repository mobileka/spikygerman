<script lang="ts">
  import { content, t } from "../content";
  import { summarizeProgress } from "../grading/summary";
  import { totalQuestions } from "../progress";
  import { resetAll, progress } from "../state.svelte";
  import { sectionHash, LEVEL_HASH } from "../routing";
  import { format } from "../format";
  import ProgressBar from "./ProgressBar.svelte";

  const total = totalQuestions(content.sections);
  const totalSections = content.sections.length;

  const counts = $derived(
    summarizeProgress(
      content.sections,
      progress.answers,
      content.countries,
      progress.checked,
    ),
  );

  let expanded = $state(
    typeof window !== "undefined" && window.location.hash === LEVEL_HASH,
  );

  $effect(() => {
    const onHashChange = () => {
      if (window.location.hash === LEVEL_HASH) expanded = true;
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  });

  function onToggle(): void {
    expanded = !expanded;
  }

  function onReset(): void {
    if (window.confirm(t("reset_confirm"))) {
      resetAll();
    }
  }
</script>

<header class="hero">
  <h1>{t("home_hero")}</h1>
</header>

<button
  class="button-primary lvl-btn"
  id="level-1"
  type="button"
  aria-expanded={expanded}
  aria-controls="level-1-panel"
  onclick={onToggle}
>
  <span>
    {format(t("level_summary"), {
      level: 1,
      sections: totalSections,
      questions: total,
    })}
  </span>
  <svg
    class="chev"
    width="18"
    height="18"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      d="M5 8l5 5 5-5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</button>

<div class="lvl-progress">
  <ProgressBar {counts} />
  <p class="progress-text" role="status">
    {format(t("progress_answered"), {
      answered: counts.answered,
      total: counts.total,
    })}
  </p>
</div>

<div id="level-1-panel" hidden={!expanded}>
  <ol class="lvl-grid">
    {#each content.sections as section, index (section.id)}
      <li>
        <a class="sec-tile" href={sectionHash(section.id)}>
          <span class="sec-n">{String(index + 1).padStart(2, "0")}</span>
          <span class="sec-t">{section.title}</span>
        </a>
      </li>
    {/each}
  </ol>
</div>

<!-- level-2: следующий уровень добавить здесь. level-chip станет кликабельным переключателем уровня (список уровней, текущий отмечен). См. design-spec.md -->

<button class="reset-button" type="button" onclick={onReset}>
  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
    <path
      d="M16 10a6 6 0 1 1-1.8-4.3M16 3v4h-4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
  <span>{t("reset")}</span>
</button>
