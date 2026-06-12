"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { format, isValid, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DataTableFilters } from "@/components/shared/DataTableFilters";
import { DataTableActions } from "@/components/shared/DataTableActions";
import { Tabs } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChevronDown, FileText, MessageSquareText, Plus, Upload, X, CalendarIcon, Trash2 } from "lucide-react";
import { AdicionarFornecedorModal } from "./cadastro/AdicionarFornecedorModal";
import { CadastroTabContent } from "./cadastro/CadastroTabContent";
import { FORNECEDOR_ROWS_INICIAIS } from "./cadastro/data/fornecedores-iniciais";
import type { FornecedorRow } from "./cadastro/types";
import { IndicadoresTabContent } from "./indicadores/IndicadoresTabContent";
import { AprovarDocumentosConfirmModal } from "./documentos/AprovarDocumentosConfirmModal";
import { DocumentoModal, type DocumentoModalTabId } from "./documentos/DocumentoModal";
import { DocumentoMensagensModal } from "./documentos/DocumentoMensagensModal";
import { DocumentoTableRowHoverActions } from "./documentos/DocumentoTableRowHoverActions";
import { downloadPortalDocumento } from "./documentos/lib/anexo-actions";
import { toast } from "sonner";
import { ACCOUNT_OPTIONS, DEFAULT_ACCOUNT_OPTION, type AccountOption } from "./data/account-options";
import { PORTAL_DOCUMENTO_ROWS_INICIAIS } from "./documentos/data/mock-documentos";
import type { DocumentoComprovanteStatus, PortalDocumentoRow } from "./documentos/types";
import {
  getPortalPageTitleFromPathname,
  getPortalTipoDocumentoFromPathname,
  portalImportPathFromTab,
  type PortalImportSegment,
} from "./lib/portal-paths";
import {
  getPortalDocumentoSearchOptions,
  type PortalDocumentoSearchField,
} from "./lib/portal-documento-search";
import { getPortalDocumentoNumeroColumnLabel } from "./lib/portal-documento-labels";
import { ListingTablePagination } from "@/components/shared/ListingTablePagination";
import { useListingPagination } from "@/components/shared/ListingTablePagination/useListingPagination";
import {
  TABLE_CHECKBOX_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import {
  PortalDocumentoEtapaTag,
  PortalDocumentoSituacaoDfeTag,
} from "./components/PortalTags";
import {
  DOCUMENTO_TABLE_BODY_CELL_CLASS,
  DOCUMENTO_TABLE_CHECKBOX_BODY_CELL_CLASS,
  DOCUMENTO_TABLE_CHECKBOX_HEAD_CELL_CLASS,
  DOCUMENTO_TABLE_COLUMN_WIDTH,
  DOCUMENTO_TABLE_HEAD_BG_CLASS,
  DOCUMENTO_TABLE_FILLER_BODY_CELL_CLASS,
  DOCUMENTO_TABLE_FILLER_HEAD_CELL_CLASS,
  DOCUMENTO_TABLE_HEAD_CELL_CLASS,
  getDocumentoTableMinWidth,
} from "./documentos/lib/documento-table-layout";
import { getDocumentoSituacaoDfe } from "./documentos/lib/documento-situacao-dfe";

function isDocumentoComprovanteStatus(status: string): status is DocumentoComprovanteStatus {
  return status === "Pago" || status === "Agendado";
}

const PATH_TO_TAB: Record<string, string> = {
  documentos: "documentos",
  nfe: "documentos",
  nfse: "documentos",
  cte: "documentos",
  "cte-os": "documentos",
  cadastro: "lista",
  indicadores: "dados-analiticos",
};

const TIPO_DOCUMENTO_OPTIONS = ["NF-e", "NFS-e", "CT-e", "MDF-e", "CF-e SAT", "NFC-e"];

const STATUS_PORTAL_OPTIONS = [
  "Não Iniciado",
  "Aguar. aprovação",
  "Liberado",
  "Processamento",
  "Lançado",
  "Agendado",
  "Pago",
  "Bloqueado",
  "Cancelado",
];

const ETAPA_TO_STATUS_PORTAL: Record<string, string> = {
  "nao iniciados": "Não Iniciado",
  "nao iniciado": "Não Iniciado",
  "em aprovacao": "Aguar. aprovação",
  "liberados": "Liberado",
  "processamento": "Processamento",
  "lancados": "Lançado",
  "agendados": "Agendado",
  "pagos": "Pago",
  "pendencia pedido": "Bloqueado",
  "cancelados": "Cancelado",
};

const STATUS_PORTAL_TO_ETAPA: Record<string, string> = {
  "Não Iniciado": "Não iniciados",
  "Aguar. aprovação": "Em aprovação",
  "Liberado": "Liberados",
  "Processamento": "Processamento",
  "Lançado": "Lançados",
  "Agendado": "Agendados",
  "Pago": "Pagos",
  "Bloqueado": "Pendencia pedido",
  "Cancelado": "Cancelados",
};

function applyStatusPortalToDocumento(
  row: PortalDocumentoRow,
  statusPortal: string
): PortalDocumentoRow {
  const etapa = STATUS_PORTAL_TO_ETAPA[statusPortal] ?? row.etapa;

  if (isDocumentoComprovanteStatus(statusPortal)) {
    const comprovante = row.comprovante
      ? { ...row.comprovante, status: statusPortal }
      : row.comprovante;
    return { ...row, etapa, comprovante };
  }

  return { ...row, etapa, comprovante: null };
}

const STATUS_TAB_TO_ETAPA: Record<string, string> = {
  Bloqueados: "Pendencia pedido",
};

function getEtapaForStatusTab(tab: string): string {
  return STATUS_TAB_TO_ETAPA[tab] ?? tab;
}

function documentoMatchesStatusTab(row: PortalDocumentoRow, tab: string): boolean {
  if (tab === "todos") return true;
  return (
    normalizeValue(row.etapa) === normalizeValue(getEtapaForStatusTab(tab))
  );
}

function getDocumentoStatusTabFromEtapa(etapa: string): string {
  if (normalizeValue(etapa) === "pendencia pedido") {
    return "Bloqueados";
  }

  const match = STATUS_CARDS.find(
    (card) => normalizeValue(card.label) === normalizeValue(etapa)
  );
  return match?.label ?? "todos";
}

function getDocumentoStatusPortal(row: PortalDocumentoRow): string {
  if (row.comprovante?.status === "Pago") return "Pago";
  if (row.comprovante?.status === "Agendado") return "Agendado";

  const mapped = ETAPA_TO_STATUS_PORTAL[normalizeValue(row.etapa)];
  return mapped ?? row.etapa;
}

const STATUS_CARDS = [
  { id: "nao-iniciados", label: "Não iniciados", value: 609 },
  { id: "em-aprovacao", label: "Em aprovação", value: 4 },
  { id: "liberados", label: "Liberados", value: 8854 },
  { id: "processamento", label: "Processamento", value: 0 },
  { id: "lancados", label: "Lançados", value: 0 },
  { id: "agendados", label: "Agendados", value: 0 },
  { id: "pagos", label: "Pagos", value: 0 },
  { id: "bloqueados", label: "Bloqueados", value: 9468 },
  { id: "cancelados", label: "Cancelados", value: 0 },
] as const;

const DOCUMENTO_PERIOD_OPTIONS = [
  "Todos os períodos",
  "Hoje",
  "Últimos 7 dias",
  "Últimos 30 dias",
  "Últimos 90 dias",
  "Este mês",
  "Mês passado",
];

function parseBrazilianCurrency(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBrazilianCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function matchesDocumentoPeriod(dataEmissao: string, period: string): boolean {
  if (period === "Todos os períodos") return true;

  const documentDate = parseBrazilianDate(dataEmissao);
  if (!documentDate) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const docDay = new Date(documentDate);
  docDay.setHours(0, 0, 0, 0);

  if (period === "Hoje") {
    return docDay.getTime() === today.getTime();
  }

  const diffDays = Math.floor((today.getTime() - docDay.getTime()) / (1000 * 60 * 60 * 24));
  if (period === "Últimos 7 dias") return diffDays >= 0 && diffDays <= 7;
  if (period === "Últimos 30 dias") return diffDays >= 0 && diffDays <= 30;
  if (period === "Últimos 90 dias") return diffDays >= 0 && diffDays <= 90;

  if (period === "Este mês") {
    return (
      docDay.getMonth() === today.getMonth() && docDay.getFullYear() === today.getFullYear()
    );
  }

  if (period === "Mês passado") {
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return (
      docDay.getMonth() === previousMonth.getMonth() &&
      docDay.getFullYear() === previousMonth.getFullYear()
    );
  }

  return true;
}

function documentoMatchesSearchQuery(
  row: PortalDocumentoRow,
  query: string,
  options?: {
    searchField?: PortalDocumentoSearchField;
  },
): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = normalizeValue(query);
  const searchField = options?.searchField ?? "conteudo";

  if (searchField === "empresa") {
    const haystack = [row.nomeEmissor, row.cnpjEmissor].join(" ");
    return normalizeValue(haystack).includes(normalizedQuery);
  }

  if (searchField === "numero") {
    return normalizeValue(row.nfNumero).includes(normalizedQuery);
  }

  const haystack = [
    row.tipoDocumento,
    row.nfNumero,
    row.cnpjEmissor,
    row.nomeEmissor,
    row.cnpjDestinatario,
    row.etapa,
    row.aprovadores,
  ].join(" ");

  return normalizeValue(haystack).includes(normalizedQuery);
}

type PortalFornecedoresPageProps = {
  initialTab: string;
};

type DocumentosFiltersState = {
  tipoDocumento: string;
  aprovadoresElegiveis: string;
  statusPortal: string;
  etapa: string;
  numero: string;
  serie: string;
  emissor: string;
  nomeEmissor: string;
  destinatario: string;
  nomeDestinatario: string;
  dataEmissaoInicial: string;
  dataEmissaoFinal: string;
  dataEnvioErpInicial: string;
  dataEnvioErpFinal: string;
};

const DEFAULT_DOCUMENTOS_FILTERS: DocumentosFiltersState = {
  tipoDocumento: "",
  aprovadoresElegiveis: "",
  statusPortal: "",
  etapa: "",
  numero: "",
  serie: "",
  emissor: "",
  nomeEmissor: "",
  destinatario: "",
  nomeDestinatario: "",
  dataEmissaoInicial: "",
  dataEmissaoFinal: "",
  dataEnvioErpInicial: "",
  dataEnvioErpFinal: "",
};

function normalizeValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseBrazilianDate(value: string): Date | null {
  if (!value) return null;
  const parsedDate = parse(value, "dd/MM/yyyy", new Date());
  return isValid(parsedDate) ? parsedDate : null;
}

function formatDateForInput(date?: Date): string {
  if (!date || !isValid(date)) return "";
  return format(date, "dd/MM/yyyy");
}

function DocumentosFilterSelect({
  value,
  options,
  onChange,
  placeholder = "Selecione",
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-between border-[rgba(4,14,35,0.12)] bg-white px-3 text-sm font-normal shadow-sm hover:bg-white"
        >
          <span className={value ? "text-[#0d0f1c]" : "text-[#8A90A0]"}>{value || placeholder}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#5B616F]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        <DropdownMenuItem onClick={() => onChange("")}>{placeholder}</DropdownMenuItem>
        {options.map((option) => (
          <DropdownMenuItem key={option} onClick={() => onChange(option)}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-bold text-[#3D4350]">{label}</Label>
      {children}
    </div>
  );
}

function DocumentosDateField({
  value,
  onChange,
  hasError = false,
}: {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}) {
  const selectedDate = parseBrazilianDate(value) ?? undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-between border-[rgba(4,14,35,0.12)] bg-white px-3 text-sm font-normal shadow-sm hover:bg-white",
            hasError && "border-[#DC2626] focus-visible:ring-[#DC2626]"
          )}
        >
          <span className={value ? "text-[#0d0f1c]" : "text-[#8A90A0]"}>{value || "__/__/____"}</span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-[#5B616F]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => onChange(formatDateForInput(date))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function getPortalImportSegment(pathname: string): PortalImportSegment | undefined {
  if (pathname.includes("/portal-de-fornecedores/nfse")) return "nfse";
  if (pathname.includes("/portal-de-fornecedores/cte-os")) return "cte-os";
  if (pathname.includes("/portal-de-fornecedores/cte")) return "cte";
  if (pathname.includes("/portal-de-fornecedores/nfe")) return "nfe";
  return undefined;
}

export function PortalFornecedoresPage({ initialTab }: PortalFornecedoresPageProps) {
  const pathname = usePathname();
  const pageTitle = getPortalPageTitleFromPathname(pathname);
  const portalDocumentoTipo = getPortalTipoDocumentoFromPathname(pathname);
  const portalImportSegment = getPortalImportSegment(pathname);
  const hideTipoDocumentoColumn = Boolean(portalDocumentoTipo);
  const showComentarioColumn = hideTipoDocumentoColumn;
  const documentoTableColumnCount =
    (hideTipoDocumentoColumn ? 11 : 12) + (showComentarioColumn ? 1 : 0) + 1;
  const documentoTableMinWidth = getDocumentoTableMinWidth({
    showTipoDocumento: !hideTipoDocumentoColumn,
    showComentario: showComentarioColumn,
  });
  const portalDocumentoSearchOptions = getPortalDocumentoSearchOptions(portalImportSegment);
  const documentoNumeroColumnLabel = getPortalDocumentoNumeroColumnLabel(portalDocumentoTipo);
  const [selectedAccount, setSelectedAccount] = React.useState<AccountOption>(DEFAULT_ACCOUNT_OPTION);
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [showCadastroOverview, setShowCadastroOverview] = React.useState(true);
  const [fornecedorRows, setFornecedorRows] = React.useState<FornecedorRow[]>(FORNECEDOR_ROWS_INICIAIS);
  const [addFornecedorModalOpen, setAddFornecedorModalOpen] = React.useState(false);
  const [documentoRows, setDocumentoRows] = React.useState<PortalDocumentoRow[]>(
    PORTAL_DOCUMENTO_ROWS_INICIAIS
  );
  const [documentoModalOpen, setDocumentoModalOpen] = React.useState(false);
  const [mensagensModalOpen, setMensagensModalOpen] = React.useState(false);
  const [selectedDocumentoMensagens, setSelectedDocumentoMensagens] =
    React.useState<PortalDocumentoRow | null>(null);
  const [aprovarModalOpen, setAprovarModalOpen] = React.useState(false);
  const [isAprovandoDocumentos, setIsAprovandoDocumentos] = React.useState(false);
  const [alterarStatusDropdownDocumentoId, setAlterarStatusDropdownDocumentoId] = React.useState<
    number | null
  >(null);
  const [isAlterandoStatus, setIsAlterandoStatus] = React.useState(false);
  const [selectedDocumento, setSelectedDocumento] = React.useState<PortalDocumentoRow | null>(
    null
  );
  const [selectedDocumentoIds, setSelectedDocumentoIds] = React.useState<number[]>([]);
  const [hoveredDocumentoId, setHoveredDocumentoId] = React.useState<number | null>(null);
  const [documentoModalInitialTab, setDocumentoModalInitialTab] =
    React.useState<DocumentoModalTabId>("detalhes");
  const [documentoFiltersModalOpen, setDocumentoFiltersModalOpen] = React.useState(false);
  const [draftDocumentoFilters, setDraftDocumentoFilters] = React.useState<DocumentosFiltersState>(
    DEFAULT_DOCUMENTOS_FILTERS
  );
  const [appliedDocumentoFilters, setAppliedDocumentoFilters] = React.useState<DocumentosFiltersState>(
    DEFAULT_DOCUMENTOS_FILTERS
  );
  const [documentoDateValidationErrors, setDocumentoDateValidationErrors] = React.useState<{
    emissao?: string;
    envioErp?: string;
  }>({});
  const [activeDocumentoStatusTab, setActiveDocumentoStatusTab] = React.useState("todos");
  const [documentoSearchQuery, setDocumentoSearchQuery] = React.useState("");
  const [documentoSearchField, setDocumentoSearchField] =
    React.useState<PortalDocumentoSearchField>("conteudo");
  const [documentoPeriod, setDocumentoPeriod] = React.useState("Últimos 90 dias");
  const normalizeStatusLabel = React.useCallback((value: string) => normalizeValue(value), []);

  const documentoStatusTabs = React.useMemo(
    () => [
      { id: "todos", label: "Todos" },
      ...STATUS_CARDS.map((card) => ({
        id: card.label,
        label: card.label,
      })),
    ],
    [],
  );

  const documentoFilterOptions = React.useMemo(() => {
    const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));
    return {
      aprovadoresElegiveis: unique(documentoRows.map((row) => row.aprovadores)),
      etapa: unique(documentoRows.map((row) => row.etapa)),
    };
  }, [documentoRows]);

  const validateDocumentoDateRanges = React.useCallback((filters: DocumentosFiltersState) => {
    const emissaoInicial = parseBrazilianDate(filters.dataEmissaoInicial);
    const emissaoFinal = parseBrazilianDate(filters.dataEmissaoFinal);
    const envioErpInicial = parseBrazilianDate(filters.dataEnvioErpInicial);
    const envioErpFinal = parseBrazilianDate(filters.dataEnvioErpFinal);

    const errors: { emissao?: string; envioErp?: string } = {};

    if (emissaoInicial && emissaoFinal && emissaoFinal < emissaoInicial) {
      errors.emissao = "A data emissão final não pode ser menor que a data emissão inicial.";
    }
    if (envioErpInicial && envioErpFinal && envioErpFinal < envioErpInicial) {
      errors.envioErp = "A data envio ERP final não pode ser menor que a data envio ERP inicial.";
    }

    return errors;
  }, []);

  const filteredDocumentoRows = React.useMemo(() => {
    return documentoRows.filter((row) => {
      if (!documentoMatchesStatusTab(row, activeDocumentoStatusTab)) {
        return false;
      }

      if (
        !documentoMatchesSearchQuery(row, documentoSearchQuery, {
          searchField: portalDocumentoSearchOptions ? documentoSearchField : undefined,
        })
      ) {
        return false;
      }

      if (!matchesDocumentoPeriod(row.dataEmissao, documentoPeriod)) {
        return false;
      }

      if (
        appliedDocumentoFilters.tipoDocumento &&
        normalizeStatusLabel(row.tipoDocumento) !==
          normalizeStatusLabel(appliedDocumentoFilters.tipoDocumento)
      ) {
        return false;
      }

      if (
        appliedDocumentoFilters.aprovadoresElegiveis &&
        normalizeStatusLabel(row.aprovadores) !==
          normalizeStatusLabel(appliedDocumentoFilters.aprovadoresElegiveis)
      ) {
        return false;
      }

      if (appliedDocumentoFilters.statusPortal) {
        const rowStatusPortal = getDocumentoStatusPortal(row);
        if (
          normalizeStatusLabel(rowStatusPortal) !==
          normalizeStatusLabel(appliedDocumentoFilters.statusPortal)
        ) {
          return false;
        }
      }

      if (
        appliedDocumentoFilters.etapa &&
        normalizeStatusLabel(row.etapa) !== normalizeStatusLabel(appliedDocumentoFilters.etapa)
      ) {
        return false;
      }

      if (
        appliedDocumentoFilters.numero &&
        !normalizeStatusLabel(row.nfNumero).includes(normalizeStatusLabel(appliedDocumentoFilters.numero))
      ) {
        return false;
      }

      if (
        appliedDocumentoFilters.emissor &&
        !normalizeStatusLabel(row.cnpjEmissor).includes(normalizeStatusLabel(appliedDocumentoFilters.emissor))
      ) {
        return false;
      }

      if (
        appliedDocumentoFilters.nomeEmissor &&
        !normalizeStatusLabel(row.nomeEmissor).includes(
          normalizeStatusLabel(appliedDocumentoFilters.nomeEmissor)
        )
      ) {
        return false;
      }

      if (
        appliedDocumentoFilters.destinatario &&
        !normalizeStatusLabel(row.cnpjDestinatario).includes(
          normalizeStatusLabel(appliedDocumentoFilters.destinatario)
        )
      ) {
        return false;
      }

      const emissaoDocumento = parseBrazilianDate(row.dataEmissao);
      const emissaoInicial = parseBrazilianDate(appliedDocumentoFilters.dataEmissaoInicial);
      const emissaoFinal = parseBrazilianDate(appliedDocumentoFilters.dataEmissaoFinal);

      if (emissaoDocumento && emissaoInicial && emissaoDocumento < emissaoInicial) {
        return false;
      }

      if (emissaoDocumento && emissaoFinal && emissaoDocumento > emissaoFinal) {
        return false;
      }

      return true;
    });
  }, [
    activeDocumentoStatusTab,
    appliedDocumentoFilters,
    documentoPeriod,
    documentoRows,
    documentoSearchQuery,
    documentoSearchField,
    portalDocumentoSearchOptions,
    portalDocumentoTipo,
    normalizeStatusLabel,
  ]);

  const documentosTotalValue = React.useMemo(() => {
    const total = filteredDocumentoRows.reduce(
      (sum, row) => sum + parseBrazilianCurrency(row.valor),
      0,
    );
    return formatBrazilianCurrency(total);
  }, [filteredDocumentoRows]);

  const documentoPagination = useListingPagination(filteredDocumentoRows, 25);
  const paginatedDocumentoRows = documentoPagination.paginatedItems;

  const visibleDocumentoIds = React.useMemo(
    () => paginatedDocumentoRows.map((row) => row.id),
    [paginatedDocumentoRows]
  );
  const visibleSelectedCount = React.useMemo(
    () => visibleDocumentoIds.filter((id) => selectedDocumentoIds.includes(id)).length,
    [selectedDocumentoIds, visibleDocumentoIds]
  );
  const isMultiSelectMode = selectedDocumentoIds.length >= 2;
  const multiSelectActionRowId = React.useMemo(() => {
    if (!isMultiSelectMode) return null;

    if (
      hoveredDocumentoId !== null &&
      selectedDocumentoIds.includes(hoveredDocumentoId)
    ) {
      return hoveredDocumentoId;
    }

    if (
      alterarStatusDropdownDocumentoId !== null &&
      selectedDocumentoIds.includes(alterarStatusDropdownDocumentoId)
    ) {
      return alterarStatusDropdownDocumentoId;
    }

    const paginatedIds = new Set(paginatedDocumentoRows.map((row) => row.id));
    for (let index = selectedDocumentoIds.length - 1; index >= 0; index -= 1) {
      const documentoId = selectedDocumentoIds[index];
      if (paginatedIds.has(documentoId)) {
        return documentoId;
      }
    }

    return selectedDocumentoIds[selectedDocumentoIds.length - 1] ?? null;
  }, [
    isMultiSelectMode,
    selectedDocumentoIds,
    hoveredDocumentoId,
    alterarStatusDropdownDocumentoId,
    paginatedDocumentoRows,
  ]);
  const allVisibleSelected =
    visibleDocumentoIds.length > 0 && visibleSelectedCount === visibleDocumentoIds.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;
  const handleToggleDocumentoSelection = React.useCallback((documentoId: number) => {
    setSelectedDocumentoIds((prev) =>
      prev.includes(documentoId) ? prev.filter((id) => id !== documentoId) : [...prev, documentoId]
    );
  }, []);

  const documentoVisualizarTab: DocumentoModalTabId =
    portalImportSegment === "nfe" ? "ver-danfe" : "detalhes";

  const openDocumentoDetail = React.useCallback(
    (row: PortalDocumentoRow, tab: DocumentoModalTabId = documentoVisualizarTab) => {
      setSelectedDocumento(row);
      setDocumentoModalInitialTab(tab);
      setDocumentoModalOpen(true);
    },
    [documentoVisualizarTab],
  );

  const openDocumentoMensagens = React.useCallback((row: PortalDocumentoRow) => {
    setSelectedDocumentoMensagens(row);
    setMensagensModalOpen(true);
  }, []);

  const handleToggleAllVisibleDocumentos = React.useCallback(() => {
    setSelectedDocumentoIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleDocumentoIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleDocumentoIds]));
    });
  }, [allVisibleSelected, visibleDocumentoIds]);

  const handleAprovarDocumentoFromRow = React.useCallback((documentoId: number) => {
    setSelectedDocumentoIds([documentoId]);
    setAprovarModalOpen(true);
  }, []);

  const handleAprovarSelectedDocumentos = React.useCallback(() => {
    if (selectedDocumentoIds.length === 0) return;
    setAprovarModalOpen(true);
  }, [selectedDocumentoIds.length]);

  const handleBaixarDocumentoFromRow = React.useCallback((row: PortalDocumentoRow) => {
    downloadPortalDocumento(row);
  }, []);

  const handleConfirmarAprovacao = React.useCallback(async () => {
    if (selectedDocumentoIds.length === 0) return;

    const count = selectedDocumentoIds.length;
    setIsAprovandoDocumentos(true);

    try {
      await Promise.resolve();
      setDocumentoRows((prev) =>
        prev.map((row) =>
          selectedDocumentoIds.includes(row.id) ? { ...row, etapa: "Liberados" } : row
        )
      );
      setSelectedDocumento((prev) =>
        prev && selectedDocumentoIds.includes(prev.id) ? { ...prev, etapa: "Liberados" } : prev
      );
      setActiveDocumentoStatusTab(getDocumentoStatusTabFromEtapa("Liberados"));
      setSelectedDocumentoIds([]);
      setAprovarModalOpen(false);
      toast.success(
        count === 1 ? "Documento aprovado com sucesso." : "Documentos aprovados com sucesso."
      );
    } catch {
      toast.error("Não foi possível aprovar os documentos. Tente novamente.");
    } finally {
      setIsAprovandoDocumentos(false);
    }
  }, [selectedDocumentoIds]);

  const handleAlterarStatusDocumentoFromRow = React.useCallback(
    async (documentoId: number, statusPortal: string) => {
      if (isAlterandoStatus) return;

      setAlterarStatusDropdownDocumentoId(null);
      setIsAlterandoStatus(true);

      try {
        await Promise.resolve();
        const updatedRow = documentoRows.find((row) => row.id === documentoId);
        const nextRow = updatedRow
          ? applyStatusPortalToDocumento(updatedRow, statusPortal)
          : null;

        setDocumentoRows((prev) =>
          prev.map((row) =>
            row.id === documentoId ? applyStatusPortalToDocumento(row, statusPortal) : row
          )
        );

        if (nextRow) {
          setSelectedDocumento((prev) => (prev?.id === documentoId ? nextRow : prev));
          setActiveDocumentoStatusTab(getDocumentoStatusTabFromEtapa(nextRow.etapa));
        }

        toast.success("Status do documento alterado com sucesso.");
      } catch {
        toast.error("Não foi possível alterar o status. Tente novamente.");
      } finally {
        setIsAlterandoStatus(false);
      }
    },
    [documentoRows, isAlterandoStatus]
  );

  const handleOpenDocumentoFiltersModal = React.useCallback(() => {
    setDraftDocumentoFilters(appliedDocumentoFilters);
    setDocumentoDateValidationErrors({});
    setDocumentoFiltersModalOpen(true);
  }, [appliedDocumentoFilters]);

  const handleConfirmDocumentoFilters = React.useCallback(() => {
    const errors = validateDocumentoDateRanges(draftDocumentoFilters);
    setDocumentoDateValidationErrors(errors);
    if (errors.emissao || errors.envioErp) return;

    setAppliedDocumentoFilters(draftDocumentoFilters);
    setDocumentoFiltersModalOpen(false);
  }, [draftDocumentoFilters, validateDocumentoDateRanges]);

  const handleClearDocumentoFilters = React.useCallback(() => {
    const clearedFilters: DocumentosFiltersState = {
      ...DEFAULT_DOCUMENTOS_FILTERS,
      tipoDocumento: portalDocumentoTipo ?? "",
    };
    setDraftDocumentoFilters(clearedFilters);
    setAppliedDocumentoFilters(clearedFilters);
    setDocumentoDateValidationErrors({});
    setActiveDocumentoStatusTab("todos");
    setDocumentoSearchQuery("");
    setDocumentoPeriod("Últimos 90 dias");
  }, [portalDocumentoTipo]);

  const handleStatusPortalChange = React.useCallback((statusPortal: string) => {
    setAppliedDocumentoFilters((prev) => ({ ...prev, statusPortal }));
    setDraftDocumentoFilters((prev) => ({ ...prev, statusPortal }));
  }, []);

  const hasDocumentoFilters = React.useMemo(() => {
    return (
      draftDocumentoFilters.tipoDocumento !== "" ||
      draftDocumentoFilters.aprovadoresElegiveis !== "" ||
      draftDocumentoFilters.statusPortal !== "" ||
      draftDocumentoFilters.etapa !== "" ||
      draftDocumentoFilters.numero !== "" ||
      draftDocumentoFilters.serie !== "" ||
      draftDocumentoFilters.emissor !== "" ||
      draftDocumentoFilters.nomeEmissor !== "" ||
      draftDocumentoFilters.destinatario !== "" ||
      draftDocumentoFilters.nomeDestinatario !== "" ||
      draftDocumentoFilters.dataEmissaoInicial !== "" ||
      draftDocumentoFilters.dataEmissaoFinal !== "" ||
      draftDocumentoFilters.dataEnvioErpInicial !== "" ||
      draftDocumentoFilters.dataEnvioErpFinal !== ""
    );
  }, [draftDocumentoFilters]);

  React.useEffect(() => {
    const segment = pathname.split("/").pop() ?? "";
    const tabFromPath = PATH_TO_TAB[segment];
    if (tabFromPath) {
      setActiveTab(tabFromPath);
    }
  }, [pathname]);

  React.useEffect(() => {
    const options = getPortalDocumentoSearchOptions(portalImportSegment);
    if (options?.[0]) {
      setDocumentoSearchField(options[0].value as PortalDocumentoSearchField);
      setDocumentoSearchQuery("");
    }
  }, [portalImportSegment]);

  React.useEffect(() => {
    if (!portalDocumentoTipo) {
      setAppliedDocumentoFilters((prev) =>
        prev.tipoDocumento ? { ...prev, tipoDocumento: "" } : prev,
      );
      setDraftDocumentoFilters((prev) =>
        prev.tipoDocumento ? { ...prev, tipoDocumento: "" } : prev,
      );
      return;
    }

    setAppliedDocumentoFilters((prev) => ({ ...prev, tipoDocumento: portalDocumentoTipo }));
    setDraftDocumentoFilters((prev) => ({ ...prev, tipoDocumento: portalDocumentoTipo }));
  }, [portalDocumentoTipo]);

  React.useEffect(() => {
    setSelectedDocumentoIds([]);
  }, [activeDocumentoStatusTab]);

  React.useEffect(() => {
    setSelectedDocumentoIds((prev) => prev.filter((id) => visibleDocumentoIds.includes(id)));
  }, [visibleDocumentoIds]);

  return (
    <section className="space-y-4 p-3 lg:p-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">{pageTitle}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#5B616F]">
            <span>Exibindo dados da conta:</span>
            <select
              value={selectedAccount}
              onChange={(event) => setSelectedAccount(event.target.value as AccountOption)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[rgba(4,14,35,0.12)] bg-white px-3 text-sm font-medium text-[#0d0f1c] appearance-none pr-9"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B616F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {ACCOUNT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="text-right text-xs leading-4 text-[#8A90A0]">
            <span className="block">Ultima atualizacao</span>
            <span className="font-medium text-[#5B616F]">20/02/2024 as 14:05</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="h-9 gap-2 px-4" asChild>
              <Link href={portalImportPathFromTab(activeTab, portalImportSegment)}>
                <Upload className="h-4 w-4" />
                Importar documentos
              </Link>
            </Button>
            {activeTab === "lista" && (
              <Button
                className="h-9 gap-2 px-4"
                onClick={() => setAddFornecedorModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar fornecedor
              </Button>
            )}
          </div>
        </div>
      </header>

      {activeTab === "documentos" ? (
        <Card className="rounded-xl border border-border bg-white">
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-t-xl bg-[#F5F5F6] [&_[role=tablist]]:gap-4">
              <Tabs
                tabs={documentoStatusTabs}
                value={activeDocumentoStatusTab}
                onValueChange={setActiveDocumentoStatusTab}
                variant="product"
                className="px-4"
              />
            </div>

            <DataTableFilters
              searchPlaceholder="Busque por tipo, número, série, emissor, destinatário..."
              searchValue={documentoSearchQuery}
              onSearchChange={setDocumentoSearchQuery}
              searchFields={portalDocumentoSearchOptions}
              searchField={documentoSearchField}
              onSearchFieldChange={(value) =>
                setDocumentoSearchField(value as PortalDocumentoSearchField)
              }
              periodLabel="Data de emissão"
              periodValue={documentoPeriod}
              periodOptions={DOCUMENTO_PERIOD_OPTIONS}
              onPeriodChange={setDocumentoPeriod}
              totalLabel="Total dos documentos"
              totalValue={`R$ ${documentosTotalValue}`}
              showStatusFilter={false}
              onFiltersClick={handleOpenDocumentoFiltersModal}
            />

            <div className="h-px bg-[#EBECEE]" />

            <DataTableActions
              selectedCount={selectedDocumentoIds.length}
              totalCount={filteredDocumentoRows.length}
              onSelectAll={handleToggleAllVisibleDocumentos}
              allSelected={allVisibleSelected}
              actions={[]}
            />

            <div className="overflow-x-auto">
              <table
                className="w-full min-w-full table-fixed text-sm"
                style={{ minWidth: documentoTableMinWidth }}
              >
                  <colgroup>
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.checkbox }} />
                    {!hideTipoDocumentoColumn ? (
                      <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.tipoDoc }} />
                    ) : null}
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.numero }} />
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.dataEmissao }} />
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.cnpj }} />
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.nomeEmissor }} />
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.cnpjDestinatario }} />
                    {showComentarioColumn ? (
                      <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.comentario }} />
                    ) : null}
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.valor }} />
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.etapaErp }} />
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.situacaoDfe }} />
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.aprovadores }} />
                    <col style={{ width: DOCUMENTO_TABLE_COLUMN_WIDTH.aprovNecessarias }} />
                    <col />
                  </colgroup>
                  <thead className={DOCUMENTO_TABLE_HEAD_BG_CLASS}>
                    <tr className={TABLE_HEAD_ROW_CLASS}>
                      <th className={DOCUMENTO_TABLE_CHECKBOX_HEAD_CELL_CLASS}>
                        <input
                          type="checkbox"
                          aria-label="Selecionar todos os documentos visíveis"
                          checked={allVisibleSelected}
                          ref={(element) => {
                            if (!element) return;
                            element.indeterminate = someVisibleSelected;
                          }}
                          onChange={handleToggleAllVisibleDocumentos}
                          className={TABLE_CHECKBOX_CLASS}
                        />
                      </th>
                      {!hideTipoDocumentoColumn ? (
                        <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                          Tipo Doc.
                        </th>
                      ) : null}
                      <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>
                        {documentoNumeroColumnLabel}
                      </th>
                      <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>
                        Data Emissão
                      </th>
                      <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>
                        CNPJ Emissor
                      </th>
                      <th className={DOCUMENTO_TABLE_HEAD_CELL_CLASS}>Nome Emissor</th>
                      <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>
                        CNPJ Destinatário
                      </th>
                      {showComentarioColumn ? (
                        <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "text-center whitespace-nowrap")}>
                          Comentário
                        </th>
                      ) : null}
                      <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>
                        Valor
                      </th>
                      <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                        Etapa ERP
                      </th>
                      <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                        Situação do DF-e
                      </th>
                      <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                        Aprovadores
                      </th>
                      <th className={cn(DOCUMENTO_TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                        Aprov. necessárias
                      </th>
                      <th className={DOCUMENTO_TABLE_FILLER_HEAD_CELL_CLASS} aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocumentoRows.length === 0 ? (
                      <tr>
                        <td colSpan={documentoTableColumnCount} className="px-2.5 py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7EEFF]">
                              <FileText className="h-6 w-6 text-[#0C3CF7]" aria-hidden />
                            </div>
                            <h3 className="text-base font-semibold text-[#0d0f1c]">
                              Nenhum documento encontrado.
                            </h3>
                            <p className="mt-1 max-w-md text-sm text-[#5F6572]">
                              {appliedDocumentoFilters.statusPortal
                                ? "Ajuste os filtros ou selecione outro status para visualizar resultados."
                                : appliedDocumentoFilters.tipoDocumento && !hideTipoDocumentoColumn
                                  ? "Ajuste os filtros ou selecione outro tipo de documento para visualizar resultados."
                                  : "Ajuste os filtros ou selecione outra aba para visualizar resultados."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    {paginatedDocumentoRows.map((row) => {
                      const isRowSelected = selectedDocumentoIds.includes(row.id);
                      const isMultiSelectActionRow =
                        isMultiSelectMode && multiSelectActionRowId === row.id;
                      const isRowViewing =
                        documentoModalOpen && selectedDocumento?.id === row.id;
                      const isRowHovered =
                        (hoveredDocumentoId === row.id ||
                          alterarStatusDropdownDocumentoId === row.id) &&
                        !isRowSelected;
                      const showRowActions = isRowHovered || isMultiSelectActionRow;
                      const isRowActionActive = showRowActions;
                      const primaryTextClass = isRowActionActive
                        ? "text-white"
                        : TABLE_PRIMARY_TEXT_CLASS;
                      const secondaryTextClass = isRowActionActive
                        ? "text-white/80"
                        : TABLE_SECONDARY_TEXT_CLASS;

                      return (
                        <React.Fragment key={row.id}>
                          <tr
                            className={cn(
                              "border-b border-border transition-colors last:border-b-0",
                              isRowActionActive
                                ? "bg-[#040E23]"
                                : isRowSelected
                                  ? "bg-[#F3F5FF]"
                                  : isRowViewing
                                    ? "bg-[#FAFAFF]"
                                    : "bg-white hover:bg-[#FAFAFF]",
                            )}
                            onMouseEnter={() => setHoveredDocumentoId(row.id)}
                            onMouseLeave={() => setHoveredDocumentoId(null)}
                          >
                            <td className={DOCUMENTO_TABLE_CHECKBOX_BODY_CELL_CLASS}>
                              {isRowViewing ? (
                                <span
                                  className="absolute bottom-0 left-0 top-0 w-[3px] bg-[#0C3CF7]"
                                  aria-hidden
                                />
                              ) : null}
                              <input
                                type="checkbox"
                                aria-label={`Selecionar documento ${row.id}`}
                                checked={isRowSelected}
                                onChange={() => handleToggleDocumentoSelection(row.id)}
                                className={cn(
                                  TABLE_CHECKBOX_CLASS,
                                  isRowActionActive && "border-white/40 bg-white/10",
                                )}
                              />
                            </td>
                            {!hideTipoDocumentoColumn ? (
                              <td
                                className={cn(
                                  DOCUMENTO_TABLE_BODY_CELL_CLASS,
                                  "whitespace-nowrap truncate transition-colors",
                                  primaryTextClass,
                                )}
                              >
                                {row.tipoDocumento}
                              </td>
                            ) : null}
                            <td
                              className={cn(
                                DOCUMENTO_TABLE_BODY_CELL_CLASS,
                                "text-right font-semibold tabular-nums whitespace-nowrap truncate transition-colors",
                                primaryTextClass,
                              )}
                            >
                              {row.nfNumero}
                            </td>
                            <td
                              className={cn(
                                DOCUMENTO_TABLE_BODY_CELL_CLASS,
                                "text-right tabular-nums whitespace-nowrap truncate transition-colors",
                                primaryTextClass,
                              )}
                            >
                              {row.dataEmissao}
                            </td>
                            <td
                              className={cn(
                                DOCUMENTO_TABLE_BODY_CELL_CLASS,
                                "text-right tabular-nums whitespace-nowrap truncate transition-colors",
                                secondaryTextClass,
                              )}
                            >
                              {row.cnpjEmissor}
                            </td>
                            <td className={cn(DOCUMENTO_TABLE_BODY_CELL_CLASS, "transition-colors")}>
                              <span
                                className={cn(
                                  "block truncate transition-colors",
                                  primaryTextClass,
                                )}
                                title={row.nomeEmissor}
                              >
                                {row.nomeEmissor}
                              </span>
                            </td>
                            <td
                              className={cn(
                                DOCUMENTO_TABLE_BODY_CELL_CLASS,
                                "text-right tabular-nums whitespace-nowrap truncate transition-colors",
                                secondaryTextClass,
                              )}
                            >
                              {row.cnpjDestinatario}
                            </td>
                            {showComentarioColumn ? (
                              <td className={cn(DOCUMENTO_TABLE_BODY_CELL_CLASS, "text-center")}>
                                <button
                                  type="button"
                                  className={cn(
                                    "inline-flex h-8 w-8 items-center justify-center bg-transparent p-0",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-1",
                                  )}
                                  aria-label={`Comentários do documento ${row.nfNumero}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openDocumentoMensagens(row);
                                  }}
                                >
                                  <MessageSquareText
                                    className={cn(
                                      "h-[18px] w-[18px] stroke-[1.5]",
                                      isRowActionActive ? "text-white" : "text-[#5B616F]",
                                    )}
                                    aria-hidden
                                  />
                                </button>
                              </td>
                            ) : null}
                            <td
                              className={cn(
                                DOCUMENTO_TABLE_BODY_CELL_CLASS,
                                "text-right font-semibold tabular-nums whitespace-nowrap transition-colors",
                                primaryTextClass,
                              )}
                            >
                              {row.valor}
                            </td>
                            <td className={cn(DOCUMENTO_TABLE_BODY_CELL_CLASS, "whitespace-nowrap")}>
                              <PortalDocumentoEtapaTag etapa={row.etapa} />
                            </td>
                            <td className={cn(DOCUMENTO_TABLE_BODY_CELL_CLASS, "whitespace-nowrap")}>
                              <PortalDocumentoSituacaoDfeTag
                                situacao={getDocumentoSituacaoDfe(row)}
                              />
                            </td>
                            <td
                              className={cn(
                                DOCUMENTO_TABLE_BODY_CELL_CLASS,
                                "whitespace-nowrap truncate transition-colors",
                                primaryTextClass,
                              )}
                            >
                              {row.aprovadores}
                            </td>
                            <td
                              className={cn(
                                DOCUMENTO_TABLE_BODY_CELL_CLASS,
                                "tabular-nums whitespace-nowrap transition-colors",
                                primaryTextClass,
                              )}
                            >
                              {row.aprovacoesNecessarias}
                            </td>
                            <td className={DOCUMENTO_TABLE_FILLER_BODY_CELL_CLASS} aria-hidden />
                          </tr>
                          {showRowActions ? (
                            <tr
                              className="h-0 border-0 bg-transparent leading-[0]"
                              onMouseEnter={() => setHoveredDocumentoId(row.id)}
                              onMouseLeave={() => setHoveredDocumentoId(null)}
                            >
                              <td
                                colSpan={documentoTableColumnCount}
                                className="relative h-0 border-0 bg-transparent p-0 leading-[0]"
                              >
                                <div className="pointer-events-auto absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 pb-1">
                                  <DocumentoTableRowHoverActions
                                    documento={row}
                                    statusOptions={STATUS_PORTAL_OPTIONS}
                                    isAlterandoStatus={isAlterandoStatus}
                                    alterarStatusOpen={alterarStatusDropdownDocumentoId === row.id}
                                    onAlterarStatusOpenChange={(open) =>
                                      setAlterarStatusDropdownDocumentoId(open ? row.id : null)
                                    }
                                    visualizarTab={documentoVisualizarTab}
                                    hideVisualizar={isMultiSelectMode}
                                    onOpenTab={(tab) => openDocumentoDetail(row, tab)}
                                    onAprovar={() =>
                                      isMultiSelectMode
                                        ? handleAprovarSelectedDocumentos()
                                        : handleAprovarDocumentoFromRow(row.id)
                                    }
                                    onAlterarStatusSelect={(status) =>
                                      handleAlterarStatusDocumentoFromRow(row.id, status)
                                    }
                                    onBaixar={() => handleBaixarDocumentoFromRow(row)}
                                  />
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
            </div>

            <ListingTablePagination
              className="px-4 pb-4"
              page={documentoPagination.page}
              pageSize={documentoPagination.pageSize}
              totalItems={documentoPagination.totalItems}
              onPageChange={documentoPagination.setPage}
              onPageSizeChange={documentoPagination.setPageSize}
              hasNextPage={documentoPagination.hasNextPage}
              hasPrevPage={documentoPagination.hasPrevPage}
              itemLabel="documentos"
            />

            <Sheet
                open={documentoFiltersModalOpen}
                onOpenChange={(open) => {
                  setDocumentoFiltersModalOpen(open);
                  if (!open) {
                    setDraftDocumentoFilters(appliedDocumentoFilters);
                    setDocumentoDateValidationErrors({});
                  }
                }}
              >
                <SheetContent className="flex w-[400px] max-w-[92vw] flex-col gap-0 p-0 sm:w-[420px]">
                  <SheetTitle className="sr-only">Filtros de documentos</SheetTitle>
                  <SheetDescription className="sr-only">Painel lateral para filtrar a lista de documentos</SheetDescription>
                  <SheetHeader className="shrink-0 border-b border-[rgba(4,14,35,0.08)] px-5 py-4">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-lg font-bold text-[#0d0f1c]">Filtros</SheetTitle>
                      <SheetClose asChild>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#5B616F] hover:bg-[#F3F4F6]"
                          aria-label="Fechar filtros"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </SheetClose>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      {!hideTipoDocumentoColumn ? (
                        <FilterField label="Tipo de documento">
                          <DocumentosFilterSelect
                            value={draftDocumentoFilters.tipoDocumento}
                            options={TIPO_DOCUMENTO_OPTIONS}
                            onChange={(tipoDocumento) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, tipoDocumento }))
                            }
                          />
                        </FilterField>
                      ) : null}

                      <FilterField
                        label="Aprovadores"
                        className={hideTipoDocumentoColumn ? "col-span-2" : undefined}
                      >
                        <DocumentosFilterSelect
                          value={draftDocumentoFilters.aprovadoresElegiveis}
                          options={documentoFilterOptions.aprovadoresElegiveis}
                          onChange={(aprovadoresElegiveis) =>
                            setDraftDocumentoFilters((prev) => ({ ...prev, aprovadoresElegiveis }))
                          }
                        />
                      </FilterField>

                      <FilterField label="Status Portal">
                        <DocumentosFilterSelect
                          value={draftDocumentoFilters.statusPortal}
                          options={STATUS_PORTAL_OPTIONS}
                          onChange={handleStatusPortalChange}
                        />
                      </FilterField>

                      <FilterField label="Etapa ERP">
                          <DocumentosFilterSelect
                            value={draftDocumentoFilters.etapa}
                            options={documentoFilterOptions.etapa}
                            onChange={(etapa) => setDraftDocumentoFilters((prev) => ({ ...prev, etapa }))}
                          />
                      </FilterField>

                      <FilterField label="Número">
                          <Input
                            placeholder="Digite o número"
                            value={draftDocumentoFilters.numero}
                            onChange={(e) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, numero: e.target.value }))
                            }
                          />
                      </FilterField>

                      <FilterField label="Série">
                          <Input
                            placeholder="Digite o número da série"
                            value={draftDocumentoFilters.serie}
                            onChange={(e) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, serie: e.target.value }))
                            }
                          />
                      </FilterField>

                      <FilterField label="Emissor">
                          <Input
                            placeholder="Digite o CPF/CNPJ do emissor"
                            value={draftDocumentoFilters.emissor}
                            onChange={(e) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, emissor: e.target.value }))
                            }
                          />
                      </FilterField>

                      <FilterField label="Nome Emissor">
                          <Input
                            placeholder="Digite o Nome"
                            value={draftDocumentoFilters.nomeEmissor}
                            onChange={(e) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, nomeEmissor: e.target.value }))
                            }
                          />
                      </FilterField>

                      <FilterField label="Destinatário">
                          <Input
                            placeholder="Digite o CPF/CNPJ do destinatário"
                            value={draftDocumentoFilters.destinatario}
                            onChange={(e) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, destinatario: e.target.value }))
                            }
                          />
                      </FilterField>

                      <FilterField label="Nome Destinatário">
                          <Input
                            placeholder="Digite o Nome"
                            value={draftDocumentoFilters.nomeDestinatario}
                            onChange={(e) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, nomeDestinatario: e.target.value }))
                            }
                          />
                      </FilterField>

                      <FilterField label="Data emissão inicial">
                          <DocumentosDateField
                            value={draftDocumentoFilters.dataEmissaoInicial}
                            onChange={(dataEmissaoInicial) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, dataEmissaoInicial }))
                            }
                            hasError={Boolean(documentoDateValidationErrors.emissao)}
                          />
                      </FilterField>

                      <FilterField label="Data emissão final">
                          <DocumentosDateField
                            value={draftDocumentoFilters.dataEmissaoFinal}
                            onChange={(dataEmissaoFinal) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, dataEmissaoFinal }))
                            }
                            hasError={Boolean(documentoDateValidationErrors.emissao)}
                          />
                      </FilterField>

                      <FilterField label="Data envio ERP inicial">
                          <DocumentosDateField
                            value={draftDocumentoFilters.dataEnvioErpInicial}
                            onChange={(dataEnvioErpInicial) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, dataEnvioErpInicial }))
                            }
                            hasError={Boolean(documentoDateValidationErrors.envioErp)}
                          />
                      </FilterField>

                      <FilterField label="Data envio ERP final">
                          <DocumentosDateField
                            value={draftDocumentoFilters.dataEnvioErpFinal}
                            onChange={(dataEnvioErpFinal) =>
                              setDraftDocumentoFilters((prev) => ({ ...prev, dataEnvioErpFinal }))
                            }
                            hasError={Boolean(documentoDateValidationErrors.envioErp)}
                          />
                      </FilterField>
                    </div>

                    {(documentoDateValidationErrors.emissao || documentoDateValidationErrors.envioErp) && (
                      <div className="mt-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">
                        {documentoDateValidationErrors.emissao ?? documentoDateValidationErrors.envioErp}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center justify-between border-t border-[rgba(4,14,35,0.08)] px-5 py-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 gap-2 px-2 font-bold text-[#3D4350] hover:bg-transparent hover:text-[#0d0f1c]"
                      onClick={handleClearDocumentoFilters}
                      disabled={!hasDocumentoFilters}
                    >
                      <Trash2 className="h-4 w-4" />
                      Limpar filtros
                    </Button>
                    <Button
                      type="button"
                      className="h-9 px-5 font-bold"
                      onClick={handleConfirmDocumentoFilters}
                    >
                      Aplicar filtros
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <AprovarDocumentosConfirmModal
                open={aprovarModalOpen}
                selectedCount={selectedDocumentoIds.length}
                isLoading={isAprovandoDocumentos}
                onClose={() => setAprovarModalOpen(false)}
                onConfirm={handleConfirmarAprovacao}
              />
          </CardContent>
        </Card>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="space-y-3 p-3">
          {activeTab === "lista" && (
            <CadastroTabContent
              showOverview={showCadastroOverview}
              onToggleOverview={() => setShowCadastroOverview((current) => !current)}
              fornecedorRows={fornecedorRows}
              onUpdateFornecedor={(id, updates) =>
                setFornecedorRows((prev) =>
                  prev.map((row) => (row.id === id ? { ...row, ...updates } : row)),
                )
              }
            />
          )}

          {activeTab === "dados-analiticos" && <IndicadoresTabContent />}
          </div>
        </section>
      )}

      <AdicionarFornecedorModal
        open={addFornecedorModalOpen}
        onOpenChange={setAddFornecedorModalOpen}
        existingRows={fornecedorRows}
        onAddFornecedor={(row) => setFornecedorRows((prev) => [...prev, row])}
      />

      <DocumentoMensagensModal
        open={mensagensModalOpen}
        onOpenChange={setMensagensModalOpen}
        documento={selectedDocumentoMensagens}
        onUpdateMensagens={(documentoId, chat, mensagens) => {
          const field =
            chat === "fornecedor" ? "mensagensFornecedor" : "mensagensInterno";
          setDocumentoRows((prev) =>
            prev.map((item) =>
              item.id === documentoId ? { ...item, [field]: mensagens } : item,
            ),
          );
          setSelectedDocumentoMensagens((prev) =>
            prev?.id === documentoId ? { ...prev, [field]: mensagens } : prev,
          );
        }}
        onUpdateAnexosDocumento={(documentoId, anexos) => {
          setDocumentoRows((prev) =>
            prev.map((item) =>
              item.id === documentoId ? { ...item, anexosDocumento: anexos } : item,
            ),
          );
          setSelectedDocumentoMensagens((prev) =>
            prev?.id === documentoId ? { ...prev, anexosDocumento: anexos } : prev,
          );
        }}
      />

      <DocumentoModal
        open={documentoModalOpen}
        onOpenChange={setDocumentoModalOpen}
        showNfeExtraTabs={portalImportSegment === "nfe"}
        documento={selectedDocumento}
        initialTab={documentoModalInitialTab}
        onAprovar={() => {
          if (!selectedDocumento) return;
          handleAprovarDocumentoFromRow(selectedDocumento.id);
        }}
        onBaixar={() => {
          if (!selectedDocumento) return;
          handleBaixarDocumentoFromRow(selectedDocumento);
        }}
      />
    </section>
  );
}
