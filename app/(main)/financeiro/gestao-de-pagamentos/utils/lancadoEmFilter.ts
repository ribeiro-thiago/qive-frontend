import type { LancadoEm } from "../types";

export const LANCADO_EM_FILTER_PLACEHOLDER = "Selecione";

export const LANCADO_EM_FILTER_OPTIONS = [
  { value: "conferir", label: "Conferência" },
  { value: "aprovacao", label: "Aprovação" },
  { value: "pagar", label: "Pagamento" },
  { value: "bloqueados", label: "Bloqueados" },
  { value: "liquidados", label: "Liquidados" },
  { value: "cancelados", label: "Cancelados" },
] as const satisfies ReadonlyArray<{ value: LancadoEm; label: string }>;

export type LancadoEmFilterValue =
  | typeof LANCADO_EM_FILTER_PLACEHOLDER
  | (typeof LANCADO_EM_FILTER_OPTIONS)[number]["value"];

export function getLancadoEmFilterLabel(value: string): string {
  if (value === LANCADO_EM_FILTER_PLACEHOLDER) return value;
  return (
    LANCADO_EM_FILTER_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function isLancadoEmFilterActive(value: string | undefined): value is LancadoEm {
  if (!value || value === LANCADO_EM_FILTER_PLACEHOLDER) return false;
  return LANCADO_EM_FILTER_OPTIONS.some((option) => option.value === value);
}
