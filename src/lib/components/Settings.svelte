<script lang="ts">
  import type { LanguageInfo } from "../content/types";
  import { availableLanguages, getLang, setLanguage, t } from "../content.svelte";
  import { format } from "../format";

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
