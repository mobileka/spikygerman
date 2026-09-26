<script lang="ts">
  import { countries, levels, t } from "../content";
  import { summarizeProgress } from "../grading/summary";
  import { totalQuestions } from "../progress";
  import { progressFor, resetAll, resetLevel } from "../state.svelte";
  import { sectionHash, LEVEL_HASH } from "../routing";
  import { format } from "../format";
  import ProgressBar from "./ProgressBar.svelte";
  import ProgressRing from "./ProgressRing.svelte";

  const rows = $derived(
    levels.map((level) => {
      const store = progressFor(level.id);
      return {
        level,
        total: totalQuestions(level.sections),
        counts: summarizeProgress(
          level.sections,
          store.answers,
          countries,
          store.checked,
        ),
      };
    }),
  );

  const firstLevelId = levels.find((level) => level.number === 1)?.id ?? null;

  let expandedId = $state<string | null>(
    typeof window !== "undefined" && window.location.hash === LEVEL_HASH
      ? firstLevelId
      : null,
  );

  $effect(() => {
    const onHashChange = () => {
      if (window.location.hash === LEVEL_HASH) expandedId = firstLevelId;
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  });

  function onToggle(levelId: string): void {
    expandedId = expandedId === levelId ? null : levelId;
  }

  function onReset(): void {
    if (window.confirm(t("reset_confirm"))) {
      resetAll();
    }
  }

  function onResetLevel(number: number, levelId: string): void {
    if (window.confirm(format(t("reset_level_confirm"), { level: number }))) {
      resetLevel(levelId);
    }
  }
</script>

<header class="hero" data-od-id="home-hero">
  <h1>{t("home_hero")}</h1>
</header>

{#each rows as row (row.level.id)}
  <button
    class="btn btn-primary is-block"
    id={`level-${row.level.number}`}
    data-od-id={`level-${row.level.number}-toggle`}
    type="button"
    aria-expanded={expandedId === row.level.id}
    aria-controls={`level-${row.level.number}-panel`}
    onclick={() => onToggle(row.level.id)}
  >
    <span>
      {format(t("level_summary"), {
        level: row.level.number,
        sections: row.level.sections.length,
        questions: row.total,
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
    <ProgressBar counts={row.counts} />
    <div class="lvl-progress-foot">
      <p class="progress-text" role="status">
        {format(t("progress_answered"), {
          answered: row.counts.answered,
          total: row.counts.total,
        })}
      </p>
      <button
        class="lvl-reset"
        type="button"
        aria-label={format(t("reset_level_label"), {
          level: row.level.number,
        })}
        onclick={() => onResetLevel(row.level.number, row.level.id)}
      >
        {t("reset_level")}
      </button>
    </div>
  </div>

  <div
    id={`level-${row.level.number}-panel`}
    class="lvl-panel"
    hidden={expandedId !== row.level.id}
  >
    <ol class="sec-grid">
      {#each row.level.sections as section, index (section.id)}
        <li>
          <a class="sec-tile is-home" href={sectionHash(row.level.number, section.id)}>
            <span class="sec-n">
              <ProgressRing counts={row.counts.sections[index]} />
              {String(index + 1).padStart(2, "0")}
            </span>
            <span class="sec-t">{section.title}</span>
          </a>
        </li>
      {/each}
    </ol>
  </div>
{/each}

<button class="btn btn-secondary" type="button" onclick={onReset}>
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
