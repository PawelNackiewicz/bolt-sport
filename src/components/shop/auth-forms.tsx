"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";

import { Alert, Button, Input } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import { postJson, type ApiFailure } from "@/src/lib/shop/api-client";
import { translateError, translateValidation } from "@/src/lib/shop/i18n-helpers";
import { sanitizeRedirect } from "@/src/lib/shop/redirects";
import type { PublicUser } from "@/src/lib/shop/types";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/src/lib/validation/shop";

import { FormField } from "./form-field";
import { useCart } from "./cart-provider";

/** Copies the API's per-field messages onto the matching form fields. */
function applyFieldErrors<T extends FieldValues>(
  failure: ApiFailure,
  setError: UseFormSetError<T>,
): void {
  if (!failure.fields) return;
  for (const [field, message] of Object.entries(failure.fields)) {
    setError(field as Path<T>, { message });
  }
}

/* -------------------------------------------------------------------------- */

export function LoginForm() {
  const { dictionary, href } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useCart();
  const [formError, setFormError] = useState<string | null>(null);

  const t = dictionary.shop.auth;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await postJson<{ user: PublicUser }>("/api/auth/login", values);

    if (!result.ok) {
      applyFieldErrors(result.error, setError);
      setFormError(translateError(dictionary, result.error));
      return;
    }

    // The guest cart was merged server-side — pull the new totals.
    await refresh();

    // `sanitizeRedirect` rejects anything that could leave this origin — a bare
    // `startsWith("/")` check would still let `//evil.com` through.
    const redirect = sanitizeRedirect(searchParams.get("redirect"));
    router.push(redirect ?? href("/konto"));
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label={t.email} error={translateValidation(dictionary, errors.email?.message)}>
        {(field) => (
          <Input {...field} {...register("email")} type="email" autoComplete="email" autoFocus />
        )}
      </FormField>

      <FormField label={t.password} error={translateValidation(dictionary, errors.password?.message)}>
        {(field) => (
          <Input
            {...field}
            {...register("password")}
            type="password"
            autoComplete="current-password"
          />
        )}
      </FormField>

      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>
        {t.submitLogin}
      </Button>

      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <Link href={href("/przypomnij-haslo")} className="text-primary hover:underline">
          {t.forgotPassword}
        </Link>
        <span className="text-muted-foreground">
          {t.noAccount}{" "}
          <Link href={href("/rejestracja")} className="text-primary hover:underline">
            {t.submitRegister}
          </Link>
        </span>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

export function RegisterForm() {
  const { dictionary, href } = useI18n();
  const router = useRouter();
  const { refresh } = useCart();
  const [formError, setFormError] = useState<string | null>(null);

  const t = dictionary.shop.auth;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "", phone: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await postJson<{ user: PublicUser }>("/api/auth/register", values);

    if (!result.ok) {
      applyFieldErrors(result.error, setError);
      setFormError(translateError(dictionary, result.error));
      return;
    }

    await refresh();
    router.push(href("/konto"));
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={t.firstName}
          error={translateValidation(dictionary, errors.firstName?.message)}
        >
          {(field) => <Input {...field} {...register("firstName")} autoComplete="given-name" />}
        </FormField>
        <FormField
          label={t.lastName}
          error={translateValidation(dictionary, errors.lastName?.message)}
        >
          {(field) => <Input {...field} {...register("lastName")} autoComplete="family-name" />}
        </FormField>
      </div>

      <FormField label={t.email} error={translateValidation(dictionary, errors.email?.message)}>
        {(field) => <Input {...field} {...register("email")} type="email" autoComplete="email" />}
      </FormField>

      <FormField
        label={t.phone}
        optional={dictionary.shop.common.optional}
        error={translateValidation(dictionary, errors.phone?.message)}
      >
        {(field) => <Input {...field} {...register("phone")} type="tel" autoComplete="tel" />}
      </FormField>

      <FormField
        label={t.password}
        hint={t.passwordHint}
        error={translateValidation(dictionary, errors.password?.message)}
      >
        {(field) => (
          <Input {...field} {...register("password")} type="password" autoComplete="new-password" />
        )}
      </FormField>

      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>
        {t.submitRegister}
      </Button>

      <p className="text-sm text-muted-foreground">
        {t.haveAccount}{" "}
        <Link href={href("/logowanie")} className="text-primary hover:underline">
          {t.submitLogin}
        </Link>
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

export function ForgotPasswordForm() {
  const { dictionary } = useI18n();
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const t = dictionary.shop.auth;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const result = await postJson<{ success: boolean; devLink?: string }>(
      "/api/auth/password/forgot",
      values,
    );

    if (!result.ok) {
      setFormError(translateError(dictionary, result.error));
      return;
    }

    // Present only outside production — mirrors the link logged to the console.
    setDevLink(result.data.devLink ?? null);
    setSent(true);
  });

  if (sent) {
    return (
      <div className="flex flex-col gap-3">
        <Alert variant="success">
          <Check />
          {t.forgotSent}
        </Alert>

        {devLink ? (
          <Alert className="flex-col items-start gap-1">
            <span className="text-xs font-medium">{t.forgotDevHint}</span>
            <a href={devLink} className="font-mono text-xs break-all text-primary hover:underline">
              {devLink}
            </a>
          </Alert>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label={t.email} error={translateValidation(dictionary, errors.email?.message)}>
        {(field) => (
          <Input {...field} {...register("email")} type="email" autoComplete="email" autoFocus />
        )}
      </FormField>

      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>
        {t.forgotSubmit}
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

export function ResetPasswordForm({ token }: { token: string }) {
  const { dictionary, href } = useI18n();
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const t = dictionary.shop.auth;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await postJson("/api/auth/password/reset", values);

    if (!result.ok) {
      applyFieldErrors(result.error, setError);
      setFormError(translateError(dictionary, result.error));
      return;
    }

    setDone(true);
  });

  if (!token) return <Alert variant="error">{t.resetMissingToken}</Alert>;

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success">
          <Check />
          {t.resetDone}
        </Alert>
        <Link
          href={href("/logowanie")}
          className="text-sm font-medium text-primary hover:underline"
        >
          {t.submitLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <input type="hidden" {...register("token")} />

      <FormField
        label={t.newPassword}
        hint={t.passwordHint}
        error={translateValidation(dictionary, errors.password?.message)}
      >
        {(field) => (
          <Input
            {...field}
            {...register("password")}
            type="password"
            autoComplete="new-password"
            autoFocus
          />
        )}
      </FormField>

      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>
        {t.resetSubmit}
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

export function ChangePasswordForm() {
  const { dictionary } = useI18n();
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const t = dictionary.shop.auth;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setDone(false);

    const result = await postJson("/api/auth/password/change", values);

    if (!result.ok) {
      applyFieldErrors(result.error, setError);
      setFormError(translateError(dictionary, result.error));
      return;
    }

    reset();
    setDone(true);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        label={t.currentPassword}
        error={translateValidation(dictionary, errors.currentPassword?.message)}
      >
        {(field) => (
          <Input
            {...field}
            {...register("currentPassword")}
            type="password"
            autoComplete="current-password"
          />
        )}
      </FormField>

      <FormField
        label={t.newPassword}
        hint={t.passwordHint}
        error={translateValidation(dictionary, errors.newPassword?.message)}
      >
        {(field) => (
          <Input
            {...field}
            {...register("newPassword")}
            type="password"
            autoComplete="new-password"
          />
        )}
      </FormField>

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {done ? (
        <Alert variant="success">
          <Check />
          {dictionary.shop.account.passwordChanged}
        </Alert>
      ) : null}

      <Button type="submit" size="lg" className="h-11 self-start px-8" disabled={isSubmitting}>
        {dictionary.shop.account.changePasswordSubmit}
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

export function LogoutButton() {
  const { dictionary, href } = useI18n();
  const router = useRouter();
  const { refresh } = useCart();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await postJson("/api/auth/logout", {});
        await refresh();
        router.push(href("/"));
        router.refresh();
      }}
    >
      {dictionary.shop.nav.logout}
    </Button>
  );
}
