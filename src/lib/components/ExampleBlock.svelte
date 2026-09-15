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
  <strong>{t("example_label")}</strong>
  {#if photo}
    <ImageBlock {photo} {alt} />
  {/if}
  {#if german}
    <br /><span lang="de">{example}</span>
  {:else}
    <br /><span>{example}</span>
  {/if}
</div>
