<script lang="ts">
  import type { LanguageInfo } from "../content/types";
  import { availableLanguages, getLang, setLanguage, t } from "../content.svelte";
  import { format } from "../format";
  import {
    isSpeechEnabled,
    speechSupported,
    toggleSpeech,
  } from "../speech.svelte";

  let status = $state("");
  let busy = $state(false);

  async function choose(language: LanguageInfo): Promise<void> {
    if (busy || getLang() === language.code) return;
    busy = true;
    try {
      await setLanguage(language.code);
      status = format(t("settings_language_saved"), { language: language.name });
    } catch (error) {
      console.error(error);
      status = t("settings_language_error");
    } finally {
      busy = false;
    }
  }
</script>

<header class="hero" data-od-id="settings-hero">
  <h1>{t("settings_title")}</h1>
</header>

<section class="panel" aria-labelledby="set-lang-h" data-od-id="settings-language">
  <div class="panel-h">
    <span id="set-lang-h">{t("settings_language_title")}</span>
  </div>
  <div class="panel-b">
    <div
      class="choice-group"
      role="group"
      aria-label={t("settings_language_label")}
      aria-busy={busy}
    >
      {#each availableLanguages as language (language.code)}
        <button
          class="choice"
          type="button"
          aria-pressed={getLang() === language.code}
          onclick={() => choose(language)}
        >
          <span class="choice-key">{language.code.toUpperCase()}</span>
          <span>{language.name}</span>
        </button>
      {/each}
    </div>
    <p class="set-status" role="status" aria-live="polite">{status}</p>
  </div>
</section>

<section class="panel" aria-labelledby="set-speech-h" data-od-id="settings-speech">
  <div class="panel-h">
    <span id="set-speech-h">{t("settings_speech_title")}</span>
  </div>
  <div class="panel-b">
    {#if speechSupported}
      <button
        class="choice"
        type="button"
        aria-pressed={isSpeechEnabled()}
        onclick={toggleSpeech}
      >
        <span class="choice-key" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          </svg>
        </span>
        <span>{t("settings_speech_label")}</span>
        <span
          class="toggle"
          data-on={isSpeechEnabled() ? "" : undefined}
          aria-hidden="true"
        ><span></span></span>
      </button>
      <p class="set-note">{t("settings_speech_desc")}</p>
    {:else}
      <p class="set-note">{t("settings_speech_unsupported")}</p>
    {/if}
  </div>
</section>
