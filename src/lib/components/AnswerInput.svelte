<script lang="ts">
  import { noAutoCorrect } from "../html-attrs";

  let {
    id,
    label,
    value,
    status,
    describedBy,
    oninput,
  }: {
    id: string;
    label: string;
    value: string;
    status?: string;
    describedBy?: string;
    oninput: (value: string) => void;
  } = $props();
</script>

<label class="field-label" for={id}>{label}</label>
<input
  class="field"
  {id}
  type="text"
  {value}
  {...noAutoCorrect}
  data-state={status ?? ""}
  aria-invalid={status === "incorrect" ? "true" : undefined}
  aria-describedby={describedBy}
  oninput={(event) => oninput(event.currentTarget.value)}
/>
