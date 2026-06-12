"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ListingTablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  pageSizeOptions?: number[];
  /** Ex.: "documentos", "fornecedores", "notas totais" */
  itemLabel?: string;
  className?: string;
};

export function ListingTablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPrevPage,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = "resultados",
  className,
}: ListingTablePaginationProps) {
  const showingFrom = totalItems === 0 ? 0 : page * pageSize + 1;
  const showingTo = Math.min(totalItems, (page + 1) * pageSize);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-3 text-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-[#5F6572]">
        <span className="font-semibold">Resultados por página</span>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="inline-flex h-8 min-w-[52px] appearance-none rounded-lg border border-[rgba(4,14,35,0.12)] bg-white py-0 pr-8 pl-2.5 text-sm font-medium text-[#0d0f1c]"
            aria-label="Resultados por página"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-[#5F6572]"
            aria-hidden
          />
        </div>
      </div>

      <p className="text-[#5F6572]">
        Mostrando{" "}
        <span className="font-medium text-[#0d0f1c]">
          {totalItems === 0 ? "0" : `${showingFrom} - ${showingTo}`}
        </span>{" "}
        de {totalItems} {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 px-4 font-semibold"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 px-4 font-semibold"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
