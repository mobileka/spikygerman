<script lang="ts">
  import type { Question } from "../content/types";
  import type { Hint, QuestionResult, Status } from "../grading/grade";
  import { explanationText, t } from "../content";

  let {
    question,
    result,
    id,
  }: { question: Question; result: QuestionResult; id: string } = $props();

  const statusLabel: Record<Status, string> = {
    correct: "result_correct",
    almost: "result_almost",
    incorrect: "result_incorrect",
    empty: "result_empty",
  };

  const statusIcon: Record<Status, string> = {
    correct: "✓",
    almost: "!",
    incorrect: "✕",
    empty: "",
  };

  function hintText(hint: Hint): string {
    switch (hint.kind) {
      case "start_with":
        return t("hint_start_with", { expected: hint.expected });
      case "end_with":
        return t("hint_end_with", { expected: hint.expected });
      case "country":
        return t("hint_country", {
          name: hint.name,
          article: t(`article_${hint.article}`),
          aus: hint.aus,
        });
      case "missing":
        return t("hint_missing", { keywords: hint.keywords.join(", ") });
      case "missing_sentence":
        return t("hint_missing_sentence", { expected: hint.expected });
      case "frame":
        return t("hint_frame", { expected: hint.expected });
      case "umlaut":
        return t("hint_umlaut", { expected: hint.expected });
    }
  }

  const hints = $derived.by(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const field of result.fields) {
      if (!field.hint) continue;
      const text = hintText(field.hint);
      if (!seen.has(text)) {
        seen.add(text);
        out.push(text);
      }
    }
    return out;
  });

  const explanation = $derived(explanationText(question.id));
</script>

<div class="feedback" id={id} data-status={result.status}>
  <p class="st">
    {#if statusIcon[result.status]}
      <span aria-hidden="true">{statusIcon[result.status]}</span>
    {/if}
    <span>{t(statusLabel[result.status])}</span>
  </p>
  {#if result.status !== "empty"}
    <p class="model">
      {t("model_answer")}: <code lang="de">{result.model}</code>
    </p>
    {#each hints as hint (hint)}
      <p class="tip">{hint}</p>
    {/each}
    {#if explanation}
      <p class="tip">
        {t("explanation_label")}: {explanation}
      </p>
    {/if}
  {/if}
</div>
