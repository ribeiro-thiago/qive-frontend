import { getMockDocumentoLogs } from "../data/mock-documento-logs";
import type { DocumentoLog } from "../types";

const MOCK_LOADING_DELAY_MS = 400;

export async function fetchDocumentoLogs(documentoId: number): Promise<DocumentoLog[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LOADING_DELAY_MS));
  return getMockDocumentoLogs(documentoId);
}
