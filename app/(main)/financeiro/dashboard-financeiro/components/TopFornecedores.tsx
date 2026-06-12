"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/date-picker";
import { ChevronDown, Calendar, Info, Pen } from "lucide-react";
import { formatCurrency, parseDate } from "../utils/formatters";
import { getTopFornecedores, type FornecedorData } from "../utils/calculations";
import { FornecedoresBarChart } from "./FornecedoresBarChart";
import { SelecionarFornecedoresModal } from "./SelecionarFornecedoresModal";
import { startOfMonth, endOfMonth } from "date-fns";
import { useRouter } from "next/navigation";

interface TopFornecedoresProps {
  contas: Array<{
    fornecedor: string;
    cnpj?: string;
    valor: number;
    centroCusto?: string;
    formaPagamento?: string;
    status?: string;
    origem?: string;
    dataEmissao?: string;
  }>;
  topN?: number;
  selectedCompany?: string | string[];
  storageKey?: string;
}

type PeriodoType = "todo" | "mes" | "personalizado";
type VisualizacaoType = "valor" | "quantidade";

const PERIODO_LABELS: Record<PeriodoType, string> = {
  todo: "Todo o período",
  mes: "Mês atual",
  personalizado: "Personalizado",
};

const VISUALIZACAO_LABELS: Record<VisualizacaoType, string> = {
  valor: "Valor total pago (R$)",
  quantidade: "Quantidade de contas",
};

const DEFAULT_STORAGE_KEY = "top-fornecedores-selecionados";
const DEFAULT_PRESELECT_COUNT = 5;

