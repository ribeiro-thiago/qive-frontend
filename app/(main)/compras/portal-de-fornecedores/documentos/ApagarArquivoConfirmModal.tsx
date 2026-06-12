"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ApagarArquivoConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ApagarArquivoConfirmModal({
  open,
  onClose,
  onConfirm,
}: ApagarArquivoConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="z-[80] max-w-md gap-4 rounded-[16px] p-6">
        <div className="space-y-2 pr-6">
          <DialogTitle className="text-lg font-bold text-[#0d0f1c]">
            Quer mesmo apagar este arquivo?
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5B616F]">
            Se confirmar, o documento sairá do histórico de mensagens. Essa ação não pode ser desfeita.
          </DialogDescription>
        </div>
        <DialogFooter className="gap-2 sm:justify-end sm:gap-2">
          <Button type="button" variant="secondary" className="font-bold" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" className="font-bold" onClick={onConfirm}>
            Apagar arquivo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
