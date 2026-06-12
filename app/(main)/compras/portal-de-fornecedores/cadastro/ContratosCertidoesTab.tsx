"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ACCEPT_ANEXOS_ATTRIBUTE,
  buildAnexoFromFile,
  formatTamanhoArquivo,
  getAnexosContratosCertidoes,
  MAX_ANEXOS_POR_ENVIO,
  scheduleAnexoProcessing,
} from "./lib/fornecedor-anexos";
import type { AnexoContratoStatus, FornecedorAnexoContrato, FornecedorRow } from "./types";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type ContratosCertidoesTabProps = {
  fornecedor: FornecedorRow;
  onUpdateFornecedor: (id: number, updates: Partial<FornecedorRow>) => void;
};

function AnexoStatusCell({ status }: { status: AnexoContratoStatus }) {
  if (status === "carregando") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B616F]">
        <Loader2 className="h-4 w-4 animate-spin text-[#8A90A0]" aria-hidden />
        Carregando...
      </span>
    );
  }

  if (status === "invalido") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B91C1C]">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
        Arquivo inválido
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#166534]">
      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
      Concluído
    </span>
  );
}

export function ContratosCertidoesTab({
  fornecedor,
  onUpdateFornecedor,
}: ContratosCertidoesTabProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [pageSize, setPageSize] = React.useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [currentPage, setCurrentPage] = React.useState(0);
  const processingCleanupRef = React.useRef<Map<string, () => void>>(new Map());

  const anexos = getAnexosContratosCertidoes(fornecedor);

  const persistAnexos = React.useCallback(
    (nextAnexos: FornecedorAnexoContrato[]) => {
      onUpdateFornecedor(fornecedor.id, { anexosContratosCertidoes: nextAnexos });
    },
    [fornecedor.id, onUpdateFornecedor],
  );

  const updateAnexoStatus = React.useCallback(
    (anexoId: string, status: AnexoContratoStatus) => {
      const next = getAnexosContratosCertidoes(fornecedor).map((item) =>
        item.id === anexoId ? { ...item, status } : item,
      );
      persistAnexos(next);
    },
    [fornecedor, persistAnexos],
  );

  React.useEffect(() => {
    const processingCleanup = processingCleanupRef.current;
    return () => {
      processingCleanup.forEach((cleanup) => cleanup());
      processingCleanup.clear();
    };
  }, []);

  React.useEffect(() => {
    anexos.forEach((anexo) => {
      if (anexo.status !== "carregando") return;
      if (processingCleanupRef.current.has(anexo.id)) return;

      const cleanup = scheduleAnexoProcessing(anexo.id, (id, status) => {
        updateAnexoStatus(id, status);
        processingCleanupRef.current.delete(id);
      });
      processingCleanupRef.current.set(anexo.id, cleanup);
    });
  }, [anexos, updateAnexoStatus]);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [fornecedor.id, pageSize]);

  const totalPages = Math.max(1, Math.ceil(anexos.length / pageSize));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pageStart = safePage * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, anexos.length);
  const paginatedAnexos = anexos.slice(pageStart, pageEnd);

  const addFiles = React.useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (list.length === 0) return;

      const current = getAnexosContratosCertidoes(fornecedor);
      if (current.length >= MAX_ANEXOS_POR_ENVIO) {
        toast.error("Você pode enviar até 100 arquivos por vez.");
        return;
      }

      const nextItems: FornecedorAnexoContrato[] = [];
      let limitReached = false;

      for (const file of list) {
        if (current.length + nextItems.length >= MAX_ANEXOS_POR_ENVIO) {
          limitReached = true;
          break;
        }

        const isDuplicate = [...current, ...nextItems].some(
          (item) => item.nomeArquivo === file.name && item.tamanhoBytes === file.size,
        );
        if (isDuplicate) continue;

        nextItems.push(buildAnexoFromFile(file));
      }

      if (limitReached) {
        toast.error("Você pode enviar até 100 arquivos por vez.");
      }

      if (nextItems.length > 0) {
        persistAnexos([...nextItems, ...current]);
      }
    },
    [fornecedor, persistAnexos],
  );

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
    }
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  };

  const handleDownload = (anexo: FornecedorAnexoContrato) => {
    if (anexo.status !== "concluido") return;
    toast.success(`Download de ${anexo.nomeArquivo} iniciado.`);
  };

  const handleRemove = (anexoId: string) => {
    const cleanup = processingCleanupRef.current.get(anexoId);
    cleanup?.();
    processingCleanupRef.current.delete(anexoId);

    persistAnexos(getAnexosContratosCertidoes(fornecedor).filter((item) => item.id !== anexoId));
    toast.success("Arquivo removido.");
  };

  const showingFrom = anexos.length === 0 ? 0 : pageStart + 1;
  const showingTo = pageEnd;
  const totalLabel = String(anexos.length).padStart(2, "0");

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="space-y-4">
        <section className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
          <div className="space-y-1 border-b border-[rgba(4,14,35,0.08)] px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
              <h3 className="text-sm font-bold text-[#0d0f1c]">Enviar anexos</h3>
            </div>
            <p className="text-sm leading-5 text-[#5B616F]">
              Anexe os contratos e certidões do fornecedor aqui. Se houver qualquer problema, você
              poderá corrigi-lo logo após o processamento.
            </p>
          </div>

          <div className="space-y-2 p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ANEXOS_ATTRIBUTE}
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C3CF7]",
                isDragging
                  ? "border-[#0C3CF7] bg-[#F3F5FF]"
                  : "border-[rgba(4,14,35,0.16)] bg-[#FAFAFB] hover:border-[rgba(4,14,35,0.28)]",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  isDragging ? "bg-[#E8EDFF] text-[#0C3CF7]" : "bg-[#EFF1F2] text-[#5B616F]",
                )}
              >
                <Upload className="h-5 w-5" aria-hidden />
              </div>
              <p className="max-w-md text-sm leading-6 text-[#3D4350]">
                Arraste e solte aqui ou{" "}
                <button
                  type="button"
                  className="font-bold text-[#0C3CF7] hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  selecione arquivos
                </button>
              </p>
            </div>

            <p className="text-xs leading-4 text-[#8A90A0]">
              Você pode enviar até 100 arquivos por vez. Formatos suportados: PDF e DOC
            </p>
            <p className="text-xs leading-4 text-[#8A90A0]">
              Garantimos o armazenamento dos seus documentos pelo prazo legal de 5 anos, período no
              qual você pode baixá-los a qualquer momento. Após o término deste prazo, os arquivos
              serão eliminados automaticamente do nosso banco de dados.
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
          <div className="border-b border-[rgba(4,14,35,0.08)] px-4 py-3">
            <p className="text-sm text-[#5B616F]">
              Veja o histórico e acompanhe o status de arquivos enviados:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
              <thead className="bg-[#F5F5F6] text-left text-[#5B616F]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Nome do arquivo</th>
                  <th className="px-3 py-2 font-semibold whitespace-nowrap">Tamanho</th>
                  <th className="px-3 py-2 font-semibold whitespace-nowrap">Data de envio</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAnexos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-sm text-[#8A90A0]">
                      Nenhum arquivo enviado ainda.
                    </td>
                  </tr>
                ) : null}
                {paginatedAnexos.map((anexo) => {
                  const actionsDisabled = anexo.status === "carregando";

                  return (
                    <tr
                      key={anexo.id}
                      className="border-t border-[rgba(4,14,35,0.08)] text-[#3D4350]"
                    >
                      <td className="max-w-[220px] truncate px-3 py-2 font-medium">
                        {anexo.nomeArquivo}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatTamanhoArquivo(anexo.tamanhoBytes)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{anexo.dataEnvio}</td>
                      <td className="px-3 py-2">
                        <AnexoStatusCell status={anexo.status} />
                      </td>
                      <td className="px-3 py-2">
                        <div
                          className={cn(
                            "flex items-center gap-1",
                            actionsDisabled && "opacity-40",
                          )}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Baixar ${anexo.nomeArquivo}`}
                            disabled={actionsDisabled || anexo.status !== "concluido"}
                            onClick={() => handleDownload(anexo)}
                          >
                            <Download className="h-4 w-4 text-[#5B616F]" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Remover ${anexo.nomeArquivo}`}
                            disabled={actionsDisabled}
                            onClick={() => handleRemove(anexo.id)}
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

          <div className="flex flex-col gap-3 border-t border-[rgba(4,14,35,0.08)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-[#5B616F]">
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
                  className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-[#5B616F]"
                  aria-hidden
                />
              </div>
            </div>

            <p className="text-sm text-[#5B616F]">
              Mostrando{" "}
              <span className="font-medium text-[#3D4350]">
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
    </div>
  );
}
