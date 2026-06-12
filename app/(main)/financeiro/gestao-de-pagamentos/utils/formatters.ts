export function formatAccessKey(key?: string): string {
  if (!key) return '';
  return key.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
}

export function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  
  // ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  
  // DD/MM/YYYY format
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? null : d;
  }
  
  return null;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDateDDMMYYYYDots(date: Date): string {
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function formatTimeHHmm(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Formata data/hora de geração da conta para exibição (DD.MM.AAAA e HH:mm opcional). */
export function formatGeracaoContaDisplay(value?: string): { date: string; time?: string } | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return null;
    const hasTime =
      /T\d{2}:\d{2}/.test(trimmed) ||
      (d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0);
    return {
      date: formatDateDDMMYYYYDots(d),
      time: hasTime ? formatTimeHHmm(d) : undefined,
    };
  }

  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (slashMatch) {
    const [, dd, mm, yyyy, hh, min] = slashMatch;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh ?? 0), Number(min ?? 0));
    if (isNaN(d.getTime())) return null;
    return {
      date: formatDateDDMMYYYYDots(d),
      time: hh && min ? formatTimeHHmm(d) : undefined,
    };
  }

  const dotMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+\((\d{2}):(\d{2})\))?/);
  if (dotMatch) {
    const [, dd, mm, yyyy, hh, min] = dotMatch;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh ?? 0), Number(min ?? 0));
    if (isNaN(d.getTime())) return null;
    return {
      date: formatDateDDMMYYYYDots(d),
      time: hh && min ? formatTimeHHmm(d) : undefined,
    };
  }

  const parsed = parseDate(trimmed);
  if (parsed) {
    return { date: formatDateDDMMYYYYDots(parsed) };
  }

  return null;
}
