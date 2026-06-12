"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentoModalTabId } from "./DocumentoModal";
import type { PortalDocumentoRow } from "./types";

const HOVER_ACTION_BUTTON_CLASS =
  "h-8 gap-1.5 px-2.5 text-xs font-semibold text-white hover:bg-white/10 hover:text-white";

function HoverActionDivider() {
  return <span className="mx-0.5 h-5 w-px bg-[rgba(255,255,255,0.16)]" aria-hidden />;
}

type DocumentoTableRowHoverActionsProps = {
  documento: PortalDocumentoRow;
  statusOptions: string[];
  isAlterandoStatus: boolean;
  alterarStatusOpen: boolean;
  onAlterarStatusOpenChange: (open: boolean) => void;
  visualizarTab: DocumentoModalTabId;
  hideVisualizar?: boolean;
  onOpenTab: (tab: DocumentoModalTabId) => void;
  onAprovar: () => void;
  onAlterarStatusSelect: (status: string) => void;
  onBaixar: () => void;
};

export function DocumentoTableRowHoverActions({
  documento,
  statusOptions,
  isAlterandoStatus,
  alterarStatusOpen,
  onAlterarStatusOpenChange,
  visualizarTab,
  hideVisualizar = false,
  onOpenTab,
  onAprovar,
  onAlterarStatusSelect,
  onBaixar,
}: DocumentoTableRowHoverActionsProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-max max-w-[calc(100vw-3rem)] items-center gap-0.5 rounded-xl",
        "border border-[rgba(255,255,255,0.12)] bg-[#040E23] px-2 py-1.5 shadow-[0_8px_24px_rgba(4,14,35,0.24)]",
      )}
      role="toolbar"
      aria-label={`Ações do documento ${documento.nfNumero}`}
    >
      {!hideVisualizar ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={HOVER_ACTION_BUTTON_CLASS}
            onClick={(event) => {
              event.stopPropagation();
              onOpenTab(visualizarTab);
            }}
          >
            <Eye className="h-4 w-4 shrink-0" aria-hidden />
            Visualizar
          </Button>

          <HoverActionDivider />
        </>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={HOVER_ACTION_BUTTON_CLASS}
        onClick={(event) => {
          event.stopPropagation();
          onAprovar();
        }}
      >
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        Aprovar
      </Button>

      <HoverActionDivider />

      <DropdownMenu open={alterarStatusOpen} onOpenChange={onAlterarStatusOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={HOVER_ACTION_BUTTON_CLASS}
            disabled={isAlterandoStatus}
            onClick={(event) => event.stopPropagation()}
          >
            Alterar status
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              disabled={isAlterandoStatus}
              onClick={() => onAlterarStatusSelect(option)}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <HoverActionDivider />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={HOVER_ACTION_BUTTON_CLASS}
        onClick={(event) => {
          event.stopPropagation();
          onBaixar();
        }}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        Baixar
      </Button>
    </div>
  );
}
