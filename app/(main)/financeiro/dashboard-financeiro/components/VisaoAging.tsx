"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "../utils/formatters";
import { parseDate, getStartOfDay } from "../utils/formatters";
import { groupByAging, isVencida } from "../utils/calculations";
import { useRouter } from "next/navigation";
import { AgingBarChart } from "./AgingBarChart";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Info, X, AlertTriangle } from "lucide-react";
interface VisaoAgingProps {
  contas: Array<{
    vencimento: string | null;
    valor: number;
    status: string;
  }>;
  onNavigate?: (tipo: "aberto" | "vencidas", bucket: string) => void;
  selectedCompany?: string | string[];
  semVencimentoCount?: number;
}

type VisualizacaoType = "valor" | "quantidade";
type TipoContaType = "aberto" | "vencidas";

const BUCKET_LABELS: Record<string, string> = {
  "0-7": "Até 7 dias",
  "8-15": "8-15 dias",
  "16-30": "16-30 dias",
  "31-60": "31-60 dias",
  "60+": "+60 dias",
};

const VISUALIZACAO_LABELS: Record<VisualizacaoType, string> = {
  valor: "Valor",
  quantidade: "Quantidade",
};

const TIPO_CONTA_LABELS: Record<TipoContaType, string> = {
  aberto: "Aberto/Pagar",
  vencidas: "Vencidas",
};

