"use client";

import * as React from "react";
import { startOfDay, parse } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { ProductToolbar } from "@/components/layout/ProductToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, Upload, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { companies } from "@/components/layout/CompanySelector";
import { useFeatures } from "@/lib/features/useFeatures";
import { formatCurrency, parseDate } from "../gestao-de-pagamentos/utils/formatters";
import {
  initialComprovantesRows,
  type ComprovanteRow,
} from "./data/mock-comprovantes";
import {
  ComprovantesAdvancedFilters,
  emptyComprovantesAdvancedFilters,
  type ComprovantesAdvancedFiltersState,
} from "./components/ComprovantesAdvancedFilters";
import { CapturaAutomaticaModal } from "./components/CapturaAutomaticaModal";
import { ComprovanteVisualizacaoModal } from "./components/ComprovanteVisualizacaoModal";
import { UploadManualModal } from "./components/UploadManualModal";

const ASSOCIACAO_LABEL_COM_CONTA = "Comprovante com conta associada";
const ASSOCIACAO_LABEL_SEM_CONTA = "Comprovante sem conta associada";
const ASSOCIACAO_TABLE_LABEL_COM_CONTA = "Conta associada";
const ASSOCIACAO_TABLE_LABEL_SEM_CONTA = "Sem conta associada";

const ASSOCIACAO_OPTIONS = [
  "Todos os comprovantes",
  ASSOCIACAO_LABEL_COM_CONTA,
  ASSOCIACAO_LABEL_SEM_CONTA,
] as const;

function getAssociacaoDisplayLabel(status: ComprovanteRow["status"]): string {
  return status === "Associado"
    ? ASSOCIACAO_TABLE_LABEL_COM_CONTA
    : ASSOCIACAO_TABLE_LABEL_SEM_CONTA;
}

const ORIGEM_OPTIONS = ["Todas as origens", "Envio manual", "Captura automática"] as const;

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function parseFilterDateBoundary(s: string): Date | null {
  if (!s || s.length !== 10) return null;
  try {
    return startOfDay(parse(s, "dd/MM/yyyy", new Date()));
  } catch {
    return null;
  }
}

function matchesCompany(row: ComprovanteRow, selectedCompany: string[]): boolean {
  if (selectedCompany.includes("all")) return true;
  const selectedCnpjs = companies
    .filter((c) => selectedCompany.includes(c.id))
    .map((c) => c.cnpj)
    .filter(Boolean) as string[];
  if (selectedCnpjs.length === 0) return true;
  const rowDigits = onlyDigits(row.cnpjPagador);
  return selectedCnpjs.some((cnpj) => onlyDigits(cnpj) === rowDigits);
}

function matchesQuery(row: ComprovanteRow, query: string): boolean {
  const q = query.trim();
  if (!q) return true;
  const lower = q.toLowerCase();
  const qDigits = onlyDigits(q);
  const nameMatch = row.nomeBeneficiario.toLowerCase().includes(lower);
  const cnpjBMatch =
    row.cnpjBeneficiario.toLowerCase().includes(lower) ||
    (qDigits.length >= 2 && onlyDigits(row.cnpjBeneficiario).includes(qDigits));
  const cnpjPMatch =
    row.cnpjPagador.toLowerCase().includes(lower) ||
    (qDigits.length >= 2 && onlyDigits(row.cnpjPagador).includes(qDigits));
  return nameMatch || cnpjBMatch || cnpjPMatch;
}

function matchesAssociacao(row: ComprovanteRow, value: string): boolean {
  if (value === "Todos os comprovantes") return true;
  if (value === ASSOCIACAO_LABEL_COM_CONTA) return row.status === "Associado";
  if (value === ASSOCIACAO_LABEL_SEM_CONTA) return row.status === "Não associado";
  return true;
}

function matchesOrigem(row: ComprovanteRow, value: string): boolean {
  if (value === "Todas as origens") return true;
  return row.origem === value;
}

