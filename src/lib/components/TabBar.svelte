<script lang="ts">
  import type { CompiledLevel } from "../content/types";
  import { levels, t } from "../content";
  import { continueSectionId } from "../progress";
  import { sectionHash, summaryHash, type Route } from "../routing";
  import { progressFor } from "../state.svelte";

  let {
    current,
    level = null,
  }: { current: Route["name"]; level?: CompiledLevel | null } = $props();

  function hasUnfinished(level: CompiledLevel): boolean {
    const done = new Set(progressFor(level.id).checked);
    return level.sections.some((section) =>
      section.questions.some((question) => !done.has(question.id)),
    );
  }

  // Off a level route, continue where the learner left off: the first level
  // with unanswered questions, otherwise the first level.
  const active = $derived.by(() => {
    if (level) return level;
    return levels.find((candidate) => hasUnfinished(candidate)) ?? levels[0] ?? null;
  });

  const continueId = $derived(
    active ? continueSectionId(active.sections, progressFor(active.id).checked) : null,
  );
  const continueHref = $derived(
    active && continueId ? sectionHash(active.number, continueId) : "#/",
  );
  const summaryHref = $derived(active ? summaryHash(active.number) : "#/");
</script>

<nav class="tabbar" aria-label={t("main_nav_label")}>
  <a
    class="tab"
    href="#/"
    aria-current={current === "home" ? "page" : undefined}
  >
    <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 10.5 10 3.5l7 7M5 9.5V16h4v-4h2v4h4V9.5" />
    </svg>
    <span>{t("tab_home")}</span>
  </a>
  <a
    class="tab"
    href={continueHref}
    aria-current={current === "section" ? "page" : undefined}
  >
    <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 5h12v7H9l-3 3v-3H4z" />
    </svg>
    <span>{t("tab_continue")}</span>
  </a>
  <a
    class="tab"
    href={summaryHref}
    aria-current={current === "summary" ? "page" : undefined}
  >
    <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 16V9m4 7V5m4 11v-6m4 6V7" />
    </svg>
    <span>{t("summary_title")}</span>
  </a>
</nav>
