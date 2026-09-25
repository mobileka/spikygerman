import { describe, expect, it } from "vitest";
import content from "../src/generated/content.ru.json";
import {
  ANSWER_FIELD,
  CHOICE_FIELD,
  PRONOUN_FIELD,
  gapField,
  gradeQuestion,
} from "../src/lib/grading/grade.ts";
import { countBlanks, fillBlanks, normalize } from "../src/lib/grading/normalize.ts";
import type { CompiledContent, Question } from "../src/lib/content/types.ts";

const data = content as unknown as CompiledContent;
const questions = data.levels[0].sections.flatMap((section) => section.questions);

function byId(id: string): Question {
  const question = questions.find((candidate) => candidate.id === id);
  if (!question) throw new Error(`question ${id} not found`);
  return question;
}

function grade(question: Question, values: Record<string, string>) {
  return gradeQuestion(question, values, data.countries);
}

function modelValues(question: Question): Record<string, string> {
  switch (question.type) {
    case "sentence":
      return {
        [ANSWER_FIELD]: `${question.starts_with} Anna${
          question.ends_with ? ` ${question.ends_with}` : ""
        }`,
      };
    case "gaps":
      return Object.fromEntries(
        (question.answers ?? []).map((alternatives, index) => [
          gapField(index),
          alternatives[0] ?? "",
        ]),
      );
    case "person": {
      const country = data.countries.find(
        (candidate) => candidate.name.toLowerCase() === (question.from ?? "").toLowerCase(),
      );
      const from =
        country && country.article !== ""
          ? country.aus.replace(/^aus\s+/, "")
          : (question.from ?? "");
      return {
        [PRONOUN_FIELD]: question.pronoun ?? "",
        name: question.name ?? "",
        from,
        residence: question.residence ?? "",
        city: question.city ?? "",
        street: question.street ?? "",
      };
    }
    case "choice":
      return { [CHOICE_FIELD]: question.answer ?? "" };
    case "yesno":
    case "price":
    case "translate":
      return { [ANSWER_FIELD]: question.answer ?? "" };
  }
}

describe("model answers", () => {
  it.each(questions.map((question) => [question.id, question] as const))(
    "%s grades as correct with its model answer",
    (_id, question) => {
      const result = grade(question, modelValues(question));
      expect(result.status, JSON.stringify(result)).toBe("correct");
    },
  );

  it.each(questions.map((question) => [question.id, question] as const))(
    "%s grades as empty when unanswered",
    (_id, question) => {
      const result = grade(question, {});
      expect(result.status).toBe("empty");
    },
  );
});

describe("patterns about yourself (q01-q05)", () => {
  it("accepts any name after the frame", () => {
    expect(grade(byId("q01"), { answer: "Ich heiße Maria" }).status).toBe("correct");
    expect(grade(byId("q01"), { answer: "ich heisse Maria" }).status).toBe("correct");
  });

  it("fails gently when the frame is missing", () => {
    const result = grade(byId("q01"), { answer: "Maria" });
    expect(result.status).toBe("incorrect");
    expect(result.fields[0].hint).toEqual({ kind: "start_with", expected: "Ich heiße" });
  });

  it("fails when the age sentence is not finished", () => {
    const result = grade(byId("q05"), { answer: "Ich bin 25" });
    expect(result.status).toBe("incorrect");
    expect(result.fields[0].hint).toEqual({ kind: "end_with", expected: "Jahre alt" });
  });

  it("corrects a missing country article to yellow", () => {
    const result = grade(byId("q02"), { answer: "Ich komme aus Ukraine" });
    expect(result.status).toBe("almost");
    expect(result.fields[0].hint).toMatchObject({
      kind: "country",
      name: "Ukraine",
      aus: "aus der Ukraine",
    });
  });

  it("accepts the correct article and unknown countries", () => {
    expect(grade(byId("q02"), { answer: "Ich komme aus der Ukraine" }).status).toBe("correct");
    expect(grade(byId("q02"), { answer: "Ich komme aus Syrien." }).status).toBe("correct");
  });

  it("fails when nothing follows aus", () => {
    expect(grade(byId("q02"), { answer: "Ich komme aus" }).status).toBe("incorrect");
  });
});

