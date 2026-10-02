<script lang="ts">
  import { t } from "../content.svelte";
  import { getSpeakingKey, isSpeechEnabled, speak } from "../speech.svelte";

  let { text, id }: { text: string; id: string } = $props();

  const key = $derived(`speak:${id}`);
  const speaking = $derived(getSpeakingKey() === key);
  const label = $derived(speaking ? t("speech_stop") : t("speech_play"));
</script>

{#if isSpeechEnabled()}
  <button
    type="button"
    class="speak-btn"
    aria-pressed={speaking}
    aria-label={label}
    title={label}
    data-speaking={speaking ? "" : undefined}
    onclick={() => speak(key, text)}
  >
    {#if speaking}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
      </svg>
    {:else}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    {/if}
  </button>
{/if}
