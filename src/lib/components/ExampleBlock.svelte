<script lang="ts">
  import { t } from "../content.svelte";
  import ImageBlock from "./ImageBlock.svelte";
  import SpeakableText from "./SpeakableText.svelte";
  import SpeakButton from "./SpeakButton.svelte";

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
  <div class="example-head">
    <strong>{t("example_label")}</strong>
    {#if german}
      <SpeakButton id={`example:${example}`} text={example} />
    {/if}
  </div>
  {#if photo}
    <ImageBlock {photo} {alt} />
  {/if}
  {#if german}
    <span class="example-text" lang="de"><SpeakableText text={example} id={`example-text:${example}`} /></span>
  {:else}
    <span class="example-text">{example}</span>
  {/if}
</div>
