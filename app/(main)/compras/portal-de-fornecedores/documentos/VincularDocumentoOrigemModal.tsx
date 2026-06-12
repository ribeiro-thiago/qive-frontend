"use client";

import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_CHECKBOX_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import { PortalOrigemTipoTag } from "../components/PortalTags";
import { MOCK_VINCULO_FRS, MOCK_VINCULO_PO } from "./data/mock-documentos-origem";
import {
  fetchVinculoOrigemRows,
  submitVinculoDocumentoOrigem,
  type OrigemSearchCriterion,
} from "./lib/vinculo-documento-actions";
import type {
  DocumentoOrigemFrsItem,
  DocumentoOrigemRastreabilidade,
  DocumentoOrigemTipo,
  DocumentoOrigemVinculo,
  VinculoOrigemTableRow,
} from "./types";

const INPUT_ALERT_CLASS =
  "border-[#F59E0B] shadow-none focus-visible:ring-[#F59E0B]";

const TABLE_NUMERIC_CLASS = "px-3 py-3 text-right tabular-nums whitespace-nowrap";

const VINCULAR_ORIGEM_TABLE_MIN_WIDTH = 1476;

const NA_CELL = <span className={cn("text-xs", TABLE_SECONDARY_TEXT_CLASS)}>-</span>;

const SEARCH_CRITERIA: {
  value: OrigemSearchCriterion;
  label: string;
  placeholder: string;
}[] = [
  { value: "po", label: "PO", placeholder: "Busque por PO" },
  { value: "frs", label: "FRS", placeholder: "Busque por FRS" },
  {
    value: "descricao-item",
    label: "Descrição",
    placeholder: "Busque por Descrição",
  },
  {
    value: "numero-documento",
    label: "Nº do Documento",
    placeholder: "Busque por Nº do Documento",
  },
  { value: "material", label: "Material", placeholder: "Busque por Material" },
  { value: "codigo", label: "Código", placeholder: "Busque por Código" },
];

const SEARCH_INPUT_FALLBACK_PLACEHOLDER =
  "Busque por descrição, número do documento, material...";

type RastreabilidadeDraft = Partial<DocumentoOrigemRastreabilidade>;

type FrsWizardStep = 1 | 2;

type VincularDocumentoOrigemModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (vinculos: DocumentoOrigemVinculo[]) => void;
  initialVinculos?: DocumentoOrigemVinculo[];
};

function buildInitialStateFromVinculos(vinculos: DocumentoOrigemVinculo[]) {
  const selectedRowIds = vinculos.map((vinculo) => vinculo.origemId);
  const frsRastreabilidadeDrafts = vinculos.reduce<Record<string, RastreabilidadeDraft>>(
    (acc, vinculo) => {
      if (vinculo.rastreabilidade) {
        acc[vinculo.origemId] = { ...vinculo.rastreabilidade };
      }
      return acc;
    },
    {},
  );

  return { selectedRowIds, frsRastreabilidadeDrafts };
}

function parsePtBrDateString(value: string): Date | undefined {
  const parsed = parse(value.trim(), "dd/MM/yyyy", new Date());
  return isValid(parsed) ? parsed : undefined;
}

