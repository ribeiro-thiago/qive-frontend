"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { MessageSquareText, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AnexosTab } from "./AnexosTab";
import { ApagarArquivoConfirmModal } from "./ApagarArquivoConfirmModal";
import { downloadDocumentoAnexo } from "./lib/anexo-actions";
import type { MensagensCanal } from "./lib/mensagens-actions";
import { DocumentoMensagensExperience } from "./mensagens/DocumentoMensagensExperience";
import {
  markAnexoAsDeleted,
  markAnexoAsDeletedInMensagens,
} from "./mensagens/documento-mensagens-shared";
import type { DocumentoAnexo, DocumentoMensagem, PortalDocumentoRow } from "./types";

const MAIN_TABS = [
  { id: "comentario", label: "Comentário" },
  { id: "anexos", label: "Arquivos" },
] as const;

type MainTabId = (typeof MAIN_TABS)[number]["id"];

type DeleteTarget =
  | {
      scope: "mensagem";
      chat: MensagensCanal;
      mensagemId: string;
      anexo: DocumentoAnexo;
    }
  | { scope: "documento"; anexo: DocumentoAnexo };

type DocumentoMensagensModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documento: PortalDocumentoRow | null;
  onUpdateMensagens: (
    documentoId: number,
    chat: MensagensCanal,
    mensagens: DocumentoMensagem[],
  ) => void;
  onUpdateAnexosDocumento: (documentoId: number, anexos: DocumentoAnexo[]) => void;
};

function formatMensagensModalTitle(tipo: string, numero: string): string {
  return `${tipo} ${numero}`;
}

export function DocumentoMensagensModal({
  open,
  onOpenChange,
  documento,
  onUpdateMensagens,
  onUpdateAnexosDocumento,
}: DocumentoMensagensModalProps) {
  const [mainTab, setMainTab] = React.useState<MainTabId>("comentario");
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(null);

  React.useEffect(() => {
    if (open) {
      setMainTab("comentario");
    }
  }, [open, documento?.id]);

  React.useEffect(() => {
    if (!open) {
      setDeleteTarget(null);
    }
  }, [open]);

  if (!documento) return null;

  const title = formatMensagensModalTitle(documento.tipoDocumento, documento.nfNumero);

  const handleDownload = (anexo: DocumentoAnexo) => {
    downloadDocumentoAnexo(anexo);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.scope === "documento") {
      onUpdateAnexosDocumento(
        documento.id,
        documento.anexosDocumento.map((item) =>
          item.id === deleteTarget.anexo.id ? markAnexoAsDeleted(item) : item,
        ),
      );
    } else {
      const mensagens =
        deleteTarget.chat === "fornecedor"
          ? documento.mensagensFornecedor
          : documento.mensagensInterno;

      onUpdateMensagens(
        documento.id,
        deleteTarget.chat,
        markAnexoAsDeletedInMensagens(
          mensagens,
          deleteTarget.mensagemId,
          deleteTarget.anexo.id,
        ),
      );
    }

    toast.success("Arquivo apagado com sucesso.");
    setDeleteTarget(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "flex h-[min(90vh,640px)] w-[calc(100vw-32px)] max-w-[720px] flex-col gap-0 overflow-hidden rounded-[16px] p-0",
            "top-[50%] translate-y-[-50%]",
          )}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogDescription className="sr-only">
            Comentários e arquivos do documento {title}
          </DialogDescription>

          <div className="shrink-0 border-b border-[rgba(4,14,35,0.08)] bg-white">
            <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-2">
              <div className="flex min-w-0 items-start gap-3">
                <MessageSquareText
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#5B616F]"
                  aria-hidden
                />
                <div className="min-w-0">
                  <DialogTitle className="text-[20px] font-bold leading-tight text-[#0d0f1c]">
                    Comentários
                  </DialogTitle>
                  <p className="mt-0.5 truncate text-sm text-[#5B616F]">{title}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Fechar comentários"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="px-6" aria-label="Seções de comentários e arquivos">
              <Tabs
                key={`${documento.id}-${open}`}
                tabs={[...MAIN_TABS]}
                value={mainTab}
                onValueChange={(value) => setMainTab(value as MainTabId)}
                variant="product"
                className="w-full"
              />
            </nav>
          </div>

          <div
            role="tabpanel"
            aria-label={MAIN_TABS.find((tab) => tab.id === mainTab)?.label}
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden",
              mainTab === "anexos" ? "bg-[#FAFAFB]" : "bg-white",
            )}
          >
            {mainTab === "comentario" ? (
              <DocumentoMensagensExperience
                key={documento.id}
                documento={documento}
                onUpdateMensagens={(chat, mensagens) =>
                  onUpdateMensagens(documento.id, chat, mensagens)
                }
                onDownload={handleDownload}
                onDeleteRequest={(chat, mensagemId, anexo) =>
                  setDeleteTarget({ scope: "mensagem", chat, mensagemId, anexo })
                }
              />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <AnexosTab
                  documento={documento}
                  onDownload={handleDownload}
                  onDeleteRequest={(anexo) =>
                    setDeleteTarget({ scope: "documento", anexo })
                  }
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ApagarArquivoConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
