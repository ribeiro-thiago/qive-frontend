import type { AprovacaoPermissaoOption } from "./aprovacao-permissoes-config";
import type { PermissionItem } from "./grupo-form-config";
import { createCheckboxPermissionState } from "./aprovacao-permissoes-config";

export const SUPPLIER_PORTAL_PRODUCT_KEY = "portal-de-fornecedores";

export const SUPPLIER_PORTAL_ACCESS_PERMISSION: PermissionItem = {
  id: "supplier_portal_access",
  title: "Acesso ao portal de fornecedores",
  description: "Permite que usuários deste grupo acessem o módulo Portal de Fornecedores.",
  type: "checkbox",
};

export const SUPPLIER_PORTAL_CNPJS_PERMISSION: PermissionItem = {
  id: "supplier_portal_allowed_supplier_cnpjs",
  title: "Acesso a CNPJs fornecedores do portal",
  description: "Defina quais CNPJs de fornecedores poderão ser acessados por usuários deste grupo.",
  type: "link",
};

export const SUPPLIER_PORTAL_DFE_PERMISSION: PermissionItem = {
  id: "supplier_portal_dfe_access",
  title: "DF-es no Portal de Fornecedores",
  description: "(Nenhum DF-e do Portal selecionado)",
  type: "link",
};

export const SUPPLIER_PORTAL_APPROVAL_PERMISSION: PermissionItem = {
  id: "supplier_portal_approval_permission",
  title: "Permissão para realizar ações",
  description: "Permite que usuários deste grupo realizem ações no Portal de Fornecedores.",
  type: "link",
};

export const SUPPLIER_PORTAL_PERMISSIONS: PermissionItem[] = [
  SUPPLIER_PORTAL_ACCESS_PERMISSION,
  SUPPLIER_PORTAL_CNPJS_PERMISSION,
  SUPPLIER_PORTAL_DFE_PERMISSION,
  SUPPLIER_PORTAL_APPROVAL_PERMISSION,
];

export const SUPPLIER_PORTAL_DFE_OPTIONS: AprovacaoPermissaoOption[] = [
  {
    id: "supplier_portal_access_nfe",
    title: "NF-e",
    description: "Permite acessar NF-e no Portal de Fornecedores.",
  },
  {
    id: "supplier_portal_access_nfse",
    title: "NFS-e",
    description: "Permite acessar NFS-e no Portal de Fornecedores.",
  },
  {
    id: "supplier_portal_access_cte",
    title: "CT-e",
    description: "Permite acessar CT-e no Portal de Fornecedores.",
  },
  {
    id: "supplier_portal_access_cte_os",
    title: "CT-e OS",
    description: "Permite acessar CT-e OS no Portal de Fornecedores.",
  },
];

export const SUPPLIER_PORTAL_ACTIONS_OPTIONS: AprovacaoPermissaoOption[] = [
  {
    id: "supplier_portal_action_approval",
    title: "Permissão de aprovação",
    description: "Define se o usuário pode aprovar notas no Portal de Fornecedores.",
  },
  {
    id: "supplier_portal_action_configuration",
    title: "Permissão de configuração",
    description:
      "Define se o usuário pode acessar as configurações do Portal de Fornecedores.",
  },
];

export type SupplierPortalPermissions = {
  supplier_portal_access: boolean;
  supplier_portal_all_suppliers_selected: boolean;
  supplier_portal_allowed_supplier_cnpjs: string[];
  supplier_portal_access_nfe: boolean;
  supplier_portal_access_nfse: boolean;
  supplier_portal_access_cte: boolean;
  supplier_portal_access_cte_os: boolean;
  supplier_portal_approval_permission: boolean;
  supplier_portal_action_approval: boolean;
  supplier_portal_action_configuration: boolean;
};

export function createSupplierPortalDfeState(): Record<string, boolean> {
  return createCheckboxPermissionState(SUPPLIER_PORTAL_DFE_OPTIONS);
}

export function createSupplierPortalActionsState(): Record<string, boolean> {
  return createCheckboxPermissionState(SUPPLIER_PORTAL_ACTIONS_OPTIONS);
}

export function formatSupplierPortalCnpjs(cnpjs: string[]): string {
  return cnpjs.join("\n");
}

export function countSupplierPortalConfiguredPermissions(input: {
  access: boolean;
  allSuppliersSelected: boolean;
  allowedSupplierCnpjs: string[];
  dfeSelection: Record<string, boolean>;
  actionsSelection: Record<string, boolean>;
}): number {
  let count = 0;
  if (input.access) count += 1;
  if (input.allSuppliersSelected || input.allowedSupplierCnpjs.length > 0) count += 1;
  if (Object.values(input.dfeSelection).some(Boolean)) count += 1;
  if (Object.values(input.actionsSelection).some(Boolean)) count += 1;
  return count;
}

export function createSupplierPortalPermissions(input: {
  access: boolean;
  allSuppliersSelected: boolean;
  allowedSupplierCnpjs: string[];
  dfeSelection: Record<string, boolean>;
  actionsSelection: Record<string, boolean>;
}): SupplierPortalPermissions {
  return {
    supplier_portal_access: input.access,
    supplier_portal_all_suppliers_selected: input.allSuppliersSelected,
    supplier_portal_allowed_supplier_cnpjs: input.allowedSupplierCnpjs,
    supplier_portal_access_nfe: input.dfeSelection.supplier_portal_access_nfe ?? false,
    supplier_portal_access_nfse: input.dfeSelection.supplier_portal_access_nfse ?? false,
    supplier_portal_access_cte: input.dfeSelection.supplier_portal_access_cte ?? false,
    supplier_portal_access_cte_os: input.dfeSelection.supplier_portal_access_cte_os ?? false,
    supplier_portal_approval_permission: Object.values(input.actionsSelection).some(Boolean),
    supplier_portal_action_approval:
      input.actionsSelection.supplier_portal_action_approval ?? false,
    supplier_portal_action_configuration:
      input.actionsSelection.supplier_portal_action_configuration ?? false,
  };
}
