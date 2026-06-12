import { useMemo } from 'react';
import { NFe, NFeTab, NFeFilter } from '../types';

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // DD/MM/YYYY format
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? null : d;
  }
  
  return null;
}

function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function useNFeFilters(
  nfes: NFe[],
  currentTab: NFeTab,
  filter: NFeFilter
) {
  const filteredData = useMemo(() => {
    let filtered = nfes.filter(nfe => nfe.lancadoEm === currentTab);

    // Filtro de busca
    if (filter.query) {
      const q = filter.query.toLowerCase();
      filtered = filtered.filter(nfe => {
        return (
          nfe.numero.toLowerCase().includes(q) ||
          nfe.chaveAcesso.toLowerCase().includes(q) ||
          nfe.emitente.razaoSocial.toLowerCase().includes(q) ||
          nfe.emitente.cnpj.toLowerCase().includes(q) ||
          nfe.destinatario.razaoSocial.toLowerCase().includes(q) ||
          nfe.destinatario.cnpjCpf.toLowerCase().includes(q) ||
          nfe.cfops.some(cfop => cfop.includes(q)) ||
          nfe.naturezaOperacao.toLowerCase().includes(q) ||
          (nfe.etiquetas && nfe.etiquetas.some(tag => tag.toLowerCase().includes(q)))
        );
      });
    }

    // Filtro de período
    if (filter.period && filter.period !== 'Todos os períodos') {
      const today = new Date();
      const startOfDay = getStartOfDay(today);
      
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      switch (filter.period) {
        case 'Hoje':
          startDate = startOfDay;
          endDate = addDays(startOfDay, 1);
          break;
        case 'Últimos 7 dias':
          startDate = addDays(startOfDay, -7);
          endDate = addDays(startOfDay, 1);
          break;
        case 'Últimos 30 dias':
          startDate = addDays(startOfDay, -30);
          endDate = addDays(startOfDay, 1);
          break;
        case 'Últimos 90 dias':
          startDate = addDays(startOfDay, -90);
          endDate = addDays(startOfDay, 1);
          break;
        case 'Este mês':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'Mês passado':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
      }

      if (startDate && endDate) {
        filtered = filtered.filter(nfe => {
          const emissaoDate = parseDate(nfe.dataEmissao);
          if (!emissaoDate) return false;
          const emissaoStartOfDay = getStartOfDay(emissaoDate);
          return emissaoStartOfDay >= startDate! && emissaoStartOfDay < endDate!;
        });
      }
    }

    return filtered;
  }, [nfes, currentTab, filter]);

  const totalValue = useMemo(() => {
    return filteredData.reduce((sum, nfe) => sum + nfe.valor, 0);
  }, [filteredData]);

  const totalCount = filteredData.length;

  return {
    filteredData,
    totalValue,
    totalCount,
  };
}

