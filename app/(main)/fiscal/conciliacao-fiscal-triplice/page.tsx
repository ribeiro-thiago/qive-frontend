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

type ReconciliationStatus =
  | "Conciliado"
  | "Divergência de Valores"
  | "Não Encontrado na Qive"
  | "Não Encontrado no ERP"
  | "Não Encontrado no IBS"
  | "Não Encontrado no CBS"
  | "Não Encontrado na Apuração Assistida";

type TaxValues = {
  vIBSUF: number;
  vIBSMUN: number;
  vCBS: number;
};

type ReconciliationRow = {
  chaveAcesso: string;
  status: ReconciliationStatus;
  empresa: string;
  filial: string;
  emissao: string;
  tipoDocumento: DocumentType;
  qive: TaxValues | null;
  apuracaoIbs: Pick<TaxValues, "vIBSUF" | "vIBSMUN"> | null;
  apuracaoCbs: Pick<TaxValues, "vCBS"> | null;
  erp: TaxValues | null;
};

type DocumentType = "CT-e" | "NF-e" | "NFS-e Nacional";

const STATUS_OPTIONS: Array<ReconciliationStatus | "Todos"> = [
  "Todos",
  "Conciliado",
  "Divergência de Valores",
  "Não Encontrado na Qive",
  "Não Encontrado no ERP",
  "Não Encontrado no IBS",
  "Não Encontrado no CBS",
  "Não Encontrado na Apuração Assistida",
];

const DOCUMENT_TYPE_OPTIONS: Array<DocumentType | "Todos"> = ["Todos", "NF-e", "CT-e", "NFS-e Nacional"];

const BRANCH_OPTIONS = ["Todas", "Matriz SP", "Filial RJ", "Filial MG"];

const RECONCILIATION_ROWS: ReconciliationRow[] = [
  {
    chaveAcesso: "35260601234567000199550010001234891000010018",
    status: "Conciliado",
    empresa: "Qive Tecnologia Ltda.",
    filial: "Matriz SP",
    emissao: "04/06/2026",
    tipoDocumento: "NF-e",
    qive: { vIBSUF: 42.18, vIBSMUN: 18.06, vCBS: 128.42 },
    apuracaoIbs: { vIBSUF: 42.18, vIBSMUN: 18.06 },
    apuracaoCbs: { vCBS: 128.42 },
    erp: { vIBSUF: 42.18, vIBSMUN: 18.06, vCBS: 128.42 },
  },
  {
    chaveAcesso: "33260608444412000175570010009988771000054821",
    status: "Divergência de Valores",
    empresa: "Qive Tecnologia Ltda.",
    filial: "Filial RJ",
    emissao: "05/06/2026",
    tipoDocumento: "CT-e",
    qive: { vIBSUF: 88.9, vIBSMUN: 31.1, vCBS: 241.7 },
    apuracaoIbs: { vIBSUF: 88.9, vIBSMUN: 31.1 },
    apuracaoCbs: { vCBS: 241.7 },
    erp: { vIBSUF: 80.9, vIBSMUN: 31.1, vCBS: 219.7 },
  },
  {
    chaveAcesso: "35503081234567800019900000000001234567012345678901",
    status: "Não Encontrado no ERP",
    empresa: "Qive Tecnologia Ltda.",
    filial: "Filial MG",
    emissao: "06/06/2026",
    tipoDocumento: "NFS-e Nacional",
    qive: { vIBSUF: 16.34, vIBSMUN: 7.88, vCBS: 59.32 },
    apuracaoIbs: { vIBSUF: 16.34, vIBSMUN: 7.88 },
    apuracaoCbs: { vCBS: 59.32 },
    erp: null,
  },
  {
    chaveAcesso: "35260609102030400091550010002200341000037806",
    status: "Não Encontrado na Apuração Assistida",
    empresa: "Qive Tecnologia Ltda.",
    filial: "Matriz SP",
    emissao: "07/06/2026",
    tipoDocumento: "NF-e",
    qive: { vIBSUF: 55.12, vIBSMUN: 14.2, vCBS: 173.87 },
    apuracaoIbs: null,
    apuracaoCbs: null,
    erp: { vIBSUF: 55.12, vIBSMUN: 14.2, vCBS: 173.87 },
  },
  {
    chaveAcesso: "33260610456789000181570010007766541000123402",
    status: "Não Encontrado no IBS",
    empresa: "Qive Tecnologia Ltda.",
    filial: "Filial RJ",
    emissao: "08/06/2026",
    tipoDocumento: "CT-e",
    qive: { vIBSUF: 102.44, vIBSMUN: 47.18, vCBS: 305.7 },
    apuracaoIbs: null,
    apuracaoCbs: { vCBS: 305.7 },
    erp: { vIBSUF: 102.44, vIBSMUN: 47.18, vCBS: 305.7 },
  },
  {
    chaveAcesso: "35503081234567800019900000000001234567012345678902",
    status: "Não Encontrado no CBS",
    empresa: "Qive Tecnologia Ltda.",
    filial: "Filial MG",
    emissao: "09/06/2026",
    tipoDocumento: "NFS-e Nacional",
    qive: { vIBSUF: 24.1, vIBSMUN: 9.4, vCBS: 77.8 },
    apuracaoIbs: { vIBSUF: 24.1, vIBSMUN: 9.4 },
    apuracaoCbs: null,
    erp: { vIBSUF: 24.1, vIBSMUN: 9.4, vCBS: 77.8 },
  },
  {
    chaveAcesso: "35260601987654000123550010000043211000098765",
    status: "Não Encontrado na Qive",
    empresa: "Qive Tecnologia Ltda.",
    filial: "Matriz SP",
    emissao: "10/06/2026",
    tipoDocumento: "NF-e",
    qive: null,
    apuracaoIbs: { vIBSUF: 61.2, vIBSMUN: 22.4 },
    apuracaoCbs: { vCBS: 184.55 },
    erp: { vIBSUF: 61.2, vIBSMUN: 22.4, vCBS: 184.55 },
  },
];

