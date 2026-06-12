import type { NotaCompletaField } from "./NotaCompletaUi";
import type { PortalDocumentoRow } from "../types";

export type PortalNotaCompletaProduto = {
  id: number;
  titulo: string;
};

export type PortalNotaCompletaData = {
  nfe: {
    principais: NotaCompletaField[];
    emitenteResumo: NotaCompletaField[];
    destinatarioResumo: NotaCompletaField[];
    operacao: NotaCompletaField[];
    autorizacao: NotaCompletaField[];
  };
  emitente: {
    dados: NotaCompletaField[];
    endereco: NotaCompletaField[];
    complementares: NotaCompletaField[];
  };
  destinatario: {
    dados: NotaCompletaField[];
    endereco: NotaCompletaField[];
    complementares: NotaCompletaField[];
  };
  produtos: PortalNotaCompletaProduto[];
  totais: {
    icms: NotaCompletaField[];
    ibsCbs: NotaCompletaField[];
    fcp: NotaCompletaField[];
    transporte: NotaCompletaField[];
    ipi: NotaCompletaField[];
    iss: NotaCompletaField[];
    volume: NotaCompletaField[];
  };
  cobranca: {
    fatura: NotaCompletaField[];
    duplicata: NotaCompletaField[];
  };
  infoAdicionais: {
    geral: NotaCompletaField[];
    interesseContribuinte: string;
    chaveReferenciada: string;
  };
  exportacao: NotaCompletaField[];
  compras: NotaCompletaField[];
  pagamentos: NotaCompletaField[];
};

export const PORTAL_NOTA_COMPLETA_DEMO: PortalNotaCompletaData = {
  nfe: {
    principais: [
      { label: "Modelo", value: "55 - NF-e" },
      { label: "Série", value: "1" },
      { label: "Número", value: "44420" },
      { label: "Data de emissão", value: "30/01/2026" },
      { label: "Data Saída/Entrada", value: "30/01/2026" },
      { label: "Valor Total", value: "R$ 2.911,70" },
    ],
    emitenteResumo: [
      { label: "Nome / Razão Social", value: "CONSTRUTORA SAID LTDA" },
      { label: "CNPJ", value: "35.556.404/0001-90", mono: true },
      { label: "Inscrição Estadual", value: "132.159.494.111", mono: true },
      { label: "UF", value: "SP" },
      { label: "Tipo de emissão", value: "1 - Emissão normal (não em contingência)" },
    ],
    destinatarioResumo: [
      {
        label: "Nome / Razão Social",
        value: "QUALITY SAO CARLOS EMPREENDIMENTOS IMOBILIARIOS SPE LTDA",
      },
      { label: "CNPJ", value: "45.997.418/0001-49", mono: true },
      { label: "Inscrição Estadual", value: "123.456.789.012", mono: true },
      { label: "UF", value: "SP" },
    ],
    operacao: [
      { label: "Natureza da operação", value: "INDUSTRIALIZACAO EFETUADA P OUTRA EMPRESA - CBUQ" },
      { label: "Tipo da operação", value: "1 - Saída" },
    ],
    autorizacao: [
      { label: "Digest Value da NF-e", value: "—", mono: true },
      { label: "Protocolo", value: "135260307454916", mono: true },
      { label: "Data/Hora", value: "30/03/2026 06:39:31" },
    ],
  },
  emitente: {
    dados: [
      { label: "Nome / Razão Social", value: "CONSTRUTORA SAID LTDA" },
      { label: "Nome Fantasia", value: "CONSTRUTORA SAID" },
      { label: "CNPJ", value: "35.556.404/0001-90", mono: true },
    ],
    endereco: [
      { label: "Endereço", value: "RUA JOSE BONIFACIO, 1000" },
      { label: "Bairro / Distrito", value: "CENTRO" },
      { label: "CEP", value: "14010-000" },
      { label: "Município", value: "RIBEIRAO PRETO" },
      { label: "Fone / Fax", value: "(16) 3622-0000" },
      { label: "UF", value: "SP" },
      { label: "País", value: "1058 - Brasil" },
    ],
    complementares: [
      { label: "Inscrição Estadual", value: "132.159.494.111", mono: true },
      { label: "IE Substituto", value: "—" },
      { label: "Inscrição Municipal", value: "903877" },
      { label: "Município ICMS", value: "3543402" },
      { label: "CNAE Fiscal", value: "4211101" },
      { label: "Cod. Regime Tributário", value: "3" },
    ],
  },
  destinatario: {
    dados: [
      {
        label: "Nome / Razão Social",
        value: "QUALITY SAO CARLOS EMPREENDIMENTOS IMOBILIARIOS SPE LTDA",
      },
      { label: "CNPJ", value: "45.997.418/0001-49", mono: true },
    ],
    endereco: [
      { label: "Endereço", value: "RUA JOSE BONIFACIO, 1000" },
      { label: "Bairro / Distrito", value: "CENTRO" },
      { label: "CEP", value: "13560-660" },
      { label: "Município", value: "SAO CARLOS" },
      { label: "Fone / Fax", value: "(16) 3371-0000" },
      { label: "UF", value: "SP" },
      { label: "País", value: "Brasil" },
    ],
    complementares: [
      { label: "Inscrição Estadual", value: "123.456.789.012", mono: true },
      { label: "Inscrição SUFRAMA", value: "—" },
    ],
  },
  produtos: [
    {
      id: 1,
      titulo: "1 - C.B.U.Q FAIXA C 12 - MAO DE OBRA APLICADA P/ SAI...",
    },
    {
      id: 2,
      titulo: "2 - CAP - CIMENTO ASFALTICO (TERCEIRO) - INDUSTRIALIZ...",
    },
    {
      id: 3,
      titulo: "3 - PEDRA BRITADA - US - 02",
    },
  ],
  totais: {
    icms: [
      { label: "BC ICMS", value: "0,00" },
      { label: "Vlr. ICMS", value: "0,00" },
      { label: "Vlr. ICMS Deson.", value: "0,00" },
      { label: "BC ICMS ST", value: "0,00" },
      { label: "Vlr. ICMS ST", value: "0,00" },
      { label: "Vlr. Tot. Produtos", value: "2.911,70" },
    ],
    ibsCbs: [
      { label: "BC IBS/CBS", value: "2.519,88" },
      { label: "Vlr. IBS Mun", value: "0,00" },
      { label: "Vlr. IBS UF", value: "2,52" },
      { label: "Vlr. CBS", value: "22,68" },
    ],
    fcp: [
      { label: "Vlr. FCP Tot", value: "0,00" },
      { label: "Vlr. FCP ST", value: "0,00" },
      { label: "Vlr. FCP Ret. ST", value: "0,00" },
    ],
    transporte: [
      { label: "Vlr. Frete", value: "0,00" },
      { label: "Vlr. Seguro", value: "0,00" },
      { label: "Outras Despesas", value: "0,00" },
    ],
    ipi: [
      { label: "Vlr. IPI", value: "0,00" },
      { label: "Vlr. IPI Devolvido", value: "0,00" },
    ],
    iss: [
      { label: "Placa", value: "—" },
      { label: "UF", value: "—" },
      { label: "RNTC", value: "—" },
    ],
    volume: [
      { label: "Quantidade", value: "0" },
      { label: "Espécie", value: "—" },
      { label: "Peso Líquido", value: "25,000" },
      { label: "Peso Bruto", value: "25,000" },
    ],
  },
  cobranca: {
    fatura: [
      { label: "Número", value: "001" },
      { label: "Valor Original", value: "2.911,70" },
      { label: "Desconto", value: "0,00" },
      { label: "Valor Líquido", value: "2.911,70" },
    ],
    duplicata: [
      { label: "Número", value: "001" },
      { label: "Vencimento", value: "27/04/2026" },
      { label: "Valor", value: "2.911,70" },
    ],
  },
  infoAdicionais: {
    geral: [
      { label: "Form. Imp. do DANFE", value: "1 - Retrato" },
      { label: "Interesse do Fisco", value: "—" },
    ],
    interesseContribuinte: "OC N 01 - EMISSAO 06 03 2026 PIS 16,38 COFINS 75,59",
    chaveReferenciada: "—",
  },
  exportacao: [
    { label: "UF Embarque", value: "—" },
    { label: "Local Embarque", value: "—" },
    { label: "UF Despacho", value: "—" },
    { label: "Local Despacho", value: "—" },
  ],
  compras: [
    { label: "Nota de Empenho", value: "—" },
    { label: "Pedido", value: "—" },
    { label: "Contrato", value: "—" },
  ],
  pagamentos: [
    { label: "Indicador", value: "0 - Pagamento à Vista" },
    { label: "Meio", value: "Sem Pagamento" },
    { label: "Valor", value: "0,00" },
  ],
};

