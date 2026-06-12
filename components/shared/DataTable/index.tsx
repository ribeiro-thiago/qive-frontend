"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  render: (item: T, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (item: T) => string;
  selected: Set<number>;
  onToggleRow: (index: number, checked?: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  allSelected: boolean;
  hasSelection: boolean;
  viewingRowId?: string | null;
  focusedRowIndex?: number;
  onRowClick?: (item: T, index: number) => void;
  isRecentlyAdded?: (item: T) => boolean;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
  loading?: boolean;
  onRowDoubleClick?: (item: T, index: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  selected,
  onToggleRow,
  onToggleAll,
  allSelected,
  hasSelection,
  viewingRowId,
  focusedRowIndex = -1,
  onRowClick,
  isRecentlyAdded,
  emptyState,
  loading = false,
  onRowDoubleClick,
}: DataTableProps<T>) {
  const headRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (headRef.current) {
      headRef.current.indeterminate = hasSelection && !allSelected;
    }
  }, [hasSelection, allSelected]);

  if (data.length === 0 && !loading && emptyState) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 rounded-full bg-[#E7EEFF] flex items-center justify-center mb-3">
          {emptyState.icon || <CheckCircle2 className="h-6 w-6 text-[#0C3CF7]" />}
        </div>
        <h3 className="text-base font-semibold text-[#0d0f1c]">{emptyState.title}</h3>
        <p className="mt-1 text-sm text-[#5F6572]">{emptyState.description}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-10" />
          <col className="w-[96px]" />
          {columns.map((col) => (
            <col key={col.key} className={col.width || ""} />
          ))}
        </colgroup>
        <thead>
          <tr className="h-11 border-b border-border text-left bg-[#F5F5F6]">
            <th className="w-10 pl-3 pr-2 text-center">
              <input
                ref={headRef}
                type="checkbox"
                className="h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 mx-auto"
                checked={allSelected}
                onChange={(e) => onToggleAll(e.currentTarget.checked)}
              />
            </th>
            <th className="px-3 py-2 text-[rgba(4,14,35,0.64)] text-center">Detalhes</th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2 text-[rgba(4,14,35,0.64)]",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.headerClassName
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const rowId = getRowId(item);
            const isSel = selected.has(index);
            const isViewing = viewingRowId === rowId;
            const isFocused = index === focusedRowIndex;
            const isNew = isRecentlyAdded?.(item) || false;

            return (
              <tr
                key={rowId}
                className={cn(
                  "border-b border-border last:border-b-0 transition-all duration-300",
                  isSel ? "bg-[#F3F5FF]" : isViewing || isFocused ? "bg-[#FAFAFF]" : "hover:bg-[#FAFAFF]",
                  isNew && "animate-[highlight_1.5s_ease-in-out]",
                  onRowDoubleClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(item, index)}
                onDoubleClick={() => onRowDoubleClick?.(item, index)}
                style={isNew ? { animation: 'highlight 1.5s ease-in-out' } : undefined}
              >
                <td className="pl-3 pr-2 py-3 align-middle relative text-center">
                  {(isViewing || isFocused) && (
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0C3CF7]" aria-hidden />
                  )}
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 mx-auto"
                    checked={isSel}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleRow(index, e.currentTarget.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-3 py-3 text-center">
                  <Button
                    variant="secondary"
                    size="default"
                    className="font-bold"
                    data-detail-trigger="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(item, index);
                    }}
                  >
                    Ver
                  </Button>
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-3",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.cellClassName
                    )}
                  >
                    {col.render(item, index)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

