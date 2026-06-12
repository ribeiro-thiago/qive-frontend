import type { Row } from "../types";

export const MAX_DUE_DATE_RULE_DAYS = 720;

export const INVALID_DUE_DATE_MESSAGE =
  "Informe uma data de vencimento válida.";
export const PAST_DUE_DATE_MESSAGE =
  "A data de vencimento não pode ser anterior à data atual.";

export interface DueDateManualEditMeta {
  userName: string;
  editedAt: string;
}

interface StoredManualDueDateEdit {
  vencimento: string;
  meta: DueDateManualEditMeta;
}

const MANUAL_DUE_DATE_STORAGE_KEY = "contasAPagar.vencimentosEditados";
const FALLBACK_EDITOR_NAME = "Usuário atual";

export function formatDueDateInput(value: string): string {
  const numbers = value.replace(/[^\d]/g, "").slice(0, 8);
  return numbers
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
}

export function parseStrictDueDate(value: string): Date | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;

  const [dd, mm, yyyy] = value.split("/").map((part) => Number(part));
  const date = new Date(yyyy, mm - 1, dd);

  if (
    date.getFullYear() !== yyyy ||
    date.getMonth() + 1 !== mm ||
    date.getDate() !== dd
  ) {
    return null;
  }

  return date;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function validateManualDueDate(value: string): {
  ok: boolean;
  message?: string;
} {
  const trimmed = value.trim();
  const parsed = parseStrictDueDate(trimmed);

  if (!parsed) {
    return { ok: false, message: INVALID_DUE_DATE_MESSAGE };
  }

  if (startOfLocalDay(parsed) < startOfLocalDay(new Date())) {
    return { ok: false, message: PAST_DUE_DATE_MESSAGE };
  }

  return { ok: true };
}

export function getDueDateDisplay(row: Row): { label: string; seedForEdit: string } {
  const vencimento = row.vencimento?.trim();
  if (vencimento && parseStrictDueDate(vencimento)) {
    return { label: vencimento, seedForEdit: vencimento };
  }

  return { label: "-", seedForEdit: "" };
}

export function getCurrentDueDateEditorName(): string {
  return FALLBACK_EDITOR_NAME;
}

export function createDueDateManualEditMeta(
  userName = getCurrentDueDateEditorName()
): DueDateManualEditMeta {
  return {
    userName,
    editedAt: new Date().toISOString(),
  };
}

export function formatDueDateManualEditDateTime(editedAt: string): string {
  const date = new Date(editedAt);
  if (Number.isNaN(date.getTime())) return editedAt;

  const datePart = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} às ${timePart}`;
}

function readManualDueDateEdits(): Record<string, StoredManualDueDateEdit> {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(MANUAL_DUE_DATE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, StoredManualDueDateEdit>;
  } catch {
    return {};
  }
}

function writeManualDueDateEdits(edits: Record<string, StoredManualDueDateEdit>): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MANUAL_DUE_DATE_STORAGE_KEY, JSON.stringify(edits));
  } catch {
    // noop
  }
}

export function saveManualDueDateEdit(
  rowId: string,
  vencimento: string,
  meta: DueDateManualEditMeta
): void {
  const edits = readManualDueDateEdits();
  edits[rowId] = { vencimento, meta };
  writeManualDueDateEdits(edits);
}

export function applyStoredManualDueDateEdits(rows: Row[]): Row[] {
  const edits = readManualDueDateEdits();
  if (Object.keys(edits).length === 0) return rows;

  return rows.map((row) => {
    const edit = edits[row.id];
    if (!edit || !parseStrictDueDate(edit.vencimento)) return row;

    return {
      ...row,
      vencimento: edit.vencimento,
      vencimentoEditadoManual: true,
      vencimentoEditadoManualMeta: edit.meta,
    };
  });
}

/**
 * Calcula o número de dias entre a data de emissão e a data de vencimento.
 * Retorna null se não for possível calcular.
 */
export function calculateDaysFromEmissionToVencimento(row: Row): number | null {
  // Tentar obter a data de emissão do primeiro documento associado
  const emissaoDateStr = row.documentosAssociados?.[0]?.data;
  if (!emissaoDateStr) return null;

  const emissaoDate = parseStrictDueDate(emissaoDateStr);
  const vencimentoDate = parseStrictDueDate(row.vencimento);

  if (!emissaoDate || !vencimentoDate) return null;

  // Calcular diferença em dias
  const diffInMs = vencimentoDate.getTime() - emissaoDate.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  // Retornar apenas se for um valor positivo e razoável (entre 1 e 720 dias)
  if (diffInDays > 0 && diffInDays <= MAX_DUE_DATE_RULE_DAYS) {
    return diffInDays;
  }

  return null;
}

/**
 * Retorna o número de dias da regra de vencimento aplicada, se houver.
 * Prioriza o campo explícito vencimentoDiasRegra, depois tenta calcular.
 */
export function getDueDateRuleDays(row: Row): number | null {
  // Se tem o campo explícito, usar ele
  if (row.vencimentoDiasRegra != null && row.vencimentoDiasRegra > 0) {
    return row.vencimentoDiasRegra;
  }

  // Senão, tentar calcular
  return calculateDaysFromEmissionToVencimento(row);
}
