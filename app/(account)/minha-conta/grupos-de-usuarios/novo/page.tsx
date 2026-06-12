"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2, PencilLine, X } from "lucide-react";
import { toast } from "sonner";
import { useFeatures } from "@/lib/features/useFeatures";
import { toAccountFetchError } from "../../lib/account-fetch-error";
import { createAccountGrupo, fetchAccountGrupos } from "../lib/account-grupos-service";
import {
  createPermissionState,
  countEnabledPermissions,
  DOCUMENT_PERMISSIONS,
  FEATURE_PERMISSIONS,
  NOTE_ACTION_PERMISSIONS,
  type PermissionItem,
} from "./grupo-form-config";
import {
  GESTAO_PAGAMENTOS_APROVACAO_OPTIONS,
  createCheckboxPermissionState,
} from "./aprovacao-permissoes-config";
import { FeatureAprovacaoModal } from "./FeatureAprovacaoModal";
import { SupplierPortalCnpjsModal } from "./SupplierPortalCnpjsModal";
import {
  SUPPLIER_PORTAL_ACCESS_PERMISSION,
  SUPPLIER_PORTAL_ACTIONS_OPTIONS,
  SUPPLIER_PORTAL_APPROVAL_PERMISSION,
  SUPPLIER_PORTAL_CNPJS_PERMISSION,
  SUPPLIER_PORTAL_DFE_OPTIONS,
  SUPPLIER_PORTAL_DFE_PERMISSION,
  SUPPLIER_PORTAL_PRODUCT_KEY,
  countSupplierPortalConfiguredPermissions,
  createSupplierPortalActionsState,
  createSupplierPortalDfeState,
  createSupplierPortalPermissions,
} from "./portal-fornecedores-permissoes-config";

type AprovacaoModalId = "gestao-pagamentos-aprovacao";

type SupplierPortalModalId =
  | "supplier-portal-cnpjs"
  | "supplier-portal-dfe"
  | "supplier-portal-approval";

const CHECKBOX_CLASS =
  "h-4 w-4 shrink-0 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-1 checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45";

const FORM_MAX_WIDTH = "max-w-[720px]";
const SECTION_GRID =
  "grid gap-4 py-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-start md:gap-x-8";
const CONTROL_SLOT = "flex h-5 w-5 shrink-0 items-center justify-center";

function SectionDivider() {
  return <hr className="border-0 border-t border-[rgba(4,14,35,0.08)]" />;
}

function StatusTag({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "h-5 px-2 text-[11px] font-medium leading-none",
        active
          ? "whitespace-nowrap border-[#B8CCFF] bg-[#E7EEFF] text-[#003F70]"
          : "border-[#E5E7EB] bg-[#F3F4F6] text-[#8A90A0]"
      )}
    >
      {children}
    </Tag>
  );
}

function PermitAllCheckbox({
  checked,
  indeterminate,
  onChange,
  id,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#8A90A0]"
    >
      <span>Permitir tudo</span>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        className={CHECKBOX_CLASS}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function PermissionRow({
  item,
  checked,
  description,
  onToggle,
  onNavigate,
}: {
  item: PermissionItem;
  checked: boolean;
  description?: string;
  onToggle?: (checked: boolean) => void;
  onNavigate?: () => void;
}) {
  const isLink = item.type === "link";
  const rowDescription = description ?? item.description;

  const handleClick = () => {
    if (isLink) {
      onNavigate?.();
      return;
    }
    onToggle?.(!checked);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 py-3",
        isLink && "cursor-pointer rounded-md transition-colors hover:bg-[#FAFAFF]"
      )}
      onClick={isLink ? handleClick : undefined}
      onKeyDown={(event) => {
        if (isLink && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          handleClick();
        }
      }}
      role={isLink ? "button" : undefined}
      tabIndex={isLink ? 0 : undefined}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#0d0f1c]">{item.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[#8A90A0]">{rowDescription}</p>
      </div>
      <div className={CONTROL_SLOT}>
        {isLink ? (
          <ChevronRight className="h-4 w-4 text-[#8A90A0]" aria-hidden />
        ) : (
          <input
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked={checked}
            onChange={(event) => {
              event.stopPropagation();
              onToggle?.(event.target.checked);
            }}
            onClick={(event) => event.stopPropagation()}
            aria-label={item.title}
          />
        )}
      </div>
    </div>
  );
}

