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

interface ReplaceBoletoModalProps {
  open: boolean;
  onClose: () => void;
  boletoAtual: AssociatedDoc | null;
  novoBoleto: AssociatedDoc | null;
  onConfirm: () => void;
}

export function ReplaceBoletoModal({
  open,
  onClose,
  boletoAtual,
  novoBoleto,
  onConfirm,
}: ReplaceBoletoModalProps) {
  const linhaAtual = (boletoAtual?.codigoBarras ?? "").trim() || "—";
  const linhaNova = (novoBoleto?.codigoBarras ?? "").trim() || "—";

  const formatarLinha = (linha: string) => {
    if (linha === "—") return <span>—</span>;
    const partes = linha.split(/\s+/).filter(Boolean);
    if (partes.length <= 1) return <span className="break-all">{linha}</span>;
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
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-[16px] max-w-xl p-0">
        <DialogTitle className="sr-only">Substituir boleto associado</DialogTitle>
        <DialogDescription className="sr-only">
          Confirmação para substituir o boleto associado ao pagamento
        </DialogDescription>

        <div className="flex items-center justify-between px-6 py-6">
          <div className="text-[20px] font-bold">Substituir boleto associado</div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <p className="text-sm" style={contentStyle}>
            Este pagamento já possui um documento associado.
            <br />
            O novo boleto substituirá a associação e a linha digitável para o pagamento.
          </p>
          <div className="text-sm space-y-6" style={contentStyle}>
            <div className="flex gap-2 items-start">
              <strong className="font-bold text-[#0d0f1c] shrink-0">Boleto atual:</strong>
              <span className="font-mono text-[13px] break-all min-w-0">{formatarLinha(linhaAtual)}</span>
            </div>
            <div className="flex gap-2 items-start">
              <strong className="font-bold text-[#0d0f1c] shrink-0">Novo boleto:</strong>
              <span className="font-mono text-[13px] break-all min-w-0">{formatarLinha(linhaNova)}</span>
            </div>
          </div>
          <p className="text-sm" style={contentStyle}>
            <span className="font-bold text-[#0d0f1c]">Deseja substituir o boleto atual pelo novo?</span>
            <br />
            A linha digitável usada para pagamento será alterada.
          </p>
        </div>

        <DialogFooter className="px-6 pt-3 pb-6">
          <Button variant="ghost" onClick={onClose} className="font-bold">
            Voltar e revisar
          </Button>
          <Button onClick={onConfirm} className="font-bold">
            Confirmar boleto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
