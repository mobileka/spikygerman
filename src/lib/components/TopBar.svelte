<script lang="ts">
  import { content, t } from "../content";
  import { format } from "../format";
  import { summarizeProgress } from "../grading/summary";
  import type { Route } from "../routing";
  import { progress } from "../state.svelte";
  import { getTheme, toggleTheme } from "../theme.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  let { current }: { current: Route["name"] } = $props();

  const counts = $derived(
    summarizeProgress(
      content.sections,
      progress.answers,
      content.countries,
      progress.checked,
    ),
  );
  const dark = $derived(getTheme() === "dark");
  const themeLabel = $derived(dark ? t("theme_to_light") : t("theme_to_dark"));
</script>

<header class="topbar">
  <div class="brand-row">
    <a class="mark" href="#/" aria-label={t("logo_home_label")}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5.1 23.3 2.2 22.2l1.4-2.6-2-2.3 2.5-1.7-.7-2.9 3.1-.4.9-2.8 2.9.9 2.2-2.1 2.2 2.1 2.9-.9.9 2.8 3.1.4-.7 2.9 2.5 1.7-2 2.3 1.4 2.6-2.9 1.1Z" fill="#3f444e" stroke="#2e3138" stroke-width="0.9" stroke-linejoin="round" />
            <path d="M4.6 21.3 2.9 19.6l1.2-2-1.2-2.2 2.1-1.3.6-2.3 2.5-.2 1.6-1.8 2.3.9 2.3-.9 1.6 1.8 2.5.2.6 2.3 2.1 1.3-1.2 2.2 1.2 2-1.7 1.7Z" fill="#5d6472" />
            <circle cx="5.8" cy="13.5" r="2.1" fill="#fdf4e0" stroke="#2e3138" stroke-width="0.9" />
            <circle cx="19.2" cy="13.5" r="2.1" fill="#fdf4e0" stroke="#2e3138" stroke-width="0.9" />
            <path d="M5.2 27.5V19a7.3 6.8 0 0 1 14.6 0v8.5Z" fill="#fdf4e0" stroke="#2e3138" stroke-width="1.1" stroke-linejoin="round" />
            <ellipse cx="9.7" cy="18.5" rx="2" ry="2.4" fill="#eecb93" />
            <ellipse cx="15.3" cy="18.5" rx="2" ry="2.4" fill="#eecb93" />
            <circle cx="9.7" cy="18.3" r="1.25" fill="#2e3138" />
            <circle cx="15.3" cy="18.3" r="1.25" fill="#2e3138" />
            <circle cx="10.1" cy="17.9" r="0.35" fill="#ffffff" />
            <circle cx="15.7" cy="17.9" r="0.35" fill="#ffffff" />
            <ellipse cx="12.5" cy="21.2" rx="1.4" ry="1" fill="#2e3138" />
            <ellipse cx="12.1" cy="21" rx="0.4" ry="0.25" fill="#ffffff" opacity="0.7" />
            <path d="M12.5 22.2v.7m0 0c-.3 1-2.4 1.2-3 .3m3-.3c.3 1 2.4 1.2 3 .3" stroke="#2e3138" stroke-width="0.55" fill="none" stroke-linecap="round" />
            <path d="M19 25.4 17.2 24.2l1.1-1.8-.8-1.9 2-.9.5-2 2.2.3 1.6-1.4 1.6 1.4 2.2-.3.5 2 2 .9-.8 1.9 1.1 1.8-1.8 1.2Z" fill="#3f444e" stroke="#2e3138" stroke-width="0.8" stroke-linejoin="round" />
            <path d="M18.8 23.9 17.9 22.4l1.2-1.3.1-1.7 1.7-.6 1.2-1.3 1.7.5 1.7-.5 1.2 1.3 1.7.6.1 1.7 1.2 1.3-.9 1.5Z" fill="#5d6472" />
            <circle cx="20.3" cy="19.8" r="1.25" fill="#fdf4e0" stroke="#2e3138" stroke-width="0.8" />
            <circle cx="27.3" cy="19.8" r="1.25" fill="#fdf4e0" stroke="#2e3138" stroke-width="0.8" />
            <path d="M19.6 27.5V23a4.2 4 0 0 1 8.4 0v4.5Z" fill="#fdf4e0" stroke="#2e3138" stroke-width="1" stroke-linejoin="round" />
            <ellipse cx="20.6" cy="25" rx="0.65" ry="0.4" fill="#e8a080" opacity="0.6" />
            <ellipse cx="27" cy="25" rx="0.65" ry="0.4" fill="#e8a080" opacity="0.6" />
            <circle cx="21.9" cy="23" r="1.8" fill="#ffffff" stroke="#2e3138" stroke-width="0.9" />
            <circle cx="25.7" cy="23" r="1.8" fill="#ffffff" stroke="#2e3138" stroke-width="0.9" />
            <path d="M23.7 23h.2M20.1 22.8l-.9-.2M27.5 22.8l.9-.2" stroke="#2e3138" stroke-width="0.7" stroke-linecap="round" />
            <circle cx="21.9" cy="23.1" r="0.8" fill="#2e3138" />
            <circle cx="25.7" cy="23.1" r="0.8" fill="#2e3138" />
            <circle cx="22.2" cy="22.8" r="0.22" fill="#ffffff" />
            <circle cx="26" cy="22.8" r="0.22" fill="#ffffff" />
            <circle cx="23.8" cy="25.4" r="0.65" fill="#2e3138" />
            <path d="M23.8 26v.3m0 0c-.2.5-1.2.6-1.5.2m1.5-.2c.2.5 1.2.6 1.5.2" stroke="#2e3138" stroke-width="0.45" fill="none" stroke-linecap="round" />
          </svg>
      </a>
      <span class="brand-text">
        <span class="brand-name">SpikyGerman</span>
        <span class="brand-sub">{t("brand_subtitle")}</span>
      </span>
      {#if current !== "home"}
        <span class="level-chip" data-od-id="level-badge">{t("level_chip")}</span>
      {/if}
      <button
        class="theme-toggle"
        type="button"
        data-theme-toggle
        data-od-id="theme-toggle"
        aria-pressed={dark}
        aria-label={themeLabel}
        title={themeLabel}
        onclick={toggleTheme}
      >
        <svg class="tt-sun" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path
            d="M12 2.4v2.3M12 19.3v2.3M2.4 12h2.3M19.3 12h2.3M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"
          />
        </svg>
        <svg class="tt-moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.2 14.4A8.2 8.2 0 1 1 9.6 3.8a6.6 6.6 0 0 0 10.6 10.6Z" />
        </svg>
      </button>
    </div>
    {#if current !== "home"}
      <div class="lvl-progress">
        <ProgressBar {counts} />
        <p class="progress-text" role="status">
          {format(t("progress_answered"), {
            answered: counts.answered,
            total: counts.total,
          })}
        </p>
      </div>
    {/if}
</header>
