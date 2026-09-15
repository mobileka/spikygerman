<script lang="ts">
  const LOWER = ["ä", "ö", "ü", "ß"];
  const UPPER = ["Ä", "Ö", "Ü", "ẞ"];

  let active: HTMLInputElement | null = $state(null);
  let inferredUpper = $state(false);
  let row: HTMLDivElement | undefined = $state();

  function isTextField(target: EventTarget | null): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.type === "text";
  }

  function isLetter(character: string): boolean {
    return /[A-Za-zÄÖÜäöüß]/.test(character);
  }

  function isUpperCase(character: string): boolean {
    return /[A-ZÄÖÜ]/.test(character);
  }

  function refreshCase(): void {
    const element = active;
    if (!element) return;
    const position = element.selectionStart ?? element.value.length;
    const before = element.value.slice(0, position);
    const previous = before.slice(-1);
    if (!previous) {
      inferredUpper = false;
      return;
    }
    if (isLetter(previous)) inferredUpper = isUpperCase(previous);
  }

  const upper = $derived(inferredUpper);

  $effect(() => {
    const onFocusIn = (event: FocusEvent) => {
      if (!isTextField(event.target)) return;
      const target = event.target;
      queueMicrotask(() => {
        active = target;
        refreshCase();
      });
    };
    const onFocusOut = (event: FocusEvent) => {
      if (event.target !== active) return;
      const next = event.relatedTarget;
      if (next instanceof Node && row?.contains(next)) return;
      queueMicrotask(() => {
        active = null;
      });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift" && !event.repeat) {
        inferredUpper = !inferredUpper;
      }
    };
    const onSelectionChange = () => {
      if (document.activeElement === active) refreshCase();
    };
    const onInput = (event: Event) => {
      if (event.target === active) refreshCase();
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("input", onInput, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("input", onInput, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  function toggleCase(): void {
    inferredUpper = !inferredUpper;
  }

  function insert(character: string): void {
    const element = active;
    if (!element) return;
    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? start;
    element.setRangeText(character, start, end, "end");
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.focus();
  }
</script>

<div class="bottombar" hidden={!active}>
  <div
    class="umlaut"
    id="umlautRow"
    role="toolbar"
    aria-label="Немецкие буквы"
    bind:this={row}
  >
    {#if active}
      {#each upper ? UPPER : LOWER as character (character)}
        <button
          type="button"
          onmousedown={(event) => event.preventDefault()}
          onpointerdown={(event) => event.preventDefault()}
          onclick={() => insert(character)}
          aria-label={`Вставить ${character}`}
        >
          {character}
        </button>
      {/each}
      <button
        type="button"
        onmousedown={(event) => event.preventDefault()}
        onpointerdown={(event) => event.preventDefault()}
        onclick={toggleCase}
        aria-label="Переключить регистр"
      >
        {upper ? "⇧ а" : "⇧ А"}
      </button>
    {/if}
  </div>
</div>
