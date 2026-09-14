<script lang="ts">
  import type { ProgressCounts } from "../grading/summary";

  let { counts }: { counts: ProgressCounts } = $props();

  const parts = $derived(
    [
      { key: "correct", count: counts.correct },
      { key: "almost", count: counts.almost },
      { key: "incorrect", count: counts.incorrect },
    ].map((part) => ({
      key: part.key,
      width: counts.total ? (part.count / counts.total) * 100 : 0,
    })),
  );
</script>

<div class="progress-line" aria-hidden="true">
  {#each parts as part (part.key)}
    <span
      class={`progress-seg seg-${part.key}`}
      style={`width: ${part.width}%`}
    ></span>
  {/each}
</div>
