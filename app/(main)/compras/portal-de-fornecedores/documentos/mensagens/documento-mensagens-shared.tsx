"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatAnexoExtensionLabel,
  getAnexoDisplayName,
} from "../lib/anexo-actions";
import type { DocumentoAnexo, DocumentoMensagem } from "../types";
import { MensagensEmptyState } from "../MensagensEmptyState";
import type { MensagensCanal } from "../lib/mensagens-actions";

export const ACCEPTED_EXTENSIONS = new Set([
  "pdf",
  "xml",
  "jpg",
  "jpeg",
  "png",
  "doc",
  "docx",
  "xls",
  "xlsx",
]);

export const ACCEPT_ATTRIBUTE = ".pdf,.xml,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx";
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ANEXO_ICON_ACTION_CLASS = "h-8 w-8 shrink-0 shadow-none";

export function markAnexoAsDeleted(anexo: DocumentoAnexo): DocumentoAnexo {
  return { ...anexo, apagado: true, canDelete: false };
}

export function markAnexoAsDeletedInMensagens(
  mensagens: DocumentoMensagem[],
  mensagemId: string,
  anexoId: string,
): DocumentoMensagem[] {
  return mensagens.map((mensagem) => {
    if (mensagem.id !== mensagemId) return mensagem;

    const anexos = (mensagem.anexos ?? []).map((item) =>
      item.id === anexoId ? markAnexoAsDeleted(item) : item,
    );

    return { ...mensagem, anexos };
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatNowPtBr(): string {
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} - ${time}`;
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

function getFileBaseName(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0) return fileName;
  return fileName.slice(0, lastDot);
}

export function fileToAnexo(file: File, id: string): DocumentoAnexo {
  const ext = getFileExtension(file.name);
  return {
    id,
    nome: getFileBaseName(file.name),
    extensao: ext,
    tamanhoBytes: file.size,
    canDelete: true,
  };
}

function getMessageAuthorInitials(autor: string): string {
  if (autor === "Você") return "TV";

  const parts = autor.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function MessageAuthorAvatar({ autor }: { autor: string }) {
  const isCurrentUser = autor === "Você";

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
        isCurrentUser ? "bg-[#F5A962]" : "bg-[#0C3CF7]",
      )}
      aria-hidden
    >
      {getMessageAuthorInitials(autor)}
    </div>
  );
}

export function UserMessageAvatar() {
  return <MessageAuthorAvatar autor="Você" />;
}

function AnexoIconActions({
  fileLabel,
  onDownload,
  onDelete,
  showDelete = true,
}: {
  fileLabel: string;
  onDownload: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-start">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={ANEXO_ICON_ACTION_CLASS}
        aria-label={`Baixar ${fileLabel}`}
        onClick={onDownload}
      >
        <Download className="h-4 w-4 text-[#5B616F]" />
      </Button>
      {showDelete && onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={ANEXO_ICON_ACTION_CLASS}
          aria-label={`Apagar ${fileLabel}`}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-[#5B616F]" />
        </Button>
      )}
    </div>
  );
}

function AnexoItem({
  anexo,
  onDownload,
  onDeleteRequest,
}: {
  anexo: DocumentoAnexo;
  onDownload: (anexo: DocumentoAnexo) => void;
  onDeleteRequest?: (anexo: DocumentoAnexo) => void;
}) {
  const isDeleted = anexo.apagado === true;
  const displayName = getAnexoDisplayName(anexo);
  const canDelete = !isDeleted && anexo.canDelete !== false;

  if (isDeleted) {
    return (
      <div className="inline-flex max-w-full items-start">
        <div className="inline-flex min-w-0 items-start gap-2 rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] px-3 py-2 text-left">
          <FileText className="mt-px h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
          <p className="m-0 text-sm font-medium leading-tight text-[rgba(4,14,35,0.64)]">
            Esse arquivo foi apagado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex max-w-full items-start gap-2">
      <div className="inline-flex min-w-0 items-start gap-2 rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] px-3 py-2 text-left">
        <FileText className="mt-px h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
        <div className="min-w-0 space-y-0">
          <p className="m-0 truncate text-sm font-medium leading-tight text-[#0d0f1c]">{displayName}</p>
          <p className="m-0 text-[10px] leading-tight text-[#5B616F]">
            {formatAnexoExtensionLabel(anexo.extensao)}
            {anexo.extensao ? " · " : ""}
            {formatFileSize(anexo.tamanhoBytes)}
          </p>
        </div>
      </div>
      <AnexoIconActions
        fileLabel={displayName}
        onDownload={() => onDownload(anexo)}
        onDelete={onDeleteRequest ? () => onDeleteRequest(anexo) : undefined}
        showDelete={canDelete && !!onDeleteRequest}
      />
    </div>
  );
}

export function ChatMessagesList({
  mensagens,
  channel,
  messagesEndRef,
  onDownload,
  onDeleteRequest,
}: {
  mensagens: DocumentoMensagem[];
  channel: MensagensCanal;
  messagesEndRef: React.Ref<HTMLDivElement>;
  onDownload: (anexo: DocumentoAnexo) => void;
  onDeleteRequest: (mensagemId: string, anexo: DocumentoAnexo) => void;
}) {
  if (mensagens.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <MensagensEmptyState channel={channel} />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <ul className="space-y-4">
        {mensagens.map((mensagem) => (
          <li key={mensagem.id}>
            <div className="flex gap-3">
              <MessageAuthorAvatar autor={mensagem.autor} />
              <div className="min-w-0 flex-1">
                <p className="leading-tight">
                  <span className="text-sm font-bold text-[#0d0f1c]">{mensagem.autor}</span>
                  <span className="text-xs text-[#040E236B]"> • {mensagem.dataHora}</span>
                </p>
                {mensagem.texto && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[rgba(4,14,35,0.64)]">
                    {mensagem.texto}
                  </p>
                )}
                {mensagem.anexos && mensagem.anexos.length > 0 && (
                  <div
                    className={cn("flex flex-wrap gap-2", mensagem.texto ? "mt-2" : "mt-1")}
                  >
                    {mensagem.anexos.map((anexo) => (
                      <AnexoItem
                        key={anexo.id}
                        anexo={anexo}
                        onDownload={onDownload}
                        onDeleteRequest={(item) => onDeleteRequest(mensagem.id, item)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>
    </div>
  );
}
