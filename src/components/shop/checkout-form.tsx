"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Lock } from "lucide-react";

import {
  Alert,
  Button,
  Checkbox,
  Input,
  Label,
  Separator,
  Textarea,
  buttonVariants,
} from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import { postJson } from "@/src/lib/shop/api-client";
import { translateError, translateValidation } from "@/src/lib/shop/i18n-helpers";
import { formatPrice } from "@/src/lib/shop/money";
import { loginPath } from "@/src/lib/shop/redirects";
import type { Order, PaymentMethod, PublicUser } from "@/src/lib/shop/types";
import {
  checkoutFormSchema,
  type CheckoutFormInput,
  type CheckoutFormValues,
} from "@/src/lib/validation/shop";
import { cn } from "@/src/lib/utils";

import { useCart } from "./cart-provider";
import { FormField } from "./form-field";

const PAYMENT_METHODS: PaymentMethod[] = ["card", "transfer", "cod"];

export function CheckoutForm({ user }: { user: PublicUser | null }) {
  const { dictionary, locale, href } = useI18n();
  const router = useRouter();
  const { cart, ensureCart, refresh } = useCart();
  const [formError, setFormError] = useState<string | null>(null);

  const t = dictionary.shop.checkout;

  // The order summary renders the cart, so this page loads it.
  useEffect(() => ensureCart(), [ensureCart]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormInput, unknown, CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customer: {
        // Prefilled from the session when the visitor is signed in.
        email: user?.email ?? "",
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        phone: user?.phone ?? "",
        company: "",
      },
      shippingAddress: { street: "", postalCode: "", city: "", country: "Polska" },
      billingSameAsShipping: true,
      paymentMethod: "card",
      notes: "",
    },
  });

  // `useWatch` subscribes to a single field instead of returning a new function
  // on every render, which keeps this component memoizable.
  const billingSameAsShipping = useWatch({ control, name: "billingSameAsShipping" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const result = await postJson<{ order: Order }>("/api/orders", {
      customer: values.customer,
      shippingAddress: values.shippingAddress,
      billingAddress: values.billingSameAsShipping ? undefined : values.billingAddress,
      paymentMethod: values.paymentMethod,
      notes: values.notes || undefined,
    });

    if (!result.ok) {
      if (result.error.fields) {
        for (const [field, message] of Object.entries(result.error.fields)) {
          setError(field as never, { message });
        }
      }
      setFormError(translateError(dictionary, result.error));
      return;
    }

    await refresh();
    router.push(href(`/zamowienie/potwierdzenie/${result.data.order.id}`));
  });

  const summary = cart?.summary;

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="flex flex-col gap-8">
        {!user ? (
          <Alert>
            <Info />
            <span>
              {t.guestNotice}{" "}
              <Link href={loginPath(locale, "/zamowienie")} className="font-medium underline">
                {dictionary.shop.nav.login}
              </Link>
            </span>
          </Alert>
        ) : null}

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold">{t.customer}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={dictionary.shop.auth.firstName}
              error={translateValidation(dictionary, errors.customer?.firstName?.message)}
            >
              {(field) => (
                <Input {...field} {...register("customer.firstName")} autoComplete="given-name" />
              )}
            </FormField>
            <FormField
              label={dictionary.shop.auth.lastName}
              error={translateValidation(dictionary, errors.customer?.lastName?.message)}
            >
              {(field) => (
                <Input {...field} {...register("customer.lastName")} autoComplete="family-name" />
              )}
            </FormField>
            <FormField
              label={dictionary.shop.auth.email}
              error={translateValidation(dictionary, errors.customer?.email?.message)}
            >
              {(field) => (
                <Input {...field} {...register("customer.email")} type="email" autoComplete="email" />
              )}
            </FormField>
            <FormField
              label={dictionary.shop.auth.phone}
              error={translateValidation(dictionary, errors.customer?.phone?.message)}
            >
              {(field) => (
                <Input {...field} {...register("customer.phone")} type="tel" autoComplete="tel" />
              )}
            </FormField>
            <FormField
              label={t.company}
              optional={dictionary.shop.common.optional}
              className="sm:col-span-2"
              error={translateValidation(dictionary, errors.customer?.company?.message)}
            >
              {(field) => (
                <Input {...field} {...register("customer.company")} autoComplete="organization" />
              )}
            </FormField>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold">{t.shippingAddress}</h2>
          <AddressFields prefix="shippingAddress" register={register} errors={errors.shippingAddress} />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="billing-same" {...register("billingSameAsShipping")} />
            <Label htmlFor="billing-same" className="font-normal">
              {t.sameAsShipping}
            </Label>
          </div>

          {!billingSameAsShipping ? (
            <>
              <h2 className="font-display text-lg font-semibold">{t.billingAddress}</h2>
              <AddressFields prefix="billingAddress" register={register} errors={errors.billingAddress} />
            </>
          ) : null}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold">{t.payment}</h2>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  paymentMethod === method
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40",
                )}
              >
                <input
                  type="radio"
                  value={method}
                  {...register("paymentMethod")}
                  className="mt-0.5 size-4 accent-primary"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{t.methods[method]}</span>
                  <span className="text-xs text-muted-foreground">{t.methodHints[method]}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <FormField
          label={t.notes}
          optional={dictionary.shop.common.optional}
          error={translateValidation(dictionary, errors.notes?.message)}
        >
          {(field) => <Textarea {...field} {...register("notes")} placeholder={t.notesPlaceholder} />}
        </FormField>
      </div>

      <aside className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold">{t.summary}</h2>

        <ul className="flex flex-col gap-2 text-sm">
          {cart?.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted-foreground">
                {item.quantity}× {item.product.name}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatPrice(item.lineTotal, locale)}
              </span>
            </li>
          ))}
        </ul>

        <Separator />

        {summary ? (
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{dictionary.shop.cart.subtotal}</dt>
              <dd className="tabular-nums">{formatPrice(summary.subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{dictionary.shop.cart.shipping}</dt>
              <dd className="tabular-nums">
                {summary.shippingCost === 0
                  ? dictionary.shop.cart.shippingFree
                  : formatPrice(summary.shippingCost, locale)}
              </dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2">
              <dt className="font-medium">{dictionary.shop.cart.total}</dt>
              <dd className="font-display text-2xl font-bold tabular-nums">
                {formatPrice(summary.total, locale)}
              </dd>
            </div>
          </dl>
        ) : null}

        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={isSubmitting || !summary || summary.itemsCount === 0}
        >
          <Lock />
          {isSubmitting ? t.submitting : t.submit}
        </Button>

        <p className="text-xs text-muted-foreground">{t.mockNotice}</p>

        <Link
          href={href("/koszyk")}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full")}
        >
          {dictionary.shop.common.back}
        </Link>
      </aside>
    </form>
  );
}

