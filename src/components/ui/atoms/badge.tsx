import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary/12 text-primary",
        muted: "bg-muted text-muted-foreground",
        outline: "border border-border text-muted-foreground",
        success:
          "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
        warning:
          "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { badgeVariants };
