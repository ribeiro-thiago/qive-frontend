"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  CADASTRO_PATH,
  buildEnquadramentoBarFilterUrl,
} from "../../lib/cadastro-navigation";
import { FilterSelect } from "./FilterSelect";
import { HorizontalBarIndicator } from "./HorizontalBarIndicator";
import {
  CBS_IBS_BARS,
  DOCUMENT_TYPE_OPTIONS,
  REGIME_BARS,
  SUPPLIER_ALERTS,
  SUPPLIER_PERIOD_OPTIONS,
} from "../data/mock-data";

interface FornecedoresSectionProps {
  companyFilter: string;
  period: string;
  documentType: string;
  onPeriodChange: (value: string) => void;
  onDocumentTypeChange: (value: string) => void;
}

export function FornecedoresSection({
  companyFilter,
  period,
  documentType,
  onPeriodChange,
  onDocumentTypeChange,
}: FornecedoresSectionProps) {
  const barLinkOptions = {
    empresa: companyFilter,
    periodo: period,
    tipoDocumento: documentType,
  };

  return (
    <section className="rounded-lg border border-[rgba(4,14,35,0.08)] bg-white p-4 shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-[#0d0f1c]">
            Enquadramento tributário dos Fornecedores
          </h2>
          <p className="text-sm leading-5 text-[#5B616F]">
            Melhore seu caixa priorizando fornecedores adequados à CBS/IBS.
          </p>
        </div>
        <Link
          href={CADASTRO_PATH}
          className="text-sm font-semibold text-[#0C3CF7] hover:underline"
        >
          Ver lista de fornecedores
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <FilterSelect
          label="Período"
          value={period}
          options={[...SUPPLIER_PERIOD_OPTIONS]}
          onChange={onPeriodChange}
        />
        <FilterSelect
          label="Tipo de documento"
          value={documentType}
          options={[...DOCUMENT_TYPE_OPTIONS]}
          onChange={onDocumentTypeChange}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          {REGIME_BARS.map((indicator) => (
            <HorizontalBarIndicator
              key={indicator.id}
              indicator={indicator}
              href={buildEnquadramentoBarFilterUrl(indicator.id, barLinkOptions)}
            />
          ))}
        </div>
        <div className="space-y-5">
          {CBS_IBS_BARS.map((indicator) => (
            <HorizontalBarIndicator
              key={indicator.id}
              indicator={indicator}
              href={buildEnquadramentoBarFilterUrl(indicator.id, barLinkOptions)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SUPPLIER_ALERTS.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-800" aria-hidden />
            <span className="text-sm font-semibold text-red-800">
              {alert.label}: {alert.amount}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
