import type { DocumentoComprovante } from "../types";

export function formatComprovanteCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatContaBancaria(
  banco: string,
  agencia: string,
  contaMascarada: string
): string {
  return `${banco} • Ag. ${agencia} • Cc. ${contaMascarada}`;
}

export function formatContaDestino(comprovante: DocumentoComprovante): string {
  return formatContaBancaria(
    comprovante.banco,
    comprovante.agencia,
    comprovante.contaMascarada
  );
}

export function formatContaOrigem(comprovante: DocumentoComprovante): string {
  return formatContaBancaria(
    comprovante.bancoOrigem,
    comprovante.agenciaOrigem,
    comprovante.contaOrigemMascarada
  );
}

export function getComprovanteDataLabel(status: DocumentoComprovante["status"]): string {
  return status === "Pago" ? "Data do pagamento" : "Data agendada";
}
