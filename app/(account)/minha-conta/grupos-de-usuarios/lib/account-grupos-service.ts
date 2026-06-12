import {
  assertOnline,
  AccountFetchError,
} from "../../lib/account-fetch-error";
import { mockGruposUsuarios, type UserGroup } from "../../data/mock-grupos-usuarios";

const LOAD_DELAY_MS = 600;
const CREATE_DELAY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function fetchAccountGrupos(): Promise<UserGroup[]> {
  assertOnline();
  await delay(LOAD_DELAY_MS);
  return [...mockGruposUsuarios];
}

export type CreateAccountGrupoInput = {
  nome: string;
  supplierPortalPermissions?: {
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
};

export async function createAccountGrupo(
  input: CreateAccountGrupoInput,
  existingGroupNames: string[]
): Promise<UserGroup> {
  assertOnline();
  await delay(CREATE_DELAY_MS);

  const normalizedName = input.nome.trim().toLowerCase();
  const isDuplicate = existingGroupNames.some(
    (name) => name.trim().toLowerCase() === normalizedName
  );

  if (isDuplicate) {
    throw new AccountFetchError(
      "api",
      "Já existe um grupo com este nome na conta."
    );
  }

  return {
    id: `grupo-${Date.now()}`,
    nome: input.nome.trim(),
    cnpjCount: 0,
    listagensLabel: "Sem listagens de DFes",
    usuarios: [],
  };
}