function matchesAdvanced(row: ComprovanteRow, f: ComprovantesAdvancedFiltersState): boolean {
  if (f.beneficiario && row.nomeBeneficiario !== f.beneficiario) return false;
  if (f.pagador && row.nomePagador !== f.pagador) return false;
  if (f.banco && row.banco !== f.banco) return false;

  const rowDay = parseDate(row.dataPgto);
  const start = f.pagamentoInicio ? parseFilterDateBoundary(f.pagamentoInicio) : null;
  if (start) {
    if (!rowDay) return false;
    if (startOfDay(rowDay) < start) return false;
  }
  const end = f.pagamentoAte ? parseFilterDateBoundary(f.pagamentoAte) : null;
  if (end) {
    if (!rowDay) return false;
    if (startOfDay(rowDay) > end) return false;
  }

  if (f.valorMinimo) {
    const min = parseFloat(f.valorMinimo);
    if (!Number.isNaN(min) && row.valorTotal < min) return false;
  }
  if (f.valorMaximo) {
    const max = parseFloat(f.valorMaximo);
    if (!Number.isNaN(max) && row.valorTotal > max) return false;
  }
  return true;
}

function hasAdvancedFiltersApplied(f: ComprovantesAdvancedFiltersState): boolean {
  return (
    f.beneficiario !== "" ||
    f.pagador !== "" ||
    f.banco !== "" ||
    f.pagamentoInicio !== "" ||
    f.pagamentoAte !== "" ||
    f.valorMinimo !== "" ||
    f.valorMaximo !== ""
  );
}

