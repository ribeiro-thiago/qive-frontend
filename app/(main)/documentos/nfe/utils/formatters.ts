export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
}

export function formatCNPJ(cnpj: string): string {
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, '');
  
  // Já está formatado
  if (cnpj.includes('/') || cnpj.includes('.')) {
    return cnpj;
  }
  
  // Formata CNPJ: 00.000.000/0000-00
  if (numbers.length === 14) {
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  
  // Formata CPF: 000.000.000-00
  if (numbers.length === 11) {
    return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  
  return cnpj;
}

export function formatChaveAcesso(chave: string): string {
  // Remove espaços
  const clean = chave.replace(/\s+/g, '');
  
  // Formata em grupos de 4 dígitos
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

export function formatDate(dateStr: string): string {
  // Se já está no formato DD/MM/YYYY, retorna como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Se está no formato ISO, converte
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return dateStr;
}

export function formatCFOP(cfop: string): string {
  // Formata CFOP: 0.000
  if (cfop.length === 4 && !cfop.includes('.')) {
    return `${cfop[0]}.${cfop.slice(1)}`;
  }
  return cfop;
}

export function formatCFOPList(cfops: string[]): string {
  return cfops.map(formatCFOP).join(', ');
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function shortenText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

