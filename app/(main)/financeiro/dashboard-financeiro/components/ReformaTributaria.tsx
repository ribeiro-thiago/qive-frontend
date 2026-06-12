"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Info } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import { navigateToCbsPrevistoContas } from "../utils/navigation";

const CBS_DISCLAIMER =
  "Os valores exibidos são estimativas para acompanhamento interno e não indicam crédito liberado, validado ou apurado oficialmente pela Receita Federal.";

/** Borda tracejada customizada — traços um pouco maiores que border-dashed nativo */
const FUTURE_CARD_DASHED_BORDER_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
    '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="none" rx="8" ry="8" stroke="rgba(4,14,35,0.12)" stroke-width="1" stroke-dasharray="7 5" stroke-linecap="round"/></svg>'
  )}")`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
};

interface ReformaTributariaProps {
  cbsCredit: {
    value: number;
    consideredAccounts: number;
  };
  selectedCompany?: string | string[];
}

export function ReformaTributaria({ cbsCredit, selectedCompany }: ReformaTributariaProps) {
  const router = useRouter();
  const hasCbsCredit = cbsCredit.value > 0 && cbsCredit.consideredAccounts > 0;

  const handleVerContas = React.useCallback(() => {
    navigateToCbsPrevistoContas(router, selectedCompany);
  }, [router, selectedCompany]);

  return (
    <Card className="rounded-xl bg-white border border-border h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px] flex-shrink-0">
        <h3 className="text-sm font-semibold text-[#0d0f1c]">Reforma Tributária</h3>
        <Tag
          bgColor="bg-[#E7EEFF]"
          textColor="text-[#0C3CF7]"
          borderColor="border-[#B8CCFF]"
          className="ml-1"
        >
          Novo
        </Tag>
      </div>
      <CardContent className="flex flex-col flex-1 min-h-0 !py-5 !px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 flex-1 min-h-0">
          {/* Card principal — hierarquia no topo, disclaimer como rodapé interno */}
          <div className="flex flex-col md:col-span-2 flex-1 min-h-0 rounded-lg border border-[rgba(4,14,35,0.1)] overflow-hidden">
            <div className="flex flex-1 min-h-0 flex-col px-5 pt-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
                <div className="min-w-0 flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#5F6572]">
                      Crédito previsto de CBS
                    </h4>
                    <div className="group relative">
                      <button
                        type="button"
                        className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-[#E7EEFF]"
                        aria-label="Informações sobre o crédito previsto de CBS"
                      >
                        <Info className="h-4 w-4 text-[#5F6572]" />
                      </button>
                      <div className="pointer-events-none invisible absolute left-0 top-6 z-50 w-80 rounded-md border border-[#EBECEE] bg-white p-3 opacity-0 shadow-lg transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                        <p className="text-xs leading-relaxed text-[#5F6572]">
                          Este valor é uma previsão calculada a partir da soma dos valores de CBS
                          identificados nos XMLs das notas fiscais vinculadas às contas a pagar. Notas
                          canceladas, denegadas, inutilizadas ou sem CBS preenchido não são consideradas.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="max-w-md text-sm leading-5 text-[#5F6572]">
                    {hasCbsCredit ? (
                      <>
                        Acompanhe o crédito previsto de CBS a partir das tags no
                        <br />
                        XML das notas vinculadas às suas contas a pagar.
                      </>
                    ) : (
                      "Nenhuma conta a pagar com CBS previsto encontrada até o momento."
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-1 md:items-end md:pt-0">
                  <div className="flex items-center gap-3 text-[32px]">
                    <span
                      className="inline-block h-[1cap] w-1.5 shrink-0 rounded-full bg-[#0C3CF7]"
                      aria-hidden
                    />
                    <div className="whitespace-nowrap font-bold leading-10 text-[rgba(4,14,35,0.88)]">
                      {formatCurrency(cbsCredit.value)}
                    </div>
                  </div>
                  {hasCbsCredit && (
                    <p className="pl-[18px] text-xs font-medium leading-4 text-[#5F6572]">
                      {cbsCredit.consideredAccounts}{" "}
                      {cbsCredit.consideredAccounts === 1
                        ? "conta a pagar considerada"
                        : "contas a pagar consideradas"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-0" aria-hidden="true" />

              <div className="flex shrink-0 justify-end mb-5">
                <Button type="button" onClick={handleVerContas}>
                  Ver contas
                </Button>
              </div>
            </div>

            <div className="flex shrink-0 border-t border-[#EBECEE] px-5 py-3">
              <p className="text-sm leading-5 text-[#5F6572]">{CBS_DISCLAIMER}</p>
            </div>
          </div>

          <FutureCreditCard
            title="Créditos liberados"
            description="Conciliação com créditos apurados e liberados oficialmente."
          />
          <FutureCreditCard
            title="Créditos pendentes"
            description="Créditos previstos ainda sem validação ou apuração disponível."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function FutureCreditCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="flex h-full min-h-0 flex-col rounded-lg border border-transparent bg-[#F5F5F6] p-4"
      style={FUTURE_CARD_DASHED_BORDER_STYLE}
    >
      <div className="flex min-h-[1.25rem] flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold text-[#5F6572]">{title}</h4>
        <Tag
          bgColor="bg-[#FFF2E0]"
          textColor="text-[#B85600]"
          borderColor="border-[#FFF2E0]"
        >
          Em breve
        </Tag>
      </div>
      <p className="mt-2.5 text-sm leading-5 text-[#5F6572]">{description}</p>
    </div>
  );
}
