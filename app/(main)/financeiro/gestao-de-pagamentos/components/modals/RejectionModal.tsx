"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Row } from "../../types";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type RejectionAction = 'reject' | 'reject-block' | 'reject-cancel';

interface RejectionModalProps {
  open: boolean;
  onClose: () => void;
  selectedRows: Row[];
  onConfirm: (action: RejectionAction) => void;
}

export function RejectionModal({ open, onClose, selectedRows, onConfirm }: RejectionModalProps) {
  const [action, setAction] = React.useState<RejectionAction>('reject');

  React.useEffect(() => {
    if (open) {
      setAction('reject');
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(action);
    setAction('reject');
  };

  const actionOptions = [
    {
      id: 'reject' as RejectionAction,
      label: 'Somente reprovar',
      description: 'O pagamento será reprovado e poderá ser reavaliado posteriormente'
    },
    {
      id: 'reject-block' as RejectionAction,
      label: 'Reprovar e bloquear',
      description: 'O pagamento será reprovado e movido para a aba de bloqueados'
    },
    {
      id: 'reject-cancel' as RejectionAction,
      label: 'Reprovar e cancelar',
      description: 'O pagamento será reprovado e cancelado definitivamente'
    }
  ];

  return (
    <ScrollableModal
      open={open}
      onClose={onClose}
      title="Reprovar pagamentos"
      maxWidth="760px"
      showClose={true}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} className="font-bold">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant="destructive"
            className="font-bold"
          >
            Confirmar reprovação
          </Button>
        </>
      }
    >
      <div className="grid gap-3 text-sm">
        {/* Opções de ação */}
        <div className="rounded-lg border border-border bg-white p-4">
          <Label className="mb-3 block text-sm font-semibold text-[#0d0f1c]">
            Selecione a ação de reprovação
          </Label>
          <div className="space-y-3">
            {actionOptions.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  action === option.id
                    ? "border-[#0C3CF7] bg-blue-50"
                    : "border-border bg-white hover:border-gray-300"
                )}
              >
                <input
                  type="radio"
                  name="rejection-action"
                  value={option.id}
                  checked={action === option.id}
                  onChange={(e) => setAction(e.target.value as RejectionAction)}
                  className="mt-0.5 h-4 w-4 text-[#0C3CF7] focus:ring-[#0C3CF7]"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#0d0f1c] mb-0.5">
                    {option.label}
                  </div>
                  <div className="text-xs text-[#5F6572]">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Aviso de que a ação não pode ser desfeita */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <h4 className="text-sm font-semibold text-red-900">
              Atenção: Esta ação não pode ser desfeita
            </h4>
          </div>
        </div>
      </div>
    </ScrollableModal>
  );
}

