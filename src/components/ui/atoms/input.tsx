import { cn } from "@/src/lib/utils";

/**
 * Native form controls rather than Base UI ones: `react-hook-form`'s
 * `register()` spreads a ref plus change handlers straight onto the element,
 * which native inputs accept without any adapter. React 19 forwards `ref` as a
 * regular prop, so no `forwardRef` is needed.
 */
const controlClasses =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input data-slot="input" className={cn(controlClasses, "h-10", className)} {...props} />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(controlClasses, "min-h-24 resize-y", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(controlClasses, "h-10 cursor-pointer appearance-none pr-8", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "size-4 shrink-0 cursor-pointer rounded-sm border border-input accent-primary transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-sm font-medium text-foreground select-none",
        className,
      )}
      {...props}
    />
  );
}