export function buildPortalNotaCompletaData(documento: PortalDocumentoRow): PortalNotaCompletaData {
  return {
    ...PORTAL_NOTA_COMPLETA_DEMO,
    nfe: {
      ...PORTAL_NOTA_COMPLETA_DEMO.nfe,
      principais: PORTAL_NOTA_COMPLETA_DEMO.nfe.principais.map((field) =>
        field.label === "Número"
          ? { ...field, value: documento.nfNumero }
          : field.label === "Data de emissão"
            ? { ...field, value: documento.dataEmissao }
            : field.label === "Valor Total"
              ? { ...field, value: `R$ ${documento.valor}` }
              : field,
      ),
      emitenteResumo: PORTAL_NOTA_COMPLETA_DEMO.nfe.emitenteResumo.map((field) =>
        field.label === "Nome / Razão Social"
          ? { ...field, value: documento.nomeEmissor }
          : field.label === "CNPJ"
            ? { ...field, value: documento.cnpjEmissor, mono: true }
            : field,
      ),
      destinatarioResumo: PORTAL_NOTA_COMPLETA_DEMO.nfe.destinatarioResumo.map((field) =>
        field.label === "CNPJ" ? { ...field, value: documento.cnpjDestinatario, mono: true } : field,
      ),
    },
    emitente: {
      ...PORTAL_NOTA_COMPLETA_DEMO.emitente,
      dados: PORTAL_NOTA_COMPLETA_DEMO.emitente.dados.map((field) =>
        field.label === "Nome / Razão Social" ? { ...field, value: documento.nomeEmissor } : field,
      ),
    },
    totais: {
      ...PORTAL_NOTA_COMPLETA_DEMO.totais,
      icms: PORTAL_NOTA_COMPLETA_DEMO.totais.icms.map((field) =>
        field.label === "Vlr. Tot. Produtos" ? { ...field, value: documento.valor } : field,
      ),
    },
  };
}
