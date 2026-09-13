<script lang="ts">
  let {
    photo,
    alt,
    srData,
  }: { photo: string; alt?: string; srData?: string } = $props();

  const src = $derived(photo.startsWith("/") ? photo : `/${photo}`);
  const lines = $derived((srData ?? "").split("\n").filter((line) => line.trim()));
</script>

<figure class="image-block">
  <img {src} alt={alt ?? ""} loading="lazy" decoding="async" />
  {#if lines.length}
    <figcaption class="sr-data">
      {#each lines as line (line)}
        <p>{line}</p>
      {/each}
    </figcaption>
  {/if}
</figure>
