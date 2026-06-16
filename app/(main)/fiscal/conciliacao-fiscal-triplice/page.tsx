"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Download, FileSearch, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tag } from "@/components/ui/tag";
import { BigNumberCard } from "@/components/shared/BigNumberCard";
import { cn } from "@/lib/utils";

type ReconciliationStatus = "Conciliado" | "Divergente" | "Pendente" | "Não Encontrado";

type DebitStatus = "E" | "P";

type ReconciliationDetail =
  | "Divergência de Valores ERP e XML"
  | "Divergência de Valores ERP e Apuração Assistida"
  | "Divergência de Valores XML e Apuração Assistida"
  | "Não encontrado no ERP"
  | "Não encontrado na Qive"
  | "Não encontrado na Apuração Assistida";

type TaxValues = {
  vIBSUF: number;
  vIBSMUN: number;
  vCBS: number;
  debitoIBSMUN: DebitStatus;
  debitoCBS: DebitStatus;
};

type ReconciliationRow = {
  chaveAcesso: string;
  status: ReconciliationStatus;
  detalhamento?: ReconciliationDetail;
  empresa: string;
  filial: string;
  emissao: string;
  tipoDocumento: DocumentType;
  totalNota: number;
  qive: TaxValues | null;
  apuracao: TaxValues | null;
  erp: TaxValues | null;
};

type DocumentType = "CT-e" | "NF-e" | "NFS-e Nacional";

const STATUS_OPTIONS: Array<ReconciliationStatus | "Todos"> = [
  "Todos",
  "Conciliado",
  "Divergente",
  "Pendente",
  "Não Encontrado",
];

const DETAIL_OPTIONS: Array<ReconciliationDetail | "Todos"> = [
  "Todos",
  "Divergência de Valores ERP e XML",
  "Divergência de Valores ERP e Apuração Assistida",
  "Divergência de Valores XML e Apuração Assistida",
  "Não encontrado no ERP",
  "Não encontrado na Qive",
  "Não encontrado na Apuração Assistida",
];

const DOCUMENT_TYPE_OPTIONS: Array<DocumentType | "Todos"> = ["Todos", "NF-e", "CT-e", "NFS-e Nacional"];

const BRANCH_OPTIONS = ["Todas", "Matriz SP", "Filial RJ", "Filial MG"];

const COMPANIES = [
  "Qive Tecnologia Ltda.",
  "Delta Varejo S.A.",
  "Atlântico Transportes Ltda.",
  "Norte Serviços Digitais Ltda.",
];

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateTaxes(totalNota: number): TaxValues {
  return {
    vIBSUF: roundCurrency(totalNota * 0.0005),
    vIBSMUN: roundCurrency(totalNota * 0.0005),
    vCBS: roundCurrency(totalNota * 0.085),
    debitoIBSMUN: "E",
    debitoCBS: "E",
  };
}

function buildNfeOrCteKey(index: number, tipoDocumento: Extract<DocumentType, "NF-e" | "CT-e">): string {
  const cUF = index % 3 === 0 ? "35" : index % 3 === 1 ? "33" : "31";
  const cnpj = String(12345678000190 + index * 137).padStart(14, "0").slice(-14);
  const model = tipoDocumento === "NF-e" ? "55" : "57";
  const serie = String((index % 9) + 1).padStart(3, "0");
  const numero = String(120000 + index * 37).padStart(9, "0");
  const codigo = String(10000000 + index * 7919).padStart(8, "0").slice(-8);
  const base = `${cUF}2606${cnpj}${model}${serie}${numero}1${codigo}`;
  const checkDigit = String([...base].reduce((sum, digit, position) => sum + Number(digit) * ((position % 8) + 2), 0) % 10);

  return `${base}${checkDigit}`;
}

function buildNfseKey(index: number): string {
  const municipalityCode = index % 3 === 0 ? "3550308" : index % 3 === 1 ? "3304557" : "3106200";
  const cnpj = String(22345678000180 + index * 149).padStart(14, "0").slice(-14);
  const number = String(700000000000000 + index * 97).padStart(15, "0");
  const verification = String(20260000000000 + index * 413).padStart(14, "0");

  return `${municipalityCode}${cnpj}${number}${verification}`;
}

function buildDocumentKey(index: number, tipoDocumento: DocumentType): string {
  if (tipoDocumento === "NFS-e Nacional") return buildNfseKey(index);

  return buildNfeOrCteKey(index, tipoDocumento);
}

