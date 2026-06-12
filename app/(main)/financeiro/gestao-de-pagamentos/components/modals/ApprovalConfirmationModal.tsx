"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Row } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { AlertCircle } from "lucide-react";

interface ApprovalConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  selectedRows: Row[];
  onConfirm: () => void;
}

export function ApprovalConfirmationModal({
  open,
  onClose,
  selectedRows,
  onConfirm,
}: ApprovalConfirmationModalProps) {
  
  const totalValue = selectedRows.reduce((sum, row) => sum + (row.valor ?? 0), 0);
  const count = selectedRows.length;

  return (
    <ScrollableModal
      open={open}
      onClose={onClose}
      title="Confirmar aprovação"
      maxWidth="760px"
      showClose={true}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} className="font-bold">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="font-bold">
            Confirmar aprovação
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-sm max-h-[480px]">
        {/* Tabela de contas a aprovar (rolável) */}
        <div className="flex-1 min-h-[160px] rounded-lg border border-border bg-white overflow-auto relative">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-2/5" />
              <col className="w-1/5" />
              <col className="w-1/5" />
              <col className="w-1/5" />
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="h-11 border-b border-border bg-[#F5F5F6]">
                <th className="px-4 py-2 text-[rgba(4,14,35,0.64)] text-left">
                  Fornecedor
                </th>
                <th className="px-4 py-2 text-[rgba(4,14,35,0.64)] text-center">
                  Vencimento
                </th>
                <th className="px-4 py-2 text-[rgba(4,14,35,0.64)] text-center">
                  Status
                </th>
                <th className="px-4 py-2 text-[rgba(4,14,35,0.64)] text-right">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={
                    index !== selectedRows.length - 1
                      ? "border-b border-border"
                      : ""
                  }
                >
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#0d0f1c] font-medium truncate block">
                      {row.fornecedor}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm text-[#5F6572]">
                      {row.vencimento}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm text-[#5F6572]">
                      {row.status || "Aberto"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-semibold text-[#0d0f1c] tabular-nums whitespace-nowrap">
                      {formatCurrency(row.valor ?? 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo do valor total (sempre visível) */}
        <div className="rounded-lg border border-border bg-white">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#0d0f1c]">
                {count === 1 ? "1 pagamento" : `${count} pagamentos`} para
                aprovação
              </span>
              <span className="text-base font-bold text-[#0d0f1c] tabular-nums">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Aviso de que a ação não pode ser desfeita (sempre visível) */}
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <h4 className="text-sm font-semibold text-orange-900">
              Atenção: Esta ação não pode ser desfeita
            </h4>
          </div>
        </div>
      </div>
    </ScrollableModal>
  );
}

