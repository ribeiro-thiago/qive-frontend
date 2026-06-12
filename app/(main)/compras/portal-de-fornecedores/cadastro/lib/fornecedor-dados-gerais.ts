import type { FornecedorRow } from "../types";

export type AtividadeCnae = {
  codigo: string;
  descricao: string;
};

export type ProdutoNcm = {
  caracteristica: string;
  codigoNcm: string;
};

export type FornecedorDadosGerais = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  dataAbertura: string;
  matrizFilial: string;
  regimeTributario: string;
  situacaoCadastral: string;
  dataSituacaoCadastral: string;
  naturezaJuridica: string;
  capitalSocial: string;
  porteFrb: string;
  endereco: string;
  telefone: string;
  site: string;
  email: string;
  socio: {
    nome: string;
    pjPf: string;
    cargo: string;
    dataEntrada: string;
  };
  atividadePrincipal: AtividadeCnae;
  atividadesSecundarias: AtividadeCnae[];
  produtosNcm: ProdutoNcm[];
};

const ATIVIDADES_SECUNDARIAS_PADRAO: AtividadeCnae[] = [
  {
    codigo: "4520004",
    descricao: "Serviços de alinhamento e balanceamento de veículos automotores",
  },
  {
    codigo: "4520003",
    descricao: "Serviços de manutenção e reparação elétrica de veículos automotores",
  },
  {
    codigo: "4530701",
    descricao: "Comércio por atacado de peças e acessórios novos para veículos automotores",
  },
  {
    codigo: "4520007",
    descricao:
      "Serviços de instalação; manutenção e reparação de acessórios para veículos automotores",
  },
];

const PRODUTOS_NCM_PADRAO: ProdutoNcm[] = [
  {
    caracteristica:
      "Partes reconhecíveis como exclusiva ou principalmente destinadas aos motores das posições 84.07 ou 84.08.",
    codigoNcm: "8409",
  },
];

function formatSituacaoCadastral(status: FornecedorRow["situacaoCadastral"]): string {
  if (status === "Ativo") return "Ativa";
  return status;
}

function buildEndereco(localizacao: string): string {
  const parts = localizacao.split("|").map((part) => part.trim());
  if (parts.length >= 2 && parts[0] && parts[1]) {
    const [uf, cidade] = parts;
    return `Logradouro não informado - Centro, ${cidade} - ${uf}, 00000-000`;
  }

  return "AVENIDA BRAZ DE PINA, 00104 - PENHA, Rio de Janeiro - RJ, 21070032";
}

function displayValue(value: string | undefined | null): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "—") return "-";
  return trimmed;
}

export function buildFornecedorDadosGerais(fornecedor: FornecedorRow): FornecedorDadosGerais {
  const nomeFantasia =
    fornecedor.nomeFantasia &&
    fornecedor.nomeFantasia !== "NOME FANTASIA DO FORNECEDOR" &&
    fornecedor.nomeFantasia !== fornecedor.razaoSocial
      ? fornecedor.nomeFantasia
      : "-";

  return {
    razaoSocial: fornecedor.razaoSocial,
    nomeFantasia: displayValue(nomeFantasia),
    cnpj: fornecedor.cnpj,
    dataAbertura: "30/08/2023",
    matrizFilial: "Matriz",
    regimeTributario: fornecedor.regimeTributario,
    situacaoCadastral: formatSituacaoCadastral(fornecedor.situacaoCadastral),
    dataSituacaoCadastral: fornecedor.ultimaAtualizacaoReceita,
    naturezaJuridica: "1341 - União",
    capitalSocial: "R$ 40.000,00",
    porteFrb: "Microempresa (ME)",
    endereco: buildEndereco(fornecedor.localizacao),
    telefone: fornecedor.telefone,
    site: "-",
    email: "contato@fornecedor.com.br",
    socio: {
      nome: "CATHERINE GRACA ARTIAGA",
      pjPf: "PF",
      cargo: "Sócio-Administrador",
      dataEntrada: "30/08/2023",
    },
    atividadePrincipal: {
      codigo: fornecedor.cnaeCodigo,
      descricao: fornecedor.cnaeDescricao,
    },
    atividadesSecundarias: ATIVIDADES_SECUNDARIAS_PADRAO,
    produtosNcm: PRODUTOS_NCM_PADRAO,
  };
}

export function formatAtividadeCnae(atividade: AtividadeCnae): string {
  return `${atividade.codigo} | ${atividade.descricao}`;
}
