"use client";

import * as React from "react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProductToolbar } from "@/components/layout/ProductToolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeDollarSign, Calculator, Calendar, ChevronDown, ExternalLink, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CBS_DEBITO_REAIS = -667_384;
const CBS_CREDITO_REAIS = 374_560;
const CBS_SALDO_SIMULACAO_MILHOES = -2.7;
const CBS_FATURAMENTO_LIQUIDO_MILHOES = 86.049129;

const DEBITO_IBS_REAIS = -74_151;
const DEBITO_IS_REAIS = -3_724;

const CREDITO_IBS_REAIS = 41_617;
const CREDITO_IS_REAIS = 1_409;

const PIS_COFINS_ATUAL_REAIS = 7_515_163;

const CONCILIACAO_DIVERGENCIA_REAIS = 11_268;
const CONCILIACAO_CREDITO_APURADO_REAIS = 360_000;
const CONCILIACAO_CREDITO_LIBERADO_REAIS = 350_000;
const CONCILIACAO_SALDO_PENDENTE_REAIS = -10_000;

const FORNECEDORES_SEM_DESTAQUE_REAIS = 256_234;
const FORNECEDORES_SIMPLES_MEI_REAIS = 69_548;
const FORNECEDORES_REGIME_NORMAL_REAIS = 15_432;
const FORNECEDORES_COM_DESTAQUE_REAIS = 181_976;
const TOTAL_DEBITO_BASE_MILHOES = 86.5;
const TOTAL_CREDITO_BASE_MILHOES = 64.4;

function formatBRL(value: number) {
  const sinal = value < 0 ? "- " : "";
  const formatado = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

  return `${sinal}R$ ${formatado}`;
}

