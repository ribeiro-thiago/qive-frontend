import type { AssociatedDoc, Row } from "../types";

export type DivergenciaTipo = "emissor-diferente" | "forma-pagamento-divergente";

export const DIVERGENCIA_DISPLAY_LABELS: Record<DivergenciaTipo, string> = {
  "emissor-diferente": "Emissores diferentes",
  "forma-pagamento-divergente": "Divergência de pagamento",
};

export const DIVERGENCIAS_FILTER_PLACEHOLDER = "Selecione";

export const DIVERGENCIAS_FILTER_OPTIONS = [
  "Todas as pendências",
  "Emissor",
  "Pagamento",
  "Documento",
  "Sem pendências",
] as const;

export type DivergenciasFilterOption =
  | typeof DIVERGENCIAS_FILTER_PLACEHOLDER
  | (typeof DIVERGENCIAS_FILTER_OPTIONS)[number];

export type Divergencia = {
  tipo: DivergenciaTipo;
  titulo: string;
  descricao: string;
  docIdxsEnvolvidos: number[];
};

export type DivergenciaComparativo =
  | {
      tipo: "emissor-diferente";
      emissorNfe: string;
      emissorBoleto: string;
      cnpjNfe?: string;
    }
  | {
      tipo: "forma-pagamento-divergente";
      formaNfe: string;
      formaBoleto: string;
    };

const STORAGE_PREFIX = "financeiro.divergencia.confiavel:";
const DISPENSADA_PREFIX = "financeiro.divergencia.dispensada:";
const CIENCIA_PREFIX = "financeiro.divergencia.ciencia:";

export type DivergenciaSinalizacao = {
  userName: string;
  date: string;
};

function readSinalizacao(raw: string | null): DivergenciaSinalizacao | null {
  if (!raw || raw === "1") return null;
  try {
    const parsed = JSON.parse(raw) as DivergenciaSinalizacao;
    if (parsed?.userName && parsed?.date) return parsed;
  } catch {
    // noop
  }
  return null;
}

function writeSinalizacao(key: string, meta: DivergenciaSinalizacao): void {
  window.localStorage.setItem(key, JSON.stringify(meta));
}

function safeLower(s?: string) {
  return (s ?? "").trim().toLowerCase();
}

