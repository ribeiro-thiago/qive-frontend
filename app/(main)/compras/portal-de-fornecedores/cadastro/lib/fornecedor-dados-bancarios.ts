import { CNPJ_SIMULAR_ERRO } from "../data/mock-fornecedor-lookup";
import { cnpjMatches } from "./cnpj";
import type { FornecedorDadosBancarios, FornecedorRow } from "../types";

export const DADOS_BANCARIOS_PADRAO: Omit<FornecedorDadosBancarios, "cnpj"> = {
  banco: "001 - Banco do Brasil",
  agencia: "001-4",
  conta: "***35-4",
  tipoConta: "Conta corrente",
  metodoTransferencia: "TED",
};

export function buildDadosBancariosPadrao(cnpj: string): FornecedorDadosBancarios {
  return {
    ...DADOS_BANCARIOS_PADRAO,
    cnpj,
  };
}

export function getFornecedorDadosBancarios(
  fornecedor: FornecedorRow,
): FornecedorDadosBancarios | null {
  if (fornecedor.dadosBancarios) {
    return fornecedor.dadosBancarios;
  }

  if (fornecedor.dadosPagamento === "Cadastrados") {
    return buildDadosBancariosPadrao(fornecedor.cnpj);
  }

  return null;
}

export function hasDadosBancariosCadastrados(fornecedor: FornecedorRow): boolean {
  return getFornecedorDadosBancarios(fornecedor) !== null;
}

export function shouldSimulateErroAdicaoPagamento(cnpj: string): boolean {
  return cnpjMatches(cnpj, CNPJ_SIMULAR_ERRO);
}

const SAVE_DELAY_MS = 900;

export async function salvarDadosBancariosFornecedor(
  cnpj: string,
): Promise<{ ok: true } | { ok: false }> {
  await new Promise((resolve) => window.setTimeout(resolve, SAVE_DELAY_MS));

  if (shouldSimulateErroAdicaoPagamento(cnpj)) {
    return { ok: false };
  }

  return { ok: true };
}
