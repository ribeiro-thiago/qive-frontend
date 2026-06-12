"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type GroupedSearchFieldOption = {
  value: string;
  label: string;
  placeholder: string;
};

type GroupedSearchFieldProps = {
  fields: GroupedSearchFieldOption[];
  field: string;
  onFieldChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  className?: string;
};

export function GroupedSearchField({
  fields,
  field,
  onFieldChange,
  query,
  onQueryChange,
  className,
}: GroupedSearchFieldProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const active = fields.find((option) => option.value === field) ?? fields[0];

  return (
    <div className={cn("flex w-full items-stretch", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Critério de busca"
            aria-expanded={isOpen}
            className={cn(
              "inline-flex h-9 min-w-[200px] shrink-0 items-center justify-between gap-2 border bg-white px-3 text-sm font-medium shadow-none transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-0",
              isOpen
                ? "relative z-[1] rounded-tl-lg rounded-tr-none rounded-br-none rounded-bl-none border-[#0C3CF7] text-[#3D4350]"
                : "rounded-l-lg border-[rgba(4,14,35,0.12)] text-[#3D4350]",
            )}
          >
            <span className="truncate">{active.label}</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[90] w-[var(--radix-popover-trigger-width)] rounded-b-lg rounded-t-none border border-t-0 border-[#0C3CF7] p-1 shadow-md"
          align="start"
          sideOffset={0}
        >
          <ul role="listbox" aria-label="Critério de busca">
            {fields.map((option) => {
              const isActive = field === option.value;
              return (
                <li key={option.value} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => {
                      onFieldChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-[#EEF2FF] font-medium text-[#3D4350]"
                        : "text-[#3D4350] hover:bg-[#F5F5F6]",
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      <div className="relative min-w-0 flex-1">
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={active.placeholder}
          className={cn(
            "h-9 w-full rounded-l-none rounded-r-lg border border-[rgba(4,14,35,0.12)] pr-9 text-sm shadow-none",
            isOpen && "border-l-[#0C3CF7]",
          )}
        />
        <Search
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B616F]"
          aria-hidden
        />
      </div>
    </div>
  );
}