export function TopFornecedores({
  contas,
  topN = 5,
  selectedCompany,
  storageKey = DEFAULT_STORAGE_KEY,
}: TopFornecedoresProps) {
  const router = useRouter();
  // Estados dos filtros
  const [periodoType, setPeriodoType] = React.useState<PeriodoType>("todo");
  const [dataInicio, setDataInicio] = React.useState<Date | undefined>();
  const [dataFim, setDataFim] = React.useState<Date | undefined>();
  const [visualizacaoType, setVisualizacaoType] = React.useState<VisualizacaoType>("valor");
  
  // Estados para modal e seleção de fornecedores
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedFornecedores, setSelectedFornecedores] = React.useState<string[]>([]);
  const [storageLoaded, setStorageLoaded] = React.useState(false);

  // Carregar seleção do localStorage ao montar
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const sanitized = parsed
              .filter((item): item is string => typeof item === "string")
              .map((nome) => nome.trim())
              .filter(Boolean);
            setSelectedFornecedores(sanitized);
          }
        } catch (e) {
          // Ignorar erro de parsing
        }
      }
      setStorageLoaded(true);
    }
  }, [storageKey]);

  // Extrair lista única de fornecedores disponíveis com CNPJ
  const allFornecedores = React.useMemo(() => {
    const fornecedoresMap = new Map<string, { nome: string; cnpj?: string }>();
    contas.forEach((conta) => {
      if (conta.fornecedor) {
        // Se já existe, manter o CNPJ se já tiver ou atualizar se a nova conta tiver CNPJ
        const existing = fornecedoresMap.get(conta.fornecedor);
        if (!existing) {
          fornecedoresMap.set(conta.fornecedor, {
            nome: conta.fornecedor,
            cnpj: conta.cnpj,
          });
        } else if (!existing.cnpj && conta.cnpj) {
          // Atualizar se não tinha CNPJ e agora tem
          existing.cnpj = conta.cnpj;
        }
      }
    });
    return Array.from(fornecedoresMap.values()).sort((a, b) => 
      a.nome.localeCompare(b.nome)
    );
  }, [contas]);

  // Filtrar contas por período (baseado na data de emissão)
  const contasFiltradasPorPeriodo = React.useMemo(() => {
    let filtered = contas;

    // Filtrar por período
    if (periodoType === "mes") {
      const hoje = new Date();
      const inicio = startOfMonth(hoje);
      const fim = endOfMonth(hoje);
      
      filtered = contas.filter(conta => {
        if (!conta.dataEmissao) return false;
        const dataEmissao = parseDate(conta.dataEmissao);
        if (!dataEmissao) return false;
        
        const dataEmissaoTime = dataEmissao.getTime();
        const inicioTime = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime();
        const fimTime = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate(), 23, 59, 59).getTime();
        
        return dataEmissaoTime >= inicioTime && dataEmissaoTime <= fimTime;
      });
    } else if (periodoType === "personalizado" && dataInicio && dataFim) {
      filtered = contas.filter(conta => {
        if (!conta.dataEmissao) return false;
        const dataEmissao = parseDate(conta.dataEmissao);
        if (!dataEmissao) return false;
        
        const dataEmissaoTime = dataEmissao.getTime();
        const inicioTime = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate()).getTime();
        const fimTime = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate(), 23, 59, 59).getTime();
        
        return dataEmissaoTime >= inicioTime && dataEmissaoTime <= fimTime;
      });
    }

    // Filtrar por fornecedores selecionados se houver seleção
    if (selectedFornecedores.length > 0) {
      const selectedSet = new Set(selectedFornecedores);
      filtered = filtered.filter((conta) => 
        conta.fornecedor && selectedSet.has(conta.fornecedor)
      );
    }

    return filtered;
  }, [contas, periodoType, dataInicio, dataFim, selectedFornecedores]);

  // Calcular top fornecedores de todo o período (para referência)
  const topFornecedoresTodoPeriodo = React.useMemo(() => {
    return getTopFornecedores(contas, topN);
  }, [contas, topN]);

  // Base fixa para pré-seleção inicial no modal.
  const topFornecedoresPreSelecionados = React.useMemo(() => {
    return getTopFornecedores(contas, DEFAULT_PRESELECT_COUNT);
  }, [contas]);

  // Se não houver seleção salva, inicializa com o Top N padrão para o modal já abrir preenchido.
  React.useEffect(() => {
    if (!storageLoaded || selectedFornecedores.length > 0 || topFornecedoresPreSelecionados.length === 0) {
      return;
    }

    const defaultSelection = topFornecedoresPreSelecionados
      .map((f) => f.fornecedor.trim())
      .filter(Boolean);

    setSelectedFornecedores(defaultSelection);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(defaultSelection));
    }
  }, [storageLoaded, selectedFornecedores.length, topFornecedoresPreSelecionados, storageKey]);

  // Calcular top fornecedores
  const topFornecedores = React.useMemo(() => {
    const topFornecedoresCalculados = getTopFornecedores(contasFiltradasPorPeriodo, topN);
    
    // Se há fornecedores selecionados, garantir que todos apareçam mesmo sem dados
    if (selectedFornecedores.length > 0) {
      const fornecedoresMap = new Map<string, FornecedorData>();
      
      // Adicionar fornecedores calculados
      topFornecedoresCalculados.forEach(f => {
        fornecedoresMap.set(f.fornecedor, f);
      });
      
      // Adicionar fornecedores selecionados que não apareceram (com valor 0)
      selectedFornecedores.forEach(fornecedorNome => {
        if (!fornecedoresMap.has(fornecedorNome)) {
          // Buscar informações do fornecedor em allFornecedores
          const fornecedorInfo = allFornecedores.find(f => f.nome === fornecedorNome);
          fornecedoresMap.set(fornecedorNome, {
            fornecedor: fornecedorNome,
            cnpj: fornecedorInfo?.cnpj,
            valorTotal: 0,
            quantidade: 0,
          });
        }
      });
      
      // Retornar apenas os fornecedores selecionados, mantendo a ordem de valor (ou alfabética se todos forem 0)
      const resultado = Array.from(fornecedoresMap.values())
        .filter(f => selectedFornecedores.includes(f.fornecedor))
        .sort((a, b) => {
          // Se valores são diferentes, ordenar por valor
          if (a.valorTotal !== b.valorTotal) {
            return b.valorTotal - a.valorTotal;
          }
          // Se valores são iguais, manter ordem alfabética
          return a.fornecedor.localeCompare(b.fornecedor);
        });
      
      return resultado;
    }
    
    // Se não há fornecedores selecionados, garantir que os top N de todo o período sempre apareçam
    // mesmo que não tenham dados no período filtrado
    const fornecedoresMap = new Map<string, FornecedorData>();
    
    // Adicionar fornecedores calculados do período filtrado
    topFornecedoresCalculados.forEach(f => {
      fornecedoresMap.set(f.fornecedor, f);
    });
    
    // Adicionar fornecedores do top N de todo o período que não apareceram (com valor 0)
    topFornecedoresTodoPeriodo.forEach(f => {
      if (!fornecedoresMap.has(f.fornecedor)) {
        fornecedoresMap.set(f.fornecedor, {
          ...f,
          valorTotal: 0,
          quantidade: 0,
        });
      }
    });
    
    // Retornar os top N de todo o período, ordenados por valor do período filtrado (ou 0)
    return Array.from(fornecedoresMap.values())
      .filter(f => topFornecedoresTodoPeriodo.some(tf => tf.fornecedor === f.fornecedor))
      .sort((a, b) => {
        // Se valores são diferentes, ordenar por valor
        if (a.valorTotal !== b.valorTotal) {
          return b.valorTotal - a.valorTotal;
        }
        // Se valores são iguais, manter ordem do top de todo o período
        const indexA = topFornecedoresTodoPeriodo.findIndex(tf => tf.fornecedor === a.fornecedor);
        const indexB = topFornecedoresTodoPeriodo.findIndex(tf => tf.fornecedor === b.fornecedor);
        return indexA - indexB;
      });
  }, [contasFiltradasPorPeriodo, topN, selectedFornecedores, allFornecedores, topFornecedoresTodoPeriodo]);

  // Calcular valor total somado dos fornecedores no gráfico
  const valorTotal = React.useMemo(() => {
    return topFornecedores.reduce((sum, fornecedor) => sum + fornecedor.valorTotal, 0);
  }, [topFornecedores]);

  const handlePeriodoChange = (tipo: PeriodoType) => {
    setPeriodoType(tipo);
    if (tipo !== "personalizado") {
      setDataInicio(undefined);
      setDataFim(undefined);
    }
  };

  const handleSaveFornecedores = (fornecedores: string[]) => {
    const sanitized = fornecedores.map((nome) => nome.trim()).filter(Boolean);
    setSelectedFornecedores(sanitized);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(sanitized));
    }
  };

  const handleFornecedorClick = React.useCallback((fornecedor: string) => {
    const params = new URLSearchParams();
    params.set("tab", "liquidados");
    params.set("query", fornecedor);
    if (selectedCompany) {
      const companyParam = Array.isArray(selectedCompany)
        ? selectedCompany.join(",")
        : selectedCompany;
      params.set("company", companyParam);
    }
    router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
  }, [router, selectedCompany]);

  return (
    <>
      <Card className="rounded-xl bg-white border border-border h-full flex flex-col">
        <div className="px-4 py-3 border-b flex items-center h-[62px] flex-shrink-0">
          <h3 className="text-sm font-semibold text-[#0d0f1c]">Top fornecedores</h3>
          <div className="group relative ml-2">
            <button
              className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Informações sobre o gráfico"
            >
              <Info className="w-4 h-4 text-[#5F6572]" />
            </button>
            <div className="absolute left-0 top-6 w-64 p-3 bg-white border border-[#EBECEE] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
              <p className="text-xs text-[#5F6572] leading-relaxed">
                Exibe os principais fornecedores por valor total pago ou quantidade de contas pagas, permitindo identificar os maiores parceiros comerciais
              </p>
            </div>
          </div>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="font-bold"
          >
            <Pen className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      <CardContent className="flex flex-col flex-1 min-h-0">
        {/* Filtros */}
        <div className="mb-6 flex-shrink-0 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            {/* Filtro de Período */}
            <div className="w-full sm:w-auto">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
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
                    Valor total pago (R$)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVisualizacaoType("quantidade")}>
                    Quantidade de contas
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

        {/* Gráfico de Barras */}
        {topFornecedores.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhum fornecedor encontrado
          </p>
        ) : (
          <div className="-mx-6 h-[300px] flex-shrink-0 flex">
            <div className="px-6 w-full h-full">
              <FornecedoresBarChart
                data={topFornecedores.map(f => ({
                  ...f,
                  fornecedor: f.fornecedor || 'Fornecedor sem nome',
                }))}
                visualizacaoType={visualizacaoType}
                height={300}
                onBarClick={handleFornecedorClick}
              />
            </div>
          </div>
        )}

        {/* Alerta - Valor Total Pago */}
        {topFornecedores.length > 0 && (
          <div className="mt-6 flex-shrink-0 w-full">
            <div className="w-full flex items-center gap-2 px-4 py-4 rounded-md" style={{ backgroundColor: '#E6F3FD' }}>
              <Info className="w-5 h-5 flex-shrink-0" style={{ color: '#0059A3' }} />
              <div className="text-sm text-[#0059A3] flex-1 whitespace-normal break-words text-left">
                <span className="font-semibold">{formatCurrency(valorTotal)}</span>
                <span> valor total pago</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    <SelecionarFornecedoresModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      onSave={handleSaveFornecedores}
      fornecedores={allFornecedores}
      selectedFornecedores={selectedFornecedores}
    />
    </>
  );
}

