"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildCadastroFilterUrl } from "../../lib/cadastro-navigation";
import { FilterSelect } from "./FilterSelect";
import {
  COMPLIANCE_CARDS,
  COMPANY_FILTER_OPTIONS,
  type ComplianceCard,
  type ComplianceCardVariant,
} from "../data/mock-data";

const CARD_STYLES: Record<
  ComplianceCardVariant,
  { container: string; title: string; value: string }
> = {
  danger: {
    container: "bg-red-50 border-red-200 hover:bg-red-100/80",
    title: "text-red-900",
    value: "text-red-800",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100/80",
    title: "text-yellow-900",
    value: "text-yellow-800",
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100/80",
    title: "text-emerald-900",
    value: "text-emerald-800",
  },
};

type PanoramaConformidadeProps = {
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
};

function ComplianceMetricCard({
  card,
  companyFilter,
}: {
  card: ComplianceCard;
  companyFilter: string;
}) {
  const styles = CARD_STYLES[card.variant];
  const href = buildCadastroFilterUrl(card.id, { empresa: companyFilter });

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex w-full cursor-pointer flex-col rounded-lg border p-4 text-left transition-colors",
        styles.container
      )}
      aria-label={`${card.title}: ver fornecedores filtrados no Cadastro`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className={cn("text-sm font-bold leading-snug", styles.title)}>{card.title}</h3>
        <ChevronRight className={cn("h-5 w-5 shrink-0", styles.value)} aria-hidden />
      </div>
      <p className={cn("mt-3 text-[32px] font-bold leading-none tracking-tight", styles.value)}>
        {card.percentage}
      </p>
      <p className={cn("mt-1 text-base font-semibold", styles.value)}>{card.amount}</p>
      <p className="mt-3 text-sm leading-5 text-[#5B616F]">{card.description}</p>
    </Link>
  );
}

export function PanoramaConformidade({
  companyFilter,
  onCompanyFilterChange,
}: PanoramaConformidadeProps) {
  return (
    <section className="rounded-lg border border-[rgba(4,14,35,0.08)] bg-white p-4 shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
      <div className="space-y-4">
        <header className="space-y-2">
          <div className="flex w-full items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#0d0f1c]">Panorama de Conformidade</h2>
            <FilterSelect
              label="CNPJ"
              value={companyFilter}
              options={[...COMPANY_FILTER_OPTIONS]}
              onChange={onCompanyFilterChange}
              className="shrink-0 [&_select]:min-w-[220px]"
            />
          </div>
          <p className="text-sm leading-5 text-[#5B616F]">
            Analisamos automaticamente fornecedores recorrentes com baixo aproveitamento de crédito
            para otimizar sua transição tributária. Monitore o preparo da sua base e maximize a
            captura de créditos ao longo da transição.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {COMPLIANCE_CARDS.map((card) => (
            <ComplianceMetricCard key={card.id} card={card} companyFilter={companyFilter} />
          ))}
        </div>

        <div className="space-y-2">
          <div className="h-px bg-[rgba(4,14,35,0.08)]" role="separator" aria-hidden />
          <p className="text-sm text-[#5B616F]">
            Essas informações são referentes aos últimos 12 meses.
          </p>
        </div>
      </div>
    </section>
  );
}

