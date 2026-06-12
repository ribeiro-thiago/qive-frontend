import type { MenuItem } from "./sidebar-types";
import { PORTAL_ADMIN_ROLES } from "@/lib/user/portal-user-types";

export const COMPRAS_SIDEBAR_SECTION_IDS = ["compras", "compras-analises", "compras-relatorios"] as const;

export type ComprasSidebarSectionId = (typeof COMPRAS_SIDEBAR_SECTION_IDS)[number];

export function isComprasSidebarSection(sectionId: string): boolean {
  return (COMPRAS_SIDEBAR_SECTION_IDS as readonly string[]).includes(sectionId);
}

export const COMPRAS_PORTAL_MENU_ITEMS: MenuItem[] = [
  {
    label: "Documentos de Fornecedores",
    groupItems: [
      { label: "NF-e", href: "/compras/portal-de-fornecedores/nfe" },
      { label: "NFS-e", href: "/compras/portal-de-fornecedores/nfse" },
      { label: "CT-e", href: "/compras/portal-de-fornecedores/cte" },
      { label: "CTE-OS", href: "/compras/portal-de-fornecedores/cte-os" },
    ],
  },
  {
    label: "Cadastro de Fornecedores",
    groupItems: [
      { label: "Cadastro", href: "/compras/portal-de-fornecedores/cadastro" },
    ],
  },
  {
    label: "Dados Analíticos",
    groupItems: [
      { label: "Indicadores", href: "/compras/portal-de-fornecedores/indicadores" },
    ],
  },
  {
    label: "Radar da Reforma Tributária",
    href: "/compras/portal-de-fornecedores/painel-de-transicao-tributaria",
  },
  {
    label: "Histórico Atividades",
    requiredRoles: PORTAL_ADMIN_ROLES,
    groupItems: [
      {
        label: "Registro de Atividades",
        href: "/compras/portal-de-fornecedores/historico-de-atividades",
        requiredRoles: PORTAL_ADMIN_ROLES,
      },
    ],
  },
];

export const COMPRAS_ANALISES_MENU_ITEMS: MenuItem[] = [
  { label: "Análise de Fornecedores", href: "/compras/analise-de-fornecedores" },
  { label: "Custos de Transporte", href: "/compras/custos-de-transporte" },
  { label: "Preço de Produto", href: "/compras/preco-de-produto" },
];

export const COMPRAS_RELATORIOS_MENU_ITEMS: MenuItem[] = [
  { label: "Conciliação Fiscal Tríplice", href: "/compras/conciliacao-fiscal-triplice" },
  { label: "Controle de Devolução", href: "/compras/controle-de-devolucao" },
];
