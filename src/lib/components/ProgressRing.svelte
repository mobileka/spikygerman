<script lang="ts">
  import type { ProgressCounts } from "../grading/summary";

  let { counts }: { counts: ProgressCounts } = $props();

  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  const parts = $derived.by(() => {
    const statuses = [
      { key: "correct", count: counts.correct },
      { key: "almost", count: counts.almost },
      { key: "incorrect", count: counts.incorrect },
    ] as const;

    let offset = 0;
    return statuses.map((part) => {
      const length = counts.total
        ? (part.count / counts.total) * circumference
        : 0;
      const segment = { key: part.key, length, offset };
      offset += length;
      return segment;
    });
  });
</script>

<svg class="sec-ring" viewBox="0 0 56 56" aria-hidden="true">
  <g transform="rotate(-90 28 28)">
    <circle class="ring-track" cx="28" cy="28" r={radius} />
    {#each parts as part (part.key)}
      <circle
        class={`ring-seg ring-${part.key}`}
        cx="28"
        cy="28"
        r={radius}
        stroke-dasharray={`${part.length} ${circumference - part.length}`}
        stroke-dashoffset={-part.offset}
      />
    {/each}
  </g>
</svg>
