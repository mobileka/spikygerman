<script lang="ts">
  import { content, t } from "./lib/content";
  import { parseHash, type Route } from "./lib/routing";
  import Home from "./lib/components/Home.svelte";
  import SectionView from "./lib/components/SectionView.svelte";
  import SummaryView from "./lib/components/SummaryView.svelte";
  import TopBar from "./lib/components/TopBar.svelte";
  import TabBar from "./lib/components/TabBar.svelte";
  import UmlautRow from "./lib/components/UmlautRow.svelte";

  let route = $state<Route>(parseHash(window.location.hash) ?? { name: "home" });

  const section = $derived.by(() => {
    const current = route;
    if (current.name !== "section") return null;
    return (
      content.sections.find((candidate) => candidate.id === current.id) ?? null
    );
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
    const prefix = route.name === "summary" ? `${t("summary_title")} — ` : "";
    document.title = `${prefix}${content.test.title} — SpikyGerman`;
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
        ?.querySelector<HTMLButtonElement>(".check-button");
      if (!check) return;
      event.preventDefault();
      check.click();
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  });
</script>

<a class="skip-link" href="#content">{t("skip_link")}</a>

<div class="app">
  <TopBar />

  <main id="content" tabindex="-1">
    {#if section}
      {#key section.id}
        <SectionView
          {section}
          questionId={route.name === "section" ? route.questionId : undefined}
        />
      {/key}
    {:else if route.name === "summary"}
      <SummaryView />
    {:else}
      <Home />
    {/if}
  </main>

  <footer class="app-footer">
    <UmlautRow />
    <TabBar current={route.name} />
  </footer>
</div>
