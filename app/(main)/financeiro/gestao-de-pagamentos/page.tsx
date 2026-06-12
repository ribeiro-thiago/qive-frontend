"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ProductToolbar } from "@/components/layout/ProductToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogClose, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tag } from "@/components/ui/tag";
import { Plus, Filter, ChevronDown, Search, Calendar, CheckCircle2, X, Settings, Trash2, Landmark, ChevronLeft, Info, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Row, BankAccount, PaymentTabId } from "./types";
import { initialRows } from "./data/mock-data";
import { usePaymentFilters } from "./hooks/usePaymentFilters";
import { usePagination } from "./hooks/usePagination";
import { useDocumentModals } from "./hooks/useDocumentModals";
import { useNewItemsIndicator } from "./hooks/useNewItemsIndicator";
import { PaymentsTable } from "./components/PaymentsTable";
import { DANFEModal } from "./components/modals/DANFEModal";
import { BoletoModal } from "./components/modals/BoletoModal";
import { ComprovanteModal } from "./components/modals/ComprovanteModal";
import { NFSeModal } from "./components/modals/NFSeModal";
import { CTeModal } from "./components/modals/CTeModal";
import { PaymentDrawer } from "./components/PaymentDrawer";
import { StatusTag } from "./components/StatusTag";
import { formatCurrency, parseDate, getStartOfDay, addDays } from "./utils/formatters";
import {
  applyStoredManualDueDateEdits,
  MAX_DUE_DATE_RULE_DAYS,
} from "./utils/due-date";
import { companies } from "@/components/layout/CompanySelector";
import { useFeatures } from "@/lib/features/useFeatures";
import { AdvancedFilters, AdvancedFiltersState } from "./components/AdvancedFilters";
import { AppliedFiltersBar, type AppliedFilterTag } from "./components/AppliedFiltersBar";
import { NovoPagamentoModal } from "./components/modals/NovoPagamentoModal";
import { BanksOnboardingModal } from "./components/modals/BanksOnboardingModal";
import {
  DIVERGENCIAS_FILTER_OPTIONS,
  DIVERGENCIAS_FILTER_PLACEHOLDER,
} from "./utils/divergencias";
import {
  LANCADO_EM_FILTER_PLACEHOLDER,
  getLancadoEmFilterLabel,
  isLancadoEmFilterActive,
} from "./utils/lancadoEmFilter";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { toast } from "sonner";
import {
  getCbsPrevistoValue,
} from "./utils/cbs-previsto";
import {
  consumeCbsForecastFilterIntentFromDashboard,
} from "./utils/navigation-intent";

