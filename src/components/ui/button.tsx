"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25",
        destructive:
          "bg-red-700 text-white hover:bg-red-800",
        outline:
          "border border-red-500/60 bg-transparent text-red-500 hover:bg-red-500/10 hover:border-red-500",
        secondary:
          "bg-dark-700 text-gray-100 hover:bg-dark-600 border border-dark-600",
        ghost:
          "hover:bg-white/10 text-gray-300 hover:text-white",
        link:
          "text-red-500 underline-offset-4 hover:underline p-0 h-auto",
        dark:
          "bg-dark-800 text-white hover:bg-dark-700 border border-dark-600/50",
        white:
          "bg-white text-dark-900 hover:bg-gray-100 shadow-lg font-semibold",
      },
      size: {
        default:  "h-10 px-4 py-2",
        sm:       "h-8 rounded-md px-3 text-xs",
        lg:       "h-12 rounded-xl px-8 text-base",
        xl:       "h-14 rounded-xl px-10 text-lg",
        icon:     "h-10 w-10",
        "icon-sm":"h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
