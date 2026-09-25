<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Question } from "../../content/types";
  import type { QuestionResult } from "../../grading/grade";
  import { PRONOUN_FIELD, fieldStatus } from "../../grading/grade";
  import { t } from "../../content";
  import { setAnswer } from "../../state.svelte";
  import { noAutoCorrect } from "../../html-attrs";

  let {
    levelId,
    question,
    values,
    result,
    media,
  }: {
    levelId: string;
    question: Question;
    values: Record<string, string>;
    result?: QuestionResult;
    media?: Snippet;
  } = $props();

  const pronoun = $derived(values[PRONOUN_FIELD] ?? "");
  const subject = $derived(
    pronoun === "er"
      ? "Er"
      : pronoun === "sie" || pronoun === "sie-plural"
        ? "Sie"
        : "er/sie",
  );
  const kommt = $derived(
    pronoun === "sie-plural" ? "kommen" : pronoun === "" ? "kommt/kommen" : "kommt",
  );
  const wohnt = $derived(
    pronoun === "sie-plural" ? "wohnen" : pronoun === "" ? "wohnt/wohnen" : "wohnt",
  );
  const describedBy = $derived(result ? `${question.id}-feedback` : undefined);

  function statusOf(field: string): string | undefined {
    return fieldStatus(result, field);
  }
</script>

{@render media?.()}

<div>
  <label class="field-label" for={`${question.id}-${PRONOUN_FIELD}`}>
    {t("pronoun_label")}
  </label>
  <select
    class="field"
    id={`${question.id}-${PRONOUN_FIELD}`}
    value={values[PRONOUN_FIELD] ?? ""}
    data-state={statusOf(PRONOUN_FIELD) ?? ""}
    aria-describedby={describedBy}
    onchange={(event) =>
      setAnswer(levelId, question.id, PRONOUN_FIELD, event.currentTarget.value)}
  >
    <option value="">—</option>
    <option value="er">{t("pronoun_er")}</option>
    <option value="sie">{t("pronoun_sie")}</option>
    <option value="sie-plural">{t("pronoun_sie_plural")}</option>
  </select>
</div>

<div>
  <label class="field-label" for={`${question.id}-name`}>{t("name_label")}</label>
  <div class="field-line">
    <span class="de" lang="de">Das ist</span>
    <input
      class="field"
      id={`${question.id}-name`}
      type="text"
      value={values.name ?? ""}
      {...noAutoCorrect}
      data-state={statusOf("name") ?? ""}
      aria-describedby={describedBy}
      oninput={(event) => setAnswer(levelId, question.id, "name", event.currentTarget.value)}
    />
  </div>
</div>

<div>
  <label class="field-label" for={`${question.id}-from`}>{t("from_label")}</label>
  <div class="field-line">
    <span class="de" lang="de">{subject} {kommt}</span>
    <input
      class="field"
      id={`${question.id}-from`}
      type="text"
      value={values.from ?? ""}
      {...noAutoCorrect}
      data-state={statusOf("from") ?? ""}
      aria-describedby={describedBy}
      oninput={(event) => setAnswer(levelId, question.id, "from", event.currentTarget.value)}
    />
  </div>
</div>

<div>
  <label class="field-label" for={`${question.id}-residence`}>
    {t("residence_label")}
  </label>
  <div class="field-line">
    <span class="de" lang="de">{subject} {wohnt} in</span>
    <input
      class="field"
      id={`${question.id}-residence`}
      type="text"
      value={values.residence ?? ""}
      {...noAutoCorrect}
      data-state={statusOf("residence") ?? ""}
      aria-describedby={describedBy}
      oninput={(event) =>
        setAnswer(levelId, question.id, "residence", event.currentTarget.value)}
    />
  </div>
</div>

<div>
  <label class="field-label" for={`${question.id}-city`}>{t("city_label")}</label>
  <div class="field-line">
    <span class="de" lang="de">{subject} {wohnt} in</span>
    <input
      class="field"
      id={`${question.id}-city`}
      type="text"
      value={values.city ?? ""}
      {...noAutoCorrect}
      data-state={statusOf("city") ?? ""}
      aria-describedby={describedBy}
      oninput={(event) => setAnswer(levelId, question.id, "city", event.currentTarget.value)}
    />
  </div>
</div>

<div>
  <label class="field-label" for={`${question.id}-street`}>{t("street_label")}</label>
  <div class="field-line">
    <span class="de" lang="de">…, in der</span>
    <input
      class="field"
      id={`${question.id}-street`}
      type="text"
      value={values.street ?? ""}
      {...noAutoCorrect}
      data-state={statusOf("street") ?? ""}
      aria-describedby={describedBy}
      oninput={(event) => setAnswer(levelId, question.id, "street", event.currentTarget.value)}
    />
  </div>
</div>
