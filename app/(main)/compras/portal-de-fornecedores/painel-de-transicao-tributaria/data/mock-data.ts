export type ComplianceCardVariant = "danger" | "warning" | "success";

export interface ComplianceCard {
  id: string;
  variant: ComplianceCardVariant;
  title: string;
  percentage: string;
  amount: string;
  description: string;
}

export interface BarIndicator {
  id: string;
  label: string;
  amount: string;
  percentage: number;
  percentageLabel: string;
  fillColor: string;
}

export interface SupplierAlert {
  id: string;
  label: string;
  amount: string;
}

export { ACCOUNT_OPTIONS } from "../../data/account-options";
export const COMPANY_FILTER_OPTIONS = ["12.345.678/0001-90", "12.345.678/0002-71"];
export const SUPPLIER_PERIOD_OPTIONS = ["Todo o período", "Últimos 30 dias", "Últimos 90 dias"];
export const DOCUMENT_TYPE_OPTIONS = ["Todos os documentos", "NF-e", "NFS-e", "CT-e"];

export const COMPLIANCE_CARDS: ComplianceCard[] = [
  {
    id: "high-risk",
    variant: "danger",
    title: "Risco Alto de Perda de Crédito",
    percentage: "15%",
    amount: "R$ 125.430,00",
    description:
      "Fornecedores recorrentes que ainda precisam de ajustes para não gerar perdas.",
  },
  {
    id: "evaluation",
    variant: "warning",
    title: "Avaliação necessária",
    percentage: "20%",
    amount: "R$ 167.240,00",
    description:
      "Fornecedores eventuais que precisam se regularizar ou ser reavaliados.",
  },
  {
    id: "safe",
    variant: "success",
    title: "Crédito seguro",
    percentage: "65%",
    amount: "R$ 543.520,00",
    description: "Fornecedores prontos para a reforma tributária. Sua operação está segura.",
  },
];

export const REGIME_BARS: BarIndicator[] = [
  {
    id: "normal",
    label: "Normal",
    amount: "R$ 15.432",
    percentage: 22.2,
    percentageLabel: "22,2%",
    fillColor: "#0C3CF7",
  },
  {
    id: "simples-mei",
    label: "Simples e MEI",
    amount: "R$ 69.548",
    percentage: 77.8,
    percentageLabel: "77,8%",
    fillColor: "#F97316",
  },
];

export const CBS_IBS_BARS: BarIndicator[] = [
  {
    id: "com-destaque",
    label: "com destaque CBS/IBS",
    amount: "R$ 18.976",
    percentage: 38.5,
    percentageLabel: "38,5%",
    fillColor: "#0C3CF7",
  },
  {
    id: "sem-destaque",
    label: "sem destaque CBS/IBS",
    amount: "R$ 256.234",
    percentage: 62.5,
    percentageLabel: "62,5%",
    fillColor: "#F97316",
  },
];

export const SUPPLIER_ALERTS: SupplierAlert[] = [
  { id: "simples-mei", label: "Simples e MEI", amount: "R$ 69.548,00" },
  { id: "sem-destaque", label: "Sem destaque CBS/IBS", amount: "R$ 256.235,00" },
];

export const LAST_UPDATE = {
  label: "Última atualização",
  value: "20/02/2024 às 14:05",
};

/** E-mail do usuário logado (mock) — pré-preenchido no formulário de feedback */
export const FEEDBACK_USER_EMAIL = "usuario@empresa.com";
