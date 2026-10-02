<script lang="ts">
  import { cleanSpeechText, isSpeechEnabled, speak } from "../speech.svelte";

  let { text, id }: { text: string; id: string } = $props();

  // Keep the whitespace tokens so line breaks survive (examples are pre-line).
  const tokens = $derived(text.split(/(\s+)/));
</script>

{#each tokens as token, index (index)}
  {@const word = cleanSpeechText(token)}
  {#if isSpeechEnabled() && !/^\s+$/.test(token) && word}
    <!-- Tap-to-hear is a click-only convenience: tabindex="-1" keeps every
         word out of the tab order, and the speaker buttons are the keyboard
         path to pronunciation. -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions, a11y_no_static_element_interactions -->
    <span
      class="de-word"
      tabindex="-1"
      onclick={() => speak(`word:${id}:${index}`, word)}>{token}</span
    >
  {:else}
    {token}
  {/if}
{/each}
