"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Upload, ChevronDown, PlusCircle, FileText, CircleDollarSign, CheckCircle2, Loader2, Check, Ban, Download, Plus, X, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { Row, PaymentTabId, LancadoEm } from "../../types";
import { getEtapaLabel } from "../../utils/etapas";
import { getNotaEmissaoDisplay } from "../../utils/nota-emissao";
import { getCbsPrevistoValue } from "../../utils/cbs-previsto";
import { StatusTag } from "../StatusTag";
import { Tag } from "@/components/ui/tag";
import { PaymentModal } from "./PaymentModal";
import { PaymentSummaryDrawer } from "./PaymentSummaryDrawer";
import { RejectionModal, RejectionAction } from "../modals/RejectionModal";
import { ApprovalConfirmationModal } from "../modals/ApprovalConfirmationModal";
import { LaunchConfirmationModal } from "../modals/LaunchConfirmationModal";
import { calculatePaymentSummary } from "../../utils/calculations";
import { resolvePayer } from "../../utils/payment-helpers";
import { formatCurrency } from "../../utils/formatters";
import { getRandomApprover } from "../../utils/approvers";
import { cn } from "@/lib/utils";
import { useFeatures } from "@/lib/features/useFeatures";
import { useTheme } from "@/lib/theme/useTheme";
import {
  getDivergencia,
  getPendencias,
  hasDivergenciaAtiva,
  type PendenciaTipo,
} from "../../utils/divergencias";
import { getDueDateDisplay } from "../../utils/due-date";

const PENDENCIA_SHORT_LABEL: Record<PendenciaTipo, string> = {
  "emissor-diferente": "Emissor",
  "forma-pagamento-divergente": "Pagamento",
  "boleto-validacao-pendente": "Documento",
};

const PENDENCIA_TOOLTIP: Record<PendenciaTipo, string> = {
  "emissor-diferente": "Divergência de emissores",
  "forma-pagamento-divergente": "Divergência de forma de pagamento",
  "boleto-validacao-pendente": "Documento com associação pendente",
};

/** Ordem de exibição na coluna quando há múltiplas pendências. */
const PENDENCIA_DISPLAY_ORDER: PendenciaTipo[] = [
  "boleto-validacao-pendente",
  "emissor-diferente",
  "forma-pagamento-divergente",
];

function sortPendenciasForDisplay(pendencias: PendenciaTipo[]): PendenciaTipo[] {
  return [...pendencias].sort(
    (a, b) => PENDENCIA_DISPLAY_ORDER.indexOf(a) - PENDENCIA_DISPLAY_ORDER.indexOf(b)
  );
}

const PENDENCIA_TOOLTIP_CLASS =
  "pointer-events-none invisible absolute bottom-full left-0 z-[100] mb-1.5 rounded-md border border-[#EBECEE] bg-white px-2.5 py-1.5 text-xs text-[#5F6572] opacity-0 shadow-lg transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100";

function PendenciasCell({ row }: { row: Row }) {
  const sorted = sortPendenciasForDisplay(getPendencias(row));
  if (sorted.length === 0) return <>-</>;

  const labels = sorted.map((tipo) => PENDENCIA_SHORT_LABEL[tipo]);
  const tooltips = sorted.map((tipo) => PENDENCIA_TOOLTIP[tipo]);

  return (
    <span className="group relative inline-flex min-w-0 cursor-default items-center gap-1.5">
      <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
      <span className="truncate">{labels.join(", ")}</span>
      <span
        className={cn(
          PENDENCIA_TOOLTIP_CLASS,
          sorted.length === 1 ? "whitespace-nowrap" : "whitespace-normal"
        )}
      >
        {sorted.length === 1 ? (
          tooltips[0]
        ) : (
          <span className="flex flex-col gap-0.5">
            {tooltips.map((text) => (
              <span key={text}>{text}</span>
            ))}
          </span>
        )}
      </span>
    </span>
  );
}

interface PaymentsTableProps {
  tab: PaymentTabId;
  data: Row[];
  setData: React.Dispatch<React.SetStateAction<Row[]>>;
  visible: Row[];
  pageItems: Row[];
  onMoveToTab: (t: PaymentTabId) => void;
  onOpenDetail: (row: Row) => void;
  viewingRow?: Row | null;
  focusedRowIndex?: number;
  selected: Set<number>;
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
  payOpen: boolean;
  setPayOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPaymentCompleted: (list: Row[], info: { count: number; base: number; fees: number; total: number; bank?: string }) => void;
  erpUpdating: Set<string>;
  tabs: Array<{ id: string; label: string; hasNewItems?: boolean }>;
  isRecentlyAdded?: (itemId: string) => boolean;
  selectedCompany?: string | string[];
  pagarVersion?: "v1" | "v2";
  hasBanks?: boolean;
  onRequireBanks?: () => void;
  bankAccounts?: import("../../types").BankAccount[];
  onNovoPagamento?: () => void;
}