function FormSection({
  title,
  required,
  statusLabel,
  statusActive = false,
  permitAllId,
  permitAllChecked,
  permitAllIndeterminate,
  onPermitAllChange,
  error,
  children,
  leftExtra,
}: {
  title: string;
  required?: boolean;
  statusLabel: string;
  statusActive?: boolean;
  permitAllId?: string;
  permitAllChecked?: boolean;
  permitAllIndeterminate?: boolean;
  onPermitAllChange?: (checked: boolean) => void;
  error?: string;
  children: React.ReactNode;
  leftExtra?: React.ReactNode;
}) {
  return (
    <section className={SECTION_GRID}>
      <div className="space-y-2 md:pt-0.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <h2 className="text-sm font-semibold text-[#0d0f1c]">{title}</h2>
          {required ? (
            <span className="text-xs text-[#8A90A0]">(obrigatório)</span>
          ) : null}
        </div>
        <StatusTag active={statusActive}>{statusLabel}</StatusTag>
        {error ? <p className="text-xs text-[#B91C1C]">{error}</p> : null}
        {leftExtra}
      </div>

      <div className="min-w-0">
        {permitAllId && onPermitAllChange ? (
          <div className="mb-1 flex min-h-9 items-center justify-end">
            <PermitAllCheckbox
              id={permitAllId}
              checked={permitAllChecked ?? false}
              indeterminate={permitAllIndeterminate ?? false}
              onChange={onPermitAllChange}
            />
          </div>
        ) : null}
        <div className="divide-y divide-[rgba(4,14,35,0.08)]">{children}</div>
      </div>
    </section>
  );
}

function usePermissionSection(items: PermissionItem[]) {
  const ids = React.useMemo(() => items.map((item) => item.id), [items]);
  const [state, setState] = React.useState(() => createPermissionState(items));

  const allChecked = ids.length > 0 && ids.every((id) => state[id]);
  const someChecked = ids.some((id) => state[id]);
  const permitAllChecked = allChecked;
  const permitAllIndeterminate = someChecked && !allChecked;

  const setPermitAll = (checked: boolean) => {
    setState(Object.fromEntries(ids.map((id) => [id, checked])));
  };

  const setItem = (id: string, checked: boolean) => {
    setState((current) => ({ ...current, [id]: checked }));
  };

  const enabledCount = countEnabledPermissions(state);

  return {
    state,
    setItem,
    setPermitAll,
    permitAllChecked,
    permitAllIndeterminate,
    enabledCount,
  };
}

export default function AdicionarGrupoPage() {
  const router = useRouter();
  const { isProductEnabled } = useFeatures();
  const isPortalFornecedoresEnabled = isProductEnabled(SUPPLIER_PORTAL_PRODUCT_KEY);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [existingGroupNames, setExistingGroupNames] = React.useState<string[]>([]);

  const [groupName, setGroupName] = React.useState("Novo grupo");
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState("Novo grupo");
  const [selectedCnpjCount, setSelectedCnpjCount] = React.useState(0);

  const documents = usePermissionSection(DOCUMENT_PERMISSIONS);
  const noteActions = usePermissionSection(NOTE_ACTION_PERMISSIONS);
  const features = usePermissionSection(FEATURE_PERMISSIONS);
  const supplierPortalAccess = usePermissionSection([SUPPLIER_PORTAL_ACCESS_PERMISSION]);

  const [supplierPortalAllowedCnpjs, setSupplierPortalAllowedCnpjs] = React.useState<
    string[]
  >([]);
  const [supplierPortalAllSuppliersSelected, setSupplierPortalAllSuppliersSelected] =
    React.useState(true);
  const [supplierPortalDfeSelection, setSupplierPortalDfeSelection] = React.useState(
    () => createSupplierPortalDfeState()
  );
  const [supplierPortalActionsSelection, setSupplierPortalActionsSelection] =
    React.useState(() => createSupplierPortalActionsState());
  const [supplierPortalLinkState, setSupplierPortalLinkState] = React.useState({
    [SUPPLIER_PORTAL_CNPJS_PERMISSION.id]: true,
    [SUPPLIER_PORTAL_DFE_PERMISSION.id]: false,
    [SUPPLIER_PORTAL_APPROVAL_PERMISSION.id]: false,
  });

  const [activeSupplierPortalModal, setActiveSupplierPortalModal] =
    React.useState<SupplierPortalModalId | null>(null);

  const [errors, setErrors] = React.useState({
    empresas: "",
    documentos: "",
  });

  const [activeAprovacaoModal, setActiveAprovacaoModal] =
    React.useState<AprovacaoModalId | null>(null);
  const [pagamentosAprovacao, setPagamentosAprovacao] = React.useState(() =>
    createCheckboxPermissionState(GESTAO_PAGAMENTOS_APROVACAO_OPTIONS)
  );

  React.useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  React.useEffect(() => {
    let cancelled = false;

    void fetchAccountGrupos()
      .then((grupos) => {
        if (!cancelled) {
          setExistingGroupNames(grupos.map((grupo) => grupo.nome));
        }
      })
      .catch(() => {
        /* nomes usados só para validação de duplicidade no save */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const startEditingName = () => {
    setNameDraft(groupName);
    setIsEditingName(true);
  };

  const commitName = () => {
    const trimmed = nameDraft.trim();
    setGroupName(trimmed || "Novo grupo");
    setIsEditingName(false);
  };

  const handleBackToGroups = () => {
    router.push("/minha-conta/grupos-de-usuarios");
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/minha-conta/usuarios");
  };

  const handleOpenCompanies = () => {
    toast.info("Seleção de empresas/CNPJs em breve.", {
      description: "Fluxo preparado para integração futura.",
    });
    setSelectedCnpjCount(14);
    setErrors((current) => ({ ...current, empresas: "" }));
  };

  const handleFeatureNavigate = (item: PermissionItem) => {
    if (item.id === "gestao-pagamentos-aprovacao") {
      setActiveAprovacaoModal("gestao-pagamentos-aprovacao");
      return;
    }

    toast.info(`Detalhes: ${item.title}`, {
      description: "Fluxo de permissões específicas em breve.",
    });
  };

  const handleSavePagamentosAprovacao = (values: Record<string, boolean>) => {
    setPagamentosAprovacao(values);
    const hasSelection = Object.values(values).some(Boolean);
    features.setItem("gestao-pagamentos-aprovacao", hasSelection);
  };

  const handleSupplierPortalNavigate = (item: PermissionItem) => {
    if (item.id === SUPPLIER_PORTAL_CNPJS_PERMISSION.id) {
      setActiveSupplierPortalModal("supplier-portal-cnpjs");
      return;
    }

    if (item.id === SUPPLIER_PORTAL_DFE_PERMISSION.id) {
      setActiveSupplierPortalModal("supplier-portal-dfe");
      return;
    }

    if (item.id === SUPPLIER_PORTAL_APPROVAL_PERMISSION.id) {
      setActiveSupplierPortalModal("supplier-portal-approval");
    }
  };

  const handleSaveSupplierPortalCnpjs = ({
    cnpjs,
    allSuppliersSelected,
  }: {
    cnpjs: string[];
    allSuppliersSelected: boolean;
  }) => {
    setSupplierPortalAllowedCnpjs(cnpjs);
    setSupplierPortalAllSuppliersSelected(allSuppliersSelected);
    setSupplierPortalLinkState((current) => ({
      ...current,
      [SUPPLIER_PORTAL_CNPJS_PERMISSION.id]: allSuppliersSelected || cnpjs.length > 0,
    }));
  };

  const handleSaveSupplierPortalDfe = (values: Record<string, boolean>) => {
    setSupplierPortalDfeSelection(values);
    const hasSelection = Object.values(values).some(Boolean);
    setSupplierPortalLinkState((current) => ({
      ...current,
      [SUPPLIER_PORTAL_DFE_PERMISSION.id]: hasSelection,
    }));
  };

  const handleSaveSupplierPortalActions = (values: Record<string, boolean>) => {
    setSupplierPortalActionsSelection(values);
    const hasSelection = Object.values(values).some(Boolean);
    setSupplierPortalLinkState((current) => ({
      ...current,
      [SUPPLIER_PORTAL_APPROVAL_PERMISSION.id]: hasSelection,
    }));
  };

  const empresasStatusLabel =
    selectedCnpjCount === 0
      ? "Sem acesso à CNPJs"
      : `${selectedCnpjCount} CNPJs`;

  const documentosStatusLabel =
    documents.enabledCount === 0
      ? "Sem acesso à listagens de DFes"
      : documents.enabledCount === 1
        ? "1 listagem de DFes"
        : `${documents.enabledCount} listagens de DFes`;

  const acoesStatusLabel =
    noteActions.enabledCount === 0
      ? "Sem acesso à ações"
      : noteActions.enabledCount === 1
        ? "1 ação"
        : `${noteActions.enabledCount} ações`;

  const funcionalidadesStatusLabel =
    features.enabledCount === 0
      ? "Sem acesso à funcionalidades"
      : features.enabledCount === 1
        ? "1 funcionalidade"
        : `${features.enabledCount} funcionalidades`;

  const supplierPortalConfiguredCount = countSupplierPortalConfiguredPermissions({
    access: supplierPortalAccess.state[SUPPLIER_PORTAL_ACCESS_PERMISSION.id],
    allSuppliersSelected: supplierPortalAllSuppliersSelected,
    allowedSupplierCnpjs: supplierPortalAllowedCnpjs,
    dfeSelection: supplierPortalDfeSelection,
    actionsSelection: supplierPortalActionsSelection,
  });

  const portalFornecedoresStatusLabel =
    supplierPortalConfiguredCount === 0
      ? "Sem permissões no portal"
      : supplierPortalConfiguredCount === 1
        ? "1 permissão no portal"
        : `${supplierPortalConfiguredCount} permissões no portal`;

  const supplierPortalCnpjsDescription = supplierPortalAllSuppliersSelected
    ? "Todos os Fornecedores (Clique para alterar)"
    : supplierPortalAllowedCnpjs.length === 0
      ? "Nenhum CNPJ adicionado"
      : supplierPortalAllowedCnpjs.length === 1
        ? "1 CNPJ informado"
        : `${supplierPortalAllowedCnpjs.length} CNPJs informados`;

  const supplierPortalDfeSelectedCount = Object.values(supplierPortalDfeSelection).filter(
    Boolean
  ).length;

  const supplierPortalDfeDescription =
    supplierPortalDfeSelectedCount === 0
      ? "Nenhum DF-e do Portal selecionado"
      : supplierPortalDfeSelectedCount === 1
        ? "1 tipo de DF-e selecionado"
        : `${supplierPortalDfeSelectedCount} tipos de DF-e selecionados`;

  const supplierPortalActionsSelectedCount = Object.values(
    supplierPortalActionsSelection
  ).filter(Boolean).length;

  const supplierPortalActionsDescription =
    supplierPortalActionsSelectedCount === 0
      ? "Nenhuma ação selecionada"
      : supplierPortalActionsSelectedCount === 1
        ? "1 ação selecionada"
        : `${supplierPortalActionsSelectedCount} ações selecionadas`;

  const empresasDescription =
    selectedCnpjCount === 0
      ? "Nenhum CNPJ selecionado"
      : `${selectedCnpjCount} CNPJs selecionados`;

  const handleSave = async () => {
    if (isSaving) return;

    const nextErrors = { empresas: "", documentos: "" };

    if (selectedCnpjCount === 0) {
      nextErrors.empresas = "Selecione ao menos um CNPJ para continuar.";
    }

    if (documents.enabledCount === 0) {
      nextErrors.documentos = "Selecione ao menos uma listagem de documentos.";
    }

    setErrors(nextErrors);

    if (nextErrors.empresas || nextErrors.documentos) {
      toast.error("Revise os campos obrigatórios antes de salvar.");
      return;
    }

    setIsSaving(true);

    try {
      await createAccountGrupo(
        {
          nome: groupName,
          ...(isPortalFornecedoresEnabled
            ? {
                supplierPortalPermissions: createSupplierPortalPermissions({
                  access: supplierPortalAccess.state[SUPPLIER_PORTAL_ACCESS_PERMISSION.id],
                  allSuppliersSelected: supplierPortalAllSuppliersSelected,
                  allowedSupplierCnpjs: supplierPortalAllowedCnpjs,
                  dfeSelection: supplierPortalDfeSelection,
                  actionsSelection: supplierPortalActionsSelection,
                }),
              }
            : {}),
        },
        existingGroupNames
      );
      toast.success("Grupo criado com sucesso.");
      router.push("/minha-conta/grupos-de-usuarios");
    } catch (error) {
      toast.error(toAccountFetchError(error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-white">
      <div
        className={cn(
          "mx-auto w-full flex-1 px-6 pb-24 pt-5 sm:px-8",
          FORM_MAX_WIDTH
        )}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-0 text-xs font-medium text-[#8A90A0] hover:bg-transparent hover:text-[#5B616F]"
            onClick={handleBackToGroups}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Voltar para grupos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-0 text-xs font-medium text-[#8A90A0] hover:bg-transparent hover:text-[#5B616F]"
            onClick={handleClose}
          >
            <X className="h-3.5 w-3.5" />
            Fechar
          </Button>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-1.5">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                onBlur={commitName}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitName();
                  if (event.key === "Escape") {
                    setNameDraft(groupName);
                    setIsEditingName(false);
                  }
                }}
                className="min-w-[180px] flex-1 border-b border-[#0C3CF7] bg-transparent text-xl font-semibold leading-tight text-[#0d0f1c] outline-none"
                aria-label="Nome do grupo"
              />
            ) : (
              <button
                type="button"
                onClick={startEditingName}
                className="text-left text-xl font-semibold leading-tight text-[#0d0f1c] hover:text-[#0C3CF7]"
              >
                {groupName}
              </button>
            )}
            <button
              type="button"
              onClick={startEditingName}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#8A90A0] hover:bg-[#F5F5F6] hover:text-[#5B616F]"
              aria-label="Editar nome do grupo"
            >
              <PencilLine className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[#8A90A0]">
            Defina quais as permissões e quais opções estarão habilitadas para este grupo.
          </p>
        </header>

        <div>
          <FormSection
            title="Empresas da conta"
            required
            statusLabel={empresasStatusLabel}
            statusActive={selectedCnpjCount > 0}
            error={errors.empresas}
          >
            <button
              type="button"
              onClick={handleOpenCompanies}
              className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-[#FAFAFF]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#0d0f1c]">Empresas da conta</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#8A90A0]">
                  {empresasDescription}
                </p>
              </div>
              <div className={CONTROL_SLOT}>
                <ChevronRight className="h-4 w-4 text-[#8A90A0]" aria-hidden />
              </div>
            </button>
          </FormSection>

          <SectionDivider />

          <FormSection
            title="Listagem de documentos"
            required
            statusLabel={documentosStatusLabel}
            statusActive={documents.enabledCount > 0}
            error={errors.documentos}
            permitAllId="permit-all-documents"
            permitAllChecked={documents.permitAllChecked}
            permitAllIndeterminate={documents.permitAllIndeterminate}
            onPermitAllChange={documents.setPermitAll}
          >
            <>
              {DOCUMENT_PERMISSIONS.map((item) => (
                <PermissionRow
                  key={item.id}
                  item={item}
                  checked={documents.state[item.id]}
                  onToggle={(checked) => {
                    documents.setItem(item.id, checked);
                    setErrors((current) => ({ ...current, documentos: "" }));
                  }}
                  onNavigate={() => handleFeatureNavigate(item)}
                />
              ))}
            </>
          </FormSection>

          <SectionDivider />

          <FormSection
            title="Ações nas notas"
            statusLabel={acoesStatusLabel}
            statusActive={noteActions.enabledCount > 0}
            permitAllId="permit-all-notes"
            permitAllChecked={noteActions.permitAllChecked}
            permitAllIndeterminate={noteActions.permitAllIndeterminate}
            onPermitAllChange={noteActions.setPermitAll}
          >
            <>
              {NOTE_ACTION_PERMISSIONS.map((item) => (
                <PermissionRow
                  key={item.id}
                  item={item}
                  checked={noteActions.state[item.id]}
                  onNavigate={() => handleFeatureNavigate(item)}
                />
              ))}
            </>
          </FormSection>

          <SectionDivider />

          <FormSection
            title="Funcionalidades"
            statusLabel={funcionalidadesStatusLabel}
            statusActive={features.enabledCount > 0}
            permitAllId="permit-all-features"
            permitAllChecked={features.permitAllChecked}
            permitAllIndeterminate={features.permitAllIndeterminate}
            onPermitAllChange={features.setPermitAll}
          >
            <>
              {FEATURE_PERMISSIONS.map((item) => (
                <PermissionRow
                  key={item.id}
                  item={item}
                  checked={features.state[item.id]}
                  onNavigate={() => handleFeatureNavigate(item)}
                />
              ))}
            </>
          </FormSection>

          {isPortalFornecedoresEnabled ? (
            <>
              <SectionDivider />

              <FormSection
                title="Portal de Fornecedores"
                statusLabel={portalFornecedoresStatusLabel}
                statusActive={supplierPortalConfiguredCount > 0}
              >
                <>
                  <PermissionRow
                    item={SUPPLIER_PORTAL_ACCESS_PERMISSION}
                    checked={
                      supplierPortalAccess.state[SUPPLIER_PORTAL_ACCESS_PERMISSION.id]
                    }
                    onToggle={(checked) =>
                      supplierPortalAccess.setItem(
                        SUPPLIER_PORTAL_ACCESS_PERMISSION.id,
                        checked
                      )
                    }
                  />

                  <PermissionRow
                    item={SUPPLIER_PORTAL_CNPJS_PERMISSION}
                    checked={supplierPortalLinkState[SUPPLIER_PORTAL_CNPJS_PERMISSION.id]}
                    description={supplierPortalCnpjsDescription}
                    onNavigate={() =>
                      handleSupplierPortalNavigate(SUPPLIER_PORTAL_CNPJS_PERMISSION)
                    }
                  />

                  <PermissionRow
                    item={SUPPLIER_PORTAL_DFE_PERMISSION}
                    checked={supplierPortalLinkState[SUPPLIER_PORTAL_DFE_PERMISSION.id]}
                    description={supplierPortalDfeDescription}
                    onNavigate={() =>
                      handleSupplierPortalNavigate(SUPPLIER_PORTAL_DFE_PERMISSION)
                    }
                  />

                  <PermissionRow
                    item={SUPPLIER_PORTAL_APPROVAL_PERMISSION}
                    checked={
                      supplierPortalLinkState[SUPPLIER_PORTAL_APPROVAL_PERMISSION.id]
                    }
                    description={supplierPortalActionsDescription}
                    onNavigate={() =>
                      handleSupplierPortalNavigate(SUPPLIER_PORTAL_APPROVAL_PERMISSION)
                    }
                  />
                </>
              </FormSection>
            </>
          ) : null}
        </div>
      </div>

      {activeAprovacaoModal === "gestao-pagamentos-aprovacao" ? (
        <FeatureAprovacaoModal
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) setActiveAprovacaoModal(null);
          }}
          title="Gestão de Pagamentos - Aprovação"
          options={GESTAO_PAGAMENTOS_APROVACAO_OPTIONS}
          selectionMode="multiple"
          checkboxValues={pagamentosAprovacao}
          onSaveMultiple={handleSavePagamentosAprovacao}
        />
      ) : null}

      {activeSupplierPortalModal === "supplier-portal-cnpjs" ? (
        <SupplierPortalCnpjsModal
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) setActiveSupplierPortalModal(null);
          }}
          cnpjs={supplierPortalAllowedCnpjs}
          allSuppliersSelected={supplierPortalAllSuppliersSelected}
          onSave={handleSaveSupplierPortalCnpjs}
        />
      ) : null}

      {activeSupplierPortalModal === "supplier-portal-dfe" ? (
        <FeatureAprovacaoModal
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) setActiveSupplierPortalModal(null);
          }}
          title={SUPPLIER_PORTAL_DFE_PERMISSION.title}
          options={SUPPLIER_PORTAL_DFE_OPTIONS}
          selectionMode="multiple"
          checkboxValues={supplierPortalDfeSelection}
          onSaveMultiple={handleSaveSupplierPortalDfe}
        />
      ) : null}

      {activeSupplierPortalModal === "supplier-portal-approval" ? (
        <FeatureAprovacaoModal
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) setActiveSupplierPortalModal(null);
          }}
          title="Permissão para realizar ações"
          options={SUPPLIER_PORTAL_ACTIONS_OPTIONS}
          selectionMode="multiple"
          checkboxValues={supplierPortalActionsSelection}
          onSaveMultiple={handleSaveSupplierPortalActions}
        />
      ) : null}

      <footer className="sticky bottom-0 z-10 border-t border-[rgba(4,14,35,0.08)] bg-white/95 backdrop-blur-sm">
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-end gap-2 px-6 py-3 sm:px-8",
            FORM_MAX_WIDTH
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-[#5B616F]"
            onClick={handleBackToGroups}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="min-w-[88px] font-bold"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
