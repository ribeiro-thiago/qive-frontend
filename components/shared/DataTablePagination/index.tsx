"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPrevPage,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min(totalItems, (page + 1) * pageSize);

  return (
    <div className="px-4 py-3 mt-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#5F6572] font-semibold">Linhas por página</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 px-3 inline-flex items-center gap-2 shadow-none font-bold">
              <span className="t-text-sm">{pageSize}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {pageSizeOptions.map((sz) => (
              <DropdownMenuItem key={sz} onClick={() => onPageSizeChange(sz)}>
                {sz}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#5F6572]">
          Mostrando {startItem}-{endItem} de {totalItems} resultados
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="default"
            disabled={!hasPrevPage}
            onClick={() => onPageChange(page - 1)}
            className="font-bold"
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="default"
            disabled={!hasNextPage}
            onClick={() => onPageChange(page + 1)}
            className="font-bold"
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}

