<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Question } from "../../content/types";
  import type { QuestionResult } from "../../grading/grade";
  import { ANSWER_FIELD, fieldStatus } from "../../grading/grade";
  import { countBlanks } from "../../grading/normalize";
  import { t } from "../../content.svelte";
  import { setAnswer } from "../../state.svelte";
  import AnswerInput from "../AnswerInput.svelte";
  import SpeakableText from "../SpeakableText.svelte";
  import SpeakButton from "../SpeakButton.svelte";

  let {
    levelId,
    question,
    number,
    values,
    result,
    media,
  }: {
    levelId: string;
    question: Question;
    number: number;
    values: Record<string, string>;
    result?: QuestionResult;
    media?: Snippet;
  } = $props();

  const askId = $derived(`${question.id}-ask`);
  const status = $derived(fieldStatus(result, ANSWER_FIELD));
  const describedBy = $derived(
    result ? `${askId} ${question.id}-feedback` : askId,
  );
  // Translate asks are Russian; everything else is a German question. Questions
  // with blanks only allow word taps — the whole sentence is not a sentence.
  const german = $derived(question.type !== "translate");
  const hasBlanks = $derived(countBlanks(question.ask) > 0);
</script>

<span class="q-ask" id={askId} lang={german ? "de" : "ru"}>
  <span class="qn">{number}.</span>
  {#if german}
    <SpeakableText text={question.ask} id={`${question.id}-ask`} />
  {:else}
    {question.ask}
  {/if}
  {#if german && !hasBlanks}
    <SpeakButton id={`${question.id}-ask`} text={question.ask} />
  {/if}
</span>

{@render media?.()}

<AnswerInput
  id={`${question.id}-answer`}
  label={t("answer_label")}
  value={values[ANSWER_FIELD] ?? ""}
  {status}
  {describedBy}
  oninput={(value) => setAnswer(levelId, question.id, ANSWER_FIELD, value)}
/>
