export type PermissionItemType = "checkbox" | "link";

export type PermissionItem = {
  id: string;
  title: string;
  description: string;
  type: PermissionItemType;
};

export const DOCUMENT_PERMISSIONS: PermissionItem[] = [
  {
    id: "nfe",
    title: "NFe",
    description: "Listagem de acesso as NFe",
    type: "link",
  },
  {
    id: "cfe-sat",
    title: "CFe-SAT",
    description: "Listagem de acesso as CFe-SAT",
    type: "checkbox",
  },
  {
    id: "nfce",
    title: "NFCe",
    description: "Listagem de acesso as NFCe",
    type: "checkbox",
  },
  {
    id: "nfse",
    title: "NFSe",
    description: "Listagem de acesso as NFSe",
    type: "link",
  },
  {
    id: "gestao-pagamentos",
    title: "Gestão de Pagamentos",
    description: "Acesso à listagem de pagamentos e boletos",
    type: "checkbox",
  },
  {
    id: "mdfe",
    title: "MDFe",
    description: "Listagem de acesso as MDFe",
    type: "checkbox",
  },
  {
    id: "cte",
    title: "CTe",
    description: "Listagem de acesso as CTe",
    type: "link",
  },
];

export const NOTE_ACTION_PERMISSIONS: PermissionItem[] = [
  {
    id: "etiquetas",
    title: "Etiquetas",
    description: "Permite criar, editar e remover etiquetas",
    type: "link",
  },
  {
    id: "consulta-completa",
    title: "Consulta Completa",
    description: "Permite realizar consulta completa",
    type: "link",
  },
  {
    id: "baixar-compartilhar",
    title: "Baixar e Compartilhar",
    description: "Permite baixar e compartilhar",
    type: "link",
  },
  {
    id: "exportar-relatorios",
    title: "Exportar Relatórios",
    description: "Permite exportar relatórios",
    type: "link",
  },
];

export const FEATURE_PERMISSIONS: PermissionItem[] = [
  {
    id: "relatorios-avancados",
    title: "Relatórios Avançados",
    description: "Acesso aos relatórios avançados",
    type: "link",
  },
  {
    id: "gestao-pagamentos-aprovacao",
    title: "Gestão de Pagamentos - Aprovação",
    description: "Acesso ao fluxo de aprovação de pagamentos",
    type: "link",
  },
  {
    id: "produtividade",
    title: "Produtividade",
    description: "Acesso às funcionalidades de produtividade",
    type: "link",
  },
];

export function createPermissionState(items: PermissionItem[]): Record<string, boolean> {
  return Object.fromEntries(items.map((item) => [item.id, false]));
}

export function countEnabledPermissions(state: Record<string, boolean>): number {
  return Object.values(state).filter(Boolean).length;
}
