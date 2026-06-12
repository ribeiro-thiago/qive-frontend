"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Row } from "../../types";

interface LaunchConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  selectedRows: Row[];
  fromTab: string;
  toTab: string;
  onConfirm: () => void;
}

export function LaunchConfirmationModal({
  open,
  onClose,
  selectedRows,
  fromTab,
  toTab,
  onConfirm,
}: LaunchConfirmationModalProps) {
  const count = selectedRows.length;
  
  // Função para obter o label da aba
  const getTabLabel = (tabId: string): string => {
    const tabLabels: Record<string, string> = {
      conferir: "Conferir",
      aprovacao: "Aprovar",
      pagar: "Pagar",
      bloqueados: "Bloqueados",
      liquidados: "Liquidados",
      cancelados: "Cancelados",
    };
    return tabLabels[tabId] || tabId;
  };

  const fromLabel = getTabLabel(fromTab);
  const toLabel = getTabLabel(toTab);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-[16px] max-w-[500px] p-0">
        <DialogTitle className="sr-only">Lançar pagamentos</DialogTitle>
        <DialogDescription className="sr-only">
          Confirmação para lançar contas entre abas
        </DialogDescription>
        
        <div className="flex items-center justify-between px-6 py-6">
          <div className="text-[20px] font-bold">Lançar pagamentos</div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>
        
        <div className="px-6 pb-6">
          <p 
            className="text-sm"
            style={{
              color: 'rgba(4, 14, 35, 0.64)',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '20px',
              fontFeatureSettings: "'liga' off, 'clig' off",
            }}
          >
            Você selecionou <strong style={{ fontWeight: 700 }}>{count}</strong>{" "}
            {count === 1 ? "pagamento" : "pagamentos"} para alteração de registro
            de &quot;
            <strong style={{ fontWeight: 700 }}>{fromLabel}</strong>&quot; para
            &quot;<strong style={{ fontWeight: 700 }}>{toLabel}</strong>&quot;.
          </p>
          <p
            className="text-sm mt-4"
            style={{
              color: "rgba(4, 14, 35, 0.64)",
              fontFamily: "Inter",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "20px",
              fontFeatureSettings: "'liga' off, 'clig' off",
            }}
          >
            <strong style={{ fontWeight: 700 }}>Deseja continuar com a ação?</strong>
            <br />
            Após a mudança ela não poderá ser desfeita.
          </p>
        </div>
        
        <DialogFooter className="px-6 pt-3 pb-6">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="font-bold"
          >
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="font-bold">
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