export default function PageComprovantes() {
  const { isFeatureEnabled } = useFeatures();
  const multiCompanySelectionEnabled = isFeatureEnabled(
    "gestao-de-pagamentos.multi-company-selection"
  );

  const [rows] = React.useState<ComprovanteRow[]>(() => [...initialComprovantesRows]);
  const [selectedCompany, setSelectedCompany] = React.useState<string[]>(["all"]);
  const [query, setQuery] = React.useState("");
  const [associacao, setAssociacao] = React.useState<string>("Todos os comprovantes");
  const [origem, setOrigem] = React.useState<string>("Todas as origens");
  const [selection, setSelection] = React.useState<Set<string>>(new Set());

  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [appliedAdvanced, setAppliedAdvanced] = React.useState<ComprovantesAdvancedFiltersState>(
    () => emptyComprovantesAdvancedFilters()
  );
  const [tempAdvanced, setTempAdvanced] = React.useState<ComprovantesAdvancedFiltersState>(
    () => emptyComprovantesAdvancedFilters()
  );

  const [capturaModalOpen, setCapturaModalOpen] = React.useState(false);
  const [uploadManualModalOpen, setUploadManualModalOpen] = React.useState(false);
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [selectedComprovante, setSelectedComprovante] = React.useState<ComprovanteRow | null>(
    null
  );

  React.useEffect(() => {
    if (!multiCompanySelectionEnabled && selectedCompany.includes("all")) {
      setSelectedCompany(["matriz"]);
    }
  }, [multiCompanySelectionEnabled, selectedCompany]);

  React.useEffect(() => {
    if (filtersOpen) {
      setTempAdvanced(appliedAdvanced);
    }
  }, [filtersOpen, appliedAdvanced]);

  const handleApplyAdvanced = React.useCallback(() => {
    setAppliedAdvanced(tempAdvanced);
    setFiltersOpen(false);
  }, [tempAdvanced]);

  const handleClearAdvanced = React.useCallback(() => {
    const empty = emptyComprovantesAdvancedFilters();
    setTempAdvanced(empty);
    setAppliedAdvanced(empty);
  }, []);

  const filteredRows = React.useMemo(() => {
    return rows.filter(
      (r) =>
        matchesCompany(r, selectedCompany) &&
        matchesQuery(r, query) &&
        matchesAssociacao(r, associacao) &&
        matchesOrigem(r, origem) &&
        matchesAdvanced(r, appliedAdvanced)
    );
  }, [rows, selectedCompany, query, associacao, origem, appliedAdvanced]);

  const allSelected = filteredRows.length > 0 && filteredRows.every((r) => selection.has(r.id));
  const hasSelection = selection.size > 0;

  const toggleRow = (id: string, on?: boolean) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (on === undefined) {
        next.has(id) ? next.delete(id) : next.add(id);
      } else if (on) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const headRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (headRef.current) headRef.current.indeterminate = hasSelection && !allSelected;
  }, [hasSelection, allSelected]);

  React.useEffect(() => {
    setSelection(new Set());
  }, [query, associacao, origem, selectedCompany, appliedAdvanced]);

  const companyNarrowing =
    multiCompanySelectionEnabled &&
    !selectedCompany.includes("all") &&
    selectedCompany.length > 0;

  const advancedApplied = hasAdvancedFiltersApplied(appliedAdvanced);

  const hasActiveFilters =
    query.trim() !== "" ||
    associacao !== "Todos os comprovantes" ||
    origem !== "Todas as origens" ||
    companyNarrowing ||
    advancedApplied;

  const showEmptyFiltered = filteredRows.length === 0 && rows.length > 0;
  const showEmptyNoData = rows.length === 0;

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">Listagem de comprovantes</h1>
      <ProductToolbar
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        multiCompanySelectionEnabled={multiCompanySelectionEnabled}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="default"
              variant="secondary"
              className="font-bold inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar Comprovantes
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
          >
            <DropdownMenuItem onClick={() => setCapturaModalOpen(true)}>
              Configurar captura automática
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUploadManualModalOpen(true)}>
              Upload manual
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ProductToolbar>

      <CapturaAutomaticaModal open={capturaModalOpen} onOpenChange={setCapturaModalOpen} />
      <UploadManualModal
        open={uploadManualModalOpen}
        onOpenChange={setUploadManualModalOpen}
      />
      <ComprovanteVisualizacaoModal
        open={viewModalOpen}
        onOpenChange={(open) => {
          setViewModalOpen(open);
          if (!open) setSelectedComprovante(null);
        }}
        comprovante={selectedComprovante}
      />

      <Card className="rounded-xl bg-white border border-border mt-4">
        <CardContent className="p-0">
          <div className="w-full space-y-4 px-4 pt-4 pb-4">
            <div className="flex w-full flex-wrap items-end gap-3 mb-0">
              <div className="min-w-[200px] flex-1 basis-[min(100%,280px)]">
                <Label className="mb-1 block text-sm font-semibold" style={{ color: "#5F6572" }}>
                  Busca
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Ex: CNPJ, razão social, ..."
                    className="w-full pr-9 shadow-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="shrink-0 w-full min-w-[min(100%,22rem)] sm:w-auto sm:min-w-[22rem] md:min-w-[24rem]">
                <Label className="mb-1 block text-sm font-semibold" style={{ color: "#5F6572" }}>
                  Associação
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 w-full min-w-0 justify-between px-3 shadow-none font-bold hover:bg-[#EFF1F2]"
                    >
                      <span
                        className={cn(
                          "t-text-sm text-left whitespace-nowrap",
                          associacao === "Todos os comprovantes" && "text-muted-foreground"
                        )}
                      >
                        {associacao}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[var(--radix-dropdown-menu-trigger-width)]">
                    {ASSOCIACAO_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt}
                        className="whitespace-nowrap"
                        onClick={() => setAssociacao(opt)}
                      >
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="w-full shrink-0 sm:w-[200px] sm:min-w-[200px]">
                <Label className="mb-1 block text-sm font-semibold" style={{ color: "#5F6572" }}>
                  Origem
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold hover:bg-[#EFF1F2]"
                    >
                      <span
                        className={cn(
                          "t-text-sm truncate",
                          origem === "Todas as origens" && "text-muted-foreground"
                        )}
                      >
                        {origem}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)]"
                  >
                    {ORIGEM_OPTIONS.map((opt) => (
                      <DropdownMenuItem key={opt} onClick={() => setOrigem(opt)}>
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="shrink-0">
                <Button
                  variant="secondary"
                  size="default"
                  className="inline-flex items-center gap-2 font-bold"
                  type="button"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </div>
            </div>

            <ComprovantesAdvancedFilters
              isOpen={filtersOpen}
              filters={tempAdvanced}
              onFiltersChange={setTempAdvanced}
              onApply={handleApplyAdvanced}
              onClear={handleClearAdvanced}
              availableRows={rows}
              appliedFilters={appliedAdvanced}
            />
          </div>

          <div className="h-px bg-[#EBECEE]" />

          {!showEmptyNoData && (
            <div className="mt-4 mb-4 flex items-center gap-2 px-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="default"
                  type="button"
                  className="inline-flex items-center gap-2 font-normal text-[#5F6572]"
                  onClick={() =>
                    setSelection(
                      allSelected ? new Set() : new Set(filteredRows.map((r) => r.id))
                    )
                  }
                >
                  Selecionar todos
                  <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#EAEBEC] text-sm text-current tabular-nums min-w-[56px]">
                    {selection.size}/{filteredRows.length}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={!hasSelection}
                  className="inline-flex items-center gap-2 font-normal text-[#5F6572] shadow-none hover:bg-[#EFF1F2]"
                >
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-b-xl">
            {showEmptyNoData ? (
              <div className="py-12 px-4 text-center text-sm text-[#5F6572]">
                Não há comprovantes cadastrados.
              </div>
            ) : (
              <table className="w-full text-sm table-fixed text-[#5F6572] font-normal">
                <colgroup>
                  <col className="w-10" />
                  <col className="w-[120px]" />
                  <col className="w-[110px]" />
                  <col className="w-[110px]" />
                  <col className="w-[200px]" />
                  <col className="w-[150px]" />
                  <col className="w-[140px]" />
                  <col className="w-[140px]" />
                  <col className="w-[150px]" />
                </colgroup>
                <thead>
                  <tr className="h-11 border-b border-border text-left bg-[#F5F5F6]">
                    <th className="w-10 pl-3 pr-2 text-center">
                      <input
                        ref={headRef}
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 mx-auto"
                        checked={allSelected}
                        onChange={(e) => {
                          const on = e.currentTarget.checked;
                          setSelection(on ? new Set(filteredRows.map((r) => r.id)) : new Set());
                        }}
                      />
                    </th>
                    <th className="px-3 py-2 font-normal text-[#5F6572]">Comprovante</th>
                    <th className="px-3 py-2 font-normal text-[#5F6572]">Pago em</th>
                    <th className="px-3 py-2 font-normal text-[#5F6572]">Valor Total</th>
                    <th className="px-3 py-2 font-normal text-[#5F6572]">Nome do beneficiário</th>
                    <th className="px-3 py-2 font-normal text-[#5F6572]">CNPJ do beneficiário</th>
                    <th className="px-3 py-2 font-normal text-[#5F6572]">Origem</th>
                    <th className="px-3 py-2 font-normal text-[#5F6572]">Associação</th>
                    <th className="px-3 py-2 font-normal text-[#5F6572]">CNPJ/CPF do pagador</th>
                  </tr>
                </thead>
                <tbody>
                  {showEmptyFiltered ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-12 text-center">
                        <p className="text-base font-normal text-[#5F6572]">
                          Nenhum comprovante encontrado
                        </p>
                        {hasActiveFilters && (
                          <p className="mt-1 text-sm text-[#5F6572]">
                            Ajuste a busca ou os filtros para ver mais resultados.
                          </p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r) => {
                      const isSel = selection.has(r.id);
                      return (
                        <tr
                          key={r.id}
                          className={cn(
                            "border-b border-border last:border-b-0 transition-colors",
                            isSel ? "bg-[#F3F5FF]" : "hover:bg-[#FAFAFF]"
                          )}
                        >
                          <td className="pl-3 pr-2 py-3 align-middle text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 mx-auto"
                              checked={isSel}
                              onChange={(e) => toggleRow(r.id, e.currentTarget.checked)}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <Button
                              type="button"
                              variant="secondary"
                              size="default"
                              className="font-normal text-[#5F6572]"
                              onClick={() => {
                                setSelectedComprovante(r);
                                setViewModalOpen(true);
                              }}
                            >
                              Ver
                            </Button>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap truncate">
                            {r.dataPgto}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                            {formatCurrency(r.valorTotal)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap truncate">
                            {r.nomeBeneficiario}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap truncate">
                            {r.cnpjBeneficiario}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center h-6 px-2 rounded-full border font-medium text-xs",
                                "bg-[#F7F8F9] text-[#5F6572] border-[#EAEBEC]"
                              )}
                            >
                              {r.origem}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm">
                              <span
                                className={cn(
                                  "h-2 w-2 shrink-0 rounded-full",
                                  r.status === "Associado" ? "bg-emerald-500" : "bg-[#C4C8CE]"
                                )}
                                aria-hidden
                              />
                              {getAssociacaoDisplayLabel(r.status)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap truncate">
                            {r.cnpjPagador}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
