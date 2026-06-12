"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/navigation/Footer";
import { ListingTablePagination } from "@/components/shared/ListingTablePagination";
import { useListingPagination } from "@/components/shared/ListingTablePagination/useListingPagination";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import { useTheme } from "@/lib/theme/useTheme";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  FileText,
  Building2,
  Box,
  Gem,
  Store,
  Search,
  ChevronDown,
} from "lucide-react";
import { AccountSidebar } from "./components/AccountSidebar";
import { InformacoesFaturamentoModal } from "./components/InformacoesFaturamentoModal";
import { PacotesExtrasDetalhesModal } from "./components/PacotesExtrasDetalhesModal";
import {
  formatFaturaCurrency,
  MOCK_FATURAS,
  type Fatura,
  type FaturaStatus,
} from "./data/mock-faturas";
import {
  CURRENT_ACCOUNT_PLAN,
  getCurrentPlanDisplayName,
  getCurrentPlanDfeLimit,
} from "./data/mock-planos";

const STATUS_OPTIONS = ["Todas", "Vencido", "Pendente", "Pago"] as const;

const companiesSummary = {
  total: 233,
  active: 212,
  activationRate: "90% ativas",
  lastEdition: "01/02/2004",
};

const accountAdmin = {
  name: "João da Silva",
  email: "joaosilva@construtora.com.br",
  phone: "(11) 3332-3333",
};