function applyDetailScenario(baseTaxes: TaxValues, detalhamento?: ReconciliationDetail) {
  const qive = { ...baseTaxes };
  const apuracao = { ...baseTaxes };
  const erp = { ...baseTaxes };
  const mismatchTaxes = {
    vIBSUF: roundCurrency(baseTaxes.vIBSUF * 1.14 + 0.07),
    vIBSMUN: roundCurrency(baseTaxes.vIBSMUN * 0.86 + 0.05),
    vCBS: roundCurrency(baseTaxes.vCBS * 1.08 + 1.37),
    debitoIBSMUN: baseTaxes.debitoIBSMUN,
    debitoCBS: baseTaxes.debitoCBS,
  };

  switch (detalhamento) {
    case "Divergência de Valores ERP e XML":
      return { qive, apuracao: { ...mismatchTaxes }, erp: { ...mismatchTaxes } };
    case "Divergência de Valores ERP e Apuração Assistida":
      return { qive: { ...qive }, apuracao: { ...apuracao }, erp: { ...mismatchTaxes } };
    case "Divergência de Valores XML e Apuração Assistida":
      return { qive, apuracao: { ...mismatchTaxes }, erp: { ...qive } };
    case "Não encontrado no ERP":
      return { qive, apuracao, erp: null };
    case "Não encontrado na Qive":
      return { qive: null, apuracao, erp };
    case "Não encontrado na Apuração Assistida":
      return { qive, apuracao: null, erp };
    default:
      return { qive, apuracao, erp };
  }
}

const DETAIL_SCENARIOS: ReconciliationDetail[] = [
  "Divergência de Valores ERP e XML",
  "Divergência de Valores ERP e Apuração Assistida",
  "Divergência de Valores XML e Apuração Assistida",
  "Não encontrado no ERP",
  "Não encontrado na Qive",
  "Não encontrado na Apuração Assistida",
];

const PENDING_DEBIT_SCENARIOS: Array<Pick<TaxValues, "debitoIBSMUN" | "debitoCBS">> = [
  { debitoIBSMUN: "E", debitoCBS: "P" },
  { debitoIBSMUN: "E", debitoCBS: "P" },
  { debitoIBSMUN: "P", debitoCBS: "P" },
  { debitoIBSMUN: "P", debitoCBS: "P" },
  { debitoIBSMUN: "P", debitoCBS: "E" },
  { debitoIBSMUN: "P", debitoCBS: "E" },
];

const RECONCILIATION_ROWS: ReconciliationRow[] = Array.from({ length: 56 }, (_, index) => {
  const tipoDocumento = (["NF-e", "CT-e", "NFS-e Nacional"] as DocumentType[])[index % 3];
  const pendingDebitScenario = index >= 50 ? PENDING_DEBIT_SCENARIOS[index - 50] : undefined;
  const detalhamento = index >= 35 && index < 50 ? DETAIL_SCENARIOS[(index - 35) % DETAIL_SCENARIOS.length] : undefined;
  const status: ReconciliationStatus = pendingDebitScenario
    ? "Pendente"
    : !detalhamento
      ? "Conciliado"
      : detalhamento.startsWith("Divergência")
        ? "Divergente"
        : "Não Encontrado";
  const totalNota = roundCurrency(450 + ((index * 733) % 28500) + (index % 7) * 84.37);
  const baseTaxes = calculateTaxes(totalNota);
  const taxesWithDebit = pendingDebitScenario ? { ...baseTaxes, ...pendingDebitScenario } : baseTaxes;
  const values = applyDetailScenario(taxesWithDebit, detalhamento);

  return {
    chaveAcesso: buildDocumentKey(index + 1, tipoDocumento),
    status,
    detalhamento,
    empresa: COMPANIES[index % COMPANIES.length],
    filial: BRANCH_OPTIONS[(index % (BRANCH_OPTIONS.length - 1)) + 1],
    emissao: `${String((index % 15) + 1).padStart(2, "0")}/06/2026`,
    tipoDocumento,
    totalNota,
    ...values,
  };
});

const TAX_KEYS = ["vIBSUF", "vIBSMUN", "vCBS"] as const;
const TAX_VALUE_COLUMNS: Array<keyof TaxValues> = ["vIBSUF", "vIBSMUN", "vCBS"];
const ASSISTED_ASSESSMENT_COLUMNS: Array<keyof TaxValues> = ["vIBSUF", "vIBSMUN", "debitoIBSMUN", "vCBS", "debitoCBS"];

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isTaxValueKey(key: keyof TaxValues): key is (typeof TAX_KEYS)[number] {
  return TAX_KEYS.includes(key as (typeof TAX_KEYS)[number]);
}

