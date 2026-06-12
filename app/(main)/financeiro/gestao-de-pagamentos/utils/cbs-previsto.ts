import { Row } from '../types';

const INVALID_NFE_STATUSES = new Set(['cancelada', 'denegada', 'inutilizada']);

/** Menor valor monetário válido acima de zero (1 centavo), usado no filtro CBS previsto > R$0,00. */
export const CBS_PREVISTO_MIN_FILTER_VALUE = 0.01;

export interface CbsCreditSummary {
  value: number;
  consideredAccounts: number;
}

/**
 * Retorna o CBS previsto da CAP a partir da tag <CBS> do XML das NF-e associadas.
 * Notas canceladas/denegadas/inutilizadas ou sem CBS preenchido contribuem com zero.
 */
export function getCbsPrevistoValue(row: Row): number {
  const consideredNfeKeys = new Set<string>();

  return (row.documentosAssociados ?? []).reduce((total, doc) => {
    const cbsValue = doc.xml?.CBS;
    const normalizedStatus = doc.situacao?.toLowerCase();

    if (
      doc.tipo !== 'NF-e' ||
      cbsValue === undefined ||
      cbsValue <= 0 ||
      (normalizedStatus && INVALID_NFE_STATUSES.has(normalizedStatus))
    ) {
      return total;
    }

    const nfeKey =
      doc.chaveAcesso ?? `${doc.numero ?? 'sem-numero'}-${doc.serie ?? 'sem-serie'}`;
    if (consideredNfeKeys.has(nfeKey)) {
      return total;
    }

    consideredNfeKeys.add(nfeKey);
    return total + cbsValue;
  }, 0);
}

/** Conta possui CBS previsto preenchido (> R$0,00), mesma regra do filtro da aba Todas as contas. */
export function hasCbsPrevistoFilled(row: Row): boolean {
  return getCbsPrevistoValue(row) >= CBS_PREVISTO_MIN_FILTER_VALUE;
}

/** Resumo agregado para o card Reforma Tributária — mesma elegibilidade do filtro CBS previsto. */
export function calculateCbsCreditSummary(rows: Row[]): CbsCreditSummary {
  return rows.reduce<CbsCreditSummary>(
    (summary, row) => {
      const cbsValue = getCbsPrevistoValue(row);
      if (cbsValue < CBS_PREVISTO_MIN_FILTER_VALUE) {
        return summary;
      }

      return {
        value: summary.value + cbsValue,
        consideredAccounts: summary.consideredAccounts + 1,
      };
    },
    { value: 0, consideredAccounts: 0 }
  );
}
