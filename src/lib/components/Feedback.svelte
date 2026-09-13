<script lang="ts">
  import type { Question } from "../content/types";
  import type { Hint, QuestionResult, Status } from "../grading/grade";
  import { explanationText, t } from "../content";
  import { format } from "../format";

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
  <p class="status">{t(statusLabel[result.status])}</p>
  {#each hints as hint (hint)}
    <p class="hint">{hint}</p>
  {/each}
  <p class="model">
    <strong>{t("model_answer")}:</strong>
    <span lang="de">{result.model}</span>
  </p>
  {#if explanation}
    <p class="explanation">
      <strong>{t("explanation_label")}:</strong>
      {explanation}
    </p>
  {/if}
</div>