function normalizeComparable(s?: string) {
  // Comparação “tolerante” para nomes: lower, sem acentos, sem espaços/pontuação.
  const v = safeLower(s);
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function findFirstDocIndex(row: Row, tipo: AssociatedDoc["tipo"]): number | null {
  const docs = row.documentosAssociados ?? [];
  const idx = docs.findIndex((d) => d.tipo === tipo);
  return idx >= 0 ? idx : null;
}

function getNFEmitenteNome(doc: AssociatedDoc): string | undefined {
  return doc.danfe?.emitente?.nome;
}

function getNFFormaPagamento(doc: AssociatedDoc): string | undefined {
  return doc.formaPagamento;
}

function getBoletoCedente(doc: AssociatedDoc): string | undefined {
  return doc.cedente;
}

function buildEmissorDiferenteDivergencia(nfIdx: number, bolIdx: number): Divergencia {
  return {
    tipo: "emissor-diferente",
    titulo: "Alerta de divergência",
    descricao:
      "A empresa que emitiu o boleto e o emissor da nota fiscal são diferentes, o que pode indicar uma possível tentativa de fraude. Caso classifique esta operação como confiável, não exibiremos este alerta novamente para essa transação.",
    docIdxsEnvolvidos: [nfIdx, bolIdx],
  };
}

function buildFormaPagamentoDivergenteDivergencia(nfIdx: number, bolIdx: number): Divergencia {
  return {
    tipo: "forma-pagamento-divergente",
    titulo: "Alerta de divergência",
    descricao:
      "A nota fiscal possui uma forma de pagamento diferente de boleto, mas identificamos um boleto associado a esta transação. Isso pode indicar inconsistência ou tentativa de fraude. Caso classifique esta operação como confiável, não exibiremos este alerta novamente para essa transação.",
    docIdxsEnvolvidos: [nfIdx, bolIdx],
  };
}

function detectEmissorDiferente(row: Row): Divergencia | null {
  const docs = row.documentosAssociados ?? [];
  const nfeDocs = docs
    .map((d, idx) => ({ d, idx }))
    .filter(({ d }) => d.tipo === "NF-e");
  const boletoDocs = docs
    .map((d, idx) => ({ d, idx }))
    .filter(({ d }) => d.tipo === "Boleto");

  if (nfeDocs.length === 0 || boletoDocs.length === 0) return null;

  for (const nf of nfeDocs) {
    const emitenteNome = getNFEmitenteNome(nf.d);
    if (!emitenteNome) continue;
    const emitenteNorm = normalizeComparable(emitenteNome);

    for (const bol of boletoDocs) {
      const cedente = getBoletoCedente(bol.d);
      if (!cedente) continue;
      const cedenteNorm = normalizeComparable(cedente);

      if (emitenteNorm && cedenteNorm && emitenteNorm !== cedenteNorm) {
        return buildEmissorDiferenteDivergencia(nf.idx, bol.idx);
      }
    }
  }

  return null;
}

function detectFormaPagamentoDivergente(row: Row): Divergencia | null {
  const docs = row.documentosAssociados ?? [];
  const nfeDocs = docs
    .map((d, idx) => ({ d, idx }))
    .filter(({ d }) => d.tipo === "NF-e");
  const boletoDocs = docs
    .map((d, idx) => ({ d, idx }))
    .filter(({ d }) => d.tipo === "Boleto");

  if (nfeDocs.length === 0 || boletoDocs.length === 0) return null;

  for (const nf of nfeDocs) {
    const fp = getNFFormaPagamento(nf.d);
    if (!fp) continue;
    const fpNorm = normalizeComparable(fp);
    const boletoNorm = normalizeComparable("Boleto");
    if (fpNorm && fpNorm !== boletoNorm) {
      const bol = boletoDocs[0];
      return buildFormaPagamentoDivergenteDivergencia(nf.idx, bol.idx);
    }
  }

  return null;
}

/** Retorna todas as divergências detectadas (emissor e forma de pagamento, quando aplicável). */
export function getAllDivergencias(row: Row): Divergencia[] {
  const results: Divergencia[] = [];
  const emissor = detectEmissorDiferente(row);
  if (emissor) results.push(emissor);
  const forma = detectFormaPagamentoDivergente(row);
  if (forma) results.push(forma);
  return results;
}

export function getDivergencia(row: Row): Divergencia | null {
  const all = getAllDivergencias(row);
  return all[0] ?? null;
}

export function getDivergenciaComparativo(
  row: Row,
  pendencia: Divergencia
): DivergenciaComparativo | null {
  const docs = row.documentosAssociados ?? [];
  const [nfeIdx, bolIdx] = pendencia.docIdxsEnvolvidos;
  const nfe = docs[nfeIdx];
  const boleto = docs[bolIdx];
  if (!nfe || !boleto) return null;

  if (pendencia.tipo === "emissor-diferente") {
    const emissorNfe = getNFEmitenteNome(nfe);
    const emissorBoleto = getBoletoCedente(boleto);
    if (!emissorNfe || !emissorBoleto) return null;
    const cnpjNfe = nfe.danfe?.emitente?.cnpj?.trim();
    return {
      tipo: "emissor-diferente",
      emissorNfe,
      emissorBoleto,
      ...(cnpjNfe ? { cnpjNfe } : {}),
    };
  }

  const formaNfe = getNFFormaPagamento(nfe);
  if (!formaNfe) return null;
  return {
    tipo: "forma-pagamento-divergente",
    formaNfe,
    formaBoleto: getNFFormaPagamento(boleto) ?? "Boleto",
  };
}

export function isDivergenciaResolvidaNaListagem(row: Row): boolean {
  const divergencia = getDivergencia(row);
  if (!divergencia) return false;
  if (isDivergenciaConfiavel(row.id)) return true;
  if (
    divergencia.tipo === "forma-pagamento-divergente" &&
    isDivergenciaCiencia(row.id, divergencia.tipo)
  ) {
    return true;
  }
  return false;
}

export function hasDivergenciaAtiva(row: Row): boolean {
  const divergencia = getDivergencia(row);
  if (!divergencia) return false;
  if (isDivergenciaConfiavel(row.id)) return false;
  if (
    divergencia.tipo === "forma-pagamento-divergente" &&
    isDivergenciaCiencia(row.id, divergencia.tipo)
  ) {
    return false;
  }
  return true;
}

/** União de todos os tipos de pendência exibíveis na coluna "Pendências" da tabela. */
export type PendenciaTipo = DivergenciaTipo | 'boleto-validacao-pendente';

/**
 * Retorna a lista de todas as pendências ativas de uma CAP, em ordem de exibição:
 * 1. emissor-diferente
 * 2. forma-pagamento-divergente
 * 3. boleto-validacao-pendente
 *
 * Fonte única de verdade para coluna, filtro e quaisquer outros consumidores.
 */
export function getPendencias(row: Row): PendenciaTipo[] {
  const result: PendenciaTipo[] = [];
  const confiavel = isDivergenciaConfiavel(row.id);

  for (const div of getAllDivergencias(row)) {
    if (confiavel) break; // "confiável" descarta todas as divergências da conta
    if (
      div.tipo === 'forma-pagamento-divergente' &&
      isDivergenciaCiencia(row.id, div.tipo)
    ) continue;
    result.push(div.tipo);
  }

  if (hasPendingBoletoValidation(row)) {
    result.push('boleto-validacao-pendente');
  }

  return result;
}

/**
 * Retorna true quando a conta possui boleto em documentosAssociados com nivelAssociacao
 * explicitamente marcado como MEDIO ou BAIXO, indicando que exige validação manual de vínculo.
 * Boletos ALTO (já confirmados) ou sem nivelAssociacao (apenas associados automaticamente)
 * não ativam esta pendência.
 */
export function hasPendingBoletoValidation(row: Row): boolean {
  return Boolean(
    row.documentosAssociados?.some(
      (d) =>
        d.tipo === 'Boleto' &&
        (d.nivelAssociacao === 'MEDIO' || d.nivelAssociacao === 'BAIXO')
    )
  );
}

export function getDivergenciaDisplayLabel(row: Row): string {
  const divergencia = getDivergencia(row);
  if (!divergencia || isDivergenciaResolvidaNaListagem(row)) return "-";
  return DIVERGENCIA_DISPLAY_LABELS[divergencia.tipo] ?? "-";
}

export function isDivergenciaConfiavel(rowId: string): boolean {
  try {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(`${STORAGE_PREFIX}${rowId}`));
  } catch {
    return false;
  }
}

