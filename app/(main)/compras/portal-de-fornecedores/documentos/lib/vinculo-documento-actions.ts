import { MOCK_VINCULO_FRS, MOCK_VINCULO_PO } from "../data/mock-documentos-origem";
import type {
  DocumentoOrigemFrsItem,
  DocumentoOrigemPoItem,
  DocumentoOrigemVinculo,
  VinculoOrigemTableRow,
} from "../types";

const VINCULO_DELAY_MS = 700;

export type OrigemSearchCriterion =
  | "po"
  | "frs"
  | "descricao-item"
  | "numero-documento"
  | "material"
  | "codigo";

function normalizeSearchTerm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildRowHaystack(row: VinculoOrigemTableRow): string {
  if (row.tipo === "PO") {
    const item = row.data;
    return [
      item.docCompra,
      item.item,
      item.material,
      item.textoInfo,
      item.qtdePedido,
      item.precoLiquido,
      item.saldo,
      item.ump,
    ].join(" ");
  }

  const item = row.data;
  return [
    item.numeroFrs,
    item.item,
    item.codigo,
    item.descricao,
    item.qtde,
    item.precoLiquido,
    item.saldo,
    item.ump,
  ].join(" ");
}

function getRowSearchValue(row: VinculoOrigemTableRow, criterion: OrigemSearchCriterion): string {
  if (criterion === "descricao-item") {
    return row.tipo === "PO" ? row.data.textoInfo : row.data.descricao;
  }
  if (criterion === "numero-documento") {
    return row.tipo === "PO" ? row.data.docCompra : row.data.numeroFrs;
  }
  if (criterion === "material") {
    return row.tipo === "PO" ? row.data.material : "";
  }
  return row.tipo === "FRS" ? row.data.codigo : "";
}

export type PoSearchCriterion = "desc-item" | "doc-compra" | "material";
export type FrsSearchCriterion = "numero-frs" | "codigo" | "descricao";

function getPoSearchValue(item: DocumentoOrigemPoItem, criterion: PoSearchCriterion): string {
  if (criterion === "desc-item") return item.textoInfo;
  if (criterion === "doc-compra") return item.docCompra;
  return item.material;
}

function getFrsSearchValue(item: DocumentoOrigemFrsItem, criterion: FrsSearchCriterion): string {
  if (criterion === "numero-frs") return item.numeroFrs;
  if (criterion === "codigo") return item.codigo;
  return item.descricao;
}

export async function fetchVinculoPoItems(
  query: string,
  criterion: PoSearchCriterion,
  source: DocumentoOrigemPoItem[] = MOCK_VINCULO_PO,
): Promise<DocumentoOrigemPoItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const term = normalizeSearchTerm(query);
  if (!term) return [...source];

  return source.filter((item) =>
    normalizeSearchTerm(getPoSearchValue(item, criterion)).includes(term),
  );
}

export async function fetchVinculoFrsItems(
  query: string,
  criterion: FrsSearchCriterion,
  source: DocumentoOrigemFrsItem[] = MOCK_VINCULO_FRS,
): Promise<DocumentoOrigemFrsItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const term = normalizeSearchTerm(query);
  if (!term) return [...source];

  return source.filter((item) =>
    normalizeSearchTerm(getFrsSearchValue(item, criterion)).includes(term),
  );
}

/** Busca unificada PO + FRS (mock). Substituir por API quando disponível. */
export async function fetchVinculoOrigemRows(
  query: string,
  criterion: OrigemSearchCriterion | null = null,
  poSource: DocumentoOrigemPoItem[] = MOCK_VINCULO_PO,
  frsSource: DocumentoOrigemFrsItem[] = MOCK_VINCULO_FRS,
): Promise<VinculoOrigemTableRow[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const rows: VinculoOrigemTableRow[] = [
    ...poSource.map((data) => ({ tipo: "PO" as const, data })),
    ...frsSource.map((data) => ({ tipo: "FRS" as const, data })),
  ];

  const filteredByTipo =
    criterion === "po"
      ? rows.filter((row) => row.tipo === "PO")
      : criterion === "frs"
        ? rows.filter((row) => row.tipo === "FRS")
        : rows;

  const term = normalizeSearchTerm(query);
  if (!term) return filteredByTipo;

  if (!criterion || criterion === "po" || criterion === "frs") {
    return filteredByTipo.filter((row) =>
      normalizeSearchTerm(buildRowHaystack(row)).includes(term),
    );
  }

  return filteredByTipo.filter((row) =>
    normalizeSearchTerm(getRowSearchValue(row, criterion)).includes(term),
  );
}

export async function submitVinculoDocumentoOrigem(
  vinculos: DocumentoOrigemVinculo | DocumentoOrigemVinculo[],
): Promise<DocumentoOrigemVinculo[]> {
  await new Promise((resolve) => setTimeout(resolve, VINCULO_DELAY_MS));
  return Array.isArray(vinculos) ? vinculos : [vinculos];
}
