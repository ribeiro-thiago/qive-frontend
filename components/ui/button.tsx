import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:opacity-95 font-bold focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-2",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:border-[#0C3CF7] focus-visible:ring-1 focus-visible:ring-[#0C3CF7] data-[state=open]:border-[#0C3CF7] data-[state=open]:ring-1 data-[state=open]:ring-[#0C3CF7]",
        secondary: "border border-[rgba(4,14,35,0.08)] bg-[#F5F5F6] text-[#5B616F] shadow-[0_1px_0_0_rgba(4,14,35,0.04)] hover:bg-[#EAEBEC] active:bg-[#E3E4E6] active:shadow-none font-bold focus-visible:border-[#0C3CF7] focus-visible:ring-1 focus-visible:ring-[#0C3CF7] data-[state=open]:border-[#0C3CF7] data-[state=open]:ring-1 data-[state=open]:ring-[#0C3CF7]",
        ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
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
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }
    // Default native button type to "button" to avoid unintended form submits
    return (
      <Comp
        type={(props as React.ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
