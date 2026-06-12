"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { BigNumberCard } from "@/components/shared/BigNumberCard";
import { OverviewCardsSection } from "@/components/shared/OverviewCardsSection";

const FILTER_DEFAULTS = {
  cnpjEmissor: "Todos",
  tipoDocumento: "Todos",
  pedido: "Todos",
  emissao: "Mês atual",
} as const;

const FILTER_OPTIONS = {
  cnpjEmissor: ["Todos"],
  tipoDocumento: ["Todos", "NF-e", "NFS-e", "CT-e"],
  pedido: ["Todos", "Automático", "Manual", "Não associado"],
  emissao: ["Mês atual", "Mês anterior", "Últimos 3 meses", "Todo o período"],
};

const OVERVIEW_CARDS = [
  { label: "Total de Notas" },
  { label: "Valor Total" },
  { label: "Pedido Automático" },
  { label: "Pedido Manual" },
  { label: "Pedido Não Associado" },
] as const;

const CHART_PANELS = [
  "Preenchimento do pedido",
  "Status de notas recebidas por período",
  "Destaque do período",
  "Histograma de Notas por Dia até Pagamento",
] as const;

function FilterField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const selectId = React.useId();

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="text-sm font-bold text-[#3D4350]">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="inline-flex h-9 w-full items-center justify-between rounded-lg border border-[rgba(4,14,35,0.12)] bg-white px-3 text-left text-sm text-[#5B616F] shadow-sm appearance-none pr-9"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B616F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChartPanel({ title }: { title: string }) {
  return (
    <section className="flex min-h-0 flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-bold text-[#3D4350]">{title}</h3>
        <Info className="h-4 w-4 text-[#8A90A0]" aria-hidden />
      </div>
      <div className="flex min-h-[200px] flex-1 items-center justify-center rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] px-4 py-8">
        <p className="text-center text-sm font-medium text-[#5B616F]">
          Não há dados para os filtros selecionados.
        </p>
      </div>
    </section>
  );
}

export function IndicadoresTabContent() {
  const [overviewExpanded, setOverviewExpanded] = React.useState(true);
  const [cnpjEmissor, setCnpjEmissor] = React.useState<string>(FILTER_DEFAULTS.cnpjEmissor);
  const [tipoDocumento, setTipoDocumento] = React.useState<string>(FILTER_DEFAULTS.tipoDocumento);
  const [pedido, setPedido] = React.useState<string>(FILTER_DEFAULTS.pedido);
  const [emissao, setEmissao] = React.useState<string>(FILTER_DEFAULTS.emissao);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField
          label="CNPJ Emissor"
          value={cnpjEmissor}
          options={FILTER_OPTIONS.cnpjEmissor}
          onChange={setCnpjEmissor}
        />
        <FilterField
          label="Tipo de documento"
          value={tipoDocumento}
          options={FILTER_OPTIONS.tipoDocumento}
          onChange={setTipoDocumento}
        />
        <FilterField
          label="Pedido"
          value={pedido}
          options={FILTER_OPTIONS.pedido}
          onChange={setPedido}
        />
        <FilterField
          label="Emissão"
          value={emissao}
          options={FILTER_OPTIONS.emissao}
          onChange={setEmissao}
        />
      </div>

      <OverviewCardsSection
        title="Visão Geral"
        expanded={overviewExpanded}
        onToggle={() => setOverviewExpanded((current) => !current)}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {OVERVIEW_CARDS.map((card) => (
            <BigNumberCard key={card.label} value="N/A" label={card.label} disableWhenZero={false} />
          ))}
        </div>
      </OverviewCardsSection>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#0d0f1c]">Detalhes de suas contas</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {CHART_PANELS.map((title) => (
            <ChartPanel key={title} title={title} />
          ))}
        </div>
      </section>
    </div>
  );
}
