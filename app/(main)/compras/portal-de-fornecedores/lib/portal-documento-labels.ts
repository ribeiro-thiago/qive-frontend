import type { PortalImportSegment } from "./portal-paths";

export type PortalDocumentoTipo = "NF-e" | "NFS-e" | "CT-e" | "CTE-OS";

const IMPORT_SEGMENT_TO_TIPO: Partial<Record<PortalImportSegment, PortalDocumentoTipo>> = {
  nfe: "NF-e",
  nfse: "NFS-e",
  cte: "CT-e",
  "cte-os": "CTE-OS",
};

const NUMERO_COLUMN_LABEL: Record<PortalDocumentoTipo, string> = {
  "NF-e": "Número",
  "NFS-e": "Número",
  "CT-e": "Número",
  "CTE-OS": "Número",
};

export function getPortalDocumentoTipoFromSegment(
  segment?: PortalImportSegment,
): PortalDocumentoTipo | undefined {
  if (!segment) return undefined;
  return IMPORT_SEGMENT_TO_TIPO[segment];
}

export function getPortalDocumentoNumeroColumnLabel(documentoTipo?: string): string {
  if (documentoTipo && documentoTipo in NUMERO_COLUMN_LABEL) {
    return NUMERO_COLUMN_LABEL[documentoTipo as PortalDocumentoTipo];
  }
  return "Número";
}

type PortalDocumentoImportCopy = {
  description: string;
  selectFilesAction: string;
};

export function getPortalDocumentoImportCopy(
  segment?: PortalImportSegment,
): PortalDocumentoImportCopy {
  const tipo = getPortalDocumentoTipoFromSegment(segment);

  if (!tipo) {
    return {
      description:
        "Faça envio dos documentos armazenados em seu computador para o Portal de Fornecedores.",
      selectFilesAction: "selecione arquivos de documentos",
    };
  }

  if (tipo === "CT-e") {
    return {
      description:
        "Faça envio dos CT-e armazenados em seu computador para o Portal de Fornecedores.",
      selectFilesAction: "selecione arquivos de CT-e",
    };
  }

  if (tipo === "CTE-OS") {
    return {
      description:
        "Faça envio dos CTE-OS armazenados em seu computador para o Portal de Fornecedores.",
      selectFilesAction: "selecione arquivos de CTE-OS",
    };
  }

  return {
    description: `Faça envio das ${tipo} armazenadas em seu computador para o Portal de Fornecedores.`,
    selectFilesAction: `selecione arquivos de ${tipo}`,
  };
}
