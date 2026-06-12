import type { FornecedorRow, SituacaoCadastral } from "../types";
import type { VisaoGeralSlug } from "../../lib/cadastro-navigation";

const IRREGULAR_SITUACOES: SituacaoCadastral[] = ["Suspenso", "Cancelado", "Nulo", "Inapto"];

export function isCnpjIrregular(row: FornecedorRow): boolean {
  return IRREGULAR_SITUACOES.includes(row.situacaoCadastral);
}

export function isSemFornecedorIdentificado(row: FornecedorRow): boolean {
  const razao = row.razaoSocial?.trim() ?? "";
  const fantasia = row.nomeFantasia?.trim() ?? "";

  if (!razao || !fantasia) return true;

  const normalized = (value: string) => value.toLowerCase();
  if (
    normalized(razao) === "não identificado" ||
    normalized(fantasia) === "não identificado"
  ) {
    return true;
  }

  return row.situacaoCadastral === "Nulo";
}

export function parseValorComprado(valor: string): number {
  const cleaned = valor.replace(/[^\d,]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function applyVisaoGeralSlug(rows: FornecedorRow[], visaoGeral: VisaoGeralSlug): FornecedorRow[] {
  if (visaoGeral === "total") {
    return rows;
  }

  if (visaoGeral === "cnpj-irregular") {
    return rows.filter(isCnpjIrregular);
  }

  if (visaoGeral === "maior-valor") {
    return [...rows].sort(
      (a, b) => parseValorComprado(b.valorComprado) - parseValorComprado(a.valorComprado),
    );
  }

  if (visaoGeral === "dados-sem-fornecedor") {
    return rows.filter(isSemFornecedorIdentificado);
  }

  return rows;
}

/** Aplica um ou mais filtros de visão geral (união / OR). */
export function applyVisaoGeralToRows(
  rows: FornecedorRow[],
  visaoGeral: VisaoGeralSlug | VisaoGeralSlug[] | null | undefined,
): FornecedorRow[] {
  const slugs = Array.isArray(visaoGeral) ? visaoGeral : visaoGeral ? [visaoGeral] : [];
  if (slugs.length === 0) return rows;

  const seen = new Set<number>();
  const merged: FornecedorRow[] = [];

  for (const slug of slugs) {
    for (const row of applyVisaoGeralSlug(rows, slug)) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        merged.push(row);
      }
    }
  }

  return merged;
}

export function getVisaoGeralFilterLabel(slug: VisaoGeralSlug): string {
  switch (slug) {
    case "total":
      return "Total de fornecedores";
    case "cnpj-irregular":
      return "Fornecedores com CNPJ irregular";
    case "maior-valor":
      return "Maior valor a fornecedores";
    case "dados-sem-fornecedor":
      return "Dados sem fornecedor";
    default:
      return slug;
  }
}
