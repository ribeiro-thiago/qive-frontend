import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SelectButtonProps = ButtonProps;

export function SelectButton({ className, variant = "outline", size = "default", children, ...props }: SelectButtonProps) {
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      className={cn("w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold", className)}
    >
      {children}
    </Button>
  );
}
