export type FaturaStatus = "Vencido" | "Pendente" | "Pago";

export type Fatura = {
  id: string;
  numero: string;
  dataEmissao: string;
  vencimento: string;
  vencimentoBoletoInicio: string;
  vencimentoBoletoFim: string;
  valor: number;
  status: FaturaStatus;
  descricao: string;
  formaPagamento: string;
  codigoBoleto: string;
};

const MOCK_FATURAS_BASE: Omit<Fatura, "id" | "numero" | "dataEmissao">[] = [
  {
    vencimento: "08/03/2025",
    vencimentoBoletoInicio: "08/03/2025",
    vencimentoBoletoFim: "11/03/2025",
    valor: 157.1,
    status: "Vencido",
    descricao: "Plano Rotinas Anual 2025 e pacotes",
    formaPagamento: "Boleto bancário",
    codigoBoleto: "00190.00009 01234.567890 12345.678901 2 9564000015710",
  },
  {
    vencimento: "08/04/2025",
    vencimentoBoletoInicio: "17/03/2025",
    vencimentoBoletoFim: "20/03/2025",
    valor: 89.9,
    status: "Pendente",
    descricao: "Certificado digital Certisign",
    formaPagamento: "Cartão de crédito",
    codigoBoleto: "00190.00009 01234.567890 12345.678901 2 9564000008990",
  },
  {
    vencimento: "15/07/2024",
    vencimentoBoletoInicio: "15/07/2024",
    vencimentoBoletoFim: "18/07/2024",
    valor: 123.45,
    status: "Pendente",
    descricao: "Certificado Digital Certisign",
    formaPagamento: "Boleto bancário",
    codigoBoleto: "00190.00009 01234.567890 12345.678901 2 9564000012345",
  },
  {
    vencimento: "11/06/2024",
    vencimentoBoletoInicio: "11/06/2024",
    vencimentoBoletoFim: "14/06/2024",
    valor: 60.3,
    status: "Pago",
    descricao: "Certificado Digital Certisign",
    formaPagamento: "Boleto bancário",
    codigoBoleto: "00190.00009 01234.567890 12345.678901 2 9564000006030",
  },
  {
    vencimento: "22/09/2025",
    vencimentoBoletoInicio: "22/09/2025",
    vencimentoBoletoFim: "25/09/2025",
    valor: 82.15,
    status: "Pago",
    descricao: "Certificado Digital Certisign",
    formaPagamento: "Cartão de crédito",
    codigoBoleto: "00190.00009 01234.567890 12345.678901 2 9564000008215",
  },
];

const DEFAULT_FATURA: Omit<Fatura, "id" | "numero"> = {
  dataEmissao: "14/03/2025",
  vencimento: "17/03/2025",
  vencimentoBoletoInicio: "17/03/2025",
  vencimentoBoletoFim: "20/03/2025",
  valor: 89.9,
  status: "Pendente",
  descricao: "Certificado digital Certisign",
  formaPagamento: "Boleto bancário",
  codigoBoleto: "00190.00009 01234.567890 12345.678901 2 9564000008990",
};

function buildFatura(id: string, base: Omit<Fatura, "id" | "numero">): Fatura {
  const index = parseInt(id, 10);
  const numero = Number.isNaN(index) ? "365260629" : String(365260000 + index);

  return {
    id,
    numero,
    ...base,
  };
}

export const MOCK_FATURAS: Fatura[] = Array.from({ length: 130 }, (_, index) => {
  const id = String(index + 1);
  const base = MOCK_FATURAS_BASE[index % MOCK_FATURAS_BASE.length];
  return buildFatura(id, {
    ...base,
    dataEmissao: base.vencimento,
  });
});

export const EMPRESA_PAGAMENTO = {
  nome: "ARQUIVEI SERVICOS ON LINE LTDA",
  cnpj: "19.427.033/0001-40",
  enderecoLinhas: [
    "Avenida Doutor Carlos Botelho, 1863",
    "Centro",
    "São Carlos/SP - 13560250 - BR",
  ],
  telefone: "(16) 3509-5555",
  email: "financeiro@arquivei.com.br",
};

export function getFaturaById(id: string): Fatura | undefined {
  return MOCK_FATURAS.find((fatura) => fatura.id === id);
}

export function getFaturaFallback(id: string): Fatura {
  return buildFatura(id, DEFAULT_FATURA);
}

export function formatFaturaCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
