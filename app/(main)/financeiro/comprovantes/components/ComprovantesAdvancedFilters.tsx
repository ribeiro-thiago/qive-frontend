"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parse } from "date-fns";
import type { ComprovanteRow } from "../data/mock-comprovantes";

export type ComprovantesAdvancedFiltersState = {
  beneficiario: string;
  pagador: string;
  banco: string;
  pagamentoInicio: string;
  pagamentoAte: string;
  valorMinimo: string;
  valorMaximo: string;
};

export const emptyComprovantesAdvancedFilters = (): ComprovantesAdvancedFiltersState => ({
  beneficiario: "",
  pagador: "",
  banco: "",
  pagamentoInicio: "",
  pagamentoAte: "",
  valorMinimo: "",
  valorMaximo: "",
});

type ComprovantesAdvancedFiltersProps = {
  isOpen: boolean;
  filters: ComprovantesAdvancedFiltersState;
  onFiltersChange: (filters: ComprovantesAdvancedFiltersState) => void;
  onApply: () => void;
  onClear: () => void;
  availableRows: ComprovanteRow[];
  appliedFilters: ComprovantesAdvancedFiltersState;
};

function parseStringToDate(dateString: string): Date | undefined {
  if (!dateString || dateString.length !== 10) return undefined;
  try {
    return parse(dateString, "dd/MM/yyyy", new Date());
  } catch {
    return undefined;
  }
}

function formatDateToString(date: Date | undefined): string {
  if (!date) return "";
  try {
    return format(date, "dd/MM/yyyy");
  } catch {
    return "";
  }
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <Label className="mb-2 block text-sm font-semibold" style={{ color: "#5F6572" }}>
        {label}
      </Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 w-full justify-between shadow-none font-normal"
          >
            <span className={cn("truncate text-left", !value && "text-muted-foreground")}>
              {value || placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
          <DropdownMenuItem
            onSelect={() => onChange("")}
            className={cn(!value && "bg-accent")}
          >
            {placeholder}
          </DropdownMenuItem>
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt}
              onSelect={() => onChange(opt)}
              className={cn(value === opt && "bg-accent")}
            >
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ComprovantesAdvancedFilters({
  isOpen,
  filters,
  onFiltersChange,
  onApply,
  onClear,
  availableRows,
  appliedFilters,
}: ComprovantesAdvancedFiltersProps) {
  const beneficiarioOptions = React.useMemo(() => {
    const s = new Set<string>();
    availableRows.forEach((r) => s.add(r.nomeBeneficiario));
    return Array.from(s).sort();
  }, [availableRows]);

  const pagadorOptions = React.useMemo(() => {
    const s = new Set<string>();
    availableRows.forEach((r) => s.add(r.nomePagador));
    return Array.from(s).sort();
  }, [availableRows]);

  const bancoOptions = React.useMemo(() => {
    const s = new Set<string>();
    availableRows.forEach((r) => s.add(r.banco));
    return Array.from(s).sort();
  }, [availableRows]);

  const updateFilter = <K extends keyof ComprovantesAdvancedFiltersState>(
    key: K,
    value: ComprovantesAdvancedFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const displayCurrencyValue = (value: string): string => {
    if (!value) return "";
    const num = parseFloat(value);
    return isNaN(num)
      ? ""
      : num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCurrencyChange = (key: "valorMinimo" | "valorMaximo", value: string) => {
    const cleanedValue = value.replace(/[^0-9,.]/g, "").replace(",", ".");
    updateFilter(key, cleanedValue);
  };

  const hasFilterChanges = React.useMemo(() => {
    return (
      filters.beneficiario !== appliedFilters.beneficiario ||
      filters.pagador !== appliedFilters.pagador ||
      filters.banco !== appliedFilters.banco ||
      filters.pagamentoInicio !== appliedFilters.pagamentoInicio ||
      filters.pagamentoAte !== appliedFilters.pagamentoAte ||
      filters.valorMinimo !== appliedFilters.valorMinimo ||
      filters.valorMaximo !== appliedFilters.valorMaximo
    );
  }, [filters, appliedFilters]);

  const hasAppliedFilters = React.useMemo(() => {
    return (
      appliedFilters.beneficiario !== "" ||
      appliedFilters.pagador !== "" ||
      appliedFilters.banco !== "" ||
      appliedFilters.pagamentoInicio !== "" ||
      appliedFilters.pagamentoAte !== "" ||
      appliedFilters.valorMinimo !== "" ||
      appliedFilters.valorMaximo !== ""
    );
  }, [appliedFilters]);

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className="py-3">
        <div className="space-y-3">
          {/* Linha 1: Beneficiário, Pagador, Banco — mesmo ritmo de grid da Gestão (3 colunas) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SelectField
              label="Beneficiário"
              value={filters.beneficiario}
              placeholder="Selecione"
              options={beneficiarioOptions}
              onChange={(v) => updateFilter("beneficiario", v)}
            />
            <SelectField
              label="Pagador"
              value={filters.pagador}
              placeholder="Selecione"
              options={pagadorOptions}
              onChange={(v) => updateFilter("pagador", v)}
            />
            <SelectField
              label="Banco"
              value={filters.banco}
              placeholder="Selecione"
              options={bancoOptions}
              onChange={(v) => updateFilter("banco", v)}
            />
          </div>

          {/* Linha 2: datas + valores — alinhado ao grid sm:grid-cols-4 da Gestão */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="min-w-0 flex-1">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: "#5F6572" }}>
                Pagamento a partir de
              </Label>
              <DatePicker
                date={parseStringToDate(filters.pagamentoInicio)}
                onDateChange={(date) => updateFilter("pagamentoInicio", formatDateToString(date))}
                placeholder="dd/mm/yyyy"
                className="h-10"
              />
            </div>
            <div className="min-w-0 flex-1">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: "#5F6572" }}>
                Pagamento até
              </Label>
              <DatePicker
                date={parseStringToDate(filters.pagamentoAte)}
                onDateChange={(date) => updateFilter("pagamentoAte", formatDateToString(date))}
                placeholder="dd/mm/yyyy"
                className="h-10"
              />
            </div>
            <div className="min-w-0 flex-1">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: "#5F6572" }}>
                Valor a partir de
              </Label>
              <Input
                placeholder="R$ 0,00"
                className="h-10 w-full shadow-none"
                value={displayCurrencyValue(filters.valorMinimo)}
                onChange={(e) => handleCurrencyChange("valorMinimo", e.target.value)}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: "#5F6572" }}>
                Valor até
              </Label>
              <Input
                placeholder="R$ 0,00"
                className="h-10 w-full shadow-none"
                value={displayCurrencyValue(filters.valorMaximo)}
                onChange={(e) => handleCurrencyChange("valorMaximo", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-3">
          <Button
            variant="ghost"
            size="default"
            className="font-bold gap-2"
            onClick={onClear}
            disabled={!hasAppliedFilters}
          >
            <Trash2 className="h-4 w-4" />
            Limpar filtros
          </Button>
          <Button
            variant="default"
            size="default"
            className="font-bold"
            onClick={onApply}
            disabled={!hasFilterChanges}
          >
            Aplicar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