function getValuesDelta(a: TaxValues | null, b: TaxValues | null): number {
  if (!a || !b) return 0;

  return TAX_KEYS.reduce((highest, key) => {
    const delta = Math.abs(a[key] - b[key]);
    return delta > highest ? delta : highest;
  }, 0);
}

function getApuracaoValues(row: ReconciliationRow): TaxValues | null {
  return row.apuracao;
}

function getMaxDelta(row: ReconciliationRow): number {
  if (!row.qive) return 0;

  return Math.max(getValuesDelta(row.qive, row.erp), getValuesDelta(row.qive, getApuracaoValues(row)));
}

function formatTaxCellValue(values: Partial<Record<keyof TaxValues, number | DebitStatus | null>> | null, key: keyof TaxValues): string {
  const value = values?.[key];

  if (isTaxValueKey(key)) return formatCurrency(value as number | null | undefined);

  return value === "E" || value === "P" ? value : "—";
}

function getStatusTagClasses(status: ReconciliationStatus) {
  if (status === "Conciliado") {
    return {
      bgColor: "bg-[#E8F8EF]",
      textColor: "text-[#137A3A]",
      borderColor: "border-[#B9E8CB]",
    };
  }

  if (status === "Divergente") {
    return {
      bgColor: "bg-[#FDECEC]",
      textColor: "text-[#B42318]",
      borderColor: "border-[#F7C5C2]",
    };
  }

  return {
    bgColor: "bg-[#FFF4D6]",
    textColor: "text-[#946200]",
    borderColor: "border-[#FAD77A]",
  };
}

function StatusTag({ status }: { status: ReconciliationStatus }) {
  return <Tag {...getStatusTagClasses(status)}>{status}</Tag>;
}

