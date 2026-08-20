"use client";

import { useState } from "react";

import { Container } from "@/src/components/ui";
import { qualifierQuestions, qualifierSteps } from "@/src/lib/facilities-data";
import { company } from "@/src/lib/site-data";
import { cn } from "@/src/lib/utils";
import { CtaButton } from "./cta-link";
import { SectionHeading } from "./section-heading";

const contactStep = qualifierQuestions.length;
const initialProof =
  "Wypełnij, a pokażemy, ile podobnych obiektów mamy już za sobą.";

type ContactFields = {
  name: string;
  phone: string;
  email: string;
  city: string;
};

export function Qualifier() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<ContactFields>({
    name: "",
    phone: "",
    email: "",
    city: "",
  });
  const [proofCount, setProofCount] = useState<number | null>(null);
  const [proof, setProof] = useState(initialProof);
  const [submitted, setSubmitted] = useState(false);

  const pick = (group: string, label: string, count?: number) => {
    setAnswers((current) => ({ ...current, [group]: label }));
    if (count) {
      setProofCount(count);
      setProof(
        `Zrealizowaliśmy ${count} obiektów w tym przedziale. Na wizji pokażemy dwa najbliższe Twojemu — z fakturami i kontaktem do klubu.`,
      );
    }
  };

  const next = () => {
    const question = qualifierQuestions[step];

    if (question && !answers[question.group]) {
      setProof("Wybierz jedną opcję, żeby przejść dalej.");
      return;
    }

    if (step === contactStep) {
      if (!fields.name.trim() || !fields.phone.trim() || !fields.email.trim()) {
        setProof("Uzupełnij imię, telefon i e-mail — bez tego nie oddzwonimy.");
        return;
      }
      // TODO: wire up the backend — POST { ...answers, ...fields } to an API
      // route. Right now nothing leaves the browser.
      setSubmitted(true);
      setProof(
        proofCount
          ? `Zrealizowaliśmy ${proofCount} obiektów w tym przedziale.`
          : "Dziękujemy — odzywamy się w ciągu dnia roboczego.",
      );
      return;
    }

    setStep((current) => current + 1);
  };

  const updateField = (key: keyof ContactFields) => (value: string) =>
    setFields((current) => ({ ...current, [key]: value }));

  return (
    <section
      id="kwalifikator"
      className="dark bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Cztery pytania.
              <br />
              Potem oddzwaniamy.
            </>
          }
          eyebrow="Bez wyceny online — wycena bez pomiaru to zgadywanie"
        />

        <div className="grid border border-border lg:grid-cols-[0.9fr_1.6fr]">
          <aside className="flex flex-col justify-between gap-8 border-b border-border p-6 sm:p-10 lg:border-r lg:border-b-0">
            <div className="kicker font-mono text-muted-foreground">
              Krok {step + 1} / {qualifierSteps.length}
              <ol className="mt-4 list-none p-0">
                {qualifierSteps.map((label, index) => (
                  <li
                    key={label}
                    className={cn(
                      "border-t border-border py-2.5",
                      submitted || index === step
                        ? "text-foreground before:text-primary before:content-['▸_']"
                        : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </li>
                ))}
              </ol>
            </div>
            <p
              aria-live="polite"
              className="min-h-[5.5em] border-t border-border pt-5 font-mono text-sm text-muted-foreground"
            >
              {proof}
            </p>
          </aside>

          <div className="p-6 sm:p-10">
            {submitted ? (
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight uppercase sm:text-3xl">
                  Zgłoszenie przyjęte.
                </h3>
                <p className="mt-4 max-w-[56ch] text-muted-foreground">
                  Oddzwaniamy w ciągu jednego dnia roboczego i umawiamy
                  bezpłatną wizję lokalną. Jeśli spieszy się bardziej —{" "}
                  <a
                    href={company.phoneHref}
                    className="text-primary hover:underline"
                  >
                    {company.phone}
                  </a>
                  .
                </p>
              </div>
            ) : (
              <>
                {qualifierQuestions.map((question, index) => (
                  <fieldset
                    key={question.group}
                    className={cn(
                      "m-0 border-0 p-0",
                      step === index ? "block" : "hidden",
                    )}
                  >
                    <legend className="mb-6 p-0 font-display text-2xl font-semibold tracking-tight uppercase sm:text-3xl">
                      {question.legend}
                    </legend>
                    <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
                      {question.options.map((option) => {
                        const isSelected =
                          answers[question.group] === option.label;
                        return (
                          <button
                            type="button"
                            key={option.label}
                            aria-pressed={isSelected}
                            onClick={() =>
                              pick(
                                question.group,
                                option.label,
                                option.proofCount,
                              )
                            }
                            className={cn(
                              "p-5 text-left transition-colors",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-background hover:bg-foreground/5",
                            )}
                          >
                            <span className="kicker mb-2 block font-mono opacity-60">
                              {option.eyebrow}
                            </span>
                            <b className="text-base font-semibold">
                              {option.label}
                            </b>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}

                <fieldset
                  className={cn(
                    "m-0 border-0 p-0",
                    step === contactStep ? "block" : "hidden",
                  )}
                >
                  <legend className="mb-6 p-0 font-display text-2xl font-semibold tracking-tight uppercase sm:text-3xl">
                    Gdzie mamy oddzwonić?
                  </legend>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Imię i nazwisko"
                      autoComplete="name"
                      value={fields.name}
                      onChange={updateField("name")}
                    />
                    <Field
                      label="Telefon"
                      type="tel"
                      autoComplete="tel"
                      value={fields.phone}
                      onChange={updateField("phone")}
                    />
                    <Field
                      label="E-mail"
                      type="email"
                      autoComplete="email"
                      value={fields.email}
                      onChange={updateField("email")}
                      full
                    />
                    <Field
                      label="Miejscowość obiektu"
                      autoComplete="address-level2"
                      value={fields.city}
                      onChange={updateField("city")}
                      full
                    />
                  </div>
                </fieldset>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <CtaButton onClick={next}>
                    {step === contactStep ? "Wyślij zgłoszenie" : "Dalej"}
                  </CtaButton>
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep((current) => current - 1)}
                      className="kicker cursor-pointer font-mono text-muted-foreground transition-colors hover:text-foreground"
                    >
                      ← Wstecz
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  full?: boolean;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  full,
}: FieldProps) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="kicker mb-2 block font-mono text-[10px] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground outline-none focus:border-primary"
      />
    </label>
  );
}
