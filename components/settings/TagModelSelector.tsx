"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TagModel } from "@/lib/theme/ThemeContext";

interface TagModelSelectorProps {
  value: TagModel;
  onChange: (value: TagModel) => void;
}

const TAG_MODELS: Array<{ value: TagModel; label: string; description: string }> = [
  {
    value: "default",
    label: "Padrão",
    description: "Modelo atual da plataforma com bordas arredondadas",
  },
  {
    value: "compact",
    label: "Compacto",
    description: "Modelo compacto com bordas retas e tipografia mais destacada",
  },
];

export function TagModelSelector({ value, onChange }: TagModelSelectorProps) {
  return (
    <div className="space-y-3">
      {TAG_MODELS.map((model) => (
        <div
          key={model.value}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
            value === model.value
              ? "border-[#0C3CF7] bg-[#F3F5FF]"
              : "border-border hover:border-[#0C3CF7]/50 hover:bg-[#FAFAFF]"
          )}
          onClick={() => onChange(model.value)}
        >
          <input
            type="radio"
            id={`tag-model-${model.value}`}
            name="tag-model"
            value={model.value}
            checked={value === model.value}
            onChange={() => onChange(model.value)}
            className="mt-0.5 h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-full border-2 border-[rgba(4,14,35,0.16)] bg-white focus-visible:outline-none checked:border-[#0C3CF7] checked:bg-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-2 after:h-2 after:rounded-full after:bg-white"
          />
          <div className="flex-1">
            <Label
              htmlFor={`tag-model-${model.value}`}
              className="text-sm font-semibold text-[#0d0f1c] cursor-pointer"
            >
              {model.label}
            </Label>
            {model.description && (
              <p className="text-sm text-[#5F6572] mt-1">{model.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}






