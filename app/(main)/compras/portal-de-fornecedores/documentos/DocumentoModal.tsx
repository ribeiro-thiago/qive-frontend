"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs } from "@/components/ui/tabs";
import { Check, Download, FileText, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_CHECKBOX_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import {
  getDocumentoStatusPortal,
  PortalDocumentoEtapaErpTag,
  PortalDocumentoSituacaoDfeTag,
  PortalDocumentoStatusTag,
  PortalDocumentoVinculoTipoTag,
} from "../components/PortalTags";
import { getDocumentoSituacaoDfe } from "./lib/documento-situacao-dfe";
import { DocumentoDanfeToolbar } from "./danfe/DocumentoDanfeToolbar";
import { DocumentoVerDanfeTab } from "./danfe/DocumentoVerDanfeTab";
import { DocumentoNotaCompletaTab } from "./nota-completa/DocumentoNotaCompletaTab";
import { VincularDocumentoOrigemModal } from "./VincularDocumentoOrigemModal";
import { ComprovantesTab } from "./ComprovantesTab";
import { LogsTab } from "./LogsTab";
import type { DocumentoOrigemVinculo, PortalDocumentoRow } from "./types";

const BASE_MODAL_TABS = [
  { id: "detalhes", label: "Detalhes" },
  { id: "comprovantes", label: "Comprovantes" },
  { id: "logs", label: "Logs" },
] as const;

const NFE_EXTRA_MODAL_TABS = [
  { id: "ver-danfe", label: "Ver DANFe" },
  { id: "nota-completa", label: "Nota Completa" },
] as const;

export type DocumentoModalTabId =
  | "detalhes"
  | "comprovantes"
  | "logs"
  | "ver-danfe"
  | "nota-completa";

function getModalTabs(showNfeExtraTabs: boolean) {
  if (showNfeExtraTabs) {
    return [...NFE_EXTRA_MODAL_TABS, ...BASE_MODAL_TABS];
  }
  return [...BASE_MODAL_TABS];
}

type DocumentoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documento: PortalDocumentoRow | null;
  /** Abas Ver DANFe e Nota Completa — somente modal de detalhes na rota NF-e do portal. */
  showNfeExtraTabs?: boolean;
  initialTab?: DocumentoModalTabId;
  onAprovar?: () => void;
  onBaixar?: () => void;
};

function formatDocumentoModalTitle(tipo: string, numero: string): string {
  return `Nº ${tipo} ${numero}`;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-x-4">
      <Label className="text-sm font-semibold text-[#3D4350]">{label}</Label>
      <p className="text-sm text-[#0d0f1c]">{value}</p>
    </div>
  );
}

function DetailTagField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-x-4">
      <Label className="w-[120px] shrink-0 text-sm font-semibold text-[#3D4350]">{label}</Label>
      <div className="w-fit">{children}</div>
    </div>
  );
}

/** Larguras das colunas da tabela de itens (modal Detalhes) — alinhadas ao conteúdo. */
const DETALHES_ITENS_TABLE_MIN_WIDTH = 1460;

