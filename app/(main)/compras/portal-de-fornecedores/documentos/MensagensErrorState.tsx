"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type MensagensErrorStateProps = {
  onRetry: () => void;
  isRetrying?: boolean;
};

export function MensagensErrorState({ onRetry, isRetrying = false }: MensagensErrorStateProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="flex max-w-md flex-col items-center justify-center gap-3 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE2E2]"
          aria-hidden
        >
          <AlertTriangle className="h-6 w-6 text-[#DC2626]" />
        </div>
        <h3 className="text-lg font-semibold text-[#0d0f1c]">
          Não foi possível carregar as mensagens
        </h3>
        <p className="text-sm leading-[1.4] text-[#5B616F]">
          Verifique sua conexão e tente novamente.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-1 font-bold"
          disabled={isRetrying}
          onClick={onRetry}
        >
          {isRetrying ? "Tentando novamente..." : "Tentar novamente"}
        </Button>
      </div>
    </div>
  );
}
