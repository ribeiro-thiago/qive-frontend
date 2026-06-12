"use client";

import * as React from "react";
import { CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NotaCompletaField = {
  label: string;
  value: string;
  mono?: boolean;
  labelWidth?: string;
};

export function NotaCompletaSectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 text-lg font-bold text-[rgba(4,14,35,0.86)]">{children}</h2>;
}

export function NotaCompletaSubsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)]">
      <div className="border-b border-[rgba(4,14,35,0.16)] bg-[#eaebec] px-2 py-2">
        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function NotaCompletaSubheader({ title }: { title: string }) {
  return (
    <div className="border-b border-[rgba(4,14,35,0.16)] bg-[#eaebec] px-2 py-2">
      <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">{title}</h3>
    </div>
  );
}

export function NotaCompletaFieldRow({
  label,
  value,
  mono = false,
  labelWidth = "w-44",
}: NotaCompletaField) {
  return (
    <div className="flex min-h-10">
      <div
        className={cn(
          "flex items-center border border-[#dfe0e2] bg-[#f5f5f6] px-2 py-2",
          labelWidth,
        )}
      >
        <p className="truncate text-sm text-[rgba(4,14,35,0.64)]">{label}</p>
      </div>
      <div className="flex flex-1 items-center border border-[#dfe0e2] bg-white px-4 py-2">
        <p className={cn("truncate text-sm text-[rgba(4,14,35,0.86)]", mono && "font-mono")}>{value}</p>
      </div>
    </div>
  );
}

export function NotaCompletaFieldGrid({
  fields,
  columns = 3,
  labelWidth = "w-44",
}: {
  fields: NotaCompletaField[];
  columns?: 1 | 2 | 3 | 4;
  labelWidth?: string;
}) {
  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : columns === 4
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid", gridClass)}>
      {fields.map((field) => (
        <NotaCompletaFieldRow key={field.label} {...field} labelWidth={labelWidth} />
      ))}
    </div>
  );
}

export function NotaCompletaProdutoCard({
  titulo,
  onManifestar,
}: {
  titulo: string;
  onManifestar?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)]">
      <div className="flex items-center justify-between border-b border-[rgba(4,14,35,0.16)] bg-[#eaebec] px-4 py-3">
        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">{titulo}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="inline-flex h-8 items-center gap-2 rounded-md bg-[#0066ff] px-3 font-bold text-white shadow-none hover:bg-[#0052cc] hover:text-white"
          onClick={onManifestar}
        >
          <CheckSquare className="h-4 w-4" aria-hidden />
          Manifestar item
        </Button>
      </div>
    </div>
  );
}
