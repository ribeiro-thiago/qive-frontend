import type { DocumentoOrigemFrsItem, DocumentoOrigemPoItem } from "../types";

/** PO padrão — vínculo direto, sem wizard. */
export const MOCK_VINCULO_PO: DocumentoOrigemPoItem[] = [
  {
    id: "vinculo-po-1",
    docCompra: "4500012458",
    item: "0010",
    material: "MAT-000124",
    textoInfo: "Serviço de assistência médica mensal",
    qtdePedido: "1,00",
    precoLiquido: "R$ 7.070,46",
    saldo: "R$ 7.070,46",
    ump: "UN",
  },
  {
    id: "vinculo-po-2",
    docCompra: "4500012459",
    item: "0020",
    material: "MAT-000378",
    textoInfo: "Cobertura adicional de atendimento",
    qtdePedido: "1,00",
    precoLiquido: "R$ 3.250,00",
    saldo: "R$ 1.850,00",
    ump: "UN",
  },
  {
    id: "vinculo-po-3",
    docCompra: "4500012460",
    item: "0010",
    material: "SER-009912",
    textoInfo: "Prestação de serviço técnico especializado",
    qtdePedido: "2,00",
    precoLiquido: "R$ 1.450,00",
    saldo: "R$ 2.900,00",
    ump: "UN",
  },
];

/**
 * FRS cobrindo os três modos de rastreabilidade:
 * - incomplete → wizard etapa 2 com campos editáveis
 * - complete → vínculo direto ou etapa 2 somente leitura (quando misturada)
 * - sem mode → vínculo direto, sem campos de lote/fabricação/vencimento
 */
export const MOCK_VINCULO_FRS: DocumentoOrigemFrsItem[] = [
  {
    id: "vinculo-frs-1",
    numeroFrs: "10004562",
    item: "0010",
    codigo: "140201",
    descricao: "Prestação Serv. Informática",
    qtde: "1",
    precoLiquido: "R$ 180,00",
    saldo: "R$ 0,00",
    ump: "UN",
    rastreabilidadeMode: "incomplete",
  },
  {
    id: "vinculo-frs-2",
    numeroFrs: "10004563",
    item: "0020",
    codigo: "140202",
    descricao: "Serviço de suporte operacional",
    qtde: "1",
    precoLiquido: "R$ 890,00",
    saldo: "R$ 890,00",
    ump: "UN",
    rastreabilidadeMode: "complete",
    rastreabilidade: {
      loteProduto: "LOT99887",
      dataFabricacao: "10/05/2026",
      dataVencimento: "10/05/2028",
    },
  },
  {
    id: "vinculo-frs-3",
    numeroFrs: "10004564",
    item: "0010",
    codigo: "140203",
    descricao: "Serviço técnico especializado",
    qtde: "2",
    precoLiquido: "R$ 1.450,00",
    saldo: "R$ 2.900,00",
    ump: "UN",
    rastreabilidadeMode: "incomplete",
  },
  {
    id: "vinculo-frs-4",
    numeroFrs: "10004565",
    item: "0030",
    codigo: "140204",
    descricao: "Manutenção preventiva de equipamentos",
    qtde: "1",
    precoLiquido: "R$ 320,00",
    saldo: "R$ 320,00",
    ump: "UN",
  },
];
