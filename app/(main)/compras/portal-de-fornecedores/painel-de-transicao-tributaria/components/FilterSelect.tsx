"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSelectProps {
  label?: string;
  labelIcon?: LucideIcon;
  /** Rótulo acessível quando não há `label` visível. */
  ariaLabel?: string;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
}

export function FilterSelect({
  label,
  labelIcon: LabelIcon,
  ariaLabel,
  value,
  options,
  onChange,
  className,
  fullWidth = false,
}: FilterSelectProps) {
  const selectId = React.useId();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#3D4350]"
        >
          {LabelIcon && <LabelIcon className="h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />}
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        aria-label={!label ? ariaLabel : undefined}
        className={cn(
          "inline-flex h-9 items-center rounded-lg border border-[rgba(4,14,35,0.12)] bg-white px-3 text-sm text-[#0d0f1c] shadow-sm appearance-none pr-9",
          fullWidth ? "min-w-0 flex-1" : "min-w-[160px]"
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B616F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
