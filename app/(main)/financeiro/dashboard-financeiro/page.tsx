"use client";

import * as React from "react";
import { ProductToolbar } from "@/components/layout/ProductToolbar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { EtapasBigNumbers } from "./components/EtapasBigNumbers";
import { StatusPagamento } from "./components/StatusPagamento";
import { VisaoAging } from "./components/VisaoAging";
import { TopFornecedores } from "./components/TopFornecedores";
import { ReformaTributaria } from "./components/ReformaTributaria";
import { CardAlertas } from "./components/CardAlertas";
import { FeedbackCTA } from "./components/FeedbackCTA";
import { DashboardEmptyState } from "./components/DashboardEmptyState";
import { initialRows } from "../gestao-de-pagamentos/data/mock-data";
import { companies } from "@/components/layout/CompanySelector";
import { usePaymentFilters } from "../gestao-de-pagamentos/hooks/usePaymentFilters";
import { PaymentFilter } from "../gestao-de-pagamentos/types";
import {
  convertRowToDashboardConta,
  convertRowToContaEtapa,
  convertRowToContaPagamento,
  convertRowToContaAging,
} from "./utils/data-converter";
import { calculateCbsCreditSummary } from "../gestao-de-pagamentos/utils/cbs-previsto";

const MOCK_TOP_FORNECEDORES_CONTAS = [
  {
    fornecedor: "HIDRAU TORQUE IND., COM.",
    valor: 54138.8,
    status: "Pago",
    origem: "NF-e",
    dataEmissao: "01/05/2026",
  },
  {
    fornecedor: "NTA NOVAS TÉCNICAS DE ASFALTOS",
    valor: 46104,
    status: "Pago",
    origem: "NF-e",
    dataEmissao: "02/05/2026",
  },
  {
    fornecedor: "CELIO MOREIRA DE FREITAS - ME",
    valor: 46089.5,
    status: "Pago",
    origem: "NF-e",
    dataEmissao: "03/05/2026",
  },
  {
    fornecedor: "SANT ANNA & COIMBRA LTDA",
    valor: 28699,
    status: "Pago",
    origem: "NF-e",
    dataEmissao: "04/05/2026",
  },
  {
    fornecedor: "Migliati & Lumini Ltda",
    valor: 24744.57,
    status: "Pago",
    origem: "NF-e",
    dataEmissao: "05/05/2026",
  },
];

