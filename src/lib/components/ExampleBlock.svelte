<script lang="ts">
  import { t } from "../content";
  import ImageBlock from "./ImageBlock.svelte";

  let {
    example,
    photo,
    alt,
    german = true,
  }: {
    example: string;
    photo?: string;
    alt?: string;
    german?: boolean;
  } = $props();
</script>

<div class="example">
  <p class="ex-k">{t("example_label")}</p>
  {#if photo}
    <ImageBlock {photo} {alt} />
  {/if}
  {#if german}
    <p class="example-text" lang="de">{example}</p>
  {:else}
    <p class="example-text">{example}</p>
  {/if}
</div>
