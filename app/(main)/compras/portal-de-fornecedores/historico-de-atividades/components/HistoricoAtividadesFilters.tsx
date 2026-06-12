"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ACTIVITY_EVENT_FILTER_OPTIONS,
  type ActivityEventFilterValue,
} from "../types";
import {
  DEFAULT_ACTIVITY_FILTERS,
  type ActivityFiltersState,
  hasActiveActivityFilters,
} from "../lib/activity-filters";

function parseBrazilianDate(value: string): Date | undefined {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() !== Number(month) - 1 ||
    parsed.getDate() !== Number(day)
  ) {
    return undefined;
  }
  return parsed;
}

function formatDateForInput(date?: Date): string {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-bold text-[#3D4350]">{label}</Label>
      {children}
    </div>
  );
}

function ActivityDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedDate = parseBrazilianDate(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-between border-[rgba(4,14,35,0.12)] bg-white px-3 text-sm font-normal shadow-sm hover:bg-white"
        >
          <span className={value ? "text-[#0d0f1c]" : "text-[#8A90A0]"}>{value || "__/__/____"}</span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-[#5B616F]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => onChange(formatDateForInput(date))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

const SELECT_CLASS =
  "inline-flex h-9 w-full items-center rounded-lg border border-[rgba(4,14,35,0.12)] bg-white px-3 text-sm text-[#5B616F] shadow-sm appearance-none pr-9";

type HistoricoAtividadesFiltersProps = {
  filters: ActivityFiltersState;
  onChange: (filters: ActivityFiltersState) => void;
  onClear: () => void;
};

export function HistoricoAtividadesFilters({
  filters,
  onChange,
  onClear,
}: HistoricoAtividadesFiltersProps) {
  const hasFilters = hasActiveActivityFilters(filters);

  return (
    <div className="space-y-4 border-b border-[rgba(4,14,35,0.08)] px-3 py-4 lg:px-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <FilterField label="Busca">
          <Input
            placeholder="Busque por ação, responsável, e-mail ou documento"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
          />
        </FilterField>

        <FilterField label="Tipo de evento">
          <select
            value={filters.eventType}
            onChange={(event) =>
              onChange({
                ...filters,
                eventType: event.target.value as ActivityEventFilterValue,
              })
            }
            className={cn(SELECT_CLASS, filters.eventType === "all" && "text-[#8A90A0]")}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B616F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            {ACTIVITY_EVENT_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Responsável">
          <Input
            placeholder="Nome ou e-mail do responsável"
            value={filters.responsible}
            onChange={(event) => onChange({ ...filters, responsible: event.target.value })}
          />
        </FilterField>

        <FilterField label="Data início">
          <ActivityDateField
            value={filters.startDate}
            onChange={(startDate) => onChange({ ...filters, startDate })}
          />
        </FilterField>

        <FilterField label="Data fim">
          <ActivityDateField
            value={filters.endDate}
            onChange={(endDate) => onChange({ ...filters, endDate })}
          />
        </FilterField>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          className="h-9 gap-2 px-2 font-bold text-[#3D4350] hover:bg-transparent hover:text-[#0d0f1c]"
          onClick={onClear}
          disabled={!hasFilters}
        >
          <Trash2 className="h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}

export { DEFAULT_ACTIVITY_FILTERS };
