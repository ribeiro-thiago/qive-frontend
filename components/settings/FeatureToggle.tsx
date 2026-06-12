"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FeatureToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  noBorder?: boolean;
}

export function FeatureToggle({
  label,
  description,
  enabled,
  onToggle,
  disabled = false,
  noBorder = false,
}: FeatureToggleProps) {
  return (
    <div className={cn(
      "flex items-start justify-between gap-4 py-4",
      !noBorder && "border-b border-border last:border-b-0"
    )}>
      <div className="flex-1">
        <Label
          htmlFor={`feature-${label}`}
          className="text-sm font-semibold text-[#0d0f1c] cursor-pointer"
        >
          {label}
        </Label>
        {description && (
          <p className="text-sm text-[#5F6572] mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? "Desabilitar" : "Habilitar"} ${label}`}
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          enabled ? "bg-[#0C3CF7]" : "bg-[rgba(4,14,35,0.16)]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            enabled ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

