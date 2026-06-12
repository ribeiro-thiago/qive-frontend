"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Search, Filter, Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GroupedSearchField,
  type GroupedSearchFieldOption,
} from "@/components/shared/GroupedSearchField";

interface DataTableFiltersProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchFields?: GroupedSearchFieldOption[];
  searchField?: string;
  onSearchFieldChange?: (value: string) => void;
  periodLabel?: string;
  periodValue: string;
  periodOptions: string[];
  onPeriodChange: (value: string) => void;
  totalLabel?: string;
  totalValue: string;
  showStatusFilter?: boolean;
  statusValue?: string;
  statusOptions?: string[];
  onStatusChange?: (value: string) => void;
  onFiltersClick?: () => void;
}

export function DataTableFilters({
  searchPlaceholder = "Busque por qualquer informação",
  searchValue,
  onSearchChange,
  searchFields,
  searchField = "",
  onSearchFieldChange,
  periodLabel = "Período de vencimento",
  periodValue,
  periodOptions,
  onPeriodChange,
  totalLabel = "Total",
  totalValue,
  showStatusFilter = false,
  statusValue = "Todos os Status",
  statusOptions = [],
  onStatusChange,
  onFiltersClick,
}: DataTableFiltersProps) {
  const useGroupedSearch = Boolean(searchFields?.length && onSearchFieldChange);

  return (
    <div className="w-full space-y-4 px-4 pt-4 pb-4">
      <div className={cn("flex w-full gap-3", useGroupedSearch ? "items-center" : "items-end")}>
        <div className={cn("flex-1", showStatusFilter ? "basis-2/3" : "")}>
          {!useGroupedSearch ? (
            <Label className="mb-1 block text-sm font-semibold" style={{ color: "#5F6572" }}>
              Busca
            </Label>
          ) : null}
          {useGroupedSearch ? (
            <GroupedSearchField
              fields={searchFields!}
              field={searchField}
              onFieldChange={onSearchFieldChange!}
              query={searchValue}
              onQueryChange={onSearchChange}
            />
          ) : (
            <div className="relative">
              <Input
                placeholder={searchPlaceholder}
                className="w-full pr-9 shadow-none"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {showStatusFilter && onStatusChange && (
          <div className="flex-1 basis-1/3">
            <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Status</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold hover:bg-[#EFF1F2]">
                  <span className={cn("t-text-sm truncate", statusValue === "Todos os Status" && "text-muted-foreground")}>{statusValue}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                {statusOptions.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => onStatusChange(s)}>{s}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        <div className="shrink-0">
          <Button
            variant="secondary"
            size="default"
            className="inline-flex items-center gap-2 font-bold"
            onClick={onFiltersClick}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="w-full flex h-10 items-center justify-between rounded-[8px] bg-[#F5F5F6] py-1 px-4">
        <div className="flex items-center gap-2 px-1.5">
          <Calendar className="h-4 w-4" style={{ color: '#5F6572' }} />
          <span className="text-sm font-semibold" style={{ color: '#5F6572' }}>{periodLabel}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="default" className="px-2 h-6 text-[#0d0f1c] shadow-none font-bold hover:bg-[#EFF1F2]">
                <span className="t-text-sm">{periodValue}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {periodOptions.map((p) => (
                <DropdownMenuItem key={p} onClick={() => onPeriodChange(p)}>{p}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-right inline-flex items-center gap-2 px-1.5">
          <span className="text-sm font-semibold" style={{ color: '#5F6572' }}>{totalLabel}:</span>
          <span className="text-sm font-semibold text-[#0d0f1c]">{totalValue}</span>
        </div>
      </div>
    </div>
  );
}

