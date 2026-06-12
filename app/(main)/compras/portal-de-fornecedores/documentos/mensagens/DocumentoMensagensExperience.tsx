"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  ChevronDown,
  FileText,
  Info,
  Loader2,
  Lock,
  MessageCircle,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatAnexoExtensionLabel } from "../lib/anexo-actions";
import {
  fetchMensagensCanal,
  submitMensagem,
  type MensagensCanal,
} from "../lib/mensagens-actions";
import { MensagensErrorState } from "../MensagensErrorState";
import { MensagensLoadingSkeleton } from "../MensagensLoadingSkeleton";
import type {
  DocumentoAnexo,
  DocumentoMensagem,
  FornecedorAcessoPortalStatus,
  PendingAttachment,
  PortalDocumentoRow,
} from "../types";
import {
  ACCEPT_ATTRIBUTE,
  ACCEPTED_EXTENSIONS,
  ANEXO_ICON_ACTION_CLASS,
  ChatMessagesList,
  fileToAnexo,
  formatFileSize,
  formatNowPtBr,
  getFileExtension,
  MAX_FILE_SIZE_BYTES,
  UserMessageAvatar,
} from "./documento-mensagens-shared";

const CHAT_SUB_TABS = [
  { id: "interno", label: "Mensagem interna", icon: Lock },
  { id: "fornecedor", label: "Conversar com Fornecedor", icon: MessageCircle },
] as const;

type ChatSubTabId = MensagensCanal;

type MensagemEnvioModo = "chat" | "chat-email";

type MensagensLoadState = "idle" | "loading" | "error" | "success";

const INITIAL_LOAD_STATE: Record<ChatSubTabId, MensagensLoadState> = {
  fornecedor: "idle",
  interno: "idle",
};

const FORNECEDOR_ACESSO_WARNING_COPY: Record<
  Exclude<FornecedorAcessoPortalStatus, "ativo">,
  string
> = {
  "sem-acesso":
    "Este fornecedor ainda não possui acesso ao portal. Sua mensagem ficará disponível quando o cadastro for ativado.",
  "convite-pendente":
    "O convite de acesso ao portal ainda está pendente. O fornecedor verá suas mensagens após aceitar o convite.",
};

export type DocumentoMensagensExperienceProps = {
  documento: PortalDocumentoRow;
  onUpdateMensagens: (chat: ChatSubTabId, mensagens: DocumentoMensagem[]) => void;
  onDownload: (anexo: DocumentoAnexo) => void;
  onDeleteRequest: (chat: ChatSubTabId, mensagemId: string, anexo: DocumentoAnexo) => void;
};