describe("gap fill (q06-q08, q28-q38)", () => {
  it("fills q06 with the model answer", () => {
    const result = grade(byId("q06"), { g0: "kommen", g1: "Sie", g2: "aus" });
    expect(result.model).toBe("Herr Meier, woher kommen Sie?\nIch komme aus Deutschland.");
  });

  it("is tolerant about case and extra spaces", () => {
    expect(grade(byId("q06"), { g0: " KOMMEN ", g1: "sie", g2: "Aus" }).status).toBe(
      "correct",
    );
  });

  it("still fails wrong forms and words", () => {
    expect(grade(byId("q07"), { g0: "kommst", g1: "komme", g2: "die" }).status).toBe(
      "incorrect",
    );
    expect(grade(byId("q28"), { g0: "ein" }).status).toBe("incorrect");
    expect(grade(byId("q30"), { g0: "kein", g1: "kein" }).status).toBe("incorrect");
  });

  it("offers select options for conjugation gaps", () => {
    const question = byId("q06");
    expect(question.gap_choices?.[0]).toEqual(["kommen", "kommst", "komme"]);
    expect(question.gap_choices?.[1]).toEqual([]);
    expect(grade(question, { g0: "komme", g1: "Sie", g2: "aus" }).status).toBe(
      "incorrect",
    );
  });

  it("accepts the informal variant kommst du in q06 and q08", () => {
    expect(grade(byId("q06"), { g0: "kommst", g1: "du", g2: "aus" }).status).toBe(
      "correct",
    );
    expect(grade(byId("q08"), { g0: "kommst", g1: "du" }).status).toBe("correct");
    expect(grade(byId("q06"), { g0: "komme", g1: "du", g2: "aus" }).status).toBe(
      "incorrect",
    );
  });

  it("shows the model sentence for multi-blank questions", () => {
    expect(grade(byId("q30"), { g0: "kein", g1: "keinen" }).model).toBe(
      "a) Das ist kein Apfel.\nb) Ich habe keinen Apfel.",
    );
  });

  it("gives an umlaut tip when possible", () => {
    const result = grade(byId("q36"), { g0: "moechte" });
    expect(result.status).toBe("correct");
    expect(result.fields[0].hint).toEqual({ kind: "umlaut", expected: "möchte" });
  });

  it("accepts ss for ß", () => {
    expect(grade(byId("q38"), { g0: "isst" }).status).toBe("correct");
  });
});

describe("person widget engine (no longer used by Test 1)", () => {
  const basePerson: Question = {
    id: "qx-person",
    type: "person",
    ask: "",
    pronoun: "sie",
    name: "Thi Giang",
    from: "Vietnam",
    residence: "Deutschland",
    city: "Dresden",
    street: "Müllerstraße",
  };

  it("grades the model answer and derived sentences", () => {
    const result = grade(basePerson, {
      pronoun: "sie",
      name: "Thi Giang",
      from: "Vietnam",
      residence: "Deutschland",
      city: "Dresden",
      street: "Müllerstraße",
    });
    expect(result.status).toBe("correct");
    expect(result.model).toBe(
      "Das ist Thi Giang. Sie kommt aus Vietnam. Sie wohnt in Deutschland. Sie wohnt in Dresden, in der Müllerstraße.",
    );
  });

  it("accepts aus/in prefixes the learner may repeat", () => {
    expect(
      grade(basePerson, {
        pronoun: "sie",
        name: "thi giang",
        from: "aus Vietnam",
        residence: "in Deutschland",
        city: "Dresden",
        street: "in der Müllerstraße",
      }).status,
    ).toBe("correct");
  });

  it("corrects the missing article for feminine countries to yellow", () => {
    const couple: Question = {
      ...basePerson,
      pronoun: "sie-plural",
      name: "Metin und Elif",
      from: "Türkei",
      city: "Köln",
      street: "Schillerstraße",
    };
    const values = {
      pronoun: "sie-plural",
      name: "Metin und Elif",
      from: "Türkei",
      residence: "Deutschland",
      city: "Köln",
      street: "Schillerstraße",
    };
    const result = grade(couple, values);
    expect(result.status).toBe("almost");
    expect(result.fields.find((field) => field.id === "from")?.hint).toMatchObject({
      kind: "country",
      name: "Türkei",
    });
    expect(grade(couple, { ...values, from: "der Türkei" }).status).toBe("correct");
  });

  it("fails a wrong pronoun", () => {
    const result = grade(basePerson, {
      pronoun: "er",
      name: "Thi Giang",
      from: "Vietnam",
      residence: "Deutschland",
      city: "Dresden",
      street: "Müllerstraße",
    });
    expect(result.status).toBe("incorrect");
  });
});

