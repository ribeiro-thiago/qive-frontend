"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BigNumberCard } from "./BigNumberCard";
import { formatCurrency, parseDate } from "../utils/formatters";
import { groupByEtapa } from "../utils/calculations";
import { useRouter } from "next/navigation";
import { EtapaBarChart } from "./EtapaBarChart";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SelectButton } from "@/components/ui/select-button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { ChevronDown, Calendar } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";

interface VisaoGeralEtapasProps {
  contas: Array<{
    etapa: string;
    valor: number;
    dataEmissao?: string;
  }>;
  onNavigate?: (etapa: string) => void;
  selectedCompany?: string;
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

export function VisaoGeralEtapas({ contas, onNavigate, selectedCompany }: VisaoGeralEtapasProps) {
  const router = useRouter();
  const [selectedEtapa, setSelectedEtapa] = React.useState<string | null>(null);
  const [isWideScreen, setIsWideScreen] = React.useState(false);
  
  // Estados dos filtros
  const [periodoType, setPeriodoType] = React.useState<PeriodoType>("todo");
  const [dataInicio, setDataInicio] = React.useState<Date | undefined>();
  const [dataFim, setDataFim] = React.useState<Date | undefined>();
  const [visualizacaoType, setVisualizacaoType] = React.useState<VisualizacaoType>("valor");

  React.useEffect(() => {
    const checkWidth = () => {
      setIsWideScreen(window.innerWidth >= 1650);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Filtrar contas por período
  const contasFiltradas = React.useMemo(() => {
    if (periodoType === "todo") {
      return contas;
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
        return contas;
      }
      inicio = dataInicio;
      fim = dataFim;
    }

    return contas.filter(conta => {
      if (!conta.dataEmissao) return false;
      const dataEmissao = parseDate(conta.dataEmissao);
      if (!dataEmissao) return false;
      
      const dataEmissaoTime = dataEmissao.getTime();
      const inicioTime = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime();
      const fimTime = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate(), 23, 59, 59).getTime();
      
      return dataEmissaoTime >= inicioTime && dataEmissaoTime <= fimTime;
    });
  }, [contas, periodoType, dataInicio, dataFim]);

  const etapaData = React.useMemo(() => {
    const grouped = groupByEtapa(contasFiltradas);
    const map = new Map(grouped.map(e => [e.etapa.toLowerCase(), e]));
    
    return ETAPAS.map(etapa => {
      const data = map.get(etapa.id);
      return {
        ...etapa,
        count: data?.count || 0,
        value: data?.value || 0,
      };
    });
  }, [contasFiltradas]);

  const handleClick = (etapaId: string) => {
    setSelectedEtapa(selectedEtapa === etapaId ? null : etapaId);
    if (onNavigate) {
      onNavigate(etapaId);
    } else {
      // Navegar para gestão de pagamentos com filtro
      const params = new URLSearchParams();
      params.set('tab', etapaId);
      if (selectedCompany) {
        params.set('company', selectedCompany);
      }
      router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
    }
  };

  const handlePeriodoChange = (tipo: PeriodoType) => {
    setPeriodoType(tipo);
    if (tipo !== "personalizado") {
      setDataInicio(undefined);
      setDataFim(undefined);
    }
  };

  return (
    <Card className="rounded-xl bg-white border border-border">
      <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
        <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Visão Geral por Etapa</h3>
      </div>
      <CardContent>
        {/* Filtros */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            {/* Filtro de Período */}
            <div className="w-full sm:w-auto">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                Período
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
                  Data Início
                </Label>
                <DatePicker
                  date={dataInicio}
                  onDateChange={setDataInicio}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="w-full sm:w-[200px]">
                <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                  Data Fim
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

        {/* Big Numbers */}
        <div 
          className={`grid gap-4 ${isWideScreen ? 'grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}
        >
          {etapaData.map((etapa) => (
            <BigNumberCard
              key={etapa.id}
              value={visualizacaoType === "valor" ? formatCurrency(etapa.value) : etapa.count.toString()}
              label={etapa.label}
              count={etapa.count}
              onClick={() => handleClick(etapa.id)}
              isSelected={selectedEtapa === etapa.id}
              disabled={etapa.count === 0}
            />
          ))}
        </div>
        
        {/* Gráfico de barras */}
        <div className="mt-6 -mx-6">
          <div className="px-6">
            <EtapaBarChart 
              data={etapaData.map(e => ({
                etapa: e.id,
                label: e.label,
                count: e.count,
                value: e.value,
              }))} 
              visualizacaoType={visualizacaoType}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

