import {
  assertOnline,
  AccountFetchError,
} from "../../lib/account-fetch-error";
import { mockUsuarios, TOTAL_USUARIOS, type AccountUser } from "../../data/mock-usuarios";

const LOAD_DELAY_MS = 800;
const CREATE_DELAY_MS = 600;
const UPDATE_DELAY_MS = 600;
const TOGGLE_ATIVO_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export type AccountUsuariosListResult = {
  users: AccountUser[];
  total: number;
};

export async function fetchAccountUsuarios(): Promise<AccountUsuariosListResult> {
  assertOnline();
  await delay(LOAD_DELAY_MS);
  return {
    users: [...mockUsuarios],
    total: TOTAL_USUARIOS,
  };
}

export type CreateAccountUsuarioInput = {
  nome: string;
  email: string;
  grupoUsuarios: string;
};

export async function createAccountUsuario(
  input: CreateAccountUsuarioInput,
  existingEmails: string[]
): Promise<AccountUser> {
  assertOnline();
  await delay(CREATE_DELAY_MS);

  const normalizedEmail = input.email.trim().toLowerCase();
  const isDuplicate = existingEmails.some(
    (email) => email.trim().toLowerCase() === normalizedEmail
  );

  if (isDuplicate) {
    throw new AccountFetchError(
      "api",
      "Este email já está cadastrado na conta."
    );
  }

  return {
    id: `user-${Date.now()}`,
    nome: input.nome.trim(),
    email: input.email.trim(),
    grupoUsuarios: input.grupoUsuarios,
    area: "-",
    cargo: "-",
    telefone: "-",
    ativo: true,
  };
}

export type UpdateAccountUsuarioInput = {
  nome: string;
  grupoUsuarios: string;
};

export async function updateAccountUsuario(
  user: AccountUser,
  input: UpdateAccountUsuarioInput
): Promise<AccountUser> {
  assertOnline();
  await delay(UPDATE_DELAY_MS);

  return {
    ...user,
    nome: input.nome.trim(),
    grupoUsuarios: input.grupoUsuarios,
  };
}

export async function setAccountUsuarioAtivo(
  user: AccountUser,
  ativo: boolean
): Promise<AccountUser> {
  assertOnline();
  await delay(TOGGLE_ATIVO_DELAY_MS);

  return {
    ...user,
    ativo,
  };
}
