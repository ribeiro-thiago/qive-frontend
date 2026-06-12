import { AssociatedDoc, Row } from '../types';
import { parseDate } from './formatters';

const NOTA_DOC_TYPES: AssociatedDoc['tipo'][] = ['NF-e', 'NFS-e', 'CT-e'];

function formatEmissaoDate(dateStr: string): string | null {
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = parseDate(trimmed);
  if (!parsed) return null;

  return parsed.toLocaleDateString('pt-BR');
}

/** Data de emissão da nota fiscal vinculada (NF-e, NFS-e ou CT-e). */
export function getNotaEmissaoDisplay(row: Row): string {
  const docs = [
    ...(row.documentosAssociados ?? []),
    ...(row.documentosParaConferencia ?? []),
  ];

  for (const tipo of NOTA_DOC_TYPES) {
    const nota = docs.find((d) => d.tipo === tipo && d.data?.trim());
    if (nota?.data) {
      const formatted = formatEmissaoDate(nota.data);
      if (formatted) return formatted;
    }
  }

  return '-';
}
