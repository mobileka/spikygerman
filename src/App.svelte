<script lang="ts">
  import { levels, t } from "./lib/content";
  import { format } from "./lib/format";
  import { parseHash, type Route } from "./lib/routing";
  import Home from "./lib/components/Home.svelte";
  import SectionView from "./lib/components/SectionView.svelte";
  import SummaryView from "./lib/components/SummaryView.svelte";
  import SummaryOverview from "./lib/components/SummaryOverview.svelte";
  import TopBar from "./lib/components/TopBar.svelte";
  import TabBar from "./lib/components/TabBar.svelte";
  import UmlautRow from "./lib/components/UmlautRow.svelte";

  let route = $state<Route>(parseHash(window.location.hash) ?? { name: "home" });

  const level = $derived.by(() => {
    const current = route;
    if (current.name === "home") return null;
    return levels.find((candidate) => candidate.number === current.level) ?? null;
  });

  const section = $derived.by(() => {
    const current = route;
    if (current.name !== "section" || !level) return null;
    return level.sections.find((candidate) => candidate.id === current.id) ?? null;
  });

  $effect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      if (next) route = next;
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  });

  $effect(() => {
    let screen = t("tab_home");
    if (route.name === "summary") {
      screen = level
        ? `${t("summary_title")} – ${format(t("level_chip"), { level: level.number })}`
        : t("summary_title");
    } else if (route.name === "section") {
      screen = section?.title ?? t("tab_home");
    }
    document.title = `${screen} — SpikyGerman`;
  });

  $effect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.isComposing) return;
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.closest("button")) {
        return;
      }
      const check = target
        .closest(".qcard")
        ?.querySelector<HTMLButtonElement>("[data-check]");
      if (!check) return;
      event.preventDefault();
      check.click();
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  });
</script>

<a class="skip-link" href="#screens">{t("skip_link")}</a>

<div class="app">
  <TopBar current={route.name} {level} />

  <main class="screen" id="screens" tabindex="-1">
    {#if section && level}
      {#key `${level.id}:${section.id}`}
        <SectionView
          {level}
          {section}
          questionId={route.name === "section" ? route.questionId : undefined}
        />
      {/key}
    {:else if route.name === "summary"}
      {#if level}
        <SummaryView {level} />
      {:else}
        <SummaryOverview />
      {/if}
    {:else}
      <Home />
    {/if}
  </main>

  <footer>
    <UmlautRow />
    <TabBar current={route.name} {level} />
  </footer>
</div>
