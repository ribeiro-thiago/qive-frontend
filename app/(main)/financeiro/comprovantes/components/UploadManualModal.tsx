"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogPortal,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, X, Upload, Pencil, Trash2, Loader2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UploadManualModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FileStatus = "Carregando..." | "Lendo arquivo...";

type UploadFileEntry = {
  id: string;
  nome: string;
  tamanho: string;
  dataEnvio: string;
  status: FileStatus;
};

const MAX_FILES = 100;
const ACCEPTED_EXTENSIONS = [".pdf", ".zip"];
const PAGE_SIZES = [10, 20, 50];
const UPLOAD_TOAST_DURATION_MS = 5000;

const MOCK_FILES: UploadFileEntry[] = [
  { id: "m1",  nome: "comprovante_boleto912367.pdf",   tamanho: "1 kb",   dataEnvio: "07/11/2024", status: "Carregando..." },
  { id: "m2",  nome: "comprovante_boleto912367.pdf",   tamanho: "210 kb", dataEnvio: "07/11/2024", status: "Carregando..." },
  { id: "m3",  nome: "comprovante_2.pdf",              tamanho: "86 kb",  dataEnvio: "07/11/2024", status: "Carregando..." },
  { id: "m4",  nome: "comprovante_produto1.pdf",       tamanho: "180 kb", dataEnvio: "07/11/2024", status: "Carregando..." },
  { id: "m5",  nome: "comprovante_copy2.pdf",          tamanho: "128 kb", dataEnvio: "06/11/2024", status: "Lendo arquivo..." },
  { id: "m6",  nome: "comprovante_boleto7841.pdf",     tamanho: "64 kb",  dataEnvio: "06/11/2024", status: "Lendo arquivo..." },
  { id: "m7",  nome: "comprovante_boleto0922.pdf",     tamanho: "232 kb", dataEnvio: "06/11/2024", status: "Lendo arquivo..." },
  { id: "m8",  nome: "comprovante_boleto729103.pdf",   tamanho: "72 kb",  dataEnvio: "06/11/2024", status: "Lendo arquivo..." },
  { id: "m9",  nome: "comp_boleto912367.pdf",          tamanho: "162 kb", dataEnvio: "06/11/2024", status: "Lendo arquivo..." },
  { id: "m10", nome: "comprovante_boleto912367(2).pdf", tamanho: "98 kb", dataEnvio: "06/11/2024", status: "Lendo arquivo..." },
  { id: "m11", nome: "comprovante_abc123.pdf",         tamanho: "54 kb",  dataEnvio: "05/11/2024", status: "Carregando..." },
  { id: "m12", nome: "comprovante_xyz456.pdf",         tamanho: "320 kb", dataEnvio: "05/11/2024", status: "Lendo arquivo..." },
  { id: "m13", nome: "boleto_empresa_beta.pdf",        tamanho: "45 kb",  dataEnvio: "05/11/2024", status: "Carregando..." },
  { id: "m14", nome: "comp_fatura_092024.pdf",         tamanho: "77 kb",  dataEnvio: "05/11/2024", status: "Lendo arquivo..." },
  { id: "m15", nome: "comprovante_ref8891.pdf",        tamanho: "188 kb", dataEnvio: "04/11/2024", status: "Carregando..." },
  { id: "m16", nome: "boleto_fornecedor_a.pdf",        tamanho: "102 kb", dataEnvio: "04/11/2024", status: "Lendo arquivo..." },
  { id: "m17", nome: "comprovante_lote_01.zip",        tamanho: "2.1 mb", dataEnvio: "04/11/2024", status: "Carregando..." },
  { id: "m18", nome: "comprovante_lote_02.zip",        tamanho: "1.8 mb", dataEnvio: "04/11/2024", status: "Lendo arquivo..." },
  { id: "m19", nome: "comprovante_extra01.pdf",        tamanho: "67 kb",  dataEnvio: "03/11/2024", status: "Carregando..." },
  { id: "m20", nome: "comprovante_extra02.pdf",        tamanho: "91 kb",  dataEnvio: "03/11/2024", status: "Lendo arquivo..." },
];

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} b`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} mb`;
}

