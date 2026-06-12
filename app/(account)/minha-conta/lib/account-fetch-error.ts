export type AccountFetchErrorVariant = "system" | "api";

export class AccountFetchError extends Error {
  readonly variant: AccountFetchErrorVariant;

  constructor(variant: AccountFetchErrorVariant, message: string) {
    super(message);
    this.name = "AccountFetchError";
    this.variant = variant;
  }
}

export function isAccountFetchError(error: unknown): error is AccountFetchError {
  return error instanceof AccountFetchError;
}

export function assertOnline(): void {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new AccountFetchError(
      "system",
      "Sem conexão com a internet. Verifique sua rede e tente novamente."
    );
  }
}

export function toAccountFetchError(error: unknown): AccountFetchError {
  if (isAccountFetchError(error)) return error;
  return new AccountFetchError(
    "system",
    "Ocorreu um erro inesperado. Tente novamente."
  );
}