function FaturaStatusTag({ status }: { status: FaturaStatus }) {
  const { tagModel } = useTheme();
  const isCompact = tagModel === "compact";

  const cls =
    status === "Pago"
      ? isCompact
        ? "bg-emerald-50 text-emerald-700"
        : "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "Vencido"
        ? isCompact
          ? "bg-[#F8B9B4] text-[#B9221D]"
          : "bg-[#F8B9B4] text-[#B9221D] border-[#F8B9B4]"
        : isCompact
          ? "bg-[#FFD294] text-[#B85600]"
          : "bg-[#FFD294] text-[#B85600] border-[#FFD294]";

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

function SummaryCard({
  items,
  columns = 2,
}: {
  items: { label: string; value: string }[];
  columns?: 2 | 3 | 4;
}) {
  const gridClass =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="rounded-lg border border-border bg-white px-4 py-4">
      <div className={cn("grid gap-6", gridClass)}>
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs font-medium text-[#4B5563]">{item.label}</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function applyFaturaFilters(
  faturas: Fatura[],
  search: string,
  status: (typeof STATUS_OPTIONS)[number],
): Fatura[] {
  const normalizedSearch = search.trim().toLowerCase();

  return faturas.filter((fatura) => {
    const statusMatch = status === "Todas" || fatura.status === status;
    if (!statusMatch) return false;

    if (!normalizedSearch) return true;

    const searchable = [
      fatura.descricao,
      fatura.formaPagamento,
      fatura.vencimento,
      fatura.status,
      formatFaturaCurrency(fatura.valor),
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedSearch);
  });
}

export default function AccountManagementPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_OPTIONS)[number]>("Todas");
  const [billingInfoModalOpen, setBillingInfoModalOpen] = React.useState(false);
  const [pacotesExtrasModalOpen, setPacotesExtrasModalOpen] = React.useState(false);

  const filteredFaturas = React.useMemo(
    () => applyFaturaFilters(MOCK_FATURAS, search, statusFilter),
    [search, statusFilter],
  );

  const pagination = useListingPagination(filteredFaturas, 5);

  const handleVerFatura = (faturaId: string) => {
    router.push(`/fatura/${faturaId}`);
  };

  const handleAlterarPlano = () => {
    router.push(
      `/minha-conta/escolha-plano?plano=${CURRENT_ACCOUNT_PLAN.planId}`,
    );
  };

  return (
    <section className="p-6 min-h-full box-border">
      <div className="w-full min-h-full mx-auto">
        <div className="flex min-h-full gap-6 items-stretch flex-col lg:flex-row">
          <AccountSidebar />

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-[#0d0f1c]">Gestão da conta</h1>
            </div>

            {/* Faturas */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-[#0d0f1c]">Faturas</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#4B5563] hover:text-[#111827]"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Atualizar listagem</span>
                  </button>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs font-medium"
                  onClick={() => setBillingInfoModalOpen(true)}
                >
                  <Building2 className="mr-1.5 h-3.5 w-3.5" />
                  Informações de faturamento
                </Button>
              </div>

              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-3 px-4 pt-4 pb-4 sm:flex-row sm:items-end">
                    <div className="flex-1 sm:basis-2/3">
                      <Label
                        className="mb-1 block text-sm font-semibold"
                        style={{ color: "#5F6572" }}
                      >
                        Busca rápida
                      </Label>
                      <div className="relative">
                        <Input
                          placeholder="Ex: CNPJ, Razão Social ..."
                          className="w-full pr-9 shadow-none"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
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

                  <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-sm">
                      <thead>
                        <tr className={TABLE_HEAD_ROW_CLASS}>
                          <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                            Fatura
                          </th>
                          <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                            Vencimento
                          </th>
                          <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>
                            Valor
                          </th>
                          <th className={TABLE_HEAD_CELL_CLASS}>Status</th>
                          <th className={TABLE_HEAD_CELL_CLASS}>Descrição</th>
                          <th className={TABLE_HEAD_CELL_CLASS}>Forma de pagamento</th>
                          <th className={cn(TABLE_HEAD_CELL_CLASS, "text-center")}>
                            Ver nota
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagination.paginatedItems.map((fatura) => (
                          <tr key={fatura.id} className={TABLE_BODY_ROW_CLASS}>
                            <td className={TABLE_BODY_CELL_CLASS}>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 px-4 font-semibold"
                                onClick={() => handleVerFatura(fatura.id)}
                              >
                                Ver
                              </Button>
                            </td>
                            <td
                              className={cn(
                                TABLE_BODY_CELL_CLASS,
                                "whitespace-nowrap",
                                TABLE_SECONDARY_TEXT_CLASS,
                              )}
                            >
                              {fatura.vencimento}
                            </td>
                            <td
                              className={cn(
                                TABLE_BODY_CELL_CLASS,
                                "whitespace-nowrap",
                                TABLE_PRIMARY_TEXT_CLASS,
                              )}
                            >
                              {formatFaturaCurrency(fatura.valor)}
                            </td>
                            <td className={TABLE_BODY_CELL_CLASS}>
                              <FaturaStatusTag status={fatura.status} />
                            </td>
                            <td className={cn(TABLE_BODY_CELL_CLASS, TABLE_PRIMARY_TEXT_CLASS)}>
                              <span className="block truncate max-w-[240px]" title={fatura.descricao}>
                                {fatura.descricao}
                              </span>
                            </td>
                            <td
                              className={cn(
                                TABLE_BODY_CELL_CLASS,
                                "whitespace-nowrap",
                                TABLE_SECONDARY_TEXT_CLASS,
                              )}
                            >
                              {fatura.formaPagamento}
                            </td>
                            <td className={cn(TABLE_BODY_CELL_CLASS, "text-center")}>
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 text-[#5F6572] hover:text-[#0d0f1c]"
                                aria-label="Ver nota fiscal"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
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
                    pageSizeOptions={[5, 10, 25, 50]}
                    itemLabel="faturas"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Plano contratado */}
            <div className="space-y-3 mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-base font-semibold text-[#0d0f1c]">
                  Plano contratado
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs font-medium inline-flex items-center gap-1"
                    onClick={() => setPacotesExtrasModalOpen(true)}
                  >
                    <Box className="h-3.5 w-3.5" />
                    Pacotes extras e detalhes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs font-medium inline-flex items-center gap-1"
                    onClick={handleAlterarPlano}
                  >
                    <Gem className="h-3.5 w-3.5" />
                    Alterar plano
                  </Button>
                </div>
              </div>

              <SummaryCard
                columns={2}
                items={[
                  { label: "Plano atual", value: getCurrentPlanDisplayName() },
                  {
                    label: "Limite de DFe",
                    value: getCurrentPlanDfeLimit().toLocaleString("pt-BR"),
                  },
                ]}
              />
            </div>

            {/* Listagem de empresas */}
            <div className="space-y-3 mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-base font-semibold text-[#0d0f1c]">
                  Listagem de empresas
                </span>
                <Link href="/minha-conta/empresas">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs font-medium flex items-center gap-1"
                  >
                    <Store className="h-3.5 w-3.5" />
                    Ver todas empresas
                  </Button>
                </Link>
              </div>

              <SummaryCard
                columns={4}
                items={[
                  {
                    label: "Empresas cadastradas",
                    value: String(companiesSummary.total),
                  },
                  { label: "Ativas", value: String(companiesSummary.active) },
                  {
                    label: "Percentual de ativas",
                    value: companiesSummary.activationRate,
                  },
                  { label: "Última edição", value: companiesSummary.lastEdition },
                ]}
              />
            </div>

            {/* Administrador da conta */}
            <div className="space-y-3 mt-10">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#0d0f1c]">
                  Administrador da conta
                </span>
              </div>

              <SummaryCard
                columns={3}
                items={[
                  { label: "Nome", value: accountAdmin.name },
                  { label: "E-mail", value: accountAdmin.email },
                  { label: "Telefone", value: accountAdmin.phone },
                ]}
              />
            </div>

            <div className="mt-auto pt-8">
              <Footer />
            </div>

            <InformacoesFaturamentoModal
              open={billingInfoModalOpen}
              onOpenChange={setBillingInfoModalOpen}
            />
            <PacotesExtrasDetalhesModal
              open={pacotesExtrasModalOpen}
              onOpenChange={setPacotesExtrasModalOpen}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
