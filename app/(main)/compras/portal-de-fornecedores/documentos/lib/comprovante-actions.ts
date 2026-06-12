import { toast } from "sonner";
import type { DocumentoComprovante } from "../types";
import {
  formatComprovanteCurrency,
  formatContaDestino,
  formatContaOrigem,
  getComprovanteDataLabel,
} from "./comprovante-format";

export function downloadComprovanteMock(
  documentoId: number,
  comprovante: DocumentoComprovante
): void {
  if (!comprovante.pdfDisponivel) {
    return;
  }

  try {
    const dataLabel = getComprovanteDataLabel(comprovante.status);
    const lines = [
      "COMPROVANTE DE PAGAMENTO",
      `Documento: #${documentoId}`,
      `Status: ${comprovante.status}`,
      `${dataLabel}: ${comprovante.data}`,
      `Valor líquido: ${formatComprovanteCurrency(comprovante.valorLiquido)}`,
      `Conta de destino: ${formatContaDestino(comprovante)}`,
      `Conta de origem: ${formatContaOrigem(comprovante)}`,
      `Pagador: ${comprovante.pagador}`,
      `CNPJ Pagador: ${comprovante.cnpjPagador}`,
      `Favorecido: ${comprovante.favorecido}`,
      `Forma de pagamento: ${comprovante.formaPagamento}`,
      ...(comprovante.codigoAutenticacao
        ? [`Código de autenticação: ${comprovante.codigoAutenticacao}`]
        : []),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `comprovante-documento-${documentoId}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Comprovante baixado.");
  } catch {
    toast.error("Não foi possível baixar o comprovante.");
  }
}
