import type { DocumentoMensagem } from "../types";

export type MensagensCanal = "fornecedor" | "interno";

const LOAD_DELAY_MS = 500;
const SEND_DELAY_MS = 600;

/** Documentos mockados que simulam falha ao carregar mensagens (QA). */
const LOAD_ERROR_DOCUMENT_IDS = new Set([8]);

export async function fetchMensagensCanal(
  documentoId: number,
  source: DocumentoMensagem[],
): Promise<DocumentoMensagem[]> {
  await new Promise((resolve) => setTimeout(resolve, LOAD_DELAY_MS));

  if (LOAD_ERROR_DOCUMENT_IDS.has(documentoId)) {
    throw new Error("Não foi possível carregar as mensagens.");
  }

  return [...source];
}

export async function submitMensagem(shouldSimulateFailure: boolean): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));

  if (shouldSimulateFailure) {
    throw new Error("Não foi possível enviar a mensagem. Tente novamente.");
  }
}
