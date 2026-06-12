import { toast } from "sonner";
import type { DocumentoAnexo, PortalDocumentoRow } from "../types";

export function getAnexoDisplayName(anexo: DocumentoAnexo): string {
  if (!anexo.extensao) return anexo.nome;
  const ext = anexo.extensao.startsWith(".") ? anexo.extensao : `.${anexo.extensao}`;
  const baseName = anexo.nome.endsWith(ext) ? anexo.nome : `${anexo.nome}${ext}`;
  return baseName;
}

export function formatTamanhoArquivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

export function formatAnexoExtensionLabel(extensao: string): string {
  if (!extensao) return "";
  return extensao.replace(/^\./, "").toLowerCase();
}

export function downloadDocumentoAnexo(anexo: DocumentoAnexo): void {
  const fileName = getAnexoDisplayName(anexo);
  const content = [
    `Arquivo mockado do Portal de Fornecedores`,
    `Nome: ${fileName}`,
    `Tamanho: ${anexo.tamanhoBytes} bytes`,
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`Download de ${fileName} iniciado`);
}

export function downloadPortalDocumento(documento: PortalDocumentoRow): void {
  const anexo = documento.anexosDocumento.find((item) => !item.apagado);
  if (anexo) {
    downloadDocumentoAnexo(anexo);
    return;
  }

  const fileName = `${documento.nfNumero.replace(/\s+/g, "_")}.xml`;
  const content = [
    "Documento mockado do Portal de Fornecedores",
    `NF: ${documento.nfNumero}`,
    `Tipo: ${documento.tipoDocumento}`,
    `Emissão: ${documento.dataEmissao}`,
    `Valor: ${documento.valor}`,
  ].join("\n");

  const blob = new Blob([content], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`Download de ${fileName} iniciado`);
}
