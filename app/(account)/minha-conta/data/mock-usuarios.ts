export type AccountUser = {
  id: string;
  nome: string;
  email: string;
  grupoUsuarios: string;
  area: string;
  cargo: string;
  telefone: string;
  ativo: boolean;
};

export const TOTAL_USUARIOS = 125;

export const mockUsuarios: AccountUser[] = [
  {
    id: "1",
    nome: "Christian de Cico II",
    email: "christian@interpavcjr.com.br",
    grupoUsuarios: "Grupo Padrão",
    area: "-",
    cargo: "ADMINISTRATIVO_OPERACIONAL",
    telefone: "16991054467",
    ativo: true,
  },
  {
    id: "2",
    nome: "André",
    email: "atendimento@interpavcjr.com.br",
    grupoUsuarios: "Grupo Padrão",
    area: "-",
    cargo: "FINANCEIRO",
    telefone: "16992626946",
    ativo: true,
  },
  {
    id: "3",
    nome: "Conta Teste 123",
    email: "teste@arquivei.com.br",
    grupoUsuarios: "Grupo Padrão",
    area: "DIRETOR_HEAD_OPERACIONAL",
    cargo: "BI_DADOS",
    telefone: "16999997777",
    ativo: true,
  },
  {
    id: "4",
    nome: "Núbia",
    email: "financeiro@interpavcjr.com.br",
    grupoUsuarios: "Grupo dos Back Edita...",
    area: "Financeiro",
    cargo: "-",
    telefone: "-",
    ativo: true,
  },
  {
    id: "5",
    nome: "Mateus Constanzo",
    email: "mateusconstanzo@gmail.com",
    grupoUsuarios: "Grupo Principal edit",
    area: "COORDENADOR_OPERACIONAL",
    cargo: "TI",
    telefone: "16991260654",
    ativo: true,
  },
  {
    id: "6",
    nome: "Produto",
    email: "produto@arquivei.com.br",
    grupoUsuarios: "Teste GC",
    area: "OUTRO",
    cargo: "TI",
    telefone: "16999997777",
    ativo: true,
  },
  {
    id: "7",
    nome: "Arquivei",
    email: "arquivei@arquivei.com.br",
    grupoUsuarios: "Grupo Max",
    area: "-",
    cargo: "TI",
    telefone: "1633509555",
    ativo: true,
  },
  {
    id: "8",
    nome: "Erebor Test",
    email: "erebor.teste@arquivei.com.br",
    grupoUsuarios: "RE/PRD",
    area: "-",
    cargo: "TI",
    telefone: "1999999999",
    ativo: true,
  },
  {
    id: "9",
    nome: "Marcus",
    email: "marcus.soares+tse@arquivei.com.br",
    grupoUsuarios: "Grupo Padrão",
    area: "-",
    cargo: "TI",
    telefone: "9199999999",
    ativo: true,
  },
  {
    id: "10",
    nome: "Lighthouse",
    email: "teste+lighthouse@arquivei.com.br",
    grupoUsuarios: "Logistica",
    area: "-",
    cargo: "BI_DADOS",
    telefone: "9999999999",
    ativo: true,
  },
];
