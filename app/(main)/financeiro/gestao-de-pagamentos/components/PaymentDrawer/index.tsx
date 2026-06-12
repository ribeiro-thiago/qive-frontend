"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { X, Pencil, ChevronDown, Box, Briefcase, Truck, Barcode, Receipt, FilePlus2, Maximize2, Minimize2, Upload, PlusCircle, AlertCircle, Copy, CheckCircle2, Info } from "lucide-react";
import { Row, AssociatedDoc, type RowEvent } from "../../types";
import { getSupplier, type Supplier } from "@/lib/suppliers";
import { formatAccessKey, formatCurrency, formatGeracaoContaDisplay, parseDate } from "../../utils/formatters";
import { format } from "date-fns";
import { getAssociatedDocViewLabel } from "../../utils/payment-helpers";
import { useDocumentExpansion } from "../../hooks/useDocumentExpansion";
import { CopyableNumber } from "@/components/ui/copyable-number";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getRandomApprover } from "../../utils/approvers";
import { useFeatures } from "@/lib/features/useFeatures";
import { useTheme } from "@/lib/theme/useTheme";
import { LaunchConfirmationModal } from "../modals/LaunchConfirmationModal";
import { ReplaceBoletoModal } from "../modals/ReplaceBoletoModal";
import { DispensarBoletoModal } from "../modals/DispensarBoletoModal";
import {
  type Divergencia,
  type DivergenciaComparativo,
  type DivergenciaTipo,
  type DivergenciaSinalizacao,
  getAllDivergencias,
  getDivergenciaComparativo,
  getDivergenciaConfiavelSinalizacao,
  getDivergenciaCienciaSinalizacao,
  getPendenciaDispensadaSinalizacao,
  isDivergenciaConfiavel,
  isPendenciaDispensada,
  markDivergenciaCiencia,
  markDivergenciaConfiavel,
  markPendenciaDispensada,
} from "../../utils/divergencias";
import {
  createDueDateManualEditMeta,
  formatDueDateInput,
  formatDueDateManualEditDateTime,
  getDueDateRuleDays,
  saveManualDueDateEdit,
  validateManualDueDate,
} from "../../utils/due-date";
import { ReformaTributariaSection } from "./ReformaTributariaSection";
import { usePortalUser } from "@/lib/user/PortalUserContext";

const FALLBACK_USER_DISPLAY_NAME = "João da Silva";

function useCurrentUserDisplayName(): string {
  const { user } = usePortalUser();
  return user.name?.trim() || FALLBACK_USER_DISPLAY_NAME;
}

function buildSinalizacaoMeta(userName: string): DivergenciaSinalizacao {
  return { userName, date: format(new Date(), "dd/MM/yyyy") };
}