function todayBR(): string {
  return new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function UploadManualModal({ open, onOpenChange }: UploadManualModalProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [fileEntries, setFileEntries] = React.useState<UploadFileEntry[]>([]);
  const [onlyErrors, setOnlyErrors] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [toastVisible, setToastVisible] = React.useState(false);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissUploadToast = React.useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastVisible(false);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setIsDragging(false);
      setShowHistory(false);
      setFileEntries([]);
      setOnlyErrors(false);
      setPage(0);
      setToastVisible(false);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (!toastVisible) return;

    toastTimerRef.current = setTimeout(dismissUploadToast, UPLOAD_TOAST_DURATION_MS);

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [toastVisible, dismissUploadToast]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const activateHistory = (userFiles: File[]) => {
    const today = todayBR();
    const fromUser: UploadFileEntry[] = userFiles.map((f, i) => ({
      id: `user-${i}`,
      nome: f.name,
      tamanho: formatFileSize(f.size),
      dataEnvio: today,
      status: "Carregando...",
    }));

    const combined = [...fromUser, ...MOCK_FILES].slice(0, 20);
    setFileEntries(combined);
    setShowHistory(true);
    setPage(0);
    setToastVisible(true);
  };

  const handleFiles = (files: FileList | File[]) => {
    const all = Array.from(files);
    const accepted = all.filter(isAcceptedFile);
    if (accepted.length === 0) {
      toast.error("Selecione arquivos nos formatos PDF ou ZIP.");
      return;
    }
    if (accepted.length > MAX_FILES) {
      toast.error(`Você pode enviar até ${MAX_FILES} arquivos por vez.`);
      return;
    }
    activateHistory(accepted);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) handleFiles(files);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) handleFiles(event.dataTransfer.files);
  };

  const removeEntry = (id: string) => {
    setFileEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const displayedEntries = onlyErrors ? [] : fileEntries;
  const totalEntries = displayedEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = displayedEntries.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const showingFrom = totalEntries === 0 ? 0 : safePage * pageSize + 1;
  const showingTo = Math.min(totalEntries, (safePage + 1) * pageSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-white p-0 m-0 max-w-none border-0 shadow-none outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        >
          <DialogTitle className="sr-only">Importar comprovantes</DialogTitle>

          {/* Top bar */}
          <div className="shrink-0 px-6 pt-6">
            <div className="mx-auto flex max-w-[720px] items-center justify-between">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5F6572] hover:text-[#0d0f1c]"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </button>
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Fechar">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-8">
            <div className="mx-auto w-full max-w-[720px]">
              <h2 className="text-2xl font-bold text-[#0d0f1c]">Importar comprovantes</h2>
              <p className="mt-2 text-sm text-[#5F6572]">
                Faça envio de comprovantes armazenados em seu computador para a Qive
              </p>

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.zip,application/pdf,application/zip"
                multiple
                className="sr-only"
                onChange={handleInputChange}
              />

              {/* Upload area */}
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 transition-colors",
                  showHistory ? "py-6" : "py-14",
                  isDragging
                    ? "border-[#0C3CF7] bg-[#FAFAFF]"
                    : "border-[#D0D3D9] bg-[#FAFAFA] hover:border-[#B8BDC6]"
                )}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
              >
                <Upload className="h-7 w-7 text-[#5F6572]" aria-hidden />
                <p className="mt-3 text-sm text-[#5F6572]">
                  Arraste e solte aqui ou{" "}
                  <span className="font-medium text-[#0C3CF7]">selecione arquivos</span>
                </p>
                <p className="mt-2 text-sm text-[#5F6572]">
                  Você pode enviar até 100 arquivos por vez. Formato suportado: PDF, ZIP
                </p>
              </div>

              {/* History section */}
              {showHistory && (
                <div className="mt-8">
                  {/* History header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-[#0d0f1c]">Histórico de envios</h3>
                      <p className="mt-1 text-sm text-[#5F6572]">
                        Veja o status dos seus envios e acompanhe os comprovantes já submetidos
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pt-1">
                      <Switch
                        id="only-errors"
                        checked={onlyErrors}
                        onCheckedChange={(v) => { setOnlyErrors(v); setPage(0); }}
                      />
                      <Label
                        htmlFor="only-errors"
                        className="cursor-pointer text-sm text-[#5F6572]"
                      >
                        Exibir somente documentos com erros
                      </Label>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="mt-4 overflow-hidden rounded-lg border border-[#EBECEE]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#EBECEE] bg-[#F5F5F6] text-left">
                          <th className="px-4 py-3 font-semibold text-[#0d0f1c]">Nome do arquivo</th>
                          <th className="px-4 py-3 font-semibold text-[#0d0f1c]">Tamanho</th>
                          <th className="px-4 py-3 font-semibold text-[#0d0f1c]">Data de envio</th>
                          <th className="px-4 py-3 font-semibold text-[#0d0f1c]">Status</th>
                          <th className="px-4 py-3 font-semibold text-[#0d0f1c] text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#5F6572]">
                              Nenhum documento para exibir.
                            </td>
                          </tr>
                        ) : (
                          pageItems.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-[#EBECEE] last:border-b-0 hover:bg-[#FAFAFA]"
                            >
                              <td className="max-w-[280px] truncate px-4 py-3 text-[#5F6572]">
                                {entry.nome}
                              </td>
                              <td className="px-4 py-3 text-[#5F6572]">{entry.tamanho}</td>
                              <td className="px-4 py-3 text-[#5F6572]">{entry.dataEnvio}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1.5 text-[#5F6572]">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                                  {entry.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[#C4C8CE] hover:text-[#5F6572] transition-colors"
                                    aria-label="Editar"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    className="text-[#C4C8CE] hover:text-[#5F6572] transition-colors"
                                    aria-label="Remover"
                                    onClick={() => removeEntry(entry.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-[#EBECEE] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#5F6572]">Resultados por página</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 px-2 shadow-none font-normal text-sm"
                            >
                              {pageSize}
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {PAGE_SIZES.map((sz) => (
                              <DropdownMenuItem
                                key={sz}
                                onClick={() => { setPageSize(sz); setPage(0); }}
                              >
                                {sz}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#5F6572]">
                          Mostrando{" "}
                          <span className="font-semibold text-[#0d0f1c]">
                            {showingFrom === 0 ? 0 : showingFrom} - {showingTo}
                          </span>{" "}
                          de{" "}
                          <span className="font-semibold text-[#0d0f1c]">{totalEntries}</span>{" "}
                          resultados
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 shadow-none"
                          disabled={safePage === 0}
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 shadow-none"
                          disabled={safePage >= totalPages - 1}
                          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty-state info block (only shown before history) */}
              {!showHistory && (
                <div className="mx-auto mt-20 flex max-w-[520px] flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <Upload className="h-6 w-6 text-orange-600" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#0d0f1c]">O que acontece depois?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5F6572]">
                    Após o envio, processaremos os arquivos e exibiremos os comprovantes enviados. Se
                    algum deles apresentar problemas, você poderá corrigir diretamente nesta tela.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* In-modal toast (fixed at bottom inside the modal) */}
          {toastVisible && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
              <div className="pointer-events-auto flex w-full max-w-[600px] items-start justify-between gap-4 rounded-lg bg-[#1A1D23] px-5 py-4 shadow-xl">
                <p className="text-sm leading-snug text-white">
                  <span className="font-semibold">Seus arquivos foram enviados!</span> Estamos
                  processando as informações. Você pode acompanhar o progresso nesta página.
                </p>
                <button
                  type="button"
                  aria-label="Fechar aviso"
                  className="mt-0.5 shrink-0 text-white/60 hover:text-white transition-colors"
                  onClick={dismissUploadToast}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
