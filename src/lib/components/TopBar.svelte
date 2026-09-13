<script lang="ts">
  import { t } from "../content";
</script>

<header class="topbar">
  <div class="topbar-inner">
    <div class="brand-row">
      <a class="mark-link" href="#/" aria-label={t("logo_home_label")}>
        <span class="mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5 20 4 14l3 1V9l3 4 2-6 2 5 3-5 1 5 3-4v5l3-2-1 5Z" fill="#4a3520" />
            <ellipse cx="14" cy="21" rx="9" ry="6.5" fill="#6b4f2e" />
            <ellipse cx="21" cy="22.5" rx="3.6" ry="2.8" fill="#d9b98a" />
            <circle cx="23.8" cy="21.8" r="1" fill="#2b2118" />
            <circle cx="18.5" cy="19.5" r="1.2" fill="#241c12" />
            <circle cx="18.5" cy="19.5" r="2.6" fill="none" stroke="#ffffff" stroke-width="1.2" />
            <path d="M21 19l2.5-1" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" />
            <path d="M20 26v-5l2 1.5L23 18.5l2 3 2-3 .5 4 2.5-.5-1 3.5Z" fill="#3c2d1b" />
            <ellipse cx="24.5" cy="25.5" rx="5" ry="3.8" fill="#7d5c33" />
            <ellipse cx="28" cy="26" rx="2" ry="1.6" fill="#e3c893" />
            <circle cx="26" cy="24.3" r=".9" fill="#241c12" />
            <circle cx="29.6" cy="25.6" r=".7" fill="#2b2118" />
          </svg>
        </span>
      </a>
      <span class="brand-text">
        <span class="brand-name">SpikyGerman</span>
        <span class="brand-sub">{t("brand_subtitle")}</span>
      </span>
      <span class="level-chip">{t("level_chip")}</span>
    </div>
    <div class="progress-line" aria-hidden="true">
      <span class="progress-fill"></span>
    </div>
    <p class="progress-text" role="status">{t("progress_saved")}</p>
  </div>
</header>