const TAX_KEYS: Array<keyof TaxValues> = ["vIBSUF", "vIBSMUN", "vCBS"];

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getValuesDelta(a: TaxValues | null, b: TaxValues | null): number {
  if (!a || !b) return 0;

  return TAX_KEYS.reduce((highest, key) => {
    const delta = Math.abs(a[key] - b[key]);
    return delta > highest ? delta : highest;
  }, 0);
}

function getApuracaoValues(row: ReconciliationRow): TaxValues | null {
  if (!row.apuracaoIbs || !row.apuracaoCbs) return null;

  return {
    vIBSUF: row.apuracaoIbs.vIBSUF,
    vIBSMUN: row.apuracaoIbs.vIBSMUN,
    vCBS: row.apuracaoCbs.vCBS,
  };
}

function getApuracaoDisplayValues(row: ReconciliationRow): Partial<Record<keyof TaxValues, number | null>> | null {
  if (!row.apuracaoIbs && !row.apuracaoCbs) return null;

  return {
    vIBSUF: row.apuracaoIbs?.vIBSUF ?? null,
    vIBSMUN: row.apuracaoIbs?.vIBSMUN ?? null,
    vCBS: row.apuracaoCbs?.vCBS ?? null,
  };
}

function getMaxDelta(row: ReconciliationRow): number {
  if (!row.qive) return 0;

  return Math.max(getValuesDelta(row.qive, row.erp), getValuesDelta(row.qive, getApuracaoValues(row)));
}

