import type { PortalDocumentoRow } from "../types";

export type PortalDanfeEtiqueta = {
  id: string;
  label: string;
  className: string;
};

export type PortalDanfeProduto = {
  codigo: string;
  descricao: string;
  descricaoLinhas?: string[];
  ncm: string;
  ocst: string;
  cfop: string;
  unid: string;
  qtd: string;
  vlUnit: string;
  vlTotal: string;
  bcIcms: string;
  vlIcms: string;
  vlIpi: string;
  alIcms: string;
  alIpi: string;
};

export type PortalDanfeViewData = {
  etiquetas: PortalDanfeEtiqueta[];
  emitente: {
    nome: string;
    endereco: string;
    municipioUf: string;
    fone: string;
  };
  numero: string;
  serie: string;
  tipoOperacao: "0" | "1";
  chaveAcesso: string;
  protocolo: string;
  naturezaOperacao: string;
  inscricaoEstadual: string;
  inscricaoEstadualSubst: string;
  cnpjEmitente: string;
  destinatario: {
    nome: string;
    cnpjCpf: string;
    dataEmissao: string;
    endereco: string;
    bairro: string;
    cep: string;
    dataEntradaSaida: string;
    municipio: string;
    uf: string;
    fone: string;
    inscricaoEstadual: string;
    horaSaida: string;
  };
  duplicatas: Array<{ num: string; venc: string; valor: string }>;
  imposto: {
    baseIcms: string;
    valorIcms: string;
    baseIcmsSt: string;
    valorIcmsSt: string;
    valorImpImportacao: string;
    valorPis: string;
    valorTotalProdutos: string;
    valorFrete: string;
    valorSeguro: string;
    desconto: string;
    outrasDespesas: string;
    valorIpi: string;
    valorCofins: string;
    valorTotalNota: string;
    baseIbsCbs: string;
    valorIbs: string;
    valorIbsUf: string;
    valorIbsMun: string;
    valorIs: string;
  };
  transporte: {
    nome: string;
    fretePorConta: string;
    codigoAntt: string;
    placa: string;
    uf: string;
    cnpjCpf: string;
    endereco: string;
    municipio: string;
    ufEndereco: string;
    inscricaoEstadual: string;
    quantidade: string;
    especie: string;
    marca: string;
    numero: string;
    pesoBruto: string;
    pesoLiquido: string;
  };
  produtos: PortalDanfeProduto[];
  informacoesComplementares: string;
};

const ETIQUETAS_PADRAO: PortalDanfeEtiqueta[] = [
  { id: "1", label: "TESTE 00", className: "bg-[#E4E4E7] text-[#3F3F46]" },
  { id: "2", label: "ANALISAR FELIX", className: "bg-[#FEF9C3] text-[#854D0E]" },
  { id: "3", label: "ACELERAR", className: "bg-[#EDE9FE] text-[#5B21B6]" },
  { id: "4", label: "ATUALIZAR API", className: "bg-[#FCE7F3] text-[#9D174D]" },
];

