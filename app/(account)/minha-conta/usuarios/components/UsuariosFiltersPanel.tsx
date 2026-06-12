"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Search, Trash2 } from "lucide-react";
import { USER_GROUP_OPTIONS } from "../data/grupos-options";

export type UsuariosFiltersState = {
  nome: string;
  email: string;
  grupo: string;
  ativo: string;
};

export const DEFAULT_USUARIOS_FILTERS: UsuariosFiltersState = {
  nome: "",
  email: "",
  grupo: "",
  ativo: "",
};

const ATIVO_OPTIONS = ["Sim", "Não"] as const;

const SELECT_CLASS =
  "flex h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 py-1 pr-9 text-sm shadow-sm transition-colors focus-visible:border-[#0C3CF7] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0C3CF7] disabled:cursor-not-allowed disabled:opacity-50";

const SELECT_CHEVRON_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B616F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
};

export function hasUsuariosFilterValues(filters: UsuariosFiltersState): boolean {
  return Boolean(
    filters.nome.trim() || filters.email.trim() || filters.grupo || filters.ativo
  );
}

type UsuariosFiltersPanelProps = {
  expanded: boolean;
  filters: UsuariosFiltersState;
  onFiltersChange: (filters: UsuariosFiltersState) => void;
  onApply: () => void;
  onClear: () => void;
};

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <Label className="text-sm font-bold text-[#3D4350]">{label}</Label>
      {children}
    </div>
  );
}

export function UsuariosFiltersPanel({
  expanded,
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: UsuariosFiltersPanelProps) {
  const updateFilter = (key: keyof UsuariosFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasValues = hasUsuariosFilterValues(filters);

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-in-out",
        expanded ? "grid-rows-[1fr] mb-3" : "grid-rows-[0fr] mb-0"
      )}
    >
      <div className="overflow-hidden">
        <div className="rounded-lg border border-[rgba(4,14,35,0.08)] bg-white px-4 py-4 shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FilterField label="Nome">
                <Input
                  value={filters.nome}
                  onChange={(event) => updateFilter("nome", event.target.value)}
                  placeholder="Nome do usuário"
                  className="h-9 text-sm"
                />
              </FilterField>

              <FilterField label="Email">
                <Input
                  value={filters.email}
                  onChange={(event) => updateFilter("email", event.target.value)}
                  placeholder="Email do usuário"
                  className="h-9 text-sm"
                />
              </FilterField>

              <FilterField label="Grupo de usuários (permissões)">
                <select
                  value={filters.grupo}
                  onChange={(event) => updateFilter("grupo", event.target.value)}
                  className={cn(SELECT_CLASS, !filters.grupo && "text-[#8A90A0]")}
                  style={SELECT_CHEVRON_STYLE}
                >
                  <option value="">Selecione</option>
                  {USER_GROUP_OPTIONS.map((option) => (
                    <option key={option} value={option} className="text-[#0d0f1c]">
                      {option}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField label="Ativo?">
                <select
                  value={filters.ativo}
                  onChange={(event) => updateFilter("ativo", event.target.value)}
                  className={cn(SELECT_CLASS, !filters.ativo && "text-[#8A90A0]")}
                  style={SELECT_CHEVRON_STYLE}
                >
                  <option value="">Selecione</option>
                  {ATIVO_OPTIONS.map((option) => (
                    <option key={option} value={option} className="text-[#0d0f1c]">
                      {option}
                    </option>
                  ))}
                </select>
              </FilterField>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-2 text-sm font-medium text-[#5B616F]"
                onClick={onClear}
                disabled={!hasValues}
              >
                <Trash2 className="h-4 w-4" />
                Limpar filtros
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 gap-1.5 px-4"
                onClick={onApply}
                disabled={!hasValues}
              >
                <Search className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