export function DocumentoMensagensExperience({
  documento,
  onUpdateMensagens,
  onDownload,
  onDeleteRequest,
}: DocumentoMensagensExperienceProps) {
  const [chatSubTab, setChatSubTab] = React.useState<ChatSubTabId>("fornecedor");
  const [alertDismissed, setAlertDismissed] = React.useState(false);
  const [acessoWarningDismissed, setAcessoWarningDismissed] = React.useState(false);
  const [messageText, setMessageText] = React.useState("");
  const [pendingAttachments, setPendingAttachments] = React.useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const [loadStateByChannel, setLoadStateByChannel] =
    React.useState<Record<ChatSubTabId, MensagensLoadState>>(INITIAL_LOAD_STATE);
  const [loadedMessagesByChannel, setLoadedMessagesByChannel] = React.useState<
    Record<ChatSubTabId, DocumentoMensagem[]>
  >({ fornecedor: [], interno: [] });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const sendFailOnceRef = React.useRef(true);
  const loadRequestIdRef = React.useRef(0);

  const trimmedText = messageText.trim();
  const canSend = trimmedText.length > 0 || pendingAttachments.length > 0;
  const activeLoadState = loadStateByChannel[chatSubTab];
  const activeMessages = loadedMessagesByChannel[chatSubTab];
  const isComposerDisabled = activeLoadState === "loading" || activeLoadState === "error" || isSending;

  const fornecedorAcesso = documento.fornecedorAcessoPortal ?? "ativo";
  const showFornecedorAcessoWarning =
    chatSubTab === "fornecedor" &&
    !acessoWarningDismissed &&
    fornecedorAcesso !== "ativo";
  const showCommunicationInfoAlert =
    documento.showCommunicationAlert && !alertDismissed && chatSubTab === "fornecedor";

  const getSourceMessages = React.useCallback(
    (channel: ChatSubTabId) =>
      channel === "fornecedor" ? documento.mensagensFornecedor : documento.mensagensInterno,
    [documento.mensagensFornecedor, documento.mensagensInterno],
  );

  const loadChannelMessages = React.useCallback(
    async (channel: ChatSubTabId) => {
      const requestId = ++loadRequestIdRef.current;
      setLoadStateByChannel((prev) => ({ ...prev, [channel]: "loading" }));

      try {
        const messages = await fetchMensagensCanal(documento.id, getSourceMessages(channel));
        if (requestId !== loadRequestIdRef.current) return;
        setLoadedMessagesByChannel((prev) => ({ ...prev, [channel]: messages }));
        setLoadStateByChannel((prev) => ({ ...prev, [channel]: "success" }));
      } catch {
        if (requestId !== loadRequestIdRef.current) return;
        setLoadStateByChannel((prev) => ({ ...prev, [channel]: "error" }));
      }
    },
    [documento.id, getSourceMessages],
  );

  React.useEffect(() => {
    loadRequestIdRef.current += 1;
    setChatSubTab("fornecedor");
    setAlertDismissed(false);
    setAcessoWarningDismissed(false);
    setMessageText("");
    setPendingAttachments([]);
    setAttachmentError(null);
    setIsSending(false);
    sendFailOnceRef.current = documento.id === 1;
    setLoadStateByChannel({ fornecedor: "loading", interno: "idle" });
    setLoadedMessagesByChannel({ fornecedor: [], interno: [] });
    void loadChannelMessages("fornecedor");
  }, [documento.id, loadChannelMessages]);

  React.useEffect(() => {
    setMessageText("");
    setPendingAttachments([]);
    setAttachmentError(null);
  }, [chatSubTab]);

  React.useEffect(() => {
    if (activeLoadState !== "success") return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, chatSubTab, activeLoadState]);

  React.useEffect(() => {
    setLoadedMessagesByChannel((prev) => ({
      fornecedor:
        loadStateByChannel.fornecedor === "success"
          ? documento.mensagensFornecedor
          : prev.fornecedor,
      interno:
        loadStateByChannel.interno === "success" ? documento.mensagensInterno : prev.interno,
    }));
  }, [
    documento.mensagensFornecedor,
    documento.mensagensInterno,
    loadStateByChannel.fornecedor,
    loadStateByChannel.interno,
  ]);

  const validateAndAddFiles = (files: FileList | File[]) => {
    if (isComposerDisabled) return;

    const incoming = Array.from(files);
    if (incoming.length === 0) return;

    let nextError: string | null = null;
    const nextPending = [...pendingAttachments];

    for (const file of incoming) {
      const ext = getFileExtension(file.name);
      if (!ACCEPTED_EXTENSIONS.has(ext)) {
        nextError = "Formato de arquivo não suportado.";
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        nextError = "O arquivo excede o tamanho máximo permitido.";
        continue;
      }
      const isDuplicate = nextPending.some(
        (item) => item.file.name === file.name && item.file.size === file.size,
      );
      if (isDuplicate) {
        nextError = "Este arquivo já foi adicionado.";
        continue;
      }
      nextPending.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
      });
    }

    setPendingAttachments(nextPending);
    setAttachmentError(nextError);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      validateAndAddFiles(event.target.files);
    }
    event.target.value = "";
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((current) => current.filter((item) => item.id !== id));
    setAttachmentError(null);
  };

  const handleSend = async (modo: MensagemEnvioModo = "chat") => {
    if (!canSend || isComposerDisabled) return;

    const draftText = trimmedText;
    const draftAttachments = [...pendingAttachments];
    const shouldSimulateFailure = sendFailOnceRef.current && documento.id === 1;

    const newMessage: DocumentoMensagem = {
      id: `msg-${Date.now()}`,
      autor: "Você",
      dataHora: formatNowPtBr(),
      ...(draftText ? { texto: draftText } : {}),
      ...(draftAttachments.length > 0
        ? {
            anexos: draftAttachments.map((item, index) =>
              fileToAnexo(item.file, `sent-${Date.now()}-${index}`),
            ),
          }
        : {}),
    };

    setIsSending(true);

    try {
      await submitMensagem(shouldSimulateFailure);

      const nextMessages = [...activeMessages, newMessage];
      setLoadedMessagesByChannel((prev) => ({ ...prev, [chatSubTab]: nextMessages }));
      onUpdateMensagens(chatSubTab, nextMessages);
      setMessageText("");
      setPendingAttachments([]);
      setAttachmentError(null);

      if (modo === "chat-email") {
        toast.success("Mensagem enviada no chat e por e-mail.");
      }
    } catch {
      if (shouldSimulateFailure) {
        sendFailOnceRef.current = false;
      }
      toast.error("Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  const sendDisabled = !canSend || isComposerDisabled || isSending;

  const handleRetryLoad = () => {
    void loadChannelMessages(chatSubTab);
  };

  const handleChatSubTabChange = (channel: ChatSubTabId) => {
    setChatSubTab(channel);
    if (loadStateByChannel[channel] === "idle") {
      void loadChannelMessages(channel);
    }
  };

  const renderMessagesContent = () => {
    if (activeLoadState === "loading" || activeLoadState === "idle") {
      return <MensagensLoadingSkeleton />;
    }

    if (activeLoadState === "error") {
      return <MensagensErrorState onRetry={handleRetryLoad} />;
    }

    return (
      <ChatMessagesList
        mensagens={activeMessages}
        channel={chatSubTab}
        messagesEndRef={messagesEndRef}
        onDownload={onDownload}
        onDeleteRequest={(mensagemId, anexo) =>
          onDeleteRequest(chatSubTab, mensagemId, anexo)
        }
      />
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white p-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
        <div className="relative shrink-0 rounded-t-lg border-b border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] px-4">
          <div className="flex gap-6" role="tablist" aria-label="Tipo de conversa">
          {CHAT_SUB_TABS.map((tab) => {
            const active = chatSubTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`mensagens-modal-panel-${tab.id}`}
                id={`mensagens-modal-tab-${tab.id}`}
                onClick={() => handleChatSubTabChange(tab.id)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 border-b-2 text-sm font-medium transition-colors",
                  active
                    ? "border-[#0C3CF7] text-[#0d0f1c]"
                    : "border-transparent text-[#71717c] hover:text-[#0d0f1c]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {tab.label}
              </button>
            );
          })}
          </div>
        </div>

        <div
          id={`mensagens-modal-panel-${chatSubTab}`}
        role="tabpanel"
        aria-labelledby={`mensagens-modal-tab-${chatSubTab}`}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {showFornecedorAcessoWarning && (
          <div className="mx-4 mt-4 flex shrink-0 items-start gap-2 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#C2410C]" aria-hidden />
            <p className="flex-1 text-xs text-[#9A3412]">
              {FORNECEDOR_ACESSO_WARNING_COPY[fornecedorAcesso]}
            </p>
            <button
              type="button"
              className="shrink-0 rounded p-0.5 text-[#5B616F] hover:bg-[#FFEDD5] hover:text-[#0d0f1c]"
              aria-label="Fechar aviso de acesso"
              onClick={() => setAcessoWarningDismissed(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {showCommunicationInfoAlert && (
          <div className="mx-4 mt-4 flex shrink-0 items-start gap-2 rounded-lg border border-[#B8CCFF] bg-[#E7EEFF] px-3 py-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0C3CF7]" aria-hidden />
            <p className="flex-1 text-xs text-[#003F70]">
              Os comentários enviados aqui ficam visíveis para o fornecedor e os usuários da sua
              conta.
            </p>
            <button
              type="button"
              className="shrink-0 rounded p-0.5 text-[#5B616F] hover:bg-[#D6E4FF] hover:text-[#0d0f1c]"
              aria-label="Fechar alerta"
              onClick={() => setAlertDismissed(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{renderMessagesContent()}</div>
        </div>

        <div className="shrink-0 rounded-b-lg border-t border-[rgba(4,14,35,0.08)] bg-white px-4 py-4">
        {pendingAttachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 pl-11">
            {pendingAttachments.map((item) => {
              const extLabel = formatAnexoExtensionLabel(getFileExtension(item.file.name));
              return (
                <div key={item.id} className="inline-flex max-w-full items-start gap-2">
                  <div className="inline-flex min-w-0 items-start gap-2 rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] px-3 py-2">
                    <FileText className="mt-px h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
                    <div className="min-w-0 space-y-0">
                      <p className="m-0 truncate text-sm font-medium leading-tight text-[#0d0f1c]">
                        {item.file.name}
                      </p>
                      <p className="m-0 text-[10px] leading-tight text-[#5B616F]">
                        {extLabel}
                        {extLabel ? " · " : ""}
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={ANEXO_ICON_ACTION_CLASS}
                    aria-label={`Remover ${item.file.name}`}
                    disabled={isComposerDisabled}
                    onClick={() => removePendingAttachment(item.id)}
                  >
                    <X className="h-4 w-4 text-[#5B616F]" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {attachmentError && (
          <p className="mb-2 pl-11 text-xs text-[#DC2626]" role="alert">
            {attachmentError}
          </p>
        )}

        <div className="flex items-center gap-2">
          <UserMessageAvatar />
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            multiple
            className="hidden"
            disabled={isComposerDisabled}
            onChange={handleFileChange}
          />
          <Input
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder={
              activeLoadState === "error"
                ? "Carregue as mensagens para comentar"
                : "Adicionar um comentário"
            }
            disabled={isComposerDisabled}
            className="h-10 flex-1 shadow-none"
          />
          <Button
            type="button"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Adicionar arquivo"
            disabled={isComposerDisabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
          <div className="inline-flex h-10 shrink-0 overflow-hidden rounded-lg">
            <Button
              type="button"
              className="h-10 rounded-r-none px-5 font-bold"
              disabled={sendDisabled}
              onClick={() => void handleSend("chat")}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="h-10 rounded-l-none border-l border-white/20 px-2.5"
                  disabled={sendDisabled}
                  aria-label="Opções de envio"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px]">
                <DropdownMenuItem
                  disabled={sendDisabled}
                  onClick={() => void handleSend("chat")}
                >
                  Enviar no chat
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={sendDisabled}
                  onClick={() => void handleSend("chat-email")}
                >
                  Enviar no chat e email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