function displayFornecedorValue(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

const EVENT_ACTION_VERB: Record<Exclude<RowEvent["type"], "pendency_resolved">, string> = {
  approved: "aprovou a conta a pagar",
  rejected: "reprovou a conta a pagar",
  boleto_link_confirmed: "confirmou o vínculo do boleto",
  boleto_link_rejected: "negou o vínculo do boleto",
};

function getEventActionText(event: RowEvent): string {
  if (event.type === "pendency_resolved") {
    return event.pendencyLabel
      ? `resolveu a pendência ${event.pendencyLabel}`
      : "resolveu uma pendência";
  }
  return EVENT_ACTION_VERB[event.type];
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function HistoricoEventosBlock({ events }: { events?: RowEvent[] }) {
  const sorted = React.useMemo(() => {
    if (!events || events.length === 0) return [];
    const now = Date.now();
    return [...events].filter((event) => {
      const eventTime = new Date(event.createdAt).getTime();
      return Number.isFinite(eventTime) && eventTime <= now;
    }).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [events]);

  const groups = React.useMemo((): Array<{ key: string; date: Date; events: RowEvent[] }> => {
    const map = new Map<string, { date: Date; events: RowEvent[] }>();
    for (const event of sorted) {
      const d = new Date(event.createdAt);
      const key = localDateKey(d);
      const existing = map.get(key);
      if (existing) {
        existing.events.push(event);
      } else {
        map.set(key, { date: d, events: [event] });
      }
    }
    return Array.from(map.entries()).map(([key, value]) => ({ key, ...value }));
  }, [sorted]);

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
        <h3 className="text-sm font-semibold text-[#0d0f1c]">Histórico de eventos</h3>
      </div>
      <div className="px-4 py-4">
        {sorted.length === 0 ? (
          <p className="text-sm text-[#90949D]">Nenhum evento registrado.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <div key={group.key}>
                <p className="mb-3 text-sm font-bold text-[#0d0f1c]">
                  {formatLongDate(group.date)}
                </p>
                <div>
                  {group.events.map((event, idx) => {
                    const isLast = idx === group.events.length - 1;
                    const timeStr = format(new Date(event.createdAt), "HH:mm");
                    return (
                      <div key={event.id} className="flex gap-3 min-w-0">
                        {/* Marcador + linha vertical */}
                        <div className="flex flex-col items-center shrink-0 pt-[5px]">
                          <div className="h-2 w-2 rounded-full bg-[#90949D] shrink-0" />
                          {!isLast && (
                            <div className="mt-1 w-px flex-1 bg-border" style={{ minHeight: "1.5rem" }} />
                          )}
                        </div>
                        {/* Conteúdo */}
                        <div className={cn("flex min-w-0 flex-1 items-start justify-between gap-2", !isLast && "pb-4")}>
                          <p className="min-w-0 flex-1 text-sm leading-5 text-[#0d0f1c] break-words">
                            <span className="font-semibold">{event.userName}</span>{" "}
                            {getEventActionText(event)}
                          </p>
                          <span className="shrink-0 pt-0.5 text-xs tabular-nums text-[#5F6572]">
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatFornecedorEndereco(row: Row, supplier: Supplier | null): string {
  const info = row.fornecedorInfo;
  const parts = [
    supplier?.endereco ?? info?.endereco,
    supplier?.cidade ?? info?.cidade,
    supplier?.uf ?? info?.uf,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(", ") : "—";
}

function resolveGeradoEmValue(row: Row): string | undefined {
  if (row.geradoEm?.trim()) return row.geradoEm.trim();
  const fromForma = parseDate(row.formaPagamento?.dataGeracao);
  if (!fromForma) return undefined;
  const d = new Date(fromForma);
  d.setHours(21, 0, 0, 0);
  return d.toISOString();
}

const ASSOCIADO_DOC_DETAIL_LABEL_CLASS =
  "mb-1 block text-sm font-semibold text-[#5F6572]";
const ASSOCIADO_DOC_DETAIL_VALUE_CLASS =
  "mt-1 text-sm font-semibold text-[#0d0f1c]";
const ASSOCIADO_DOC_DETAIL_EMPTY_CLASS = "mt-1 text-sm text-[#90949D]";

function AssociadoDocCopyableField({
  display,
  copyValue,
  ariaLabel,
}: {
  display: string;
  copyValue: string;
  ariaLabel: string;
}) {
  const copy = React.useCallback(async () => {
    const toCopy = (copyValue ?? "").replace(/\D/g, "");
    if (!toCopy) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(toCopy);
      } else {
        const ta = document.createElement("textarea");
        ta.value = toCopy;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("Copiado");
    } catch {
      // ignore
    }
  }, [copyValue]);

  return (
    <span
      className={cn(
        "mt-1 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1",
        ASSOCIADO_DOC_DETAIL_VALUE_CLASS
      )}
    >
      <span className="break-words">{display}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#5F6572]",
          "hover:bg-[#EFF1F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-1"
        )}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
}

function AssociadoDocExpandedDetails({ doc }: { doc: AssociatedDoc }) {
  if (doc.tipo === "NF-e") {
    return (
      <div className="flex flex-col gap-4 text-sm">
        <div>
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Chave de acesso</Label>
          {doc.chaveAcesso ? (
            <AssociadoDocCopyableField
              display={formatAccessKey(doc.chaveAcesso)}
              copyValue={doc.chaveAcesso}
              ariaLabel="Copiar chave de acesso"
            />
          ) : (
            <div className={ASSOCIADO_DOC_DETAIL_EMPTY_CLASS}>Não informado</div>
          )}
        </div>
        <div>
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Data de emissão</Label>
          <div className={doc.data ? ASSOCIADO_DOC_DETAIL_VALUE_CLASS : ASSOCIADO_DOC_DETAIL_EMPTY_CLASS}>
            {doc.data || "Não informado"}
          </div>
        </div>
        <div>
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Forma de pagamento</Label>
          <div
            className={
              doc.formaPagamento
                ? ASSOCIADO_DOC_DETAIL_VALUE_CLASS
                : ASSOCIADO_DOC_DETAIL_EMPTY_CLASS
            }
          >
            {doc.formaPagamento || "Não informado"}
          </div>
        </div>
        <div>
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Valor</Label>
          <div className={ASSOCIADO_DOC_DETAIL_VALUE_CLASS}>
            {doc.valor != null ? formatCurrency(doc.valor) : "—"}
          </div>
        </div>
      </div>
    );
  }

  if (doc.tipo === "Boleto") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="sm:col-span-2">
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Código de barras</Label>
          {doc.codigoBarras ? (
            <AssociadoDocCopyableField
              display={doc.codigoBarras}
              copyValue={doc.codigoBarras}
              ariaLabel="Copiar código de barras"
            />
          ) : (
            <div className={ASSOCIADO_DOC_DETAIL_EMPTY_CLASS}>Não informado</div>
          )}
        </div>
        <div>
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Data de emissão</Label>
          <div className={doc.data ? ASSOCIADO_DOC_DETAIL_VALUE_CLASS : ASSOCIADO_DOC_DETAIL_EMPTY_CLASS}>
            {doc.data || "Não informado"}
          </div>
        </div>
        <div>
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Valor do documento</Label>
          <div className={ASSOCIADO_DOC_DETAIL_VALUE_CLASS}>
            {doc.valor != null ? formatCurrency(doc.valor) : "—"}
          </div>
        </div>
      </div>
    );
  }

  if (doc.tipo === "Comprovante") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Banco</Label>
          <div className={ASSOCIADO_DOC_DETAIL_VALUE_CLASS}>{doc.banco || "—"}</div>
        </div>
        <div>
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Data do pagamento</Label>
          <div className={ASSOCIADO_DOC_DETAIL_VALUE_CLASS}>{doc.data || "—"}</div>
        </div>
        <div>
          <Label className={ASSOCIADO_DOC_DETAIL_LABEL_CLASS}>Valor pago</Label>
          <div className={ASSOCIADO_DOC_DETAIL_VALUE_CLASS}>
            {doc.valor != null ? formatCurrency(doc.valor) : "—"}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

type EmissorDiferenteComparativoData = Extract<DivergenciaComparativo, { tipo: "emissor-diferente" }>;
type DivergenciaPendenciaAlertVariant = "default" | "resolved" | "nao-confiavel";

function getNfeNumeroFromFormaPendencia(row: Row, pendencia: Divergencia): string {
  const [nfeIdx] = pendencia.docIdxsEnvolvidos;
  const nfe = row.documentosAssociados?.[nfeIdx];
  if (nfe?.tipo !== "NF-e") return "—";
  const numero = nfe.numero?.trim();
  return numero || "—";
}

function EmissorDiferenteDescricaoPrimeiraLinha({
  emissorBoleto,
  emissorNfe,
}: {
  emissorBoleto: string;
  emissorNfe: string;
}) {
  return (
    <p className="mb-0">
      O boleto foi emitido por <span className="font-bold text-[#0d0f1c]">{emissorBoleto}</span>, enquanto a
      NF-e está associada a <span className="font-bold text-[#0d0f1c]">{emissorNfe}</span>.
    </p>
  );
}

function EmissorDiferenteInfoTooltip() {
  return (
    <span className="group relative ml-1 inline-flex shrink-0 items-center">
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-[rgba(4,14,35,0.06)]"
        aria-label="Informações sobre divergência entre emissores"
      >
        <Info className="h-4 w-4 text-[#5F6572]" aria-hidden />
      </button>
      <div className="pointer-events-none invisible absolute left-0 top-6 z-50 w-72 rounded-md border border-[#EBECEE] bg-white p-3 opacity-0 shadow-lg transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
        <p className="text-xs leading-relaxed text-[#5F6572]">
          Em alguns casos, boletos são emitidos por bancos, factorings ou financeiras em nome do fornecedor.
          Confirme o vínculo antes de prosseguir.
        </p>
      </div>
    </span>
  );
}

function EmissorDiferentePendenciaAlert({
  comparativo,
  variant,
  sinalizacao,
  onMarcarConfiavel,
  onDispensarAlerta,
}: {
  comparativo: EmissorDiferenteComparativoData;
  variant: DivergenciaPendenciaAlertVariant;
  sinalizacao?: DivergenciaSinalizacao | null;
  onMarcarConfiavel: () => void;
  onDispensarAlerta: () => void;
}) {
  const { emissorNfe, emissorBoleto } = comparativo;
  const isResolved = variant === "resolved";
  const isNaoConfiavel = variant === "nao-confiavel";

  const alertBgClass = isResolved
    ? "bg-[#ECFDF1]"
    : isNaoConfiavel
      ? "bg-[#FFF2E0]"
      : "bg-[#FDEEED]";
  const alertAccentClass = isResolved
    ? "text-[#054318]"
    : isNaoConfiavel
      ? "text-[#853900]"
      : "text-[#8D110C]";

  return (
    <div className={cn("rounded-lg p-4", alertBgClass)} role="status">
      <div className="flex items-center gap-2">
        {isResolved ? (
          <CheckCircle2 className={cn("h-5 w-5 shrink-0", alertAccentClass)} aria-hidden />
        ) : (
          <AlertCircle className={cn("h-5 w-5 shrink-0", alertAccentClass)} aria-hidden />
        )}
        <p className={cn("text-sm font-bold", alertAccentClass)}>
          {isResolved
            ? "Divergência resolvida"
            : "Divergência encontrada: emissor do boleto diferente da NF-e"}
        </p>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-[#5F6572]">
        <EmissorDiferenteDescricaoPrimeiraLinha emissorBoleto={emissorBoleto} emissorNfe={emissorNfe} />
        {!isResolved && (
          <p className="mb-0 flex flex-wrap items-center">
            <span>Verifique se essa divergência é confiável antes de pagar.</span>
            <EmissorDiferenteInfoTooltip />
          </p>
        )}
      </div>
      {isNaoConfiavel && sinalizacao && (
        <p className="mt-4 text-sm leading-relaxed text-[#5F6572]">
          {sinalizacao.userName} sinalizou esta divergência como não confiável em {sinalizacao.date}.
        </p>
      )}
      {isResolved && sinalizacao && (
        <p className="mt-4 text-sm leading-relaxed text-[#5F6572]">
          {sinalizacao.userName} sinalizou esta divergência como confiável em {sinalizacao.date}.
        </p>
      )}
      {variant === "default" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" className="font-bold" onClick={onMarcarConfiavel}>
            Confiar nesta relação
          </Button>
          <Button
            variant="ghost"
            className="font-bold text-[#5F6572] hover:bg-[#EFF1F2] hover:text-[#0d0f1c]"
            onClick={onDispensarAlerta}
          >
            Não confiar nesta relação
          </Button>
        </div>
      )}
    </div>
  );
}

function FormaPagamentoPendenciaAlert({
  nfeNumero,
  cienciaSinalizacao,
  onRegistrarCiencia,
}: {
  nfeNumero: string;
  cienciaSinalizacao: DivergenciaSinalizacao | null;
  onRegistrarCiencia: () => void;
}) {
  const isResolved = Boolean(cienciaSinalizacao);
  const alertBgClass = isResolved ? "bg-[#ECFDF1]" : "bg-[#FDEEED]";
  const alertAccentClass = isResolved ? "text-[#054318]" : "text-[#8D110C]";

  return (
    <div className={cn("rounded-lg p-4", alertBgClass)} role="status">
      <div className="flex items-center gap-2">
        {isResolved ? (
          <CheckCircle2 className={cn("h-5 w-5 shrink-0", alertAccentClass)} aria-hidden />
        ) : (
          <AlertCircle className={cn("h-5 w-5 shrink-0", alertAccentClass)} aria-hidden />
        )}
        <p className={cn("text-sm font-bold", alertAccentClass)}>
          {isResolved
            ? "Divergência resolvida"
            : "Divergência encontrada: forma de pagamento diferente"}
        </p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[#5F6572]">
        A{" "}
        <span className="font-bold text-[#0d0f1c]">NF-e {nfeNumero}</span> associada a esta conta a
        pagar possui outra forma de pagamentos especificada.
      </p>
      {cienciaSinalizacao ? (
        <p className="mt-4 text-sm leading-relaxed text-[#5F6572]">
          {cienciaSinalizacao.userName} sinalizou ciência desta divergência em {cienciaSinalizacao.date}.
        </p>
      ) : (
        <div className="mt-4">
          <Button variant="secondary" className="font-bold" onClick={onRegistrarCiencia}>
            Ciente
          </Button>
        </div>
      )}
    </div>
  );
}

function ValidacaoBoletoAlert({
  boleto,
  onVerBoleto,
  onConfirmar,
  onNegar,
}: {
  boleto: AssociatedDoc;
  onVerBoleto?: () => void;
  onConfirmar: () => void;
  onNegar: () => void;
}) {
  const valorFormatado = boleto.valor != null ? formatCurrency(boleto.valor) : null;
  const emitenteDisplay = boleto.cedente?.trim() || null;
  const vencimentoDisplay = boleto.vencimento?.trim() || null;

  return (
    <div className="rounded-lg p-4 bg-[#FDEEED]" role="status">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0 text-[#8D110C]" aria-hidden />
        <p className="text-sm font-bold text-[#8D110C]">
          Pendência: validação obrigatória de boleto
        </p>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-[#5F6572]">
        <p>
          Encontramos um boleto no valor de{" "}
          <span className="font-bold text-[#0d0f1c]">{valorFormatado ?? "—"}</span>, emitente{" "}
          <span className="font-bold text-[#0d0f1c]">{emitenteDisplay ?? "—"}</span> e data de
          vencimento{" "}
          <span className="font-bold text-[#0d0f1c]">{vencimentoDisplay ?? "—"}</span>.
          {onVerBoleto && (
            <>
              {" "}
              <button
                type="button"
                onClick={onVerBoleto}
                className="font-semibold text-[#0C3CF7] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
              >
                Ver PDF do boleto
              </button>
            </>
          )}
        </p>
        <p className="mt-2">Esse boleto está vinculado a esta conta a pagar?</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" className="font-bold" onClick={onConfirmar}>
          Confirmar vínculo
        </Button>
        <Button
          variant="ghost"
          className="font-bold text-[#5F6572] hover:bg-[#EFF1F2] hover:text-[#0d0f1c]"
          onClick={onNegar}
        >
          Negar vínculo
        </Button>
      </div>
    </div>
  );
}

function PendenciasBlock({
  row,
  pendencias,
  emissorPendencia,
  emissorVariant,
  emissorSinalizacao,
  formaPendencia,
  formaCienciaSinalizacao,
  boletoParaValidacao,
  onMarcarConfiavelEmissor,
  onDispensarEmissor,
  onRegistrarCienciaForma,
  onConfirmarVinculoBoleto,
  onNegarVinculoBoleto,
  onVerBoleto,
}: {
  row: Row;
  pendencias: Divergencia[];
  emissorPendencia: Divergencia | null;
  emissorVariant: DivergenciaPendenciaAlertVariant | null;
  emissorSinalizacao: DivergenciaSinalizacao | null;
  formaPendencia: Divergencia | null;
  formaCienciaSinalizacao: DivergenciaSinalizacao | null;
  boletoParaValidacao?: AssociatedDoc | null;
  onMarcarConfiavelEmissor: () => void;
  onDispensarEmissor: () => void;
  onRegistrarCienciaForma: () => void;
  onConfirmarVinculoBoleto: () => void;
  onNegarVinculoBoleto: () => void;
  onVerBoleto?: () => void;
}) {
  const showEmissorAlert =
    Boolean(emissorPendencia) &&
    emissorVariant != null &&
    emissorVariant !== "resolved";
  const showFormaAlert = Boolean(formaPendencia) && !formaCienciaSinalizacao;
  const showBoletoAlert = Boolean(boletoParaValidacao);

  if (!showEmissorAlert && !showFormaAlert && !showBoletoAlert) {
    return null;
  }

  const emissorComparativo =
    showEmissorAlert && emissorPendencia
      ? getDivergenciaComparativo(row, emissorPendencia)
      : null;
  return (
    <div className="space-y-3 px-4 pt-4">
      {showEmissorAlert &&
        emissorVariant &&
        emissorComparativo?.tipo === "emissor-diferente" && (
          <EmissorDiferentePendenciaAlert
            key="emissor-diferente"
            comparativo={emissorComparativo}
            variant={emissorVariant}
            sinalizacao={emissorSinalizacao}
            onMarcarConfiavel={onMarcarConfiavelEmissor}
            onDispensarAlerta={onDispensarEmissor}
          />
        )}
      {showFormaAlert && formaPendencia && (
        <FormaPagamentoPendenciaAlert
          key="forma-pagamento-divergente"
          nfeNumero={getNfeNumeroFromFormaPendencia(row, formaPendencia)}
          cienciaSinalizacao={formaCienciaSinalizacao}
          onRegistrarCiencia={onRegistrarCienciaForma}
        />
      )}
      {boletoParaValidacao && (
        <ValidacaoBoletoAlert
          key="validacao-boleto"
          boleto={boletoParaValidacao}
          onVerBoleto={onVerBoleto}
          onConfirmar={onConfirmarVinculoBoleto}
          onNegar={onNegarVinculoBoleto}
        />
      )}
    </div>
  );
}
function ContaGeracaoMetadata({ row }: { row: Row }) {
  const [copied, setCopied] = React.useState(false);
  const geracao = formatGeracaoContaDisplay(resolveGeradoEmValue(row));
  const accountId = row.id?.trim() ?? "";
  const hasId = Boolean(accountId);
  const dateLabel = geracao?.date ?? "—";
  const timeSuffix = geracao?.time ? ` (${geracao.time})` : "";

  const copyId = React.useCallback(async () => {
    if (!hasId) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(accountId);
      } else {
        const ta = document.createElement("textarea");
        ta.value = accountId;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success("ID copiado");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [accountId, hasId]);

  return (
    <div className="text-xs text-[#5F6572] flex items-center gap-1.5 flex-wrap justify-end min-w-0 max-w-full">
      <span className="text-right">
        Geração automatica em {dateLabel}
        {timeSuffix} nº {hasId ? accountId : "—"}
      </span>
      {hasId && (
        <button
          type="button"
          onClick={copyId}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              copyId();
            }
          }}
          aria-label="Copiar ID da conta a pagar"
          className={cn(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#5F6572]",
            "hover:bg-[#EFF1F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-1"
          )}
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">{copied ? "ID copiado" : "Copiar ID"}</span>
        </button>
      )}
    </div>
  );
}

function FornecedorFields({ row }: { row: Row }) {
  const supplier = getSupplier(row.cnpjFornecedor);
  const razaoSocial = supplier?.nome ?? row.fornecedor;
  const nomeFantasia =
    supplier?.nome && supplier.nome !== row.fornecedor
      ? row.fornecedor
      : row.fornecedor !== razaoSocial
        ? row.fornecedor
        : "—";

  const fields: Array<{ label: string; value: string }> = [
    { label: "CNPJ", value: displayFornecedorValue(supplier?.cnpj ?? row.cnpjFornecedor) },
    { label: "Razão social", value: displayFornecedorValue(razaoSocial) },
    { label: "Nome fantasia", value: displayFornecedorValue(nomeFantasia === "—" ? "" : nomeFantasia) },
    { label: "Endereço", value: formatFornecedorEndereco(row, supplier) },
    { label: "Telefone", value: displayFornecedorValue(supplier?.telefone ?? row.fornecedorInfo?.contato) },
    { label: "E-mail", value: displayFornecedorValue(supplier?.email ?? row.fornecedorInfo?.email) },
  ];

  return (
    <>
      {fields.map(({ label, value }) => (
        <div key={label}>
          <Label className="mb-1 block text-xs font-medium" style={{ color: "#5F6572" }}>
            {label}
          </Label>
          <div
            className={cn(
              "mt-1 text-sm",
              value === "—" ? "text-[#90949D]" : "text-[#0d0f1c]"
            )}
          >
            {value}
          </div>
        </div>
      ))}
    </>
  );
}

interface PaymentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: Row | null;
  data: Row[];
  setData: React.Dispatch<React.SetStateAction<Row[]>>;
  currentTab: string;
  tabs: Array<{ id: string; label: string }>;
  onOpenDanfe: (doc: AssociatedDoc) => void;
  onOpenBoleto: (doc: AssociatedDoc) => void;
  onOpenComprovante: (doc: AssociatedDoc) => void;
  onOpenNFSe: (doc: AssociatedDoc) => void;
  onOpenCTe: (doc: AssociatedDoc) => void;
  onTabChange?: (tabId: string) => void;
}

function DueDateManualEditInfo({
  meta,
}: {
  meta?: Row["vencimentoEditadoManualMeta"];
}) {
  if (!meta) return null;

  return (
    <p className="mt-1 text-xs leading-4 text-[#5F6572]">
      Data de vencimento editada por {meta.userName} em{" "}
      {formatDueDateManualEditDateTime(meta.editedAt)}
    </p>
  );
}

function DueDateAutoCalculatedInfo({ row }: { row: Row }) {
  const days = getDueDateRuleDays(row);
  
  if (days == null) return null;

  return (
    <p className="mt-1 text-xs leading-4 text-[#5F6572]">
      Data de vencimento calculada para {days} dia{days !== 1 ? "s" : ""} após a
      data de emissão da nota
    </p>
  );
}

export function PaymentDrawer({
  open,
  onOpenChange,
  row,
  data,
  setData,
  currentTab,
  tabs,
  onOpenDanfe,
  onOpenBoleto,
  onOpenComprovante,
  onOpenNFSe,
  onOpenCTe,
  onTabChange,
}: PaymentDrawerProps) {
  const { isFeatureEnabled, getEnabledOrigemTypes } = useFeatures();
  const enabledOrigemTypes = React.useMemo(() => new Set(getEnabledOrigemTypes("gestao-de-pagamentos")), [getEnabledOrigemTypes]);
  const isDocTypeEnabled = React.useCallback((tipo: string) => {
    if (tipo === 'Comprovante' || tipo === 'Boleto') return true;
    return enabledOrigemTypes.has(tipo);
  }, [enabledOrigemTypes]);
  const { tagModel, openAccountTagColor } = useTheme();
  const erpSyncEnabled = isFeatureEnabled("gestao-de-pagamentos.erp-sync");
  const drawerExpandEnabled = isFeatureEnabled("gestao-de-pagamentos.drawer-expand");
  const etapaEnabled = isFeatureEnabled("gestao-de-pagamentos.etapa");
  const aprovacaoTabEnabled = isFeatureEnabled("gestao-de-pagamentos.aprovacao-tab");
  const pagamentoPreferencialTagEnabled = isFeatureEnabled("gestao-de-pagamentos.pagamento-preferencial-tag");
  const isCompact = tagModel === 'compact';
  const [editing, setEditing] = React.useState(false);
  const [vencimentoError, setVencimentoError] = React.useState<string | null>(null);

  // Helper para classes de tag baseado no tema
  const getTagClasses = (bgColor: string, textColor: string, borderColor: string) => {
    return cn(
      isCompact
        ? 'inline-flex items-center h-5 py-[2px] px-2 rounded font-bold leading-4 text-xs'
        : 'inline-flex items-center h-6 px-2 rounded-full border font-medium text-xs',
      bgColor,
      textColor,
      !isCompact && borderColor
    );
  };

  // Helper para classes de tag de "Aberto" baseado na configuração de cor
  const getAbertoTagClasses = () => {
    if (openAccountTagColor === 'orange') {
      return isCompact
        ? 'bg-[#FFD294] text-[#B85600]'
        : 'bg-[#FFD294] text-[#B85600] border-[#FFD294]';
    } else {
      // Azul (padrão)
      return isCompact
        ? 'bg-[#E7EEFF] text-[#0C3CF7]'
        : 'bg-[#E7EEFF] text-[#0C3CF7] border-[#B8CCFF]';
    }
  };
  const [draft, setDraft] = React.useState<Row | null>(null);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const [openLancado, setOpenLancado] = React.useState(false);
  const lancadoRef = React.useRef<HTMLDivElement>(null);
  const lancadoTrigger = React.useRef<HTMLButtonElement>(null);
  const [lancadoMinW, setLancadoMinW] = React.useState<number | undefined>(undefined);

  const paymentMethodRef = React.useRef<HTMLDivElement>(null);
  const paymentContentRef = React.useRef<HTMLDivElement>(null);

  // Estados para os dropdowns de Exportar e Lançar
  const [exportOpen, setExportOpen] = React.useState(false);
  const [lancarOpen, setLancarOpen] = React.useState(false);
  const [launchConfirmationOpen, setLaunchConfirmationOpen] = React.useState(false);
  const [pendingLaunch, setPendingLaunch] = React.useState<{ dest: Row['lancadoEm']; label: string } | null>(null);
  const [replaceBoletoState, setReplaceBoletoState] = React.useState<{
    boletoAtual: AssociatedDoc;
    novoBoleto: AssociatedDoc;
    indexInConferencia: number;
  } | null>(null);
  const [dispensarBoletoState, setDispensarBoletoState] = React.useState<{
    doc: AssociatedDoc;
    indexInConferencia: number;
  } | null>(null);
  const [isUpdatingAfterConfirmBoleto, setIsUpdatingAfterConfirmBoleto] = React.useState(false);

  React.useEffect(() => {
    if (isUpdatingAfterConfirmBoleto) setPaymentOpen(true);
  }, [isUpdatingAfterConfirmBoleto]);

  const { expandedDocs, lastExpandedIdx, toggleExpansion, reset: resetExpansion } = useDocumentExpansion();

  React.useEffect(() => {
    if (row) {
      setDraft({ ...row });
      setEditing(false);
      resetExpansion();
    }
  }, [row, resetExpansion]);

  // Sempre usar a versão mais atual da linha a partir de `data`
  const currentRow = React.useMemo(() => {
    if (!row) return null;
    return data.find((r) => r.id === row.id) ?? row;
  }, [data, row]);
  const userDisplayName = useCurrentUserDisplayName();

  const beginEditing = React.useCallback(() => {
    if (!currentRow) return;
    setDraft({ ...currentRow });
    setEditing(true);
    setVencimentoError(null);
  }, [currentRow]);

  // Resetar estado de edição/expansão quando o drawer fecha
  React.useEffect(() => {
    if (!open) {
      setEditing(false);
      setVencimentoError(null);
      setOpenLancado(false);
      setExportOpen(false);
      setLancarOpen(false);
      setExpanded(false);
      if (row) {
        setDraft({ ...row });
      }
    }
  }, [open, row]);
  const [isTrustedDivergencia, setIsTrustedDivergencia] = React.useState(false);
  const [pendenciasDispensadas, setPendenciasDispensadas] = React.useState<DivergenciaTipo[]>(
    []
  );
  const [formaCienciaSinalizacao, setFormaCienciaSinalizacao] =
    React.useState<DivergenciaSinalizacao | null>(null);
  const [boletoValidacaoConfirmado, setBoletoValidacaoConfirmado] = React.useState(false);
  const previousRowIdRef = React.useRef<string | undefined>(undefined);

  const currentRowId = currentRow?.id;

  React.useEffect(() => {
    if (!currentRowId || !currentRow) {
      setPendenciasDispensadas([]);
      setFormaCienciaSinalizacao(null);
      setBoletoValidacaoConfirmado(false);
      previousRowIdRef.current = undefined;
      return;
    }
    const hasRowChanged = previousRowIdRef.current !== currentRowId;
    setIsTrustedDivergencia(isDivergenciaConfiavel(currentRowId));
    const tipos = getAllDivergencias(currentRow)
      .filter((p) => isPendenciaDispensada(currentRowId, p.tipo))
      .map((p) => p.tipo);
    setPendenciasDispensadas(tipos);
    setFormaCienciaSinalizacao(
      getDivergenciaCienciaSinalizacao(currentRowId, "forma-pagamento-divergente")
    );
    if (hasRowChanged) {
      setBoletoValidacaoConfirmado(false);
    }
    previousRowIdRef.current = currentRowId;
  }, [currentRowId, currentRow]);

  const pendenciasVisiveis = React.useMemo(() => {
    if (!currentRow || isTrustedDivergencia) return [];
    const dispensadas = new Set(pendenciasDispensadas);
    return getAllDivergencias(currentRow).filter((p) => !dispensadas.has(p.tipo));
  }, [currentRow, isTrustedDivergencia, pendenciasDispensadas]);

  const emissorPendencia = React.useMemo(() => {
    if (!currentRow) return null;
    return getAllDivergencias(currentRow).find((p) => p.tipo === "emissor-diferente") ?? null;
  }, [currentRow]);

  const formaPendencia = React.useMemo(() => {
    if (!currentRow) return null;
    return getAllDivergencias(currentRow).find((p) => p.tipo === "forma-pagamento-divergente") ?? null;
  }, [currentRow]);

  const emissorAlertState = React.useMemo((): {
    variant: DivergenciaPendenciaAlertVariant | null;
    sinalizacao: DivergenciaSinalizacao | null;
  } => {
    if (!currentRowId || !emissorPendencia) {
      return { variant: null, sinalizacao: null };
    }

    const fallbackSinalizacao = buildSinalizacaoMeta(userDisplayName);

    if (isTrustedDivergencia) {
      return {
        variant: "resolved",
        sinalizacao:
          getDivergenciaConfiavelSinalizacao(currentRowId) ?? fallbackSinalizacao,
      };
    }

    if (pendenciasDispensadas.includes("emissor-diferente")) {
      return {
        variant: "nao-confiavel",
        sinalizacao:
          getPendenciaDispensadaSinalizacao(currentRowId, "emissor-diferente") ??
          fallbackSinalizacao,
      };
    }

    return { variant: "default", sinalizacao: null };
  }, [
    currentRowId,
    emissorPendencia,
    isTrustedDivergencia,
    pendenciasDispensadas,
    userDisplayName,
  ]);

  const pendenciasSemEmissorEForma = React.useMemo(
    () =>
      pendenciasVisiveis.filter(
        (p) => p.tipo !== "emissor-diferente" && p.tipo !== "forma-pagamento-divergente"
      ),
    [pendenciasVisiveis]
  );

  React.useEffect(() => {
    if (openLancado && lancadoTrigger.current) {
      setLancadoMinW(lancadoTrigger.current.offsetWidth);
    }
  }, [openLancado]);

  React.useEffect(() => {
    function onDocDown(ev: MouseEvent) {
      if (!openLancado) return;
      const t = ev.target as Node | null;
      if (t && lancadoRef.current && !lancadoRef.current.contains(t)) {
        setOpenLancado(false);
      }
    }
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [openLancado]);

  // Scroll automático quando expandir a seção de pagamento
  React.useEffect(() => {
    if (paymentOpen && paymentContentRef.current) {
      setTimeout(() => {
        paymentContentRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [paymentOpen]);

  // Scroll automático quando expandir documentos associados
  React.useEffect(() => {
    if (lastExpandedIdx != null && expandedDocs.has(lastExpandedIdx)) {
      const expandedElement = document.querySelector(`[data-doc-item="${lastExpandedIdx}"]`);
      if (expandedElement) {
        setTimeout(() => {
          expandedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 100);
      }
    }
  }, [lastExpandedIdx, expandedDocs]);

  /** Documentos já associados (apenas nível ALTO ou sem nível), com índice original para expansão. Hook antes do early return. */
  const documentosAssociadosAlto = React.useMemo(() => {
    const docs = currentRow?.documentosAssociados ?? [];
    return docs
      .map((d, i) => ({ doc: d, originalIndex: i }))
      .filter(({ doc }) => doc.nivelAssociacao === 'ALTO' || doc.nivelAssociacao === undefined)
      .filter(({ doc }) => isDocTypeEnabled(doc.tipo));
  }, [currentRow?.documentosAssociados, isDocTypeEnabled]);

  if (!currentRow) return null;

  /** Documentos para conferência (máx. 2 exibidos na UI) */
  const documentosParaConferenciaList = (currentRow.documentosParaConferencia ?? [])
    .filter((d) => isDocTypeEnabled(d.tipo));

  const hasActiveDivergenciaPendencia =
    pendenciasVisiveis.length > 0 && !(documentosParaConferenciaList.length);
  const divergeIdxs = hasActiveDivergenciaPendencia
    ? new Set(pendenciasVisiveis.flatMap((p) => p.docIdxsEnvolvidos))
    : new Set<number>();
  /** Boleto associado ao pagamento (usado para código de barras e favorecido no meio de pagamento) */
  const boletoPagamento = currentRow?.documentosAssociados?.find((d) => d.tipo === 'Boleto');
  const codigoBarrasPagamento = boletoPagamento?.codigoBarras ?? '';

  /**
   * Boleto explicitamente marcado como pendente de validação manual (nivelAssociacao MEDIO ou BAIXO).
   * Apenas esses boletos ativam o bloco "Pendência: validação obrigatória de boleto".
   * Boletos ALTO (já confirmados) ou sem nivelAssociacao não ativam este alerta.
   */
  const boletoPendente = currentRow?.documentosAssociados?.find(
    (d) => d.tipo === 'Boleto' && (d.nivelAssociacao === 'MEDIO' || d.nivelAssociacao === 'BAIXO')
  );
  const boletoValidacaoPendente = Boolean(boletoPendente) && !boletoValidacaoConfirmado;
  const documentosAssociadosVisiveis = boletoValidacaoPendente
    ? documentosAssociadosAlto.filter(({ doc }) => doc !== boletoPendente)
    : documentosAssociadosAlto;

  const handleConfirmarAssociacao = (doc: AssociatedDoc, indexInConferencia: number, replaceExistingBoleto?: boolean) => {
    if (!currentRow) return;
    const added: AssociatedDoc = { ...doc, nivelAssociacao: 'ALTO', associacao: 'Automática' };
    setData(prev => prev.map(r => {
      if (r.id !== currentRow.id) return r;
      const novaConferencia = (r.documentosParaConferencia ?? []).filter((_, i) => i !== indexInConferencia);
      const associadosAtuais = r.documentosAssociados ?? [];
      const baseAssociados = replaceExistingBoleto
        ? associadosAtuais.filter((d) => d.tipo !== 'Boleto')
        : associadosAtuais;
      const novosAssociados = [...baseAssociados, added];
      return { ...r, documentosAssociados: novosAssociados, documentosParaConferencia: novaConferencia };
    }));
    toast.success('Documento associado ao pagamento.');
  };

  const executeConfirmarBoleto = (doc: AssociatedDoc, indexInConferencia: number, replaceExistingBoleto?: boolean) => {
    setIsUpdatingAfterConfirmBoleto(true);
    handleConfirmarAssociacao(doc, indexInConferencia, replaceExistingBoleto);
    setTimeout(() => setIsUpdatingAfterConfirmBoleto(false), 1200);
  };

  const handleConfirmarDocumentoClick = (doc: AssociatedDoc, indexInConferencia: number) => {
    const boletoAssociado = documentosAssociadosAlto.find(({ doc: d }) => d.tipo === 'Boleto')?.doc;
    if (boletoAssociado) {
      setReplaceBoletoState({ boletoAtual: boletoAssociado, novoBoleto: doc, indexInConferencia });
    } else {
      executeConfirmarBoleto(doc, indexInConferencia);
    }
  };

  const handleDescartarSugestao = (indexInConferencia: number) => {
    if (!currentRow) return;
    setData(prev => prev.map(r => {
      if (r.id !== currentRow.id) return r;
      const novaConferencia = (r.documentosParaConferencia ?? []).filter((_, i) => i !== indexInConferencia);
      return { ...r, documentosParaConferencia: novaConferencia };
    }));
    toast.success('Sugestão descartada.');
  };

  const handleDispensarDocumentoClick = (doc: AssociatedDoc, indexInConferencia: number) => {
    setDispensarBoletoState({ doc, indexInConferencia });
  };

  const handleSave = () => {
    if (!draft || !currentRow) return;
    const nextVencimento = draft.vencimento.trim();
    const vencimentoChanged = nextVencimento !== currentRow.vencimento;

    if (vencimentoChanged) {
      const validation = validateManualDueDate(nextVencimento);
      if (!validation.ok) {
        setVencimentoError(validation.message || "Data inválida");
        return;
      }
    }

    const vencimentoEditMeta = vencimentoChanged
      ? createDueDateManualEditMeta()
      : currentRow.vencimentoEditadoManualMeta;

    const hasChanges = (
      draft.lancadoEm !== currentRow.lancadoEm ||
      vencimentoChanged ||
      draft.ordemCompra !== currentRow.ordemCompra ||
      draft.parcela !== currentRow.parcela ||
      draft.centroCusto !== currentRow.centroCusto ||
      draft.observacoes !== currentRow.observacoes
    );
    if (!hasChanges) { setEditing(false); return; }

    if (vencimentoChanged && vencimentoEditMeta) {
      saveManualDueDateEdit(currentRow.id, nextVencimento, vencimentoEditMeta);
    }
    
    setData(prev => prev.map(r => r.id === currentRow.id ? ({
      ...r,
      lancadoEm: draft.lancadoEm,
      vencimento: nextVencimento,
      ...(vencimentoChanged
        ? {
            vencimentoEditadoManual: true,
            vencimentoEditadoManualMeta: vencimentoEditMeta,
          }
        : {}),
      ordemCompra: draft.ordemCompra,
      parcela: draft.parcela,
      centroCusto: draft.centroCusto,
      observacoes: draft.observacoes,
    }) : r));
    setEditing(false);
    setVencimentoError(null);
  };

  const executeLaunch = (dest: Row['lancadoEm'], label: string) => {
    if (!currentRow) return;
    
    setData(prev => prev.map(r => {
      if (r.id !== currentRow.id) return r;
      
      // Atualiza etapasVisitadas
      const currentVisitedStages = r.etapasVisitadas ?? [];
      const originStage = r.lancadoEm;
      const destStage = dest;
      
      // Adiciona a etapa de origem se não estiver no histórico
      let updatedVisitedStages = [...currentVisitedStages];
      if (!updatedVisitedStages.includes(originStage)) {
        updatedVisitedStages.push(originStage);
      }
      
      // Adiciona a etapa de destino se não estiver no histórico
      if (!updatedVisitedStages.includes(destStage)) {
        updatedVisitedStages.push(destStage);
      }
      
      let updated: Row = { ...r, lancadoEm: dest, etapasVisitadas: updatedVisitedStages as any };
      
      // Se o destino for aprovação, adiciona dados de aprovação
      if (dest === 'aprovacao') {
        const aprovador = getRandomApprover();
        updated.aprovacao = {
          aprovador: aprovador.nome,
          emailAprovador: aprovador.email,
          statusAprovacao: 'Pendente',
          dataEnvio: new Date().toLocaleDateString('pt-BR'),
        };
      }
      
      if (dest === 'cancelados') {
        updated.status = 'Cancelado';
      }
      if (dest === 'liquidados') {
        updated.status = 'Pago';
      }
      return updated;
    }));
    toast.success(`Pagamento lançado em ${label}`);
    setLancarOpen(false);
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange} modal={!drawerExpandEnabled}>
      <SheetContent
        className={cn(
          "focus:outline-none focus-visible:outline-none transition-[width] duration-200 ease-in-out",
          drawerExpandEnabled && expanded 
            ? "w-screen rounded-none max-w-none" 
            : drawerExpandEnabled
            ? "w-[640px]"
            : "w-[calc(100vw-256px-16px)] max-w-[calc(100vw-256px-16px)]"
        )}
        onInteractOutside={(e) => {
          const t = (e.target as HTMLElement) || (e as any)?.detail?.originalEvent?.target as HTMLElement;
          if (t && (
            t.closest('[data-detail-trigger="true"]') ||
            t.closest('[data-danfe-modal]') || 
            t.closest('[data-danfe-overlay]') ||
            t.closest('[data-comprovante-modal]') || 
            t.closest('[data-comprovante-overlay]') ||
            t.closest('[data-boleto-modal]') || 
            t.closest('[data-boleto-overlay]') ||
            t.closest('[data-nfse-modal]') || 
            t.closest('[data-nfse-overlay]') ||
            t.closest('[data-cte-modal]') || 
            t.closest('[data-cte-overlay]') ||
            t.closest('[data-filter-trigger]') ||
            t.matches('input[type="checkbox"]') || 
            t.closest('input[type="checkbox"]')
          )) {
            e.preventDefault();
          }
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <div className="flex items-center gap-2 min-w-0">
            <SheetTitle className="truncate text-[20px] font-bold">{currentRow.fornecedor}</SheetTitle>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {editing && (
              <>
                <Button variant="ghost" onClick={() => { setDraft(currentRow); setEditing(false); }}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar alterações</Button>
              </>
            )}
            {drawerExpandEnabled && (
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label={expanded ? "Recolher drawer" : "Expandir drawer"}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Barra de ações - Exportar e Lançar */}
        {!editing && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 pt-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
            <DropdownMenu modal={false} open={exportOpen} onOpenChange={setExportOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]">
                  <Upload className="h-4 w-4" />
                  Exportar
                  <ChevronDown className={["h-4 w-4 transition-transform", exportOpen ? "rotate-180" : ""].join(" ")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => {
                  toast.success('Exportando pagamento...');
                  setExportOpen(false);
                }}>
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toast.success('Exportando pagamento...');
                  setExportOpen(false);
                }}>
                  XLSX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentRow.lancadoEm !== 'liquidados' && currentRow.lancadoEm !== 'cancelados' && (
              <DropdownMenu modal={false} open={lancarOpen} onOpenChange={setLancarOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]">
                    <PlusCircle className="h-4 w-4" />
                    Lançar
                    <ChevronDown className={["h-4 w-4 transition-transform", lancarOpen ? "rotate-180" : ""].join(" ")} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {tabs
                    .filter(
                      (t) =>
                        t.id !== currentRow.lancadoEm &&
                        (t.id !== "pagar" || !aprovacaoTabEnabled) &&
                        (t.id !== "aprovacao" || aprovacaoTabEnabled)
                    )
                    .map((t) => (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => {
                          const dest = t.id as Row["lancadoEm"];

                          // Se for de "conferir" para "pagar", mostrar modal de confirmação
                          if (currentRow.lancadoEm === "conferir" && dest === "pagar") {
                            setPendingLaunch({ dest, label: t.label });
                            setLaunchConfirmationOpen(true);
                            setLancarOpen(false);
                            return;
                          }

                          // Se for de "conferir" para "aprovacao" e não houver alerta de divergência, mostrar modal de confirmação
                          if (
                            currentRow.lancadoEm === "conferir" &&
                            dest === "aprovacao" &&
                            !hasActiveDivergenciaPendencia
                          ) {
                            setPendingLaunch({ dest, label: t.label });
                            setLaunchConfirmationOpen(true);
                            setLancarOpen(false);
                            return;
                          }

                          // Caso contrário, executar diretamente
                          executeLaunch(dest, t.label);
                        }}
                      >
                        Em {t.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            </div>
            <ContaGeracaoMetadata row={currentRow} />
          </div>
        )}

        <PendenciasBlock
          row={currentRow}
          pendencias={pendenciasSemEmissorEForma}
          emissorPendencia={emissorPendencia}
          emissorVariant={emissorAlertState.variant}
          emissorSinalizacao={emissorAlertState.sinalizacao}
          formaPendencia={formaPendencia}
          formaCienciaSinalizacao={formaCienciaSinalizacao}
          boletoParaValidacao={boletoValidacaoConfirmado ? null : (boletoPendente ?? null)}
          onMarcarConfiavelEmissor={() => {
            const meta = buildSinalizacaoMeta(userDisplayName);
            markDivergenciaConfiavel(currentRow.id, meta);
            setIsTrustedDivergencia(true);
            toast.success("Marcado como confiável");
          }}
          onDispensarEmissor={() => {
            const meta = buildSinalizacaoMeta(userDisplayName);
            markPendenciaDispensada(currentRow.id, "emissor-diferente", meta);
            setPendenciasDispensadas((prev) =>
              prev.includes("emissor-diferente") ? prev : [...prev, "emissor-diferente"]
            );
            toast.success("Pendência dispensada");
          }}
          onRegistrarCienciaForma={() => {
            const meta = buildSinalizacaoMeta(userDisplayName);
            markDivergenciaCiencia(currentRow.id, "forma-pagamento-divergente", meta);
            setFormaCienciaSinalizacao(meta);
            toast.success("Ciência registrada");
          }}
          onConfirmarVinculoBoleto={() => {
            if (!boletoPendente) return;

            const novoEvento: RowEvent = {
              id: `ev-boleto-confirmed-${currentRow.id}-${Date.now()}`,
              type: "boleto_link_confirmed",
              userName: userDisplayName,
              createdAt: new Date().toISOString(),
            };

            // Promove o boleto pendente (MEDIO/BAIXO) para ALTO e registra evento no histórico.
            setData((prev) =>
              prev.map((r) => {
                if (r.id !== currentRow.id) return r;
                const novosAssociados = (r.documentosAssociados ?? []).map((d) =>
                  d.tipo === "Boleto" &&
                  (d.nivelAssociacao === "MEDIO" || d.nivelAssociacao === "BAIXO")
                    ? { ...d, nivelAssociacao: "ALTO" as const, associacao: "Manual" as const }
                    : d
                );
                return {
                  ...r,
                  documentosAssociados: novosAssociados,
                  eventHistory: [...(r.eventHistory ?? []), novoEvento],
                };
              })
            );

            setBoletoValidacaoConfirmado(true);
            toast.success("Vínculo do boleto confirmado com sucesso.");
          }}
          onNegarVinculoBoleto={() => {
            const novoEvento: RowEvent = {
              id: `ev-boleto-rejected-${currentRow.id}-${Date.now()}`,
              type: "boleto_link_rejected",
              userName: userDisplayName,
              createdAt: new Date().toISOString(),
            };

            setData((prev) =>
              prev.map((r) => {
                if (r.id !== currentRow.id) return r;
                return {
                  ...r,
                  eventHistory: [...(r.eventHistory ?? []), novoEvento],
                };
              })
            );

            setBoletoValidacaoConfirmado(true);
            toast.success("Vínculo negado com sucesso.");
          }}
          onVerBoleto={boletoPendente ? () => onOpenBoleto(boletoPendente) : undefined}
        />
        <div className={cn("p-4 text-sm", (!drawerExpandEnabled || (drawerExpandEnabled && expanded)) ? "grid grid-cols-2 gap-x-4" : "space-y-4")}>
          {/* Seção Pagamento - Primeira (não expandido) */}
          {drawerExpandEnabled && !expanded && (
            <div className="rounded-lg border border-border bg-white">
            <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
              <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Pagamento</h3>
              {!editing && (
                <Button 
                  size="default" 
                  variant="ghost" 
                  className="inline-flex items-center gap-2 font-bold hover:bg-[#EFF1F2] cursor-pointer"
                  onClick={beginEditing}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Editar
                </Button>
              )}
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Lançado em</Label>
                {editing ? (
                  <div ref={lancadoRef} className="relative mt-1">
                    <Button
                      ref={lancadoTrigger}
                      variant="outline"
                      onClick={() => setOpenLancado(v => !v)}
                      className={[
                        'w-full justify-between h-9',
                        draft?.lancadoEm ? 'text-[#0d0f1c]' : 'text-[#90949D]'
                      ].join(' ')}
                    >
                      {tabs.find(t => t.id === draft?.lancadoEm)?.label ?? 'Selecione'}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    {openLancado && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
                        <div className="p-1">
                          {tabs.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                              onClick={() => {
                                setDraft(prev => prev ? ({ ...prev, lancadoEm: t.id as Row['lancadoEm'] }) : prev);
                                setOpenLancado(false);
                              }}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={"mt-1 " + (tabs.find(t => t.id === currentRow.lancadoEm)?.label ? "text-[#0d0f1c]" : "text-[#90949D]")}>
                    {tabs.find(t => t.id === currentRow.lancadoEm)?.label ?? 'Não informado'}
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Status</Label>
                <div className="mt-1">
                  <span className={cn(
                    isCompact
                      ? 'inline-flex items-center h-5 py-[2px] px-2 rounded font-bold leading-4 text-xs'
                      : 'inline-flex items-center h-6 px-2 rounded-full border font-medium text-xs',
                    currentRow.status === 'Aberto' 
                      ? getAbertoTagClasses()
                      : currentRow.status === 'Pago' 
                      ? isCompact
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : currentRow.status === 'Vencido' 
                      ? isCompact
                        ? 'bg-red-50 text-red-700'
                        : 'bg-red-50 text-red-700 border-red-200'
                      : currentRow.status === 'Cancelado' 
                      ? isCompact
                        ? 'bg-gray-50 text-gray-700'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                      : isCompact
                        ? 'bg-gray-50 text-gray-700'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                  )}>
                    {currentRow.status}
                  </span>
                </div>
              </div>

              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Vencimento</Label>
                {editing ? (
                  <>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="dd/mm/aaaa"
                      value={draft?.vencimento || ''}
                      onChange={(e) => {
                        const formatted = formatDueDateInput(e.target.value);
                        setDraft(prev => prev ? ({ ...prev, vencimento: formatted }) : prev);
                        
                        // Validar em tempo real e limpar erro se estiver válido
                        if (formatted.trim()) {
                          const validation = validateManualDueDate(formatted.trim());
                          if (validation.ok) {
                            setVencimentoError(null);
                          }
                        }
                      }}
                      className={`mt-1 h-9 ${vencimentoError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {vencimentoError && (
                      <p className="mt-1 text-sm text-destructive">{vencimentoError}</p>
                    )}
                  </>
                ) : (
                  <div className="mt-1 text-[#0d0f1c]">{currentRow.vencimento}</div>
                )}
                {!editing && currentRow.vencimentoEditadoManual && (
                  <DueDateManualEditInfo meta={currentRow.vencimentoEditadoManualMeta} />
                )}
                {!editing && !currentRow.vencimentoEditadoManual && (
                  <DueDateAutoCalculatedInfo row={currentRow} />
                )}
              </div>

              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Total a pagar</Label>
                {editing ? (
                  <Input
                    type="text"
                    value={draft?.valor?.toString() || ''}
                    onChange={(e) => setDraft(prev => prev ? ({ ...prev, valor: parseFloat(e.target.value) || 0 }) : prev)}
                    className="mt-1 h-9"
                  />
                ) : (
                  <div className="mt-1 text-[#0d0f1c]">{currentRow.valor}</div>
                )}
              </div>

              {erpSyncEnabled && (
                <div>
                  <div className="flex items-center gap-1">
                    <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Ordem de compra</Label>
                    <span className={getTagClasses('bg-amber-50', 'text-amber-700', 'border-amber-200')}>
                      ERP
                    </span>
                  </div>
                  {editing ? (
                    <Input
                      type="text"
                      value={draft?.ordemCompra || ''}
                      onChange={(e) => setDraft(prev => prev ? ({ ...prev, ordemCompra: e.target.value }) : prev)}
                      className="mt-1 h-9"
                    />
                  ) : (
                    <div className="mt-1 text-[#0d0f1c]">{currentRow.ordemCompra}</div>
                  )}
                </div>
              )}

              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Parcela</Label>
                {editing ? (
                  <Input
                    type="text"
                    value={draft?.parcela || ''}
                    onChange={(e) => setDraft(prev => prev ? ({ ...prev, parcela: e.target.value }) : prev)}
                    className="mt-1 h-9"
                  />
                ) : (
                  <div className={"mt-1 " + (currentRow.parcela ? "text-[#0d0f1c]" : "text-[#90949D]")}>
                    {currentRow.parcela || 'Não informado'}
                  </div>
                )}
              </div>

              {erpSyncEnabled && (
                <div>
                  <div className="flex items-center gap-1">
                    <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Centro de custo</Label>
                    <span className={getTagClasses('bg-amber-50', 'text-amber-700', 'border-amber-200')}>
                      ERP
                    </span>
                  </div>
                  {editing ? (
                    <Input
                      type="text"
                      value={draft?.centroCusto || ''}
                      onChange={(e) => setDraft(prev => prev ? ({ ...prev, centroCusto: e.target.value }) : prev)}
                      className="mt-1 h-9"
                    />
                  ) : (
                    <div className="mt-1 text-[#0d0f1c]">{currentRow.centroCusto}</div>
                  )}
                </div>
              )}

              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Label className="text-sm font-semibold" style={{ color: '#5F6572' }}>Observações</Label>
                </div>
                {editing ? (
                  <textarea
                    value={draft?.observacoes || ''}
                    onChange={(e) => setDraft(prev => prev ? ({ ...prev, observacoes: e.target.value }) : prev)}
                    className="w-full min-h-[80px] mt-1 p-2 border rounded-md text-sm"
                    placeholder="Digite as observações..."
                  />
                ) : (
                  <div className={"mt-1 " + (currentRow.observacoes ? "text-[#0d0f1c]" : "text-[#90949D]")}>
                    {currentRow.observacoes || 'Não informado'}
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Coluna Esquerda quando expandido */}
          {(!drawerExpandEnabled || (drawerExpandEnabled && expanded)) && (
            <div className="space-y-4">
              {/* Seção Pagamento - Primeira */}
              <div className="rounded-lg border border-border bg-white">
            <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
              <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Pagamento</h3>
              {!editing && (
                <Button 
                  size="default" 
                  variant="ghost" 
                  className="inline-flex items-center gap-2 font-bold hover:bg-[#EFF1F2] cursor-pointer"
                  onClick={beginEditing}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Editar
                </Button>
              )}
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Lançado em</Label>
                {editing ? (
                  <div ref={lancadoRef} className="relative mt-1">
                    <Button
                      ref={lancadoTrigger}
                      variant="outline"
                      onClick={() => setOpenLancado(v => !v)}
                      className={[
                        "w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold",
                        "hover:bg-[#EFF1F2]",
                        openLancado ? "bg-[#EFF1F2]" : "",
                      ].join(" ")}
                    >
                      <span className="t-text-sm truncate">{tabs.find(t => t.id === draft?.lancadoEm)?.label ?? 'Não informado'}</span>
                      <ChevronDown className={["h-4 w-4 transition-transform", openLancado ? "rotate-180" : ""].join(" ")} />
                    </Button>
                    {openLancado && (
                      <div
                        className="absolute left-0 z-[100] mt-1 rounded-md border border-border bg-white p-1 shadow-md"
                        style={{ minWidth: lancadoMinW }}
                      >
                        {tabs.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-[#EFF1F2]"
                            onClick={() => { setDraft(d => d ? { ...d, lancadoEm: t.id as Row['lancadoEm'] } : d); setOpenLancado(false); }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={"mt-1 " + (tabs.find(t => t.id === currentRow.lancadoEm)?.label ? "text-[#0d0f1c]" : "text-[#90949D]")}>
                    {tabs.find(t => t.id === currentRow.lancadoEm)?.label ?? 'Não informado'}
                  </div>
                )}
              </div>
              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Status</Label>
                <div className="mt-1">
                  <span className={cn(
                    currentRow.status === 'Pago' 
                      ? getTagClasses('bg-emerald-50', 'text-emerald-700', 'border-emerald-200')
                      : currentRow.status === 'Vencido' 
                      ? getTagClasses('bg-red-50', 'text-red-700', 'border-red-200')
                      : currentRow.status === 'Aberto' 
                      ? (openAccountTagColor === 'orange'
                          ? getTagClasses('bg-[#FFD294]', 'text-[#B85600]', 'border-[#FFD294]')
                          : getTagClasses('bg-[#E7EEFF]', 'text-[#0C3CF7]', 'border-[#B8CCFF]'))
                      : getTagClasses('bg-gray-100', 'text-gray-600', 'border-gray-200')
                  )}>
                    {currentRow.status || '—'}
                  </span>
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Vencimento</Label>
                {editing ? (
                  <>
                    <Input
                      className={`mt-1 shadow-none ${vencimentoError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="dd/mm/aaaa"
                      value={draft?.vencimento ?? ''}
                      onChange={(e) => {
                        const formatted = formatDueDateInput(e.target.value);
                        setDraft(d => d ? { ...d, vencimento: formatted } : d);
                        
                        // Validar em tempo real e limpar erro se estiver válido
                        if (formatted.trim()) {
                          const validation = validateManualDueDate(formatted.trim());
                          if (validation.ok) {
                            setVencimentoError(null);
                          }
                        }
                      }}
                    />
                    {vencimentoError && (
                      <p className="mt-1 text-sm text-destructive">{vencimentoError}</p>
                    )}
                  </>
                ) : (
                  <div className={"mt-1 " + (currentRow.vencimento ? "text-[#0d0f1c]" : "text-[#90949D]")}>{currentRow.vencimento || 'Não informado'}</div>
                )}
                {!editing && currentRow.vencimentoEditadoManual && (
                  <DueDateManualEditInfo meta={currentRow.vencimentoEditadoManualMeta} />
                )}
                {!editing && !currentRow.vencimentoEditadoManual && (
                  <DueDateAutoCalculatedInfo row={currentRow} />
                )}
              </div>
              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Total a pagar</Label>
                <div className="mt-1 text-[#0d0f1c] font-semibold">{formatCurrency(currentRow.valor)}</div>
              </div>
              {erpSyncEnabled && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-sm font-semibold" style={{ color: '#5F6572' }}>Ordem de compra</Label>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-300">ERP</span>
                  </div>
                  {editing ? (
                    <Input className="mt-1 shadow-none" value={draft?.ordemCompra ?? ''} onChange={(e) => setDraft(d => d ? { ...d, ordemCompra: e.target.value } : d)} />
                  ) : (
                    <div className={"mt-1 " + (currentRow.ordemCompra ? "text-[#0d0f1c]" : "text-[#90949D]")}>{currentRow.ordemCompra || 'Não informado'}</div>
                  )}
                </div>
              )}
              <div>
                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Parcela</Label>
                {editing ? (
                  <Input className="mt-1 shadow-none" value={draft?.parcela ?? ''} onChange={(e) => setDraft(d => d ? { ...d, parcela: e.target.value } : d)} />
                ) : (
                  <div className={"mt-1 " + (currentRow.parcela ? "text-[#0d0f1c]" : "text-[#90949D]")}>{currentRow.parcela || 'Não informado'}</div>
                )}
              </div>
              {erpSyncEnabled && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-sm font-semibold" style={{ color: '#5F6572' }}>Centro de custo</Label>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-300">ERP</span>
                  </div>
                  {editing ? (
                    <Input className="mt-1 shadow-none" value={draft?.centroCusto ?? ''} onChange={(e) => setDraft(d => d ? { ...d, centroCusto: e.target.value } : d)} />
                  ) : (
                    <div className={"mt-1 " + (currentRow.centroCusto ? "text-[#0d0f1c]" : "text-[#90949D]")}>{currentRow.centroCusto || 'Não informado'}</div>
                  )}
                </div>
              )}
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Label className="text-sm font-semibold" style={{ color: '#5F6572' }}>Observações</Label>
                  {erpSyncEnabled && currentRow.observacoes && currentRow.observacoes.startsWith('[ERP]') && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-300">ERP</span>
                  )}
                </div>
                {editing ? (
                  <textarea
                    className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-white p-2 text-sm shadow-none"
                    value={draft?.observacoes ?? ''}
                    onChange={(e) => setDraft(d => d ? { ...d, observacoes: e.target.value } : d)}
                  />
                ) : (
                  <div className={"mt-1 whitespace-pre-wrap " + (currentRow.observacoes ? "text-[#0d0f1c]" : "text-[#90949D]")}>
                    {currentRow.observacoes 
                      ? (erpSyncEnabled ? currentRow.observacoes.replace(/^\[ERP\]\s*/, '') : currentRow.observacoes)
                      : 'Não informado'}
                  </div>
                )}
              </div>
            </div>
          </div>

              {/* Seção Forma de pagamento */}
              <div className="rounded-lg border border-border bg-white">
                <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
                  <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Forma de pagamento</h3>
                </div>
                <div className="p-2">
                  <div
                    role="button"
                    aria-expanded={paymentOpen}
                    onClick={() => setPaymentOpen(v => !v)}
                    className="w-full flex items-center gap-3 rounded-md hover:bg-[#FAFAFF] px-3 py-3 cursor-pointer"
                  >
                    <Barcode className="h-4 w-4 text-[#5F6572]" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-[#0d0f1c] truncate">Boleto</span>
                        {pagamentoPreferencialTagEnabled && (
                          <span className={getTagClasses('bg-emerald-50', 'text-emerald-700', 'border-emerald-200')}>
                            Pagamento preferencial
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={["h-4 w-4 transition-transform", paymentOpen ? "rotate-180" : ""].join(" ")} />
                  </div>
                  {paymentOpen && (
                    <div className="px-4 pt-3 pb-3" ref={paymentContentRef}>
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        {isUpdatingAfterConfirmBoleto ? (
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Código de barras</Label>
                              <div className="space-y-1.5">
                                <div className="h-4 bg-gray-200/80 rounded animate-pulse w-full max-w-[280px]" />
                                <div className="h-4 bg-gray-200/80 rounded animate-pulse w-full max-w-[120px]" />
                              </div>
                            </div>
                            <div>
                              <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Favorecido</Label>
                              <div className="h-4 bg-gray-200/80 rounded animate-pulse w-full max-w-[200px]" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Código de barras</Label>
                                <div className="break-words">
                                  {codigoBarrasPagamento ? (
                                    <CopyableNumber
                                      value={codigoBarrasPagamento}
                                      ariaLabel="Copiar código de barras"
                                    />
                                  ) : (
                                    <span className="text-[#90949D]">Nenhum boleto associado</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Favorecido</Label>
                                <div className="text-[#0d0f1c]">{boletoPagamento?.cedente ?? getSupplier(currentRow.cnpjFornecedor)?.pagamentoPreferencial?.favorecido ?? currentRow.fornecedor}</div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-[#5F6572]">Essa forma é definida no cadastro do fornecedor.</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção Documentos */}
              <div className="rounded-lg border border-border bg-white">
                <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
                  <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Documentos associados</h3>
                  <Button 
                    size="default" 
                    variant="ghost" 
                    className="inline-flex items-center gap-2 font-bold hover:bg-[#EFF1F2] cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      // Placeholder - funcionalidade será implementada futuramente
                    }}
                  >
                    <FilePlus2 className="h-4 w-4" aria-hidden />
                    Associar documento
                  </Button>
                </div>
                <div className="p-4">
                    {isUpdatingAfterConfirmBoleto ? (
                      <ul className="divide-y space-y-0">
                        {[1, 2, 3].map((i) => (
                          <li key={i} className="flex items-center gap-3 py-3">
                            <div className="h-5 w-5 rounded bg-gray-200 animate-pulse shrink-0" />
                            <div className="flex-1 space-y-1">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                              <div className="h-3 bg-gray-200/80 rounded animate-pulse w-16" />
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : documentosAssociadosVisiveis.length > 0 ? (
                      <ul className="divide-y">
                        {documentosAssociadosVisiveis.map(({ doc: d, originalIndex }) => {
                          const Icon = d.tipo === 'Comprovante' ? Receipt : d.tipo === 'NF-e' ? Box : d.tipo === 'NFS-e' ? Briefcase : d.tipo === 'CT-e' ? Truck : Barcode;
                          const isOpen = expandedDocs.has(originalIndex);
                          const label = `${d.tipo} ${d.numero ? `#${d.numero}` : ''}`.trim();
                          const isDivergenteDoc = divergeIdxs.has(originalIndex);
                          return (
                            <li key={originalIndex} className="py-1" data-doc-item={originalIndex}>
                              <div className="flex w-full items-center gap-3 p-2">
                                <Icon className="h-5 w-5 shrink-0 text-[#5F6572]" aria-hidden />
                                <div className="min-w-0 flex-1">
                                  <div className="flex min-w-0 items-center gap-2">
                                    {isDivergenteDoc && (
                                      <span
                                        className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-600/70"
                                        aria-label="Documento com divergência"
                                        title="Documento com divergência"
                                      />
                                    )}
                                    <span className="truncate text-sm font-semibold text-[#0d0f1c]">
                                      {label}
                                    </span>
                                  </div>
                                  <div className="mt-0.5 text-xs text-[#5F6572]">
                                    <span
                                      className={cn(
                                        getTagClasses(
                                          d.associacao === "Automática"
                                            ? "bg-blue-50"
                                            : "bg-gray-50",
                                          d.associacao === "Automática"
                                            ? "text-blue-700"
                                            : "text-[#5F6572]",
                                          d.associacao === "Automática"
                                            ? "border-blue-200"
                                            : "border-gray-200"
                                        )
                                      )}
                                    >
                                      {d.associacao}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="shrink-0"
                                  onClick={() => {
                                    if (d.tipo === "NF-e") onOpenDanfe(d);
                                    else if (d.tipo === "Boleto") onOpenBoleto(d);
                                    else if (d.tipo === "Comprovante") onOpenComprovante(d);
                                    else if (d.tipo === "NFS-e") onOpenNFSe(d);
                                    else if (d.tipo === "CT-e") onOpenCTe(d);
                                  }}
                                >
                                  {getAssociatedDocViewLabel(d.tipo)}
                                </Button>
                                <button
                                  type="button"
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#5F6572] transition-colors hover:bg-[#EFF1F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-1"
                                  aria-expanded={isOpen}
                                  aria-label={isOpen ? "Recolher detalhes do documento" : "Expandir detalhes do documento"}
                                  onClick={() => toggleExpansion(originalIndex)}
                                >
                                  <ChevronDown
                                    className={cn(
                                      "h-4 w-4 transition-transform",
                                      isOpen && "rotate-180"
                                    )}
                                  />
                                </button>
                              </div>
                              {isOpen && (
                                <div className="px-3 pb-3 pt-1">
                                  <AssociadoDocExpandedDetails doc={d} />
                                  {d.vinculoAutomatico && (
                                    <p className="mt-4 text-xs text-[#5F6572]">
                                      Vínculo automático realizado em {d.vinculoAutomatico.data} por{" "}
                                      {d.vinculoAutomatico.usuario}
                                    </p>
                                  )}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="px-2 py-4 text-sm text-[#90949D]">Nenhum documento associado.</div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Seção Etapa */}
          {etapaEnabled && drawerExpandEnabled && !expanded && (
            <div className="rounded-lg border border-border bg-white">
            <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
              <h3 className="text-sm font-semibold text-[#0d0f1c]">Etapa</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                {(() => {
                  // Se cancelado, mostrar "Cancelado" na última etapa
                  const isCanceled = currentRow.lancadoEm === 'cancelados';
                  const isLiquidated = currentRow.lancadoEm === 'liquidados';
                  
                  const etapasBase = [
                    { id: 'conferir', label: 'Conferir' },
                    { id: 'aprovacao', label: 'Aprovar' },
                    { id: 'pagar', label: 'Pagar' },
                    { id: 'finalizado', label: isCanceled ? 'Cancelado' : 'Finalizado' },
                  ];

                  return etapasBase.map((etapa, index, array) => {
                    const etapaMap: Record<string, string> = {
                      'conferir': 'conferir',
                      'aprovacao': 'aprovacao',
                      'pagar': 'pagar',
                      'liquidados': 'finalizado',
                      'cancelados': 'finalizado',
                      'bloqueados': 'conferir',
                    };
                    
                    const etapaAtual = etapaMap[currentRow.lancadoEm] || 'conferir';
                    const etapaIndex = array.findIndex(e => e.id === etapaAtual);
                    const isActive = etapa.id === etapaAtual && !isLiquidated;
                    
                    // Verifica se a etapa foi visitada
                    const etapasFisiicas: Record<string, string> = {
                      'conferir': 'conferir',
                      'aprovacao': 'aprovacao',
                      'pagar': 'pagar',
                      'finalizado': 'liquidados',
                    };
                    const etapaFisica = etapasFisiicas[etapa.id];
                    const foiVisitada = currentRow.etapasVisitadas?.includes(etapaFisica as any) ?? false;
                    
                    // Verifica se a etapa de aprovação foi rejeitada
                    const isRejected = etapa.id === 'aprovacao' && 
                                      currentRow.aprovacao?.statusAprovacao === 'Rejeitado' &&
                                      foiVisitada;
                    
                    // Lógica de conclusão das etapas:
                    let isCompleted = false;
                    if (isLiquidated && etapa.id === 'finalizado') {
                      // Para liquidados, a etapa finalizado sempre está concluída
                      isCompleted = true;
                    } else if (isCanceled && etapa.id === 'finalizado') {
                      // Cancelado não é concluído, é cancelado (sem check)
                      isCompleted = false;
                    } else if (isRejected) {
                      // Aprovação rejeitada não é considerada "concluída"
                      isCompleted = false;
                    } else {
                      // Para todas as outras etapas: se foi visitada, está concluída
                      isCompleted = foiVisitada;
                    }
                    
                    return (
                      <React.Fragment key={etapa.id}>
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="relative flex flex-col items-center">
                            <div
                              className={[
                                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
                                isCanceled && etapa.id === 'finalizado'
                                  ? 'bg-gray-100 text-gray-500 border-gray-300'
                                  : isRejected
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : isActive
                                  ? 'bg-[#0C3CF7] text-white border-[#0C3CF7]'
                                  : isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-gray-50 text-gray-400 border-gray-200'
                              ].join(' ')}
                            >
                              {isCanceled && etapa.id === 'finalizado' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                </svg>
                              ) : isRejected ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ) : isCompleted ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                index + 1
                              )}
                            </div>
                          </div>
                          <span
                            className={[
                              'text-xs font-medium text-center',
                              isCanceled && etapa.id === 'finalizado'
                                ? 'text-gray-500'
                                : isRejected
                                ? 'text-red-700'
                                : isActive
                                ? 'text-[#0C3CF7]'
                                : isCompleted
                                ? 'text-emerald-700'
                                : 'text-[#5F6572]'
                            ].join(' ')}
                          >
                            {isRejected ? 'Reprovado' : etapa.label}
                          </span>
                        </div>
                        {index < array.length - 1 && (
                          <div
                            className={[
                              'h-0.5 flex-1 transition-colors',
                              isCompleted || (isActive && index < etapaIndex)
                                ? 'bg-emerald-200'
                                : 'bg-gray-200'
                            ].join(' ')}
                          />
                        )}
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
          )}

          {/* Seção Reforma Tributária */}
          {drawerExpandEnabled && !expanded && (
            <ReformaTributariaSection row={currentRow} />
          )}

          {/* Seção Fornecedor */}
          {drawerExpandEnabled && !expanded && (
            <div className="rounded-lg border border-border bg-white">
            <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
              <h3 className="text-sm font-semibold text-[#0d0f1c]">Fornecedor</h3>
            </div>
            <div className="p-4 space-y-4">
              <FornecedorFields row={currentRow} />
            </div>
          </div>
          )}

          {/* Histórico de eventos — modo narrow */}
          {drawerExpandEnabled && !expanded && (
            <HistoricoEventosBlock events={currentRow.eventHistory} />
          )}

          {/* Seção Aprovação */}
          {!expanded && currentRow.aprovacao && (
            <div className="rounded-lg border border-border bg-white">
                <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
                <h3 className="text-sm font-semibold text-[#0d0f1c]">Aprovação</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Aprovador</Label>
                  <div className={"mt-1 " + (currentRow.aprovacao.aprovador ? "text-[#0d0f1c]" : "text-[#90949D]")}>
                    {currentRow.aprovacao.aprovador || 'Não atribuído'}
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Email</Label>
                  <div className={"mt-1 " + (currentRow.aprovacao.emailAprovador ? "text-[#0d0f1c]" : "text-[#90949D]")}>
                    {currentRow.aprovacao.emailAprovador || 'Não informado'}
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Status da aprovação</Label>
                  <div className="mt-1">
                    <span className={cn(
                      currentRow.aprovacao.statusAprovacao === 'Aprovado'
                        ? getTagClasses('bg-emerald-50', 'text-emerald-700', 'border-emerald-200')
                        : currentRow.aprovacao.statusAprovacao === 'Rejeitado'
                        ? getTagClasses('bg-red-50', 'text-red-700', 'border-red-200')
                        : getTagClasses('bg-amber-50', 'text-amber-700', 'border-amber-200')
                    )}>
                      {currentRow.aprovacao.statusAprovacao}
                    </span>
                  </div>
                </div>
                {currentRow.aprovacao.dataEnvio && (
                  <div>
                    <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Data de envio</Label>
                    <div className="mt-1 text-[#0d0f1c]">{currentRow.aprovacao.dataEnvio}</div>
                  </div>
                )}
                {currentRow.aprovacao.dataAprovacao && (
                  <div className="col-span-2">
                    <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Data da aprovação</Label>
                    <div className="mt-1 text-[#0d0f1c]">{currentRow.aprovacao.dataAprovacao}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seção Pagamento - Métodos */}
          {drawerExpandEnabled && !expanded && (
            <div className="rounded-lg border border-border bg-white" ref={paymentMethodRef}>
            <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
              <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Forma de pagamento</h3>
            </div>
            <div className="p-2">
              <div
                role="button"
                aria-expanded={paymentOpen}
                onClick={() => setPaymentOpen(v => !v)}
                className="w-full flex items-center gap-3 rounded-md hover:bg-[#FAFAFF] px-3 py-3 cursor-pointer"
              >
                <Barcode className="h-4 w-4 text-[#5F6572]" aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-[#0d0f1c] truncate">Boleto</span>
                    <span className={getTagClasses('bg-emerald-50', 'text-emerald-700', 'border-emerald-200')}>
                      Pagamento preferencial
                    </span>
                  </div>
                </div>
                <ChevronDown className={["h-4 w-4 transition-transform", paymentOpen ? "rotate-180" : ""].join(" ")} />
              </div>
              {paymentOpen && (
                <div className="px-4 pt-3 pb-3" ref={paymentContentRef}>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    {isUpdatingAfterConfirmBoleto ? (
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Código de barras</Label>
                          <div className="space-y-1.5">
                            <div className="h-4 bg-gray-200/80 rounded animate-pulse w-full max-w-[280px]" />
                            <div className="h-4 bg-gray-200/80 rounded animate-pulse w-full max-w-[120px]" />
                          </div>
                        </div>
                        <div>
                          <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Favorecido</Label>
                          <div className="h-4 bg-gray-200/80 rounded animate-pulse w-full max-w-[200px]" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Código de barras</Label>
                            <div className="break-words">
                              {codigoBarrasPagamento ? (
                                <CopyableNumber
                                  value={codigoBarrasPagamento}
                                  ariaLabel="Copiar código de barras"
                                />
                              ) : (
                                <span className="text-[#90949D]">Nenhum boleto associado</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Favorecido</Label>
                            <div className="text-[#0d0f1c]">{boletoPagamento?.cedente ?? getSupplier(currentRow.cnpjFornecedor)?.pagamentoPreferencial?.favorecido ?? currentRow.fornecedor}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-[#5F6572]">Essa forma é definida no cadastro do fornecedor.</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Seção Documentos */}
          {drawerExpandEnabled && !expanded && (
            <div className="rounded-lg border border-border bg-white">
            <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
              <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Documentos associados</h3>
              <Button 
                size="default" 
                variant="ghost" 
                className="inline-flex items-center gap-2 font-bold hover:bg-[#EFF1F2] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  // Placeholder - funcionalidade será implementada futuramente
                }}
              >
                <FilePlus2 className="h-4 w-4" aria-hidden />
                Associar documento
              </Button>
            </div>
            <div className="p-4">
                {isUpdatingAfterConfirmBoleto ? (
                  <ul className="divide-y space-y-0">
                    {[1, 2, 3].map((i) => (
                      <li key={i} className="flex items-center gap-3 py-3">
                        <div className="h-4 w-4 rounded bg-gray-200 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                          <div className="h-3 bg-gray-200/80 rounded animate-pulse w-16" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : documentosAssociadosAlto.length > 0 ? (
                  <ul className="divide-y">
                    {documentosAssociadosAlto.map(({ doc: d, originalIndex }) => {
                      const Icon = d.tipo === 'Comprovante' ? Receipt : d.tipo === 'NF-e' ? Box : d.tipo === 'NFS-e' ? Briefcase : d.tipo === 'CT-e' ? Truck : Barcode;
                      const isOpen = expandedDocs.has(originalIndex);
                      const label = `${d.tipo} ${d.numero ? `#${d.numero}` : ''}`.trim();
                      const isDivergenteDoc = divergeIdxs.has(originalIndex);
                      return (
                        <li key={originalIndex} className="text-sm" data-doc-item={originalIndex}>
                          <div className="flex w-full items-center gap-3 px-3 py-3">
                            <Icon className="h-4 w-4 shrink-0 text-[#5F6572]" aria-hidden />
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                {isDivergenteDoc && (
                                  <span
                                    className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-600/70"
                                    aria-label="Documento com divergência"
                                    title="Documento com divergência"
                                  />
                                )}
                                <span className="truncate font-medium text-[#0d0f1c]">{label}</span>
                                <span
                                  className={cn(
                                    getTagClasses(
                                      d.associacao === "Automática"
                                        ? "bg-[#E7EEFF]"
                                        : "bg-amber-50",
                                      d.associacao === "Automática"
                                        ? "text-[#0C3CF7]"
                                        : "text-amber-700",
                                      d.associacao === "Automática"
                                        ? "border-[#B8CCFF]"
                                        : "border-amber-200"
                                    )
                                  )}
                                >
                                  {d.associacao}
                                </span>
                              </div>
                            </div>
                            {d.tipo === "Comprovante" && (
                              <Button
                                variant="default"
                                size="sm"
                                className="mr-1 inline-flex shrink-0 items-center gap-2 font-bold"
                                onClick={() => onOpenComprovante(d)}
                              >
                                {getAssociatedDocViewLabel(d.tipo)}
                              </Button>
                            )}
                            {d.tipo === "NF-e" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="mr-1 inline-flex shrink-0 items-center gap-2 font-bold"
                                onClick={() => onOpenDanfe(d)}
                              >
                                {getAssociatedDocViewLabel(d.tipo)}
                              </Button>
                            )}
                            {d.tipo === "Boleto" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="mr-1 inline-flex shrink-0 items-center gap-2 font-bold"
                                onClick={() => onOpenBoleto(d)}
                              >
                                {getAssociatedDocViewLabel(d.tipo)}
                              </Button>
                            )}
                            {d.tipo === "NFS-e" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="mr-1 inline-flex shrink-0 items-center gap-2 font-bold"
                                onClick={() => onOpenNFSe(d)}
                              >
                                {getAssociatedDocViewLabel(d.tipo)}
                              </Button>
                            )}
                            {d.tipo === "CT-e" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="mr-1 inline-flex shrink-0 items-center gap-2 font-bold"
                                onClick={() => onOpenCTe(d)}
                              >
                                {getAssociatedDocViewLabel(d.tipo)}
                              </Button>
                            )}
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#5F6572] transition-colors hover:bg-[#EFF1F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-1"
                              aria-expanded={isOpen}
                              aria-label={
                                isOpen
                                  ? "Recolher detalhes do documento"
                                  : "Expandir detalhes do documento"
                              }
                              onClick={() => toggleExpansion(originalIndex)}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isOpen && "rotate-180"
                                )}
                              />
                            </button>
                          </div>
                          {isOpen && (
                            <div className="px-4 pb-3 pt-1">
                              <AssociadoDocExpandedDetails doc={d} />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-2 py-4 text-sm text-[#90949D]">Nenhum documento associado.</div>
                )}
            </div>
          </div>
          )}

          {/* Coluna Direita quando expandido */}
          {(!drawerExpandEnabled || (drawerExpandEnabled && expanded)) && (
            <div className="space-y-4">
              {/* Seção Etapa */}
              {etapaEnabled && (
              <div className="rounded-lg border border-border bg-white">
                <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
                  <h3 className="text-sm font-semibold text-[#0d0f1c]">Etapa</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {(() => {
                      // Se cancelado, mostrar "Cancelado" na última etapa
                      const isCanceled = currentRow.lancadoEm === 'cancelados';
                      const isLiquidated = currentRow.lancadoEm === 'liquidados';
                      
                      const etapasBase = [
                        { id: 'conferir', label: 'Conferir' },
                        { id: 'aprovacao', label: 'Aprovar' },
                        { id: 'pagar', label: 'Pagar' },
                        { id: 'finalizado', label: isCanceled ? 'Cancelado' : 'Finalizado' },
                      ];

                      return etapasBase.map((etapa, index, array) => {
                        const etapaMap: Record<string, string> = {
                          'conferir': 'conferir',
                          'aprovacao': 'aprovacao',
                          'pagar': 'pagar',
                          'liquidados': 'finalizado',
                          'cancelados': 'finalizado',
                          'bloqueados': 'conferir',
                        };
                        
                        const etapaAtual = etapaMap[currentRow.lancadoEm] || 'conferir';
                        const etapaIndex = array.findIndex(e => e.id === etapaAtual);
                        const isActive = etapa.id === etapaAtual && !isLiquidated;
                        
                        // Verifica se a etapa foi visitada
                        const etapasFisiicas: Record<string, string> = {
                          'conferir': 'conferir',
                          'aprovacao': 'aprovacao',
                          'pagar': 'pagar',
                          'finalizado': 'liquidados',
                        };
                        const etapaFisica = etapasFisiicas[etapa.id];
                        const foiVisitada = currentRow.etapasVisitadas?.includes(etapaFisica as any) ?? false;
                        
                        // Verifica se a etapa de aprovação foi rejeitada
                        const isRejected = etapa.id === 'aprovacao' && 
                                          currentRow.aprovacao?.statusAprovacao === 'Rejeitado' &&
                                          foiVisitada;
                        
                        // Lógica de conclusão das etapas:
                        let isCompleted = false;
                        if (isLiquidated && etapa.id === 'finalizado') {
                          // Para liquidados, a etapa finalizado sempre está concluída
                          isCompleted = true;
                        } else if (isCanceled && etapa.id === 'finalizado') {
                          // Cancelado não é concluído, é cancelado (sem check)
                          isCompleted = false;
                        } else if (isRejected) {
                          // Aprovação rejeitada não é considerada "concluída"
                          isCompleted = false;
                        } else {
                          // Para todas as outras etapas: se foi visitada, está concluída
                          isCompleted = foiVisitada;
                        }
                        
                        return (
                          <React.Fragment key={etapa.id}>
                            <div className="flex flex-col items-center gap-2 flex-1">
                              <div className="relative flex flex-col items-center">
                                <div
                                  className={[
                                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
                                    isCanceled && etapa.id === 'finalizado'
                                      ? 'bg-gray-100 text-gray-500 border-gray-300'
                                      : isRejected
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : isActive
                                      ? 'bg-[#0C3CF7] text-white border-[#0C3CF7]'
                                      : isCompleted
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-gray-50 text-gray-400 border-gray-200'
                                  ].join(' ')}
                                >
                                  {isCanceled && etapa.id === 'finalizado' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                    </svg>
                                  ) : isRejected ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  ) : isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                              </div>
                              <span
                                className={[
                                  'text-xs font-medium text-center',
                                  isCanceled && etapa.id === 'finalizado'
                                    ? 'text-gray-500'
                                    : isRejected
                                    ? 'text-red-700'
                                    : isActive
                                    ? 'text-[#0C3CF7]'
                                    : isCompleted
                                    ? 'text-emerald-700'
                                    : 'text-[#5F6572]'
                                ].join(' ')}
                              >
                                {isRejected ? 'Reprovado' : etapa.label}
                              </span>
                            </div>
                            {index < array.length - 1 && (
                              <div
                                className={[
                                  'h-0.5 flex-1 transition-colors',
                                  isCompleted || (isActive && index < etapaIndex)
                                    ? 'bg-emerald-200'
                                    : 'bg-gray-200'
                                ].join(' ')}
                              />
                            )}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
              )}

              {/* Seção Reforma Tributária */}
              <ReformaTributariaSection row={currentRow} />

              {/* Seção Fornecedor */}
              <div className="rounded-lg border border-border bg-white">
                <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
                  <h3 className="text-sm font-semibold text-[#0d0f1c]">Fornecedor</h3>
                </div>
                <div className="p-4 space-y-4">
                  <FornecedorFields row={currentRow} />
                </div>
              </div>

              {/* Histórico de eventos — modo expandido */}
              <HistoricoEventosBlock events={currentRow.eventHistory} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>

    <LaunchConfirmationModal
      open={launchConfirmationOpen}
      onClose={() => {
        setLaunchConfirmationOpen(false);
        setPendingLaunch(null);
      }}
      selectedRows={currentRow ? [currentRow] : []}
      fromTab={currentRow?.lancadoEm || 'conferir'}
      toTab={pendingLaunch?.dest || 'pagar'}
      onConfirm={() => {
        if (pendingLaunch) {
          executeLaunch(pendingLaunch.dest, pendingLaunch.label);
          setLaunchConfirmationOpen(false);
          setPendingLaunch(null);
        }
      }}
    />

    <ReplaceBoletoModal
      open={replaceBoletoState !== null}
      onClose={() => setReplaceBoletoState(null)}
      boletoAtual={replaceBoletoState?.boletoAtual ?? null}
      novoBoleto={replaceBoletoState?.novoBoleto ?? null}
      onConfirm={() => {
        if (replaceBoletoState) {
          setReplaceBoletoState(null);
          executeConfirmarBoleto(
            replaceBoletoState.novoBoleto,
            replaceBoletoState.indexInConferencia,
            true
          );
        }
      }}
    />

    <DispensarBoletoModal
      open={dispensarBoletoState !== null}
      onClose={() => setDispensarBoletoState(null)}
      boleto={dispensarBoletoState?.doc ?? null}
      onConfirm={() => {
        if (dispensarBoletoState) {
          handleDescartarSugestao(dispensarBoletoState.indexInConferencia);
          setDispensarBoletoState(null);
        }
      }}
    />
    </>
  );
}