export default function PageContasAPagar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isFeatureEnabled, getEnabledOrigemTypes, getPagarButtonVersion } = useFeatures();
  const aprovacaoTabEnabled = isFeatureEnabled("gestao-de-pagamentos.aprovacao-tab");
  const tabNewItemsIndicatorEnabled = isFeatureEnabled("gestao-de-pagamentos.tab-new-items-indicator");
  const multiCompanySelectionEnabled = isFeatureEnabled("gestao-de-pagamentos.multi-company-selection");
  const filtrosAlternativosEnabled = isFeatureEnabled("gestao-de-pagamentos.filtros-alternativos");
  const novoPagamentoEnabled = isFeatureEnabled("gestao-de-pagamentos.novo-pagamento");
  const [rowsState, setRowsState] = React.useState<Row[]>([]);
  const [currentTab, setCurrentTab] = React.useState<string>("todas");
  
  // Filtros
  const [selectedCompany, setSelectedCompany] = React.useState<string[]>(["all"]);
  
  // Quando a feature de seleção múltipla é desabilitada, garantir que não seja "all"
  React.useEffect(() => {
    if (!multiCompanySelectionEnabled && selectedCompany.includes("all")) {
      setSelectedCompany(["matriz"]);
    }
  }, [multiCompanySelectionEnabled, selectedCompany]);
  const [status, setStatus] = React.useState<string>("Todos os Status");
  const [divergenciasFilter, setDivergenciasFilter] = React.useState<string>(
    DIVERGENCIAS_FILTER_PLACEHOLDER
  );
  const [period, setPeriod] = React.useState<string>("Todos os períodos");
  const [query, setQuery] = React.useState<string>("");
  const [visaoGeralFilter, setVisaoGeralFilter] = React.useState<string | null>(null);
  const [visaoGeralExpanded, setVisaoGeralExpanded] = React.useState<boolean>(true);
  
  // Filtros avançados
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);
  const [appliedFilters, setAppliedFilters] = React.useState<AdvancedFiltersState>({
    vencimentoInicio: '',
    vencimentoFim: '',
    emissaoInicio: '',
    emissaoFim: '',
    valorMinimo: '',
    valorMaximo: '',
    formaPagamento: 'Todos os tipos',
    origemDocumento: 'Todos os tipos',
    semDataVencimento: false,
    divergencias: '',
    cancelamentoOrigem: 'Todos os tipos',
    tipoCancelamento: 'Todos os tipos',
    notaAtualizadaAposCriacao: false,
    lancadoEm: LANCADO_EM_FILTER_PLACEHOLDER,
    cbsPrevistoMinimo: '',
    cbsPrevistoMaximo: '',
  });
  const [tempFilters, setTempFilters] = React.useState<AdvancedFiltersState>(appliedFilters);

  // Estado de seleção e visualização
  const [tableSelection, setTableSelection] = React.useState<Set<number>>(new Set());
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [dCurrent, setDCurrent] = React.useState<Row | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number>(-1);
  const [novoPagamentoOpen, setNovoPagamentoOpen] = React.useState(false);
  const [bankAccounts, setBankAccounts] = React.useState<BankAccount[]>([]);
  const [banksOnboardingOpen, setBanksOnboardingOpen] = React.useState(false);
  const [banksSummaryOpen, setBanksSummaryOpen] = React.useState(false);
  const [bankConfigOpen, setBankConfigOpen] = React.useState(false);
  const [bankConfigProvider, setBankConfigProvider] =
    React.useState<BankProviderId | null>(null);
  const pagarButtonVersion = getPagarButtonVersion() as "v1" | "v2";
  const [dueDateRules, setDueDateRules] = React.useState<DueDateRule[]>([]);
  const [dueDateModalOpen, setDueDateModalOpen] = React.useState(false);
  const [dueDateModalView, setDueDateModalView] = React.useState<"form" | "list">("form");
  const [paymentCondition, setPaymentCondition] = React.useState<string>("");
  const [paymentConditionMenuOpen, setPaymentConditionMenuOpen] = React.useState(false);
  const [customDays, setCustomDays] = React.useState<string>("");
  const [editingDueDateRuleId, setEditingDueDateRuleId] = React.useState<string | null>(null);

  const PAYMENT_CONDITION_OPTIONS = React.useMemo(
    () => [
      { value: "15", label: "15 dias" },
      { value: "30", label: "30 dias" },
      { value: "45", label: "45 dias" },
      { value: "60", label: "60 dias" },
      { value: "90", label: "90 dias" },
      { value: "other", label: "Outro" },
    ],
    []
  );

  type DueDatePaymentCondition = "15" | "30" | "45" | "60" | "90" | "other";
  interface DueDateRule {
    id: string;
    companyName: string;
    companyId?: string;
    companyCnpj?: string;
    days: number;
    paymentCondition: DueDatePaymentCondition;
    createdAt: string;
  }

  type DueDateTargetCompany = {
    name: string;
    id?: string;
    cnpj?: string;
  };

  const getDueDateRuleCompanyKey = React.useCallback((company: DueDateTargetCompany) => {
    if (company.id) return `id:${company.id}`;
    if (company.cnpj) return `cnpj:${company.cnpj}`;
    return `name:${company.name.trim().toLowerCase()}`;
  }, []);

  const dedupeDueDateRulesByCompany = React.useCallback(
    (rules: DueDateRule[]) => {
      const seenKeys = new Set<string>();
      const dedupedReversed: DueDateRule[] = [];

      for (let index = rules.length - 1; index >= 0; index -= 1) {
        const rule = rules[index];
        const key = getDueDateRuleCompanyKey({
          id: rule.companyId,
          cnpj: rule.companyCnpj,
          name: rule.companyName,
        });

        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        dedupedReversed.push(rule);
      }

      return dedupedReversed.reverse();
    },
    [getDueDateRuleCompanyKey]
  );

  const stripCnpjFromLabel = React.useCallback((full?: string) => {
    if (!full) return "";
    const cnpjPattern = /\s*\[\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\]\s*$/;
    return full.replace(cnpjPattern, "").trim();
  }, []);

  const [remainingCompaniesPopoverOpen, setRemainingCompaniesPopoverOpen] = React.useState(false);
  const selectedCompaniesForDueDateDescription = React.useMemo(
    () =>
      selectedCompany
        .filter((companyId) => companyId !== "all")
        .map((companyId) => companies.find((company) => company.id === companyId))
        .filter((company): company is (typeof companies)[number] => Boolean(company))
        .map((company) => ({
          id: company.id,
          name: stripCnpjFromLabel(company.full) || company.short,
          cnpj: company.cnpj,
        })),
    [selectedCompany, stripCnpjFromLabel]
  );
  const dueDateDescription = React.useMemo(() => {
    if (selectedCompany.includes("all")) {
      return (
        <>
          Defina em quantos dias após a emissão da nota o vencimento deve ser calculado para{" "}
          <strong className="font-semibold text-[#0d0f1c]">todas as empresas da conta</strong>.
        </>
      );
    }

    if (selectedCompaniesForDueDateDescription.length === 1) {
      const [company] = selectedCompaniesForDueDateDescription;
      return (
        <>
          Defina em quantos dias após a emissão da nota o vencimento deve ser calculado para a empresa{" "}
          <strong className="font-semibold text-[#0d0f1c]">{company.name}</strong>.
        </>
      );
    }

    if (selectedCompaniesForDueDateDescription.length === 2) {
      const [firstCompany, secondCompany] = selectedCompaniesForDueDateDescription;
      return (
        <>
          Defina em quantos dias após a emissão da nota o vencimento deve ser calculado para as empresas{" "}
          <strong className="font-semibold text-[#0d0f1c]">{firstCompany.name}</strong> e{" "}
          <strong className="font-semibold text-[#0d0f1c]">{secondCompany.name}</strong>.
        </>
      );
    }

    if (selectedCompaniesForDueDateDescription.length >= 3) {
      const [firstCompany, secondCompany, ...remainingCompanies] = selectedCompaniesForDueDateDescription;

      return (
        <>
          Defina em quantos dias após a emissão da nota o vencimento deve ser calculado para as empresas{" "}
          <strong className="font-semibold text-[#0d0f1c]">{firstCompany.name}</strong>,{" "}
          <strong className="font-semibold text-[#0d0f1c]">{secondCompany.name}</strong> e{" "}
          <Popover open={remainingCompaniesPopoverOpen} onOpenChange={setRemainingCompaniesPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex align-middle"
                aria-label="Ver empresas selecionadas adicionais"
                onMouseEnter={() => setRemainingCompaniesPopoverOpen(true)}
                onMouseLeave={() => setRemainingCompaniesPopoverOpen(false)}
                onFocus={() => setRemainingCompaniesPopoverOpen(true)}
                onBlur={() => setRemainingCompaniesPopoverOpen(false)}
              >
                <Tag className="h-5 bg-[#EFF1F2] text-[#0d0f1c] border-[#E5E7EB] px-2 text-xs">+{remainingCompanies.length}</Tag>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="z-[80] w-auto max-w-none p-3">
              <div className="space-y-1.5 text-sm text-[#5F6572]">
                {remainingCompanies.map((company) => (
                  <p className="whitespace-nowrap" key={company.id}>
                    {company.cnpj ? `${company.cnpj} — ${company.name}` : company.name}
                  </p>
                ))}
              </div>
            </PopoverContent>
          </Popover>.
        </>
      );
    }

    return (
      <>
        Defina em quantos dias após a emissão da nota o vencimento deve ser calculado.
      </>
    );
  }, [remainingCompaniesPopoverOpen, selectedCompaniesForDueDateDescription, selectedCompany]);

  const allIndividualCompaniesForDueDate = React.useMemo(
    () =>
      companies
        .filter((company) => company.id !== "all")
        .map((company) => ({
          name: stripCnpjFromLabel(company.full) || company.short,
          id: company.id,
          cnpj: company.cnpj,
        })),
    [stripCnpjFromLabel]
  );
  const selectedTargetCompaniesForDueDate = React.useMemo(
    () => (selectedCompany.includes("all") ? allIndividualCompaniesForDueDate : selectedCompaniesForDueDateDescription),
    [allIndividualCompaniesForDueDate, selectedCompaniesForDueDateDescription, selectedCompany]
  );
  const selectedTargetCompanyKeysForDueDate = React.useMemo(
    () => new Set(selectedTargetCompaniesForDueDate.map((company) => getDueDateRuleCompanyKey(company))),
    [getDueDateRuleCompanyKey, selectedTargetCompaniesForDueDate]
  );
  const visibleDueDateRules = React.useMemo(() => {
    if (selectedCompany.includes("all")) {
      return dueDateRules;
    }

    if (selectedTargetCompanyKeysForDueDate.size === 0) {
      return [];
    }

    return dueDateRules.filter((rule) =>
      selectedTargetCompanyKeysForDueDate.has(
        getDueDateRuleCompanyKey({
          id: rule.companyId,
          cnpj: rule.companyCnpj,
          name: rule.companyName,
        })
      )
    );
  }, [dueDateRules, getDueDateRuleCompanyKey, selectedCompany, selectedTargetCompanyKeysForDueDate]);
  const hasDueDateRulesForCurrentSelection = visibleDueDateRules.length > 0;
  const companyCnpjsWithDueDateRule = React.useMemo(() => {
    const cnpjs = new Set<string>();

    dueDateRules.forEach((rule) => {
      if (rule.companyId) {
        const companyById = companies.find((company) => company.id === rule.companyId);
        if (companyById?.cnpj) {
          cnpjs.add(companyById.cnpj);
          return;
        }
      }

      if (rule.companyCnpj) {
        cnpjs.add(rule.companyCnpj);
        return;
      }

      const normalizedRuleCompanyName = rule.companyName.trim().toLowerCase();
      const companyByName = companies.find((company) => {
        if (company.id === "all") return false;
        const normalizedCompanyName = (stripCnpjFromLabel(company.full) || company.short)
          .trim()
          .toLowerCase();
        return normalizedCompanyName === normalizedRuleCompanyName;
      });
      if (companyByName?.cnpj) {
        cnpjs.add(companyByName.cnpj);
      }
    });

    return cnpjs;
  }, [dueDateRules, stripCnpjFromLabel]);
  const hasDueDateRuleForRow = React.useCallback(
    (row: Row) => companyCnpjsWithDueDateRule.has(row.cnpjPagador),
    [companyCnpjsWithDueDateRule]
  );

  const shouldShowCustomDaysField = paymentCondition === "other";
  const customDaysAsNumber = Number(customDays);
  const customDaysTooHigh =
    shouldShowCustomDaysField &&
    customDays !== "" &&
    Number.isInteger(customDaysAsNumber) &&
    customDaysAsNumber > MAX_DUE_DATE_RULE_DAYS;
  const hasValidCustomDays =
    shouldShowCustomDaysField &&
    Number.isInteger(customDaysAsNumber) &&
    customDaysAsNumber > 0 &&
    customDaysAsNumber <= MAX_DUE_DATE_RULE_DAYS;
  const resolvedDueDays = shouldShowCustomDaysField
    ? hasValidCustomDays
      ? String(customDaysAsNumber)
      : ""
    : paymentCondition;
  const canSaveDueDateSettings =
    paymentCondition !== "" && (!shouldShowCustomDaysField || hasValidCustomDays);

  const resetDueDateModalForm = React.useCallback(() => {
    setPaymentCondition("");
    setPaymentConditionMenuOpen(false);
    setCustomDays("");
    setEditingDueDateRuleId(null);
  }, []);

  const handleDueDateModalOpenChange = React.useCallback(
    (open: boolean) => {
      setDueDateModalOpen(open);
      if (!open) {
        setDueDateModalView("form");
        resetDueDateModalForm();
      }
    },
    [resetDueDateModalForm]
  );
  const handleOpenDueDateModal = React.useCallback(() => {
    setDueDateModalOpen(true);
    setDueDateModalView(hasDueDateRulesForCurrentSelection ? "list" : "form");
  }, [hasDueDateRulesForCurrentSelection]);

  const handleSaveDueDateRule = React.useCallback(() => {
    if (!canSaveDueDateSettings) return;

    const days = Number(resolvedDueDays);
    if (!Number.isInteger(days) || days <= 0) return;
    if (days > MAX_DUE_DATE_RULE_DAYS) {
      toast.error(`O vencimento padrão não pode ser maior que ${MAX_DUE_DATE_RULE_DAYS} dias.`);
      return;
    }

    const condition = paymentCondition as DueDatePaymentCondition;
    const resolveCompanyCnpj = (company: DueDateTargetCompany) => {
      if (company.cnpj) return company.cnpj;
      if (company.id) return companies.find((item) => item.id === company.id)?.cnpj;
      const normalizedCompanyName = company.name.trim().toLowerCase();
      return companies.find((item) => {
        if (item.id === "all") return false;
        const itemName = (stripCnpjFromLabel(item.full) || item.short).trim().toLowerCase();
        return itemName === normalizedCompanyName;
      })?.cnpj;
    };

    const targetCompanyCnpjs = new Set<string>();
    if (editingDueDateRuleId) {
      const editingRule = dueDateRules.find((rule) => rule.id === editingDueDateRuleId);
      if (editingRule) {
        const editingRuleCnpj =
          editingRule.companyId
            ? companies.find((item) => item.id === editingRule.companyId)?.cnpj
            : undefined;
        const fallbackCnpj =
          editingRule.companyCnpj ??
          companies.find((item) => {
            if (item.id === "all") return false;
            const itemName = (stripCnpjFromLabel(item.full) || item.short).trim().toLowerCase();
            return itemName === editingRule.companyName.trim().toLowerCase();
          })?.cnpj;
        const resolvedEditingCnpj = editingRuleCnpj ?? fallbackCnpj;
        if (resolvedEditingCnpj) targetCompanyCnpjs.add(resolvedEditingCnpj);
      }
    } else {
      selectedTargetCompaniesForDueDate.forEach((company) => {
        const cnpj = resolveCompanyCnpj(company);
        if (cnpj) targetCompanyCnpjs.add(cnpj);
      });
    }

    setDueDateRules((prev) => {
      if (editingDueDateRuleId) {
        const editedRules = prev.map((rule) =>
          rule.id === editingDueDateRuleId
            ? {
                ...rule,
                days,
                paymentCondition: condition,
              }
            : rule
        );

        return dedupeDueDateRulesByCompany(editedRules);
      }

      const targetCompanies: DueDateTargetCompany[] = selectedTargetCompaniesForDueDate;

      if (targetCompanies.length === 0) {
        return dedupeDueDateRulesByCompany(prev);
      }

      let nextRules = [...prev];

      targetCompanies.forEach((company, companyIndex) => {
        const companyKey = getDueDateRuleCompanyKey(company);
        const existingRuleIndex = nextRules.findIndex(
          (rule) =>
            getDueDateRuleCompanyKey({
              id: rule.companyId,
              cnpj: rule.companyCnpj,
              name: rule.companyName,
            }) === companyKey
        );

        if (existingRuleIndex >= 0) {
          nextRules[existingRuleIndex] = {
            ...nextRules[existingRuleIndex],
            companyName: company.name,
            companyId: company.id,
            companyCnpj: company.cnpj,
            days,
            paymentCondition: condition,
          };
          return;
        }

        nextRules.push({
          id: `due-date-rule-${Date.now()}-${company.id ?? company.cnpj ?? companyIndex}`,
          companyName: company.name,
          companyId: company.id,
          companyCnpj: company.cnpj,
          days,
          paymentCondition: condition,
          createdAt: new Date().toISOString(),
        });
      });

      return dedupeDueDateRulesByCompany(nextRules);
    });

    if (targetCompanyCnpjs.size > 0) {
      setRowsState((prevRows) =>
        prevRows.map((row) => {
          if (!targetCompanyCnpjs.has(row.cnpjPagador)) return row;

          const emissionDate = parseDate(row.documentosAssociados?.[0]?.data);
          const baseDate = emissionDate ?? new Date();
          const calculatedDueDate = addDays(baseDate, days).toLocaleDateString("pt-BR");

          return {
            ...row,
            vencimento: calculatedDueDate,
          };
        })
      );
    }

    // TODO: Integrar persistência da parametrização de vencimento na API.
    setDueDateModalView("list");
    resetDueDateModalForm();
    toast.success("Regra de vencimento definida com sucesso!");
  }, [
    canSaveDueDateSettings,
    dueDateRules,
    dedupeDueDateRulesByCompany,
    editingDueDateRuleId,
    getDueDateRuleCompanyKey,
    paymentCondition,
    resetDueDateModalForm,
    resolvedDueDays,
    selectedTargetCompaniesForDueDate,
    stripCnpjFromLabel,
  ]);

  const handleEditDueDateRule = React.useCallback(
    (rule: { id: string; companyName: string; days: number }) => {
      const fullRule = dueDateRules.find((dueDateRule) => dueDateRule.id === rule.id);
      if (!fullRule) return;

      setEditingDueDateRuleId(fullRule.id);
      setPaymentCondition(fullRule.paymentCondition);
      setCustomDays(fullRule.paymentCondition === "other" ? String(fullRule.days) : "");
      setDueDateModalView("form");
    },
    [dueDateRules]
  );

  const handleDeleteDueDateRule = React.useCallback(
    (id: string) => {
      // TODO: Adicionar confirmação de exclusão quando o padrão de confirmação estiver definido.
      setDueDateRules((prev) => {
        const deletedRule = prev.find((rule) => rule.id === id);
        const nextRules = prev.filter((rule) => rule.id !== id);

        if (!deletedRule) return nextRules;

        const companyCnpjFromId = deletedRule.companyId
          ? companies.find((company) => company.id === deletedRule.companyId)?.cnpj
          : undefined;
        const companyCnpjFromName = companies.find((company) => {
          if (company.id === "all") return false;
          const companyName = stripCnpjFromLabel(company.full) || company.short;
          return companyName.trim().toLowerCase() === deletedRule.companyName.trim().toLowerCase();
        })?.cnpj;
        const targetCompanyCnpj =
          companyCnpjFromId ?? deletedRule.companyCnpj ?? companyCnpjFromName;

        if (targetCompanyCnpj) {
          setRowsState((prevRows) =>
            prevRows.map((row) =>
              row.cnpjPagador === targetCompanyCnpj
                ? {
                    ...row,
                    vencimento: "",
                  }
                : row
            )
          );
        }

        return nextRules;
      });
    },
    [stripCnpjFromLabel]
  );

  const handleAddDueDateRule = React.useCallback(() => {
    resetDueDateModalForm();
    setDueDateModalView("form");
  }, [resetDueDateModalForm]);

  // Limpa a seleção quando muda de aba
  React.useEffect(() => {
    setTableSelection(new Set());
  }, [currentTab]);

  // Redirecionar se estiver na aba de aprovação quando a feature estiver desabilitada
  React.useEffect(() => {
    if (!aprovacaoTabEnabled && currentTab === "aprovacao") {
      setCurrentTab("todas");
    }
  }, [aprovacaoTabEnabled, currentTab]);

  const searchParamsString = searchParams.toString();

  const patchSearchParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParamsString);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParamsString]
  );

  // Aplicar filtros da URL quando os searchParams mudarem
  React.useEffect(() => {
    const params = new URLSearchParams(searchParamsString);

    const tabParam = params.get('tab');
    const tabFromUrl =
      tabParam && ['conferir', 'aprovacao', 'pagar', 'bloqueados', 'liquidados', 'cancelados', 'todas'].includes(tabParam)
        ? tabParam
        : 'todas';
    setCurrentTab(tabFromUrl);
    
    const statusParam = params.get('status');
    if (statusParam) {
      // Mapear valores da URL para os valores esperados pelo filtro
      if (statusParam === 'Vencido') {
        setStatus('Vencido');
      } else if (statusParam === 'Aberto') {
        setStatus('Aberto');
      } else if (statusParam === 'Pago') {
        setStatus('Pago');
      } else if (statusParam === 'Cancelado') {
        setStatus('Cancelado');
      }
    } else {
      // Se não há parâmetro de status na URL, resetar para "Todos os Status"
      setStatus("Todos os Status");
    }
    
    const periodParam = params.get('period');
    if (periodParam) {
      setPeriod(periodParam);
    } else {
      // Se não há parâmetro de período na URL, resetar para "Todos os períodos"
      setPeriod("Todos os períodos");
    }

    const queryParam = params.get('query');
    if (queryParam) {
      setQuery(queryParam);
    } else {
      setQuery("");
    }
    
    const valorMinimoParam = params.get('valorMinimo');
    if (valorMinimoParam) {
      setAppliedFilters(prev => ({
        ...prev,
        valorMinimo: valorMinimoParam,
      }));
      setTempFilters(prev => ({
        ...prev,
        valorMinimo: valorMinimoParam,
      }));
    } else {
      // Se não há parâmetro de valorMinimo na URL, resetar
      setAppliedFilters(prev => ({
        ...prev,
        valorMinimo: '',
      }));
      setTempFilters(prev => ({
        ...prev,
        valorMinimo: '',
      }));
    }

    const vencimentoInicioParam = params.get('vencimentoInicio');
    if (vencimentoInicioParam) {
      setAppliedFilters(prev => ({
        ...prev,
        vencimentoInicio: vencimentoInicioParam,
      }));
      setTempFilters(prev => ({
        ...prev,
        vencimentoInicio: vencimentoInicioParam,
      }));
    } else {
      // Se não há parâmetro de vencimentoInicio na URL, resetar
      setAppliedFilters(prev => ({
        ...prev,
        vencimentoInicio: '',
      }));
      setTempFilters(prev => ({
        ...prev,
        vencimentoInicio: '',
      }));
    }

    const vencimentoFimParam = params.get('vencimentoFim');
    if (vencimentoFimParam) {
      setAppliedFilters(prev => ({
        ...prev,
        vencimentoFim: vencimentoFimParam,
      }));
      setTempFilters(prev => ({
        ...prev,
        vencimentoFim: vencimentoFimParam,
      }));
    } else {
      // Se não há parâmetro de vencimentoFim na URL, resetar
      setAppliedFilters(prev => ({
        ...prev,
        vencimentoFim: '',
      }));
      setTempFilters(prev => ({
        ...prev,
        vencimentoFim: '',
      }));
    }

    const emissaoInicioParam = params.get('emissaoInicio');
    if (emissaoInicioParam) {
      setAppliedFilters(prev => ({
        ...prev,
        emissaoInicio: emissaoInicioParam,
      }));
      setTempFilters(prev => ({
        ...prev,
        emissaoInicio: emissaoInicioParam,
      }));
    } else {
      setAppliedFilters(prev => ({
        ...prev,
        emissaoInicio: '',
      }));
      setTempFilters(prev => ({
        ...prev,
        emissaoInicio: '',
      }));
    }

    const emissaoFimParam = params.get('emissaoFim');
    if (emissaoFimParam) {
      setAppliedFilters(prev => ({
        ...prev,
        emissaoFim: emissaoFimParam,
      }));
      setTempFilters(prev => ({
        ...prev,
        emissaoFim: emissaoFimParam,
      }));
    } else {
      setAppliedFilters(prev => ({
        ...prev,
        emissaoFim: '',
      }));
      setTempFilters(prev => ({
        ...prev,
        emissaoFim: '',
      }));
    }

    const shouldApplyCbsFromDashboardIntent =
      tabFromUrl === 'todas' && consumeCbsForecastFilterIntentFromDashboard();

    if (shouldApplyCbsFromDashboardIntent) {
      setAppliedFilters(prev => ({
        ...prev,
        cbsPrevistoMinimo: '0.01',
      }));
      setTempFilters(prev => ({
        ...prev,
        cbsPrevistoMinimo: '0.01',
      }));
    } else {
      setAppliedFilters(prev => ({
        ...prev,
        cbsPrevistoMinimo: '',
      }));
      setTempFilters(prev => ({
        ...prev,
        cbsPrevistoMinimo: '',
      }));
    }

    setAppliedFilters(prev => ({
      ...prev,
      cbsPrevistoMaximo: '',
    }));
    setTempFilters(prev => ({
      ...prev,
      cbsPrevistoMaximo: '',
    }));

    // Limpeza de parâmetros legados para evitar persistência indevida por URL/refesh.
    if (
      params.has('cbsPrevistoMinimo') ||
      params.has('cbsPrevistoMaximo') ||
      params.has('aplicarFiltroCbs')
    ) {
      const normalizedParams = new URLSearchParams(params.toString());
      normalizedParams.delete('cbsPrevistoMinimo');
      normalizedParams.delete('cbsPrevistoMaximo');
      normalizedParams.delete('aplicarFiltroCbs');
      const normalizedSearch = normalizedParams.toString();
      if (normalizedSearch !== searchParamsString) {
        router.replace(
          normalizedSearch ? `${pathname}?${normalizedSearch}` : pathname,
          { scroll: false }
        );
      }
    }

    const cancelamentoOrigemParam = params.get('cancelamentoOrigem');
    if (cancelamentoOrigemParam) {
      setAppliedFilters(prev => ({
        ...prev,
        cancelamentoOrigem: cancelamentoOrigemParam,
      }));
      setTempFilters(prev => ({
        ...prev,
        cancelamentoOrigem: cancelamentoOrigemParam,
      }));
    } else {
      setAppliedFilters(prev => ({
        ...prev,
        cancelamentoOrigem: 'Todos os tipos',
      }));
      setTempFilters(prev => ({
        ...prev,
        cancelamentoOrigem: 'Todos os tipos',
      }));
    }

    const tipoCancelamentoParam = params.get('tipoCancelamento');
    if (tipoCancelamentoParam) {
      setAppliedFilters(prev => ({
        ...prev,
        tipoCancelamento: tipoCancelamentoParam,
      }));
      setTempFilters(prev => ({
        ...prev,
        tipoCancelamento: tipoCancelamentoParam,
      }));
    } else {
      setAppliedFilters(prev => ({
        ...prev,
        tipoCancelamento: 'Todos os tipos',
      }));
      setTempFilters(prev => ({
        ...prev,
        tipoCancelamento: 'Todos os tipos',
      }));
    }

    const notaAtualizadaParam = params.get('notaAtualizadaAposCriacao');
    const notaAtualizadaAtiva = notaAtualizadaParam === 'true';
    setAppliedFilters(prev => ({
      ...prev,
      notaAtualizadaAposCriacao: notaAtualizadaAtiva,
    }));
    setTempFilters(prev => ({
      ...prev,
      notaAtualizadaAposCriacao: notaAtualizadaAtiva,
    }));

    const visaoGeralFilterParam = params.get('visaoGeralFilter');
    if (visaoGeralFilterParam) {
      setVisaoGeralFilter(visaoGeralFilterParam);
    } else {
      setVisaoGeralFilter(null);
    }

    const divergenciasParam = params.get('divergencias');
    const isDivergenciasFilterOption =
      divergenciasParam !== null &&
      (DIVERGENCIAS_FILTER_OPTIONS as readonly string[]).includes(divergenciasParam);

    if (isDivergenciasFilterOption) {
      setDivergenciasFilter(divergenciasParam);
      setCurrentTab('todas');
      setVisaoGeralFilter(null);
      setStatus('Todos os Status');
      setPeriod('Todos os períodos');
    } else if (visaoGeralFilterParam === 'divergencias') {
      setDivergenciasFilter('Todas as divergências');
      setCurrentTab('todas');
      setVisaoGeralFilter(null);
      setStatus('Todos os Status');
      setPeriod('Todos os períodos');
    } else {
      setDivergenciasFilter(DIVERGENCIAS_FILTER_PLACEHOLDER);
    }

    const companyParam = params.get('company');
    if (companyParam) {
      // Converter para array (pode ser múltiplas empresas separadas por vírgula)
      const companyArray = companyParam.split(',').map(c => c.trim()).filter(Boolean);
      if (companyArray.length > 0) {
        // Validar se todas as empresas existem na lista de empresas disponíveis
        const allCompaniesExist = companyArray.every(c => 
          c === 'all' || companies.find(comp => comp.id === c)
        );
        if (allCompaniesExist) {
          // Se multiCompanySelectionEnabled está desabilitado e o parâmetro é "all", 
          // o useEffect abaixo vai ajustar para a primeira empresa disponível
          setSelectedCompany(companyArray);
        }
      }
    }
  }, [pathname, router, searchParamsString]);

  // Modal de sucesso
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [successPaid, setSuccessPaid] = React.useState<Row[]>([]);
  const [successCount, setSuccessCount] = React.useState(0);
  const [successBase, setSuccessBase] = React.useState(0);
  const [successFees, setSuccessFees] = React.useState(0);
  const [successTotal, setSuccessTotal] = React.useState(0);

  // Estado ERP
  const [erpUpdating, setErpUpdating] = React.useState<Set<string>>(new Set());
  const [payOpenParent, setPayOpenParent] = React.useState(false);

  // Modais de documentos
  const documentModals = useDocumentModals();

  // Indicador de novos itens
  const newItemsIndicator = useNewItemsIndicator(currentTab, rowsState);

  // Verifica se algum modal de documento está aberto
  const isAnyDocumentModalOpen = React.useMemo(() => {
    return documentModals.danfe.isOpen || 
           documentModals.boleto.isOpen || 
           documentModals.comprovante.isOpen || 
           documentModals.nfse.isOpen || 
           documentModals.cte.isOpen;
  }, [
    documentModals.danfe.isOpen,
    documentModals.boleto.isOpen,
    documentModals.comprovante.isOpen,
    documentModals.nfse.isOpen,
    documentModals.cte.isOpen
  ]);

  // Obter tipos de origem habilitados para mapeamento
  const enabledOrigemTypes = React.useMemo(() => {
    return getEnabledOrigemTypes("gestao-de-pagamentos");
  }, [getEnabledOrigemTypes]);

  // Função para mapear origem do documento (mesma lógica da tabela)
  const mapOrigem = React.useCallback((row: Row): Row['origem'] => {
    const enabledTypes = enabledOrigemTypes;
    if (enabledTypes.length === 0) {
      return row.origem;
    }
    const hash = row.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const selectedIndex = hash % enabledTypes.length;
    return enabledTypes[selectedIndex] as Row['origem'];
  }, [enabledOrigemTypes]);

  // Filtro por empresa (baseado no CNPJ pagador)
  const companyFilteredRows = React.useMemo(() => {
    if (selectedCompany.includes("all")) return rowsState;
    
    const selectedCompanies = companies.filter(c => selectedCompany.includes(c.id));
    const selectedCnpjs = selectedCompanies
      .map(c => c.cnpj)
      .filter(Boolean) as string[];
    
    if (selectedCnpjs.length === 0) return rowsState;
    
    return rowsState.filter(row => selectedCnpjs.includes(row.cnpjPagador));
  }, [rowsState, selectedCompany]);

  // Handlers para filtros avançados
  const handleApplyFilters = React.useCallback(() => {
    setAppliedFilters(tempFilters);
    // No modo alternativo, os filtros permanecem abertos
    if (!filtrosAlternativosEnabled) {
      setFiltersOpen(false); // Fechar os filtros ao aplicar apenas no modo padrão
    }
  }, [tempFilters, filtrosAlternativosEnabled]);

  const handleClearFilters = React.useCallback(() => {
    const emptyFilters: AdvancedFiltersState = {
      vencimentoInicio: '',
      vencimentoFim: '',
      emissaoInicio: '',
      emissaoFim: '',
      valorMinimo: '',
      valorMaximo: '',
      formaPagamento: 'Todos os tipos',
      origemDocumento: 'Todos os tipos',
      semDataVencimento: false,
      divergencias: '',
      cancelamentoOrigem: 'Todos os tipos',
      tipoCancelamento: 'Todos os tipos',
      notaAtualizadaAposCriacao: false,
      lancadoEm: LANCADO_EM_FILTER_PLACEHOLDER,
      cbsPrevistoMinimo: '',
      cbsPrevistoMaximo: '',
    };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setDivergenciasFilter(DIVERGENCIAS_FILTER_PLACEHOLDER);
    setStatus("Todos os Status");
    patchSearchParams({
      cbsPrevistoMinimo: null,
      cbsPrevistoMaximo: null,
    });
  }, [patchSearchParams]);

  const clearFilterKey = React.useCallback(
    (filters: AdvancedFiltersState, key: keyof AdvancedFiltersState): AdvancedFiltersState => {
      const newFilters = { ...filters };
      if (
        key === "vencimentoInicio" ||
        key === "vencimentoFim" ||
        key === "emissaoInicio" ||
        key === "emissaoFim" ||
        key === "valorMinimo" ||
        key === "valorMaximo" ||
        key === "cbsPrevistoMinimo" ||
        key === "cbsPrevistoMaximo"
      ) {
        newFilters[key] = "";
      } else if (key === "semDataVencimento") {
        newFilters[key] = false;
      } else if (key === "formaPagamento") {
        newFilters[key] = "Todos os tipos";
      } else if (key === "origemDocumento") {
        newFilters[key] = "Todos os tipos";
      } else if (key === "divergencias") {
        newFilters[key] = "";
      } else if (key === "cancelamentoOrigem") {
        newFilters[key] = "Todos os tipos";
      } else if (key === "tipoCancelamento") {
        newFilters[key] = "Todos os tipos";
      } else if (key === "notaAtualizadaAposCriacao") {
        newFilters[key] = false;
      } else if (key === "lancadoEm") {
        newFilters[key] = LANCADO_EM_FILTER_PLACEHOLDER;
      }
      return newFilters;
    },
    []
  );

  // Função para remover um filtro específico
  const removeFilter = React.useCallback(
    (key: keyof AdvancedFiltersState) => {
      setAppliedFilters((prev) => clearFilterKey(prev, key));
      setTempFilters((prev) => clearFilterKey(prev, key));

      if (key === "cbsPrevistoMinimo" || key === "cbsPrevistoMaximo") {
        patchSearchParams({
          [key]: null,
        });
      }
    },
    [clearFilterKey, patchSearchParams]
  );

  // Função para obter os filtros aplicados como tags
  const getAppliedFilterTags = React.useMemo(() => {
    const tags: AppliedFilterTag[] = [];

    if (status && status !== "Todos os Status") {
      tags.push({
        key: "status",
        label: `Status: ${status}`,
        onRemove: () => setStatus("Todos os Status"),
      });
    }

    if (
      currentTab === 'todas' &&
      divergenciasFilter !== DIVERGENCIAS_FILTER_PLACEHOLDER
    ) {
      tags.push({
        key: 'divergencias',
        label: `Pendências: ${divergenciasFilter}`,
        onRemove: () => setDivergenciasFilter(DIVERGENCIAS_FILTER_PLACEHOLDER),
      });
    }

    // Vencimento início
    if (appliedFilters.vencimentoInicio) {
      tags.push({
        key: 'vencimentoInicio',
        label: `Vencimento a partir de ${appliedFilters.vencimentoInicio}`,
        onRemove: () => removeFilter('vencimentoInicio'),
      });
    }

    // Vencimento fim
    if (appliedFilters.vencimentoFim) {
      tags.push({
        key: 'vencimentoFim',
        label: `Vencimento até ${appliedFilters.vencimentoFim}`,
        onRemove: () => removeFilter('vencimentoFim'),
      });
    }

    // Sem data de vencimento
    if (appliedFilters.semDataVencimento) {
      tags.push({
        key: 'semDataVencimento',
        label: 'Sem data de vencimento',
        onRemove: () => removeFilter('semDataVencimento'),
      });
    }

    // Emissão início
    if (appliedFilters.emissaoInicio) {
      tags.push({
        key: 'emissaoInicio',
        label: `Emissão a partir de ${appliedFilters.emissaoInicio}`,
        onRemove: () => removeFilter('emissaoInicio'),
      });
    }

    // Emissão fim
    if (appliedFilters.emissaoFim) {
      tags.push({
        key: 'emissaoFim',
        label: `Emissão até ${appliedFilters.emissaoFim}`,
        onRemove: () => removeFilter('emissaoFim'),
      });
    }

    // Valor mínimo
    if (appliedFilters.valorMinimo) {
      const valor = parseFloat(appliedFilters.valorMinimo);
      if (!isNaN(valor)) {
        tags.push({
          key: 'valorMinimo',
          label: `Valor a partir de ${formatCurrency(valor)}`,
          onRemove: () => removeFilter('valorMinimo'),
        });
      }
    }

    // Valor máximo
    if (appliedFilters.valorMaximo) {
      const valor = parseFloat(appliedFilters.valorMaximo);
      if (!isNaN(valor)) {
        tags.push({
          key: 'valorMaximo',
          label: `Valor até ${formatCurrency(valor)}`,
          onRemove: () => removeFilter('valorMaximo'),
        });
      }
    }

    // Forma de pagamento
    if (appliedFilters.formaPagamento && appliedFilters.formaPagamento !== 'Todos os tipos') {
      tags.push({
        key: 'formaPagamento',
        label: `Forma: ${appliedFilters.formaPagamento}`,
        onRemove: () => removeFilter('formaPagamento'),
      });
    }

    // Origem do documento
    if (appliedFilters.origemDocumento && appliedFilters.origemDocumento !== 'Todos os tipos') {
      tags.push({
        key: 'origemDocumento',
        label: `Origem: ${appliedFilters.origemDocumento}`,
        onRemove: () => removeFilter('origemDocumento'),
      });
    }
    if (currentTab === 'conferir' && appliedFilters.divergencias) {
      tags.push({
        key: 'divergencias',
        label: appliedFilters.divergencias,
        onRemove: () => removeFilter('divergencias'),
      });
    }
    if (appliedFilters.cancelamentoOrigem && appliedFilters.cancelamentoOrigem !== 'Todos os tipos') {
      tags.push({
        key: 'cancelamentoOrigem',
        label: `Tipo de cancelamento: ${appliedFilters.cancelamentoOrigem}`,
        onRemove: () => removeFilter('cancelamentoOrigem'),
      });
    }
    if (appliedFilters.tipoCancelamento && appliedFilters.tipoCancelamento !== 'Todos os tipos') {
      tags.push({
        key: 'tipoCancelamento',
        label: `Tipo de cancelamento: ${appliedFilters.tipoCancelamento}`,
        onRemove: () => removeFilter('tipoCancelamento'),
      });
    }
    if (appliedFilters.notaAtualizadaAposCriacao) {
      tags.push({
        key: 'notaAtualizadaAposCriacao',
        label: 'Nota atualizada após criação',
        onRemove: () => removeFilter('notaAtualizadaAposCriacao'),
      });
    }

    if (
      currentTab === 'todas' &&
      isLancadoEmFilterActive(appliedFilters.lancadoEm)
    ) {
      tags.push({
        key: 'lancadoEm',
        label: `Lançado em: ${getLancadoEmFilterLabel(appliedFilters.lancadoEm)}`,
        onRemove: () => removeFilter('lancadoEm'),
      });
    }

    if (currentTab === 'todas' && appliedFilters.cbsPrevistoMinimo) {
      const valor = parseFloat(appliedFilters.cbsPrevistoMinimo);
      if (!isNaN(valor)) {
        tags.push({
          key: 'cbsPrevistoMinimo',
          label: `CBS previsto a partir de ${formatCurrency(valor)}`,
          onRemove: () => removeFilter('cbsPrevistoMinimo'),
        });
      }
    }

    if (currentTab === 'todas' && appliedFilters.cbsPrevistoMaximo) {
      const valor = parseFloat(appliedFilters.cbsPrevistoMaximo);
      if (!isNaN(valor)) {
        tags.push({
          key: 'cbsPrevistoMaximo',
          label: `CBS previsto até ${formatCurrency(valor)}`,
          onRemove: () => removeFilter('cbsPrevistoMaximo'),
        });
      }
    }

    return tags;
  }, [appliedFilters, removeFilter, currentTab, status, divergenciasFilter]);

  // Sincronizar tempFilters quando filtersOpen muda para true
  React.useEffect(() => {
    if (filtersOpen) {
      setTempFilters(appliedFilters);
    }
  }, [filtersOpen, appliedFilters]);

  // Dados e filtros
  const { filteredData, totalValue, totalCount } = usePaymentFilters(companyFilteredRows, currentTab as PaymentTabId, {
    status,
    period,
    query,
    visaoGeralFilter,
    vencimentoInicio: appliedFilters.vencimentoInicio,
    vencimentoFim: appliedFilters.vencimentoFim,
    emissaoInicio: appliedFilters.emissaoInicio,
    emissaoFim: appliedFilters.emissaoFim,
    valorMinimo: appliedFilters.valorMinimo,
    valorMaximo: appliedFilters.valorMaximo,
    formaPagamento: appliedFilters.formaPagamento,
    origemDocumento: appliedFilters.origemDocumento,
    semDataVencimento: appliedFilters.semDataVencimento,
    divergencias: currentTab === "todas" ? divergenciasFilter : appliedFilters.divergencias,
    cancelamentoOrigem: appliedFilters.cancelamentoOrigem,
    tipoCancelamento: appliedFilters.tipoCancelamento,
    notaAtualizadaAposCriacao: appliedFilters.notaAtualizadaAposCriacao,
    lancadoEm: appliedFilters.lancadoEm,
    cbsPrevistoMinimo: appliedFilters.cbsPrevistoMinimo,
    cbsPrevistoMaximo: appliedFilters.cbsPrevistoMaximo,
  }, mapOrigem);

  const showCbsPrevistoTotal = currentTab === "todas";

  const cbsPrevistoTotal = React.useMemo(() => {
    if (!showCbsPrevistoTotal) return 0;

    return filteredData.reduce(
      (acc, row) => acc + getCbsPrevistoValue(row),
      0
    );
  }, [filteredData, showCbsPrevistoTotal]);

  // Paginação
  const pagination = usePagination(filteredData, 10);


  // Inicializar dados
  React.useEffect(() => {
      setRowsState(applyStoredManualDueDateEdits(initialRows));
  }, []);

  // Sincronização ERP inicial
  React.useEffect(() => {
    if (rowsState.length === 0) return;
    const allIds = rowsState.map(r => r.id);
    setErpUpdating(new Set(allIds));
    const timer = setTimeout(() => setErpUpdating(new Set()), 2000);
    return () => clearTimeout(timer);
  }, [rowsState]);

  // Sincronização ERP ao navegar para liquidados
  React.useEffect(() => {
    if (currentTab !== 'liquidados') return;
    const ids = rowsState.filter(r => r.lancadoEm === 'liquidados').map(r => r.id);
    if (ids.length === 0) return;
    setErpUpdating(new Set(ids));
    const timer = setTimeout(() => setErpUpdating(new Set()), 2200);
    return () => clearTimeout(timer);
  }, [currentTab, rowsState]);

  // Persistir estado de visão geral
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('contasAPagar.visaoGeralExpanded');
      if (stored != null) setVisaoGeralExpanded(stored === '1');
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('contasAPagar.visaoGeralExpanded', visaoGeralExpanded ? '1' : '0');
    } catch {}
  }, [visaoGeralExpanded]);

  // Atualizar filtros quando visão geral muda
  const prevVisaoGeralFilterRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const prev = prevVisaoGeralFilterRef.current;
    prevVisaoGeralFilterRef.current = visaoGeralFilter;

    // Importante: não sobrescrever filtros vindos da URL no mount (quando `visaoGeralFilter` inicia como null).
    // Só resetar status/período quando o usuário efetivamente "limpar" um filtro da visão geral.
    if (!visaoGeralFilter || visaoGeralFilter === 'total') {
      if (prev) {
        setStatus('Todos os Status');
        setPeriod('Todos os períodos');
      }
      return;
    }

    if (['Aberto', 'Vencido', 'Pago', 'Cancelado'].includes(visaoGeralFilter)) {
      setStatus(visaoGeralFilter);
      return;
    }

    if (visaoGeralFilter === 'a-vencer-7-dias') {
      setStatus('Todos os Status');
      setPeriod('Próximos 7 dias');
      return;
    }

    // Filtro de divergências (não altera status/período; é aplicado no `usePaymentFilters`)
    if (visaoGeralFilter === 'divergencias') {
      return;
    }
  }, [visaoGeralFilter]);

  // Limpar filtro da visão geral quando não há resultados
  React.useEffect(() => {
    if (visaoGeralFilter && filteredData.length === 0) {
      setVisaoGeralFilter(null);
    }
  }, [visaoGeralFilter, filteredData.length]);

  // Resetar índice focado quando mudamos de tab ou página
  React.useEffect(() => {
    setFocusedRowIndex(-1);
  }, [currentTab, pagination.page]);

  // Sincronizar dCurrent com mudanças em rowsState
  React.useEffect(() => {
    if (dCurrent) {
      const updatedRow = rowsState.find(r => r.id === dCurrent.id);
      if (updatedRow && updatedRow !== dCurrent) {
        setDCurrent(updatedRow);
      }
    }
  }, [rowsState, dCurrent]);

  // Resetar focusedRowIndex se o pagamento do drawer não estiver mais na página atual
  React.useEffect(() => {
    if (dCurrent && drawerOpen) {
      const isInCurrentPage = pagination.paginatedItems.some(item => item.id === dCurrent.id);
      if (!isInCurrentPage && focusedRowIndex !== -1) {
        setFocusedRowIndex(-1);
      }
    }
  }, [dCurrent, drawerOpen, pagination.paginatedItems, focusedRowIndex]);

  // Navegação por teclado
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Apenas processar setas e espaço
      if (!['ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        return;
      }

      // Ignorar se estiver digitando em campos de texto ou em dialogs modais
      const target = e.target as HTMLElement;
      
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' ||
        target.closest('[role="dialog"]:not([data-sheet])') ||
        successOpen
      ) {
        return;
      }

      const pageItems = pagination.paginatedItems;
      if (pageItems.length === 0) return;

      // Seta para baixo
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const nextIndex = focusedRowIndex === -1 ? 0 : 
                         focusedRowIndex < pageItems.length - 1 ? focusedRowIndex + 1 : 0;
        setFocusedRowIndex(nextIndex);
        const nextRow = pageItems[nextIndex];
        setDCurrent(nextRow);
        setDrawerOpen(true);
        
        // Manter foco no body para continuar recebendo eventos de teclado
        setTimeout(() => {
          if (document.activeElement && document.activeElement !== document.body) {
            (document.activeElement as HTMLElement).blur();
          }
        }, 0);
      }
      
      // Seta para cima
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const prevIndex = focusedRowIndex === -1 ? pageItems.length - 1 :
                         focusedRowIndex > 0 ? focusedRowIndex - 1 : pageItems.length - 1;
        setFocusedRowIndex(prevIndex);
        const prevRow = pageItems[prevIndex];
        setDCurrent(prevRow);
        setDrawerOpen(true);
        
        // Manter foco no body para continuar recebendo eventos de teclado
        setTimeout(() => {
          if (document.activeElement && document.activeElement !== document.body) {
            (document.activeElement as HTMLElement).blur();
          }
        }, 0);
      }
      
      // Barra de espaço
      else if (e.key === ' ') {
        if (focusedRowIndex >= 0 && focusedRowIndex < pageItems.length) {
          e.preventDefault();
          e.stopPropagation();
          const focusedRow = pageItems[focusedRowIndex];
          const globalIndex = rowsState.indexOf(focusedRow);
          if (globalIndex !== -1) {
            setTableSelection(prev => {
              const next = new Set(prev);
              if (next.has(globalIndex)) {
                next.delete(globalIndex);
              } else {
                next.add(globalIndex);
              }
              return next;
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [focusedRowIndex, pagination.paginatedItems, rowsState, successOpen]);

  const handlePaymentCompleted = (
    list: Row[],
    info: { count: number; base: number; fees: number; total: number; bank?: string }
  ) => {
    // Na V1 (drawer de pagamento) não exibimos o modal de extrato de sucesso.
    if (pagarButtonVersion !== "v2") {
      return;
    }

    setSuccessPaid(list);
    setSuccessCount(info.count);
    setSuccessBase(info.base);
    setSuccessFees(info.fees);
    setSuccessTotal(info.total);
    setSuccessOpen(true);
  };

  const openDetail = (row: Row) => {
    setDCurrent(row);
    setDrawerOpen(true);
    // Atualizar o índice focado quando abrimos manualmente
    const rowIndex = pagination.paginatedItems.findIndex(r => r.id === row.id);
    if (rowIndex !== -1) {
      setFocusedRowIndex(rowIndex);
    }
  };

  const tabs = React.useMemo(() => {
    const liquidadosCount = newItemsIndicator.getNewItemsCount("liquidados");

    const allTabs = [
      {
        id: "todas",
        label: "Todas as contas",
      },
      {
        id: "conferir",
        label: "Conferência",
        hasNewItems: tabNewItemsIndicatorEnabled ? newItemsIndicator.hasNewItems("conferir") : undefined,
      },
      {
        id: "aprovacao",
        label: "Aprovação",
        hasNewItems: tabNewItemsIndicatorEnabled ? newItemsIndicator.hasNewItems("aprovacao") : undefined,
      },
      {
        id: "pagar",
        label: "Pagamento",
        hasNewItems: tabNewItemsIndicatorEnabled ? newItemsIndicator.hasNewItems("pagar") : undefined,
      },
      {
        id: "bloqueados",
        label: "Bloqueados",
        hasNewItems: tabNewItemsIndicatorEnabled ? newItemsIndicator.hasNewItems("bloqueados") : undefined,
      },
      {
        id: "liquidados",
        label: "Liquidados",
        hasNewItems: tabNewItemsIndicatorEnabled ? liquidadosCount > 0 : undefined,
        newItemsCount: liquidadosCount > 0 ? liquidadosCount : undefined,
      },
      {
        id: "cancelados",
        label: "Cancelados",
        hasNewItems: tabNewItemsIndicatorEnabled ? newItemsIndicator.hasNewItems("cancelados") : undefined,
      },
    ];
    
    // Filtrar aba de aprovação se a feature estiver desabilitada
    return aprovacaoTabEnabled 
      ? allTabs 
      : allTabs.filter(tab => tab.id !== "aprovacao");
  }, [aprovacaoTabEnabled, tabNewItemsIndicatorEnabled, newItemsIndicator]);

  const statusOptions = React.useMemo(() => {
    const base = ["Todos os Status", "Aberto", "Pago", "Vencido", "Cancelado"];
    // Abas onde o filtro não oferece Pago nem Cancelado
    const semPagoNemCancelado =
      currentTab === "conferir" ||
      currentTab === "aprovacao" ||
      currentTab === "pagar" ||
      currentTab === "bloqueados";
    if (semPagoNemCancelado) {
      return base.filter((s) => s !== "Pago" && s !== "Cancelado");
    }
    return base;
  }, [currentTab]);
  const periodOptions = ["Todos os períodos", "Hoje", "Amanhã", "Próximos 7 dias", "Próximos 30 dias", "Sem data de vencimento", "Personalizado..."];
  const divergenciasOptions = ["Todas as divergências", "Divergência de pagamento", "Emissores diferentes", "Sem divergências"];
  const tipoCancelamentoOptions = ["Todos os tipos", "Automático - Boleto", "Automático - Nota", "Manual"];
  const cancelamentoOrigemOptions = ["Todos os tipos", "Manual", "Por nota", "Por boleto"];

  // Se mudar para aba sem filtro Pago/Cancelado com esse status aplicado, resetar
  React.useEffect(() => {
    const semPagoNemCancelado =
      currentTab === "conferir" ||
      currentTab === "aprovacao" ||
      currentTab === "pagar" ||
      currentTab === "bloqueados";
    if (semPagoNemCancelado && (status === "Pago" || status === "Cancelado")) {
      setStatus("Todos os Status");
    }
  }, [currentTab, status]);

  // Calcular totalizadores para visão geral (considerando filtro de empresa)
  const visaoGeralData = React.useMemo(() => {
    const conferirData = companyFilteredRows.filter(r => r.lancadoEm === 'conferir');
    const statusCounts: Record<string, { count: number; total: number }> = {
      'Aberto': { count: 0, total: 0 },
      'Vencido': { count: 0, total: 0 },
      'Pago': { count: 0, total: 0 },
      'Cancelado': { count: 0, total: 0 }
    };
    
    conferirData.forEach(row => {
      if (row.status && statusCounts[row.status]) {
        statusCounts[row.status].count++;
        statusCounts[row.status].total += row.valor || 0;
      }
    });
    
    const totalGeral = conferirData.reduce((acc, row) => acc + (row.valor || 0), 0);
    const totalCount = conferirData.length;
    
      const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOf7Days = addDays(startOfDay, 7);
    
    const aVencer7Dias = conferirData.filter(row => {
            if (!row.vencimento) return false;
      const vencDate = parseDate(row.vencimento);
      if (!vencDate) return false;
      const vencStartOfDay = getStartOfDay(vencDate);
            return vencStartOfDay >= startOfDay && vencStartOfDay <= endOf7Days;
    });
    
    const aVencer7DiasTotal = aVencer7Dias.reduce((acc, row) => acc + (row.valor || 0), 0);
    
    return {
      totalGeral,
      totalCount,
      statusCounts,
      aVencer7DiasCount: aVencer7Dias.length,
      aVencer7DiasTotal,
    };
  }, [companyFilteredRows]);

  if (bankConfigOpen && bankConfigProvider) {
    return (
      <BankAccountConfigurationScreen
        provider={bankConfigProvider}
        selectedCompanyIds={selectedCompany}
        onCancel={() => setBankConfigOpen(false)}
        onComplete={(newBank) => {
          const bankWithStatus: BankAccount = {
            ...newBank,
            status: "processando",
          };
          setBankAccounts((prev) => [...prev, bankWithStatus]);
          setBankConfigOpen(false);
          setBanksSummaryOpen(true);
        }}
      />
    );
  }

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">Contas a pagar</h1>
      <ProductToolbar 
        selectedCompany={selectedCompany} 
        onCompanyChange={setSelectedCompany}
        multiCompanySelectionEnabled={multiCompanySelectionEnabled}
      >
        <Button
          size="default"
          variant="secondary"
          className="font-bold inline-flex items-center gap-2"
          onClick={() => {
            if (pagarButtonVersion === "v1") {
              if (bankAccounts.length > 0) {
                setBanksSummaryOpen(true);
              } else {
                setBanksOnboardingOpen(true);
              }
            }
          }}
        >
          <Landmark className="h-4 w-4" />
          Bancos
        </Button>
        <Button
          size="default"
          variant="secondary"
          className="font-bold inline-flex items-center gap-2"
          aria-label="Abrir regras de vencimento"
          onClick={handleOpenDueDateModal}
        >
          <Calendar className="h-4 w-4" />
          Vencimento
        </Button>
      </ProductToolbar>

      <Card className="rounded-xl bg-white border border-border mt-4">
        <CardContent className="p-0">
          <div className="bg-[#F5F5F6] rounded-t-xl overflow-hidden">
            <Tabs tabs={tabs} value={currentTab} onValueChange={setCurrentTab} variant="product" />
          </div>

          <div className="w-full space-y-4 px-4 pt-4 pb-4">
            <div className="flex w-full items-end gap-3 mb-0">
              <div className="flex-1 min-w-0 basis-2/3">
                <div
                  className={cn(
                    "flex w-full overflow-hidden rounded-lg border border-input bg-white shadow-sm",
                    "focus-within:border-[#0C3CF7] focus-within:ring-1 focus-within:ring-[#0C3CF7]"
                  )}
                >
                  <Input
                    placeholder="Ex: CNPJ, razão social, ..."
                    className="h-9 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div
                    className="flex h-9 w-10 shrink-0 items-center justify-center border-l border-input bg-[#F5F5F6]"
                    aria-hidden
                  >
                    <Search className="h-4 w-4 text-[#5F6572]" />
                  </div>
                </div>
              </div>
              {currentTab !== "cancelados" && currentTab !== "liquidados" && (
                <div className="flex-1 basis-1/3">
                  <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>Status</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold hover:bg-[#EFF1F2]">
                        <span className={cn("t-text-sm truncate", status === "Todos os Status" && "text-muted-foreground")}>{status}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                      {statusOptions.map((s) => (
                        <DropdownMenuItem key={s} onClick={() => setStatus(s)}>{s}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {currentTab === "todas" && (
                <div className="flex-1 basis-1/3">
                  <Label className="mb-1 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                    Pendências
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold hover:bg-[#EFF1F2]">
                        <span
                          className={cn(
                            "t-text-sm truncate",
                            divergenciasFilter === DIVERGENCIAS_FILTER_PLACEHOLDER && "text-muted-foreground"
                          )}
                        >
                          {divergenciasFilter}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                      <DropdownMenuItem onClick={() => setDivergenciasFilter(DIVERGENCIAS_FILTER_PLACEHOLDER)}>
                        {DIVERGENCIAS_FILTER_PLACEHOLDER}
                      </DropdownMenuItem>
                      {DIVERGENCIAS_FILTER_OPTIONS.map((opcao) => (
                        <DropdownMenuItem key={opcao} onClick={() => setDivergenciasFilter(opcao)}>
                          {opcao}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {currentTab === "conferir" && (
                <div className="flex-1 basis-[260px] min-w-[260px]">
                  <Label className="mb-1 block text-sm font-semibold whitespace-nowrap" style={{ color: '#5F6572' }}>
                    Divergências
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold hover:bg-[#EFF1F2]">
                        <span className={cn("t-text-sm truncate", !appliedFilters.divergencias && "text-muted-foreground")}>
                          {appliedFilters.divergencias || "Selecione"}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                      {divergenciasOptions.map((opcao) => (
                        <DropdownMenuItem
                          key={opcao}
                          onClick={() => {
                            setAppliedFilters(prev => ({ ...prev, divergencias: opcao }));
                            setTempFilters(prev => ({ ...prev, divergencias: opcao }));
                          }}
                        >
                          {opcao}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {currentTab === "cancelados" && (
                <>
                  <div className="flex-1 basis-[260px] min-w-[260px]">
                    <Label className="mb-1 block text-sm font-semibold whitespace-nowrap" style={{ color: '#5F6572' }}>
                      Origem do cancelamento
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold hover:bg-[#EFF1F2]">
                          <span className={cn("t-text-sm truncate", appliedFilters.cancelamentoOrigem === "Todos os tipos" && "text-muted-foreground")}>
                            {appliedFilters.cancelamentoOrigem}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                        {cancelamentoOrigemOptions.map((opcao) => (
                          <DropdownMenuItem
                            key={opcao}
                            onClick={() => {
                              setAppliedFilters(prev => ({ ...prev, cancelamentoOrigem: opcao }));
                              setTempFilters(prev => ({ ...prev, cancelamentoOrigem: opcao }));
                            }}
                          >
                            {opcao}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex-1 basis-[280px] min-w-[280px]">
                    <Label className="mb-1 block text-sm font-semibold whitespace-nowrap" style={{ color: '#5F6572' }}>
                      Tipo de cancelamento
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold hover:bg-[#EFF1F2]">
                          <span className={cn("t-text-sm truncate", appliedFilters.tipoCancelamento === "Todos os tipos" && "text-muted-foreground")}>
                            {appliedFilters.tipoCancelamento}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                        {tipoCancelamentoOptions.map((opcao) => (
                          <DropdownMenuItem
                            key={opcao}
                            onClick={() => {
                              setAppliedFilters(prev => ({ ...prev, tipoCancelamento: opcao }));
                              setTempFilters(prev => ({ ...prev, tipoCancelamento: opcao }));
                            }}
                          >
                            {opcao}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
              <div className="shrink-0">
                <Button 
                  variant="secondary" 
                  size="default" 
                  className="inline-flex items-center gap-2 font-bold"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </div>
            </div>

            {/* Filtros avançados */}
            <AdvancedFilters
              isOpen={filtersOpen}
              filters={tempFilters}
              onFiltersChange={setTempFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              availableData={
                currentTab === "todas"
                  ? companyFilteredRows
                  : companyFilteredRows.filter(r => r.lancadoEm === currentTab)
              }
              mapOrigem={mapOrigem}
              alternativeMode={filtrosAlternativosEnabled}
              appliedFilterTags={filtrosAlternativosEnabled ? getAppliedFilterTags : []}
              appliedFilters={appliedFilters}
              showLancadoEmFilter={currentTab === "todas"}
            />

            <div className="w-full flex h-10 items-center justify-between rounded-[8px] bg-[#F5F5F6] py-1 px-4">
              <div className="flex items-center gap-2 px-1.5">
                <Calendar className="h-4 w-4" style={{ color: '#5F6572' }} />
                <span className="text-sm font-semibold" style={{ color: '#5F6572' }}>Período de vencimento</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="default" className="px-2 h-6 text-[#0d0f1c] shadow-none font-bold hover:bg-[#EFF1F2]">
                      <span className="t-text-sm">{period}</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {periodOptions.map((p) => (
                      <DropdownMenuItem key={p} onClick={() => setPeriod(p)}>{p}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 px-1.5 text-right">
                <span className="inline-flex items-center gap-1">
                  <span className="text-sm font-semibold" style={{ color: '#5F6572' }}>
                    Valor total das {totalCount} contas a pagar:{' '}
                  </span>
                  <span className="text-sm font-semibold text-[#0d0f1c]">{formatCurrency(totalValue)}</span>
                </span>
                {showCbsPrevistoTotal && (
                  <>
                    <span className="text-sm font-semibold text-[#5F6572]" aria-hidden>
                      |
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-sm font-semibold" style={{ color: '#5F6572' }}>
                        Total de CBS previsto:{' '}
                      </span>
                      <span className="text-sm font-semibold text-[#0d0f1c]">
                        {formatCurrency(cbsPrevistoTotal)}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {getAppliedFilterTags.length > 0 &&
              (!filtrosAlternativosEnabled || !filtersOpen) && (
                <AppliedFiltersBar
                  tags={getAppliedFilterTags}
                  onClearAll={handleClearFilters}
                />
              )}

            {currentTab === 'conferir' && false && (
            <div 
              className="w-full overflow-hidden transition-all duration-300"
              style={{ 
                borderRadius: '8px',
                border: '1px solid rgba(4, 14, 35, 0.08)',
                background: '#F5F5F6'
              }}
            >
              <div className="flex h-10 items-center py-1 px-4">
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#E5E7EB] rounded px-1.5 py-1 transition-colors"
                  onClick={() => setVisaoGeralExpanded(!visaoGeralExpanded)}
                >
                  <span className="text-sm font-semibold" style={{ color: '#5F6572' }}>Visão geral</span>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${visaoGeralExpanded ? 'rotate-180' : ''}`} 
                    style={{ color: '#5F6572' }} 
                  />
                </div>
              </div>
              
              {visaoGeralExpanded && (
                <div className="px-4 pb-4">
                      <div className="grid grid-cols-6 gap-4 mt-4">
                        <div
                          className={`p-4 text-left transition-all duration-200 ${
                            visaoGeralData.totalGeral === 0 
                              ? 'cursor-not-allowed opacity-70 bg-gray-50' 
                              : `cursor-pointer ${visaoGeralFilter === 'total' ? 'bg-[#F3F5FF]' : 'bg-white hover:bg-gray-100'}`
                          }`}
                          style={{
                            borderRadius: '8px',
                            border: `1px solid ${
                              visaoGeralData.totalGeral === 0 
                                ? 'rgba(4, 14, 35, 0.04)' 
                                : visaoGeralFilter === 'total' ? '#0C3CF7' : 'rgba(4, 14, 35, 0.08)'
                            }`,
                            boxShadow: '0 1px 0 0 rgba(4, 14, 35, 0.04)',
                            containerType: 'inline-size'
                          }}
                          onClick={() => visaoGeralData.totalGeral > 0 && setVisaoGeralFilter(visaoGeralFilter === 'total' ? null : 'total')}
                        >
                        <div className="mb-1 font-bold whitespace-nowrap" style={{ color: 'rgba(4, 14, 35, 0.64)', fontSize: 'clamp(1rem, 12cqi, 1.5rem)' }}>
                          {formatCurrency(visaoGeralData.totalGeral)}
                          </div>
                        <div className="text-sm font-bold" style={{ color: 'rgba(4, 14, 35, 0.42)' }}>
                            Total a conferir
                          </div>
                          <div className="text-xs font-medium mt-1" style={{ color: '#5F6572' }}>
                          {visaoGeralData.totalCount} {visaoGeralData.totalCount === 1 ? 'item' : 'itens'}
                          </div>
                        </div>
                        
                      {Object.entries(visaoGeralData.statusCounts).map(([status, data]) => (
                          <div
                            key={status}
                            className={`p-4 text-left transition-all duration-200 ${
                              data.total === 0 
                                ? 'cursor-not-allowed opacity-70 bg-gray-50' 
                                : `cursor-pointer ${visaoGeralFilter === status ? 'bg-[#F3F5FF]' : 'bg-white hover:bg-gray-100'}`
                            }`}
                            style={{
                              borderRadius: '8px',
                              border: `1px solid ${
                                data.total === 0 
                                  ? 'rgba(4, 14, 35, 0.04)' 
                                  : visaoGeralFilter === status ? '#0C3CF7' : 'rgba(4, 14, 35, 0.08)'
                              }`,
                              boxShadow: '0 1px 0 0 rgba(4, 14, 35, 0.04)',
                              containerType: 'inline-size'
                            }}
                            onClick={() => data.total > 0 && setVisaoGeralFilter(visaoGeralFilter === status ? null : status)}
                          >
                          <div className="mb-1 font-bold whitespace-nowrap" style={{ color: 'rgba(4, 14, 35, 0.64)', fontSize: 'clamp(1rem, 12cqi, 1.5rem)' }}>
                            {formatCurrency(data.total)}
                            </div>
                          <div className="text-sm font-bold" style={{ color: 'rgba(4, 14, 35, 0.42)' }}>
                              {status}
                            </div>
                            <div className="text-xs font-medium mt-1" style={{ color: '#5F6572' }}>
                              {data.count} {data.count === 1 ? 'item' : 'itens'}
                            </div>
                          </div>
                        ))}
                        
                        <div
                          className={`p-4 text-left transition-all duration-200 ${
                            visaoGeralData.aVencer7DiasTotal === 0 
                              ? 'cursor-not-allowed opacity-70 bg-gray-50' 
                              : `cursor-pointer ${visaoGeralFilter === 'a-vencer-7-dias' ? 'bg-[#F3F5FF]' : 'bg-white hover:bg-gray-100'}`
                          }`}
                          style={{
                            borderRadius: '8px',
                            border: `1px solid ${
                              visaoGeralData.aVencer7DiasTotal === 0 
                                ? 'rgba(4, 14, 35, 0.04)' 
                                : visaoGeralFilter === 'a-vencer-7-dias' ? '#0C3CF7' : 'rgba(4, 14, 35, 0.08)'
                            }`,
                            boxShadow: '0 1px 0 0 rgba(4, 14, 35, 0.04)',
                            containerType: 'inline-size'
                          }}
                          onClick={() => visaoGeralData.aVencer7DiasTotal > 0 && setVisaoGeralFilter(visaoGeralFilter === 'a-vencer-7-dias' ? null : 'a-vencer-7-dias')}
                        >
                        <div className="mb-1 font-bold whitespace-nowrap" style={{ color: 'rgba(4, 14, 35, 0.64)', fontSize: 'clamp(1rem, 12cqi, 1.5rem)' }}>
                          {formatCurrency(visaoGeralData.aVencer7DiasTotal)}
                          </div>
                        <div className="text-sm font-bold" style={{ color: 'rgba(4, 14, 35, 0.42)' }}>
                            A vencer próx. 7 dias
                          </div>
                          <div className="text-xs font-medium mt-1" style={{ color: '#5F6572' }}>
                          {visaoGeralData.aVencer7DiasCount} {visaoGeralData.aVencer7DiasCount === 1 ? 'item' : 'itens'}
                          </div>
                        </div>
                      </div>
                </div>
              )}
            </div>
            )}
          </div>

          <div className="h-px bg-[#EBECEE]" />

          <div className="overflow-x-auto rounded-b-xl overflow-hidden">
            <PaymentsTable
              tab={currentTab as PaymentTabId}
              data={rowsState}
              setData={setRowsState}
              visible={filteredData}
              pageItems={pagination.paginatedItems}
              onMoveToTab={(t) => setCurrentTab(t)}
              onOpenDetail={openDetail}
              viewingRow={dCurrent}
              focusedRowIndex={focusedRowIndex}
              selected={tableSelection}
              setSelected={setTableSelection}
              payOpen={payOpenParent}
              setPayOpen={setPayOpenParent}
              onPaymentCompleted={handlePaymentCompleted}
              erpUpdating={erpUpdating}
              tabs={tabs}
              isRecentlyAdded={newItemsIndicator.isRecentlyAdded}
              selectedCompany={selectedCompany}
              pagarVersion={pagarButtonVersion}
              hasBanks={bankAccounts.length > 0}
              onRequireBanks={() => setBanksOnboardingOpen(true)}
              bankAccounts={bankAccounts}
              onNovoPagamento={
                novoPagamentoEnabled ? () => setNovoPagamentoOpen(true) : undefined
              }
            />
          </div>

          <NovoPagamentoModal
            open={novoPagamentoOpen}
            onOpenChange={setNovoPagamentoOpen}
            selectedCompany={selectedCompany}
            onAddPayment={(paymentData) => {
              const newRow: Row = {
                id: paymentData.id || `manual-${Date.now()}`,
                geradoEm: new Date().toISOString(),
                fornecedor: paymentData.fornecedor || "",
                cnpjFornecedor: paymentData.cnpjFornecedor || "",
                cnpjPagador: paymentData.cnpjPagador || "",
                valor: paymentData.valor || 0,
                vencimento: paymentData.vencimento || "",
                status: paymentData.status || "Aberto",
                origem: paymentData.origem || "Manual",
                lancadoEm: paymentData.lancadoEm || "conferir",
                ordemCompra: paymentData.ordemCompra,
                parcela: paymentData.parcela,
                centroCusto: paymentData.centroCusto,
                observacoes: paymentData.observacoes,
                formaPagamento: paymentData.formaPagamento || {
                  tipo: "PIX",
                  chavePix: "",
                  dataGeracao: new Date().toLocaleDateString("pt-BR"),
                  valor: paymentData.valor || 0,
                },
                pagamentoPreferencial: paymentData.pagamentoPreferencial,
                etapasVisitadas: ["conferir"],
              };

              setRowsState((prev) => [newRow, ...prev]);

              toast.success("Nova conta a pagar criada com sucesso!", {
                duration: 5000,
              });
            }}
          />

          <BanksOnboardingModal
            open={banksOnboardingOpen}
            onOpenChange={setBanksOnboardingOpen}
            onAddBank={(bank) => {
              setBankAccounts((prev) => [...prev, bank]);
              toast.success("Banco cadastrado com sucesso!", {
                duration: 4000,
              });
            }}
            onStartConfiguration={(bankId) => {
              setBanksOnboardingOpen(false);
              setBankConfigProvider(bankId);
              setBankConfigOpen(true);
            }}
          />

          {/* Modal de sucesso */}
          <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
            <DialogContent className="rounded-[16px] max-w-[760px] p-0">
              <DialogTitle className="sr-only">Pagamentos concluídos</DialogTitle>
              <DialogDescription className="sr-only">
                Extrato dos pagamentos que foram concluídos com sucesso
              </DialogDescription>
              
              <div className="flex items-center justify-between px-4 py-2">
                <div className="text-[20px] font-bold">Pagamentos concluídos</div>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Fechar">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
              <div className="grid gap-3 text-sm px-4 pt-2 pb-4">
                <div className="rounded-lg border border-border bg-white">
                  <div className="px-4 py-3 border-b flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Extrato</h3>
                  </div>
                  <div className="p-2">
                    <ul className="divide-y">
                      {successPaid.map((item) => (
                        <li key={item.id} className="px-3 py-4">
                          <div className="grid grid-cols-3 items-center gap-3">
                            <span className="text-sm text-[#0d0f1c] truncate">{item.fornecedor}</span>
                            <div className="flex items-center justify-center gap-3">
                              <StatusTag value={'Pago'} />
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-[#0d0f1c] tabular-nums whitespace-nowrap">
                                {formatCurrency(item.valor ?? 0)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="h-px my-2 bg-[#EBECEE]" />
                    <div className="px-1 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5F6572]">Valor</span>
                        <span className="text-[#0d0f1c]">{formatCurrency(successBase)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[#5F6572]">Acréscimos (multas/juros)</span>
                        <span className="text-[#0d0f1c]">{formatCurrency(successFees)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[#5F6572]">Forma de pagamento</span>
                        <span className="text-[#0d0f1c]">Boleto</span>
                      </div>
                      <div className="h-px my-3 bg-[#EBECEE]" />
                      <div className="flex items-center justify-between">
                        <span className="text-[#0d0f1c] font-semibold">Total pago</span>
                        <span className="text-[#0d0f1c] font-semibold">{formatCurrency(successTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="px-4 pt-3 pb-6">
                <Button onClick={() => {
                    setSuccessOpen(false);
                    if (successPaid && successPaid.length > 0) {
                    setErpUpdating(new Set(successPaid.map(it => it.id)));
                      setTimeout(() => {
                      setErpUpdating(new Set());
                      }, 2500);
                    }
                    setCurrentTab('liquidados');
                }}>Ver comprovantes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Paginação */}
      <div className="px-4 py-3 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5F6572] font-semibold">Linhas por página</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 px-3 inline-flex items-center gap-2 shadow-none font-bold">
                <span className="t-text-sm">{pagination.pageSize}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {[10, 20, 50, 100].map(sz => (
                <DropdownMenuItem key={sz} onClick={() => pagination.setPageSize(sz)}>
                  {sz}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-3">
              <span className="text-sm text-[#5F6572]">
            Mostrando {filteredData.length === 0 ? 0 : pagination.page * pagination.pageSize + 1}-{Math.min(filteredData.length, (pagination.page + 1) * pagination.pageSize)} de {filteredData.length} resultados
              </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="default"
              disabled={!pagination.hasPrevPage}
              onClick={pagination.prevPage}
              className="font-bold"
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="default"
              disabled={!pagination.hasNextPage}
              onClick={pagination.nextPage}
              className="font-bold"
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>

      {/* Drawer de detalhes */}
      <PaymentDrawer
        key={dCurrent?.id ?? "closed-payment-drawer"}
        open={drawerOpen}
        onOpenChange={(open) => {
          // Não fechar o drawer se um modal de documento estiver aberto
          if (!open && isAnyDocumentModalOpen) {
            return;
          }
          setDrawerOpen(open);
          if (!open) {
            setDCurrent(null);
            setFocusedRowIndex(-1);
          }
        }}
        row={dCurrent}
        data={rowsState}
        setData={setRowsState}
        currentTab={currentTab}
        tabs={tabs}
        onOpenDanfe={documentModals.danfe.open}
        onOpenBoleto={documentModals.boleto.open}
        onOpenComprovante={documentModals.comprovante.open}
        onOpenNFSe={documentModals.nfse.open}
        onOpenCTe={documentModals.cte.open}
        onTabChange={setCurrentTab}
      />

      {/* Modais de documentos */}
      <DANFEModal
        open={documentModals.danfe.isOpen}
        onClose={documentModals.danfe.close}
        doc={documentModals.danfe.doc}
        currentRow={dCurrent}
      />
      <BoletoModal
        open={documentModals.boleto.isOpen}
        onClose={documentModals.boleto.close}
        doc={documentModals.boleto.doc}
        currentRow={dCurrent}
      />
      <ComprovanteModal
        open={documentModals.comprovante.isOpen}
        onClose={documentModals.comprovante.close}
        doc={documentModals.comprovante.doc}
        currentRow={dCurrent}
      />
      <NFSeModal
        open={documentModals.nfse.isOpen}
        onClose={documentModals.nfse.close}
        doc={documentModals.nfse.doc}
        currentRow={dCurrent}
      />
      <CTeModal
        open={documentModals.cte.isOpen}
        onClose={documentModals.cte.close}
        doc={documentModals.cte.doc}
        currentRow={dCurrent}
      />
      <Dialog open={dueDateModalOpen && dueDateModalView === "form"} onOpenChange={handleDueDateModalOpenChange}>
        <DialogContent className="max-w-[560px] gap-0 rounded-[16px] p-0">
          <DialogHeader className="px-6 pt-6 pb-6 text-left">
            <DialogTitle className="text-xl font-bold text-[#0d0f1c]">
              Configurar vencimento padrão
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-6 pb-4">
            <DialogDescription className="mt-4 text-left text-sm leading-5 text-[#5F6572]">{dueDateDescription}</DialogDescription>
            <div className="space-y-2">
              <Label id="payment-condition-label" className="text-sm font-semibold text-[#0d0f1c]">
                Dias após a emissão
              </Label>
              <DropdownMenu open={paymentConditionMenuOpen} onOpenChange={setPaymentConditionMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between px-3 shadow-none"
                    aria-labelledby="payment-condition-label"
                  >
                    <span className={cn("text-sm", paymentCondition ? "text-[#0d0f1c]" : "text-[#5F6572]")}>
                      {paymentCondition
                        ? PAYMENT_CONDITION_OPTIONS.find((option) => option.value === paymentCondition)?.label
                        : "Selecione uma condição"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#5F6572]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  {PAYMENT_CONDITION_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => {
                        setPaymentCondition(option.value);
                        setPaymentConditionMenuOpen(false);
                        if (option.value !== "other") {
                          setCustomDays("");
                        }
                      }}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {shouldShowCustomDaysField && (
              <div className="space-y-2">
                <Label htmlFor="custom-days-input" className="text-sm font-semibold text-[#0d0f1c]">
                  Outro
                </Label>
                <Input
                  id="custom-days-input"
                  inputMode="numeric"
                  placeholder="Digite a quantidade de dias"
                  value={customDays}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/\D/g, "");
                    setCustomDays(nextValue);
                  }}
                  className="shadow-none"
                />
                {customDaysTooHigh && (
                  <p className="text-sm leading-5 text-destructive">
                    O vencimento padrão não pode ser maior que {MAX_DUE_DATE_RULE_DAYS} dias.
                  </p>
                )}
              </div>
            )}

            {resolvedDueDays && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-start gap-2 rounded-lg border border-[#DCE4FF] bg-[#F6F8FF] px-3 py-2.5"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0C3CF7]" />
                <p className="text-sm leading-5 text-[#0d0f1c]">
                  O vencimento será definido para <strong>{resolvedDueDays}</strong> dias após a emissão da nota e
                  aplicado às contas a pagar criadas a partir desta configuração.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pt-6 pb-6">
            <Button variant="outline" onClick={() => handleDueDateModalOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!canSaveDueDateSettings}
              onClick={() => {
                handleSaveDueDateRule();
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DueDateRulesSummaryModal
        open={dueDateModalOpen && dueDateModalView === "list"}
        onOpenChange={handleDueDateModalOpenChange}
        rules={visibleDueDateRules}
        onAddRule={handleAddDueDateRule}
        onEditRule={handleEditDueDateRule}
        onDeleteRule={handleDeleteDueDateRule}
      />
      <BanksSummaryModal
        open={banksSummaryOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Quando o modal é fechado, marcamos todos os bancos em processamento como ativos
            setBankAccounts((prev) =>
              prev.map((b) =>
                b.status === "processando" ? { ...b, status: "ativo" } : b
              )
            );
          }
          setBanksSummaryOpen(open);
        }}
        accounts={bankAccounts}
        onConfigureAnother={() => {
          setBanksSummaryOpen(false);
          setBanksOnboardingOpen(true);
        }}
        onRemoveBank={(bankId) => {
          setBankAccounts((prev) => prev.filter((bank) => bank.id !== bankId));
        }}
      />
    </section>
  );
}

interface BanksSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: BankAccount[];
  onConfigureAnother?: () => void;
  onRemoveBank?: (bankId: string) => void;
}

interface DueDateRulesSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: Array<{
    id: string;
    companyName: string;
    days: number;
  }>;
  onAddRule: () => void;
  onEditRule: (rule: { id: string; companyName: string; days: number }) => void;
  onDeleteRule: (id: string) => void;
}

function DueDateRulesSummaryModal({
  open,
  onOpenChange,
  rules,
  onAddRule,
  onEditRule,
  onDeleteRule,
}: DueDateRulesSummaryModalProps) {
  const RULES_PAGE_SIZE = 5;
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setPage(0);
    }
  }, [open]);

  React.useEffect(() => {
    const maxValidPage = Math.max(0, Math.ceil(rules.length / RULES_PAGE_SIZE) - 1);
    if (page > maxValidPage) {
      setPage(maxValidPage);
    }
  }, [page, rules.length]);

  const paginatedRules = React.useMemo(() => {
    const start = page * RULES_PAGE_SIZE;
    return rules.slice(start, start + RULES_PAGE_SIZE);
  }, [page, rules]);

  const hasPagination = rules.length > RULES_PAGE_SIZE;
  const hasPrevPage = page > 0;
  const hasNextPage = (page + 1) * RULES_PAGE_SIZE < rules.length;
  const visibleStart = rules.length === 0 ? 0 : page * RULES_PAGE_SIZE + 1;
  const visibleEnd = Math.min(rules.length, (page + 1) * RULES_PAGE_SIZE);

  return (
    <ScrollableModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Vencimento padrão"
      icon={<Calendar className="h-5 w-5 text-[#0d0f1c]" />}
      maxWidth="760px"
      showClose={true}
      actions={
        <>
          <Button
            variant="ghost"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d0f1c]"
            onClick={onAddRule}
          >
            <Plus className="h-4 w-4" />
            Criar novo
          </Button>
          <Button className="px-6 font-bold" onClick={() => onOpenChange(false)}>
            Concluir
          </Button>
        </>
      }
    >
      <div className="grid gap-3 text-sm">
        <p className="text-sm text-[#5F6572]">
          Gerencie o vencimento padrão de suas empresas. Adicione, edite ou remova conforme necessário.
        </p>

        <div className="rounded-lg border border-border bg-white overflow-hidden">
          {rules.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#5F6572]">
              Nenhum vencimento padrão configurado até o momento
            </div>
          ) : (
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "40%" }} />
                <col style={{ width: "40%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr className="h-11 border-b border-border bg-[#F5F5F6]">
                  <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Empresa</th>
                  <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Regra</th>
                  <th className="px-4 py-2 text-center text-[rgba(4,14,35,0.64)]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRules.map((rule, idx) => (
                  <tr
                    key={rule.id}
                    className={idx !== paginatedRules.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="px-4 py-4 text-[#0d0f1c]">
                      <span className="block truncate">{rule.companyName}</span>
                    </td>
                    <td className="px-4 py-4 text-[#5F6572]">
                      <span className="block truncate">{rule.days} dias após a emissão da nota</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar regra de ${rule.companyName}`}
                          onClick={() => onEditRule(rule)}
                        >
                          <Pencil className="h-4 w-4 text-[#5F6572]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Excluir regra de ${rule.companyName}`}
                          onClick={() => onDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-[#5F6572]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {hasPagination && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#5F6572]">
              Mostrando {visibleStart}-{visibleEnd} de {rules.length} resultados
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="default"
                disabled={!hasPrevPage}
                onClick={() => setPage((prev) => prev - 1)}
                className="font-bold"
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="default"
                disabled={!hasNextPage}
                onClick={() => setPage((prev) => prev + 1)}
                className="font-bold"
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScrollableModal>
  );
}

function BanksSummaryModal({
  open,
  onOpenChange,
  accounts,
  onConfigureAnother,
  onRemoveBank,
}: BanksSummaryModalProps) {
  const [bankPendingRemoval, setBankPendingRemoval] =
    React.useState<BankAccount | null>(null);
  const processingCount = accounts.filter((b) => b.status === "processando").length;

  React.useEffect(() => {
    if (!open) {
      setBankPendingRemoval(null);
    }
  }, [open]);

  const handleConfirmRemoveBank = () => {
    if (!bankPendingRemoval) return;

    onRemoveBank?.(bankPendingRemoval.id);
    setBankPendingRemoval(null);
    onOpenChange(false);
    toast.success("Banco removido com sucesso", {
      duration: 5000,
    });
  };

  if (bankPendingRemoval) {
    return (
      <ScrollableModal
        open={open}
        onClose={() => setBankPendingRemoval(null)}
        title="Remover banco"
        icon={<Trash2 className="h-5 w-5 text-[#0d0f1c]" />}
        maxWidth="760px"
        showClose={true}
        actions={
          <>
            <Button
              variant="ghost"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d0f1c]"
              onClick={() => setBankPendingRemoval(null)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" className="px-6 font-bold" onClick={handleConfirmRemoveBank}>
              Sim, remover
            </Button>
          </>
        }
      >
        <div className="grid gap-6 text-sm">
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "18%" }} />
              </colgroup>
              <thead>
                <tr className="h-11 border-b border-border bg-[#F5F5F6]">
                  <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Banco</th>
                  <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Agência / Conta</th>
                  <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Empresa</th>
                  <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-4 text-[#0d0f1c]">
                    <span className="block truncate">{bankPendingRemoval.nomeBanco}</span>
                  </td>
                  <td className="px-4 py-4 text-[#5F6572]">
                    <span className="block truncate">
                      {bankPendingRemoval.agencia}-{bankPendingRemoval.digitoConta ?? "0"} / {bankPendingRemoval.conta}
                      {bankPendingRemoval.digitoConta ? `-${bankPendingRemoval.digitoConta}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#5F6572]">
                    <span className="block truncate">{bankPendingRemoval.titular}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-[#F5F5F6] px-3 py-1 text-xs font-semibold text-[#5F6572]">
                      {bankPendingRemoval.status === "processando" ? "Processando" : "Ativo"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid gap-1">
            <h3 className="text-base font-semibold text-[#0d0f1c]">
              Deseja remover este banco?
            </h3>
            <p className="text-sm text-[#5F6572]">
              Você pode adicionar novamente mais tarde
            </p>
          </div>
        </div>
      </ScrollableModal>
    );
  }

  return (
    <ScrollableModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Bancos"
      icon={<Landmark className="h-5 w-5 text-[#0d0f1c]" />}
      maxWidth="760px"
      showClose={true}
      actions={
        <>
          <Button
            variant="ghost"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d0f1c]"
            onClick={onConfigureAnother}
          >
            <Plus className="h-4 w-4" />
            Configurar outro banco
          </Button>
          <Button className="px-6 font-bold" onClick={() => onOpenChange(false)}>
            Concluir
          </Button>
        </>
      }
    >
      <div className="grid gap-3 text-sm">
        <p className="text-sm text-[#5F6572]">
          Gerencie os bancos vinculados ao Gestão de pagamentos. Adicione ou remova
          conforme necessário.
        </p>

        <div className="rounded-lg border border-border bg-white overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "24%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr className="h-11 border-b border-border bg-[#F5F5F6]">
                <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Banco</th>
                <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Agência / Conta</th>
                <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Empresa</th>
                <th className="px-4 py-2 text-left text-[rgba(4,14,35,0.64)]">Status</th>
                <th className="px-4 py-2 text-center text-[rgba(4,14,35,0.64)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((bank, idx) => (
                <tr
                  key={bank.id}
                  className={idx !== accounts.length - 1 ? "border-b border-border" : ""}
                >
                  <td className="px-4 py-4 text-[#0d0f1c]">
                    <span className="block truncate">{bank.nomeBanco}</span>
                  </td>
                  <td className="px-4 py-4 text-[#5F6572]">
                    <span className="block truncate">
                      {bank.agencia}-{bank.digitoConta ?? "0"} / {bank.conta}
                      {bank.digitoConta ? `-${bank.digitoConta}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#5F6572]">
                    <span className="block truncate">{bank.titular}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-[#F5F5F6] px-3 py-1 text-xs font-semibold text-[#5F6572]">
                      {bank.status === "processando" ? "Processando" : "Ativo"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remover banco"
                      onClick={() => setBankPendingRemoval(bank)}
                    >
                      <Trash2 className="h-4 w-4 text-[#5F6572]" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {processingCount > 0 && (
          <div
            className="flex w-full items-center gap-4 rounded-lg p-4"
            style={{ background: "var(--Colors-azure-50, #E6F3FD)" }}
          >
            <Info
              className="h-5 w-5 shrink-0"
              style={{ color: "var(--Colors-azure-1000, #003F70)" }}
            />
            <span
              className="text-sm"
              style={{ color: "var(--Colors-azure-1000, #003F70)" }}
            >
              Você tem {processingCount} configuração de banco em andamento. Isso pode
              levar até X horas para concluir.
            </span>
          </div>
        )}
      </div>
    </ScrollableModal>
  );
}

type BankProviderId = "bb" | "inter" | "btg" | "santander" | "sicredi";

const BANK_PROVIDER_CONFIG: Record<
  BankProviderId,
  {
    label: string;
    nomeBanco: string;
    apelido: string;
    defaultAgencia: string;
    defaultConta: string;
    defaultDigito: string;
  }
> = {
  bb: {
    label: "Banco do Brasil - 001",
    nomeBanco: "Banco do Brasil",
    apelido: "Conta Banco do Brasil",
    defaultAgencia: "0001",
    defaultConta: "123456",
    defaultDigito: "0",
  },
  inter: {
    label: "Banco Inter - 077",
    nomeBanco: "Banco Inter",
    apelido: "Conta Banco Inter",
    defaultAgencia: "0001",
    defaultConta: "123456",
    defaultDigito: "0",
  },
  btg: {
    label: "BTG Pactual - 208",
    nomeBanco: "BTG Pactual",
    apelido: "Conta BTG Pactual",
    defaultAgencia: "0001",
    defaultConta: "123456",
    defaultDigito: "0",
  },
  santander: {
    label: "Santander - 033",
    nomeBanco: "Santander",
    apelido: "Conta Santander",
    defaultAgencia: "1234",
    defaultConta: "987654",
    defaultDigito: "1",
  },
  sicredi: {
    label: "Sicredi - 748",
    nomeBanco: "Sicredi",
    apelido: "Conta Sicredi",
    defaultAgencia: "0001",
    defaultConta: "123456",
    defaultDigito: "0",
  },
};

interface BankAccountConfigurationScreenProps {
  provider: BankProviderId;
  selectedCompanyIds: string[];
  onCancel: () => void;
  onComplete: (bank: BankAccount) => void;
}

function BankAccountConfigurationScreen({
  provider,
  selectedCompanyIds,
  onCancel,
  onComplete,
}: BankAccountConfigurationScreenProps) {
  const initialCompany =
    companies.find((c) => selectedCompanyIds.includes(c.id) && c.id !== "all") ??
    companies.find((c) => c.id === "matriz") ??
    companies[0];

  const stripCnpjFromLabel = (full: string | undefined) => {
    if (!full) return "";
    const cnpjPattern = /\s*\[\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\]\s*$/;
    return full.replace(cnpjPattern, "").trim();
  };

  const getCompanyDisplayWithCnpj = (c: (typeof companies)[0] | undefined) => {
    if (!c) return "";
    const name = stripCnpjFromLabel(c.full);
    return c.cnpj ? `${name} - ${c.cnpj}` : name;
  };

  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | null>(
    initialCompany?.id ?? null
  );
  const [companyName, setCompanyName] = React.useState(
    getCompanyDisplayWithCnpj(initialCompany)
  );
  const [companyLegalName, setCompanyLegalName] = React.useState(
    stripCnpjFromLabel(initialCompany?.full)
  );

  const [bankLabel, setBankLabel] = React.useState(
    BANK_PROVIDER_CONFIG[provider].label
  );
  const [accountType, setAccountType] = React.useState<BankAccount["tipoConta"]>("corrente");
  const [agencyNumber, setAgencyNumber] = React.useState("");
  const [agencyDigit, setAgencyDigit] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountDigit, setAccountDigit] = React.useState("");
  const [agreementNumber, setAgreementNumber] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [clientSecret, setClientSecret] = React.useState("");
  const [applicationKey, setApplicationKey] = React.useState("");
  const [useExistingCertificate, setUseExistingCertificate] = React.useState(true);
  const [errors, setErrors] = React.useState<Record<string, boolean>>({});
  const [unlockedStep, setUnlockedStep] = React.useState<1 | 2 | 3 | 4>(1);

  const BANK_OPTIONS: Array<{ id: BankProviderId; label: string }> = (
    Object.entries(BANK_PROVIDER_CONFIG) as Array<
      [BankProviderId, (typeof BANK_PROVIDER_CONFIG)[BankProviderId]]
    >
  ).map(([id, config]) => ({ id, label: config.label }));

  const ACCOUNT_TYPE_OPTIONS: Array<{ id: BankAccount["tipoConta"]; label: string }> = [
    { id: "corrente", label: "Conta corrente" },
    { id: "poupanca", label: "Poupança" },
    { id: "pagamento", label: "Conta pagamento" },
  ];

  const isStepCompleted = (stepNumber: 1 | 2 | 3 | 4) => unlockedStep > stepNumber;
  // "Bloqueado" aqui significa: somente a etapa atual pode ser editada.
  const isStepLocked = (stepNumber: 1 | 2 | 3 | 4) => unlockedStep !== stepNumber;
  const isActiveStep = (stepNumber: 1 | 2 | 3 | 4) => unlockedStep === stepNumber;

  const validateStep1 = () => {
    const newErrors: Record<string, boolean> = {};
    if (!selectedCompanyId || !companyName) newErrors.company = true;
    if (!companyLegalName) newErrors.companyLegalName = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1And2 = () => {
    const newErrors: Record<string, boolean> = {};
    if (!selectedCompanyId || !companyName) newErrors.company = true;
    if (!companyLegalName) newErrors.companyLegalName = true;

    if (!agencyNumber) newErrors.agencyNumber = true;
    if (!agencyDigit) newErrors.agencyDigit = true;
    if (!accountNumber) newErrors.accountNumber = true;
    if (!accountDigit) newErrors.accountDigit = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    setErrors({});
    setUnlockedStep(step);
  };

  const handleNextFromStep1 = () => {
    if (!validateStep1()) return;
    goToStep(2);
  };

  const handleNextFromStep2 = () => {
    // A Sessão 3 depende da validade das sessões anteriores.
    if (!validateStep1And2()) return;
    goToStep(3);
  };

  const handleNextFromStep3 = () => {
    // A Sessão 4 depende da validade das sessões anteriores (até a 2).
    if (!validateStep1And2()) return;
    goToStep(4);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!selectedCompanyId || !companyName) newErrors.company = true;
    if (!companyLegalName) newErrors.companyLegalName = true;
    if (!agencyNumber) newErrors.agencyNumber = true;
    if (!agencyDigit) newErrors.agencyDigit = true;
    if (!accountNumber) newErrors.accountNumber = true;
    if (!accountDigit) newErrors.accountDigit = true;
    if (!agreementNumber) newErrors.agreementNumber = true;
    if (!clientId) newErrors.clientId = true;
    if (!clientSecret) newErrors.clientSecret = true;
    if (!applicationKey) newErrors.applicationKey = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const now = Date.now();
    const resolvedCompany =
      companies.find((c) => c.id === selectedCompanyId) ?? initialCompany;
    const providerConfig = BANK_PROVIDER_CONFIG[provider];
    const newBank: BankAccount = {
      id: `bank-${now}-${provider}`,
      nomeBanco: providerConfig.nomeBanco,
      apelido: providerConfig.apelido,
      tipoConta: accountType,
      agencia: agencyNumber || providerConfig.defaultAgencia,
      conta: accountNumber || providerConfig.defaultConta,
      digitoConta: accountDigit || providerConfig.defaultDigito,
      titular: companyLegalName || companyName || "Empresa Exemplo LTDA",
      documentoTitular: resolvedCompany?.cnpj || "00.000.000/0001-00",
      principal: true,
      ativa: true,
    };

    onComplete(newBank);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5F6572] hover:text-[#0d0f1c]"
          >
            <ChevronLeft className="h-4 w-4" />
            Descartar configuração
          </button>
          <div className="h-9" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white px-6 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-[#0d0f1c]">
              Configurar conta bancária
            </h1>
            <button
              type="button"
              className="text-sm font-medium text-[#0C3CF7] hover:underline"
            >
              Dúvidas? Acesse o material de apoio
            </button>
          </div>
          <div className="rounded-2xl bg-[#F5F5F6] p-6">
            <div className="flex flex-col gap-8">
              <div className="rounded-2xl border border-[#EBECEE] bg-white pt-8 px-6 pb-6">
            <h2
              className={cn(
                "mb-8 flex items-center gap-2 text-base font-semibold text-[#0d0f1c]",
                isStepCompleted(1) && "opacity-60"
              )}
            >
              <span>1 - Dados da empresa</span>
              {isStepCompleted(1) && <CheckCircle2 className="h-5 w-5" />}
            </h2>
            <div className="h-px w-full bg-[#EBECEE] mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                  Empresa
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isStepLocked(1)}
                      className={cn(
                        "inline-flex w-full items-center justify-between gap-2 px-3 font-bold shadow-none hover:bg-[#EFF1F2]",
                        errors.company && "border-[#F04438]"
                      )}
                    >
                      <span
                        className={cn(
                          "t-text-sm truncate",
                          !companyName && "text-muted-foreground"
                        )}
                      >
                        {companyName || "Selecione uma empresa"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)]"
                  >
                    {companies
                      .filter((c) => c.id !== "all")
                      .map((company) => (
                        <DropdownMenuItem
                          key={company.id}
                          onClick={() => {
                            setSelectedCompanyId(company.id);
                            setCompanyName(getCompanyDisplayWithCnpj(company));
                            setCompanyLegalName(stripCnpjFromLabel(company.full));
                          }}
                          className="py-2"
                        >
                          <span className="text-sm font-semibold text-[#0d0f1c]">
                            {getCompanyDisplayWithCnpj(company)}
                          </span>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                  Razão Social
                </Label>
                <Input
                  value={companyLegalName}
                  disabled={true}
                  placeholder="Razão social (sem CNPJ)"
                  className={cn(
                    "shadow-none",
                    errors.companyLegalName && "border-[#F04438]"
                  )}
                />
              </div>
            </div>
              <div className="h-px w-full bg-[#EBECEE] mt-4 mb-4" />

            <div className="mt-6 flex justify-start">
              {isActiveStep(1) && (
                <Button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="font-bold"
                >
                  Próximo
                </Button>
              )}
            </div>
              </div>

              <div className="rounded-2xl border border-[#EBECEE] bg-white pt-8 px-6 pb-6">
            <h2
              className={cn(
                "mb-8 flex items-center gap-2 text-base font-semibold text-[#0d0f1c]",
                isStepCompleted(2) && "opacity-60"
              )}
            >
              <span>2 - Dados Bancários</span>
              {isStepCompleted(2) && <CheckCircle2 className="h-5 w-5" />}
            </h2>
            <div className="h-px w-full bg-[#EBECEE] mt-4 mb-4" />
            <div className="mb-4 flex flex-wrap items-start gap-4">
              <div className="w-full md:w-[246px]">
                <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                  Banco
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isStepLocked(2)}
                      className="inline-flex w-full items-center justify-between gap-2 px-3 font-bold shadow-none hover:bg-[#EFF1F2]"
                    >
                      <span
                        className={cn(
                          "t-text-sm truncate",
                          !bankLabel && "text-muted-foreground"
                        )}
                      >
                        {bankLabel || "Selecione o banco"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)]"
                  >
                    {BANK_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => {
                          setBankLabel(option.label);
                        }}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="w-full md:w-[246px]">
                <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                  Tipo de conta
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isStepLocked(2)}
                      className="inline-flex w-full items-center justify-between gap-2 px-3 font-bold shadow-none hover:bg-[#EFF1F2]"
                    >
                      <span className="t-text-sm truncate">
                        {ACCOUNT_TYPE_OPTIONS.find((opt) => opt.id === accountType)?.label ??
                          "Selecione o tipo de conta"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)]"
                  >
                    {ACCOUNT_TYPE_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setAccountType(option.id)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-4">
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                    Agência
                  </Label>
                  <Input
                    value={agencyNumber}
                    onChange={(e) => setAgencyNumber(e.target.value)}
                    disabled={isStepLocked(2)}
                    placeholder="Número"
                    className={cn(
                      "md:w-[112px] shadow-none",
                      errors.agencyNumber && "border-[#F04438]"
                    )}
                  />
                </div>
                <span className="mb-2 text-sm font-semibold text-[#5F6572]">
                  -
                </span>
                <div>
                  <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                    Dígito
                  </Label>
                  <Input
                    value={agencyDigit}
                    onChange={(e) => setAgencyDigit(e.target.value)}
                    disabled={isStepLocked(2)}
                    placeholder="Dígito"
                    className={cn(
                      "md:w-[71px] shadow-none",
                      errors.agencyDigit && "border-[#F04438]"
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                    Conta corrente
                  </Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    disabled={isStepLocked(2)}
                    placeholder="Número"
                    className={cn(
                      "md:w-[160px] shadow-none",
                      errors.accountNumber && "border-[#F04438]"
                    )}
                  />
                </div>
                <span className="mb-2 text-sm font-semibold text-[#5F6572]">
                  -
                </span>
                <div>
                  <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                    Dígito
                  </Label>
                  <Input
                    value={accountDigit}
                    onChange={(e) => setAccountDigit(e.target.value)}
                    disabled={isStepLocked(2)}
                    placeholder="Dígito"
                    className={cn(
                      "md:w-[71px] shadow-none",
                      errors.accountDigit && "border-[#F04438]"
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-[#EBECEE] mt-4 mb-4" />
            <div className="mt-6 flex justify-start">
              {isActiveStep(2) && (
                <Button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="font-bold"
                >
                  Próximo
                </Button>
              )}
            </div>
              </div>

              <div className="rounded-2xl border border-[#EBECEE] bg-white pt-8 px-6 pb-6">
            <h2
              className={cn(
                "mb-8 flex items-center gap-2 text-base font-semibold text-[#0d0f1c]",
                isStepCompleted(3) && "opacity-60"
              )}
            >
              <span>3 - Certificado digital A1</span>
              {isStepCompleted(3) && <CheckCircle2 className="h-5 w-5" />}
            </h2>
            <div className="h-px w-full bg-[#EBECEE] mt-4 mb-4" />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={useExistingCertificate}
                  disabled={isStepLocked(3)}
                  onCheckedChange={(checked) =>
                    setUseExistingCertificate(Boolean(checked))
                  }
                />
                <span className="text-sm font-medium text-[#0d0f1c]">
                  O Certificado Digital A1 presente na Qive é o mesmo do meu banco
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-[#EBECEE] mt-4 mb-4" />
            <div className="mt-6 flex justify-start">
              {isActiveStep(3) && (
                <Button
                  type="button"
                  onClick={handleNextFromStep3}
                  className="font-bold"
                >
                  Próximo
                </Button>
              )}
            </div>
              </div>

              <div className="rounded-2xl border border-[#EBECEE] bg-white pt-8 px-6 pb-6">
            <h2
              className={cn(
                "mb-8 flex items-center gap-2 text-base font-semibold text-[#0d0f1c]",
                isStepCompleted(4) && "opacity-60"
              )}
            >
              <span>4 - Dados de configuração bancária</span>
              {isStepCompleted(4) && <CheckCircle2 className="h-5 w-5" />}
            </h2>
            <div className="h-px w-full bg-[#EBECEE] mb-4" />

            <div className="mb-4 flex flex-wrap gap-4">
              <div className="w-full md:w-[252px]">
                <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                  Número do convênio do pagamento
                </Label>
                <Input
                  value={agreementNumber}
                  onChange={(e) => setAgreementNumber(e.target.value)}
                  disabled={isStepLocked(4)}
                  placeholder="Digite ou cole o número"
                  className={cn(
                    "shadow-none w-full",
                    errors.agreementNumber && "border-[#F04438]"
                  )}
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <p className="mt-6 text-xs leading-snug italic text-[#5F6572]">
                  O convênio de pagamento é: o convênio de pagamento é um código definido
                  junto ao banco que permite realizar pagamentos e transferências na
                  plataforma. Deve ser solicitado ao gerente do banco. Veja o{" "}
                  <button
                    type="button"
                    className="font-semibold not-italic text-[#0C3CF7] underline-offset-2 hover:underline"
                  >
                    material de apoio
                  </button>
                  .
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-[#EBECEE] mb-4" />

            <div className="mb-4">
              <div className="flex flex-wrap gap-4">
                <div className="w-full md:w-[252px]">
                  <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                    Client ID
                  </Label>
                  <Input
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    disabled={isStepLocked(4)}
                    placeholder="Digite ou cole o número"
                    className={cn(
                      "shadow-none w-full",
                      errors.clientId && "border-[#F04438]"
                    )}
                  />
                </div>
                <div className="w-full md:w-[252px]">
                  <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                    Client Secret
                  </Label>
                  <Input
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    disabled={isStepLocked(4)}
                    placeholder="Digite ou cole o número"
                    className={cn(
                      "shadow-none w-full",
                      errors.clientSecret && "border-[#F04438]"
                    )}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-start gap-4">
                <div className="w-full md:w-[520px]">
                  <Label className="mb-1 block text-sm font-semibold text-[#5F6572]">
                    Application Key
                  </Label>
                  <Input
                    value={applicationKey}
                    onChange={(e) => setApplicationKey(e.target.value)}
                    disabled={isStepLocked(4)}
                    placeholder="Digite ou cole o número"
                    className={cn(
                      "shadow-none w-full",
                      errors.applicationKey && "border-[#F04438]"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-[220px]">
                  <p className="mt-6 text-xs leading-snug italic text-[#5F6572]">
                    O Client ID, Client Secret e Application Key são gerados a partir da
                    plataforma do seu banco.
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-[#EBECEE] mt-4 mb-4" />
            <div className="mt-6 flex justify-start">
              {isActiveStep(4) && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="font-bold"
                >
                  Concluir configuração
                </Button>
              )}
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="px-6 pb-6 text-center text-[11px] text-[#5F6572]">
        Texto sobre questões jurídicas possivelmente necessárias. Talvez conteúdos citando o parceiro
      </p>
    </div>
  );
}
