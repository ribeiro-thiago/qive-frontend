import { parseDate, getStartOfDay } from './formatters';

export interface PaymentSummary {
  base: number;
  fees: number;
  total: number;
}

export function calculatePaymentSummary(rows: any[]): PaymentSummary {
  const today = new Date();
  const startOfDay = getStartOfDay(today);
  
  const base = rows.reduce((acc, r) => acc + (r.valor ?? 0), 0);
  
  let fees = 0;
  for (const row of rows) {
    const vencDate = parseDate(row.vencimento);
    if (!vencDate) continue;
    
    const dueDate = getStartOfDay(vencDate);
    const days = Math.floor((startOfDay.getTime() - dueDate.getTime()) / 86400000);
    
    if (days > 0) {
      const v = row.valor ?? 0;
      const multa = v * 0.02;
      const juros = v * 0.00033 * days;
      fees += multa + juros;
    }
  }
  
  return {
    base,
    fees,
    total: base + fees,
  };
}

export function generateAuthCode(): string {
  try {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let s = '';
    for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
  }
}

