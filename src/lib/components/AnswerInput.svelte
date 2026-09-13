<script lang="ts">
  import { noAutoCorrect } from "../html-attrs";

  let {
    id,
    label,
    value,
    status,
    describedBy,
    multiline = false,
    oninput,
  }: {
    id: string;
    label: string;
    value: string;
    status?: string;
    describedBy?: string;
    multiline?: boolean;
    oninput: (value: string) => void;
  } = $props();
</script>

<label class="field" for={id}>
  <span class="field-label">{label}</span>
  {#if multiline}
    <textarea
      {id}
      rows="2"
      {value}
      {...noAutoCorrect}
      data-status={status ?? ""}
      aria-invalid={status === "incorrect" ? "true" : undefined}
      aria-describedby={describedBy}
      oninput={(event) => oninput(event.currentTarget.value)}
    ></textarea>
  {:else}
    <input
      {id}
      type="text"
      {value}
      {...noAutoCorrect}
      data-status={status ?? ""}
      aria-invalid={status === "incorrect" ? "true" : undefined}
      aria-describedby={describedBy}
      oninput={(event) => oninput(event.currentTarget.value)}
    />
  {/if}
</label>