export default function PageDashboardFinanceiro() {
  // Estado para garantir que os cálculos sejam feitos apenas no cliente (evitar erro de hidratação)
  const [isMounted, setIsMounted] = React.useState(false);
  
  // Estado para filtro de empresa (igual à gestão de pagamentos)
  const [selectedCompany, setSelectedCompany] = React.useState<string[]>(["all"]);

  // Estado para controlar abertura do feedback com mensagem pré-preenchida
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  // Estado para controlar empty state
  const [showEmptyState, setShowEmptyState] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Carregar preferência do empty state do localStorage
    const saved = localStorage.getItem('dashboard-financeiro-empty-state');
    if (saved === 'true') {
      setShowEmptyState(true);
    }
  }, []);

  const handleToggleEmptyState = (checked: boolean) => {
    setShowEmptyState(checked);
    localStorage.setItem('dashboard-financeiro-empty-state', String(checked));
  };

  // Filtro por empresa (baseado no CNPJ pagador) - igual à gestão de pagamentos
  const companyFilteredRows = React.useMemo(() => {
    if (!isMounted) return [];
    if (selectedCompany.includes("all")) return initialRows;
    
    const selectedCompanies = companies.filter(c => selectedCompany.includes(c.id));
    const selectedCnpjs = selectedCompanies
      .map(c => c.cnpj?.replace(/[^\d]/g, ''))
      .filter(Boolean) as string[];
    
    if (selectedCnpjs.length === 0) return initialRows;
    
    return initialRows.filter(row => {
      const rowCnpjNormalized = row.cnpjPagador.replace(/[^\d]/g, '');
      return selectedCnpjs.includes(rowCnpjNormalized);
    });
  }, [isMounted, selectedCompany]);

  // Filtros padrão (sem filtros aplicados) - igual à gestão de pagamentos quando não há filtros
  const defaultFilters: PaymentFilter = React.useMemo(() => ({
    status: "Todos os Status",
    period: "Todos os períodos",
    query: "",
    visaoGeralFilter: null,
    vencimentoInicio: "",
    vencimentoFim: "",
    emissaoInicio: "",
    emissaoFim: "",
    valorMinimo: "",
    valorMaximo: "",
    formaPagamento: "Todos os tipos",
    origemDocumento: "Todos os tipos",
    semDataVencimento: false,
    cancelamentoOrigem: "Todos os tipos",
    notaAtualizadaAposCriacao: false,
  }), []);

  // Usar usePaymentFilters para cada etapa - garante que os dados sejam exatamente os mesmos da gestão de pagamentos
  const conferirData = usePaymentFilters(companyFilteredRows, 'conferir', defaultFilters);
  const aprovacaoData = usePaymentFilters(companyFilteredRows, 'aprovacao', defaultFilters);
  const pagarData = usePaymentFilters(companyFilteredRows, 'pagar', defaultFilters);
  const bloqueadosData = usePaymentFilters(companyFilteredRows, 'bloqueados', defaultFilters);
  const canceladosData = usePaymentFilters(companyFilteredRows, 'cancelados', defaultFilters);

  // Converter dados reais de gestão de pagamentos para CardAlertas (Pendências do Dia)
  // IMPORTANTE: Usar os dados filtrados de usePaymentFilters para garantir consistência com gestão de pagamentos
  const contasFormatadas = React.useMemo(() => {
    if (!isMounted) return [];
    
    // Juntar todas as etapas filtradas usando usePaymentFilters
    const allFilteredRows = [
      ...conferirData.filteredData,
      ...aprovacaoData.filteredData,
      ...pagarData.filteredData,
      ...bloqueadosData.filteredData,
      ...canceladosData.filteredData,
    ];
    
    return allFilteredRows.map(convertRowToDashboardConta);
  }, [isMounted, conferirData, aprovacaoData, pagarData, bloqueadosData, canceladosData]);

  // Preparar dados para EtapasBigNumbers e StatusPagamento
  // IMPORTANTE: Usar os dados filtrados de usePaymentFilters para garantir consistência com gestão de pagamentos
  // Usar totalValue e totalCount diretamente dos hooks para garantir que os valores sejam exatamente os mesmos
  const contasEtapas = React.useMemo(() => {
    if (!isMounted) return [];
    
    const etapas = [
      { data: conferirData, etapa: 'conferir' },
      { data: aprovacaoData, etapa: 'aprovacao' },
      { data: pagarData, etapa: 'pagar' },
      { data: bloqueadosData, etapa: 'bloqueados' },
    ];

    // Usar totalValue e totalCount diretamente dos hooks, mas ainda precisamos dos dados individuais para StatusPagamento
    // Então vamos criar um array com os dados, mas garantindo que o valor total seja o mesmo
    return etapas.flatMap(({ data, etapa }) => 
      data.filteredData.map(row => ({
        etapa,
        valor: row.valor,
      }))
    );
  }, [isMounted, conferirData, aprovacaoData, pagarData, bloqueadosData]);

  // Criar um objeto com os valores totais de cada etapa para usar diretamente no EtapasBigNumbers
  const etapasTotais = React.useMemo(() => {
    const baseValue = { value: 0, count: 0 };
    const defaultValue = {
      conferir: baseValue,
      aprovacao: baseValue,
      pagar: baseValue,
      bloqueados: baseValue,
    };
    
    if (!isMounted) {
      return defaultValue;
    }
    
    return {
      conferir: { value: conferirData.totalValue, count: conferirData.totalCount },
      aprovacao: { value: aprovacaoData.totalValue, count: aprovacaoData.totalCount },
      pagar: { value: pagarData.totalValue, count: pagarData.totalCount },
      bloqueados: { value: bloqueadosData.totalValue, count: bloqueadosData.totalCount },
    };
  }, [isMounted, conferirData, aprovacaoData, pagarData, bloqueadosData]) as { [key: string]: { value: number; count: number } };

  // Preparar dados para StatusPagamento (cálculo de % em dia)
  // IMPORTANTE: Usar companyFilteredRows para aplicar o mesmo filtro de empresa
  const contasPagamentos = React.useMemo(() => {
    if (!isMounted) return [];
    return companyFilteredRows
      .filter(row => row.status === 'Pago')
      .map(convertRowToContaPagamento);
  }, [isMounted, companyFilteredRows]);

  // Preparar dados para VisaoAging
  // IMPORTANTE: Usar companyFilteredRows para aplicar o mesmo filtro de empresa
  const contasAging = React.useMemo(() => {
    if (!isMounted) return [];
    return companyFilteredRows
      .filter(row => row.status === 'Aberto' || row.status === 'Vencido')
      .map(convertRowToContaAging);
  }, [isMounted, companyFilteredRows]);

  // Preparar dados para Reforma Tributária usando as notas vinculadas às contas a pagar
  const cbsCreditSummary = React.useMemo(() => {
    if (!isMounted) {
      return { value: 0, consideredAccounts: 0 };
    }

    return calculateCbsCreditSummary(companyFilteredRows);
  }, [isMounted, companyFilteredRows]);

  // Calcular quantidade de contas sem data de vencimento (status Aberto)
  // Usar a mesma base de dados que CardAlertas para garantir consistência
  const semVencimentoCount = React.useMemo(() => {
    if (!isMounted) return 0;
    return contasFormatadas.filter(c => c.status === "Aberto" && !c.vencimento).length;
  }, [isMounted, contasFormatadas]);

  // Função para abrir feedback com mensagem pré-preenchida
  const handleOpenFeedback = React.useCallback(() => {
    const preFilledMessage =
      "Estava navegando no Painel de Performance e gostaria de ver as seguintes informações nas pendências do dia:\n";
    setFeedbackMessage(preFilledMessage);
  }, []);

  // Calcular data de última atualização (sempre D-1)
  const ultimaAtualizacao = React.useMemo(() => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    // Formatar data: DD/MM/YYYY às HH:MM
    const dia = String(ontem.getDate()).padStart(2, '0');
    const mes = String(ontem.getMonth() + 1).padStart(2, '0');
    const ano = ontem.getFullYear();
    const horas = String(ontem.getHours()).padStart(2, '0');
    const minutos = String(ontem.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  }, []);

  return (
    <section className={`p-6 ${showEmptyState ? 'flex flex-col h-[calc(100vh-48px)]' : ''}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">Painel de performance</h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">Última atualização</div>
          <div className="text-sm font-medium text-gray-900">{ultimaAtualizacao}</div>
        </div>
      </div>
      <ProductToolbar 
        selectedCompany={selectedCompany} 
        onCompanyChange={setSelectedCompany}
        multiCompanySelectionEnabled={true}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="default" variant="secondary" className="font-bold">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Configurações</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center justify-between gap-2 cursor-default"
              onSelect={(e) => e.preventDefault()}
            >
              <span className="text-sm">Mostrar empty state</span>
              <Switch
                checked={showEmptyState}
                onCheckedChange={handleToggleEmptyState}
                onClick={(e) => e.stopPropagation()}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ProductToolbar>

      {showEmptyState ? (
        <div className="mt-4 flex-1 min-h-0">
          <DashboardEmptyState />
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {/* Topo: coluna esquerda (cards + Reforma empilhados) + coluna direita (Últimas pendências).
              No xl+ a coluna esquerda estica até a altura de "Últimas pendências" e a Reforma cresce para
              preencher o espaço, alinhando a base dos dois blocos. */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="min-w-0 flex flex-col gap-6">
              {/* Cards principais — altura natural */}
              <div className="xl:flex-shrink-0">
                <EtapasBigNumbers
                  contas={contasEtapas}
                  etapasTotais={etapasTotais}
                  selectedCompany={selectedCompany}
                />
              </div>

              {/* Reforma Tributária — cresce para alinhar com a base da Pendências em xl+ */}
              <div className="xl:flex-1 xl:min-h-0 xl:flex xl:flex-col">
                <ReformaTributaria
                  cbsCredit={cbsCreditSummary}
                  selectedCompany={selectedCompany}
                />
              </div>
            </div>

            {/* Coluna direita: Últimas pendências (não estica) */}
            <aside className="min-w-0 xl:self-start">
              <div className="rounded-xl bg-gray-100 p-4">
                <CardAlertas
                  contas={contasFormatadas}
                  onOpenFeedback={handleOpenFeedback}
                  selectedCompany={selectedCompany}
                  semVencimentoCount={semVencimentoCount}
                />
              </div>
            </aside>
          </div>

          {/* Visão de Aging — largura total */}
          <VisaoAging
            contas={contasAging}
            selectedCompany={selectedCompany}
            semVencimentoCount={semVencimentoCount}
          />

          {/* Top Fornecedores — largura total */}
          <TopFornecedores
            contas={MOCK_TOP_FORNECEDORES_CONTAS}
            selectedCompany={selectedCompany}
            storageKey="top-fornecedores-dashboard-mock"
          />

          {/* Etapa dos Pagamentos — largura total */}
          <StatusPagamento
            contasEtapas={contasEtapas}
            contasPagamentos={contasPagamentos}
            selectedCompany={selectedCompany}
          />

          {/* Feedback — final da página, largura total */}
          <FeedbackCTA
            openWithMessage={feedbackMessage}
            onMessageProcessed={() => setFeedbackMessage(null)}
          />
        </div>
      )}
    </section>
  );
}

