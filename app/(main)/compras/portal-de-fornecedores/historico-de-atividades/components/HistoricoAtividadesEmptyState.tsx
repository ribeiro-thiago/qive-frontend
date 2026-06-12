"use client";

import { Button } from "@/components/ui/button";

type HistoricoAtividadesEmptyStateProps = {
  hasFilters: boolean;
  onClearFilters?: () => void;
};

export function HistoricoAtividadesEmptyState({
  hasFilters,
  onClearFilters,
}: HistoricoAtividadesEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <h2 className="text-base font-semibold text-[#0d0f1c]">Nenhuma atividade encontrada</h2>
        <p className="mt-2 max-w-md text-sm text-[#5B616F]">
          Tente ajustar os filtros ou buscar por outro termo.
        </p>
        {onClearFilters ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-4 h-9 px-2 font-bold text-[#0C3CF7] hover:bg-transparent hover:text-[#0A33D1]"
            onClick={onClearFilters}
          >
            Limpar filtros
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className="text-base font-semibold text-[#0d0f1c]">Nenhuma atividade registrada</h2>
      <p className="mt-2 max-w-md text-sm text-[#5B616F]">
        As ações realizadas no portal serão exibidas aqui para facilitar auditoria e rastreabilidade.
      </p>
    </div>
  );
}
