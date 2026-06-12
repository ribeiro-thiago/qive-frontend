export type UserGroup = {
  id: string;
  nome: string;
  cnpjCount: number;
  listagensLabel: string;
  usuarios: string[];
  extraUsersCount?: number;
};

export const mockGruposUsuarios: UserGroup[] = [
  {
    id: "1",
    nome: "filial sp",
    cnpjCount: 14,
    listagensLabel: "sem listagens de DFes",
    usuarios: ["AY", "TT", "LT"],
    extraUsersCount: 1,
  },
  {
    id: "2",
    nome: "teste cnpjs",
    cnpjCount: 13,
    listagensLabel: "sem listagens de DFes",
    usuarios: ["FF", "AA", "GV", "WT"],
    extraUsersCount: 1,
  },
  {
    id: "3",
    nome: "Teste logísti...",
    cnpjCount: 1,
    listagensLabel: "Sem listagens de DFes",
    usuarios: ["SS", "AF", "TT", "AI"],
    extraUsersCount: 1,
  },
  {
    id: "4",
    nome: "Grupo dos A...",
    cnpjCount: 9,
    listagensLabel: "Sem listagens de DFes",
    usuarios: ["ET"],
  },
  {
    id: "5",
    nome: "Grupo de Te...",
    cnpjCount: 14,
    listagensLabel: "Sem listagens de DFes",
    usuarios: ["TU"],
  },
  {
    id: "6",
    nome: "Novo grupo",
    cnpjCount: 9,
    listagensLabel: "Sem listagens de DFes",
    usuarios: ["MM"],
  },
  {
    id: "7",
    nome: "Filial SP",
    cnpjCount: 10,
    listagensLabel: "Sem listagens de DFes",
    usuarios: [],
  },
  {
    id: "8",
    nome: "Novo grupo",
    cnpjCount: 14,
    listagensLabel: "Sem listagens de DFes",
    usuarios: ["WT", "TT"],
  },
  {
    id: "9",
    nome: "Elaine",
    cnpjCount: 14,
    listagensLabel: "Sem listagens de DFes",
    usuarios: [],
  },
];
