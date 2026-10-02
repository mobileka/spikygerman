<script lang="ts">
  import type { Question } from "../content/types";
  import type { Hint, QuestionResult, Status } from "../grading/grade";
  import { t } from "../content.svelte";
  import SpeakableText from "./SpeakableText.svelte";
  import SpeakButton from "./SpeakButton.svelte";

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
    empty: "○",
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

  const explanation = $derived(question.explanation);
  // The speaker always reads the learner's own correct sentence when there is
  // one; patterns like "Ich heiße …" would be read literally otherwise.
  const speakText = $derived(result.assembled ?? result.model);
  // Gaps and person tasks accept wording variants, so the learner's assembled
  // sentence becomes the primary answer and the canonical one shows below.
  const variantTask = $derived(
    question.type === "gaps" || question.type === "person",
  );
  const displayText = $derived(
    variantTask && result.assembled ? result.assembled : result.model,
  );
  const otherAnswers = $derived(
    variantTask &&
      result.status === "correct" &&
      result.assembled &&
      result.assembled !== result.model
      ? result.model
      : null,
  );
</script>

<div
  class={result.status === "empty"
    ? "feedback is-empty"
    : `feedback ${result.status}`}
  id={id}
  role="status"
>
  <span class="fb-glyph" aria-hidden="true">{statusIcon[result.status]}</span>
  <div class="fb-main">
    <div class="fb-verdict">
      <strong>{t(statusLabel[result.status])}</strong>
      {#if result.status === "correct"}
        <SpeakButton id={`${question.id}-model`} text={speakText} />
      {/if}
    </div>
    {#if result.status !== "empty"}
      <p class="model">
        {t("model_answer")}: <code lang="de"><SpeakableText text={displayText} id={`${question.id}-model`} /></code>
        {#if question.translation}
          <span class="translation" lang="ru">({question.translation})</span>
        {/if}
      </p>
      {#if otherAnswers}
        <p class="model">
          {t("other_answers")}: <code lang="de"><SpeakableText text={otherAnswers} id={`${question.id}-other`} /></code>
        </p>
      {/if}
      {#each hints as hint (hint)}
        <p class="tip">{hint}</p>
      {/each}
      {#if explanation}
        <p class="tip is-multiline">
          {t("explanation_label")}: {explanation}
        </p>
      {/if}
    {/if}
  </div>
</div>