function TaxValueCells({
  values,
  columns,
  groupStart = false,
}: {
  values: Partial<Record<keyof TaxValues, number | DebitStatus | null>> | null;
  columns: Array<keyof TaxValues>;
  groupStart?: boolean;
}) {
  return (
    <>
      {columns.map((key, index) => (
        <td
          key={key}
          className={cn(
            "whitespace-nowrap px-3 py-3 text-right text-sm font-medium text-[#0d0f1c]",
            (groupStart || index === 0) && "border-l border-[rgba(4,14,35,0.08)]",
          )}
        >
          {formatTaxCellValue(values, key)}
        </td>
      ))}
    </>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:border-[#0C3CF7] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0C3CF7]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ConciliacaoFiscalTriplicePage() {
  const [statusFilter, setStatusFilter] = React.useState<string>("Todos");
  const [branchFilter, setBranchFilter] = React.useState("Todas");
  const [documentTypeFilter, setDocumentTypeFilter] = React.useState<string>("Todos");
  const [detailFilter, setDetailFilter] = React.useState<string>("Todos");
  const [search, setSearch] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<ReconciliationRow | null>(null);

  const filteredRows = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return RECONCILIATION_ROWS.filter((row) => {
      const matchesStatus = statusFilter === "Todos" || row.status === statusFilter;
      const matchesBranch = branchFilter === "Todas" || row.filial === branchFilter;
      const matchesDocumentType = documentTypeFilter === "Todos" || row.tipoDocumento === documentTypeFilter;
      const matchesDetail = detailFilter === "Todos" || row.detalhamento === detailFilter;
      const matchesSearch =
        !normalizedSearch ||
        row.chaveAcesso.toLowerCase().includes(normalizedSearch) ||
        row.filial.toLowerCase().includes(normalizedSearch) ||
        row.status.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesBranch && matchesDocumentType && matchesDetail && matchesSearch;
    });
  }, [branchFilter, detailFilter, documentTypeFilter, search, statusFilter]);

  const metrics = React.useMemo(() => {
    const totalOk = RECONCILIATION_ROWS.filter((row) => row.status === "Conciliado").length;
    const totalDivergencias = RECONCILIATION_ROWS.filter(
      (row) => row.status === "Divergente",
    ).length;
    const totalPendentes = RECONCILIATION_ROWS.filter(
      (row) => row.status === "Pendente",
    ).length;
    const totalLimbo = RECONCILIATION_ROWS.filter(
      (row) => row.status === "Não Encontrado",
    ).length;

    return {
      totalChaves: RECONCILIATION_ROWS.length,
      totalOk,
      totalDivergencias,
      totalPendentes,
      totalLimbo,
    };
  }, []);

  const selectedDifferences = selectedRow
    ? TAX_KEYS.flatMap((key) => {
        const xmlValue = selectedRow.qive?.[key] ?? null;
        const erpValue = selectedRow.erp?.[key] ?? null;
        const apuracaoValue = selectedRow.apuracao?.[key] ?? null;
        const erpDelta = xmlValue === null || erpValue === null ? null : xmlValue - erpValue;
        const apuracaoDelta = xmlValue === null || apuracaoValue === null ? null : xmlValue - apuracaoValue;

        return [
          { origin: "Apuração Assistida", key, expected: xmlValue, current: apuracaoValue, delta: apuracaoDelta },
          { origin: "ERP", key, expected: xmlValue, current: erpValue, delta: erpDelta },
        ].filter((item) => item.expected === null || item.current === null || Math.abs(item.delta ?? 0) > 0.009);
      })
    : [];

  return (
    <section className="space-y-4 p-3 lg:p-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#0C3CF7]">Conciliação fiscal</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">
            Conciliação Fiscal (IBS / CBS)
          </h1>
          <p className="max-w-3xl text-sm text-[#5B616F]">
            Compare de forma rápida e prática os valores dos XMLs capturados pela Qive, dados da apuração assistida e escrituração do ERP.
          </p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </header>

      <Card className="rounded-xl border border-[rgba(4,14,35,0.08)] bg-white">
        <CardContent className="grid gap-4 p-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="periodo">Período</Label>
            <Input id="periodo" type="text" value="01/06/2026 - 30/06/2026" readOnly />
          </div>
          <SelectField id="filial" label="Filial" value={branchFilter} onChange={setBranchFilter} options={BRANCH_OPTIONS} />
          <SelectField id="status" label="Status do Batimento" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          <SelectField id="detalhamento" label="Detalhamento" value={detailFilter} onChange={setDetailFilter} options={DETAIL_OPTIONS} />
          <SelectField id="tipo-documento" label="Tipo de documento" value={documentTypeFilter} onChange={setDocumentTypeFilter} options={DOCUMENT_TYPE_OPTIONS} />
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <BigNumberCard value={metrics.totalChaves} label="Documentos Processados" disableWhenZero={false} />
        <BigNumberCard value={metrics.totalOk} label="Documentos Conciliados" disableWhenZero={false} className="bg-[#F7FCF9]" />
        <BigNumberCard value={metrics.totalDivergencias} label="Documentos Divergentes" disableWhenZero={false} className="bg-[#FFF8F8]" />
        <BigNumberCard value={metrics.totalPendentes} label="Documentos Pendentes" disableWhenZero={false} className="bg-[#FFFBF0]" />
        <BigNumberCard value={metrics.totalLimbo} label="Documentos Não Encontrados" disableWhenZero={false} className="bg-[#FFFBF0]" />
      </div>

      <Card className="overflow-hidden rounded-xl border border-[rgba(4,14,35,0.08)] bg-white">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(4,14,35,0.08)] p-4">
            <div>
              <h2 className="text-base font-bold text-[#0d0f1c]">Listagem de documentos conciliados</h2>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A90A0]" />
              <Input
                aria-label="Buscar chave, filial ou status"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                placeholder="Buscar chave, filial ou status"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[rgba(4,14,35,0.08)] bg-[#F8F9FB] text-left text-xs font-bold uppercase tracking-wide text-[#5B616F]">
                  <th rowSpan={2} className="w-[280px] px-3 py-3">Chave de Acesso</th>
                  <th rowSpan={2} className="w-[180px] px-3 py-3">Status</th>
                  <th colSpan={TAX_VALUE_COLUMNS.length} className="border-l border-[rgba(4,14,35,0.08)] px-3 py-3 text-center">Qive (XML)</th>
                  <th colSpan={ASSISTED_ASSESSMENT_COLUMNS.length} className="border-l border-[rgba(4,14,35,0.08)] px-3 py-3 text-center">Apuração Assistida</th>
                  <th colSpan={TAX_VALUE_COLUMNS.length} className="border-l border-[rgba(4,14,35,0.08)] px-3 py-3 text-center">ERP (Escrituração)</th>
                  <th rowSpan={2} className="border-l border-[rgba(4,14,35,0.08)] px-3 py-3 text-right">Divergência</th>
                </tr>
                <tr className="border-b border-[rgba(4,14,35,0.08)] bg-[#F8F9FB] text-xs font-bold text-[#5B616F]">
                  {[TAX_VALUE_COLUMNS, ASSISTED_ASSESSMENT_COLUMNS, TAX_VALUE_COLUMNS].map((columns, groupIndex) =>
                    columns.map((key, index) => (
                      <th
                        key={`${groupIndex}-${key}`}
                        className={cn(
                          "px-3 py-2 text-right",
                          index === 0 && "border-l border-[rgba(4,14,35,0.08)]",
                        )}
                      >
                        {key === "debitoIBSMUN" || key === "debitoCBS" ? "Débito" : key}
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const isActionable = row.status !== "Conciliado";
                  return (
                    <tr
                      key={row.chaveAcesso}
                      className={cn(
                        "border-b border-[rgba(4,14,35,0.08)] transition-colors last:border-b-0 hover:bg-[#FAFAFF]",
                        isActionable && "cursor-pointer",
                      )}
                      onClick={() => {
                        if (isActionable) setSelectedRow(row);
                      }}
                    >
                      <td className="px-3 py-3 align-top">
                        <div className="font-mono text-xs font-semibold text-[#0d0f1c]">{row.chaveAcesso}</div>
                        <div className="mt-1 text-xs text-[#5B616F]">emissão {row.emissao} · {row.tipoDocumento}</div>
                      </td>
                      <td className="px-3 py-3 align-top"><StatusTag status={row.status} /></td>
                      <TaxValueCells values={row.qive} columns={TAX_VALUE_COLUMNS} groupStart />
                      <TaxValueCells values={row.apuracao} columns={ASSISTED_ASSESSMENT_COLUMNS} groupStart />
                      <TaxValueCells values={row.erp} columns={TAX_VALUE_COLUMNS} groupStart />
                      <td className="whitespace-nowrap border-l border-[rgba(4,14,35,0.08)] px-3 py-3 text-right font-bold text-[#0d0f1c]">
                        {formatCurrency(getMaxDelta(row))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[rgba(4,14,35,0.08)] px-4 py-3 text-sm text-[#5B616F]">
            <span>{filteredRows.length} documentos exibidos</span>
            <span>Página 1 de 1</span>
          </div>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <SheetContent>
          <SheetHeader>
            <div>
              <SheetTitle>De → Para da divergência</SheetTitle>
              <SheetDescription>Detalhamento por origem e campo fiscal do documento selecionado.</SheetDescription>
            </div>
            <SheetClose asChild>
              <Button variant="secondary" size="sm">Fechar</Button>
            </SheetClose>
          </SheetHeader>

          {selectedRow && (
            <div className="space-y-4 p-4">
              <div className="rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFBFC] p-3">
                <div className="mb-2 flex items-center gap-2">
                  {selectedRow.status === "Divergente" ? (
                    <AlertTriangle className="h-4 w-4 text-[#B42318]" />
                  ) : (
                    <FileSearch className="h-4 w-4 text-[#946200]" />
                  )}
                  <StatusTag status={selectedRow.status} />
                </div>
                <p className="font-mono text-xs font-semibold text-[#0d0f1c]">{selectedRow.chaveAcesso}</p>
                <p className="mt-1 text-sm text-[#5B616F]">{selectedRow.empresa} · {selectedRow.filial}</p>
              </div>

              {selectedDifferences.length > 0 ? (
                <div className="space-y-3">
                  {selectedDifferences.map((difference) => (
                    <div key={`${difference.origin}-${difference.key}`} className="rounded-lg border border-[rgba(4,14,35,0.08)] p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#0d0f1c]">{difference.origin} · {difference.key}</p>
                          <p className="text-xs text-[#5B616F]">Comparação contra Qive (XML)</p>
                        </div>
                        <Tag bgColor="bg-[#FDECEC]" textColor="text-[#B42318]" borderColor="border-[#F7C5C2]">
                          Δ {formatCurrency(Math.abs(difference.delta ?? difference.expected ?? 0))}
                        </Tag>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md bg-[#F8F9FB] p-3">
                          <p className="text-xs font-semibold uppercase text-[#5B616F]">XML aponta</p>
                          <p className="mt-1 text-lg font-bold text-[#0d0f1c]">{formatCurrency(difference.expected)}</p>
                        </div>
                        <div className="rounded-md bg-[#FFF8F8] p-3">
                          <p className="text-xs font-semibold uppercase text-[#5B616F]">{difference.origin} informou</p>
                          <p className="mt-1 text-lg font-bold text-[#0d0f1c]">{formatCurrency(difference.current)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-lg border border-[#B9E8CB] bg-[#F7FCF9] p-3 text-sm text-[#137A3A]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  Nenhuma divergência identificada para a chave selecionada.
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
