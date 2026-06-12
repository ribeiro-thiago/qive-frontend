import type { AcessoPortal, FornecedorAcessoPortal, FornecedorRow } from "../types";

export const MAX_ACESSOS_PORTAL = 5;

export function getAcessosPortal(fornecedor: FornecedorRow): FornecedorAcessoPortal[] {
  if (fornecedor.acessosPortal !== undefined) {
    return fornecedor.acessosPortal;
  }
  return buildDefaultAcessosPortal(fornecedor);
}

function buildDefaultAcessosPortal(fornecedor: FornecedorRow): FornecedorAcessoPortal[] {
  if (fornecedor.acessoPortal === "-") {
    return [];
  }

  const baseRow = {
    nomeCompleto: "Nome Sobrenome",
    email: "nome.sobrenome@email.com",
    telefone: "(00) 90000-0000",
    dataUltimoAcesso: "01/01/2026",
  };

  return [
    {
      id: `${fornecedor.id}-acesso-1`,
      ...baseRow,
      status: "Cadastro ativo",
    },
    {
      id: `${fornecedor.id}-acesso-2`,
      ...baseRow,
      status: "Convite pendente",
    },
    {
      id: `${fornecedor.id}-acesso-3`,
      ...baseRow,
      status: "Convite pendente",
    },
  ];
}

export function countAcessosAtivos(acessos: FornecedorAcessoPortal[]): number {
  return acessos.filter((acesso) => acesso.status === "Cadastro ativo").length;
}

export function countConvitesPendentes(acessos: FornecedorAcessoPortal[]): number {
  return acessos.filter((acesso) => acesso.status === "Convite pendente").length;
}

export function deriveAcessoPortal(acessos: FornecedorAcessoPortal[]): AcessoPortal {
  if (acessos.length === 0) {
    return "-";
  }
  if (acessos.some((acesso) => acesso.status === "Cadastro ativo")) {
    return "Cadastro ativo";
  }
  return "Convite enviado";
}

export function formatDataUltimoAcesso(data: string | null): string {
  if (!data) {
    return "—";
  }
  return data;
}

export function canAdicionarAcesso(acessos: FornecedorAcessoPortal[]): boolean {
  return acessos.length < MAX_ACESSOS_PORTAL;
}
