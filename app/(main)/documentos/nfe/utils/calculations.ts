import { NFe } from '../types';

export function calculateTotalValue(nfes: NFe[]): number {
  return nfes.reduce((sum, nfe) => sum + nfe.valor, 0);
}

export function calculateTotalByStatus(nfes: NFe[]): Record<string, { count: number; value: number }> {
  const result: Record<string, { count: number; value: number }> = {};
  
  nfes.forEach(nfe => {
    if (!result[nfe.status]) {
      result[nfe.status] = { count: 0, value: 0 };
    }
    result[nfe.status].count++;
    result[nfe.status].value += nfe.valor;
  });
  
  return result;
}

export function calculateTotalByManifestacao(nfes: NFe[]): Record<string, { count: number; value: number }> {
  const result: Record<string, { count: number; value: number }> = {};
  
  nfes.forEach(nfe => {
    const manifestacao = nfe.manifestacao || 'Não Manifestada';
    if (!result[manifestacao]) {
      result[manifestacao] = { count: 0, value: 0 };
    }
    result[manifestacao].count++;
    result[manifestacao].value += nfe.valor;
  });
  
  return result;
}

export function calculateAverageValue(nfes: NFe[]): number {
  if (nfes.length === 0) return 0;
  return calculateTotalValue(nfes) / nfes.length;
}

export function calculateTotalTaxes(nfe: NFe): number {
  let total = 0;
  
  if (nfe.valorIcms) total += nfe.valorIcms;
  if (nfe.valorIpi) total += nfe.valorIpi;
  if (nfe.impostos) {
    if (nfe.impostos.valorPis) total += nfe.impostos.valorPis;
    if (nfe.impostos.valorCofins) total += nfe.impostos.valorCofins;
  }
  
  return total;
}

export function groupByEmitente(nfes: NFe[]): Record<string, NFe[]> {
  const grouped: Record<string, NFe[]> = {};
  
  nfes.forEach(nfe => {
    const key = nfe.emitente.cnpj;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(nfe);
  });
  
  return grouped;
}

export function groupByCFOP(nfes: NFe[]): Record<string, NFe[]> {
  const grouped: Record<string, NFe[]> = {};
  
  nfes.forEach(nfe => {
    nfe.cfops.forEach(cfop => {
      if (!grouped[cfop]) {
        grouped[cfop] = [];
      }
      grouped[cfop].push(nfe);
    });
  });
  
  return grouped;
}

export function filterByDateRange(nfes: NFe[], startDate: Date, endDate: Date): NFe[] {
  return nfes.filter(nfe => {
    const [day, month, year] = nfe.dataEmissao.split('/').map(Number);
    const emissaoDate = new Date(year, month - 1, day);
    return emissaoDate >= startDate && emissaoDate <= endDate;
  });
}