function formatPtBrDateString(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

function isRastreabilidadeDraftComplete(draft: RastreabilidadeDraft): boolean {
  return Boolean(
    draft.loteProduto?.trim() &&
      draft.dataFabricacao?.trim() &&
      draft.dataVencimento?.trim(),
  );
}

function getFrsRastreabilidadeFieldValue(
  frs: DocumentoOrigemFrsItem,
  draft: RastreabilidadeDraft,
  field: keyof DocumentoOrigemRastreabilidade,
): string {
  if (!frs.rastreabilidadeMode) return "";
  if (frs.rastreabilidadeMode === "complete") {
    return (draft[field] ?? frs.rastreabilidade?.[field] ?? "").trim();
  }
  return (draft[field] ?? "").trim();
}

function getFrsStepFieldValue(
  frs: DocumentoOrigemFrsItem,
  draft: RastreabilidadeDraft,
  field: keyof DocumentoOrigemRastreabilidade,
): string {
  return getFrsRastreabilidadeFieldValue(frs, draft, field);
}

function mergeFrsRastreabilidade(
  frs: DocumentoOrigemFrsItem,
  draft: RastreabilidadeDraft,
): RastreabilidadeDraft {
  const base: DocumentoOrigemRastreabilidade = frs.rastreabilidade ?? {
    loteProduto: "",
    dataFabricacao: "",
    dataVencimento: "",
  };
  return {
    loteProduto: draft.loteProduto ?? base.loteProduto,
    dataFabricacao: draft.dataFabricacao ?? base.dataFabricacao,
    dataVencimento: draft.dataVencimento ?? base.dataVencimento,
  };
}

function getRowId(row: VinculoOrigemTableRow): string {
  return row.data.id;
}

function canConfirmRow(
  row: VinculoOrigemTableRow | null,
  draft: RastreabilidadeDraft,
): boolean {
  if (!row) return false;
  if (row.tipo === "PO") return true;
  const frs = row.data;
  if (!frs.rastreabilidadeMode) return true;
  if (frs.rastreabilidadeMode === "complete") {
    return isRastreabilidadeDraftComplete(mergeFrsRastreabilidade(frs, draft));
  }
  return isRastreabilidadeDraftComplete(draft);
}

function canConfirmSelectedRows(
  selectedRowIds: string[],
  results: VinculoOrigemTableRow[],
  frsRastreabilidadeDrafts: Record<string, RastreabilidadeDraft>,
): boolean {
  if (selectedRowIds.length === 0) return false;

  return selectedRowIds.every((rowId) => {
    const row = results.find((item) => getRowId(item) === rowId);
    if (!row) return false;

    const draft =
      row.tipo === "FRS" ? (frsRastreabilidadeDrafts[row.data.id] ?? {}) : {};

    return canConfirmRow(row, draft);
  });
}

function needsFrsRastreabilidadeStep(
  selectedRowIds: string[],
  results: VinculoOrigemTableRow[],
  options?: { isEditing?: boolean },
): boolean {
  const isEditing = options?.isEditing ?? false;

  return selectedRowIds.some((rowId) => {
    const row = results.find((item) => getRowId(item) === rowId);
    if (row?.tipo !== "FRS") return false;

    if (row.data.rastreabilidadeMode === "incomplete") return true;

    return isEditing && row.data.rastreabilidadeMode === "complete";
  });
}

function getSelectedFrsRows(
  selectedRowIds: string[],
  results: VinculoOrigemTableRow[],
): { row: Extract<VinculoOrigemTableRow, { tipo: "FRS" }>; rowId: string }[] {
  return selectedRowIds.flatMap((rowId) => {
    const row = results.find((item) => getRowId(item) === rowId);
    if (row?.tipo === "FRS") {
      return [{ row, rowId }];
    }
    return [];
  });
}

function buildVinculoFromRow(
  row: VinculoOrigemTableRow,
  draft: RastreabilidadeDraft,
): DocumentoOrigemVinculo {
  if (row.tipo === "PO") {
    const item = row.data;
    return {
      origemId: item.id,
      tipo: "PO",
      numeroDocumento: item.docCompra,
      item: item.item,
      codigo: item.material,
      descricao: item.textoInfo,
    };
  }

  const item = row.data;
  const rastreabilidade =
    item.rastreabilidadeMode === "complete"
      ? (() => {
          const merged = mergeFrsRastreabilidade(item, draft);
          return isRastreabilidadeDraftComplete(merged)
            ? {
                loteProduto: merged.loteProduto!.trim(),
                dataFabricacao: merged.dataFabricacao!.trim(),
                dataVencimento: merged.dataVencimento!.trim(),
              }
            : undefined;
        })()
      : item.rastreabilidadeMode === "incomplete" && isRastreabilidadeDraftComplete(draft)
        ? {
            loteProduto: draft.loteProduto!.trim(),
            dataFabricacao: draft.dataFabricacao!.trim(),
            dataVencimento: draft.dataVencimento!.trim(),
          }
        : undefined;

  return {
    origemId: item.id,
    tipo: "FRS",
    numeroDocumento: item.numeroFrs,
    item: item.item,
    codigo: item.codigo,
    descricao: item.descricao,
    rastreabilidade,
  };
}

function OrigemSearchBar({
  criterion,
  onCriterionChange,
  query,
  onQueryChange,
}: {
  criterion: OrigemSearchCriterion | null;
  onCriterionChange: (value: OrigemSearchCriterion | null) => void;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const active = criterion
    ? SEARCH_CRITERIA.find((option) => option.value === criterion)
    : null;
  const inputPlaceholder = active?.placeholder ?? SEARCH_INPUT_FALLBACK_PLACEHOLDER;

  const handleSelect = (optionValue: OrigemSearchCriterion) => {
    onCriterionChange(criterion === optionValue ? null : optionValue);
    setIsOpen(false);
  };

  return (
    <div className="flex w-full items-stretch">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Critério de busca"
            aria-expanded={isOpen}
            className={cn(
              "inline-flex h-9 min-w-[148px] shrink-0 items-center justify-between gap-2 border bg-white px-3 text-sm font-medium shadow-none transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-0",
              isOpen
                ? "relative z-[1] rounded-tl-lg rounded-tr-none rounded-br-none rounded-bl-none border-[#0C3CF7] text-[#3D4350]"
                : cn(
                    "rounded-l-lg",
                    active
                      ? "border-[rgba(4,14,35,0.12)] text-[#3D4350]"
                      : "border-[rgba(4,14,35,0.12)] text-[#8A90A0]",
                  ),
            )}
          >
            <span className="truncate">{active?.label ?? "Selecione"}</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[90] w-[var(--radix-popover-trigger-width)] rounded-b-lg rounded-t-none border border-t-0 border-[#0C3CF7] p-1 shadow-md"
          align="start"
          sideOffset={0}
        >
          <ul role="listbox" aria-label="Critério de busca">
            {SEARCH_CRITERIA.map((option) => {
              const isActive = criterion === option.value;
              return (
                <li key={option.value} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-[#EEF2FF] font-medium text-[#3D4350]"
                        : "text-[#3D4350] hover:bg-[#F5F5F6]",
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={inputPlaceholder}
        className={cn(
          "h-9 min-w-0 flex-1 rounded-l-none rounded-r-lg border border-[rgba(4,14,35,0.12)] text-sm shadow-none",
          isOpen && "border-l-[#0C3CF7]",
        )}
      />
    </div>
  );
}

function OrigemTableDatePicker({
  value,
  placeholder,
  disabled,
  showAlert,
  onChange,
  id,
  className,
}: {
  value: string;
  placeholder: string;
  disabled: boolean;
  showAlert: boolean;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const date = parsePtBrDateString(value);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-8 min-w-[132px] justify-start px-2 text-left text-xs font-normal shadow-none",
            !value && "text-[#8A90A0]",
            showAlert && INPUT_ALERT_CLASS,
            disabled && "bg-[#FAFAFB] text-[#8A90A0]",
            className,
          )}
        >
          <CalendarIcon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{value || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[90] w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) => {
            onChange(formatPtBrDateString(selected));
            setIsOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function FrsRastreabilidadeTableCell({
  frs,
  field,
  draft,
}: {
  frs: DocumentoOrigemFrsItem;
  field: keyof DocumentoOrigemRastreabilidade;
  draft: RastreabilidadeDraft;
}) {
  if (!frs.rastreabilidadeMode) return NA_CELL;

  const value = getFrsRastreabilidadeFieldValue(frs, draft, field);
  if (!value) return NA_CELL;

  return <span className="text-xs text-[#3D4350] whitespace-nowrap">{value}</span>;
}

function FrsRastreabilidadeStepPanel({
  items,
  drafts,
  onDraftChange,
  firstLoteInputRef,
}: {
  items: { row: Extract<VinculoOrigemTableRow, { tipo: "FRS" }>; rowId: string }[];
  drafts: Record<string, RastreabilidadeDraft>;
  onDraftChange: (rowId: string, patch: Partial<DocumentoOrigemRastreabilidade>) => void;
  firstLoteInputRef: React.RefObject<HTMLInputElement>;
}) {
  const firstEditableIndex = items.findIndex(
    ({ row }) => row.data.rastreabilidadeMode === "incomplete",
  );

  return (
    <div className="py-1">
      <p className="mb-4 text-sm text-[#5B616F]">
        Preencha os dados de rastreabilidade das FRS selecionadas para concluir o vínculo.
      </p>
      <div className="space-y-4">
        {items.map(({ row, rowId }, index) => {
          const frs = row.data;
          const showRastreabilidade = Boolean(frs.rastreabilidadeMode);
          const draft = drafts[frs.id] ?? {};
          const loteValue = getFrsStepFieldValue(frs, draft, "loteProduto");
          const fabricacaoValue = getFrsStepFieldValue(frs, draft, "dataFabricacao");
          const vencimentoValue = getFrsStepFieldValue(frs, draft, "dataVencimento");
          const loteEmpty = showRastreabilidade && frs.rastreabilidadeMode === "incomplete" && !loteValue.trim();
          const fabricacaoEmpty =
            showRastreabilidade && frs.rastreabilidadeMode === "incomplete" && !fabricacaoValue.trim();
          const vencimentoEmpty =
            showRastreabilidade && frs.rastreabilidadeMode === "incomplete" && !vencimentoValue.trim();
          const isEditable = frs.rastreabilidadeMode === "incomplete";
          const loteId = `frs-lote-${frs.id}`;
          const fabricacaoId = `frs-fabricacao-${frs.id}`;
          const vencimentoId = `frs-vencimento-${frs.id}`;
          const focusLote = index === firstEditableIndex;

          return (
            <div
              key={rowId}
              className="rounded-lg border border-[rgba(4,14,35,0.08)] bg-white p-4"
            >
              <div className={cn("space-y-1", showRastreabilidade && "mb-4")}>
                <div className="flex flex-wrap items-center gap-2">
                  <PortalOrigemTipoTag tipo="FRS" />
                  <p className="text-sm font-semibold text-[#0d0f1c]">
                    FRS {frs.numeroFrs}
                  </p>
                </div>
                <p className="text-xs text-[#5B616F]">{frs.descricao}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7E8698]">
                  <span>Item {frs.item}</span>
                  <span>Código {frs.codigo}</span>
                  <span>Qtde {frs.qtde}</span>
                  <span>Preço {frs.precoLiquido}</span>
                  <span>Saldo {frs.saldo}</span>
                  <span>UMP {frs.ump}</span>
                </div>
              </div>

              {showRastreabilidade && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={loteId} className="text-xs font-semibold text-[#3D4350]">
                      Lote
                    </Label>
                    <Input
                      ref={focusLote ? firstLoteInputRef : undefined}
                      id={loteId}
                      value={loteValue}
                      maxLength={20}
                      onChange={(event) =>
                        onDraftChange(frs.id, { loteProduto: event.target.value })
                      }
                      placeholder="Digite o Lote"
                      disabled={!isEditable}
                      className={cn(
                        "h-9 text-sm shadow-none",
                        loteEmpty && INPUT_ALERT_CLASS,
                        !isEditable && "bg-[#FAFAFB] text-[#8A90A0]",
                      )}
                      aria-invalid={loteEmpty}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor={fabricacaoId}
                      className="text-xs font-semibold text-[#3D4350]"
                    >
                      Data de Fabricação
                    </Label>
                    <OrigemTableDatePicker
                      id={fabricacaoId}
                      value={fabricacaoValue}
                      placeholder="DD/MM/AAAA"
                      disabled={!isEditable}
                      showAlert={fabricacaoEmpty}
                      className="h-9 w-full min-w-0 text-sm"
                      onChange={(value) =>
                        onDraftChange(frs.id, { dataFabricacao: value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor={vencimentoId}
                      className="text-xs font-semibold text-[#3D4350]"
                    >
                      Data de Vencimento
                    </Label>
                    <OrigemTableDatePicker
                      id={vencimentoId}
                      value={vencimentoValue}
                      placeholder="DD/MM/AAAA"
                      disabled={!isEditable}
                      showAlert={vencimentoEmpty}
                      className="h-9 w-full min-w-0 text-sm"
                      onChange={(value) =>
                        onDraftChange(frs.id, { dataVencimento: value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VincularDocumentoOrigemModal({
  open,
  onOpenChange,
  onConfirm,
  initialVinculos = [],
}: VincularDocumentoOrigemModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchCriterion, setSearchCriterion] =
    React.useState<OrigemSearchCriterion | null>(null);
  const [results, setResults] = React.useState<VinculoOrigemTableRow[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [frsRastreabilidadeDrafts, setFrsRastreabilidadeDrafts] = React.useState<
    Record<string, RastreabilidadeDraft>
  >({});
  const [frsWizardStep, setFrsWizardStep] = React.useState<FrsWizardStep>(1);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const searchRequestRef = React.useRef(0);
  const firstLoteInputRef = React.useRef<HTMLInputElement>(null);

  const isEditing = initialVinculos.length > 0;
  const requiresFrsWizard = needsFrsRastreabilidadeStep(selectedRowIds, results, {
    isEditing,
  });
  const isFrsWizardStep2 = requiresFrsWizard && frsWizardStep === 2;
  const selectedFrsRows = getSelectedFrsRows(selectedRowIds, results);

  const canAdd = canConfirmSelectedRows(
    selectedRowIds,
    results,
    frsRastreabilidadeDrafts,
  );
  const canAdvance = selectedRowIds.length > 0;

  React.useEffect(() => {
    if (!open) return;

    const initialState =
      initialVinculos.length > 0
        ? buildInitialStateFromVinculos(initialVinculos)
        : { selectedRowIds: [] as string[], frsRastreabilidadeDrafts: {} as Record<string, RastreabilidadeDraft> };

    setSearchQuery("");
    setSearchCriterion(null);
    setSelectedRowIds(initialState.selectedRowIds);
    setFrsRastreabilidadeDrafts(initialState.frsRastreabilidadeDrafts);
    setFrsWizardStep(
      initialVinculos.length > 0 &&
        needsFrsRastreabilidadeStep(
          initialState.selectedRowIds,
          [
            ...MOCK_VINCULO_PO.map((data) => ({ tipo: "PO" as const, data })),
            ...MOCK_VINCULO_FRS.map((data) => ({ tipo: "FRS" as const, data })),
          ],
          { isEditing: true },
        )
        ? 2
        : 1,
    );
    setIsSubmitting(false);
    setResults([
      ...MOCK_VINCULO_PO.map((data) => ({ tipo: "PO" as const, data })),
      ...MOCK_VINCULO_FRS.map((data) => ({ tipo: "FRS" as const, data })),
    ]);
  }, [open, initialVinculos]);

  React.useEffect(() => {
    if (!open) return;

    const requestId = ++searchRequestRef.current;
    setIsSearching(true);

    const timeoutId = window.setTimeout(() => {
      void fetchVinculoOrigemRows(searchQuery, searchCriterion).then((rows) => {
        if (requestId !== searchRequestRef.current) return;
        setResults(rows);
        setIsSearching(false);
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [open, searchQuery, searchCriterion]);

  React.useEffect(() => {
    if (frsWizardStep === 2 && !requiresFrsWizard) {
      setFrsWizardStep(1);
    }
  }, [frsWizardStep, requiresFrsWizard]);

  React.useEffect(() => {
    if (!isFrsWizardStep2) return;

    const timeoutId = window.setTimeout(() => {
      firstLoteInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isFrsWizardStep2, selectedFrsRows.length]);

  const handleFrsDraftChange = (rowId: string, patch: Partial<DocumentoOrigemRastreabilidade>) => {
    setFrsRastreabilidadeDrafts((current) => ({
      ...current,
      [rowId]: { ...current[rowId], ...patch },
    }));
  };

  const toggleRowSelection = (rowId: string, checked: boolean) => {
    setSelectedRowIds((current) => {
      if (checked) {
        return current.includes(rowId) ? current : [...current, rowId];
      }

      return current.filter((id) => id !== rowId);
    });

    if (!checked) {
      setFrsRastreabilidadeDrafts((current) => {
        if (!(rowId in current)) return current;
        const next = { ...current };
        delete next[rowId];
        return next;
      });
    }
  };

  const handleAdvance = () => {
    if (!canAdvance || isSubmitting) return;
    setFrsWizardStep(2);
  };

  const handleBack = () => {
    setFrsWizardStep(1);
  };

  const handleConfirm = async () => {
    if (!canAdd || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const vinculos = selectedRowIds.map((rowId) => {
        const row = results.find((item) => getRowId(item) === rowId);
        if (!row) {
          throw new Error(`Linha selecionada não encontrada: ${rowId}`);
        }

        const draft =
          row.tipo === "FRS" ? (frsRastreabilidadeDrafts[row.data.id] ?? {}) : {};

        return buildVinculoFromRow(row, draft);
      });

      await submitVinculoDocumentoOrigem(vinculos);
      onConfirm(vinculos);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "z-[80] flex h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0",
          "max-w-none translate-x-0 translate-y-0",
          "rounded-xl shadow-2xl",
        )}
        style={{
          top: "24px",
          left: "24px",
          right: "24px",
          width: "calc(100vw - 48px)",
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogDescription className="sr-only">
          {isFrsWizardStep2
            ? "Informe os dados de rastreabilidade das folhas de registro de serviço selecionadas"
            : "Selecione um ou mais pedidos de compra ou folhas de registro de serviço para vincular ao item do documento"}
        </DialogDescription>

        <div className="shrink-0 border-b border-[rgba(4,14,35,0.08)] bg-white">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <div className="min-w-0">
              <DialogTitle className="text-[20px] font-bold leading-tight text-[#0d0f1c]">
                {isFrsWizardStep2 ? "Vincular FRS" : "Vincular Documento de Origem"}
              </DialogTitle>
              {requiresFrsWizard && (
                <p className="mt-1 text-xs text-[#8A90A0]">
                  Etapa {frsWizardStep} de 2
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isFrsWizardStep2 && (
          <div className="shrink-0 px-5 py-3">
            <OrigemSearchBar
              criterion={searchCriterion}
              onCriterionChange={setSearchCriterion}
              query={searchQuery}
              onQueryChange={setSearchQuery}
            />
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-3">
          {isFrsWizardStep2 ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <FrsRastreabilidadeStepPanel
                items={selectedFrsRows}
                drafts={frsRastreabilidadeDrafts}
                onDraftChange={handleFrsDraftChange}
                firstLoteInputRef={firstLoteInputRef}
              />
            </div>
          ) : (
            <div className="relative min-h-0 flex-1 overflow-auto border border-border">
              {isSearching && (
                <div
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60"
                  aria-hidden
                >
                  <Loader2 className="h-5 w-5 animate-spin text-[#5B616F]" />
                </div>
              )}

              <table
                className="w-full table-fixed text-sm"
                style={{ minWidth: VINCULAR_ORIGEM_TABLE_MIN_WIDTH }}
              >
                <colgroup>
                  <col className="w-10" />
                  <col className="w-[72px]" />
                  <col className="w-[108px]" />
                  <col className="w-[240px]" />
                  <col className="w-[64px]" />
                  <col className="w-[120px]" />
                  <col className="w-[96px]" />
                  <col className="w-[88px]" />
                  <col className="w-[112px]" />
                  <col className="w-[88px]" />
                  <col className="w-[72px]" />
                  <col className="w-[120px]" />
                  <col className="w-[128px]" />
                  <col className="w-[128px]" />
                </colgroup>
                <thead className="sticky top-0 z-[1]">
                  <tr className={TABLE_HEAD_ROW_CLASS}>
                    <th className="pl-3 pr-2" aria-label="Selecionar documento" />
                    <th className={TABLE_HEAD_CELL_CLASS}>Tipo</th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                      Nº do Documento
                    </th>
                    <th className={TABLE_HEAD_CELL_CLASS}>Descrição</th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "text-right")}>Item</th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Material</th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Código</th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, TABLE_NUMERIC_CLASS)}>Qtde</th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, TABLE_NUMERIC_CLASS)}>
                      Preço Líquido
                    </th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, TABLE_NUMERIC_CLASS)}>Saldo</th>
                    <th className={TABLE_HEAD_CELL_CLASS}>UMP</th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Lote</th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                      Data Fabricação
                    </th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                      Data Vencimento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-3 py-12 text-center">
                        <p className="text-base font-semibold text-[#0d0f1c]">
                          Nenhum documento encontrado para a busca informada.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    results.map((row) => {
                      const rowId = getRowId(row);
                      const isSelected = selectedRowIds.includes(rowId);
                      const isPo = row.tipo === "PO";
                      const po = isPo ? row.data : null;
                      const frs = !isPo ? row.data : null;
                      const draft = frs ? (frsRastreabilidadeDrafts[frs.id] ?? {}) : {};

                      return (
                        <tr
                          key={rowId}
                          className={cn(
                            TABLE_BODY_ROW_CLASS,
                            isSelected && "bg-[#F3F5FF] hover:bg-[#F3F5FF]",
                          )}
                        >
                          <td className="py-3 pl-3 pr-2 text-center align-middle">
                            <input
                              type="checkbox"
                              aria-label={`Selecionar ${row.tipo} ${isPo ? po!.docCompra : frs!.numeroFrs}`}
                              checked={isSelected}
                              onChange={(event) => {
                                toggleRowSelection(rowId, event.target.checked);
                              }}
                              className={TABLE_CHECKBOX_CLASS}
                            />
                          </td>
                          <td className={TABLE_BODY_CELL_CLASS}>
                            <PortalOrigemTipoTag tipo={row.tipo} />
                          </td>
                          <td
                            className={cn(
                              TABLE_BODY_CELL_CLASS,
                              "font-semibold whitespace-nowrap",
                              TABLE_PRIMARY_TEXT_CLASS,
                            )}
                          >
                            {isPo ? po!.docCompra : frs!.numeroFrs}
                          </td>
                          <td className={cn(TABLE_BODY_CELL_CLASS, "text-xs leading-5", TABLE_SECONDARY_TEXT_CLASS)}>
                            {isPo ? po!.textoInfo : frs!.descricao}
                          </td>
                          <td className={TABLE_NUMERIC_CLASS}>
                            {isPo ? po!.item : frs!.item}
                          </td>
                          <td className={cn(TABLE_BODY_CELL_CLASS, "whitespace-nowrap", TABLE_SECONDARY_TEXT_CLASS)}>
                            {isPo ? po!.material : NA_CELL}
                          </td>
                          <td className={cn(TABLE_BODY_CELL_CLASS, "whitespace-nowrap", TABLE_SECONDARY_TEXT_CLASS)}>
                            {frs ? frs.codigo : NA_CELL}
                          </td>
                          <td className={TABLE_NUMERIC_CLASS}>
                            {isPo ? po!.qtdePedido : frs!.qtde}
                          </td>
                          <td className={TABLE_NUMERIC_CLASS}>
                            {isPo ? po!.precoLiquido : frs!.precoLiquido}
                          </td>
                          <td className={TABLE_NUMERIC_CLASS}>
                            {isPo ? po!.saldo : frs!.saldo}
                          </td>
                          <td className={cn(TABLE_BODY_CELL_CLASS, TABLE_PRIMARY_TEXT_CLASS)}>
                            {isPo ? po!.ump : frs!.ump}
                          </td>
                          <td className={cn(TABLE_BODY_CELL_CLASS, "align-middle")}>
                            {frs ? (
                              <FrsRastreabilidadeTableCell
                                frs={frs}
                                field="loteProduto"
                                draft={draft}
                              />
                            ) : (
                              NA_CELL
                            )}
                          </td>
                          <td className={cn(TABLE_BODY_CELL_CLASS, "align-middle")}>
                            {frs ? (
                              <FrsRastreabilidadeTableCell
                                frs={frs}
                                field="dataFabricacao"
                                draft={draft}
                              />
                            ) : (
                              NA_CELL
                            )}
                          </td>
                          <td className={cn(TABLE_BODY_CELL_CLASS, "align-middle")}>
                            {frs ? (
                              <FrsRastreabilidadeTableCell
                                frs={frs}
                                field="dataVencimento"
                                draft={draft}
                              />
                            ) : (
                              NA_CELL
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[rgba(4,14,35,0.08)] bg-white px-5 py-4">
          {isFrsWizardStep2 && (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto h-9 px-4 text-sm font-semibold text-[#3D4350] hover:bg-transparent hover:text-[#0d0f1c]"
              disabled={isSubmitting}
              onClick={handleBack}
            >
              Voltar
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-4 text-sm font-semibold text-[#3D4350] hover:bg-transparent hover:text-[#0d0f1c]"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          {isFrsWizardStep2 || !requiresFrsWizard ? (
            <Button
              type="button"
              className="h-9 px-5 text-sm font-semibold"
              disabled={!canAdd || isSubmitting}
              onClick={() => void handleConfirm()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  {isEditing ? "Salvando..." : "Adicionando..."}
                </>
              ) : isEditing ? (
                "Salvar"
              ) : (
                "Adicionar"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              className="h-9 px-5 text-sm font-semibold"
              disabled={!canAdvance || isSubmitting}
              onClick={handleAdvance}
            >
              Avançar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
