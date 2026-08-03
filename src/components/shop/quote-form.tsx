"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Send } from "lucide-react";

import { Alert, Button, Input, Select, Textarea } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import { postJson } from "@/src/lib/shop/api-client";
import { format, translateError, translateValidation } from "@/src/lib/shop/i18n-helpers";
import type { Product, Quote, QuoteType } from "@/src/lib/shop/types";
import { createQuoteSchema, type CreateQuoteInput } from "@/src/lib/validation/shop";

import { FormField } from "./form-field";

const QUOTE_TYPES: QuoteType[] = ["ring", "klatka", "wyposazenie-sali", "hurt"];

type QuoteFormProps = {
  /** Pre-selects the enquiry type and pins it to a product. */
  product?: Product;
  defaultType?: QuoteType;
};

/** B2B enquiry form — the CTA that replaces "add to cart" for quoted products. */
export function QuoteForm({ product, defaultType = "ring" }: QuoteFormProps) {
  const { dictionary } = useI18n();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const t = dictionary.shop.quote;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuoteInput>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      message: "",
      type: defaultType,
      productId: product?.id,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const result = await postJson<{ quote: Quote }>("/api/quotes", values);

    if (!result.ok) {
      // Field-level messages from the API win over the generic banner.
      const fields = result.error.fields;
      if (fields) {
        for (const [field, message] of Object.entries(fields)) {
          setError(field as keyof CreateQuoteInput, { message });
        }
      }
      setFormError(translateError(dictionary, result.error));
      return;
    }

    setSent(true);
  });

  if (sent) {
    return (
      <Alert variant="success" className="flex-col items-start gap-1">
        <span className="flex items-center gap-2 font-semibold">
          <Check />
          {t.sent}
        </span>
        <span className="text-sm opacity-90">{t.sentHint}</span>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {product ? (
        <p className="text-sm text-muted-foreground">
          {format(t.productContext, { name: product.name })}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.name} error={translateValidation(dictionary, errors.name?.message)}>
          {(field) => <Input {...field} {...register("name")} autoComplete="name" />}
        </FormField>

        <FormField
          label={t.company}
          optional={dictionary.shop.common.optional}
          error={translateValidation(dictionary, errors.company?.message)}
        >
          {(field) => <Input {...field} {...register("company")} autoComplete="organization" />}
        </FormField>

        <FormField label={t.email} error={translateValidation(dictionary, errors.email?.message)}>
          {(field) => (
            <Input {...field} {...register("email")} type="email" autoComplete="email" />
          )}
        </FormField>

        <FormField label={t.phone} error={translateValidation(dictionary, errors.phone?.message)}>
          {(field) => <Input {...field} {...register("phone")} type="tel" autoComplete="tel" />}
        </FormField>
      </div>

      <FormField label={t.type} error={translateValidation(dictionary, errors.type?.message)}>
        {(field) => (
          <Select {...field} {...register("type")}>
            {QUOTE_TYPES.map((value) => (
              <option key={value} value={value}>
                {t.types[value]}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <FormField label={t.message} error={translateValidation(dictionary, errors.message?.message)}>
        {(field) => (
          <Textarea {...field} {...register("message")} placeholder={t.messagePlaceholder} />
        )}
      </FormField>

      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Button type="submit" size="lg" disabled={isSubmitting} className="self-start px-8">
        <Send />
        {isSubmitting ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
