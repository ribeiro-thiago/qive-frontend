import type { AnexoContratoStatus, FornecedorAnexoContrato, FornecedorRow } from "../types";

export const MAX_ANEXOS_POR_ENVIO = 100;

const ACCEPTED_EXTENSIONS = new Set(["pdf", "zip", "doc"]);

export const ACCEPT_ANEXOS_ATTRIBUTE = ".pdf,.zip,.doc";

const PROCESSING_DELAY_MS = 2200;

export const ANEXOS_CONTRATOS_MOCK_INICIAL: FornecedorAnexoContrato[] = [
  {
    id: "mock-1",
    nomeArquivo: "certidao_fornecedor.pdf",
    tamanhoBytes: 20 * 1024 * 1024,
    dataEnvio: "07/11/2024",
    status: "carregando",
  },
  {
    id: "mock-2",
    nomeArquivo: "certidao_fornecedor.mp3",
    tamanhoBytes: 86 * 1024 * 1024,
    dataEnvio: "07/11/2024",
    status: "invalido",
  },
  {
    id: "mock-3",
    nomeArquivo: "certidao_fornecedor.pdf",
    tamanhoBytes: 86 * 1024 * 1024,
    dataEnvio: "07/11/2024",
    status: "concluido",
  },
  {
    id: "mock-4",
    nomeArquivo: "certidao_fornecedor.pdf",
    tamanhoBytes: 86 * 1024 * 1024,
    dataEnvio: "07/11/2024",
    status: "concluido",
  },
];

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

export function isAnexoFormatoValido(fileName: string): boolean {
  return ACCEPTED_EXTENSIONS.has(getFileExtension(fileName));
}

export function formatTamanhoArquivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

export function formatDataEnvioHoje(): string {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function createAnexoId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildAnexoFromFile(file: File): FornecedorAnexoContrato {
  const valido = isAnexoFormatoValido(file.name);

  return {
    id: createAnexoId(file),
    nomeArquivo: file.name,
    tamanhoBytes: file.size,
    dataEnvio: formatDataEnvioHoje(),
    status: valido ? "carregando" : "invalido",
  };
}

export function getAnexosContratosCertidoes(fornecedor: FornecedorRow): FornecedorAnexoContrato[] {
  if (fornecedor.anexosContratosCertidoes !== undefined) {
    return fornecedor.anexosContratosCertidoes;
  }

  return ANEXOS_CONTRATOS_MOCK_INICIAL.map((anexo) => ({ ...anexo }));
}

export function scheduleAnexoProcessing(
  anexoId: string,
  onComplete: (id: string, status: AnexoContratoStatus) => void,
): () => void {
  const timeoutId = window.setTimeout(() => {
    onComplete(anexoId, "concluido");
  }, PROCESSING_DELAY_MS);

  return () => window.clearTimeout(timeoutId);
}