function DetalhesTab({ documento }: { documento: PortalDocumentoRow }) {
  const [vincularDocumentoOpen, setVincularDocumentoOpen] = React.useState(false);
  const [documentosVinculados, setDocumentosVinculados] =
    React.useState<DocumentoOrigemVinculo[]>([]);
  const statusPortal = getDocumentoStatusPortal(documento.etapa);
  const situacaoDfe = getDocumentoSituacaoDfe(documento);
  const etapaERP = documento.comprovante ? "Movimentado" : "Sem movimentação";

  React.useEffect(() => {
    setDocumentosVinculados([]);
    setVincularDocumentoOpen(false);
  }, [documento.id]);

  const handleConfirmVinculo = (vinculos: DocumentoOrigemVinculo[]) => {
    setDocumentosVinculados(vinculos);

    if (vinculos.length === 1) {
      const vinculo = vinculos[0];
      toast.success(
        vinculo.tipo === "PO"
          ? "PO vinculada com sucesso."
          : "FRS vinculada com sucesso.",
      );
      return;
    }

    toast.success(`${vinculos.length} documentos vinculados com sucesso.`);
  };

  return (
    <div className="flex flex-col bg-white pb-6">
      <div className="grid gap-8 px-6 py-5 md:grid-cols-2">
        <div className="space-y-3">
          <DetailField label="Tipo" value={documento.tipoDocumento} />
          <DetailField label="Número" value={documento.nfNumero} />
          <DetailField label="Série" value="-" />
          <DetailField label="Emissor" value={documento.cnpjEmissor} />
          <DetailField label="Nome Emissor" value={documento.nomeEmissor} />
          <DetailField label="Destinatário" value={documento.cnpjDestinatario} />
          <DetailField label="Nome Destinatário" value="-" />
        </div>

        <div className="space-y-3">
          <DetailField label="Data Emissão" value={documento.dataEmissao} />
          <DetailField label="Data Envio ERP" value="-" />
          <DetailTagField label="Status">
            <PortalDocumentoStatusTag status={statusPortal} />
          </DetailTagField>
          <DetailTagField label="Situação do DF-e">
            <PortalDocumentoSituacaoDfeTag situacao={situacaoDfe} />
          </DetailTagField>
          <DetailTagField label="Etapa ERP">
            <PortalDocumentoEtapaErpTag etapa={etapaERP} />
          </DetailTagField>
          <DetailField label="Valor XML" value={documento.valor} />
          <DetailField label="Aprovado por" value="-" />
        </div>
      </div>

      <div className="px-6">
        <div className="border-t border-[rgba(4,14,35,0.08)] py-4">
          <div className="overflow-x-auto border border-border">
            <table
              className="w-full table-fixed text-sm"
              style={{ minWidth: DETALHES_ITENS_TABLE_MIN_WIDTH }}
            >
              <colgroup>
                <col className="w-10" />
                <col className="w-[172px]" />
                <col className="w-[76px]" />
                <col className="w-[108px]" />
                <col className="w-[60px]" />
                <col className="w-[88px]" />
                <col className="w-[340px]" />
                <col className="w-[60px]" />
                <col className="w-[60px]" />
                <col className="w-[72px]" />
                <col className="w-[72px]" />
                <col className="w-[108px]" />
                <col className="w-[108px]" />
                <col className="w-[96px]" />
              </colgroup>
              <thead>
                <tr className={TABLE_HEAD_ROW_CLASS}>
                  <th className="pl-3 pr-2 text-center">
                    <input
                      type="checkbox"
                      aria-label="Selecionar item do documento"
                      className={TABLE_CHECKBOX_CLASS}
                    />
                  </th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "text-center")}>Ação</th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Tipo</th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Documento</th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>NF Item</th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Cód. Serviço</th>
                  <th className={TABLE_HEAD_CELL_CLASS}>Descrição Item</th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>NCM</th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>CFOP</th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Unidade</th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>
                    Qtd Item
                  </th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>Valor</th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>
                    Valor Total
                  </th>
                  <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")} aria-hidden />
                </tr>
              </thead>
              <tbody>
                <tr className={TABLE_BODY_ROW_CLASS}>
                  <td className="py-3 pl-3 pr-2 text-center align-middle">
                    <input
                      type="checkbox"
                      aria-label="Selecionar item 1"
                      className={TABLE_CHECKBOX_CLASS}
                    />
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "text-center")}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 max-w-full px-2.5 text-xs font-bold"
                      onClick={() => setVincularDocumentoOpen(true)}
                    >
                      {documentosVinculados.length > 0 ? "Editar" : "Vincular Documento"}
                    </Button>
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "align-middle")}>
                    {documentosVinculados.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {documentosVinculados.map((vinculo) => (
                          <PortalDocumentoVinculoTipoTag key={vinculo.origemId} tipo={vinculo.tipo} />
                        ))}
                      </div>
                    ) : (
                      <span className={cn("text-xs", TABLE_SECONDARY_TEXT_CLASS)}>-</span>
                    )}
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "align-middle")}>
                    {documentosVinculados.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {documentosVinculados.map((vinculo) => (
                          <span
                            key={vinculo.origemId}
                            className={cn(
                              "block truncate text-sm leading-5",
                              TABLE_PRIMARY_TEXT_CLASS,
                            )}
                            title={vinculo.numeroDocumento}
                          >
                            {vinculo.numeroDocumento}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className={cn("text-xs", TABLE_SECONDARY_TEXT_CLASS)}>-</span>
                    )}
                  </td>
                  <td
                    className={cn(
                      TABLE_BODY_CELL_CLASS,
                      "text-center tabular-nums",
                      TABLE_PRIMARY_TEXT_CLASS,
                    )}
                  >
                    1
                  </td>
                  <td
                    className={cn(
                      TABLE_BODY_CELL_CLASS,
                      "whitespace-nowrap",
                      TABLE_SECONDARY_TEXT_CLASS,
                    )}
                  >
                    042201
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "text-xs leading-5", TABLE_SECONDARY_TEXT_CLASS)}>
                    <span className="line-clamp-3" title="COBERTURA PARA ASSISTENCIA MEDICA CONFORME CONTRATO EM ATENDIMENTO AO DISPOSTO NO ARTIGO PRIMEIRO DA LEI 127412012 INFORMAMOS A INCIDENCIA DE TRIBUTOS SOBRE OS SERVICOS DESCRITOS NESTA NOTA FISCAL: ISS=5%">
                      COBERTURA PARA ASSISTENCIA MEDICA CONFORME CONTRATO EM ATENDIMENTO AO DISPOSTO NO
                      ARTIGO PRIMEIRO DA LEI 127412012 INFORMAMOS A INCIDENCIA DE TRIBUTOS SOBRE OS
                      SERVICOS DESCRITOS NESTA NOTA FISCAL: ISS=5%
                    </span>
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "text-center", TABLE_SECONDARY_TEXT_CLASS)}>
                    -
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "text-center", TABLE_SECONDARY_TEXT_CLASS)}>
                    -
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "text-center", TABLE_SECONDARY_TEXT_CLASS)}>
                    -
                  </td>
                  <td
                    className={cn(
                      TABLE_BODY_CELL_CLASS,
                      "text-right tabular-nums",
                      TABLE_PRIMARY_TEXT_CLASS,
                    )}
                  >
                    1
                  </td>
                  <td
                    className={cn(
                      TABLE_BODY_CELL_CLASS,
                      "text-right font-semibold tabular-nums whitespace-nowrap",
                      TABLE_PRIMARY_TEXT_CLASS,
                    )}
                  >
                    {documento.valor}
                  </td>
                  <td
                    className={cn(
                      TABLE_BODY_CELL_CLASS,
                      "text-right font-semibold tabular-nums whitespace-nowrap",
                      TABLE_PRIMARY_TEXT_CLASS,
                    )}
                  >
                    {documento.valor}
                  </td>
                  <td className={TABLE_BODY_CELL_CLASS}>
                    {documentosVinculados.length > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-2 text-xs text-[#5B616F] hover:text-[#B42318]"
                        aria-label="Remover vínculos do documento"
                        onClick={() => {
                          setDocumentosVinculados([]);
                          toast.success("Vínculos removidos com sucesso.");
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Remover
                      </Button>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <VincularDocumentoOrigemModal
        open={vincularDocumentoOpen}
        onOpenChange={setVincularDocumentoOpen}
        onConfirm={handleConfirmVinculo}
        initialVinculos={documentosVinculados}
      />
    </div>
  );
}


export function DocumentoModal({
  open,
  onOpenChange,
  documento,
  showNfeExtraTabs = false,
  initialTab = "detalhes",
  onAprovar,
  onBaixar,
}: DocumentoModalProps) {
  const modalTabs = React.useMemo(() => getModalTabs(showNfeExtraTabs), [showNfeExtraTabs]);
  const [currentTab, setCurrentTab] = React.useState<DocumentoModalTabId>(initialTab);
  const [danfeNovosImpostos, setDanfeNovosImpostos] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      const resolvedTab = modalTabs.some((tab) => tab.id === initialTab) ? initialTab : "detalhes";
      setCurrentTab(resolvedTab);
      setDanfeNovosImpostos(true);
    }
  }, [open, documento?.id, initialTab, modalTabs]);

  const handleTabChange = React.useCallback(
    (value: string) => {
      if (modalTabs.some((tab) => tab.id === value)) {
        setCurrentTab(value as DocumentoModalTabId);
      }
    },
    [modalTabs],
  );

  if (!documento) return null;

  const title = formatDocumentoModalTitle(documento.tipoDocumento, documento.nfNumero);
  const showDocumentoActions =
    (currentTab === "detalhes" || currentTab === "ver-danfe" || currentTab === "nota-completa") &&
    Boolean(onAprovar && onBaixar);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0",
          "max-w-none translate-x-0 translate-y-0",
          "rounded-xl shadow-2xl",
        )}
        style={{
          top: "24px",
          left: "24px",
          right: "24px",
          width: "calc(100vw - 48px)",
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogDescription className="sr-only">
          Detalhes, comprovantes e logs do documento {title}
        </DialogDescription>

        {/* Cabeçalho: título + abas principais */}
        <div className="shrink-0 border-b border-[rgba(4,14,35,0.08)] bg-white">
          <div className="flex items-center gap-3 px-6 pt-5 pb-2">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <FileText className="h-5 w-5 shrink-0 text-[#5B616F]" aria-hidden />
              <DialogTitle className="whitespace-nowrap text-[20px] font-bold leading-tight text-[#0d0f1c]">
                {title}
              </DialogTitle>
              {currentTab === "ver-danfe" ? (
                <DocumentoDanfeToolbar
                  layout="beside-title"
                  novosImpostos={danfeNovosImpostos}
                  onNovosImpostosChange={setDanfeNovosImpostos}
                />
              ) : null}
            </div>
            {showDocumentoActions ? (
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={onBaixar}
                >
                  <Download className="h-4 w-4 shrink-0" aria-hidden />
                  Baixar
                </Button>
                <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={onAprovar}>
                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                  Aprovar
                </Button>
              </div>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Fechar"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="px-6" aria-label="Seções do documento">
            <Tabs
              key={`${documento.id}-${open}-${showNfeExtraTabs}`}
              tabs={[...modalTabs]}
              value={currentTab}
              onValueChange={handleTabChange}
              variant="product"
              className="w-full"
            />
          </nav>
        </div>

        {/* Painéis das abas principais */}
        <div
          role="tabpanel"
          aria-label={modalTabs.find((tab) => tab.id === currentTab)?.label}
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden bg-white",
            (currentTab === "comprovantes" || currentTab === "nota-completa") && "flex flex-col",
          )}
        >
          <div
            className={cn(
              "min-h-0 flex-1",
              (currentTab === "ver-danfe" || currentTab === "detalhes" || currentTab === "logs") &&
                "overflow-y-auto",
              (currentTab === "comprovantes" || currentTab === "nota-completa") && "flex flex-col",
            )}
          >
            {currentTab === "ver-danfe" && (
              <DocumentoVerDanfeTab
                documento={documento}
                showNovosImpostos={danfeNovosImpostos}
              />
            )}
            {currentTab === "nota-completa" && (
              <DocumentoNotaCompletaTab documento={documento} />
            )}
            {currentTab === "detalhes" && <DetalhesTab documento={documento} />}
            {currentTab === "comprovantes" && <ComprovantesTab documento={documento} />}
            {currentTab === "logs" && <LogsTab documento={documento} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
