"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DEFAULT_IMPORT_CLIENT,
  IMPORT_CLIENT_OPTIONS,
  type ImportClientOption,
} from "./data/import-clients";
import { getPortalDocumentoImportCopy } from "../lib/portal-documento-labels";
import { PORTAL_DOCUMENTOS_PATH, type PortalImportSegment } from "../lib/portal-paths";
const MAX_FILES = 100;
const ACCEPTED_EXTENSIONS = new Set(["pdf", "zip"]);
const ACCEPT_ATTRIBUTE = ".pdf,.zip";

const SELECT_CHEVRON_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B616F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
} as const;

type ImportFileStatus = "ready" | "uploading" | "processing" | "sent" | "error";

type ImportFileItem = {
  id: string;
  file: File;
  status: ImportFileStatus;
};

const STATUS_LABELS: Record<ImportFileStatus, string> = {
  ready: "Pronto para envio",
  uploading: "Enviando",
  processing: "Processando",
  sent: "Enviado",
  error: "Erro",
};

const STATUS_TEXT_CLASS: Record<ImportFileStatus, string> = {
  ready: "text-[#5B616F]",
  uploading: "text-[#0C3CF7]",
  processing: "text-[#0C3CF7]",
  sent: "text-[#16A34A]",
  error: "text-[#DC2626]",
};

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
}

type ImportarDocumentosPageProps = {
  returnPath?: string;
  importSegment?: PortalImportSegment;
};

