import {
  markCbsForecastFilterIntentFromDashboard,
} from "../../gestao-de-pagamentos/utils/navigation-intent";

/**
 * Função para navegar para gestão de pagamentos com filtro de "Sem data de vencimento"
 * Reutilizável entre CardAlertas e VisaoAging
 */
export function navigateToSemVencimento(
  router: { push: (url: string) => void },
  selectedCompany?: string | string[]
) {
  const params = new URLSearchParams();
  params.set('period', 'Sem data de vencimento');
  
  if (selectedCompany) {
    const companyParam = Array.isArray(selectedCompany) 
      ? selectedCompany.join(',') 
      : selectedCompany;
    params.set('company', companyParam);
  }
  
  router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
}

/**
 * Navega para Gestão de Pagamentos > Todas as contas com filtro CBS explícito via URL.
 * O carregamento padrão da aba não usa este parâmetro.
 */
export function navigateToCbsPrevistoContas(
  router: { push: (url: string) => void },
  selectedCompany?: string | string[]
) {
  markCbsForecastFilterIntentFromDashboard();
  const params = new URLSearchParams();
  params.set("tab", "todas");

  if (selectedCompany) {
    const companyParam = Array.isArray(selectedCompany)
      ? selectedCompany.join(",")
      : selectedCompany;
    params.set("company", companyParam);
  }

  router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
}
