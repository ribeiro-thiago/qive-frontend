"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, parseDate } from "../utils/formatters";
import { groupByEtapa } from "../utils/calculations";
import { StatusPagamentoChart } from "./StatusPagamentoChart";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { ChevronDown, Calendar, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { useTheme } from "@/lib/theme/useTheme";
import { cn } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";
import { useRouter } from "next/navigation";

interface StatusPagamentoProps {
  contasEtapas: Array<{
    etapa: string;
    valor: number;
    dataEmissao?: string;
  }>;
  contasPagamentos: Array<{
    vencimento: string | null;
    dataPagamento?: string;
    valor: number;
    status: string;
    dataEmissao?: string;
  }>;
  selectedCompany?: string | string[];
}

type PeriodoType = "todo" | "mes" | "personalizado";
type VisualizacaoType = "valor" | "quantidade";

const ETAPAS = [
  { id: "conferir", label: "Conferir" },
  { id: "aprovacao", label: "Aprovar" },
  { id: "pagar", label: "Pagar" },
  { id: "bloqueados", label: "Bloqueados" },
];

const PERIODO_LABELS: Record<PeriodoType, string> = {
  todo: "Todo o período",
  mes: "Mês atual",
  personalizado: "Personalizado",
};

const VISUALIZACAO_LABELS: Record<VisualizacaoType, string> = {
  valor: "Valor total",
  quantidade: "Quantidade",
};

export function StatusPagamento({ contasEtapas, contasPagamentos, selectedCompany }: StatusPagamentoProps) {
  const router = useRouter();
  const [periodoType, setPeriodoType] = React.useState<PeriodoType>("todo");
  const [dataInicio, setDataInicio] = React.useState<Date | undefined>();
  const [dataFim, setDataFim] = React.useState<Date | undefined>();
  const [visualizacaoType, setVisualizacaoType] = React.useState<VisualizacaoType>("valor");
  const [selectedPercentage, setSelectedPercentage] = React.useState<number | null>(null);

  // Filtrar contas por período (baseado na data de emissão)
  const contasEtapasFiltradasPorPeriodo = React.useMemo(() => {
    if (periodoType === "todo") {
      return contasEtapas;
    }

    const hoje = new Date();
    let inicio: Date;
    let fim: Date;

    if (periodoType === "mes") {
      inicio = startOfMonth(hoje);
      fim = endOfMonth(hoje);
    } else {
      // personalizado
      if (!dataInicio || !dataFim) {
        return contasEtapas;
      }
      inicio = dataInicio;
      fim = dataFim;
    }

    return contasEtapas.filter(conta => {
      if (!conta.dataEmissao) return false;
      const dataEmissao = parseDate(conta.dataEmissao);
      if (!dataEmissao) return false;
      
      const dataEmissaoTime = dataEmissao.getTime();
      const inicioTime = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime();
      const fimTime = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate(), 23, 59, 59).getTime();
      
      return dataEmissaoTime >= inicioTime && dataEmissaoTime <= fimTime;
    });
  }, [contasEtapas, periodoType, dataInicio, dataFim]);

  const etapaData = React.useMemo(() => {
    const grouped = groupByEtapa(contasEtapasFiltradasPorPeriodo);
    const map = new Map(grouped.map(e => [e.etapa.toLowerCase(), e]));
    
    return ETAPAS.map(etapa => {
      const data = map.get(etapa.id);
      return {
        ...etapa,
        count: data?.count || 0,
        value: data?.value || 0,
      };
    });
  }, [contasEtapasFiltradasPorPeriodo]);

  // Filtrar contas de pagamentos por período (baseado na data de emissão)
  const contasPagamentosFiltradasPorPeriodo = React.useMemo(() => {
    if (periodoType === "todo") {
      return contasPagamentos;
    }

    const hoje = new Date();
    let inicio: Date;
    let fim: Date;

    if (periodoType === "mes") {
      inicio = startOfMonth(hoje);
      fim = endOfMonth(hoje);
    } else {
      // personalizado
      if (!dataInicio || !dataFim) {
        return contasPagamentos;
      }
      inicio = dataInicio;
      fim = dataFim;
    }

    return contasPagamentos.filter(conta => {
      if (!conta.dataEmissao) return false;
      const dataEmissao = parseDate(conta.dataEmissao);
      if (!dataEmissao) return false;
      
      const dataEmissaoTime = dataEmissao.getTime();
      const inicioTime = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime();
      const fimTime = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate(), 23, 59, 59).getTime();
      
      return dataEmissaoTime >= inicioTime && dataEmissaoTime <= fimTime;
    });
  }, [contasPagamentos, periodoType, dataInicio, dataFim]);

  // Calcular porcentagem de pagamentos em dia (baseado no período selecionado)
  const porcentagemEmDia = React.useMemo(() => {
    // Se não há dados de etapas no período, não há dados para calcular porcentagem
    if (contasEtapasFiltradasPorPeriodo.length === 0) {
      return 0;
    }

    const contasComVencimento = contasPagamentosFiltradasPorPeriodo.filter(
      conta => conta.status === 'Pago' && conta.vencimento && conta.dataPagamento
    );
    
    if (contasComVencimento.length === 0) return 0;

    const pagasEmDia = contasComVencimento.filter(conta => {
      const vencimento = parseDate(conta.vencimento || undefined);
      const pagamento = parseDate(conta.dataPagamento || undefined);
      
      if (!vencimento || !pagamento) return false;
      
      return pagamento.getTime() <= vencimento.getTime();
    });

    return Math.round((pagasEmDia.length / contasComVencimento.length) * 100);
  }, [contasPagamentosFiltradasPorPeriodo, contasEtapasFiltradasPorPeriodo]);

  // Determinar classes de cores baseadas na porcentagem (mini card)
  const getCardClasses = (percentage: number) => {
    if (percentage >= 75) {
      return {
        container: 'bg-emerald-50',
        text: 'text-emerald-800',
        iconColor: '#059669'
      };
    } else if (percentage >= 50) {
      return {
        container: 'bg-[#FFF4E6]',
        text: 'text-[#B85600]',
        iconColor: '#B85600'
      };
    } else {
      return {
        container: 'bg-red-50',
        text: 'text-red-700',
        iconColor: '#DC2626'
      };
    }
  };

  // Obter ícone baseado na porcentagem
  const getIcon = (percentage: number) => {
    if (percentage >= 75) {
      return CheckCircle;
    } else if (percentage >= 50) {
      return AlertTriangle;
    } else {
      return AlertTriangle;
    }
  };

  const displayPercentage = selectedPercentage ?? porcentagemEmDia;
  const cardClasses = getCardClasses(displayPercentage);

  const handlePeriodoChange = (tipo: PeriodoType) => {
    setPeriodoType(tipo);
    if (tipo !== "personalizado") {
      setDataInicio(undefined);
      setDataFim(undefined);
    }
    // Resetar porcentagem selecionada quando o período muda para mostrar o valor real do novo período
    setSelectedPercentage(null);
  };

  const formatDateBR = React.useCallback((date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = String(date.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }, []);

  const buildPeriodoParams = React.useCallback(() => {
    const params = new URLSearchParams();
    if (periodoType === "mes") {
      const hoje = new Date();
      params.set("emissaoInicio", formatDateBR(startOfMonth(hoje)));
      params.set("emissaoFim", formatDateBR(endOfMonth(hoje)));
    } else if (periodoType === "personalizado" && dataInicio && dataFim) {
      params.set("emissaoInicio", formatDateBR(dataInicio));
      params.set("emissaoFim", formatDateBR(dataFim));
    }
    return params;
  }, [periodoType, dataInicio, dataFim, formatDateBR]);

  const handleNavigateEtapa = React.useCallback((etapa: string) => {
    const params = buildPeriodoParams();
    params.set("tab", etapa);
    if (selectedCompany) {
      const companyParam = Array.isArray(selectedCompany)
        ? selectedCompany.join(",")
        : selectedCompany;
      params.set("company", companyParam);
    }
    router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
  }, [buildPeriodoParams, selectedCompany, router]);

  // Resetar porcentagem selecionada quando as datas personalizadas mudam
  React.useEffect(() => {
    if (periodoType === "personalizado") {
      setSelectedPercentage(null);
    }
  }, [periodoType, dataInicio, dataFim]);

  return (
    <Card className="rounded-xl bg-white border border-border h-full flex flex-col min-h-[500px]">
      <div className="px-4 py-3 border-b flex items-center h-[62px] flex-shrink-0">
        <h3 className="text-sm font-semibold text-[#0d0f1c]">Etapa dos Pagamentos</h3>
        <div className="group relative ml-2">
          <button
            className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Informações sobre o gráfico"
          >
            <Info className="w-4 h-4 text-[#5F6572]" />
          </button>
          <div className="absolute left-0 top-6 w-64 p-3 bg-white border border-[#EBECEE] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
            <p className="text-xs text-[#5F6572] leading-relaxed">
              Mostra a distribuição de contas por etapa do processo de pagamento (Conferir, Aprovar, Pagar, Bloqueados)
            </p>
          </div>
        </div>
      </div>
      <CardContent className="flex flex-col h-full overflow-visible">
        {/* Filtros */}
        <div className="mb-6 flex-shrink-0 flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-start gap-3">
            {/* Filtro de Período */}
            <div className="w-full sm:w-auto">
              <Label className="mb-2 block text-sm font-semibold text-[#5F6572]">
                Período de Emissão
              </Label>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="w-full sm:w-[200px] px-3 inline-flex items-center justify-between gap-2 h-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground font-normal text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {PERIODO_LABELS[periodoType]}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuItem onClick={() => handlePeriodoChange("todo")}>
                    Todo o período
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePeriodoChange("mes")}>
                    Mês atual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePeriodoChange("personalizado")}>
                    Personalizado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Filtro de Visualização */}
            <div className="w-full sm:w-auto">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                Visualização
              </Label>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="w-full sm:w-[200px] px-3 inline-flex items-center justify-between gap-2 h-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground font-normal text-sm">
                    <span>{VISUALIZACAO_LABELS[visualizacaoType]}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setVisualizacaoType("valor")}>
                    Valor total
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVisualizacaoType("quantidade")}>
                    Quantidade
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filtros de Data (quando Personalizado) */}
          {periodoType === "personalizado" && (
            <div className="flex flex-wrap gap-3">
              <div className="w-full sm:w-[200px]">
                <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                  Data Início Emissão
                </Label>
                <DatePicker
                  date={dataInicio}
                  onDateChange={setDataInicio}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="w-full sm:w-[200px]">
                <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                  Data Fim Emissão
                </Label>
                <DatePicker
                  date={dataFim}
                  onDateChange={setDataFim}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
          )}
        </div>

        {/* Gráfico */}
        <div className="flex-1 min-h-[300px] w-full overflow-visible">
          <StatusPagamentoChart
            data={etapaData.map(e => ({
              etapa: e.id,
              label: e.label,
              count: e.count,
              value: e.value,
            }))}
            visualizacaoType={visualizacaoType}
            onBarClick={handleNavigateEtapa}
          />
        </div>

        {/* Card - Pagamentos em Dia */}
        <div className="mt-6 flex-shrink-0 w-full">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-4 rounded-md cursor-context-menu",
                  cardClasses.container
                )}
              >
                {React.createElement(getIcon(displayPercentage), {
                  className: "w-5 h-5 flex-shrink-0",
                  style: { color: cardClasses.iconColor }
                })}
                <div className={cn("text-sm flex-1 whitespace-normal break-words text-left", cardClasses.text)}>
                  <span className="font-semibold">{displayPercentage}%</span>
                  <span> de pagamentos em dia</span>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => setSelectedPercentage(75)}>
                75%+
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setSelectedPercentage(50)}>
                50%+
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setSelectedPercentage(49)}>
                49%-
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setSelectedPercentage(null)}>
                Reset default
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </CardContent>
    </Card>
  );
}

