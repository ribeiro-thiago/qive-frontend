"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { ChevronDown, Info } from "lucide-react";
import { Row } from "../../types";
import { BankIcon } from "../BankIcon";
import { StatusTag } from "../StatusTag";
import { renderBankAccount } from "../../utils/payment-helpers";
import { formatCurrency } from "../../utils/formatters";
import { Barcode } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRows: Row[];
  paymentState: {
    bank: string;
    setBank: (bank: string) => void;
    base: number;
    fees: number;
    total: number;
    processing: boolean;
    processedAll: boolean;
    queue: Row[];
    index: number;
    itemProgress: number;
  };
  onConfirm: () => void;
  onComplete: () => void;
  onContinueInBackground: () => void;
}

const bankOptions = ['Itaú', 'Santander'];

export function PaymentModal({
  open,
  onOpenChange,
  selectedRows,
  paymentState,
  onConfirm,
  onComplete,
  onContinueInBackground,
}: PaymentModalProps) {
  const [bankOpen, setBankOpen] = React.useState(false);
  const { bank, setBank, base, fees, total, processing, processedAll, queue, index, itemProgress } = paymentState;

  const handleClose = () => {
    if (processedAll) return;
    
    // Se está processando, ativa o snackbar antes de fechar
    if (processing) {
      onContinueInBackground();
    }
    
    onOpenChange(false);
  };

  const title = processedAll ? 'Pagamentos concluídos' : processing ? 'Processando pagamento' : 'Confirmar pagamento';
  const showClose = !(processing && !processedAll);
  const preventClose = processedAll;

  const actions = processing && !processedAll ? (
    <Button onClick={() => {
      onContinueInBackground();
      onOpenChange(false);
    }}>
      Continuar pagamentos em segundo plano
    </Button>
  ) : processedAll ? (
    <Button onClick={onComplete}>Concluir</Button>
  ) : (
    <>
      <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
      <Button onClick={onConfirm}>Confirmar pagamento</Button>
    </>
  );

  return (
    <ScrollableModal
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth="760px"
      showClose={showClose}
      preventClose={preventClose}
      actions={actions}
    >
      <div className="grid gap-3 text-sm">
        {processing || processedAll ? (
          <>
            <div className="rounded-lg border border-border bg-white p-4">
              <ul className="divide-y">
                {queue.map((item, idx) => {
                  const isDone = processedAll || idx < index || (idx === index && itemProgress >= 1);
                  const isCurrent = !processedAll && idx === index && itemProgress < 1;
                  const status = isDone ? 'Pago' : isCurrent ? 'Processando' : 'Aguardando';
                  
                  return (
                    <li key={item.id} className="px-3 py-4 first:pt-2 last:pb-2">
                      <div className="grid grid-cols-3 items-center gap-3">
                        <span className="text-sm font-medium text-[#0d0f1c] truncate">{item.fornecedor}</span>
                        <div className="text-center"><StatusTag value={status} /></div>
                        <span className="text-sm font-semibold text-[#0d0f1c] tabular-nums text-right">
                          {formatCurrency(item.valor ?? 0)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {!processedAll && (
              <div className="rounded-lg border border-border bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#0d0f1c]">Progresso</span>
                  <span className="text-xs text-[#5F6572]">
                    {index + 1}/{queue.length}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#EBECEE] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0C3CF7] transition-all duration-300 ease-out"
                    style={{ 
                      width: `${queue.length === 0 ? 0 : ((index + itemProgress) / queue.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Tabela de contas a pagar */}
            <div className="rounded-lg border border-border bg-white overflow-hidden">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-1/3" />
                  <col className="w-1/3" />
                  <col className="w-1/3" />
                </colgroup>
                <thead>
                  <tr className="h-11 border-b border-border bg-[#F5F5F6]">
                    <th className="px-4 py-2 text-[rgba(4,14,35,0.64)] text-left">Fornecedor</th>
                    <th className="px-4 py-2 text-[rgba(4,14,35,0.64)] text-center">Forma de pagamento</th>
                    <th className="px-4 py-2 text-[rgba(4,14,35,0.64)] text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(selectedRows.map(s => s.fornecedor))).map((forn, index) => (
                    <tr key={forn} className={index !== Array.from(new Set(selectedRows.map(s => s.fornecedor))).length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-4">
                        <span className="text-sm text-[#0d0f1c] font-medium truncate">{forn}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Barcode className="h-4 w-4 text-[#5F6572]" aria-hidden />
                          <span className="text-sm text-[#0d0f1c] font-medium">Boleto</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-[#0d0f1c] tabular-nums whitespace-nowrap">
                          {formatCurrency(selectedRows.filter(s => s.fornecedor === forn).reduce((a, s) => a + (s.valor ?? 0), 0))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Banco de origem */}
            <div className="rounded-lg border border-border bg-white">
              <div className="px-4 py-3 border-b flex items-center gap-3">
                <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Banco de origem</h3>
              </div>
              <div className="p-2">
                <div
                  role="button"
                  aria-expanded={bankOpen}
                  onClick={() => setBankOpen(v => !v)}
                  className="w-full flex items-center gap-3 rounded-md hover:bg-[#FAFAFF] px-3 py-3 cursor-pointer"
                >
                  <BankIcon bank={bank} size={22} />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-base text-[#0d0f1c] truncate">{bank}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-md bg-[#F7F8F9] px-2 py-1">
                    <span className="text-[11px] text-[#5F6572]">Agência/Conta</span>
                    <span className="text-sm font-semibold text-[#0d0f1c] truncate">
                      {renderBankAccount(bank)}
                    </span>
                  </div>
                  <ChevronDown className={["h-4 w-4 transition-transform", bankOpen ? "rotate-180" : ""].join(" ")} />
                </div>
                <div className="px-3 pb-3">
                  <div
                    className="flex w-full p-4 flex-row items-center gap-4 rounded-lg"
                    style={{ background: 'var(--Colors-azure-50, #E6F3FD)' }}
                  >
                    <Info className="h-5 w-5 shrink-0" style={{ color: 'var(--Colors-azure-1000, #003F70)' }} aria-hidden />
                    <div style={{
                      color: 'var(--Colors-azure-1000, #003F70)',
                      fontFamily: 'Inter',
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: '20px',
                    }}>
                      O pagamento será efetuado somente mediante saldo suficiente na conta.
                    </div>
                  </div>
                </div>
                {bankOpen && (
                  <div className="px-4 pt-3 pb-1">
                    <ul className="space-y-2">
                      {bankOptions.map(b => (
                        <li key={b}>
                          <button
                            type="button"
                            onClick={() => { setBank(b); setBankOpen(false); }}
                            className="w-full flex items-center gap-3 rounded-md border border-border px-3 py-2 hover:bg-[#FAFAFF]"
                          >
                            <BankIcon bank={b} size={22} />
                            <div className="flex flex-col text-left">
                              <span className="font-medium text-base text-[#0d0f1c]">{b}</span>
                              <span className="text-xs text-[#5F6572]">{renderBankAccount(b)}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo */}
            <div className="rounded-lg border border-border bg-white">
              <div className="px-4 py-3 border-b flex items-center gap-3">
                <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Resumo do pagamento</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#5F6572]">Valor</span>
                  <span className="text-[#0d0f1c]">{formatCurrency(base)}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[#5F6572]">Acréscimos (multas/juros)</span>
                  <span className="text-[#0d0f1c]">{formatCurrency(fees)}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[#5F6572]">Forma de pagamento</span>
                  <span className="text-[#0d0f1c]">Boleto</span>
                </div>
                <div className="h-px my-3 bg-[#EBECEE]" />
                <div className="flex items-center justify-between">
                  <span className="text-[#0d0f1c] font-semibold">Total a pagar</span>
                  <span className="text-[#0d0f1c] font-semibold">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollableModal>
  );
}
