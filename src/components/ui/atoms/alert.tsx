import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const alertVariants = cva(
  "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "border-border bg-muted/50 text-muted-foreground",
        error: "border-destructive/30 bg-destructive/10 text-destructive",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

export function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role={variant === "error" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}
