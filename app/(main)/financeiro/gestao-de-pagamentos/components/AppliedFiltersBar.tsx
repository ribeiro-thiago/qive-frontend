"use client";

import * as React from "react";
import { Filter, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";

export interface AppliedFilterTag {
  key: string;
  label: string;
  onRemove: () => void;
}

interface AppliedFiltersBarProps {
  tags: AppliedFilterTag[];
  onClearAll: () => void;
  showClearAll?: boolean;
}

export function AppliedFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Tag className="inline-flex items-center gap-1.5 shrink-0 bg-[#EFF1F2] text-[#5F6572] border-[#E5E7EB] h-6 text-xs font-medium">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-[#D1D5DB] transition-colors"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Tag>
  );
}

export function AppliedFiltersBar({
  tags,
  onClearAll,
  showClearAll = true,
}: AppliedFiltersBarProps) {
  if (tags.length === 0) return null;

  return (
    <div className="w-full flex items-center gap-3 flex-wrap px-4 py-2">
      <Filter className="h-4 w-4 shrink-0 text-[#5F6572]" aria-hidden />
      <span className="text-sm font-semibold shrink-0 text-[#5F6572]">
        Filtrando por:
      </span>
      {tags.map((tag) => (
        <AppliedFilterChip
          key={tag.key}
          label={tag.label}
          onRemove={tag.onRemove}
        />
      ))}
      {showClearAll && (
        <Button
          variant="ghost"
          size="default"
          className="inline-flex h-6 items-center gap-2 px-2 font-bold text-[#5F6572] shadow-none hover:bg-[#EFF1F2] hover:text-[#0d0f1c]"
          onClick={onClearAll}
        >
          <Trash2 className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
