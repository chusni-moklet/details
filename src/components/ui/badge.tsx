import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-red-500/15 text-red-400 border-red-500/30",
        secondary:   "border-transparent bg-dark-700 text-gray-300 border-dark-600",
        destructive: "border-transparent bg-red-700/20 text-red-300 border-red-700/30",
        outline:     "text-gray-300 border-gray-600",
        success:     "border-transparent bg-green-500/15 text-green-400 border-green-500/30",
        warning:     "border-transparent bg-gold-500/15 text-yellow-400 border-yellow-500/30",
        dark:        "border-transparent bg-dark-700 text-gray-200 border-dark-600",
        red:         "border-transparent bg-red-500 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