function formatMesAnoReferencia(date: Date) {
  const mesAno = format(date, "MMMM yyyy", { locale: ptBR });
  return mesAno.charAt(0).toUpperCase() + mesAno.slice(1);
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getVariacaoPeriodo(periodLabel: string) {
  if (periodLabel === "Personalizado...") return 0;

  // Variação determinística entre -10% e +10% em passos de 1 ponto percentual
  const step = hashString(periodLabel) % 21; // 0..20
  return (step - 10) / 100;
}

function getVariacaoPorChave(periodLabel: string, chave: string) {
  if (periodLabel === "Personalizado...") return 0;

  // Mesma lógica do período, mas com “sal” por chave (para permitir variação intra-seção sem mudar o período)
  const step = hashString(`${periodLabel}|${chave}`) % 21; // 0..20
  return (step - 10) / 100;
}

function scaleMoney(value: number, variacao: number) {
  return Math.round(value * (1 + variacao));
}

/** NF-e: valores em 80%; NFS-e: valores em 20%. */
function documentTypeMonetaryFactor(documentType: string) {
  if (documentType === "NF-e") return 0.8;
  if (documentType === "NFS-e") return 0.2;
  return 1;
}

function scaleByDocumentTypeReais(reais: number, documentType: string) {
  const f = documentTypeMonetaryFactor(documentType);
  if (f === 1) return reais;
  return Math.round(reais * f);
}

function documentTypeVariationFactor(documentType: string) {
  if (documentType === "NF-e") return 0.05;
  if (documentType === "NFS-e") return -0.05;
  return 0;
}

function formatMilhoesCompact(valueMilhoes: number) {
  const sinal = valueMilhoes < 0 ? "-" : "";
  const absoluto = Math.abs(valueMilhoes).toFixed(1).replace(".", ",");
  return `${sinal}R$ ${absoluto} milhões`;
}

function formatPercentLabel(value: number) {
  return `${Math.abs(value * 100).toFixed(1).replace(".", ",")}%`;
}

/** Percentual para `width` / `flex-basis`: sempre ponto decimal (CSS não aceita vírgula). */
function cssPercentFromRatio(ratio: number) {
  const pct = Math.min(100, Math.max(0, Number.isFinite(ratio) ? ratio * 100 : 0));
  return `${pct.toFixed(4)}%`;
}

export default function PageReformaTributaria() {
  const [selectedCompany, setSelectedCompany] = React.useState<string[]>(["all"]);
  const periodOptions = React.useMemo(() => {
    const hoje = new Date();
    const meses = Array.from({ length: 12 }, (_, index) => formatMesAnoReferencia(subMonths(hoje, index)));
    return [...meses, "Personalizado..."];
  }, []);
  const documentTypeOptions = React.useMemo(
    () => ["Todos os documentos", "NF-e", "NFS-e"],
    []
  );
  const [period, setPeriod] = React.useState<string>(() => formatMesAnoReferencia(new Date()));
  const [documentType, setDocumentType] = React.useState<string>("Todos os documentos");
  const variacaoPeriodo = React.useMemo(() => getVariacaoPeriodo(period), [period]);
  const docFactor = documentTypeMonetaryFactor(documentType);
  const docVariation = React.useMemo(() => documentTypeVariationFactor(documentType), [documentType]);

  const totaisResumo = React.useMemo(() => {
    const fatorPeriodo = 1 + variacaoPeriodo;
    const fatorDocumento = 1 + docVariation;
    return {
      totalDebitoLabel: formatMilhoesCompact(-(TOTAL_DEBITO_BASE_MILHOES * fatorPeriodo * fatorDocumento)),
      totalCreditoLabel: formatMilhoesCompact(TOTAL_CREDITO_BASE_MILHOES * fatorPeriodo * fatorDocumento),
    };
  }, [variacaoPeriodo, docVariation]);

  const pisCofinsAtualReais = React.useMemo(
    () => scaleByDocumentTypeReais(scaleMoney(PIS_COFINS_ATUAL_REAIS, variacaoPeriodo), documentType),
    [variacaoPeriodo, documentType]
  );

  const conciliacaoCbs = React.useMemo(
    () => ({
      divergencia: scaleByDocumentTypeReais(scaleMoney(CONCILIACAO_DIVERGENCIA_REAIS, variacaoPeriodo), documentType),
      creditoApurado: scaleByDocumentTypeReais(scaleMoney(CONCILIACAO_CREDITO_APURADO_REAIS, variacaoPeriodo), documentType),
      creditoLiberado: scaleByDocumentTypeReais(scaleMoney(CONCILIACAO_CREDITO_LIBERADO_REAIS, variacaoPeriodo), documentType),
      saldoPendente: scaleByDocumentTypeReais(scaleMoney(CONCILIACAO_SALDO_PENDENTE_REAIS, variacaoPeriodo), documentType),
    }),
    [variacaoPeriodo, documentType]
  );

  const fornecedores = React.useMemo(() => {
    const semDestaque = scaleByDocumentTypeReais(
      scaleMoney(FORNECEDORES_SEM_DESTAQUE_REAIS, getVariacaoPorChave(period, "forn.semDestaque")),
      documentType
    );
    const simplesMei = scaleByDocumentTypeReais(
      scaleMoney(FORNECEDORES_SIMPLES_MEI_REAIS, getVariacaoPorChave(period, "forn.simplesMei")),
      documentType
    );
    const regimeNormal = scaleByDocumentTypeReais(
      scaleMoney(FORNECEDORES_REGIME_NORMAL_REAIS, getVariacaoPorChave(period, "forn.regimeNormal")),
      documentType
    );
    const comDestaque = scaleByDocumentTypeReais(
      scaleMoney(FORNECEDORES_COM_DESTAQUE_REAIS, getVariacaoPorChave(period, "forn.comDestaque")),
      documentType
    );

    const totalRegime = Math.max(regimeNormal + simplesMei, 1);
    const pctRegimeNormal = regimeNormal / totalRegime;
    const pctRegimeSimplesMei = simplesMei / totalRegime;

    const totalDestaque = Math.max(comDestaque + semDestaque, 1);
    const pctComDestaque = comDestaque / totalDestaque;
    const pctSemDestaque = semDestaque / totalDestaque;

    return {
      semDestaque,
      simplesMei,
      regimeNormal,
      comDestaque,
      pctRegimeNormal,
      pctRegimeSimplesMei,
      pctComDestaque,
      pctSemDestaque,
    };
  }, [period, documentType]);

  const debitoSaidaResumo = React.useMemo(() => {
    const cbsReais = scaleByDocumentTypeReais(scaleMoney(CBS_DEBITO_REAIS, variacaoPeriodo), documentType);
    const ibsReais = scaleByDocumentTypeReais(scaleMoney(DEBITO_IBS_REAIS, variacaoPeriodo), documentType);
    const isReais = scaleByDocumentTypeReais(scaleMoney(DEBITO_IS_REAIS, variacaoPeriodo), documentType);
    const totalReais = cbsReais + ibsReais + isReais;
    const notasDebito = Math.max(1, Math.round(3835 * docFactor));

    return {
      totalDebitoSaida: formatBRL(totalReais),
      totalNotasDebitoSaida: `${notasDebito} notas`,
      composicao: [
        { label: "CBS", value: formatBRL(cbsReais) },
        { label: "IBS", value: formatBRL(ibsReais) },
        { label: "IS", value: formatBRL(isReais) },
      ],
    };
  }, [variacaoPeriodo, documentType, docFactor]);
  const creditoEntradaResumo = React.useMemo(() => {
    const cbsReais = scaleByDocumentTypeReais(scaleMoney(CBS_CREDITO_REAIS, variacaoPeriodo), documentType);
    const ibsReais = scaleByDocumentTypeReais(scaleMoney(CREDITO_IBS_REAIS, variacaoPeriodo), documentType);
    const isReais = scaleByDocumentTypeReais(scaleMoney(CREDITO_IS_REAIS, variacaoPeriodo), documentType);
    const totalReais = cbsReais + ibsReais + isReais;
    const notasCredito = Math.max(1, Math.round(835 * docFactor));

    return {
      totalCreditoEntrada: formatBRL(totalReais),
      totalNotasCreditoEntrada: `${notasCredito} notas`,
      composicao: [
        { label: "CBS", value: formatBRL(cbsReais) },
        { label: "IBS", value: formatBRL(ibsReais) },
        { label: "IS", value: formatBRL(isReais) },
      ],
    };
  }, [variacaoPeriodo, documentType, docFactor]);
  const cbsResumo = React.useMemo(() => {
    const debitoCbsReais = scaleByDocumentTypeReais(scaleMoney(CBS_DEBITO_REAIS, variacaoPeriodo), documentType);
    const creditoCbsReais = scaleByDocumentTypeReais(scaleMoney(CBS_CREDITO_REAIS, variacaoPeriodo), documentType);
    const debitoCbs = debitoCbsReais / 1_000_000;
    const creditoCbs = creditoCbsReais / 1_000_000;
    const saldoCbs = debitoCbs + creditoCbs;

    const saldoCbsSimulacao = CBS_SALDO_SIMULACAO_MILHOES * (1 + variacaoPeriodo) * docFactor;
    const faturamentoLiquido = CBS_FATURAMENTO_LIQUIDO_MILHOES * (1 + variacaoPeriodo) * docFactor;
    const aliquotaEfetiva = saldoCbs / faturamentoLiquido;
    const aliquotaEfetivaSimulacao = saldoCbsSimulacao / faturamentoLiquido;

    const formatMilhoes = (value: number) => {
      const sinal = value < 0 ? "- " : "";
      const absolutoReais = Math.abs(value) * 1_000_000;
      const formatado = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(absolutoReais);

      return `${sinal}R$ ${formatado}`;
    };

    const formatSaldoCbsEmMilhoes = (valueMilhoes: number) => {
      const sinal = valueMilhoes < 0 ? "-" : "";
      const absoluto = Math.abs(valueMilhoes).toFixed(1).replace(".", ",");
      return `${sinal}R$ ${absoluto} milhões`;
    };

    const formatPercentual = (value: number) => {
      const sinal = value < 0 ? "-" : "";
      const absoluto = Math.abs(value * 100).toFixed(2).replace(".", ",");
      return `${sinal}${absoluto}%`;
    };

    return {
      saldoCbs,
      saldoCbsSimulacao,
      faturamentoLiquido,
      aliquotaEfetiva,
      aliquotaEfetivaSimulacao,
      saldoCbsLabel: formatMilhoes(saldoCbs),
      saldoCbsSimulacaoLabel: formatSaldoCbsEmMilhoes(saldoCbsSimulacao),
      faturamentoLiquidoLabel: formatMilhoes(faturamentoLiquido),
      aliquotaEfetivaLabel: formatPercentual(aliquotaEfetiva),
      aliquotaEfetivaSimulacaoLabel: formatPercentual(aliquotaEfetivaSimulacao),
    };
  }, [variacaoPeriodo, documentType, docFactor]);
  const cbsMonthlyData = React.useMemo(
    () => [
      { label: "dez", value: scaleByDocumentTypeReais(scaleMoney(-360, variacaoPeriodo), documentType) },
      { label: "jan", value: scaleByDocumentTypeReais(scaleMoney(-270, variacaoPeriodo), documentType) },
      { label: "fev", value: scaleByDocumentTypeReais(scaleMoney(-120, variacaoPeriodo), documentType) },
      { label: "mar", value: scaleByDocumentTypeReais(scaleMoney(-170, variacaoPeriodo), documentType) },
      { label: "abr", value: scaleByDocumentTypeReais(scaleMoney(-295, variacaoPeriodo), documentType) },
    ],
    [variacaoPeriodo, documentType]
  );
  const cbsChartMax = React.useMemo(
    () => Math.max(...cbsMonthlyData.map((item) => Math.abs(item.value))),
    [cbsMonthlyData]
  );

  const ultimaAtualizacao = React.useMemo(() => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    const dia = String(ontem.getDate()).padStart(2, "0");
    const mes = String(ontem.getMonth() + 1).padStart(2, "0");
    const ano = ontem.getFullYear();
    const horas = String(ontem.getHours()).padStart(2, "0");
    const minutos = String(ontem.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  }, []);

  return (
    <section className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">Reforma Tributária</h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">Última atualização</div>
          <div className="text-sm font-medium text-gray-900">{ultimaAtualizacao}</div>
        </div>
      </div>

      <ProductToolbar
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        multiCompanySelectionEnabled={true}
      />

      <div className="w-full flex h-10 items-center rounded-[8px] bg-[#F5F5F6] py-1 px-4 mt-4">
        <div className="flex items-center gap-2 px-1.5">
          <Calendar className="h-4 w-4" style={{ color: "#5F6572" }} />
          <span className="text-sm font-semibold" style={{ color: "#5F6572" }}>Período</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="default"
                className="px-2 h-6 text-[#0d0f1c] shadow-none font-bold hover:bg-[#EFF1F2] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <span className="t-text-sm">{period}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {periodOptions.map((option) => (
                <DropdownMenuItem key={option} onClick={() => setPeriod(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 px-1.5 ml-4">
          <FileText className="h-4 w-4" style={{ color: "#5F6572" }} />
          <span className="text-sm font-semibold" style={{ color: "#5F6572" }}>Tipo de documento</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="default"
                className="px-2 h-6 text-[#0d0f1c] shadow-none font-bold hover:bg-[#EFF1F2] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <span className="t-text-sm">{documentType}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {documentTypeOptions.map((option) => (
                <DropdownMenuItem key={option} onClick={() => setDocumentType(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="w-full rounded-xl bg-white border border-border mt-4">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-base font-bold text-[#0d0f1c]">Visão geral da reforma tributária</h2>
            <p className="text-sm text-[#5F6572] mt-1 leading-5">
              Acompanhe a evolução da empresa com as principais mudanças da Reforma Tributária. Os dados obtidos para os indicadores são conciliados a partir dos XMLs de entrada e saída, armazenados em sua conta Qive.
            </p>
          </div>

          <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-xl bg-white border border-border">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-[#0d0f1c]">Débito (Saída)</h3>
                <p className="text-xs text-[#5F6572] mt-1">valor total das notas de saída</p>
                <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-6 w-1.5 rounded-full bg-[#EB7A00]" aria-hidden />
                      <p className="text-[28px] leading-none font-bold text-[#0d0f1c]">
                        {totaisResumo.totalDebitoLabel}
                      </p>
                    </div>
                    <p className="text-sm text-[#5F6572] mt-2 pl-[14px]">
                      {debitoSaidaResumo.totalNotasDebitoSaida}
                    </p>
                  </div>

                  <div className="space-y-2 md:min-w-[180px]">
                    {debitoSaidaResumo.composicao.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-[#5F6572]">
                          <span className="inline-block h-6 w-2 rounded-full bg-[#EB7A00]" aria-hidden />
                          {item.label}
                        </span>
                        <span className="text-base font-semibold text-[#0d0f1c]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl bg-white border border-border">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-[#0d0f1c]">Crédito (Entrada)</h3>
                <p className="text-xs text-[#5F6572] mt-1">valor total das notas de entrada</p>
                <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-6 w-1.5 rounded-full bg-[#027A48]" aria-hidden />
                      <p className="text-[28px] leading-none font-bold text-[#0d0f1c]">
                        {totaisResumo.totalCreditoLabel}
                      </p>
                    </div>
                    <p className="text-sm text-[#5F6572] mt-2 pl-[14px]">
                      {creditoEntradaResumo.totalNotasCreditoEntrada}
                    </p>
                  </div>

                  <div className="space-y-2 md:min-w-[180px]">
                    {creditoEntradaResumo.composicao.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-[#5F6572]">
                          <span className="inline-block h-6 w-2 rounded-full bg-[#027A48]" aria-hidden />
                          {item.label}
                        </span>
                        <span className="text-base font-semibold text-[#0d0f1c]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full rounded-xl bg-white border border-border mt-4">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-base font-bold text-[#0d0f1c]">CBS</h2>
            <p className="text-sm text-[#5F6572] mt-1">
              CBS (Contribuição sobre Bens e Serviços) é o imposto federal sobre consumo que substitui PIS e Cofins.
            </p>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-4 items-stretch">
            <div className="h-[260px] w-full px-2">
              <div className="flex h-full">
                <div className="w-16 shrink-0 text-right pr-3 pt-2 pb-3 flex flex-col">
                  <div className="h-6 mb-2" />
                  <div className="flex-1 flex flex-col justify-between">
                    <span className="text-[10px] text-[#5F6572]">0</span>
                    <span className="text-[10px] text-[#5F6572]">-100 mil</span>
                    <span className="text-[10px] text-[#5F6572]">-200 mil</span>
                    <span className="text-[10px] text-[#5F6572]">-300 mil</span>
                    <span className="text-[10px] text-[#5F6572]">-400 mil</span>
                  </div>
                </div>

                <div className="flex-1 pl-4 pr-2 pb-3 pt-2 flex flex-col">
                  <div className="grid grid-cols-5 gap-3 h-6 mb-2">
                    {cbsMonthlyData.map((item) => (
                      <div key={`label-${item.label}`} className="flex items-center justify-center">
                        <span className="text-sm text-[#5F6572] capitalize">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="relative flex-1">
                    <div className="absolute inset-x-0 top-[25%] border-t border-dashed border-[#D0D5DD]" />
                    <div className="absolute inset-x-0 top-[50%] border-t border-dashed border-[#D0D5DD]" />
                    <div className="absolute inset-x-0 top-[75%] border-t border-dashed border-[#D0D5DD]" />
                    <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-[#D0D5DD]" />

                    <div className="grid grid-cols-5 gap-3 h-full relative z-10">
                      {cbsMonthlyData.map((item) => (
                        <div
                          key={item.label}
                          className="group relative flex h-full w-full flex-col items-center"
                        >
                          <div
                            className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
                            role="tooltip"
                          >
                            <div className="whitespace-nowrap rounded-md border border-[#EAECF0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0d0f1c]">
                              Saldo CBS: {formatBRL(item.value)}
                            </div>
                          </div>
                          <div className="flex min-h-0 flex-1 w-full items-start justify-center">
                            <div
                              className="w-full max-w-[56px] rounded-[4px] bg-[#FF9800]"
                              style={{
                                height: `${(Math.abs(item.value) / cbsChartMax) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="rounded-xl bg-white border border-border">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <p className="text-sm text-[#5F6572] leading-5 mb-4">
                  A alíquota efetiva do CBS é a divisão do saldo e do faturamento líquido:
                </p>

                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-x-3 gap-y-1">
                  <div>
                    <p className="text-xs font-semibold text-[#5F6572] leading-tight">Saldo CBS</p>
                  </div>
                  <div />
                  <div>
                    <p className="text-xs font-semibold text-[#5F6572] leading-tight">faturamento líquido</p>
                  </div>
                  <div />
                  <div>
                    <p className="text-xs font-semibold text-[#5F6572] leading-tight">Alíquota Efetiva</p>
                  </div>

                  <div>
                    <p className="text-2xl leading-none font-bold text-[#0d0f1c]">{cbsResumo.saldoCbsLabel}</p>
                  </div>
                  <span className="text-xl font-semibold text-[#5F6572] self-end leading-none">÷</span>
                  <div>
                    <p className="text-xl leading-none font-semibold text-[#0d0f1c]">{cbsResumo.faturamentoLiquidoLabel}</p>
                  </div>
                  <span className="text-xl font-semibold text-[#5F6572] self-end leading-none">=</span>
                  <div>
                    <p className="text-xl leading-none font-semibold text-[#0d0f1c]">{cbsResumo.aliquotaEfetivaLabel}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-[#5F6572]">
                    O saldo CBS é gerado pela soma do débito e do crédito total do período:
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-semibold text-[#5F6572]">CBS Débito</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block h-5 w-1.5 rounded-full bg-[#EB7A00]" aria-hidden />
                        <p className="text-lg leading-none font-bold text-[#0d0f1c]">{debitoSaidaResumo.composicao[0].value}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-semibold text-[#5F6572]">CBS Crédito</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block h-5 w-1.5 rounded-full bg-[#027A48]" aria-hidden />
                        <p className="text-lg leading-none font-bold text-[#0d0f1c]">{creditoEntradaResumo.composicao[0].value}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 border-t border-border my-2" />

            <div className="lg:col-start-1">
              <div className="mb-2 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#0d0f1c]" aria-hidden />
                <h3 className="text-base font-bold text-[#0d0f1c]">Simulação de cálculo para a reforma</h3>
              </div>
              <p className="text-sm text-[#5F6572] leading-6">
                A <strong>simulação</strong> projeta o impacto financeiro da Reforma Tributária no seu caixa.
                Nosso motor aplica a alíquota cheia da CBS (<strong>estimada em 8,5%</strong>) sobre os seus XMLs
                atuais, cruzando os débitos de faturamento com os créditos gerados nas compras.
              </p>
              <p className="text-sm text-[#5F6572] leading-6 mt-4">
                Por ser uma visão estritamente transacional, ela reflete a eficiência da sua cadeia de suprimentos e não inclui créditos contábeis extranota (como folha e depreciação).
              </p>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#5F6572]">Estimada em</p>
                <p className="text-2xl leading-none font-bold text-[#0d0f1c] mt-1">8,5%</p>
              </div>
            </div>

            <Card className="rounded-xl bg-white border border-border lg:col-start-2">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="mb-5">
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-semibold text-[#5F6572]">PIS/COFINS atual</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block h-5 w-1.5 rounded-full bg-[#98A2B3]" aria-hidden />
                        <p className="text-lg leading-none font-bold text-[#0d0f1c]">{formatBRL(pisCofinsAtualReais)}</p>
                      </div>
                      <p className="text-xs text-[#5F6572] mt-2 leading-4">baseado nas notas de saída atuais</p>
                    </div>

                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-semibold text-[#5F6572]">CBS Débito</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block h-5 w-1.5 rounded-full bg-[#EB7A00]" aria-hidden />
                        <p className="text-lg leading-none font-bold text-[#0d0f1c]">-6.303.074</p>
                      </div>
                      <p className="text-xs text-[#5F6572] mt-2 leading-4">simulado</p>
                    </div>

                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-semibold text-[#5F6572]">CBS Crédito</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block h-5 w-1.5 rounded-full bg-[#027A48]" aria-hidden />
                        <p className="text-lg leading-none font-bold text-[#0d0f1c]">3.537.518</p>
                      </div>
                      <p className="text-xs text-[#5F6572] mt-2 leading-4">simulado</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#5F6572] leading-5 mb-4">
                  O saldo de CBS é a diferença entre os débitos e os créditos simulados para o período.
                </p>

                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-x-3 gap-y-1">
                  <div>
                    <p className="text-xs font-semibold text-[#5F6572] leading-tight whitespace-nowrap">
                      Saldo CBS (simulação)
                    </p>
                  </div>
                  <div />
                  <div>
                    <p className="text-xs font-semibold text-[#5F6572] leading-tight">faturamento líquido</p>
                  </div>
                  <div />
                  <div>
                    <p className="text-xs font-semibold text-[#5F6572] leading-tight">Alíquota Efetiva</p>
                  </div>

                  <div>
                    <p className="text-xl leading-none font-bold text-[#0d0f1c]">{cbsResumo.saldoCbsSimulacaoLabel}</p>
                  </div>
                  <span className="text-xl font-semibold text-[#5F6572] self-end leading-none">÷</span>
                  <div>
                    <p className="text-xl leading-none font-semibold text-[#0d0f1c]">{cbsResumo.faturamentoLiquidoLabel}</p>
                  </div>
                  <span className="text-xl font-semibold text-[#5F6572] self-end leading-none">=</span>
                  <div>
                    <p className="text-xl leading-none font-semibold text-[#0d0f1c]">{cbsResumo.aliquotaEfetivaSimulacaoLabel}</p>
                  </div>
                </div>

              </CardContent>
            </Card>

            <div className="lg:col-span-2 border-t border-border my-2" />

            <div className="lg:col-start-1">
              <div className="mb-2 flex items-center gap-2">
                <BadgeDollarSign className="h-5 w-5 text-[#0d0f1c]" aria-hidden />
                <h3 className="text-base font-bold text-[#0d0f1c]">Conciliação de créditos de CBS</h3>
              </div>
              <p className="text-sm text-[#5F6572] leading-6">
                A <strong>Qive</strong> cruza os dados dos seus XMLs com a <strong>API de apuração assistida</strong>{" "}
                da Receita Federal para auditar a liberação dos seus créditos.
              </p>
              <p className="text-sm text-[#5F6572] leading-6 mt-4">
                Divergências ou retenções de saldo geralmente ocorrem por falha de recolhimento do imposto pelos seus
                fornecedores (Split Payment), atrasos na validação do Governo ou diferenças de cálculo.
              </p>
            </div>

            <Card className="rounded-xl bg-white border border-border lg:col-start-2">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#5F6572] leading-tight">Divergência de créditos</p>
                  <p className="text-2xl leading-none font-bold text-[#0d0f1c] mt-1">{formatBRL(conciliacaoCbs.divergencia)}</p>
                  <p className="text-xs text-[#5F6572] mt-2 leading-4">
                    Diferença entre o crédito apurado (fisco) e o crédito potencial (xml).
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs font-semibold text-[#5F6572]">Crédito apurado</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block h-5 w-1.5 rounded-full bg-[#98A2B3]" aria-hidden />
                      <p className="text-lg leading-none font-bold text-[#0d0f1c]">{formatBRL(conciliacaoCbs.creditoApurado)}</p>
                    </div>
                    <p className="text-xs text-[#5F6572] mt-2 leading-4">na apuração assistida</p>
                  </div>

                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs font-semibold text-[#5F6572]">Crédito liberado</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block h-5 w-1.5 rounded-full bg-[#98A2B3]" aria-hidden />
                      <p className="text-lg leading-none font-bold text-[#0d0f1c]">{formatBRL(conciliacaoCbs.creditoLiberado)}</p>
                    </div>
                    <p className="text-xs text-[#5F6572] mt-2 leading-4">confirmado</p>
                  </div>

                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs font-semibold text-[#5F6572]">Saldo pendente</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block h-5 w-1.5 rounded-full bg-[#EB7A00]" aria-hidden />
                      <p className="text-lg leading-none font-bold text-[#0d0f1c]">{formatBRL(conciliacaoCbs.saldoPendente)}</p>
                    </div>
                    <p className="text-xs text-[#5F6572] mt-2 leading-4">aguardando liberação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full rounded-xl bg-white border border-border mt-4">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-base font-bold text-[#0d0f1c]">Fornecedores</h2>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
            <div>
              <p className="text-sm text-[#5F6572] leading-6">
                Analise contratos equilibrando o percentual de fornecedores pelo regime tributário que destaquem
                CBS/IBS, assegurando o recebimento de créditos e margens de lucro mais saudáveis.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-[#5F6572]">Sem destaque CBS/IBS</p>
                  <p className="text-2xl leading-none font-bold text-[#0d0f1c] mt-1">{formatBRL(fornecedores.semDestaque)}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#5F6572]">Simples e MEI</p>
                  <p className="text-2xl leading-none font-bold text-[#0d0f1c] mt-1">{formatBRL(fornecedores.simplesMei)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h3 className="text-base font-bold text-[#0d0f1c] mb-2">Regime tributário</h3>

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#5F6572]">Normal</p>
                      <p className="text-base leading-none text-[#0d0f1c]">{formatBRL(fornecedores.regimeNormal)}</p>
                    </div>
                    <div className="flex h-10 w-full overflow-hidden rounded-[6px]">
                      <div
                        className="flex h-full min-w-0 shrink-0 grow-0 items-center justify-center overflow-hidden bg-[#0D2FA8]"
                        style={{ flex: `0 0 ${cssPercentFromRatio(fornecedores.pctRegimeNormal)}` }}
                      >
                        <span className="text-base leading-none font-bold text-white">
                          {formatPercentLabel(fornecedores.pctRegimeNormal)}
                        </span>
                      </div>
                      <div className="h-full min-w-0 flex-1 bg-[#E9ECEF]" aria-hidden />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#5F6572]">Simples e MEI</p>
                      <p className="text-base leading-none text-[#0d0f1c]">{formatBRL(fornecedores.simplesMei)}</p>
                    </div>
                    <div className="flex h-10 w-full overflow-hidden rounded-[6px]">
                      <div
                        className="flex h-full min-w-0 shrink-0 grow-0 items-center justify-end overflow-hidden bg-[#FF9800] pr-4"
                        style={{ flex: `0 0 ${cssPercentFromRatio(fornecedores.pctRegimeSimplesMei)}` }}
                      >
                        <span className="text-base leading-none font-bold text-[#0d0f1c]">
                          {formatPercentLabel(fornecedores.pctRegimeSimplesMei)}
                        </span>
                      </div>
                      <div className="h-full min-w-0 flex-1 bg-[#E9ECEF]" aria-hidden />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0d0f1c] mb-2">Destaque CBS / IBS</h3>

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#5F6572]">Com destaque CBS/IBS</p>
                      <p className="text-base leading-none text-[#0d0f1c]">{formatBRL(fornecedores.comDestaque)}</p>
                    </div>
                    <div className="flex h-10 w-full overflow-hidden rounded-[6px]">
                      <div
                        className="flex h-full min-w-0 shrink-0 grow-0 items-center justify-end overflow-hidden bg-[#0D2FA8] pr-4"
                        style={{ flex: `0 0 ${cssPercentFromRatio(fornecedores.pctComDestaque)}` }}
                      >
                        <span className="text-base leading-none font-bold text-white">
                          {formatPercentLabel(fornecedores.pctComDestaque)}
                        </span>
                      </div>
                      <div className="h-full min-w-0 flex-1 bg-[#E9ECEF]" aria-hidden />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#5F6572]">Sem destaque CBS/IBS</p>
                      <p className="text-base leading-none text-[#0d0f1c]">{formatBRL(fornecedores.semDestaque)}</p>
                    </div>
                    <div className="flex h-10 w-full overflow-hidden rounded-[6px]">
                      <div
                        className="flex h-full min-w-0 shrink-0 grow-0 items-center justify-end overflow-hidden bg-[#FF9800] pr-4"
                        style={{ flex: `0 0 ${cssPercentFromRatio(fornecedores.pctSemDestaque)}` }}
                      >
                        <span className="text-base leading-none font-bold text-[#0d0f1c]">
                          {formatPercentLabel(fornecedores.pctSemDestaque)}
                        </span>
                      </div>
                      <div className="h-full min-w-0 flex-1 bg-[#E9ECEF]" aria-hidden />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-auto gap-3 p-0 text-sm font-medium text-[#5B616F] hover:bg-transparent hover:text-[#434A57]"
              >
                <a href="#">
                  <ExternalLink className="h-5 w-5" aria-hidden />
                  <span>Ver mais no Portal de Fornecedores</span>
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