describe("yes/no answers (q13-q21)", () => {
  it("accepts the full correction", () => {
    expect(
      grade(byId("q19"), {
        answer: "Nein, das ist kein Brötchen. Das ist ein Fisch.",
      }).status,
    ).toBe("correct");
  });

  it("is almost there when the correction sentence is missing", () => {
    const result = grade(byId("q19"), { answer: "Nein, das ist kein Brötchen." });
    expect(result.status).toBe("almost");
    expect(result.fields[0].hint).toEqual({
      kind: "missing_sentence",
      expected: "Das ist ein Fisch.",
    });
  });

  it("is almost there for q21 too", () => {
    const result = grade(byId("q21"), { answer: "Nein, das ist keine Banane." });
    expect(result.status).toBe("almost");
    expect(result.fields[0].hint).toEqual({
      kind: "missing_sentence",
      expected: "Das ist eine Paprika.",
    });
  });

  it("stays incorrect when the correction is wrong", () => {
    const result = grade(byId("q19"), {
      answer: "Nein, das ist kein Brötchen. Das ist ein Kuchen.",
    });
    expect(result.status).toBe("incorrect");
  });
});

describe("prices (q22-q25)", () => {
  it("accepts the written-out price", () => {
    expect(
      grade(byId("q22"), { answer: "Die Tomaten kosten ein Euro elf Cent." }).status,
    ).toBe("correct");
    expect(
      grade(byId("q25"), { answer: "Der Kaffee kostet drei Euro zweiundvierzig Cent" })
        .status,
    ).toBe("correct");
  });

  it("accepts the same with und", () => {
    expect(
      grade(byId("q22"), { answer: "Die Tomaten kosten ein Euro und elf Cent." }).status,
    ).toBe("correct");
  });

  it("rejects digits and wrong amounts", () => {
    expect(
      grade(byId("q22"), { answer: "Die Tomaten kosten 1,11 Euro" }).status,
    ).toBe("incorrect");
    expect(grade(byId("q23"), { answer: "Der Käse kostet 66 Cent" }).status).toBe(
      "incorrect",
    );
    expect(
      grade(byId("q23"), { answer: "Der Käse kostet vierundsechzig Cent." }).status,
    ).toBe("incorrect");
  });
});

describe("translations (q17, q40)", () => {
  it("accepts any word order when frame and keywords are there", () => {
    expect(
      grade(byId("q17"), { answer: "Wir brauchen Eier, Fisch und Paprika." }).status,
    ).toBe("correct");
    expect(
      grade(byId("q17"), { answer: "wir brauchen fisch, paprike und eier" }).status,
    ).toBe("incorrect");
  });

  it("lists the missing keywords", () => {
    const result = grade(byId("q17"), { answer: "Wir brauchen Paprika und Fisch." });
    expect(result.status).toBe("incorrect");
    expect(result.fields[0].hint).toEqual({ kind: "missing", keywords: ["Eier"] });
  });

  it("points out a missing frame", () => {
    const result = grade(byId("q17"), { answer: "Paprika, Eier und Fisch" });
    expect(result.status).toBe("incorrect");
    expect(result.fields[0].hint).toEqual({ kind: "frame", expected: "wir brauchen" });
  });

  it("catches a missing negation in q40", () => {
    const result = grade(byId("q40"), {
      answer: "Ich brauche einen Joghurt, aber ich habe Milch.",
    });
    expect(result.status).toBe("incorrect");
    expect(result.fields[0].hint).toEqual({ kind: "missing", keywords: ["keine"] });
  });

  it("requires the Akkusativ article in q40", () => {
    const result = grade(byId("q40"), {
      answer: "Ich brauche Joghurt, aber ich habe keine Milch.",
    });
    expect(result.status).toBe("incorrect");
    expect(result.fields[0].hint).toEqual({ kind: "missing", keywords: ["einen"] });
  });

  it("accepts the model answer of q40", () => {
    expect(
      grade(byId("q40"), {
        answer: "Ich brauche einen Joghurt, aber ich habe keine Milch.",
      }).status,
    ).toBe("correct");
  });
});

describe("text helpers", () => {
  it("counts and fills blanks", () => {
    expect(countBlanks("a ___ b ___ c")).toBe(2);
    expect(fillBlanks("a ___ b ___ c", ["x", "y"])).toBe("a x b y c");
  });

  it("normalizes umlauts, ß, prices and punctuation", () => {
    expect(normalize("Ich heiße Änne!")).toBe("ich heisse aenne");
    expect(normalize("3,42 €")).toBe("3 42 euro");
    expect(normalize("  Toll,   oder?  ")).toBe("toll oder");
  });
});
