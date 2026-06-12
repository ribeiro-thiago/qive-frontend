"use client";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FornecedorRow } from "./types";

const HOVER_ACTION_BUTTON_CLASS =
  "h-8 gap-1.5 px-2.5 text-xs font-semibold text-white hover:bg-white/10 hover:text-white";

type CadastroTableRowHoverActionsProps = {
  fornecedor: FornecedorRow;
  onVisualizar: () => void;
};

export function CadastroTableRowHoverActions({
  fornecedor,
  onVisualizar,
}: CadastroTableRowHoverActionsProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-max max-w-[calc(100vw-3rem)] items-center rounded-xl",
        "border border-[rgba(255,255,255,0.12)] bg-[#040E23] px-2 py-1.5 shadow-[0_8px_24px_rgba(4,14,35,0.24)]",
      )}
      role="toolbar"
      aria-label={`Ações do fornecedor ${fornecedor.razaoSocial}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={HOVER_ACTION_BUTTON_CLASS}
        onClick={(event) => {
          event.stopPropagation();
          onVisualizar();
        }}
      >
        <Eye className="h-4 w-4 shrink-0" aria-hidden />
        Visualizar
      </Button>
    </div>
  );
}
