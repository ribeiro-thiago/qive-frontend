"use client";

import type { AccountFetchErrorVariant } from "../lib/account-fetch-error";

type ListFetchErrorStateProps = {
  variant: AccountFetchErrorVariant;
  resourceLabel: string;
  onRetry: () => void;
};

export function ListFetchErrorState({
  variant,
  resourceLabel,
  onRetry,
}: ListFetchErrorStateProps) {
  const message =
    variant === "system"
      ? `Não foi possível carregar ${resourceLabel}. Verifique sua conexão e tente novamente.`
      : `Não foi possível carregar ${resourceLabel}. O serviço pode estar indisponível — tente novamente em instantes.`;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="max-w-md text-sm text-[#5F6572]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 text-sm font-semibold text-[#0C3CF7] hover:underline"
      >
        Tentar novamente
      </button>
    </div>
  );
}
