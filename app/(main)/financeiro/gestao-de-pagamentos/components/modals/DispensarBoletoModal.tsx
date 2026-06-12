"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AssociatedDoc } from "../../types";

const contentStyle = {
  color: "rgba(4, 14, 35, 0.64)",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
} as const;

interface DispensarBoletoModalProps {
  open: boolean;
  onClose: () => void;
  boleto: AssociatedDoc | null;
  onConfirm: () => void;
}

export function DispensarBoletoModal({
  open,
  onClose,
  boleto,
  onConfirm,
}: DispensarBoletoModalProps) {
  const linha = (boleto?.codigoBarras ?? "").trim() || "—";

  const formatarLinha = (linhaStr: string) => {
    if (linhaStr === "—") return <span>—</span>;
    const partes = linhaStr.split(/\s+/).filter(Boolean);
    if (partes.length <= 1) return <span className="break-all">{linhaStr}</span>;
    const primeiraLinha = partes.slice(0, -1).join(" ");
    const ultimoGrupo = partes[partes.length - 1];
    return (
      <span className="block break-all">
        <span>{primeiraLinha}</span>
        <span className="block">{ultimoGrupo}</span>
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="rounded-[16px] max-w-xl p-0">
        <DialogTitle className="sr-only">Dispensar boleto</DialogTitle>
        <DialogDescription className="sr-only">
          Confirmação para dispensar o boleto e não associá-lo ao pagamento
        </DialogDescription>

        <div className="flex items-center justify-between px-6 py-6">
          <div className="text-[20px] font-bold">Dispensar boleto</div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <p className="text-sm" style={contentStyle}>
            Este boleto não será associado ao pagamento.
          </p>
          <div className="text-sm" style={contentStyle}>
            <div className="flex gap-2 items-start">
              <strong className="font-bold text-[#0d0f1c] shrink-0">Linha digitável:</strong>
              <span className="font-mono text-[13px] break-all min-w-0">{formatarLinha(linha)}</span>
            </div>
          </div>
          <p className="text-sm" style={contentStyle}>
            <span className="font-bold text-[#0d0f1c]">Deseja dispensar este boleto?</span>
            <br />
            Você pode associar outros documentos manualmente
          </p>
        </div>

        <DialogFooter className="px-6 pt-3 pb-6">
          <Button variant="ghost" onClick={onClose} className="font-bold">
            Voltar
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="font-bold">
            Dispensar boleto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