export const PORTAL_DANFE_DEMO: PortalDanfeViewData = {
  etiquetas: ETIQUETAS_PADRAO,
  emitente: {
    nome: "CONSTRUTORA SAID LTDA",
    endereco: "RUA JOSE BONIFACIO, 1000 - CENTRO",
    municipioUf: "RIBEIRAO PRETO - SP",
    fone: "FONE/FAX: (16) 3622-0000",
  },
  numero: "44470",
  serie: "1",
  tipoOperacao: "1",
  chaveAcesso: "35260635556404000190550010000444701027735562",
  protocolo: "135260307454916 30/03/2026 06:39:31",
  naturezaOperacao: "INDUSTRIALIZACAO EFETUADA P OUTRA EMPRESA - CBUQ",
  inscricaoEstadual: "132.159.494.111",
  inscricaoEstadualSubst: "",
  cnpjEmitente: "35.556.404/0001-90",
  destinatario: {
    nome: "QUALITY SAO CARLOS COMERCIO DE PRODUTOS ALIMENTICIOS LTDA",
    cnpjCpf: "45.997.418/0001-49",
    dataEmissao: "30/03/2026",
    endereco: "RUA JOSE BONIFACIO, 1000",
    bairro: "CENTRO",
    cep: "13560-660",
    dataEntradaSaida: "30/03/2026",
    municipio: "SAO CARLOS",
    uf: "SP",
    fone: "(16) 3371-0000",
    inscricaoEstadual: "123.456.789.012",
    horaSaida: "06:39:31",
  },
  duplicatas: [{ num: "001", venc: "27/04/2026", valor: "2.941,70" }],
  imposto: {
    baseIcms: "0,00",
    valorIcms: "0,00",
    baseIcmsSt: "0,00",
    valorIcmsSt: "0,00",
    valorImpImportacao: "0,00",
    valorPis: "16,38",
    valorTotalProdutos: "8.089,57",
    valorFrete: "0,00",
    valorSeguro: "0,00",
    desconto: "0,00",
    outrasDespesas: "0,00",
    valorIpi: "0,00",
    valorCofins: "75,59",
    valorTotalNota: "8.089,57",
    baseIbsCbs: "2.519,88",
    valorIbs: "0,00",
    valorIbsUf: "0,00",
    valorIbsMun: "0,00",
    valorIs: "0,00",
  },
  transporte: {
    nome: "CJR CONSTRUTORA LTDA",
    fretePorConta: "1",
    codigoAntt: "",
    placa: "",
    uf: "",
    cnpjCpf: "35.556.404/0001-90",
    endereco: "",
    municipio: "",
    ufEndereco: "",
    inscricaoEstadual: "",
    quantidade: "0",
    especie: "",
    marca: "",
    numero: "",
    pesoBruto: "36,02",
    pesoLiquido: "25,58",
  },
  produtos: [
    {
      codigo: "001",
      descricao: "PRODUTO EXEMPLO - INDUSTRIALIZACAO",
      descricaoLinhas: [
        "BC IBS/CBS: 2.519,88",
        "CBS: 0,00 (0,00%)",
        "IBS UF: 0,00 (0,00%)",
      ],
      ncm: "39269090",
      ocst: "000",
      cfop: "5124",
      unid: "KG",
      qtd: "25,58",
      vlUnit: "316,25",
      vlTotal: "8.089,57",
      bcIcms: "0,00",
      vlIcms: "0,00",
      vlIpi: "0,00",
      alIcms: "0,00",
      alIpi: "0,00",
    },
  ],
  informacoesComplementares:
    "OC N 01 - EMISSAO 06 03 2026 PIS 16,38 COFINS 75,59",
};

export function formatDanfeAccessKey(key: string): string {
  return key.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

/** Linhas de impostos da reforma exibidas na descrição do produto no DANFe. */
export function isNovosImpostosProdutoLinha(linha: string): boolean {
  const texto = linha.trim().toUpperCase();
  return (
    texto.startsWith("BC IBS/CBS") ||
    texto.startsWith("CBS") ||
    texto.startsWith("IBS UF")
  );
}

export function filterNovosImpostosProdutoLinhas(
  linhas: string[] | undefined,
  showNovosImpostos: boolean,
): string[] {
  if (!linhas?.length) return [];
  if (showNovosImpostos) return linhas;
  return linhas.filter((linha) => !isNovosImpostosProdutoLinha(linha));
}

export function resolveNovosImpostosCampoValor(
  valor: string,
  showNovosImpostos: boolean,
): string {
  return showNovosImpostos ? valor : "";
}

export function buildPortalDanfeData(documento: PortalDocumentoRow): PortalDanfeViewData {
  return {
    ...PORTAL_DANFE_DEMO,
    numero: documento.nfNumero || PORTAL_DANFE_DEMO.numero,
    emitente: {
      ...PORTAL_DANFE_DEMO.emitente,
      nome: documento.nomeEmissor || PORTAL_DANFE_DEMO.emitente.nome,
    },
    cnpjEmitente: documento.cnpjEmissor || PORTAL_DANFE_DEMO.cnpjEmitente,
    destinatario: {
      ...PORTAL_DANFE_DEMO.destinatario,
      cnpjCpf: documento.cnpjDestinatario || PORTAL_DANFE_DEMO.destinatario.cnpjCpf,
      dataEmissao: documento.dataEmissao || PORTAL_DANFE_DEMO.destinatario.dataEmissao,
    },
    imposto: {
      ...PORTAL_DANFE_DEMO.imposto,
      valorTotalNota: documento.valor || PORTAL_DANFE_DEMO.imposto.valorTotalNota,
      valorTotalProdutos: documento.valor || PORTAL_DANFE_DEMO.imposto.valorTotalProdutos,
    },
  };
}
