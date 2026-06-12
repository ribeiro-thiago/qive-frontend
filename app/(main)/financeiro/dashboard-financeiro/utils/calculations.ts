export type AgingBucket = '0-7' | '8-15' | '16-30' | '31-60' | '60+';

export interface AgingData {
  bucket: AgingBucket;
  count: number;
  value: number;
}

export interface EtapaData {
  etapa: string;
  count: number;
  value: number;
}

export interface FornecedorData {
  fornecedor: string;
  cnpj?: string;
  valorTotal: number;
  quantidade: number;
  centroCusto?: string;
  formaPagamento?: string;
  status?: string;
  origem?: string;
}

export interface OrigemData {
  tipo: 'Manual' | 'Automática';
  count: number;
  percentual: number;
}

export function calculateAging(
  vencimento: Date | null,
  hoje: Date = new Date()
): AgingBucket | null {
  if (!vencimento) return null;
  
  const diffTime = vencimento.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) return '0-7';
  if (diffDays <= 15) return '8-15';
  if (diffDays <= 30) return '16-30';
  if (diffDays <= 60) return '31-60';
  return '60+';
}

export function isVencida(vencimento: Date | null, hoje: Date = new Date()): boolean {
  if (!vencimento) return false;
  return vencimento.getTime() < hoje.getTime();
}

export function groupByAging(
  items: Array<{ vencimento: Date | null; valor: number }>
): { aberto: AgingData[]; vencidas: AgingData[] } {
  const hoje = new Date();
  const buckets: AgingBucket[] = ['0-7', '8-15', '16-30', '31-60', '60+'];
  
  const aberto: AgingData[] = buckets.map(bucket => ({ bucket, count: 0, value: 0 }));
  const vencidas: AgingData[] = buckets.map(bucket => ({ bucket, count: 0, value: 0 }));
  
  items.forEach(item => {
    if (!item.vencimento) return;
    
    const bucket = calculateAging(item.vencimento, hoje);
    if (!bucket) return;
    
    const isVenc = isVencida(item.vencimento, hoje);
    const target = isVenc ? vencidas : aberto;
    const index = buckets.indexOf(bucket);
    
    if (index !== -1) {
      target[index].count++;
      target[index].value += item.valor;
    }
  });
  
  return { aberto, vencidas };
}

export function groupByEtapa(
  items: Array<{ etapa: string; valor: number }>
): EtapaData[] {
  const map = new Map<string, { count: number; value: number }>();
  
  items.forEach(item => {
    const existing = map.get(item.etapa) || { count: 0, value: 0 };
    existing.count++;
    existing.value += item.valor;
    map.set(item.etapa, existing);
  });
  
  return Array.from(map.entries()).map(([etapa, data]) => ({
    etapa,
    ...data,
  }));
}

export function getTopFornecedores(
  items: Array<{
    fornecedor: string;
    cnpj?: string;
    valor: number;
    centroCusto?: string;
    formaPagamento?: string;
    status?: string;
    origem?: string;
  }>,
  topN: number = 5
): FornecedorData[] {
  const map = new Map<string, FornecedorData>();
  
  items.forEach(item => {
    const existing = map.get(item.fornecedor);
    if (existing) {
      existing.valorTotal += item.valor;
      existing.quantidade++;
    } else {
      map.set(item.fornecedor, {
        fornecedor: item.fornecedor,
        cnpj: item.cnpj,
        valorTotal: item.valor,
        quantidade: 1,
        centroCusto: item.centroCusto,
        formaPagamento: item.formaPagamento,
        status: item.status,
        origem: item.origem,
      });
    }
  });
  
  return Array.from(map.values())
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, topN);
}

export function calculateOrigemProporcao(
  items: Array<{ origem: string }>
): OrigemData[] {
  const total = items.length;
  const manual = items.filter(item => item.origem === 'Manual').length;
  const automatica = items.filter(item => item.origem !== 'Manual' && item.origem).length;
  
  return [
    {
      tipo: 'Manual',
      count: manual,
      percentual: total > 0 ? (manual / total) * 100 : 0,
    },
    {
      tipo: 'Automática',
      count: automatica,
      percentual: total > 0 ? (automatica / total) * 100 : 0,
    },
  ];
}



