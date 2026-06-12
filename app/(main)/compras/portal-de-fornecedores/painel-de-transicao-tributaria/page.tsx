"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { PanoramaConformidade } from "./components/PanoramaConformidade";
import { FornecedoresSection } from "./components/FornecedoresSection";
import { PortalFeedbackCTA } from "./components/PortalFeedbackCTA";
import { DEFAULT_ACCOUNT_OPTION, type AccountOption } from "../data/account-options";
import { getPortalPageTitleFromPathname } from "../lib/portal-paths";
import {
  ACCOUNT_OPTIONS,
  COMPANY_FILTER_OPTIONS,
  LAST_UPDATE,
} from "./data/mock-data";

export default function PainelTransicaoTributariaPage() {
  const pathname = usePathname();
  const pageTitle = getPortalPageTitleFromPathname(pathname);
  const [account, setAccount] = React.useState<AccountOption>(DEFAULT_ACCOUNT_OPTION);
  const [companyFilter, setCompanyFilter] = React.useState(COMPANY_FILTER_OPTIONS[0]);
  const [supplierPeriod, setSupplierPeriod] = React.useState("Todo o período");
  const [documentType, setDocumentType] = React.useState("Todos os documentos");

  return (
    <section className="space-y-4 p-3 lg:p-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">{pageTitle}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#5B616F]">
            <span>Exibindo dados da conta:</span>
            <select
              value={account}
              onChange={(event) => setAccount(event.target.value as AccountOption)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[rgba(4,14,35,0.12)] bg-white px-3 text-sm font-medium text-[#0d0f1c] appearance-none pr-9"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B616F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {ACCOUNT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-right text-xs leading-4 text-[#8A90A0]">
          <span className="block">{LAST_UPDATE.label}</span>
          <span className="font-medium text-[#5B616F]">{LAST_UPDATE.value}</span>
        </p>
      </header>

      <PanoramaConformidade
        companyFilter={companyFilter}
        onCompanyFilterChange={setCompanyFilter}
      />

      <section className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
        <div className="space-y-4 p-3 lg:p-4">
          <FornecedoresSection
            companyFilter={companyFilter}
            period={supplierPeriod}
            documentType={documentType}
            onPeriodChange={setSupplierPeriod}
            onDocumentTypeChange={setDocumentType}
          />

          <PortalFeedbackCTA />
        </div>
      </section>
    </section>
  );
}
