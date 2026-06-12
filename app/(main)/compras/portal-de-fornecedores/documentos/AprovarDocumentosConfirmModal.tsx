"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type AprovarDocumentosConfirmModalProps = {
  open: boolean;
  selectedCount: number;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function AprovarDocumentosConfirmModal({
  open,
  selectedCount,
  isLoading = false,
  onClose,
  onConfirm,
}: AprovarDocumentosConfirmModalProps) {
  const isSingle = selectedCount === 1;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isLoading) onClose();
      }}
    >
      <DialogContent className="z-[80] max-w-md gap-4 rounded-[16px] p-6">
        <div className="flex items-start justify-between gap-4 pr-6">
          <div className="space-y-2">
            <DialogTitle className="text-lg font-bold text-[#0d0f1c]">
              {isSingle ? "Deseja aprovar 1 documento?" : `Deseja aprovar ${selectedCount} documentos?`}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5B616F]">
              {isSingle
                ? "Ao confirmar, o documento selecionado será aprovado."
                : "Ao confirmar, os documentos selecionados serão aprovados."}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#5B616F] hover:bg-[#F3F4F6] disabled:pointer-events-none disabled:opacity-50"
              aria-label="Fechar"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>

        <DialogFooter className="gap-2 sm:justify-end sm:gap-2">
          <Button
            type="button"
            variant="secondary"
            className="font-bold"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="font-bold"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Confirmando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
