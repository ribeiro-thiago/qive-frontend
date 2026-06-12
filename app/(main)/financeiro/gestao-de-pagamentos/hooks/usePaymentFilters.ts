import { useMemo } from 'react';
import { Row, PaymentFilter, PaymentTabId } from '../types';
import { parseDate, getStartOfDay, addDays } from '../utils/formatters';
import {
  getDivergencia,
  getPendencias,
  hasDivergenciaAtiva,
  DIVERGENCIAS_FILTER_PLACEHOLDER,
} from '../utils/divergencias';
import { isLancadoEmFilterActive } from '../utils/lancadoEmFilter';
import { getCbsPrevistoValue } from '../utils/cbs-previsto';

export function usePaymentFilters(
  data: Row[],
  tab: PaymentTabId,
  filters: PaymentFilter,
  mapOrigem?: (row: Row) => Row['origem']
) {
  const { 
    status, 
    period, 
    query, 
    visaoGeralFilter,
    vencimentoInicio,
    vencimentoFim,
    emissaoInicio,
    emissaoFim,
    valorMinimo,
    valorMaximo,
    formaPagamento,
    origemDocumento,
    semDataVencimento,
    divergencias,
    cancelamentoOrigem,
    tipoCancelamento,
    notaAtualizadaAposCriacao,
    lancadoEm,
    cbsPrevistoMinimo,
    cbsPrevistoMaximo,
  } = filters;

  const filteredData = useMemo(() => {
    const today = new Date();
    const startOfDay = getStartOfDay(today);

    function matchesPeriod(row: Row): boolean {
      switch (period) {
        case 'Todos os períodos':
          return true;
        case 'Sem data de vencimento': {
          const d = parseDate(row.vencimento);
          return !d || !row.vencimento;
        }
        default: {
          const d = parseDate(row.vencimento);
          if (!d) return false;
          const sd = getStartOfDay(d);
          
          switch (period) {
            case 'Hoje':
              return sd.getTime() === startOfDay.getTime();
            case 'Amanhã':
              return sd.getTime() === addDays(startOfDay, 1).getTime();
            case 'Próximos 7 dias': {
              const end = addDays(startOfDay, 7);
              return sd > startOfDay && sd <= end;
            }
            case 'Próximos 30 dias': {
              const end = addDays(startOfDay, 30);
              return sd > startOfDay && sd <= end;
            }
            default:
              return true;
          }
        }
      }
    }

    function matchesVencimentoRange(row: Row): boolean {
      // Se o filtro "Sem data de vencimento" está ativo
      if (semDataVencimento) {
        // Retorna true apenas se a data de vencimento for inválida ou vazia
        const vencDate = parseDate(row.vencimento);
        return !vencDate || !row.vencimento;
      }
      
      // Lógica normal de intervalo de vencimento
      if (!vencimentoInicio && !vencimentoFim) return true;
      
      const vencDate = parseDate(row.vencimento);
      if (!vencDate) return false;
      
      const vencStartOfDay = getStartOfDay(vencDate);
      
      if (vencimentoInicio) {
        const inicioDate = parseDate(vencimentoInicio);
        if (inicioDate && vencStartOfDay < getStartOfDay(inicioDate)) return false;
      }
      
      if (vencimentoFim) {
        const fimDate = parseDate(vencimentoFim);
        if (fimDate && vencStartOfDay > getStartOfDay(fimDate)) return false;
      }
      
      return true;
    }

    function matchesEmissaoRange(row: Row): boolean {
      if (!emissaoInicio && !emissaoFim) return true;
      
      // Para simplificar, vamos usar a data de vencimento como referência
      // Em uma implementação real, você teria um campo de data de emissão no Row
      const emissaoDate = row.documentosAssociados?.[0]?.data;
      if (!emissaoDate) return true; // Se não tem data de emissão, não filtra
      
      const emissaoStartOfDay = getStartOfDay(parseDate(emissaoDate) || new Date());
      
      if (emissaoInicio) {
        const inicioDate = parseDate(emissaoInicio);
        if (inicioDate && emissaoStartOfDay < getStartOfDay(inicioDate)) return false;
      }
      
      if (emissaoFim) {
        const fimDate = parseDate(emissaoFim);
        if (fimDate && emissaoStartOfDay > getStartOfDay(fimDate)) return false;
      }
      
      return true;
    }

    function matchesValorRange(row: Row): boolean {
      if (!valorMinimo && !valorMaximo) return true;
      
      const valor = row.valor || 0;
      
      if (valorMinimo) {
        const minimo = parseFloat(valorMinimo);
        if (!isNaN(minimo) && valor < minimo) return false;
      }
      
      if (valorMaximo) {
        const maximo = parseFloat(valorMaximo);
        if (!isNaN(maximo) && valor > maximo) return false;
      }
      
      return true;
    }

    function matchesFormaPagamento(row: Row): boolean {
      if (!formaPagamento || formaPagamento === 'Todos os tipos') return true;
      
      const tipo = row.formaPagamento?.tipo || 'Não informado';
      return tipo === formaPagamento;
    }

    function matchesOrigemDocumento(row: Row): boolean {
      if (!origemDocumento || origemDocumento === 'Todos os tipos') return true;
      
      // IMPORTANTE: Usar a origem mapeada (se mapOrigem fornecida) ou a origem original
      // Isso garante que o filtro use a mesma origem que é exibida na tabela
      // NÃO considerar documentosAssociados para este filtro
      const origemOriginal = mapOrigem ? mapOrigem(row) : row.origem;
      // Normalizar a origem para corresponder às opções do filtro (usando string para permitir valores normalizados)
      let origemNormalizada: string = origemOriginal;
      if (origemOriginal === 'NF-e') {
        origemNormalizada = 'NFe';
      } else if (origemOriginal === 'CT-e') {
        origemNormalizada = 'CTe';
      } else if (origemOriginal === 'NFS-e') {
        origemNormalizada = 'NFSe';
      }
      // 'Boleto' e 'Manual' não precisam normalização
      
      // Se a origem não corresponder exatamente, retorna false
      return origemNormalizada === origemDocumento;
    }

    function matchesDivergencias(row: Row): boolean {
      if (tab === 'conferir') {
        const divergencia = getDivergencia(row);
        if (!divergencias) return true;
        if (divergencias === 'Todas as divergências') return Boolean(divergencia);
        if (divergencias === 'Sem divergências') return !divergencia;
        if (!divergencia) return false;
        if (divergencias === 'Divergência de pagamento') {
          return divergencia.tipo === 'forma-pagamento-divergente';
        }
        if (divergencias === 'Emissores diferentes') {
          return divergencia.tipo === 'emissor-diferente';
        }
        return true;
      }

      if (tab !== 'todas') return true;
      if (!divergencias || divergencias === DIVERGENCIAS_FILTER_PLACEHOLDER) return true;

      const pendencias = getPendencias(row);

      switch (divergencias) {
        case 'Todas as pendências':
          return pendencias.length > 0;
        case 'Emissor':
          return pendencias.includes('emissor-diferente');
        case 'Pagamento':
          return pendencias.includes('forma-pagamento-divergente');
        case 'Documento':
          return pendencias.includes('boleto-validacao-pendente');
        case 'Sem pendências':
          return pendencias.length === 0;
        default:
          return true;
      }
    }

    function matchesCancelamentoOrigem(row: Row): boolean {
      if (tab !== 'cancelados') return true;
      if (!cancelamentoOrigem || cancelamentoOrigem === 'Todos os tipos') return true;
      if (cancelamentoOrigem === 'Nota/Boleto') {
        return row.cancelamentoOrigem === 'Por nota' || row.cancelamentoOrigem === 'Por boleto';
      }
      return (row.cancelamentoOrigem ?? 'Manual') === cancelamentoOrigem;
    }

    function matchesTipoCancelamento(row: Row): boolean {
      if (tab !== 'cancelados') return true;
      if (!tipoCancelamento || tipoCancelamento === 'Todos os tipos') return true;
      if (tipoCancelamento === 'Automático (nota ou boleto cancelado)') {
        return row.cancelamentoOrigem === 'Nota' || row.cancelamentoOrigem === 'Boleto';
      }
      if (tipoCancelamento === 'Automático - Nota') {
        return row.cancelamentoOrigem === 'Nota' || row.cancelamentoOrigem === 'Por nota';
      }
      if (tipoCancelamento === 'Automático - Boleto') {
        return row.cancelamentoOrigem === 'Boleto' || row.cancelamentoOrigem === 'Por boleto';
      }
      return (row.cancelamentoOrigem ?? 'Manual') === 'Manual';
    }

    function matchesNotaAtualizada(row: Row): boolean {
      if (!notaAtualizadaAposCriacao) return true;
      return Boolean(row.notaAtualizadaAposCriacao);
    }

    function matchesLancadoEm(row: Row): boolean {
      if (tab !== 'todas') return true;
      if (!isLancadoEmFilterActive(lancadoEm)) return true;
      return row.lancadoEm === lancadoEm;
    }

    function matchesCbsPrevistoRange(row: Row): boolean {
      if (tab !== 'todas') return true;
      if (!cbsPrevistoMinimo && !cbsPrevistoMaximo) return true;

      const cbsPrevisto = getCbsPrevistoValue(row);

      if (cbsPrevistoMinimo) {
        const minimo = parseFloat(cbsPrevistoMinimo);
        if (!isNaN(minimo) && cbsPrevisto < minimo) return false;
      }

      if (cbsPrevistoMaximo) {
        const maximo = parseFloat(cbsPrevistoMaximo);
        if (!isNaN(maximo) && cbsPrevisto > maximo) return false;
      }

      return true;
    }


    function matchesStatus(row: Row): boolean {
      if (tab === 'cancelados' || tab === 'liquidados') return true;
      if (!status || status === 'Todos os Status') return true;
      if (status === 'Vencido') {
        // Uma conta é considerada vencida se:
        // 1. Tem status explícito 'Vencido', OU
        // 2. Tem data de vencimento anterior a hoje (independente do status)
        const d = parseDate(row.vencimento);
        if (d) {
          const sd = getStartOfDay(d);
          if (sd < startOfDay) return true; // Vencida por data
        }
        return (row.status ?? '') === 'Vencido'; // Vencida por status
      }
      return (row.status ?? '') === status;
    }

    function matchesQuery(row: Row): boolean {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      
      const fields = [
        row.fornecedor,
        row.cnpjFornecedor,
        row.cnpjPagador,
        row.vencimento,
        row.origem,
        row.ordemCompra ?? '',
        row.parcela ?? '',
        row.centroCusto ?? '',
        row.observacoes ?? '',
        row.status ?? '',
      ];
      
      return fields.some((f) => (f ?? '').toString().toLowerCase().includes(q));
    }

    function matchesVisaoGeralFilter(row: Row): boolean {
      if (!visaoGeralFilter) return true;
      
      switch (visaoGeralFilter) {
        case 'divergencias': {
          return hasDivergenciaAtiva(row);
        }
        case 'total':
          return true;
        case 'Aberto':
        case 'Vencido':
        case 'Pago':
        case 'Cancelado':
          return row.status === visaoGeralFilter;
        case 'a-vencer-7-dias': {
          if (!row.vencimento) return false;
          const vencDate = parseDate(row.vencimento);
          if (!vencDate) return false;
          const vencStartOfDay = getStartOfDay(vencDate);
          const endOf7Days = addDays(startOfDay, 7);
          return vencStartOfDay >= startOfDay && vencStartOfDay <= endOf7Days;
        }
        default:
          return true;
      }
    }

    const filtered = data
      .filter(r => tab === 'todas' || r.lancadoEm === tab)
      // Regra de produto: pagamentos com status "Pago" devem aparecer apenas em "liquidados".
      .filter(r => tab !== 'conferir' || (r.status ?? '') !== 'Pago')
      .filter(matchesStatus)
      .filter(period === 'Todos os períodos' ? () => true : matchesPeriod)
      .filter(matchesQuery)
      .filter(matchesVisaoGeralFilter)
      .filter(matchesVencimentoRange)
      .filter(matchesEmissaoRange)
      .filter(matchesValorRange)
      .filter(matchesFormaPagamento)
      .filter(matchesOrigemDocumento)
      .filter(matchesDivergencias)
      .filter(matchesCancelamentoOrigem)
      .filter(matchesTipoCancelamento)
      .filter(matchesNotaAtualizada)
      .filter(matchesLancadoEm)
      .filter(matchesCbsPrevistoRange);
    
    // Na aba "pagar", ordena por ordem de chegada (mais recentes primeiro)
    if (tab === 'pagar') {
      return [...filtered].reverse();
    }
    
    return filtered;
  }, [
    data, 
    tab, 
    status, 
    period, 
    query, 
    visaoGeralFilter,
    vencimentoInicio,
    vencimentoFim,
    emissaoInicio,
    emissaoFim,
    valorMinimo,
    valorMaximo,
    formaPagamento,
    origemDocumento,
    semDataVencimento,
    divergencias,
    cancelamentoOrigem,
    tipoCancelamento,
    notaAtualizadaAposCriacao,
    lancadoEm,
    cbsPrevistoMinimo,
    cbsPrevistoMaximo,
    mapOrigem,
  ]);

  const totalValue = useMemo(
    () => filteredData.reduce((acc, r) => acc + (r.valor ?? 0), 0),
    [filteredData]
  );

  return {
    filteredData,
    totalValue,
    totalCount: filteredData.length,
  };
}

