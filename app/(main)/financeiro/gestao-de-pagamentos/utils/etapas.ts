import { ETAPA_LABELS, LancadoEm } from '../types';

export function getEtapaLabel(lancadoEm: LancadoEm): string {
  return ETAPA_LABELS[lancadoEm] ?? lancadoEm;
}

export function isLancadoEm(value: string): value is LancadoEm {
  return value in ETAPA_LABELS;
}
