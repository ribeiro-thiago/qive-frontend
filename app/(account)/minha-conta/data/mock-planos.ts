export type PlanId = "inicial" | "rotinas" | "gestao";
export type BillingCycle = "anual" | "mensal";

export type DfeQuantityOption = {
  value: number;
  label: string;
};

export type PlanDefinition = {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualSavings: number;
  recommended?: boolean;
  features: string[];
};

export type AccountPlan = {
  planId: PlanId;
  billingCycle: BillingCycle;
  dfeQuantity: number;
};

export const DFE_QUANTITY_OPTIONS: DfeQuantityOption[] = [
  { value: 100, label: "100 notas /mês" },
  { value: 500, label: "500 notas /mês" },
  { value: 1000, label: "1000 notas /mês" },
  { value: 5000, label: "5000 notas /mês" },
];

export const PLANS: PlanDefinition[] = [
  {
    id: "inicial",
    name: "Inicial",
    monthlyPrice: 152.14,
    annualSavings: 202.92,
    features: [
      "Até 2 CNPJs e 2 usuários",
      "Consulta e download de NF-es e CT-es",
      "Consulta e download de NF-es emitidas",
      "Manifestação de notas",
      "Fechamento de mês",
    ],
  },
  {
    id: "rotinas",
    name: "Rotinas",
    monthlyPrice: 274.87,
    annualSavings: 366.6,
    recommended: true,
    features: [
      "Todas as funcionalidades do plano Inicial",
      "Relatórios avançados em Excel",
      "Etiquetas personalizadas",
      "Integração com ERP para NF-es emitidas",
    ],
  },
  {
    id: "gestao",
    name: "Gestão",
    monthlyPrice: 383.2,
    annualSavings: 510.96,
    features: [
      "Todas as funcionalidades do plano Rotinas",
      "Integrações via API",
      "Análise de preço de produto",
      "Análise de custos de transporte",
    ],
  },
];

export const CURRENT_ACCOUNT_PLAN: AccountPlan = {
  planId: "rotinas",
  billingCycle: "anual",
  dfeQuantity: 100,
};

const ANNUAL_PRICING: Record<
  PlanId,
  Record<number, { total: number; discount: number; subtotal: number; installment: number }>
> = {
  inicial: {
    100: { total: 2029.2, discount: 202.92, subtotal: 1826.28, installment: 152.14 },
    500: { total: 2029.2, discount: 202.92, subtotal: 1826.28, installment: 152.14 },
    1000: { total: 2029.2, discount: 202.92, subtotal: 1826.28, installment: 152.14 },
    5000: { total: 2029.2, discount: 202.92, subtotal: 1826.28, installment: 152.14 },
  },
  rotinas: {
    100: { total: 3665.04, discount: 366.6, subtotal: 3311.98, installment: 274.87 },
    500: { total: 3665.04, discount: 366.6, subtotal: 3311.98, installment: 274.87 },
    1000: { total: 3665.04, discount: 366.6, subtotal: 3311.98, installment: 274.87 },
    5000: { total: 3665.04, discount: 366.6, subtotal: 3311.98, installment: 274.87 },
  },
  gestao: {
    100: { total: 5109.6, discount: 510.96, subtotal: 4598.64, installment: 383.2 },
    500: { total: 5109.6, discount: 510.96, subtotal: 4598.64, installment: 383.2 },
    1000: { total: 5109.6, discount: 510.96, subtotal: 4598.64, installment: 383.2 },
    5000: { total: 5109.6, discount: 510.96, subtotal: 4598.64, installment: 383.2 },
  },
};

export function getPlanById(planId: PlanId): PlanDefinition {
  return PLANS.find((plan) => plan.id === planId) ?? PLANS[1];
}

export function parsePlanId(value: string | null | undefined): PlanId | null {
  if (value === "inicial" || value === "rotinas" || value === "gestao") {
    return value;
  }
  return null;
}

export function formatPlanCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function getPlanSummary(
  planId: PlanId,
  billingCycle: BillingCycle,
  dfeQuantity: number,
) {
  const plan = getPlanById(planId);

  if (billingCycle === "anual") {
    const pricing =
      ANNUAL_PRICING[planId][dfeQuantity] ?? ANNUAL_PRICING[planId][100];

    return {
      plan,
      billingCycle,
      dfeQuantity,
      lineLabel: `${plan.name} (Anual)`,
      total: pricing.total,
      discount: pricing.discount,
      subtotal: pricing.subtotal,
      installment: pricing.installment,
      monthlyPrice: plan.monthlyPrice,
    };
  }

  const subtotal = plan.monthlyPrice;

  return {
    plan,
    billingCycle,
    dfeQuantity,
    lineLabel: `${plan.name} (Mensal)`,
    total: subtotal,
    discount: 0,
    subtotal,
    installment: subtotal,
    monthlyPrice: plan.monthlyPrice,
  };
}

export function getCurrentPlanDisplayName() {
  const plan = getPlanById(CURRENT_ACCOUNT_PLAN.planId);
  const cycleLabel =
    CURRENT_ACCOUNT_PLAN.billingCycle === "anual" ? "Anual" : "Mensal";
  return `Plano ${plan.name} ${cycleLabel} 2025`;
}

export function getCurrentPlanDfeLimit() {
  return CURRENT_ACCOUNT_PLAN.dfeQuantity === 100
    ? 5000
    : CURRENT_ACCOUNT_PLAN.dfeQuantity;
}
