"use client";

import { useId } from "react";

import { Label } from "@/src/components/ui";
import { cn } from "@/src/lib/utils";

type FormFieldProps = {
  label: string;
  /** Already-localised message, or `undefined` when the field is valid. */
  error?: string;
  hint?: string;
  optional?: string;
  className?: string;
  /** Receives the generated id and the wiring the control needs. */
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
};

/**
 * Label + control + message, wired for screen readers. The control itself is
 * supplied as a render prop so the caller keeps full control over
 * `register(...)` spreading.
 */
export function FormField({
  label,
  error,
  hint,
  optional,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-muted-foreground">({optional})</span>
        ) : null}
      </Label>

      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