function getStatusTagClasses(status: ReconciliationStatus) {
  if (status === "Conciliado") {
    return {
      bgColor: "bg-[#E8F8EF]",
      textColor: "text-[#137A3A]",
      borderColor: "border-[#B9E8CB]",
    };
  }

  if (status === "Divergência de Valores") {
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

function TaxValueCells({ values, groupStart = false }: { values: Partial<Record<keyof TaxValues, number | null>> | null; groupStart?: boolean }) {
  return (
    <>
      {TAX_KEYS.map((key, index) => (
        <td
          key={key}
          className={cn(
            "whitespace-nowrap px-3 py-3 text-right text-sm font-medium text-[#0d0f1c]",
            (groupStart || index === 0) && "border-l border-[rgba(4,14,35,0.08)]",
          )}
        >
          {formatCurrency(values?.[key])}
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
  const [search, setSearch] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<ReconciliationRow | null>(null);

  const filteredRows = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return RECONCILIATION_ROWS.filter((row) => {
      const matchesStatus = statusFilter === "Todos" || row.status === statusFilter;
      const matchesBranch = branchFilter === "Todas" || row.filial === branchFilter;
      const matchesDocumentType = documentTypeFilter === "Todos" || row.tipoDocumento === documentTypeFilter;
      const matchesSearch =
        !normalizedSearch ||
        row.chaveAcesso.toLowerCase().includes(normalizedSearch) ||
        row.filial.toLowerCase().includes(normalizedSearch) ||
        row.status.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesBranch && matchesDocumentType && matchesSearch;
    });
  }, [branchFilter, documentTypeFilter, search, statusFilter]);

  const metrics = React.useMemo(() => {
    const totalOk = RECONCILIATION_ROWS.filter((row) => row.status === "Conciliado").length;
    const totalDivergencias = RECONCILIATION_ROWS.filter(
      (row) => row.status === "Divergência de Valores",
    ).length;
    const totalLimbo = RECONCILIATION_ROWS.filter(
      (row) => row.status.startsWith("Não Encontrado"),
    ).length;

    return {
      totalChaves: RECONCILIATION_ROWS.length,
      totalOk,
      totalDivergencias,
      totalLimbo,
    };
  }, []);

  const selectedDifferences = selectedRow
    ? TAX_KEYS.flatMap((key) => {
        const xmlValue = selectedRow.qive?.[key] ?? null;
        const erpValue = selectedRow.erp?.[key] ?? null;
        const apuracaoValue = getApuracaoDisplayValues(selectedRow)?.[key] ?? null;
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
            Conciliação Fiscal Tríplice (IBS / CBS)
          </h1>
          <p className="max-w-3xl text-sm text-[#5B616F]">
            Compare valores capturados pela Qive no XML, escrituração do ERP e dados de apuração assistida para priorizar divergências fiscais.
          </p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </header>

      <Card className="rounded-xl border border-[rgba(4,14,35,0.08)] bg-white">
        <CardContent className="grid gap-4 p-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="periodo">Período</Label>
            <Input id="periodo" type="text" value="01/06/2026 - 30/06/2026" readOnly />
          </div>
          <SelectField id="filial" label="Filial" value={branchFilter} onChange={setBranchFilter} options={BRANCH_OPTIONS} />
          <SelectField id="status" label="Status do Batimento" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          <SelectField id="tipo-documento" label="Tipo de documento" value={documentTypeFilter} onChange={setDocumentTypeFilter} options={DOCUMENT_TYPE_OPTIONS} />
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <BigNumberCard value={metrics.totalChaves} label="Documentos Processados" disableWhenZero={false} />
        <BigNumberCard value={metrics.totalOk} label="Documentos Conciliados" disableWhenZero={false} className="bg-[#F7FCF9]" />
        <BigNumberCard value={metrics.totalDivergencias} label="Divergência de Valores" disableWhenZero={false} className="bg-[#FFF8F8]" />
        <BigNumberCard value={metrics.totalLimbo} label="Documentos Não Encontrados" disableWhenZero={false} className="bg-[#FFFBF0]" />
      </div>

      <Card className="overflow-hidden rounded-xl border border-[rgba(4,14,35,0.08)] bg-white">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(4,14,35,0.08)] p-4">
            <div>
              <h2 className="text-base font-bold text-[#0d0f1c]">Grid de detalhes da chave</h2>
              <p className="text-sm text-[#5B616F]">Clique em uma linha com divergência para abrir o De → Para.</p>
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
            <table className="w-full min-w-[1280px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[rgba(4,14,35,0.08)] bg-[#F8F9FB] text-left text-xs font-bold uppercase tracking-wide text-[#5B616F]">
                  <th rowSpan={2} className="w-[280px] px-3 py-3">Chave de Acesso</th>
                  <th rowSpan={2} className="w-[180px] px-3 py-3">Status</th>
                  <th colSpan={3} className="border-l border-[rgba(4,14,35,0.08)] px-3 py-3 text-center">Qive (XML)</th>
                  <th colSpan={3} className="border-l border-[rgba(4,14,35,0.08)] px-3 py-3 text-center">Apuração Assistida</th>
                  <th colSpan={3} className="border-l border-[rgba(4,14,35,0.08)] px-3 py-3 text-center">ERP (Escrituração)</th>
                  <th rowSpan={2} className="border-l border-[rgba(4,14,35,0.08)] px-3 py-3 text-right">Divergência</th>
                </tr>
                <tr className="border-b border-[rgba(4,14,35,0.08)] bg-[#F8F9FB] text-xs font-bold text-[#5B616F]">
                  {Array.from({ length: 3 }).map((_, groupIndex) =>
                    TAX_KEYS.map((key, index) => (
                      <th
                        key={`${groupIndex}-${key}`}
                        className={cn(
                          "px-3 py-2 text-right",
                          index === 0 && "border-l border-[rgba(4,14,35,0.08)]",
                        )}
                      >
                        {key}
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
                      <TaxValueCells values={row.qive} groupStart />
                      <TaxValueCells values={getApuracaoDisplayValues(row)} groupStart />
                      <TaxValueCells values={row.erp} groupStart />
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
                  {selectedRow.status === "Divergência de Valores" ? (
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
