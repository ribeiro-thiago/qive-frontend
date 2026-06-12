"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme/useTheme";

interface TagProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

/**
 * Componente base de Tag que aplica o tema automaticamente
 */
export function Tag({ 
  children, 
  className,
  bgColor,
  textColor,
  borderColor,
}: TagProps) {
  const { tagModel } = useTheme();
  const isCompact = tagModel === 'compact';

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs",
        isCompact
          ? "h-5 py-[2px] px-2 rounded font-bold leading-4"
          : "h-6 px-2 rounded-full border font-medium",
        bgColor,
        textColor,
        !isCompact && borderColor,
        className
      )}
    >
      {children}
    </span>
  );
}






