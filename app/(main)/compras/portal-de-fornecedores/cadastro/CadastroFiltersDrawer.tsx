"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Trash2, X } from "lucide-react";

export type CadastroFiltersState = {
  acessoPortal: string;
  localizacao: string;
  cnae: string;
  ultimaCompraInicio?: Date;
  ultimaCompraFim?: Date;
  valorCompradoMin: string;
  valorCompradoMax: string;
  situacaoCadastral: string;
  regimeTributario: string;
  camposIbsCbs: string;
};

export const DEFAULT_CADASTRO_FILTERS: CadastroFiltersState = {
  acessoPortal: "",
  localizacao: "",
  cnae: "",
  ultimaCompraInicio: undefined,
  ultimaCompraFim: undefined,
  valorCompradoMin: "",
  valorCompradoMax: "",
  situacaoCadastral: "",
  regimeTributario: "",
  camposIbsCbs: "",
};

const ACESSO_PORTAL_OPTIONS = ["Convite enviado", "Cadastro ativo", "Sem acesso"];
const SITUACAO_CADASTRAL_OPTIONS = ["Ativo", "Suspenso", "Cancelado", "Nulo", "Inapto"];
const REGIME_TRIBUTARIO_OPTIONS = ["Simples Nacional", "Normal"];
const CAMPOS_IBS_CBS_OPTIONS = ["NFe", "CTe", "NFSe"];

type CadastroFiltersDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CadastroFiltersState;
  onFiltersChange: (filters: CadastroFiltersState) => void;
  onApply: () => void;
  onClear: () => void;
};

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-bold text-[#3D4350]">{label}</Label>
      {children}
    </div>
  );
}

function FilterSelect({
  value,
  placeholder = "Selecione",
  options,
  onChange,
}: {
  value: string;
  placeholder?: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 w-full justify-between border-[rgba(4,14,35,0.12)] bg-white px-3 text-sm font-normal shadow-sm hover:bg-white"
        >
          <span className={value ? "text-[#0d0f1c]" : "text-[#8A90A0]"}>{value || placeholder}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#5B616F]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        <DropdownMenuItem onClick={() => onChange("")}>{placeholder}</DropdownMenuItem>
        {options.map((option) => (
          <DropdownMenuItem key={option} onClick={() => onChange(option)}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CadastroFiltersDrawer({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: CadastroFiltersDrawerProps) {
  const update = React.useCallback(
    (patch: Partial<CadastroFiltersState>) => {
      onFiltersChange({ ...filters, ...patch });
    },
    [filters, onFiltersChange],
  );

  const hasFilters = React.useMemo(() => {
    return (
      filters.acessoPortal !== "" ||
      filters.localizacao !== "" ||
      filters.cnae !== "" ||
      filters.ultimaCompraInicio !== undefined ||
      filters.ultimaCompraFim !== undefined ||
      filters.valorCompradoMin !== "" ||
      filters.valorCompradoMax !== "" ||
      filters.situacaoCadastral !== "" ||
      filters.regimeTributario !== "" ||
      filters.camposIbsCbs !== ""
    );
  }, [filters]);

  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-[400px] max-w-[92vw] flex-col gap-0 p-0 sm:w-[420px]">
        <SheetTitle className="sr-only">Filtros de fornecedores</SheetTitle>
        <SheetDescription className="sr-only">Painel lateral para filtrar a lista de fornecedores cadastrados</SheetDescription>

        <SheetHeader className="shrink-0 border-b border-[rgba(4,14,35,0.08)] px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold text-[#0d0f1c]">Filtros</SheetTitle>
            <SheetClose asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#5B616F] hover:bg-[#F3F4F6]"
                aria-label="Fechar filtros"
              >
                <X className="h-5 w-5" />
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <FilterField label="Acesso ao portal">
            <FilterSelect
              value={filters.acessoPortal}
              options={ACESSO_PORTAL_OPTIONS}
              onChange={(acessoPortal) => update({ acessoPortal })}
            />
          </FilterField>

          <FilterField label="Localização">
            <Input
              placeholder="Digite a cidade ou estado"
              value={filters.localizacao}
              onChange={(e) => update({ localizacao: e.target.value })}
            />
          </FilterField>

          <FilterField label="CNAE">
            <Input
              placeholder="Digite a atividade ou código CNAE"
              value={filters.cnae}
              onChange={(e) => update({ cnae: e.target.value })}
            />
          </FilterField>

          <div className="grid grid-cols-2 gap-3">
            <FilterField label="Última compra início">
              <DatePicker
                date={filters.ultimaCompraInicio}
                onDateChange={(ultimaCompraInicio) => update({ ultimaCompraInicio })}
                placeholder="dd/mm/aaaa"
                className="w-full"
              />
            </FilterField>
            <FilterField label="Última compra fim">
              <DatePicker
                date={filters.ultimaCompraFim}
                onDateChange={(ultimaCompraFim) => update({ ultimaCompraFim })}
                placeholder="dd/mm/aaaa"
                className="w-full"
              />
            </FilterField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FilterField label="Valor comprado a partir de">
              <Input
                placeholder="R$ 0,00"
                value={filters.valorCompradoMin}
                onChange={(e) => update({ valorCompradoMin: e.target.value })}
              />
            </FilterField>
            <FilterField label="Valor comprado até">
              <Input
                placeholder="R$ 0,00"
                value={filters.valorCompradoMax}
                onChange={(e) => update({ valorCompradoMax: e.target.value })}
              />
            </FilterField>
          </div>

          <FilterField label="Situação cadastral">
            <FilterSelect
              value={filters.situacaoCadastral}
              options={SITUACAO_CADASTRAL_OPTIONS}
              onChange={(situacaoCadastral) => update({ situacaoCadastral })}
            />
          </FilterField>

          <FilterField label="Regime tributário">
            <FilterSelect
              value={filters.regimeTributario}
              options={REGIME_TRIBUTARIO_OPTIONS}
              onChange={(regimeTributario) => update({ regimeTributario })}
            />
          </FilterField>

          <FilterField label="Campos IBS/CBS">
            <FilterSelect
              value={filters.camposIbsCbs}
              options={CAMPOS_IBS_CBS_OPTIONS}
              onChange={(camposIbsCbs) => update({ camposIbsCbs })}
            />
          </FilterField>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-[rgba(4,14,35,0.08)] px-5 py-4">
          <Button
            variant="ghost"
            className="h-9 gap-2 px-2 font-bold text-[#3D4350] hover:bg-transparent hover:text-[#0d0f1c]"
            onClick={onClear}
            disabled={!hasFilters}
          >
            <Trash2 className="h-4 w-4" />
            Limpar filtros
          </Button>
          <Button className="h-9 px-5 font-bold" onClick={handleApply}>
            Aplicar filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
