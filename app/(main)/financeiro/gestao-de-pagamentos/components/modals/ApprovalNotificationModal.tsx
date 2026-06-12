"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Row } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface ApprovalNotificationModalProps {
  open: boolean;
  onClose: () => void;
  approvalItems: Row[];
  regularItems: Row[];
}

export function ApprovalNotificationModal({
  open,
  onClose,
  approvalItems,
  regularItems,
}: ApprovalNotificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-[16px] max-w-[640px] p-0">
        <DialogTitle className="sr-only">Aviso sobre os pagamentos enviados</DialogTitle>
        <DialogDescription className="sr-only">
          Informações sobre o status dos pagamentos enviados, incluindo os que precisam de aprovação e os prontos para pagamento
        </DialogDescription>
        
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="text-[20px] font-bold text-[#0d0f1c]">Aviso sobre os pagamentos enviados</div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Bloco 1 – Aprovação */}
          {approvalItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="text-base font-bold text-[#0d0f1c]">
                  {approvalItems.length === 1 
                    ? "1 pagamento precisa de aprovação"
                    : `${approvalItems.length} pagamentos precisam de aprovação`
                  }
                </h3>
              </div>
              
              <p className="text-sm text-[#5F6572] pl-8">
                Pagamentos acima de <strong className="text-[#0d0f1c]">R$ 5.000,00</strong> entram no fluxo de aprovação antes do pagamento.
              </p>

              <div className="space-y-3 pl-8 pt-1">
                {approvalItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 bg-orange-50/40 rounded-lg border border-orange-100"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[15px] text-[#0d0f1c] mb-1">
                          {item.fornecedor}
                        </div>
                        <div className="text-xs text-[#5F6572]">
                          CNPJ {item.cnpjFornecedor}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-[#0d0f1c] mb-0.5">
                          {formatCurrency(item.valor)}
                        </div>
                        <div className="text-xs text-[#5F6572]">
                          Vencimento: {item.vencimento}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bloco 2 – Prontos para pagar */}
          {regularItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-[#0d0f1c]">
                  {regularItems.length === 1 
                    ? "1 pagamento pronto para pagamento"
                    : `${regularItems.length} pagamentos prontos para pagamento`
                  }
                </h3>
              </div>
              
              <p className="text-sm text-[#5F6572] pl-8">
                {regularItems.length === 1 ? "Já está" : "Os demais já estão"} na aba &quot;Pagar&quot; e {regularItems.length === 1 ? "pode ser processado" : "podem ser processados"} normalmente.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pt-4 pb-6">
          <Button onClick={onClose} className="font-bold min-w-[120px]">
            OK, entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