export function PaymentsTable({
  tab,
  data,
  setData,
  visible,
  pageItems,
  onMoveToTab,
  onOpenDetail,
  viewingRow,
  focusedRowIndex = -1,
  selected,
  setSelected,
  payOpen,
  setPayOpen,
  onPaymentCompleted,
  erpUpdating,
  tabs,
  isRecentlyAdded = () => false,
  selectedCompany = "all" as string | string[],
  pagarVersion = "v2",
  hasBanks = false,
  onRequireBanks,
  bankAccounts = [],
  onNovoPagamento,
}: PaymentsTableProps) {
  const { isFeatureEnabled, getEnabledOrigemTypes } = useFeatures();
  const { tagModel } = useTheme();
  const erpSyncEnabled = isFeatureEnabled("gestao-de-pagamentos.erp-sync");
  const selectionCounterEnabled = isFeatureEnabled("gestao-de-pagamentos.selection-counter");
  const aprovacaoTabEnabled = isFeatureEnabled("gestao-de-pagamentos.aprovacao-tab");
  const cnabMenuEnabled = isFeatureEnabled("gestao-de-pagamentos.cnab-menu");
  const isCompact = tagModel === 'compact';
  
  // Obter tipos de origem habilitados e criar função de mapeamento
  const enabledOrigemTypes = React.useMemo(() => {
    return getEnabledOrigemTypes("gestao-de-pagamentos");
  }, [getEnabledOrigemTypes]);

  // Função para mapear origem do documento baseado nos tipos habilitados
  const mapOrigem = React.useCallback((row: Row): Row['origem'] => {
    const enabledTypes = enabledOrigemTypes;
    if (enabledTypes.length === 0) {
      // Se nenhum tipo estiver habilitado, retorna o original
      return row.origem;
    }
    
    // Usa o ID do documento como seed para escolher um tipo de forma determinística
    // Isso garante que o mesmo documento sempre tenha a mesma origem mapeada
    const hash = row.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const selectedIndex = hash % enabledTypes.length;
    return enabledTypes[selectedIndex] as Row['origem'];
  }, [enabledOrigemTypes]);
  const [exportOpen, setExportOpen] = React.useState(false);

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
  const [lancarOpen, setLancarOpen] = React.useState(false);
  const [cnabOpen, setCnabOpen] = React.useState(false);
  const [rejectionOpen, setRejectionOpen] = React.useState(false);
  const [rowsToReject, setRowsToReject] = React.useState<Row[]>([]);
  const [approvalOpen, setApprovalOpen] = React.useState(false);
  const [rowsToApprove, setRowsToApprove] = React.useState<Row[]>([]);
  const [launchConfirmationOpen, setLaunchConfirmationOpen] = React.useState(false);
  const [pendingLaunch, setPendingLaunch] = React.useState<{ dest: Row['lancadoEm']; label: string; rows: Row[] } | null>(null);
  
  // Payment flow
  const [payBank, setPayBank] = React.useState<string>('Itaú');
  const [payBase, setPayBase] = React.useState<number>(0);
  const [payFees, setPayFees] = React.useState<number>(0);
  const [payTotal, setPayTotal] = React.useState<number>(0);
  const [payProcessing, setPayProcessing] = React.useState<boolean>(false);
  const [payProcessedAll, setPayProcessedAll] = React.useState<boolean>(false);
  const [payQueue, setPayQueue] = React.useState<Row[]>([]);
  const [payIndex, setPayIndex] = React.useState<number>(0);
  const [payItemProgress, setPayItemProgress] = React.useState<number>(0);
  const [payToastId, setPayToastId] = React.useState<string | number | null>(null);
  const [payProcessingIds, setPayProcessingIds] = React.useState<Set<string>>(new Set());
  const [payCurrentId, setPayCurrentId] = React.useState<string | null>(null);

  const hasSelection = selected.size > 0;
  const isConferirTab = tab === "conferir";
  const isCanceladosTab = tab === "cancelados";
  const isLiquidadosTab = tab === "liquidados";
  const hideStatusColumn = isCanceladosTab || isLiquidadosTab;
  const getCancelamentoLabel = React.useCallback((row: Row) => {
    const origem = row.cancelamentoOrigem ?? "Manual";
    if (origem === "Nota" || origem === "Por nota") return "Automático - Nota";
    if (origem === "Boleto" || origem === "Por boleto") return "Automático - Boleto";
    return "Manual";
  }, []);
  const getDivergenciaLabel = React.useCallback((row: Row) => {
    const divergencia = getDivergencia(row);
    if (!divergencia) return "-";
    if (divergencia.tipo === "forma-pagamento-divergente") return "Divergência de pagamento";
    if (divergencia.tipo === "emissor-diferente") return "Emissores diferentes";
    return "-";
  }, []);
  const allSelected = visible.length > 0 && visible.every(r => selected.has(data.indexOf(r)));
  const headRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (headRef.current) headRef.current.indeterminate = hasSelection && !allSelected;
  }, [hasSelection, allSelected]);

  React.useEffect(() => {
    if (!payOpen) return;
    const sel = payQueue.length > 0 ? payQueue : visible.filter((r) => selected.has(data.indexOf(r)));
    if (sel.length > 0) {
      const summary = calculatePaymentSummary(sel);
      setPayBase(summary.base);
      setPayFees(summary.fees);
      setPayTotal(summary.total);
    }
  }, [payOpen, payQueue, visible, selected, data]);

  // Gerencia exibição do toast baseado no estado do modal (apenas V2)
  React.useEffect(() => {
    if (pagarVersion === "v1") return;
    if (payProcessing && !payProcessedAll) {
      if (!payOpen && payToastId === null) {
        // Modal fechado e sem toast: cria o toast
        const progressPercent = payQueue.length === 0 ? 0 : ((payIndex + payItemProgress) / payQueue.length) * 100;
        const currentCount = Math.min(payIndex + 1, payQueue.length);
        
        const toastId = toast(
          <div className="flex items-center gap-3 w-full min-w-0 toast-processing">
            <Loader2 className="h-5 w-5 animate-spin text-white shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-sm font-medium text-white truncate">Processando pagamentos</span>
                <span className="text-xs text-white/80 whitespace-nowrap shrink-0">
                  {currentCount}/{payQueue.length}
                </span>
              </div>
              <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-[width] duration-100 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>,
          {
            duration: Infinity,
            action: {
              label: 'Ver detalhes',
              onClick: () => setPayOpen(true),
            },
          }
        );
        setPayToastId(toastId);
      } else if (!payOpen && payToastId !== null) {
        // Modal fechado e com toast: atualiza o toast
        const progressPercent = payQueue.length === 0 ? 0 : ((payIndex + payItemProgress) / payQueue.length) * 100;
        const currentCount = Math.min(payIndex + 1, payQueue.length);
        
        toast(
          <div className="flex items-center gap-3 w-full min-w-0 toast-processing">
            <Loader2 className="h-5 w-5 animate-spin text-white shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-sm font-medium text-white truncate">Processando pagamentos</span>
                <span className="text-xs text-white/80 whitespace-nowrap shrink-0">
                  {currentCount}/{payQueue.length}
                </span>
              </div>
              <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-[width] duration-100 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>,
          {
            id: payToastId,
            duration: Infinity,
            action: {
              label: 'Ver detalhes',
              onClick: () => setPayOpen(true),
            },
          }
        );
      } else if (payOpen && payToastId !== null) {
        // Modal aberto e com toast: remove o toast
        toast.dismiss(payToastId);
        setPayToastId(null);
      }
    }
  }, [payToastId, payProcessing, payProcessedAll, payIndex, payItemProgress, payQueue.length, payOpen, setPayOpen, pagarVersion]);

  // Fecha o toast de progresso quando o processamento terminar
  React.useEffect(() => {
    if (payToastId !== null && !payProcessing) {
      toast.dismiss(payToastId);
      setPayToastId(null);
    }
  }, [payToastId, payProcessing]);

  // Mostra snackbar de sucesso quando pagamentos terminam
  React.useEffect(() => {
    if (!payProcessing && payProcessedAll && payQueue.length > 0) {
      // Para V2 (modal), fechamos e mostramos toast como antes.
      if (pagarVersion !== "v1") {
        setPayOpen(false);

        toast.success('Contas pagas com sucesso', {
          duration: 5000,
        });

        // Limpa os estados após o modal fechar
        setTimeout(() => {
          setPayProcessedAll(false);
          setPayQueue([]);
          setPayIndex(0);
          setPayItemProgress(0);
        }, 100);
      }
      // Para V1 (drawer), mantemos o estado `payProcessedAll`
      // para o drawer exibir a tela de sucesso; a limpeza será feita
      // ao fechar manualmente.
    }
  }, [payProcessing, payProcessedAll, payQueue.length, setPayOpen, pagarVersion]);

  const toggleRow = (globalIndex: number, on?: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (on === undefined) {
        next.has(globalIndex) ? next.delete(globalIndex) : next.add(globalIndex);
      } else {
        on ? next.add(globalIndex) : next.delete(globalIndex);
      }
      return next;
    });
  };

  const handleConfirmPayment = () => {
    const toPay = visible.filter((r) => selected.has(data.indexOf(r)));
    if (toPay.length === 0) {
      setPayOpen(false);
      return;
    }

    // Fluxo simplificado para V1 (drawer)
    if (pagarVersion === "v1") {
      const queue = toPay;
      setPayQueue(queue);
      setPayIndex(0);
      setPayItemProgress(0);
      setPayProcessing(true);
      setPayProcessedAll(false);
      // marca todos os selecionados como em processamento na coluna de status
      setPayProcessingIds(new Set(queue.map((r) => r.id)));
      setPayCurrentId(null);

      // Exibe "Processando" por ~4s e depois liquida tudo de uma vez
      setTimeout(() => {
        setData((prev) =>
          prev.map((r) => {
            if (!queue.find((t) => t.id === r.id)) return r;
            const docs = r.documentosAssociados ?? [];
            const exists = docs.some((d) => d.tipo === "Comprovante");
            const payer = resolvePayer(r);
            const comp = {
              tipo: "Comprovante" as const,
              data: new Date().toLocaleDateString("pt-BR"),
              valor: r.formaPagamento?.valor ?? r.valor,
              banco: payBank,
              pagador: payer.nome,
              cnpjPagador: payer.cnpj,
              associacao: "Automática" as const,
            };
            const withComprovante = !exists
              ? [comp, ...docs]
              : [
                  {
                    ...docs.find((d) => d.tipo === "Comprovante")!,
                    banco: payBank,
                    pagador: comp.pagador ?? payer.nome,
                    cnpjPagador: comp.cnpjPagador ?? payer.cnpj,
                  },
                  ...docs.filter((d) => d.tipo !== "Comprovante"),
                ];
            const currentVisitedStages = r.etapasVisitadas ?? [];
            const originStage = r.lancadoEm;
            let updatedVisitedStages = [...currentVisitedStages];
            if (!updatedVisitedStages.includes(originStage)) {
              updatedVisitedStages.push(originStage);
            }
            if (!updatedVisitedStages.includes("liquidados")) {
              updatedVisitedStages.push("liquidados");
            }

            return {
              ...r,
              status: "Pago" as const,
              lancadoEm: "liquidados" as const,
              documentosAssociados: withComprovante,
              etapasVisitadas: updatedVisitedStages as any,
            };
          })
        );

        setSelected(new Set());
        onPaymentCompleted(queue, {
          count: queue.length,
          base: payBase,
          fees: payFees,
          total: payTotal,
          bank: payBank,
        });

        setPayProcessing(false);
        setPayProcessedAll(true);
        setPayProcessingIds(new Set());
        setPayCurrentId(null);
      }, 4000);

      return;
    }

    // Fluxo detalhado original (V2 - modal com progresso granular)
    const queue = toPay;
    setPayQueue(queue);
    setPayIndex(0);
    setPayItemProgress(0);
    setPayProcessing(true);
    setPayProcessedAll(false);
    setPayProcessingIds(new Set(queue.map((r) => r.id)));
    setPayCurrentId(queue[0]?.id || null);

    // Pequeno delay para garantir que o estado seja resetado antes de começar o progresso
    setTimeout(() => {
      // Barra de progresso global que vai de 0 a 95% durante todo o processo
      let globalProgress = 0;
      const progressInterval = setInterval(() => {
        globalProgress += 0.5; // Incrementa gradualmente
        const progressPercent = Math.min(95, globalProgress); // Máximo 95% até terminar
        setPayItemProgress(progressPercent / 100);
      }, 100);

      // Armazena o interval para poder parar depois
      (window as any).currentProgressInterval = progressInterval;
    }, 100);

    const processItem = async (itemIndex: number, ms: number) => {
      setPayIndex(itemIndex);
      setPayCurrentId(queue[itemIndex].id);

      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), ms);
      });
    };

    (async () => {
      for (let i = 0; i < queue.length; i++) {
        const ms = 800 + Math.floor(Math.random() * 400);
        await processItem(i, ms);

        // Remove o ID da lista de processamento quando concluir
        setPayProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(queue[i].id);
          return next;
        });

        // Atualiza o item individual como "Pago" primeiro
        const currentItem = queue[i];
        setData((prev) =>
          prev.map((r) => {
            if (r.id !== currentItem.id) return r;
            const docs = r.documentosAssociados ?? [];
            const exists = docs.some((d) => d.tipo === "Comprovante");
            const payer = resolvePayer(r);
            const comp = {
              tipo: "Comprovante" as const,
              data: new Date().toLocaleDateString("pt-BR"),
              valor: r.formaPagamento?.valor ?? r.valor,
              banco: payBank,
              pagador: payer.nome,
              cnpjPagador: payer.cnpj,
              associacao: "Automática" as const,
            };
            const withComprovante = !exists
              ? [comp, ...docs]
              : [
                  {
                    ...docs.find((d) => d.tipo === "Comprovante")!,
                    banco: payBank,
                    pagador: comp.pagador ?? payer.nome,
                    cnpjPagador: comp.cnpjPagador ?? payer.cnpj,
                  },
                  ...docs.filter((d) => d.tipo !== "Comprovante"),
                ];
            return { ...r, status: "Pago" as const, documentosAssociados: withComprovante };
          })
        );

        // Aguarda 600ms antes de mover para liquidados
        await new Promise((r) => setTimeout(r, 600));

        // Move para liquidados
        setData((prev) =>
          prev.map((r) => {
            if (r.id !== currentItem.id) return r;

            // Atualiza etapasVisitadas
            const currentVisitedStages = r.etapasVisitadas ?? [];
            const originStage = r.lancadoEm;
            let updatedVisitedStages = [...currentVisitedStages];
            if (!updatedVisitedStages.includes(originStage)) {
              updatedVisitedStages.push(originStage);
            }
            if (!updatedVisitedStages.includes("liquidados")) {
              updatedVisitedStages.push("liquidados");
            }

            return {
              ...r,
              lancadoEm: "liquidados" as const,
              etapasVisitadas: updatedVisitedStages as any,
            };
          })
        );

        await new Promise((r) => setTimeout(r, 200));
      }

      // Para o intervalo de progresso gradual
      if ((window as any).currentProgressInterval) {
        clearInterval((window as any).currentProgressInterval);
        (window as any).currentProgressInterval = null;
      }

      // Acelera a barra para 100% rapidamente
      setPayItemProgress(1);

      // Aguarda um pouco para mostrar o 100%
      await new Promise((resolve) => setTimeout(resolve, 300));

      setSelected(new Set());
      onPaymentCompleted(queue, {
        count: queue.length,
        base: payBase,
        fees: payFees,
        total: payTotal,
        bank: payBank,
      });

      // Seta como concluído para mostrar o snackbar de sucesso
      setPayProcessing(false);
      setPayProcessedAll(true);
      setPayProcessingIds(new Set());
      setPayCurrentId(null);

      // O useEffect cuidará de fechar o modal e limpar o estado após mostrar o snackbar
    })();
  };

  const handleCompletePayment = () => {
    // Limpa o intervalo se existir
    if ((window as any).currentProgressInterval) {
      clearInterval((window as any).currentProgressInterval);
      (window as any).currentProgressInterval = null;
    }
    
    setPayProcessing(false);
    setPayProcessedAll(false);
    setPayOpen(false);
    setPayQueue([]);
    setPayIndex(0);
    setPayItemProgress(0);
    setPayProcessingIds(new Set());
    setPayCurrentId(null);
  };

  const handleContinueInBackground = () => {
    // O useEffect cuidará de criar o toast quando o modal fechar
    // Esta função agora apenas sinaliza a intenção de continuar em background
  };

  const executeLaunch = (dest: Row['lancadoEm'], label: string, toMove: Row[]) => {
    // Lógica de lançamento
    setData(prev => prev.map(r => {
      if (!toMove.includes(r)) return r;
      
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
      
      if (dest === 'liquidados') {
        const docs = r.documentosAssociados ?? [];
        const exists = docs.some(d => d.tipo === 'Comprovante');
        const payer = resolvePayer(r);
        const comp = {
          tipo: 'Comprovante' as const,
          data: new Date().toLocaleDateString('pt-BR'),
          valor: r.formaPagamento?.valor ?? r.valor,
          banco: 'Itaú',
          pagador: payer.nome,
          cnpjPagador: payer.cnpj,
          associacao: 'Automática' as const,
        };
        if (!exists) {
          updated.documentosAssociados = [comp, ...docs];
        } else {
          const existing = docs.find(d => d.tipo === 'Comprovante')!;
          updated.documentosAssociados = [
            { ...existing, banco: existing.banco ?? 'Itaú', pagador: existing.pagador ?? comp.pagador, cnpjPagador: existing.cnpjPagador ?? comp.cnpjPagador },
            ...docs.filter(d => d.tipo !== 'Comprovante'),
          ];
        }
        updated.status = 'Pago';
      }
      if (dest === 'cancelados') {
        updated.status = 'Cancelado';
      }
      return updated;
    }));
    
    // Mostra toast de sucesso
    toast.success(
      toMove.length === 1 
        ? `Pagamento lançado em ${label}`
        : `${toMove.length} pagamentos lançados em ${label}`,
      {
        duration: 5000,
      }
    );
    
    setSelected(new Set());
    setLancarOpen(false);
  };

  const handleGerarRemessa = async () => {
    const toPay = visible.filter(r => selected.has(data.indexOf(r)));
    if (toPay.length === 0) return;

    // 1. Toast de gerando arquivo
    const toastId = toast(
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-white" />
        <span className="text-sm font-medium text-white">
          Arquivo remessa sendo gerado
        </span>
      </div>,
      {
        duration: Infinity,
      }
    );

    // Simula geração do arquivo (3 segundos)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 2. Toast de iniciando download
    toast(
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 text-white animate-bounce" />
        <span className="text-sm font-medium text-white">
          Arquivo remessa gerado com sucesso! Iniciando download
        </span>
      </div>,
      {
        id: toastId,
        duration: Infinity,
      }
    );

    // Simula preparação do download (2.5 segundos)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simula download do arquivo
    const cnabContent = generateCNABContent(toPay);
    const blob = new Blob([cnabContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remessa_${new Date().getTime()}.rem`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // 3. Toast de sucesso
    toast.success('Download concluído', {
      id: toastId,
      duration: 5000,
    });

    setCnabOpen(false);
  };

  const generateCNABContent = (rows: Row[]): string => {
    // Simulação de conteúdo CNAB 240
    let content = "CNAB 240 - ARQUIVO DE REMESSA\n";
    content += "=".repeat(80) + "\n\n";
    
    rows.forEach((row, idx) => {
      content += `Registro ${idx + 1}\n`;
      content += `Fornecedor: ${row.fornecedor}\n`;
      content += `CNPJ: ${row.cnpjFornecedor}\n`;
      content += `Valor: ${formatCurrency(row.valor)}\n`;
      content += `Vencimento: ${row.vencimento}\n`;
      content += "-".repeat(80) + "\n";
    });
    
    content += "\n" + "=".repeat(80) + "\n";
    content += `Total de registros: ${rows.length}\n`;
    content += `Data de geração: ${new Date().toLocaleString('pt-BR')}\n`;
    
    return content;
  };

  const emptyCopy: Record<PaymentTabId, { title: string; desc: string }> = {
    conferir: { title: "Nada para conferir agora", desc: "Você ainda não possui lançamentos aguardando conferência." },
    aprovacao: { title: "Nenhum pagamento em aprovação", desc: "Envie pagamentos para aprovação quando necessário." },
    pagar: { title: "Os seus pagamentos estão todos em dia!", desc: "Sem pendências por aqui no momento." },
    bloqueados: { title: "Nenhum pagamento bloqueado", desc: "Não encontramos pagamentos bloqueados no momento." },
    liquidados: { title: "Ainda não há pagamentos liquidados", desc: "Assim que você liquidar, eles aparecerão aqui." },
    cancelados: { title: "Nenhum pagamento cancelado", desc: "Pagamentos cancelados aparecerão aqui." },
    todas: {
      title: "Nenhuma conta encontrada",
      desc: "Não há contas a pagar para exibir nesta visão no momento.",
    },
  };

  const showEtapaColumn = tab === "todas";
  const showFormaPagamentoColumn = tab === "todas";
  const showCbsPrevistoColumn = tab === "todas";
  const showDivergenciasColumn = tab === "todas";
  const showOrigemColumn = true;
  const tableColSpan =
    6 +
    (showCbsPrevistoColumn ? 1 : 0) +
    (erpSyncEnabled ? 1 : 0) +
    2 +
    (showFormaPagamentoColumn ? 1 : 0) +
    (showEtapaColumn ? 1 : 0) +
    (isCanceladosTab ? 1 : 0) +
    (showDivergenciasColumn ? 1 : 0) +
    (!hideStatusColumn ? 1 : 0) +
    (showOrigemColumn ? 1 : 0) +
    (isConferirTab ? 1 : 0);
  const cellTextClass =
    "px-3 py-3 text-[#5F6572] font-normal whitespace-nowrap truncate";
  const selectedRows = React.useMemo(
    () => visible.filter((r) => selected.has(data.indexOf(r))),
    [visible, selected, data]
  );

  if (visible.length === 0 && !payOpen) {
    const { title, desc } = emptyCopy[tab];
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 rounded-full bg-[#E7EEFF] flex items-center justify-center mb-3">
          <CheckCircle2 className="h-6 w-6 text-[#0C3CF7]" />
        </div>
        <h3 className="text-base font-semibold text-[#0d0f1c]">{title}</h3>
        <p className="mt-1 text-sm text-[#5F6572]">{desc}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 mb-4 flex items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="default"
            className="inline-flex items-center gap-2 font-bold"
            onClick={() => setSelected(allSelected ? new Set() : new Set(visible.map(r => data.indexOf(r))))}
          >
            Selecionar todos
            <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#EAEBEC] text-sm text-current tabular-nums min-w-[56px]">
              {selected.size}/{visible.length}
            </span>
          </Button>

          <DropdownMenu modal={false} open={hasSelection ? exportOpen : false} onOpenChange={(v) => hasSelection && setExportOpen(v)}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={!hasSelection} className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]">
                <Upload className="h-4 w-4" />
                Exportar
                {hasSelection && selectionCounterEnabled && (
                  <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#EAEBEC] text-sm text-current tabular-nums min-w-[24px]">
                    {selected.size}
                  </span>
                )}
                <ChevronDown className={["h-4 w-4 transition-transform", exportOpen ? "rotate-180" : ""].join(" ")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>CSV</DropdownMenuItem>
              <DropdownMenuItem>XLSX</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {tab !== 'todas' && tab !== 'liquidados' && tab !== 'cancelados' && (
            <DropdownMenu modal={false} open={hasSelection ? lancarOpen : false} onOpenChange={(v) => hasSelection && setLancarOpen(v)}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={!hasSelection} 
                  className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]"
                  data-testid="lancamento-dropdown-trigger"
                >
                  <PlusCircle className="h-4 w-4" />
                  Lançar
                  {hasSelection && selectionCounterEnabled && (
                    <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#EAEBEC] text-sm text-current tabular-nums min-w-[24px]">
                      {selected.size}
                    </span>
                  )}
                  <ChevronDown className={["h-4 w-4 transition-transform", lancarOpen ? "rotate-180" : ""].join(" ")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {tabs.filter(t => 
                  t.id !== tab &&
                  t.id !== "todas" &&
                  (t.id !== 'pagar' || !aprovacaoTabEnabled) &&
                  (t.id !== 'aprovacao' || aprovacaoTabEnabled) &&
                  !(
                    selectedRows.length > 0 &&
                    selectedRows.every((r) => r.lancadoEm === t.id)
                  )
                ).map(t => (
                  <DropdownMenuItem
                    key={t.id}
                    data-testid={`lancamento-${t.id}`}
                    onClick={() => {
                      const dest = t.id as LancadoEm;
                      const toMove = visible.filter((r) =>
                        selected.has(data.indexOf(r))
                      );
                      if (toMove.length === 0) return;

                      const hasConferirOrigin = tab === "conferir";

                      // Verifica se há alguma divergência não confiável entre os selecionados
                      const hasUntrustedDivergencia = toMove.some((row) => hasDivergenciaAtiva(row));

                      // Regra: pagamentos com divergência não podem ser enviados para aprovação
                      if (dest === "aprovacao" && hasUntrustedDivergencia) {
                        toast.error(
                          "Não foi possível enviar para aprovação pagamentos com divergência.",
                          {
                            duration: 5000,
                          }
                        );
                        setLancarOpen(false);
                        return;
                      }

                      // Se for de "conferir" para "pagar", mostrar modal de confirmação (com ou sem divergência)
                      if (hasConferirOrigin && dest === "pagar") {
                        setPendingLaunch({ dest, label: t.label, rows: toMove });
                        setLaunchConfirmationOpen(true);
                        setLancarOpen(false);
                        return;
                      }

                      // Se for de "conferir" para "aprovacao" e não houver divergência, mostrar modal de confirmação
                      if (
                        hasConferirOrigin &&
                        dest === "aprovacao" &&
                        !hasUntrustedDivergencia
                      ) {
                        setPendingLaunch({ dest, label: t.label, rows: toMove });
                        setLaunchConfirmationOpen(true);
                        setLancarOpen(false);
                        return;
                      }

                      // Caso contrário, executar diretamente
                      executeLaunch(dest, t.label, toMove);
                    }}
                  >
                    Em {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {tab === 'pagar' && cnabMenuEnabled && (
            <DropdownMenu modal={false} open={cnabOpen} onOpenChange={setCnabOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]">
                  <FileText className="h-4 w-4" />
                  Arquivo CNAB
                  {hasSelection && (
                    <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#EAEBEC] text-sm text-current tabular-nums min-w-[24px]">
                      {selected.size}
                    </span>
                  )}
                  <ChevronDown className={["h-4 w-4 transition-transform", cnabOpen ? "rotate-180" : ""].join(" ")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  disabled={!hasSelection}
                  onClick={() => {
                    if (hasSelection) {
                      handleGerarRemessa();
                    }
                  }}
                >
                  Gerar remessa
                </DropdownMenuItem>
                <DropdownMenuItem>Importar arquivo retorno</DropdownMenuItem>
                <DropdownMenuItem>Configurar bancos</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {(tab === "conferir" || tab === "todas") && onNovoPagamento && (
          <Button
            variant="secondary"
            size="default"
            className="ml-auto inline-flex items-center gap-2 font-bold"
            onClick={onNovoPagamento}
          >
            <Plus className="h-4 w-4" />
            Nova conta a pagar
          </Button>
        )}

        {tab === "aprovacao" && (
          <div className="ml-auto inline-flex items-center gap-2">
            <Button
              className={cn(
                "px-5 font-bold inline-flex items-center gap-2",
                !hasSelection && "hover:opacity-95"
              )}
              variant="secondary"
              disabled={!hasSelection}
              onClick={() => {
                const toReject = visible.filter((r) =>
                  selected.has(data.indexOf(r))
                );
                setRowsToReject(toReject);
                setRejectionOpen(true);
              }}
            >
              <X className="h-4 w-4" />
              Reprovar
              {hasSelection && (
                <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#EAEBEC] text-sm text-current tabular-nums min-w-[24px] ml-2">
                  {selected.size}
                </span>
              )}
            </Button>

            <Button
              className="px-5 font-bold inline-flex items-center gap-2"
              variant="default"
              disabled={!hasSelection}
              onClick={() => {
                const toApprove = visible.filter((r) =>
                  selected.has(data.indexOf(r))
                );
                setRowsToApprove(toApprove);
                setApprovalOpen(true);
              }}
            >
              <Check className="h-4 w-4" />
              Aprovar
              {hasSelection && (
                <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#0B35D5] text-white text-sm tabular-nums min-w-[24px] ml-2">
                  {selected.size}
                </span>
              )}
            </Button>
          </div>
        )}

        {tab === 'pagar' && (
          <div className="ml-auto inline-flex items-center gap-2">
            {onNovoPagamento && (
              <Button
                size="default"
                variant="ghost"
                className="px-5 font-bold inline-flex items-center gap-2 text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2]"
                onClick={onNovoPagamento}
              >
                <Plus className="h-4 w-4" />
                Novo pagamento
              </Button>
            )}

            <Button
              className="px-5 font-bold inline-flex items-center gap-2"
              variant="secondary"
              onClick={() => {
                const toMove = visible.filter((r) => selected.has(data.indexOf(r)));
                if (toMove.length === 0) return;
                executeLaunch("liquidados", "Liquidados", toMove);
              }}
            >
              <Check className="h-4 w-4" />
              Marcar como Pago
            </Button>

            <Button
              className="px-5 font-bold"
              variant="default"
              onClick={() => {
                if (pagarVersion === "v1" && !hasBanks) {
                  onRequireBanks && onRequireBanks();
                  return;
                }
                const selectedRows = visible.filter(r => selected.has(data.indexOf(r)));

                // V1: validações antes de abrir o drawer
                if (pagarVersion === "v1") {
                  // Alguma seleção em processamento?
                  const hasProcessing = selectedRows.some(r => payProcessingIds.has(r.id));
                  if (hasProcessing) {
                    toast.error(
                      "Contas já em processamento. Selecione contas em aberto ou vencidas para pagar.",
                      { duration: 5000 }
                    );
                    return;
                  }

                  // Seleção com CNPJs pagadores diferentes?
                  const distinctCnpjs = new Set(selectedRows.map(r => r.cnpjPagador)).size;
                  if (distinctCnpjs > 1) {
                    toast.error(
                      "Selecione apenas contas do mesmo CNPJ pagador para processar o pagamento.",
                      { duration: 5000 }
                    );
                    return;
                  }

                  // reset estado de sucesso do fluxo anterior, se existir
                  setPayProcessedAll(false);
                  setPayProcessing(false);
                }
                const toPay = selectedRows;
                setPayQueue(toPay);
                const summary = calculatePaymentSummary(toPay);
                setPayBase(summary.base);
                setPayFees(summary.fees);
                setPayTotal(summary.total);
                setPayOpen(true);
              }}
            >
              <CircleDollarSign className="h-4 w-4 mr-2" />
              Pagar
              {hasSelection && selectionCounterEnabled && (
                <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#0B35D5] text-white text-sm tabular-nums min-w-[24px] ml-2">
                  {selected.size}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-10" />
            <col className="w-[96px]" />
            <col className="w-[200px]" />
            <col className="w-[160px]" />
            <col className="w-[160px]" />
            <col className="w-[132px]" />
            {showCbsPrevistoColumn && <col className="w-[132px]" />}
            {erpSyncEnabled && <col className="w-[140px]" />}
            <col className="w-[120px]" />
            <col className="w-[132px]" />
            {showFormaPagamentoColumn && <col className="w-[132px]" />}
            {showEtapaColumn && <col className="w-[128px]" />}
            {isCanceladosTab && <col className="w-[168px]" />}
            {showDivergenciasColumn && <col className="w-[180px]" />}
            {!hideStatusColumn && <col className="w-[128px]" />}
            <col className="w-[120px]" />
            {isConferirTab && <col className="w-[180px]" />}
          </colgroup>
          <thead>
            <tr className="h-11 border-b border-border text-left bg-[#F5F5F6]">
              <th className="w-10 pl-3 pr-2 text-center">
                <input
                  ref={headRef}
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 mx-auto"
                  checked={allSelected}
                  onChange={(e) => {
                    const on = e.currentTarget.checked;
                    setSelected(on ? new Set(visible.map(r => data.indexOf(r))) : new Set());
                  }}
                />
              </th>
              <th className="px-3 py-2 text-[rgba(4,14,35,0.64)] text-center">Detalhes</th>
              <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Fornecedor</th>
              <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">CNPJ Fornecedor</th>
              <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">CNPJ Pagador</th>
              <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Valor</th>
              {showCbsPrevistoColumn && (
                <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">
                  <div className="inline-flex items-center gap-1">
                    <span>CBS previsto</span>
                    <div className="group relative">
                      <button
                        type="button"
                        className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-[#E7EEFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-1"
                        aria-label="Informações sobre CBS previsto"
                      >
                        <Info className="h-4 w-4 text-[#5F6572]" />
                      </button>
                      <div className="pointer-events-none invisible absolute left-0 top-6 z-50 w-80 rounded-md border border-[#EBECEE] bg-white p-3 opacity-0 shadow-lg transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
                        <p className="text-xs font-normal leading-relaxed text-[#5F6572]">
                          Este valor reflete a tag &lt;CBS&gt; identificada no XML da notas
                          vinculada à conta a pagar. Os valores zerados correspondem a casos em
                          que a tag &lt;CBS&gt; não foi preenchida no XML.
                        </p>
                      </div>
                    </div>
                  </div>
                </th>
              )}
              {erpSyncEnabled && (
                <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">ERP</th>
              )}
              <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Emissão</th>
              <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Vencimento</th>
              {showFormaPagamentoColumn && (
                <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Pagamento</th>
              )}
              {showEtapaColumn && (
                <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Lançado em</th>
              )}
              {isCanceladosTab && (
                <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Cancelamento</th>
              )}
              {showDivergenciasColumn && (
                <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Pendências</th>
              )}
              {!hideStatusColumn && (
                <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Status</th>
              )}
              <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Origem</th>
              {isConferirTab && (
                <th className="px-3 py-2 text-[rgba(4,14,35,0.64)]">Divergências</th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={tableColSpan} className="px-3 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-lg font-semibold text-[#0d0f1c]">Nenhum pagamento para {tab}</p>
                    <p className="text-sm text-[#5F6572]">Não há pagamentos nesta categoria no momento.</p>
                  </div>
                </td>
              </tr>
            )}
            {pageItems.map((r, i) => {
              const isSel = selected.has(data.indexOf(r));
              const isViewing = viewingRow ? (viewingRow as Row).id === r.id : false;
              const isFocused = i === focusedRowIndex;
              const isErpUpdating = erpUpdating?.has(r.id);
              const isNew = isRecentlyAdded(r.id);
              const dueDisplay = getDueDateDisplay(r);

              return (
                <tr
                  key={r.id}
                  className={[
                    "border-b border-border last:border-b-0 transition-all duration-300",
                    isSel ? "bg-[#F3F5FF]" : isViewing || isFocused ? "bg-[#FAFAFF]" : "hover:bg-[#FAFAFF]",
                    isNew && "animate-[highlight_1.5s_ease-in-out]",
                  ].join(" ")}
                  style={isNew ? {
                    animation: 'highlight 1.5s ease-in-out',
                  } : undefined}
                >
                  <td className="pl-3 pr-2 py-3 align-middle relative text-center">
                    {(isViewing || isFocused) && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0C3CF7]" aria-hidden />
                    )}
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 mx-auto"
                      checked={isSel}
                      onChange={(e) => toggleRow(data.indexOf(r), e.currentTarget.checked)}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Button
                      variant="secondary"
                      size="default"
                      className="font-bold"
                      data-detail-trigger="true"
                      onClick={() => onOpenDetail(r)}
                    >
                      Ver
                    </Button>
                  </td>
                  <td className={cellTextClass}>
                    <span className="truncate">{r.fornecedor}</span>
                  </td>
                  <td className={cellTextClass}>{r.cnpjFornecedor}</td>
                  <td className={cellTextClass}>{r.cnpjPagador}</td>
                  <td className={cellTextClass}>{formatCurrency(r.valor)}</td>
                  {showCbsPrevistoColumn && (
                    <td className={cellTextClass}>
                      {formatCurrency(getCbsPrevistoValue(r))}
                    </td>
                  )}
                  {erpSyncEnabled && (
                    <td className="px-3 py-3">
                      {isErpUpdating ? (
                        <span className={getTagClasses('bg-[#E6F3FD]', 'text-[#003F70]', 'border-[#A8D5F7]')}>
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          Atualizando...
                        </span>
                      ) : (
                        <span className={getTagClasses('bg-emerald-50', 'text-emerald-700', 'border-emerald-200')}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Sincronizado
                        </span>
                      )}
                    </td>
                  )}
                  <td className={cellTextClass}>{getNotaEmissaoDisplay(r)}</td>
                  <td className="px-3 py-3 text-[#0d0f1c] whitespace-nowrap">
                    <span className="flex min-w-0 flex-1 items-center gap-1">
                      <span className="tabular-nums truncate">{dueDisplay.label}</span>
                      {r.vencimentoEditadoManual ? (
                        <span
                          className="group relative inline-flex shrink-0 items-center justify-center rounded p-0.5 text-[#5F6572] hover:bg-muted/40"
                          aria-label="Data editada manualmente"
                        >
                          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute bottom-full left-1/2 z-[35] mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0d0f1c] px-2.5 py-1.5 text-left text-xs font-medium text-white shadow-md opacity-0 transition-opacity duration-75 ease-out delay-0 group-hover:opacity-100"
                          >
                            Data editada manualmente
                          </span>
                        </span>
                      ) : null}
                    </span>
                  </td>
                  {showFormaPagamentoColumn && (
                    <td className={cellTextClass}>
                      {r.formaPagamento?.tipo || "Não informado"}
                    </td>
                  )}
                  {showEtapaColumn && (
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Tag
                        bgColor="bg-[#F5F5F6]"
                        textColor="text-[#5F6572]"
                        borderColor="border-[#E3E4E6]"
                      >
                        {getEtapaLabel(r.lancadoEm)}
                      </Tag>
                    </td>
                  )}
                  {isCanceladosTab && (
                    <td className="px-3 py-3 text-[#5F6572] whitespace-nowrap truncate">{getCancelamentoLabel(r)}</td>
                  )}
                  {showDivergenciasColumn && (
                    <td className="px-3 py-3 text-[#5F6572] font-normal whitespace-nowrap">
                      <PendenciasCell row={r} />
                    </td>
                  )}
                  {!hideStatusColumn && (
                    <td className="px-3 py-3">
                      <StatusTag
                        value={
                          payProcessingIds.has(r.id)
                            ? "Processando"
                            : r.status
                        }
                      />
                    </td>
                  )}
                  <td className={cellTextClass}>{mapOrigem(r)}</td>
                  {isConferirTab && (
                    <td className="px-3 py-3 text-[#5F6572] whitespace-nowrap truncate">{getDivergenciaLabel(r)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagarVersion === "v1" ? (
        <PaymentSummaryDrawer
          open={payOpen}
          onOpenChange={setPayOpen}
          selectedRows={payQueue.length > 0 ? payQueue : visible.filter(r => selected.has(data.indexOf(r)))}
          bankAccounts={bankAccounts}
          paymentState={{
            bank: payBank,
            setBank: setPayBank,
            base: payBase,
            fees: payFees,
            total: payTotal,
            processing: payProcessing,
            processedAll: payProcessedAll,
            queue: payQueue,
            index: payIndex,
            itemProgress: payItemProgress,
          }}
          onConfirm={handleConfirmPayment}
          onComplete={handleCompletePayment}
          onContinueInBackground={handleContinueInBackground}
          onRemoveRow={(rowId) => {
            setPayQueue((prev) => {
              const next = prev.filter((r) => r.id !== rowId);
              if (next.length === 0) {
                setPayOpen(false);
              }
              return next;
            });
            setSelected((prev) => {
              const next = new Set(prev);
              const idx = data.findIndex((r) => r.id === rowId);
              if (idx >= 0) next.delete(idx);
              return next;
            });
          }}
        />
      ) : (
        <PaymentModal
          open={payOpen}
          onOpenChange={setPayOpen}
          selectedRows={payQueue.length > 0 ? payQueue : visible.filter(r => selected.has(data.indexOf(r)))}
          paymentState={{
            bank: payBank,
            setBank: setPayBank,
            base: payBase,
            fees: payFees,
            total: payTotal,
            processing: payProcessing,
            processedAll: payProcessedAll,
            queue: payQueue,
            index: payIndex,
            itemProgress: payItemProgress,
          }}
          onConfirm={handleConfirmPayment}
          onComplete={handleCompletePayment}
          onContinueInBackground={handleContinueInBackground}
        />
      )}

      <RejectionModal
        open={rejectionOpen}
        onClose={() => {
          setRejectionOpen(false);
          setRowsToReject([]);
        }}
        selectedRows={rowsToReject}
        onConfirm={(action) => {
          // Determina o destino baseado na ação selecionada
          let targetTab: Row['lancadoEm'] = 'aprovacao'; // padrão para 'reject'
          let statusMessage = 'Pagamento reprovado';
          let statusMessagePlural = 'pagamentos reprovados';
          
          if (action === 'reject-block') {
            targetTab = 'bloqueados';
            statusMessage = 'Pagamento reprovado e bloqueado';
            statusMessagePlural = 'pagamentos reprovados e bloqueados';
          } else if (action === 'reject-cancel') {
            targetTab = 'cancelados';
            statusMessage = 'Pagamento reprovado e cancelado';
            statusMessagePlural = 'pagamentos reprovados e cancelados';
          }
          
          // Atualiza os itens com base na ação selecionada
          setData(prev => prev.map(r => {
            if (!rowsToReject.some(item => item.id === r.id)) return r;
            
            // Atualiza etapasVisitadas - garantindo que conferir e aprovacao estejam marcadas
            const currentVisitedStages = r.etapasVisitadas ?? [];
            let updatedVisitedStages = [...currentVisitedStages];
            
            // Garante que "conferir" está no histórico (concluída)
            if (!updatedVisitedStages.includes('conferir')) {
              updatedVisitedStages.push('conferir');
            }
            
            // Garante que "aprovacao" está no histórico (reprovada)
            if (!updatedVisitedStages.includes('aprovacao')) {
              updatedVisitedStages.push('aprovacao');
            }
            
            // Adiciona a aba de destino ao histórico (se diferente de aprovacao)
            if (targetTab !== 'aprovacao' && !updatedVisitedStages.includes(targetTab)) {
              updatedVisitedStages.push(targetTab);
            }
            
            return {
              ...r,
              lancadoEm: targetTab,
              etapasVisitadas: updatedVisitedStages as any,
              aprovacao: {
                ...r.aprovacao!,
                statusAprovacao: 'Rejeitado' as const,
                dataAprovacao: new Date().toLocaleDateString('pt-BR'),
              },
            };
          }));

          // Mostra toast
          toast.error(
            rowsToReject.length === 1 
              ? statusMessage
              : `${rowsToReject.length} ${statusMessagePlural}`,
            {
              duration: 5000,
            }
          );

          setSelected(new Set());
          setRejectionOpen(false);
          setRowsToReject([]);
        }}
      />

      <ApprovalConfirmationModal
        open={approvalOpen}
        onClose={() => {
          setApprovalOpen(false);
          setRowsToApprove([]);
        }}
        selectedRows={rowsToApprove}
        onConfirm={() => {
          // Atualiza os itens como aprovados e move para "pagar"
          setData(prev => prev.map(r => {
            if (!rowsToApprove.some(item => item.id === r.id)) return r;
            
            // Atualiza etapasVisitadas
            const currentVisitedStages = r.etapasVisitadas ?? [];
            const originStage = r.lancadoEm;
            let updatedVisitedStages = [...currentVisitedStages];
            if (!updatedVisitedStages.includes(originStage)) {
              updatedVisitedStages.push(originStage);
            }
            if (!updatedVisitedStages.includes('pagar')) {
              updatedVisitedStages.push('pagar');
            }
            
            return {
              ...r,
              lancadoEm: 'pagar' as const,
              etapasVisitadas: updatedVisitedStages as any,
              aprovacao: {
                ...r.aprovacao!,
                statusAprovacao: 'Aprovado' as const,
                dataAprovacao: new Date().toLocaleDateString('pt-BR'),
              },
            };
          }));

          // Mostra toast de sucesso
          toast.success(
            rowsToApprove.length === 1 
              ? 'Pagamento aprovado com sucesso'
              : `${rowsToApprove.length} pagamentos aprovados com sucesso`,
            {
              duration: 5000,
            }
          );

          setSelected(new Set());
          setApprovalOpen(false);
          setRowsToApprove([]);
        }}
      />

      <LaunchConfirmationModal
        open={launchConfirmationOpen}
        onClose={() => {
          setLaunchConfirmationOpen(false);
          setPendingLaunch(null);
        }}
        selectedRows={pendingLaunch?.rows || []}
        fromTab={tab}
        toTab={pendingLaunch?.dest || 'pagar'}
        onConfirm={() => {
          if (pendingLaunch) {
            executeLaunch(pendingLaunch.dest, pendingLaunch.label, pendingLaunch.rows);
            setLaunchConfirmationOpen(false);
            setPendingLaunch(null);
          }
        }}
      />

    </>
  );
}

