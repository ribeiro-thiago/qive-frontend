import { Row } from "../../gestao-de-pagamentos/types";
import { parseDate } from "./formatters";
import { getDivergencia, isDivergenciaConfiavel } from "../../gestao-de-pagamentos/utils/divergencias";

// Mapear lancadoEm para formato de etapa do dashboard
function mapEtapa(lancadoEm: Row['lancadoEm']): string {
  const etapaMap: Record<string, string> = {
    'conferir': 'Conferir',
    'aprovacao': 'Aprovar',
    'pagar': 'Pagar',
    'bloqueados': 'Bloqueados',
    'cancelados': 'Cancelados',
  };
  return etapaMap[lancadoEm] || lancadoEm;
}

// Converter Row para formato esperado por CardAlertas
export interface DashboardConta {
  id: string;
  fornecedor: string;
  cnpj?: string;
  valor: number;
  vencimento: string | null;
  status: 'Aberto' | 'Vencido' | 'Pago' | 'Cancelado';
  etapa: 'Conferir' | 'Aprovar' | 'Pagar' | 'Bloqueados' | 'Cancelados';
  origem: 'Manual' | 'NF-e' | 'NFS-e' | 'CT-e' | 'Boleto';
  dataPagamento?: string;
  dataVencimento?: Date;
  centroCusto?: string;
  formaPagamento?: string;
  dataEmissao?: string;
  divergenciaTipo?: 'emissor-diferente' | 'forma-pagamento-divergente';
  cancelamentoOrigem?: 'Manual' | 'Nota' | 'Boleto';
  notaAtualizadaAposCriacao?: boolean;
}

function normalizeCancelamentoOrigem(
  value: Row['cancelamentoOrigem'] | 'Nota' | 'Boleto' | null | ''
): DashboardConta['cancelamentoOrigem'] {
  if (value == null || value === '') return undefined;

  switch (value) {
    case 'Manual':
      return 'Manual';
    case 'Por nota':
    case 'Nota':
      return 'Nota';
    case 'Por boleto':
    case 'Boleto':
      return 'Boleto';
    default:
      return undefined;
  }
}

export function convertRowToDashboardConta(row: Row): DashboardConta {
  // Extrair data de emissão do primeiro documento associado
  let dataEmissao: string | undefined;
  if (row.documentosAssociados && row.documentosAssociados.length > 0) {
    const primeiroDoc = row.documentosAssociados[0];
    dataEmissao = primeiroDoc.data;
  }

  // Extrair data de pagamento de comprovante
  let dataPagamento: string | undefined;
  if (row.documentosAssociados) {
    const comprovante = row.documentosAssociados.find(doc => doc.tipo === 'Comprovante');
    if (comprovante) {
      dataPagamento = comprovante.data;
    }
  }

  // Extrair forma de pagamento
  let formaPagamento: string | undefined;
  if (row.formaPagamento) {
    formaPagamento = row.formaPagamento.tipo;
  } else if (row.pagamentoPreferencial) {
    formaPagamento = row.pagamentoPreferencial.tipo;
  }

  // Converter vencimento para Date se necessário (tratar string vazia como null)
  const vencimentoStr = row.vencimento && row.vencimento.trim() ? row.vencimento : null;
  const dataVencimento = vencimentoStr ? parseDate(vencimentoStr) : null;

  // Converter lancadoEm para etapa
  const etapa = mapEtapa(row.lancadoEm) as 'Conferir' | 'Aprovar' | 'Pagar' | 'Bloqueados' | 'Cancelados';

  // Mapear status (garantir que seja um dos valores esperados)
  const status: 'Aberto' | 'Vencido' | 'Pago' | 'Cancelado' = 
    row.status === 'Pago' || row.status === 'Vencido' || row.status === 'Cancelado'
      ? row.status
      : 'Aberto';

  const divergencia = getDivergencia(row);
  const divergenciaTipo =
    divergencia && !isDivergenciaConfiavel(row.id) ? divergencia.tipo : undefined;

  return {
    id: row.id,
    fornecedor: row.fornecedor,
    cnpj: row.cnpjFornecedor,
    valor: row.valor,
    vencimento: vencimentoStr,
    status,
    etapa,
    origem: row.origem,
    dataPagamento,
    dataVencimento: dataVencimento || undefined,
    centroCusto: row.centroCusto,
    formaPagamento,
    dataEmissao,
    divergenciaTipo,
    cancelamentoOrigem: normalizeCancelamentoOrigem(row.cancelamentoOrigem),
    notaAtualizadaAposCriacao: row.notaAtualizadaAposCriacao,
  };
}

// Converter Row para formato esperado por EtapasBigNumbers e StatusPagamento
export interface ContaEtapa {
  etapa: string;
  valor: number;
  dataEmissao?: string;
}

export function convertRowToContaEtapa(row: Row): ContaEtapa {
  let dataEmissao: string | undefined;
  if (row.documentosAssociados && row.documentosAssociados.length > 0) {
    const primeiroDoc = row.documentosAssociados[0];
    dataEmissao = primeiroDoc.data;
  }

  return {
    etapa: row.lancadoEm,
    valor: row.valor,
    dataEmissao,
  };
}

// Converter Row para formato esperado por StatusPagamento (pagamentos)
export interface ContaPagamento {
  vencimento: string | null;
  dataPagamento?: string;
  valor: number;
  status: string;
  dataEmissao?: string;
}

export function convertRowToContaPagamento(row: Row): ContaPagamento {
  let dataPagamento: string | undefined;
  if (row.documentosAssociados) {
    const comprovante = row.documentosAssociados.find(doc => doc.tipo === 'Comprovante');
    if (comprovante) {
      dataPagamento = comprovante.data;
    }
  }

  let dataEmissao: string | undefined;
  if (row.documentosAssociados && row.documentosAssociados.length > 0) {
    const primeiroDoc = row.documentosAssociados[0];
    dataEmissao = primeiroDoc.data;
  }

  const status = row.status || 'Aberto';

  return {
    vencimento: row.vencimento || null,
    dataPagamento,
    valor: row.valor,
    status,
    dataEmissao,
  };
}

// Converter Row para formato esperado por VisaoAging
export interface ContaAging {
  vencimento: string | null;
  valor: number;
  status: string;
}

export function convertRowToContaAging(row: Row): ContaAging {
  return {
    vencimento: row.vencimento || null,
    valor: row.valor,
    status: row.status || 'Aberto',
  };
}

// Converter Row para formato esperado por TopFornecedores
export interface ContaFornecedor {
  fornecedor: string;
  cnpj?: string;
  valor: number;
  centroCusto?: string;
  formaPagamento?: string;
  status?: string;
  origem?: string;
  dataEmissao?: string;
}

export function convertRowToContaFornecedor(row: Row): ContaFornecedor {
  let dataEmissao: string | undefined;
  if (row.documentosAssociados && row.documentosAssociados.length > 0) {
    const primeiroDoc = row.documentosAssociados[0];
    dataEmissao = primeiroDoc.data;
  }

  let formaPagamento: string | undefined;
  if (row.formaPagamento) {
    formaPagamento = row.formaPagamento.tipo;
  } else if (row.pagamentoPreferencial) {
    formaPagamento = row.pagamentoPreferencial.tipo;
  }

  return {
    fornecedor: row.fornecedor,
    cnpj: row.cnpjFornecedor,
    valor: row.valor,
    centroCusto: row.centroCusto,
    formaPagamento,
    status: row.status,
    origem: row.origem,
    dataEmissao,
  };
}