export function ImportarDocumentosPage({
  returnPath = PORTAL_DOCUMENTOS_PATH,
  importSegment,
}: ImportarDocumentosPageProps) {
  const router = useRouter();
  const importCopy = getPortalDocumentoImportCopy(importSegment);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedClient, setSelectedClient] = React.useState<ImportClientOption | "">(
    DEFAULT_IMPORT_CLIENT
  );
  const [files, setFiles] = React.useState<ImportFileItem[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  const readyFiles = files.filter((item) => item.status === "ready" || item.status === "error");
  const canSend = readyFiles.length > 0 && !isSending;

  const navigateBack = React.useCallback(() => {
    router.push(returnPath);
  }, [router, returnPath]);

  const addFiles = React.useCallback(
    (incoming: FileList | File[]) => {
      if (!selectedClient) {
        toast.error("Selecione um cliente para importar os documentos.");
        return;
      }

      const list = Array.from(incoming);
      if (list.length === 0) return;

      const currentCount = files.length;
      if (currentCount >= MAX_FILES) {
        toast.error("Você pode enviar até 100 arquivos por vez.");
        return;
      }

      let invalidFormatFound = false;
      const nextItems: ImportFileItem[] = [];

      for (const file of list) {
        if (currentCount + nextItems.length >= MAX_FILES) {
          toast.error("Você pode enviar até 100 arquivos por vez.");
          break;
        }

        const extension = getFileExtension(file.name);
        if (!ACCEPTED_EXTENSIONS.has(extension)) {
          invalidFormatFound = true;
          continue;
        }

        const isDuplicate = files.some(
          (item) => item.file.name === file.name && item.file.size === file.size
        );
        if (isDuplicate) continue;

        nextItems.push({
          id: createFileId(file),
          file,
          status: "ready",
        });
      }

      if (invalidFormatFound) {
        toast.error("Formato não suportado. Envie arquivos em PDF ou ZIP.");
      }

      if (nextItems.length > 0) {
        setFiles((prev) => [...prev, ...nextItems]);
      }
    },
    [files, selectedClient]
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

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSend = async () => {
    if (!selectedClient) {
      toast.error("Selecione um cliente para importar os documentos.");
      return;
    }

    const toSend = files.filter((item) => item.status === "ready" || item.status === "error");
    if (toSend.length === 0 || isSending) return;

    const count = toSend.length;
    const ids = new Set(toSend.map((item) => item.id));
    setIsSending(true);

    setFiles((prev) =>
      prev.map((item) => (ids.has(item.id) ? { ...item, status: "uploading" } : item))
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setFiles((prev) =>
        prev.map((item) => (ids.has(item.id) ? { ...item, status: "processing" } : item))
      );
      await new Promise((resolve) => setTimeout(resolve, 900));
      setFiles((prev) =>
        prev.map((item) => (ids.has(item.id) ? { ...item, status: "sent" } : item))
      );
      toast.success(
        count === 1 ? "Documento importado com sucesso." : "Documentos importados com sucesso."
      );
    } catch {
      toast.error("Não foi possível importar os documentos. Tente novamente.");
      setFiles((prev) =>
        prev.map((item) => {
          if (!ids.has(item.id) || item.status === "sent") return item;
          return { ...item, status: "error" as const };
        })
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="space-y-4 p-3 lg:p-4">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-0 text-sm font-medium text-[#5B616F] hover:bg-transparent hover:text-[#0d0f1c]"
          asChild
        >
          <Link href={returnPath}>
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#5B616F] hover:bg-[#F3F4F6]"
          onClick={navigateBack}
          aria-label="Fechar importação de documentos"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <section className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
        <div className="space-y-6 p-4 lg:p-6">
          <header className="space-y-2 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">Importar documentos</h1>
            <p className="text-sm leading-5 text-[#5B616F]">{importCopy.description}</p>
            <p className="text-sm leading-5 text-[#5B616F]">
              Outros tipos de documentos não serão processados.
            </p>
          </header>

          <div className="max-w-md space-y-1.5">
            <Label htmlFor="import-client" className="text-sm font-bold text-[#3D4350]">
              Selecione o cliente:
            </Label>
            <select
              id="import-client"
              value={selectedClient}
              onChange={(event) => setSelectedClient(event.target.value as ImportClientOption | "")}
              className="inline-flex h-9 w-full items-center rounded-lg border border-[rgba(4,14,35,0.12)] bg-white px-3 text-sm font-medium text-[#0d0f1c] shadow-sm appearance-none pr-9"
              style={SELECT_CHEVRON_STYLE}
            >
              {IMPORT_CLIENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ATTRIBUTE}
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
                "flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C3CF7]",
                isDragging
                  ? "border-[#0C3CF7] bg-[#F3F5FF]"
                  : "border-[rgba(4,14,35,0.16)] bg-[#FAFAFB] hover:border-[rgba(4,14,35,0.28)]"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  isDragging ? "bg-[#E8EDFF] text-[#0C3CF7]" : "bg-[#EFF1F2] text-[#5B616F]"
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
                  {importCopy.selectFilesAction}
                </button>
              </p>
            </div>

            <p className="text-xs leading-4 text-[#8A90A0]">
              Você pode enviar até 100 arquivos por vez. Formato suportado: PDF e ZIP
            </p>
          </div>

          {files.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-[#3D4350]">
                Arquivos selecionados ({files.length})
              </p>
              <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] p-2">
                {files.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-[rgba(4,14,35,0.08)] bg-white px-3 py-2 shadow-[0_1px_0_0_rgba(4,14,35,0.04)]"
                  >
                    <FileText className="mt-px h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-tight text-[#0d0f1c]">
                        {item.file.name}
                      </p>
                      <p className="text-[10px] leading-tight text-[#5B616F]">
                        {getFileExtension(item.file.name).toUpperCase()} · {formatFileSize(item.file.size)}
                        <span className={cn(" · font-medium", STATUS_TEXT_CLASS[item.status])}>
                          {" "}
                          · {STATUS_LABELS[item.status]}
                        </span>
                      </p>
                    </div>
                    {item.status === "ready" || item.status === "error" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-[#5B616F] hover:bg-[#F3F4F6]"
                        onClick={() => removeFile(item.id)}
                        aria-label={`Remover ${item.file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : item.status === "uploading" || item.status === "processing" ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#0C3CF7]" aria-hidden />
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {canSend || isSending ? (
            <Button
              type="button"
              className="h-9 px-5 font-bold"
              disabled={!canSend}
              onClick={handleSend}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando documentos...
                </>
              ) : (
                "Enviar documentos"
              )}
            </Button>
          ) : null}
        </div>

        <div className="border-t border-[rgba(4,14,35,0.08)] px-4 py-10 lg:px-6">
          <div className="mx-auto flex max-w-lg flex-col items-center text-center">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4ED]"
              aria-hidden
            >
              <FileText className="h-6 w-6 text-[#F97316]" />
            </div>
            <h2 className="text-sm font-bold text-[#0d0f1c]">O que acontece depois?</h2>
            <p className="mt-2 text-sm leading-6 text-[#5B616F]">
              Após o envio, processaremos os arquivos e exibiremos os documentos enviados. Se algum
              deles apresentar problemas, você poderá corrigir diretamente nesta tela.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
