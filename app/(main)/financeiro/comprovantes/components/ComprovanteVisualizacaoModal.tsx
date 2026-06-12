"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "../../gestao-de-pagamentos/utils/formatters";
import { generateAuthCode } from "../../gestao-de-pagamentos/utils/calculations";
import type { ComprovanteRow } from "../data/mock-comprovantes";

type ComprovanteVisualizacaoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comprovante: ComprovanteRow | null;
};

type ComprovanteDetailExtras = {
  dataVencimento: string;
  codigoBoleto: string;
  numeroBoleto: string;
};

const DETAIL_EXTRAS_BY_ID: Record<string, ComprovanteDetailExtras> = {
  "cmp-1": {
    dataVencimento: "15/10/2025",
    codigoBoleto: "34191.09000 45632.100006 11210.110001 7 0000000072577",
    numeroBoleto: "09111216710000455088",
  },
  "cmp-2": {
    dataVencimento: "06/12/2023",
    codigoBoleto: "03399.00000 45633.900016 11210.112021 1 70000000128900",
    numeroBoleto: "09111216710900455068",
  },
  "cmp-3": {
    dataVencimento: "30/08/2025",
    codigoBoleto: "00190.00009 01234.567890 12345.678901 2 95640000031050",
    numeroBoleto: "09111216710000310155",
  },
  "cmp-4": {
    dataVencimento: "20/09/2025",
    codigoBoleto: "07790.00000 45633.900016 11210.112021 1 70000000452000",
    numeroBoleto: "09111216710000452001",
  },
};

const DEFAULT_EXTRAS: ComprovanteDetailExtras = {
  dataVencimento: "06/12/2023",
  codigoBoleto: "34191.09000 45633.900016 11210.112021 1 70000000077377",
  numeroBoleto: "09111216710000455088",
};

function getDetailExtras(row: ComprovanteRow): ComprovanteDetailExtras {
  return DETAIL_EXTRAS_BY_ID[row.id] ?? DEFAULT_EXTRAS;
}

function formatAuthCodeDisplay(code: string): string {
  const normalized = code.replace(/\D/g, "").slice(0, 12);
  if (normalized.length <= 3) return normalized;
  const parts = [
    normalized.slice(0, 3),
    normalized.slice(3, 6),
    normalized.slice(6, 9),
    normalized.slice(9, 12),
  ].filter(Boolean);
  return parts.join(".");
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <span className="text-sm text-[#5F6572]">{label}</span>
      <span className={cn("text-sm text-[#0d0f1c] break-words", valueClassName)}>{value}</span>
    </div>
  );
}

function SectionDivider() {
  return <div className="h-px bg-[#EBECEE]" />;
}

export function ComprovanteVisualizacaoModal({
  open,
  onOpenChange,
  comprovante,
}: ComprovanteVisualizacaoModalProps) {
  const [authCode, setAuthCode] = React.useState("");

  React.useEffect(() => {
    if (open && comprovante) {
      setAuthCode(generateAuthCode());
    }
  }, [open, comprovante?.id]);

  if (!comprovante) return null;

  const extras = getDetailExtras(comprovante);
  const isAssociado = comprovante.status === "Associado";
  const isAutomatico = comprovante.origem === "Captura automática";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[60] bg-[rgba(4,14,35,0.48)] backdrop-blur-[6px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[70] flex max-h-[min(90vh,820px)] w-[min(100vw-2rem,560px)] max-w-none -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden",
            "rounded-lg border border-border bg-white p-0 shadow-2xl",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <DialogTitle className="sr-only">Comprovante</DialogTitle>

          <div className="flex shrink-0 items-center justify-between px-6 py-5">
            <h2 className="text-xl font-bold text-[#0d0f1c]">Comprovante</h2>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <section className="pb-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-[#0d0f1c]">Dados do pagamento</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 gap-1.5 px-3 font-semibold text-[#5F6572] shadow-none"
                >
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </Button>
              </div>
              <DetailRow label="Data de pagamento" value={comprovante.dataPgto} />
              <DetailRow label="Valor pago" value={formatCurrency(comprovante.valorTotal)} />
              <DetailRow label="Pagador" value={comprovante.nomePagador} />
              <DetailRow label="CNPJ do Pagador" value={comprovante.cnpjPagador} />
            </section>

            <SectionDivider />

            <section className="py-5">
              <h3 className="mb-4 text-base font-bold text-[#0d0f1c]">Dados do documento</h3>
              <DetailRow label="Favorecido" value={comprovante.nomeBeneficiario} />
              <DetailRow label="Data de vencimento" value={extras.dataVencimento} />
              <DetailRow label="Código do boleto" value={extras.codigoBoleto} />
              <DetailRow
                label="Código de autenticação"
                value={formatAuthCodeDisplay(authCode)}
                valueClassName="min-w-0 break-all"
              />
            </section>

            <SectionDivider />

            <section className="pt-5">
              <h3 className="mb-4 text-base font-bold text-[#0d0f1c]">Documentos associados</h3>
              {isAssociado ? (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-[#EBECEE] bg-white px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-[#5F6572]" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm text-[#5F6572]">Boleto</p>
                      <button
                        type="button"
                        className="text-sm font-medium text-[#0C3CF7] underline-offset-2 hover:underline"
                      >
                        Nº {extras.numeroBoleto}
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-[#5F6572]">
                      {isAutomatico ? "Associação automática" : "Associação manual"}
                    </p>
                    <p className="mt-1 inline-flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-700">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                        aria-hidden
                      />
                      Confiança nível alto
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#5F6572]">Nenhum documento associado.</p>
              )}
            </section>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