type AddressFieldsProps = {
  prefix: "shippingAddress" | "billingAddress";
  register: ReturnType<typeof useForm<CheckoutFormInput, unknown, CheckoutFormValues>>["register"];
  errors:
    | Partial<Record<"street" | "postalCode" | "city" | "country", { message?: string }>>
    | undefined;
};

/** Shipping and billing share the same four fields. */
function AddressFields({ prefix, register, errors }: AddressFieldsProps) {
  const { dictionary } = useI18n();
  const t = dictionary.shop.checkout;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        label={t.street}
        className="sm:col-span-2"
        error={translateValidation(dictionary, errors?.street?.message)}
      >
        {(field) => (
          <Input {...field} {...register(`${prefix}.street`)} autoComplete="street-address" />
        )}
      </FormField>
      <FormField
        label={t.postalCode}
        error={translateValidation(dictionary, errors?.postalCode?.message)}
      >
        {(field) => (
          <Input
            {...field}
            {...register(`${prefix}.postalCode`)}
            placeholder="00-000"
            autoComplete="postal-code"
          />
        )}
      </FormField>
      <FormField label={t.city} error={translateValidation(dictionary, errors?.city?.message)}>
        {(field) => (
          <Input {...field} {...register(`${prefix}.city`)} autoComplete="address-level2" />
        )}
      </FormField>
      <FormField
        label={t.country}
        className="sm:col-span-2"
        error={translateValidation(dictionary, errors?.country?.message)}
      >
        {(field) => (
          <Input {...field} {...register(`${prefix}.country`)} autoComplete="country-name" />
        )}
      </FormField>
    </div>
  );
}
