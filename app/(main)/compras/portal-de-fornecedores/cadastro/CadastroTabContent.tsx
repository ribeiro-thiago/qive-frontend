"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BigNumberCard } from "@/components/shared/BigNumberCard";
import { OverviewCardsSection } from "@/components/shared/OverviewCardsSection";
import { Building2, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_CHECKBOX_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import { ListingTablePagination } from "@/components/shared/ListingTablePagination";
import { useListingPagination } from "@/components/shared/ListingTablePagination/useListingPagination";
import { toast } from "sonner";
import { useNotifications } from "@/lib/notifications/NotificationsContext";
import {
  CADASTRO_TABLE_ANCHOR,
  matchesDestaqueCbsIbsSlug,
  matchesRegimeTributarioSlug,
  OVERVIEW_CARD_TO_VISAO_GERAL,
  parseCadastroSearchParams,
  recorrenciaSlugToLabel,
  regimeTributarioSlugToDrawerValue,
  setVisaoGeralInSearchParams,
  type CadastroUrlFilters,
  type VisaoGeralSlug,
} from "../lib/cadastro-navigation";
import {
  CadastroFiltersDrawer,
  DEFAULT_CADASTRO_FILTERS,
  type CadastroFiltersState,
} from "./CadastroFiltersDrawer";
import { CadastroTableRowHoverActions } from "./CadastroTableRowHoverActions";
import { VerFornecedorModal } from "./VerFornecedorModal";
import { applyVisaoGeralToRows } from "./lib/visao-geral-filters";
import type { FornecedorRow, Recorrencia } from "./types";
import {
  pagamentoCadastroVariant,
  PortalCadastroTag,
  recorrenciaCadastroVariant,
} from "../components/PortalTags";

const OVERVIEW_CARDS = [
  {
    id: "cnpj-regular",
    value: "2345",
    label: "Fornecedores com CNPJ regular",
  },
  {
    id: "cnpj-irregular",
    value: "23",
    label: "Fornecedores com CNPJ irregular",
  },
  {
    id: "sem-credito-reforma",
    value: "R$ 12 mil",
    label: "Não geram crédito na reforma (fev/2026)",
    count: 3,
    unit: "fornecedores",
  },
  {
    id: "com-credito-reforma",
    value: "R$ 23 mil",
    label: "Geram crédito na reforma (fev/2026)",
    count: 5,
    unit: "fornecedores",
  },
] as const;

const CADASTRO_TABLE_MIN_WIDTH = 2736;

type CadastroTabContentProps = {
  showOverview: boolean;
  onToggleOverview: () => void;
  fornecedorRows: FornecedorRow[];
  onUpdateFornecedor: (id: number, updates: Partial<FornecedorRow>) => void;
};

function scrollToCadastroTable() {
  const anchor = document.getElementById(CADASTRO_TABLE_ANCHOR);
  if (!anchor) return;
  anchor.scrollIntoView({ behavior: "smooth", block: "start" });
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

export function CadastroTabContent({
  showOverview,
  onToggleOverview,
  fornecedorRows,
  onUpdateFornecedor,
}: CadastroTabContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enqueueFornecedoresExcelExportNotification } = useNotifications();
  const searchParamsString = searchParams.toString();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [draftFilters, setDraftFilters] = React.useState<CadastroFiltersState>(DEFAULT_CADASTRO_FILTERS);
  const [appliedFilters, setAppliedFilters] = React.useState<CadastroFiltersState>(DEFAULT_CADASTRO_FILTERS);
  const [urlRecorrenciaFilter, setUrlRecorrenciaFilter] = React.useState<Recorrencia | null>(null);
  const [urlFilters, setUrlFilters] = React.useState<CadastroUrlFilters>({});
  const [selectedFornecedorIds, setSelectedFornecedorIds] = React.useState<number[]>([]);
  const [viewFornecedorId, setViewFornecedorId] = React.useState<number | null>(null);
  const [viewFornecedorModalOpen, setViewFornecedorModalOpen] = React.useState(false);
  const [hoveredFornecedorId, setHoveredFornecedorId] = React.useState<number | null>(null);

  const viewFornecedor = React.useMemo(() => {
    if (viewFornecedorId === null) return null;
    return fornecedorRows.find((row) => row.id === viewFornecedorId) ?? null;
  }, [fornecedorRows, viewFornecedorId]);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const parsed = parseCadastroSearchParams(params);
    setUrlRecorrenciaFilter(parsed.recorrencia ? recorrenciaSlugToLabel(parsed.recorrencia) : null);
    setUrlFilters(parsed);

    if (parsed.regimeTributario) {
      const regimeDrawerValue = regimeTributarioSlugToDrawerValue(parsed.regimeTributario);
      setAppliedFilters((prev) =>
        prev.regimeTributario === regimeDrawerValue
          ? prev
          : { ...prev, regimeTributario: regimeDrawerValue },
      );
      setDraftFilters((prev) =>
        prev.regimeTributario === regimeDrawerValue
          ? prev
          : { ...prev, regimeTributario: regimeDrawerValue },
      );
    }
  }, [searchParamsString]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== `#${CADASTRO_TABLE_ANCHOR}`) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToCadastroTable();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    searchParamsString,
    urlRecorrenciaFilter,
    urlFilters.regimeTributario,
    urlFilters.destaqueCbsIbs,
    urlFilters.visaoGeral,
  ]);

  const filteredRows = React.useMemo(() => {
    let rows = fornecedorRows;

    if (urlRecorrenciaFilter) {
      rows = rows.filter((row) => row.recorrencia === urlRecorrenciaFilter);
    }

    if (urlFilters.regimeTributario) {
      rows = rows.filter((row) =>
        matchesRegimeTributarioSlug(row.regimeTributario, urlFilters.regimeTributario!),
      );
    }

    if (urlFilters.destaqueCbsIbs) {
      rows = rows.filter((row) =>
        matchesDestaqueCbsIbsSlug(row.comproCgsIss, urlFilters.destaqueCbsIbs!),
      );
    }

    return applyVisaoGeralToRows(rows, urlFilters.visaoGeral);
  }, [
    fornecedorRows,
    urlRecorrenciaFilter,
    urlFilters.regimeTributario,
    urlFilters.destaqueCbsIbs,
    urlFilters.visaoGeral,
  ]);

  const fornecedorPagination = useListingPagination(filteredRows, 25);
  const paginatedFornecedorRows = fornecedorPagination.paginatedItems;
  const visibleFornecedorIds = React.useMemo(
    () => paginatedFornecedorRows.map((row) => row.id),
    [paginatedFornecedorRows],
  );
  const visibleSelectedCount = React.useMemo(
    () => visibleFornecedorIds.filter((id) => selectedFornecedorIds.includes(id)).length,
    [selectedFornecedorIds, visibleFornecedorIds],
  );
  const allVisibleSelected =
    visibleFornecedorIds.length > 0 && visibleSelectedCount === visibleFornecedorIds.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;
  const handleToggleFornecedorSelection = React.useCallback((fornecedorId: number) => {
    setSelectedFornecedorIds((prev) =>
      prev.includes(fornecedorId)
        ? prev.filter((id) => id !== fornecedorId)
        : [...prev, fornecedorId],
    );
  }, []);

  const openFornecedorView = React.useCallback((fornecedorId: number) => {
    setViewFornecedorId(fornecedorId);
    setViewFornecedorModalOpen(true);
  }, []);

  const handleToggleAllVisibleFornecedores = React.useCallback(() => {
    setSelectedFornecedorIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleFornecedorIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleFornecedorIds]));
    });
  }, [allVisibleSelected, visibleFornecedorIds]);

  const handleExportToExcel = React.useCallback(() => {
    if (selectedFornecedorIds.length === 0) return;

    toast.success("Download em processamento. Disponível em breve nas Notificações.", {
      duration: 5000,
    });
    enqueueFornecedoresExcelExportNotification();
  }, [selectedFornecedorIds.length, enqueueFornecedoresExcelExportNotification]);

  const updateVisaoGeralFilter = React.useCallback(
    (nextSlugs: VisaoGeralSlug[] | null) => {
      const params = setVisaoGeralInSearchParams(
        new URLSearchParams(searchParamsString),
        nextSlugs,
      );
      const query = params.toString();
      const hash = `#${CADASTRO_TABLE_ANCHOR}`;
      router.replace(query ? `${pathname}?${query}${hash}` : `${pathname}${hash}`, {
        scroll: false,
      });
      scrollToCadastroTable();
    },
    [pathname, router, searchParamsString],
  );

  const handleOverviewCardClick = (cardId: (typeof OVERVIEW_CARDS)[number]["id"]) => {
    const slug = OVERVIEW_CARD_TO_VISAO_GERAL[cardId];
    if (!slug) return;

    const current = urlFilters.visaoGeral ?? [];
    const isActive = current.includes(slug);
    const next = isActive ? current.filter((item) => item !== slug) : [...current, slug];
    updateVisaoGeralFilter(next.length > 0 ? next : null);
  };

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const handleClearFilters = () => {
    setDraftFilters(DEFAULT_CADASTRO_FILTERS);
    setAppliedFilters(DEFAULT_CADASTRO_FILTERS);
    if ((urlFilters.visaoGeral?.length ?? 0) > 0) {
      updateVisaoGeralFilter(null);
    }
  };

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <div className="space-y-1">
          <label className="text-sm font-bold text-[#3D4350]">CNPJ</label>
          <Input placeholder="Digite o CNPJ" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-[#3D4350]">Razão Social</label>
          <Input placeholder="Digite a razão social" />
        </div>

        <div>
          <Button variant="secondary" className="h-9 gap-2 px-4" onClick={handleOpenFilters}>
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      <CadastroFiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={draftFilters}
        onFiltersChange={setDraftFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <VerFornecedorModal
        open={viewFornecedorModalOpen}
        onOpenChange={(open) => {
          setViewFornecedorModalOpen(open);
          if (!open) setViewFornecedorId(null);
        }}
        fornecedor={viewFornecedor}
        onUpdateFornecedor={onUpdateFornecedor}
      />

      <OverviewCardsSection
        title="Visão geral de fornecedores"
        expanded={showOverview}
        onToggle={onToggleOverview}
        footer={<p className="mt-1 text-xs font-medium text-[#5F6572]">Período: Fevereiro</p>}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OVERVIEW_CARDS.map((card) => {
            const filterSlug = OVERVIEW_CARD_TO_VISAO_GERAL[card.id];
            const isSelected =
              filterSlug !== undefined && (urlFilters.visaoGeral?.includes(filterSlug) ?? false);

            return (
              <BigNumberCard
                key={card.id}
                value={card.value}
                label={card.label}
                count={"count" in card ? card.count : undefined}
                unit={"unit" in card ? card.unit : undefined}
                onClick={() => handleOverviewCardClick(card.id)}
                isSelected={isSelected}
                disableWhenZero={false}
              />
            );
          })}
        </div>
      </OverviewCardsSection>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-9 gap-2 px-4"
          onClick={handleExportToExcel}
        >
          <Download className="h-4 w-4" />
          Exportar para Excel
        </Button>
      </div>

      <span
        id={CADASTRO_TABLE_ANCHOR}
        className="pointer-events-none block h-0 scroll-mt-4 outline-none target:outline-none"
        aria-hidden
      />
      <div className="relative -mx-3 overflow-x-auto border-t border-border lg:-mx-4">
        <table
          className="w-full table-fixed text-sm"
          style={{ minWidth: CADASTRO_TABLE_MIN_WIDTH }}
        >
          <colgroup>
            <col className="w-10" />
            <col className="w-[88px]" />
            <col className="w-[152px]" />
            <col className="w-[236px]" />
            <col className="w-[96px]" />
            <col className="w-[152px]" />
            <col className="w-[136px]" />
            <col className="w-[152px]" />
            <col className="w-[140px]" />
            <col className="w-[152px]" />
            <col className="w-[196px]" />
            <col className="w-[132px]" />
            <col className="w-[116px]" />
            <col className="w-[188px]" />
            <col className="w-[168px]" />
            <col className="w-[104px]" />
            <col className="w-[320px]" />
            <col className="w-[168px]" />
          </colgroup>
          <thead>
            <tr className={TABLE_HEAD_ROW_CLASS}>
              <th className="sticky left-0 z-20 bg-[#F5F5F6] pl-3 pr-2 text-center shadow-[1px_0_0_0_rgba(4,14,35,0.08)]">
                <input
                  type="checkbox"
                  aria-label="Selecionar todos os fornecedores visíveis"
                  checked={allVisibleSelected}
                  ref={(element) => {
                    if (!element) return;
                    element.indeterminate = someVisibleSelected;
                  }}
                  onChange={handleToggleAllVisibleFornecedores}
                  className={TABLE_CHECKBOX_CLASS}
                />
              </th>
              <th
                className={cn(
                  TABLE_HEAD_CELL_CLASS,
                  "sticky left-10 z-20 bg-[#F5F5F6] text-center shadow-[1px_0_0_0_rgba(4,14,35,0.08)]",
                )}
              >
                Detalhe
              </th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>CNPJ</th>
              <th className={TABLE_HEAD_CELL_CLASS}>Razão Social</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>CBS/IBS</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Dados de pagamento</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Situação cadastral</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Acesso ao portal</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Regime tributário</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Localização</th>
              <th className={TABLE_HEAD_CELL_CLASS}>Nome fantasia</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Telefone</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Última compra</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>
                Valor comprado (fev/2024)
              </th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "text-right whitespace-nowrap")}>
                Qtd de notas (fev/2024)
              </th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Recorrência</th>
              <th className={TABLE_HEAD_CELL_CLASS}>CNAE</th>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                Última atualização na receita
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={18} className="px-3 py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7EEFF]">
                      <Building2 className="h-6 w-6 text-[#0C3CF7]" aria-hidden />
                    </div>
                    <h3 className="text-base font-semibold text-[#0d0f1c]">
                      Nenhum fornecedor encontrado.
                    </h3>
                    <p className="mt-1 text-sm text-[#5F6572]">
                      Ajuste os filtros ou selecione outro card para visualizar resultados.
                    </p>
                  </div>
                </td>
              </tr>
            ) : null}
            {paginatedFornecedorRows.map((row) => {
              const isRowSelected = selectedFornecedorIds.includes(row.id);
              const isRowViewing = viewFornecedorModalOpen && viewFornecedorId === row.id;
              const isRowHovered = hoveredFornecedorId === row.id && !isRowSelected;
              const primaryTextClass = isRowHovered ? "text-white" : TABLE_PRIMARY_TEXT_CLASS;
              const secondaryTextClass = isRowHovered ? "text-white/80" : TABLE_SECONDARY_TEXT_CLASS;
              const stickyBg = cn(
                isRowSelected
                  ? "bg-[#F3F5FF]"
                  : isRowHovered
                    ? "bg-[#040E23]"
                    : isRowViewing
                      ? "bg-[#FAFAFF]"
                      : "bg-white",
              );

              return (
                <React.Fragment key={row.id}>
                  <tr
                    className={cn(
                      "border-b border-border transition-colors",
                      isRowSelected
                        ? "bg-[#F3F5FF]"
                        : isRowHovered
                          ? "bg-[#040E23]"
                          : isRowViewing
                            ? "bg-[#FAFAFF]"
                            : "bg-white",
                    )}
                    onMouseEnter={() => setHoveredFornecedorId(row.id)}
                    onMouseLeave={() => setHoveredFornecedorId(null)}
                  >
                    <td
                      className={cn(
                        "relative sticky left-0 z-10 py-3 pl-3 pr-2 text-center align-middle shadow-[1px_0_0_0_rgba(4,14,35,0.08)]",
                        stickyBg,
                      )}
                    >
                      {isRowViewing ? (
                        <span
                          className="absolute bottom-0 left-0 top-0 w-[3px] bg-[#0C3CF7]"
                          aria-hidden
                        />
                      ) : null}
                      <input
                        type="checkbox"
                        aria-label={`Selecionar fornecedor ${row.id}`}
                        checked={isRowSelected}
                        onChange={() => handleToggleFornecedorSelection(row.id)}
                        className={cn(
                          TABLE_CHECKBOX_CLASS,
                          isRowHovered && "border-white/40 bg-white/10",
                        )}
                      />
                    </td>
                    <td
                      className={cn(
                        "sticky left-10 z-10 text-center shadow-[1px_0_0_0_rgba(4,14,35,0.08)]",
                        TABLE_BODY_CELL_CLASS,
                        stickyBg,
                      )}
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="font-bold"
                        onClick={() => openFornecedorView(row.id)}
                      >
                        Ver
                      </Button>
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "whitespace-nowrap transition-colors",
                        secondaryTextClass,
                      )}
                    >
                      {row.cnpj}
                    </td>
                    <td className={cn(TABLE_BODY_CELL_CLASS, "transition-colors")}>
                      <span
                        className={cn("block truncate font-medium", primaryTextClass)}
                        title={row.razaoSocial}
                      >
                        {row.razaoSocial}
                      </span>
                    </td>
                    <td className={cn(TABLE_BODY_CELL_CLASS, "transition-colors")}>
                      {row.comproCgsIss.length > 0 ? (
                        <span
                          className={cn("block truncate whitespace-nowrap", primaryTextClass)}
                          title={row.comproCgsIss.join(", ")}
                        >
                          {row.comproCgsIss.join(", ")}
                        </span>
                      ) : (
                        <span className={secondaryTextClass}>—</span>
                      )}
                    </td>
                    <td className={cn(TABLE_BODY_CELL_CLASS, "transition-colors")}>
                      {isRowHovered ? (
                        <span className="whitespace-nowrap text-sm text-white">
                          {row.dadosPagamento}
                        </span>
                      ) : (
                        <PortalCadastroTag variant={pagamentoCadastroVariant(row.dadosPagamento)}>
                          {row.dadosPagamento}
                        </PortalCadastroTag>
                      )}
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "whitespace-nowrap transition-colors",
                        primaryTextClass,
                      )}
                    >
                      {row.situacaoCadastral}
                    </td>
                    <td className={cn(TABLE_BODY_CELL_CLASS, "transition-colors")}>
                      {row.acessoPortal === "-" ? (
                        <span className={secondaryTextClass}>—</span>
                      ) : (
                        <span className={cn("whitespace-nowrap", primaryTextClass)}>
                          {row.acessoPortal}
                        </span>
                      )}
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "whitespace-nowrap transition-colors",
                        primaryTextClass,
                      )}
                    >
                      {row.regimeTributario}
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "whitespace-nowrap transition-colors",
                        secondaryTextClass,
                      )}
                    >
                      {row.localizacao}
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "truncate transition-colors",
                        primaryTextClass,
                      )}
                    >
                      {row.nomeFantasia}
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "whitespace-nowrap transition-colors",
                        secondaryTextClass,
                      )}
                    >
                      {row.telefone}
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "whitespace-nowrap transition-colors",
                        primaryTextClass,
                      )}
                    >
                      {row.ultimaCompra}
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "text-right font-semibold tabular-nums whitespace-nowrap transition-colors",
                        primaryTextClass,
                      )}
                    >
                      {row.valorComprado}
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "text-right tabular-nums transition-colors",
                        primaryTextClass,
                      )}
                    >
                      {row.qtdNotas}
                    </td>
                    <td className={cn(TABLE_BODY_CELL_CLASS, "transition-colors")}>
                      {isRowHovered ? (
                        <span className="whitespace-nowrap text-sm text-white">
                          {row.recorrencia}
                        </span>
                      ) : (
                        <PortalCadastroTag variant={recorrenciaCadastroVariant(row.recorrencia)}>
                          {row.recorrencia}
                        </PortalCadastroTag>
                      )}
                    </td>
                    <td className={cn(TABLE_BODY_CELL_CLASS, "transition-colors")}>
                      <span
                        className="block truncate"
                        title={`${row.cnaeCodigo} | ${row.cnaeDescricao}`}
                      >
                        <span className={cn("font-medium", primaryTextClass)}>
                          {row.cnaeCodigo}
                        </span>
                        <span className={secondaryTextClass}> | </span>
                        <span className={secondaryTextClass}>{row.cnaeDescricao}</span>
                      </span>
                    </td>
                    <td
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        "whitespace-nowrap transition-colors",
                        secondaryTextClass,
                      )}
                    >
                      {row.ultimaAtualizacaoReceita}
                    </td>
                  </tr>
                  {isRowHovered ? (
                    <tr
                      className="h-0 border-0 bg-transparent leading-[0]"
                      onMouseEnter={() => setHoveredFornecedorId(row.id)}
                      onMouseLeave={() => setHoveredFornecedorId(null)}
                    >
                      <td colSpan={18} className="relative h-0 border-0 bg-transparent p-0 leading-[0]">
                        <div className="pointer-events-auto absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 pb-1">
                          <CadastroTableRowHoverActions
                            fornecedor={row}
                            onVisualizar={() => openFornecedorView(row.id)}
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
        page={fornecedorPagination.page}
        pageSize={fornecedorPagination.pageSize}
        totalItems={fornecedorPagination.totalItems}
        onPageChange={fornecedorPagination.setPage}
        onPageSizeChange={fornecedorPagination.setPageSize}
        hasNextPage={fornecedorPagination.hasNextPage}
        hasPrevPage={fornecedorPagination.hasPrevPage}
        itemLabel="fornecedores"
      />
    </>
  );
}
