"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { OpenAccountTagColor } from "@/lib/theme/ThemeContext";
import { useTheme } from "@/lib/theme/useTheme";

interface OpenAccountTagColorSelectorProps {
  value: OpenAccountTagColor;
  onChange: (value: OpenAccountTagColor) => void;
}

const TAG_COLORS: Array<{ value: OpenAccountTagColor; label: string; description: string }> = [
  {
    value: "blue",
    label: "Azul",
    description: "Cor padrão azul para tags de contas em aberto",
  },
  {
    value: "orange",
    label: "Laranja",
    description: "Cor laranja para tags de contas em aberto",
  },
];

export function OpenAccountTagColorSelector({ value, onChange }: OpenAccountTagColorSelectorProps) {
  const { tagModel } = useTheme();
  const isCompact = tagModel === 'compact';

  const getTagClasses = (color: OpenAccountTagColor) => {
    if (color === "orange") {
      return isCompact
        ? "bg-[#FFD294] text-[#B85600]"
        : "bg-[#FFD294] text-[#B85600] border-[#FFD294]";
    } else {
      // Azul (padrão)
      return isCompact
        ? "bg-[#E7EEFF] text-[#0C3CF7]"
        : "bg-[#E7EEFF] text-[#0C3CF7] border-[#B8CCFF]";
    }
  };

  return (
    <div className="space-y-3">
      {TAG_COLORS.map((color) => (
        <div
          key={color.value}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
            value === color.value
              ? "border-[#0C3CF7] bg-[#F3F5FF]"
              : "border-border hover:border-[#0C3CF7]/50 hover:bg-[#FAFAFF]"
          )}
          onClick={() => onChange(color.value)}
        >
          <input
            type="radio"
            id={`tag-color-${color.value}`}
            name="tag-color"
            value={color.value}
            checked={value === color.value}
            onChange={() => onChange(color.value)}
            className="mt-0.5 h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-full border-2 border-[rgba(4,14,35,0.16)] bg-white focus-visible:outline-none checked:border-[#0C3CF7] checked:bg-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-2 after:h-2 after:rounded-full after:bg-white"
          />
          <div className="flex-1">
            <Label
              htmlFor={`tag-color-${color.value}`}
              className="text-sm font-semibold text-[#0d0f1c] cursor-pointer"
            >
              {color.label}
            </Label>
            {color.description && (
              <p className="text-sm text-[#5F6572] mt-1">{color.description}</p>
            )}
            <div className="mt-2">
              <span
                className={cn(
                  "inline-flex items-center text-xs",
                  isCompact
                    ? "h-5 py-[2px] px-2 rounded font-bold leading-4"
                    : "h-6 px-2 rounded-full border font-medium",
                  getTagClasses(color.value)
                )}
              >
                Aberto
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