export function VisaoAging({ contas, onNavigate, selectedCompany, semVencimentoCount = 0 }: VisaoAgingProps) {
  const router = useRouter();
  const hoje = getStartOfDay(new Date());
  const formatDateBR = React.useCallback((date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = String(date.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }, []);

  // Estados dos filtros
  const [visualizacaoType, setVisualizacaoType] = React.useState<VisualizacaoType>("quantidade");
  const [tipoContaType, setTipoContaType] = React.useState<TipoContaType>("aberto");
  
  // Estado para controlar se o alerta foi removido
  const [isMounted, setIsMounted] = React.useState(false);
  // Inicializar com base no localStorage se disponível (apenas no cliente)
  const [alertDismissed, setAlertDismissed] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aging-alert-dismissed") === "true";
    }
    return false;
  });

  // Verificar preferência do usuário ao montar
  React.useEffect(() => {
    setIsMounted(true);
    const dismissed = localStorage.getItem("aging-alert-dismissed");
    if (dismissed === "true") {
      setAlertDismissed(true);
    }
  }, []);

  const handleDismissAlert = () => {
    setAlertDismissed(true);
    localStorage.setItem("aging-alert-dismissed", "true");
  };

  const agingData = React.useMemo(() => {
    const contasAberto = contas
      .filter(c => c.status === "Aberto" && c.vencimento)
      .map(c => ({
        vencimento: parseDate(c.vencimento || undefined),
        valor: c.valor,
      }));
    
    const contasVencidas = contas
      .filter(c => c.status === "Vencido")
      .map(c => ({
        vencimento: parseDate(c.vencimento || undefined),
        valor: c.valor,
      }));

    const aberto = groupByAging(contasAberto).aberto;
    const vencidas = groupByAging(contasVencidas).vencidas;

    return { aberto, vencidas };
  }, [contas]);

  const handleClick = (tipo: "aberto" | "vencidas", bucket: string) => {
    if (onNavigate) {
      onNavigate(tipo, bucket);
    } else {
      const params = new URLSearchParams();

      params.set("tab", "conferir");
      params.set("status", tipo === "vencidas" ? "Vencido" : "Aberto");

      const inicio = new Date(hoje);
      const fim = new Date(hoje);
      const [startRaw, endRaw] = bucket.split("-");
      const startDays = Number.parseInt(startRaw, 10);
      const endDays = endRaw === "+" ? null : Number.parseInt(endRaw, 10);

      if (tipo === "aberto") {
        inicio.setDate(hoje.getDate() + (Number.isFinite(startDays) ? startDays : 0));
        if (endDays === null) {
          fim.setDate(hoje.getDate() + 3650);
        } else {
          fim.setDate(hoje.getDate() + endDays);
        }
      } else {
        if (endDays === null) {
          inicio.setDate(hoje.getDate() - 3650);
          fim.setDate(hoje.getDate() - (Number.isFinite(startDays) ? startDays : 0));
        } else {
          inicio.setDate(hoje.getDate() - endDays);
          fim.setDate(hoje.getDate() - (Number.isFinite(startDays) ? startDays : 0));
        }
      }

      params.set("vencimentoInicio", formatDateBR(inicio));
      params.set("vencimentoFim", formatDateBR(fim));

      if (selectedCompany) {
        const companyParam = Array.isArray(selectedCompany) 
          ? selectedCompany.join(',') 
          : selectedCompany;
        params.set('company', companyParam);
      }
      router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
    }
  };

  // Dados do gráfico atual baseado no filtro de tipo de conta
  const currentData = tipoContaType === "aberto" ? agingData.aberto : agingData.vencidas;
  
  // Contar contas com vencimento preenchido (para tipo "aberto")
  const contasComVencimento = React.useMemo(() => {
    if (tipoContaType !== "aberto") return 0;
    return contas.filter(c => c.status === "Aberto" && c.vencimento).length;
  }, [contas, tipoContaType]);
  
  // Preparar dados para o gráfico
  const chartData = currentData.map(item => ({
    bucket: item.bucket,
    label: BUCKET_LABELS[item.bucket],
    count: item.count,
    value: item.value,
  }));

  return (
    <Card className="rounded-xl bg-white border border-border h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center h-[62px] flex-shrink-0">
        <h3 className="text-sm font-semibold text-[#0d0f1c]">Visão de Aging</h3>
        <div className="group relative ml-2">
          <button
            className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Informações sobre o gráfico"
          >
            <Info className="w-4 h-4 text-[#5F6572]" />
          </button>
          <div className="absolute left-0 top-6 w-64 p-3 bg-white border border-[#EBECEE] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
            <p className="text-xs text-[#5F6572] leading-relaxed">
              Distribui as contas por faixas de tempo até o vencimento ou desde o vencimento
            </p>
          </div>
        </div>
      </div>
      <CardContent className="flex flex-col flex-1 min-h-0">
        {/* Filtros */}
        <div className="mb-6 flex-shrink-0 flex flex-col items-start gap-4">
          {/* Alerta de vencimentos faltantes */}
          {isMounted && semVencimentoCount > 0 && !alertDismissed && (
            <div className="w-full flex items-center gap-2 px-4 py-4 rounded-md" style={{ backgroundColor: '#FFF2E0' }}>
              <Info className="w-5 h-5 flex-shrink-0" style={{ color: '#B85600' }} />
              <div className="text-sm text-[#5F6572] flex-1 whitespace-normal break-words text-left">
                <strong className="font-bold">
                  {semVencimentoCount}{" "}
                  {semVencimentoCount === 1 ? "data de vencimento" : "datas de vencimento"}
                </strong>
                <span>
                  {" "}
                  faltantes afetam esta visão. Confira em{" "}
                </span>
                <strong className="font-bold">Últimas pendências.</strong>
              </div>
              <button
                onClick={handleDismissAlert}
                className="flex items-center justify-center w-5 h-5 rounded-full hover:opacity-70 transition-colors flex-shrink-0"
                aria-label="Fechar alerta"
              >
                <X className="w-3.5 h-3.5 text-[#5B616F]" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            {/* Filtro de Tipo de Conta */}
            <div className="w-full sm:w-auto">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                Tipo de conta
              </Label>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="w-full sm:w-[200px] px-3 inline-flex items-center justify-between gap-2 h-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground font-normal text-sm">
                    <span>{TIPO_CONTA_LABELS[tipoContaType]}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setTipoContaType("aberto")}>
                    Aberto/Pagar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTipoContaType("vencidas")}>
                    Vencidas
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
                    Valor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVisualizacaoType("quantidade")}>
                    Quantidade
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Título descritivo */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: "#5F6572" }}>
              {visualizacaoType === "quantidade" 
                ? tipoContaType === "aberto" 
                  ? `${contasComVencimento} contas a pagar com vencimentos preenchidos.`
                  : "Contas vencidas"
                : `${tipoContaType === "aberto" ? "Valor a pagar" : "Valor vencido"}`
              }
            </h3>
            <div className="group relative">
              <button
                className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Informações sobre o gráfico"
              >
                <Info className="w-3.5 h-3.5 text-[#5F6572]" />
              </button>
              <div className="absolute left-0 top-5 w-64 p-3 bg-white border border-[#EBECEE] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                <p className="text-xs text-[#5F6572] leading-relaxed">
                  O gráfico é gerado somente com contas que possuem data de vencimento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="-mx-6 flex-1 min-h-[300px] flex">
          <div className="px-6 w-full h-full">
            <AgingBarChart
              data={chartData}
              visualizacaoType={visualizacaoType}
              tipo={tipoContaType}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

