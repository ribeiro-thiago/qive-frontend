export const ACCOUNT_OPTIONS = [
  "Atlas A5 Incorporadas",
  "CJR Construtora",
  "Interparv Construções",
  "Grupo Max",
  "Filial SP",
] as const;

export type AccountOption = (typeof ACCOUNT_OPTIONS)[number];

export const DEFAULT_ACCOUNT_OPTION: AccountOption = "CJR Construtora";
