"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/navigation/Footer";
import { ListingTablePagination } from "@/components/shared/ListingTablePagination";
import { useListingPagination } from "@/components/shared/ListingTablePagination/useListingPagination";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_CHECKBOX_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import { useTheme } from "@/lib/theme/useTheme";
import { cn } from "@/lib/utils";
import {
  Search,
  Download,
  ChevronDown,
  PencilLine,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";
import { AccountSidebar } from "../components/AccountSidebar";
import {
  COMPANIES_SUMMARY,
  MOCK_COMPANIES,
  type AccountCompany,
} from "./data/mock-empresas";

const companiesSummary = COMPANIES_SUMMARY;

const STATUS_OPTIONS = ["Todas", "Ativa", "Inativa"] as const;

const BULK_ACTION_BUTTON_CLASS =
  "inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]";

const companies = MOCK_COMPANIES;

function applyStatusFilter(
  items: AccountCompany[],
  status: (typeof STATUS_OPTIONS)[number],
) {
  if (status === "Todas") return items;

  return items.filter((company) =>
    status === "Ativa"
      ? company.status.startsWith("Ativa")
      : company.status === status,
  );
}

function CompanyStatusTag({ status }: { status: string }) {
  const { tagModel } = useTheme();
  const isCompact = tagModel === "compact";

  const cls =
    status === "Ativa"
      ? isCompact
        ? "bg-emerald-50 text-emerald-700"
        : "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "Ativa*"
        ? isCompact
          ? "bg-[#FFD294] text-[#B85600]"
          : "bg-[#FFD294] text-[#B85600] border-[#FFD294]"
        : isCompact
          ? "bg-[#F8B9B4] text-[#B9221D]"
          : "bg-[#F8B9B4] text-[#B9221D] border-[#F8B9B4]";

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs",
        isCompact
          ? "h-5 py-[2px] px-2 rounded font-bold leading-4"
          : "h-6 px-2 rounded-full border font-medium",
        cls,
      )}
    >
      {status}
    </span>
  );
}

