"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import { formatTamanhoArquivo, getAnexoDisplayName } from "./lib/anexo-actions";
import type { DocumentoAnexo, PortalDocumentoRow } from "./types";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type AnexosTabProps = {
  documento: PortalDocumentoRow;
  onDownload: (anexo: DocumentoAnexo) => void;
  onDeleteRequest: (anexo: DocumentoAnexo) => void;
};

export function AnexosTab({ documento, onDownload, onDeleteRequest }: AnexosTabProps) {
  const [pageSize, setPageSize] = React.useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [currentPage, setCurrentPage] = React.useState(0);

  const anexos = documento.anexosDocumento;

  React.useEffect(() => {
    setCurrentPage(0);
  }, [documento.id, pageSize]);

  const totalPages = Math.max(1, Math.ceil(anexos.length / pageSize));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pageStart = safePage * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, anexos.length);
  const paginatedAnexos = anexos.slice(pageStart, pageEnd);

  const showingFrom = anexos.length === 0 ? 0 : pageStart + 1;
  const showingTo = pageEnd;
  const totalLabel = String(anexos.length).padStart(2, "0");

  return (
    <div className="flex flex-1 flex-col p-4">
      <section className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm text-[#5F6572]">Veja o histórico de arquivos enviados:</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm" style={{ minWidth: 656 }}>
            <colgroup>
              <col className="w-[280px]" />
              <col className="w-[100px]" />
              <col className="w-[132px]" />
              <col className="w-[104px]" />
            </colgroup>
            <thead>
              <tr className={TABLE_HEAD_ROW_CLASS}>
                <th className={TABLE_HEAD_CELL_CLASS}>Nome do arquivo</th>
                <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Tamanho</th>
                <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Data de envio</th>
                <th className={TABLE_HEAD_CELL_CLASS}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAnexos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7EEFF]">
                        <FileText className="h-6 w-6 text-[#0C3CF7]" aria-hidden />
                      </div>
                      <h3 className="text-base font-semibold text-[#0d0f1c]">
                        Nenhum arquivo enviado ainda.
                      </h3>
                    </div>
                  </td>
                </tr>
              ) : null}
              {paginatedAnexos.map((anexo) => {
                const isDeleted = anexo.apagado === true;
                const displayName = isDeleted ? "Arquivo apagado" : getAnexoDisplayName(anexo);
                const canDelete = !isDeleted && anexo.canDelete !== false;
                const actionsDisabled = isDeleted;

                return (
                  <tr
                    key={anexo.id}
                    className={cn(TABLE_BODY_ROW_CLASS, isDeleted && "text-[#8A90A0]")}
                  >
                    <td className={cn(TABLE_BODY_CELL_CLASS, "max-w-[220px]")}>
                      <span
                        className={cn(
                          "block truncate font-medium",
                          TABLE_PRIMARY_TEXT_CLASS,
                          isDeleted && "italic text-[#8A90A0]",
                        )}
                        title={displayName}
                      >
                        {displayName}
                      </span>
                    </td>
                    <td className={cn(TABLE_BODY_CELL_CLASS, TABLE_SECONDARY_TEXT_CLASS, "whitespace-nowrap")}>
                      {isDeleted ? "—" : formatTamanhoArquivo(anexo.tamanhoBytes)}
                    </td>
                    <td className={cn(TABLE_BODY_CELL_CLASS, TABLE_PRIMARY_TEXT_CLASS, "whitespace-nowrap")}>
                      {anexo.dataEnvio ?? "—"}
                    </td>
                    <td className={TABLE_BODY_CELL_CLASS}>
                      <div
                        className={cn("flex items-center gap-1", actionsDisabled && "opacity-40")}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Baixar ${displayName}`}
                          disabled={actionsDisabled}
                          onClick={() => onDownload(anexo)}
                        >
                          <Download className="h-4 w-4 text-[#5B616F]" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Apagar ${displayName}`}
                          disabled={actionsDisabled || !canDelete}
                          onClick={() => onDeleteRequest(anexo)}
                        >
                          <Trash2 className="h-4 w-4 text-[#5B616F]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-[#5F6572]">
            <span className="font-semibold">Resultados por página</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])
                }
                className="inline-flex h-8 min-w-[52px] appearance-none rounded-lg border border-[rgba(4,14,35,0.12)] bg-white py-0 pr-8 pl-2.5 text-sm font-medium text-[#0d0f1c]"
                aria-label="Resultados por página"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
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

          <p className="text-sm text-[#5F6572]">
            Mostrando{" "}
            <span className="font-medium text-[#0d0f1c]">
              {showingFrom} - {showingTo}
            </span>{" "}
            de {totalLabel} documentos
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 px-4 text-[#8A90A0]"
              disabled={safePage === 0}
              onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 px-4 font-semibold"
              disabled={safePage >= totalPages - 1}
              onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
