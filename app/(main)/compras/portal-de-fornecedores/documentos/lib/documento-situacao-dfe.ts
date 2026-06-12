import {
  DOCUMENTO_SITUACAO_DFE_VALUES,
  type DocumentoSituacaoDfe,
  type PortalDocumentoRow,
} from "../types";

export const DOCUMENTO_SITUACAO_DFE = DOCUMENTO_SITUACAO_DFE_VALUES;

function normalizeEtapaKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export const DOCUMENTO_SITUACAO_DFE_LABELS: Record<DocumentoSituacaoDfe, string> = {
  captured: "Capturado",
  released: "Liberado",
  "awaiting-approval": "Aguar. aprovação",
};

const ETAPA_TO_SITUACAO_DFE: Record<string, DocumentoSituacaoDfe> = {
  "em aprovacao": DOCUMENTO_SITUACAO_DFE.AWAITING_APPROVAL,
  liberados: DOCUMENTO_SITUACAO_DFE.RELEASED,
  processamento: DOCUMENTO_SITUACAO_DFE.RELEASED,
  lancados: DOCUMENTO_SITUACAO_DFE.RELEASED,
  agendados: DOCUMENTO_SITUACAO_DFE.RELEASED,
  pagos: DOCUMENTO_SITUACAO_DFE.RELEASED,
};

/**
 * Deriva a situação do DF-e conforme o funil de governança:
 * captured → awaiting-approval → released (ERP).
 */
export function getDocumentoSituacaoDfe(documento: PortalDocumentoRow): DocumentoSituacaoDfe {
  if (documento.situacaoDfe) return documento.situacaoDfe;

  const normalizedEtapa = normalizeEtapaKey(documento.etapa);
  return ETAPA_TO_SITUACAO_DFE[normalizedEtapa] ?? DOCUMENTO_SITUACAO_DFE.CAPTURED;
}

export function getDocumentoSituacaoDfeLabel(situacao: DocumentoSituacaoDfe): string {
  return DOCUMENTO_SITUACAO_DFE_LABELS[situacao];
}