export default function AccountCompaniesPage() {
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_OPTIONS)[number]>("Todas");
  const [selectedCompanyIds, setSelectedCompanyIds] = React.useState<string[]>([]);

  const filteredCompanies = React.useMemo(
    () => applyStatusFilter(companies, statusFilter),
    [statusFilter],
  );

  const pagination = useListingPagination(filteredCompanies, 10);

  const visibleCompanyIds = React.useMemo(
    () => pagination.paginatedItems.map((company) => company.id),
    [pagination.paginatedItems],
  );

  const filteredCompanyIds = React.useMemo(
    () => filteredCompanies.map((company) => company.id),
    [filteredCompanies],
  );

  const selectedCount = selectedCompanyIds.length;
  const hasSelection = selectedCount > 0;

  const visibleSelectedCount = React.useMemo(
    () => visibleCompanyIds.filter((id) => selectedCompanyIds.includes(id)).length,
    [selectedCompanyIds, visibleCompanyIds],
  );

  const allVisibleSelected =
    visibleCompanyIds.length > 0 && visibleSelectedCount === visibleCompanyIds.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;

  const allFilteredSelected =
    filteredCompanyIds.length > 0 &&
    filteredCompanyIds.every((id) => selectedCompanyIds.includes(id));

  const handleToggleCompanySelection = React.useCallback((companyId: string) => {
    setSelectedCompanyIds((current) =>
      current.includes(companyId)
        ? current.filter((id) => id !== companyId)
        : [...current, companyId],
    );
  }, []);

  const handleToggleAllVisible = React.useCallback(() => {
    setSelectedCompanyIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleCompanyIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleCompanyIds]));
    });
  }, [allVisibleSelected, visibleCompanyIds]);

  const handleSelectAllFiltered = React.useCallback(() => {
    setSelectedCompanyIds((current) => {
      if (allFilteredSelected) {
        return current.filter((id) => !filteredCompanyIds.includes(id));
      }
      return Array.from(new Set([...current, ...filteredCompanyIds]));
    });
  }, [allFilteredSelected, filteredCompanyIds]);

  return (
    <section className="p-6 min-h-full box-border">
      <div className="w-full min-h-full mx-auto">
        <div className="flex min-h-full gap-6 items-stretch flex-col lg:flex-row">
          <AccountSidebar />

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold text-[#0d0f1c]">
                Empresas da conta
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-medium inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Adicionar certificado
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs font-medium inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar empresa
                </Button>
              </div>
            </div>

            <Card className="border-border">
              <CardContent className="p-0">
                <div className="flex flex-col gap-3 px-4 pt-4 pb-4 sm:flex-row sm:items-end">
                  <div className="flex-1 sm:basis-2/3">
                    <Label
                      className="mb-1 block text-sm font-semibold"
                      style={{ color: "#5F6572" }}
                    >
                      Buscar empresa por
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="Ex: CNPJ, razão social"
                        className="w-full pr-9 shadow-none"
                      />
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 sm:basis-1/3">
                    <Label
                      className="mb-1 block text-sm font-semibold"
                      style={{ color: "#5F6572" }}
                    >
                      Status
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold hover:bg-[#EFF1F2]"
                        >
                          <span
                            className={cn(
                              "t-text-sm truncate",
                              statusFilter === "Todas" && "text-muted-foreground",
                            )}
                          >
                            {statusFilter}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[var(--radix-dropdown-menu-trigger-width)]"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option}
                            onClick={() => setStatusFilter(option)}
                          >
                            {option}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="h-px bg-[#EBECEE]" />

                <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                  <Button
                    variant="secondary"
                    size="default"
                    className="inline-flex items-center gap-2 font-bold"
                    onClick={handleSelectAllFiltered}
                  >
                    Selecionar todas
                    <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#EAEBEC] text-sm text-current tabular-nums min-w-[56px]">
                      {selectedCount} / {companiesSummary.total}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hasSelection}
                    className={BULK_ACTION_BUTTON_CLASS}
                  >
                    <X className="h-4 w-4" />
                    Inativar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hasSelection}
                    className={BULK_ACTION_BUTTON_CLASS}
                  >
                    <Download className="h-4 w-4" />
                    Exportar lista
                  </Button>
                </div>

                <div className="h-px bg-[#EBECEE]" />

                <div className="overflow-x-auto">
                  <table className="min-w-[960px] w-full text-sm">
                    <thead>
                      <tr className={TABLE_HEAD_ROW_CLASS}>
                        <th className="w-10 pl-3 pr-2 py-2 text-center">
                          <input
                            type="checkbox"
                            aria-label="Selecionar todas as empresas visíveis"
                            checked={allVisibleSelected}
                            ref={(element) => {
                              if (!element) return;
                              element.indeterminate = someVisibleSelected;
                            }}
                            onChange={handleToggleAllVisible}
                            className={TABLE_CHECKBOX_CLASS}
                          />
                        </th>
                        <th
                          className={cn(
                            TABLE_HEAD_CELL_CLASS,
                            "w-[72px] whitespace-nowrap",
                          )}
                        >
                          Editar
                        </th>
                        <th className={TABLE_HEAD_CELL_CLASS}>
                          <span className="inline-flex items-center gap-1">
                            Empresa
                            <ChevronDown className="h-3.5 w-3.5 text-[#5F6572]" />
                          </span>
                        </th>
                        <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                          CPF/CNPJ
                        </th>
                        <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                          IM
                        </th>
                        <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                          UF
                        </th>
                        <th className={TABLE_HEAD_CELL_CLASS}>Status</th>
                        <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                          Cadastro
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagination.paginatedItems.map((company) => {
                        const isRowSelected = selectedCompanyIds.includes(company.id);

                        return (
                        <tr
                          key={company.id}
                          className={cn(
                            "border-b border-border transition-colors last:border-b-0",
                            isRowSelected ? "bg-[#F3F5FF]" : "bg-white hover:bg-[#FAFAFF]",
                          )}
                        >
                          <td className="pl-3 pr-2 py-3 text-center align-middle">
                            <input
                              type="checkbox"
                              aria-label={`Selecionar ${company.name}`}
                              checked={isRowSelected}
                              onChange={() => handleToggleCompanySelection(company.id)}
                              className={TABLE_CHECKBOX_CLASS}
                            />
                          </td>
                          <td className={TABLE_BODY_CELL_CLASS}>
                            <Button
                              asChild
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 text-[#5F6572] hover:text-[#0d0f1c]"
                            >
                              <Link
                                href={`/minha-conta/empresas/${company.id}/editar`}
                                aria-label={`Editar ${company.name}`}
                              >
                                <PencilLine className="h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                          <td
                            className={cn(
                              TABLE_BODY_CELL_CLASS,
                              TABLE_PRIMARY_TEXT_CLASS,
                              "font-medium",
                            )}
                          >
                            {company.name}
                          </td>
                          <td
                            className={cn(
                              TABLE_BODY_CELL_CLASS,
                              TABLE_SECONDARY_TEXT_CLASS,
                              "whitespace-nowrap",
                            )}
                          >
                            {company.cpfCnpj}
                          </td>
                          <td
                            className={cn(
                              TABLE_BODY_CELL_CLASS,
                              TABLE_SECONDARY_TEXT_CLASS,
                            )}
                          >
                            {company.im}
                          </td>
                          <td
                            className={cn(
                              TABLE_BODY_CELL_CLASS,
                              TABLE_SECONDARY_TEXT_CLASS,
                            )}
                          >
                            {company.uf}
                          </td>
                          <td className={TABLE_BODY_CELL_CLASS}>
                            <CompanyStatusTag status={company.status} />
                          </td>
                          <td
                            className={cn(
                              TABLE_BODY_CELL_CLASS,
                              TABLE_SECONDARY_TEXT_CLASS,
                              "whitespace-nowrap",
                            )}
                          >
                            {company.createdAt}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <ListingTablePagination
                  className="border-[rgba(4,14,35,0.08)] px-3 lg:px-4 pb-4"
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  totalItems={pagination.totalItems}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  pageSizeOptions={[10, 25, 50, 100]}
                  itemLabel="empresas"
                />
              </CardContent>
            </Card>

            <div className="mt-auto pt-8">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
