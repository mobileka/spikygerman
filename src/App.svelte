<script lang="ts">
  import { content } from "./lib/content";
  import Home from "./lib/components/Home.svelte";
  import SectionView from "./lib/components/SectionView.svelte";

  type Route = { name: "home" } | { name: "section"; id: string };

  function parseHash(hash: string): Route | null {
    if (hash === "" || hash === "#" || hash === "#/") return { name: "home" };
    const match = hash.match(/^#\/s\/([a-z0-9-]+)/i);
    return match ? { name: "section", id: match[1] } : null;
  }

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
    document.title = `${content.test.title} — SpikyGerman`;
  });
</script>

<a class="skip-link" href="#content">К содержанию</a>

<main id="content" tabindex="-1">
  {#if section}
    {#key section.id}
      <SectionView {section} />
    {/key}
  {:else}
    <Home />
  {/if}
</main>
