export type AccountCompany = {
  id: string;
  name: string;
  cpfCnpj: string;
  im: string;
  uf: string;
  status: string;
  createdAt: string;
  situacaoCadastro: string;
  razaoSocial: string;
  inscricaoEstadual: string;
  empresaFaturamentoPlano: boolean;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    uf: string;
    cidade: string;
  };
  dominioCodigo: string;
  painelBasicoEmail: string;
};

const DEFAULT_ENDERECO: AccountCompany["endereco"] = {
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  uf: "",
  cidade: "",
};

export const MOCK_COMPANIES: AccountCompany[] = [
  {
    id: "1",
    name: "01 CJR Construção Gomes Silva LTDA",
    cpfCnpj: "01.223.131/0001-85",
    im: "12312",
    uf: "SP",
    status: "Ativa",
    createdAt: "01/02/2024",
    situacaoCadastro: "Ativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: true,
    endereco: {
      cep: "13560-970",
      rua: "ROD WASHINGTON LUIS",
      numero: "123",
      complemento: "",
      bairro: "Rural",
      uf: "SP",
      cidade: "São Carlos",
    },
    dominioCodigo: "2222",
    painelBasicoEmail: "joaosilva@cjr.com.br",
  },
  {
    id: "2",
    name: "23 Construtora Horizonte Azul LTDA",
    cpfCnpj: "12.345.678/0001-90",
    im: "3455224",
    uf: "SC",
    status: "Inativa",
    createdAt: "01/02/2024",
    situacaoCadastro: "Inativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: false,
    endereco: { ...DEFAULT_ENDERECO, uf: "SC" },
    dominioCodigo: "",
    painelBasicoEmail: "",
  },
  {
    id: "3",
    name: "045 CJR Construção Gomes Silva LTDA",
    cpfCnpj: "98.765.432/0001-01",
    im: "12312",
    uf: "SP",
    status: "Ativa*",
    createdAt: "01/02/2024",
    situacaoCadastro: "Ativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: false,
    endereco: { ...DEFAULT_ENDERECO, uf: "SP" },
    dominioCodigo: "",
    painelBasicoEmail: "",
  },
  {
    id: "4",
    name: "Projetos e Construções Modernas LTDA",
    cpfCnpj: "11.222.333/0001-02",
    im: "223423",
    uf: "MG",
    status: "Inativa",
    createdAt: "01/02/2024",
    situacaoCadastro: "Inativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: false,
    endereco: { ...DEFAULT_ENDERECO, uf: "MG" },
    dominioCodigo: "",
    painelBasicoEmail: "",
  },
  {
    id: "5",
    name: "009 Construtora Solidez LTDA",
    cpfCnpj: "22.333.444/0001-03",
    im: "12312",
    uf: "MG",
    status: "Inativa",
    createdAt: "01/02/2024",
    situacaoCadastro: "Inativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: false,
    endereco: { ...DEFAULT_ENDERECO, uf: "MG" },
    dominioCodigo: "",
    painelBasicoEmail: "",
  },
  {
    id: "6",
    name: "Engenharia Criativa LTDA",
    cpfCnpj: "66.777.888/0001-07",
    im: "555343",
    uf: "SP",
    status: "Inativa",
    createdAt: "01/02/2024",
    situacaoCadastro: "Inativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: false,
    endereco: { ...DEFAULT_ENDERECO, uf: "SP" },
    dominioCodigo: "",
    painelBasicoEmail: "",
  },
  {
    id: "7",
    name: "Obras e Estruturas LTDA",
    cpfCnpj: "01.223.131/0001-85",
    im: "66563223",
    uf: "SP",
    status: "Inativa",
    createdAt: "01/02/2024",
    situacaoCadastro: "Inativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: false,
    endereco: { ...DEFAULT_ENDERECO, uf: "SP" },
    dominioCodigo: "",
    painelBasicoEmail: "",
  },
  {
    id: "8",
    name: "01 Construtora Nova Era LTDA",
    cpfCnpj: "77.888.999/0001-08",
    im: "776453233",
    uf: "SP",
    status: "Inativa",
    createdAt: "01/02/2024",
    situacaoCadastro: "Inativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: false,
    endereco: { ...DEFAULT_ENDERECO, uf: "SP" },
    dominioCodigo: "",
    painelBasicoEmail: "",
  },
  {
    id: "9",
    name: "23 Construtora Nova Era LTDA",
    cpfCnpj: "88.999.000/0001-09",
    im: "677743",
    uf: "SP",
    status: "Inativa",
    createdAt: "01/02/2024",
    situacaoCadastro: "Inativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: false,
    endereco: { ...DEFAULT_ENDERECO, uf: "SP" },
    dominioCodigo: "",
    painelBasicoEmail: "",
  },
  {
    id: "10",
    name: "Construções Sustentáveis LTDA",
    cpfCnpj: "01.223.131/0001-85",
    im: "0867666",
    uf: "SP",
    status: "Inativa",
    createdAt: "01/02/2024",
    situacaoCadastro: "Inativa",
    razaoSocial: "",
    inscricaoEstadual: "",
    empresaFaturamentoPlano: false,
    endereco: { ...DEFAULT_ENDERECO, uf: "SP" },
    dominioCodigo: "",
    painelBasicoEmail: "",
  },
];

export const COMPANIES_SUMMARY = {
  total: 233,
  active: 212,
  activationRate: "90% ativas",
  lastEdition: "01/02/2004",
};

export function getCompanyById(id: string): AccountCompany | undefined {
  return MOCK_COMPANIES.find((company) => company.id === id);
}
