"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Info,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CURRENT_ACCOUNT_PLAN,
  DFE_QUANTITY_OPTIONS,
  PLANS,
  formatPlanCurrency,
  getPlanSummary,
  parsePlanId,
  type BillingCycle,
  type PlanId,
} from "../data/mock-planos";

function PlanRadio({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full border-2",
        selected ? "border-[#0C3CF7] bg-[#0C3CF7]" : "border-[#C5C9D1] bg-white",
      )}
      aria-hidden
    >
      {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
    </span>
  );
}

const PLAN_ILLUSTRATIONS: Partial<Record<PlanId, string>> = {
  inicial: "/minha-conta/escolha-plano/ilustra-inicial.png",
  rotinas: "/minha-conta/escolha-plano/ilustra-rotinas.png",
  gestao: "/minha-conta/escolha-plano/ilustra-gestao.png",
};

function PlanIllustration({ planId }: { planId: PlanId }) {
  const label =
    planId === "inicial"
      ? "Consulta de documentos"
      : planId === "rotinas"
        ? "Rotinas e relatórios"
        : "Gestão avançada";

  const illustrationSrc = PLAN_ILLUSTRATIONS[planId];

  return (
    <div className="mt-auto flex h-[140px] items-end justify-center rounded-lg bg-white px-4 pb-4">
      {illustrationSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={illustrationSrc}
          alt={label}
          className="h-[120px] w-auto max-w-full object-contain"
        />
      ) : (
        <div className="flex h-[110px] w-full max-w-[220px] items-center justify-center rounded-md border border-[#E7EEFF] bg-white text-xs font-medium text-[#5F6572]">
          {label}
        </div>
      )}
    </div>
  );
}

export default function EscolhaPlanoPage() {
  const searchParams = useSearchParams();
  const initialPlanId =
    parsePlanId(searchParams.get("plano")) ?? CURRENT_ACCOUNT_PLAN.planId;

  const [selectedPlanId, setSelectedPlanId] = React.useState<PlanId>(initialPlanId);
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>(
    CURRENT_ACCOUNT_PLAN.billingCycle,
  );
  const [dfeQuantity, setDfeQuantity] = React.useState(
    CURRENT_ACCOUNT_PLAN.dfeQuantity,
  );

  const summary = getPlanSummary(selectedPlanId, billingCycle, dfeQuantity);

  return (
    <section className="min-h-full bg-white px-6 py-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold leading-tight text-[#0d0f1c]">
            O melhor plano para o seu negócio
          </h1>
          <p className="mt-2 text-sm text-[#5F6572]">
            Escolha um plano e continue utilizando a Qive hoje mesmo
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={cn(
                    "flex min-h-[520px] w-full flex-col rounded-xl border bg-white p-5 text-left transition-colors",
                    isSelected
                      ? "border-[#0C3CF7] shadow-[0_0_0_1px_#0C3CF7]"
                      : "border-[rgba(4,14,35,0.12)] hover:border-[rgba(4,14,35,0.2)]",
                  )}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-[#0d0f1c]">{plan.name}</h2>
                        {plan.recommended ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E7EEFF] px-2 py-0.5 text-[11px] font-semibold text-[#0C3CF7]">
                            <Rocket className="h-3 w-3" aria-hidden />
                            Recomendado
                          </span>
                        ) : null}
                      </div>
                      <p className="text-2xl font-bold text-[#0d0f1c]">
                        {formatPlanCurrency(plan.monthlyPrice)}
                        <span className="text-sm font-medium text-[#5F6572]"> /mês</span>
                      </p>
                      <p className="text-xs font-medium text-[#5F6572]">
                        Economize {formatPlanCurrency(plan.annualSavings)} /ano
                      </p>
                    </div>
                    <PlanRadio selected={isSelected} />
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[#0d0f1c]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0C3CF7]" aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <PlanIllustration planId={plan.id} />
                </button>
              );
            })}
          </div>

          <aside className="h-fit rounded-xl border border-[rgba(4,14,35,0.12)] bg-white p-5 xl:sticky xl:top-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0d0f1c]">
                  Plano {summary.plan.name}
                </h2>
                <p className="text-sm text-[#5F6572]">Tipo de assinatura</p>
              </div>
              <CalendarDays className="h-5 w-5 shrink-0 text-[#F97316]" aria-hidden />
            </div>

            <div className="mb-5 space-y-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[rgba(4,14,35,0.12)] px-3 py-2.5">
                <input
                  type="radio"
                  name="billing-cycle"
                  checked={billingCycle === "anual"}
                  onChange={() => setBillingCycle("anual")}
                  className="h-4 w-4 accent-[#0C3CF7]"
                />
                <span className="text-sm font-semibold text-[#0d0f1c]">Anual</span>
                <span className="ml-auto inline-flex rounded-full bg-[#ECFDF1] px-2 py-0.5 text-[11px] font-semibold text-[#166534]">
                  Economize 10%
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[rgba(4,14,35,0.12)] px-3 py-2.5">
                <input
                  type="radio"
                  name="billing-cycle"
                  checked={billingCycle === "mensal"}
                  onChange={() => setBillingCycle("mensal")}
                  className="h-4 w-4 accent-[#0C3CF7]"
                />
                <span className="text-sm font-semibold text-[#0d0f1c]">Mensal</span>
              </label>
            </div>

            <div className="mb-5">
              <div className="mb-1 flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#0d0f1c]">
                  Quantidade de DF-es
                </span>
                <Info className="h-3.5 w-3.5 text-[#5F6572]" aria-hidden />
              </div>
              <div className="relative">
                <select
                  value={dfeQuantity}
                  onChange={(event) => setDfeQuantity(Number(event.target.value))}
                  className="h-10 w-full appearance-none rounded-lg border border-[rgba(4,14,35,0.12)] bg-white px-3 pr-9 text-sm font-medium text-[#0d0f1c]"
                >
                  {DFE_QUANTITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#5F6572]"
                  aria-hidden
                />
              </div>
            </div>

            <div className="space-y-2 border-t border-[rgba(4,14,35,0.08)] pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#5F6572]">{summary.lineLabel}</span>
                <span className="font-medium text-[#0d0f1c]">
                  {formatPlanCurrency(summary.total)}
                </span>
              </div>
              {summary.discount > 0 ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#5F6572]">Desconto</span>
                  <span className="font-medium text-[#166534]">
                    - {formatPlanCurrency(summary.discount)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="font-semibold text-[#0d0f1c]">Subtotal</span>
                <span className="text-base font-bold text-[#0d0f1c]">
                  {formatPlanCurrency(summary.subtotal)}
                </span>
              </div>
              {billingCycle === "anual" ? (
                <div className="flex items-center gap-1.5 text-xs text-[#5F6572]">
                  <span>Até 12x de {formatPlanCurrency(summary.installment)}</span>
                  <Info className="h-3.5 w-3.5" aria-hidden />
                </div>
              ) : null}
            </div>

            <Button type="button" className="mt-5 w-full font-bold">
              Escolher {summary.plan.name}
            </Button>

            <p className="mt-4 text-center text-xs text-[#5F6572]">
              Você é contador?{" "}
              <button type="button" className="font-semibold text-[#0C3CF7] hover:underline">
                Fale com a gente
              </button>
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