export function getDivergenciaConfiavelSinalizacao(
  rowId: string
): DivergenciaSinalizacao | null {
  try {
    if (typeof window === "undefined") return null;
    return readSinalizacao(window.localStorage.getItem(`${STORAGE_PREFIX}${rowId}`));
  } catch {
    return null;
  }
}

export function markDivergenciaConfiavel(rowId: string, meta: DivergenciaSinalizacao): void {
  try {
    if (typeof window === "undefined") return;
    writeSinalizacao(`${STORAGE_PREFIX}${rowId}`, meta);
  } catch {
    // noop
  }
}

export function unmarkDivergenciaConfiavel(rowId: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(`${STORAGE_PREFIX}${rowId}`);
  } catch {
    // noop
  }
}

export function isPendenciaDispensada(rowId: string, tipo: DivergenciaTipo): boolean {
  try {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(`${DISPENSADA_PREFIX}${rowId}:${tipo}`));
  } catch {
    return false;
  }
}

export function getPendenciaDispensadaSinalizacao(
  rowId: string,
  tipo: DivergenciaTipo
): DivergenciaSinalizacao | null {
  try {
    if (typeof window === "undefined") return null;
    return readSinalizacao(
      window.localStorage.getItem(`${DISPENSADA_PREFIX}${rowId}:${tipo}`)
    );
  } catch {
    return null;
  }
}

export function markPendenciaDispensada(
  rowId: string,
  tipo: DivergenciaTipo,
  meta: DivergenciaSinalizacao
): void {
  try {
    if (typeof window === "undefined") return;
    writeSinalizacao(`${DISPENSADA_PREFIX}${rowId}:${tipo}`, meta);
  } catch {
    // noop
  }
}

export function isDivergenciaCiencia(rowId: string, tipo: DivergenciaTipo): boolean {
  try {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(`${CIENCIA_PREFIX}${rowId}:${tipo}`));
  } catch {
    return false;
  }
}

export function getDivergenciaCienciaSinalizacao(
  rowId: string,
  tipo: DivergenciaTipo
): DivergenciaSinalizacao | null {
  try {
    if (typeof window === "undefined") return null;
    return readSinalizacao(window.localStorage.getItem(`${CIENCIA_PREFIX}${rowId}:${tipo}`));
  } catch {
    return null;
  }
}

export function markDivergenciaCiencia(
  rowId: string,
  tipo: DivergenciaTipo,
  meta: DivergenciaSinalizacao
): void {
  try {
    if (typeof window === "undefined") return;
    writeSinalizacao(`${CIENCIA_PREFIX}${rowId}:${tipo}`, meta);
  } catch {
    // noop
  }
}

export function getDocIdxsEnvolvidos(row: Row): number[] {
  return getDivergencia(row)?.docIdxsEnvolvidos ?? [];
}

export function getDivergenciaDocs(row: Row): { nfeIdx: number | null; boletoIdx: number | null } {
  return {
    nfeIdx: findFirstDocIndex(row, "NF-e"),
    boletoIdx: findFirstDocIndex(row, "Boleto"),
  };
}

