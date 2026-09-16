<script lang="ts">
  let {
    photo,
    alt,
    srData,
  }: { photo: string; alt?: string; srData?: string } = $props();

  const src = $derived(`${import.meta.env.BASE_URL}${photo.replace(/^\//, "")}`);
  const lines = $derived((srData ?? "").split("\n").filter((line) => line.trim()));
</script>

<figure class="photo">
  <img class="food-photo" {src} alt={alt ?? ""} loading="lazy" decoding="async" />
  {#if lines.length}
    <figcaption class="sr-only">{lines.join(" ")}</figcaption>
  {/if}
</figure>
