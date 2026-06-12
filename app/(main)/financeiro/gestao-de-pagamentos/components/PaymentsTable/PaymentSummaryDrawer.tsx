"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { X, ChevronDown, Trash2, Info, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Row, BankAccount } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface PaymentSummaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRows: Row[];
  bankAccounts: BankAccount[];
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
  onRemoveRow?: (rowId: string) => void;
}

interface GroupedSupplier {
  name: string;
  cnpj: string;
  rows: Row[];
}

function groupByFornecedor(rows: Row[]): GroupedSupplier[] {
  const map = new Map<string, GroupedSupplier>();
  for (const row of rows) {
    const key = row.cnpjFornecedor ?? row.fornecedor ?? "unknown";
    if (!map.has(key)) {
      map.set(key, {
        name: row.fornecedor ?? "Fornecedor",
        cnpj: row.cnpjFornecedor ?? "",
        rows: [],
      });
    }
    map.get(key)!.rows.push(row);
  }
  return Array.from(map.values());
}

function formatCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function PaymentSummaryDrawer({
  open,
  onOpenChange,
  selectedRows,
  bankAccounts,
  paymentState,
  onConfirm,
  onRemoveRow,
}: PaymentSummaryDrawerProps) {
  const { base, fees, total } = paymentState;

  const [mode, setMode] = React.useState<"review" | "loading" | "success">(
    "review"
  );
  const timeoutRef = React.useRef<number | null>(null);

  const [selectedBankId, setSelectedBankId] = React.useState<string | null>(() => {
    const active = bankAccounts.find((b) => b.status === "ativo" || !b.status);
    return active?.id ?? bankAccounts[0]?.id ?? null;
  });

  React.useEffect(() => {
    if (open) {
      // Ao abrir o drawer, sempre volta para o estado inicial de revisão
      setMode("review");
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (open && bankAccounts.length > 0 && !selectedBankId) {
      const active = bankAccounts.find((b) => b.status === "ativo" || !b.status);
      setSelectedBankId(active?.id ?? bankAccounts[0]?.id ?? null);
    }
  }, [open, bankAccounts, selectedBankId]);

  React.useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);
  const groups = React.useMemo(() => groupByFornecedor(selectedRows), [selectedRows]);
  const discounts = 0;

  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [rowToRemove, setRowToRemove] = React.useState<Row | null>(null);

  const handleClose = () => {
    const wasSuccess = mode === "success";
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMode("review");
    onOpenChange(false);
    // Na V1, só iniciamos o processamento real depois que o usuário fechar a tela de sucesso
    if (wasSuccess) {
      onConfirm();
    }
  };

  const title =
    mode === "success"
      ? "Pagamentos sendo processados"
      : `Resumo dos pagamentos (${selectedRows.length})`;

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="flex max-w-[92vw] flex-col p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg font-bold text-[#0d0f1c]">
            {title}
          </SheetTitle>
          <SheetClose asChild>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </SheetClose>
        </SheetHeader>

        {mode === "success" ? (
          <>
            {/* Conteúdo centralizado verticalmente */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E4F6ED]">
                <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
              </div>
              <h2 className="text-lg font-semibold text-[#0d0f1c]">
                Pagamentos sendo processados
              </h2>
              <p className="mt-2 max-w-sm text-sm text-[#5F6572]">
                Após a confirmação do pagamento, as contas estarão disponíveis em{" "}
                <button
                  type="button"
                  className="font-semibold text-[#0C3CF7] underline"
                >
                  Liquidados
                </button>
                .
              </p>
            </div>

            {/* Rodapé fixo: alert + CTA Ok alinhado à direita (sem stroke) */}
            <div className="bg-white px-6 py-4">
              <div className="rounded-xl border border-[#B8DBFF] bg-[#E7F3FF] px-4 py-3 text-left">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-[#0C3CF7]" />
                  <p className="text-sm font-semibold text-[#003F70]">
                    Dica: Utilize o fluxo de aprovação para maior segurança
                  </p>
                </div>
                <p className="mt-2 text-sm text-[#003F70]">
                  Ative o fluxo de aprovação configurando grupos com permissões de aprovador.{" "}
                  <button
                    type="button"
                    className="font-semibold text-[#0C3CF7] underline"
                  >
                    Acessar permissões
                  </button>
                </p>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <Button className="px-6" onClick={handleClose}>
                  Ok
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-border">
                {groups.map((group) => (
                  <div key={group.cnpj} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#0d0f1c]">
                        {group.name}
                      </span>
                      <span className="text-sm text-[#5F6572] tabular-nums">
                        {formatCnpj(group.cnpj)}
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {group.rows.map((row) => {
                        const venc = row.vencimento;
                        const status = row.status ?? "Aberto";
                        const displayIndex =
                          selectedRows.findIndex((r) => r.id === row.id) + 1;

                        return (
                          <div key={row.id} className="flex items-center text-sm">
                            <span className="w-6 shrink-0 text-[#5F6572] tabular-nums">
                              {displayIndex > 0 ? `${displayIndex}.` : "–"}
                            </span>
                            <div className="ml-2 flex flex-1 items-center justify-between gap-6">
                              <span className="font-medium text-[#0d0f1c]">Boleto</span>
                              <span className="text-[#5F6572]">Venc. {venc}</span>
                              <span className="text-[#5F6572]">{status}</span>
                              <span className="whitespace-nowrap font-semibold text-[#0d0f1c] tabular-nums">
                                {formatCurrency(row.valor ?? 0)}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="ml-3 shrink-0 text-[#5F6572] transition-colors hover:text-[#0d0f1c]"
                              aria-label="Remover"
                              onClick={() => {
                                setRowToRemove(row);
                                setRemoveDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé fixo: resumo + banco + ações */}
            <div className="border-t bg-white">
              {/* Resumo de valores */}
              <div className="mx-6 my-4 space-y-2 rounded-lg bg-[#F5F5F6] px-4 py-3">
                <div className="flex items-center justify-between text-xs text-[#5F6572]">
                  <span>Valor</span>
                  <span className="tabular-nums">{formatCurrency(base)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5F6572]">
                  <span>Acréscimos (multas)</span>
                  <span className="tabular-nums">{formatCurrency(fees)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5F6572]">
                  <span>Descontos (abatimentos)</span>
                  <span className="tabular-nums">{formatCurrency(discounts)}</span>
                </div>
                <div className="h-px bg-[#EBECEE]" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-[#0d0f1c]">Total a pagar</span>
                  <span className="font-bold text-[#0d0f1c] tabular-nums">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Conta bancária de origem */}
              <div className="border-t px-6 py-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[#0d0f1c]">
                    Conta bancária de origem
                  </span>
                  <Info className="h-3.5 w-3.5 text-[#5F6572]" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left text-sm transition-colors hover:bg-[#FAFAFF]"
                    >
                      {selectedBank ? (
                        <span className="min-w-0 flex items-center gap-3">
                          <span className="truncate font-medium text-[#0d0f1c]">
                            {selectedBank.nomeBanco}
                          </span>
                          <span className="shrink-0 tabular-nums text-[#5F6572]">
                            Ag. {selectedBank.agencia}
                            {selectedBank.digitoConta
                              ? `-${selectedBank.digitoConta}`
                              : ""}
                          </span>
                          <span className="shrink-0 tabular-nums text-[#5F6572]">
                            Cc. {selectedBank.conta}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#5F6572]">Selecione uma conta</span>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#5F6572]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)]"
                  >
                    {bankAccounts
                      .filter((b) => b.status === "ativo" || !b.status)
                      .map((bank) => (
                        <DropdownMenuItem
                          key={bank.id}
                          onClick={() => setSelectedBankId(bank.id)}
                          className="py-2"
                        >
                          <span className="flex items-center gap-3 text-sm">
                            <span className="font-medium text-[#0d0f1c]">
                              {bank.nomeBanco}
                            </span>
                            <span className="tabular-nums text-[#5F6572]">
                              Ag. {bank.agencia}
                              {bank.digitoConta ? `-${bank.digitoConta}` : ""}
                            </span>
                            <span className="tabular-nums text-[#5F6572]">
                              Cc. {bank.conta}
                            </span>
                          </span>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  disabled={mode === "loading"}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (mode !== "review") return;
                    if (selectedBank) {
                      paymentState.setBank(selectedBank.nomeBanco);
                    }
                    setMode("loading");
                    timeoutRef.current = window.setTimeout(() => {
                      setMode("success");
                      timeoutRef.current = null;
                    }, 3000);
                  }}
                  className="font-bold"
                  disabled={!selectedBank || mode === "loading"}
                >
                  {mode === "loading" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {`Confirmar pagamento (${selectedRows.length})`}
                </Button>
              </div>
            </div>
          </>
        )}
        </SheetContent>
      </Sheet>

      <Dialog open={removeDialogOpen} onOpenChange={(isOpen) => !isOpen && setRemoveDialogOpen(false)}>
        <DialogContent className="rounded-[16px] max-w-[480px] p-0">
          <DialogTitle className="sr-only">Remover da lista de pagamento</DialogTitle>
          <DialogDescription className="sr-only">
            Confirmação para remover um pagamento da lista atual de processamento
          </DialogDescription>

          <div className="flex items-center justify-between px-6 py-6">
            <div className="text-[20px] font-bold">Remover da lista de pagamento</div>
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
                color: "rgba(4, 14, 35, 0.64)",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "20px",
              }}
            >
              Deseja remover o pagamento para{" "}
              <strong className="font-semibold text-[#0d0f1c]">
                {rowToRemove?.fornecedor ?? ""}
              </strong>{" "}
              no valor de{" "}
              <strong className="font-semibold text-[#0d0f1c]">
                {rowToRemove ? formatCurrency(rowToRemove.valor ?? 0) : ""}
              </strong>{" "}
              e vencimento{" "}
              <strong className="font-semibold text-[#0d0f1c]">
                {rowToRemove?.vencimento ?? ""}
              </strong>
              ?
            </p>
          </div>

          <DialogFooter className="px-6 pt-3 pb-6">
            <Button
              variant="ghost"
              onClick={() => setRemoveDialogOpen(false)}
              className="font-bold"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rowToRemove) return;
                onRemoveRow?.(rowToRemove.id);
                setRemoveDialogOpen(false);
                setRowToRemove(null);
              }}
              className="font-bold"
            >
              Sim, remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

