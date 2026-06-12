export type AprovacaoPermissaoOption = {
  id: string;
  title: string;
  description: string;
};

export const GESTAO_PAGAMENTOS_APROVACAO_OPTIONS: AprovacaoPermissaoOption[] = [
  {
    id: "aprovar-pagamento-lancar-pagar",
    title: "Aprovar pagamento e lançar em pagar",
    description:
      "Acesso para aprovação de um pagamento. (Necessário para habilitar o fluxo de aprovação)",
  },
  {
    id: "lancar-liquidados-cancelados-bloqueados",
    title: "Lançar em liquidados, cancelados e bloqueados",
    description:
      "Permissão para lançar contas em todas as etapas a partir da etapa pagar",
  },
];

export function createCheckboxPermissionState(
  options: AprovacaoPermissaoOption[]
): Record<string, boolean> {
  return Object.fromEntries(options.map((option) => [option.id, false]));
}
