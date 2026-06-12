"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { AssociatedDoc, Row } from "../../types";
import { getSupplier } from "@/lib/suppliers";
import { generateAuthCode } from "../../utils/calculations";
import { formatCurrency } from "../../utils/formatters";
import { bankAccounts } from "../../utils/payment-helpers";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComprovanteModalProps {
  open: boolean;
  onClose: () => void;
  doc: AssociatedDoc | null;
  currentRow?: Row | null;
}

function SectionDivider() {
  return <div className="my-8 h-px bg-[#EBECEE]" />;
}

function ComprovanteFieldRow({
  label,
  value,
  valueClassName,
  clampLines = true,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  clampLines?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-10 py-3.5">
      <span className="shrink-0 text-base font-semibold text-[#273042]">{label}</span>
      <div
        className={cn(
          "min-w-0 max-w-[68%] text-right text-base text-[#5E6572] break-words [overflow-wrap:anywhere]",
          clampLines && "line-clamp-2",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  );
}

function QiveWatermark() {
  return (
    <svg className="h-[88px] w-[88px] shrink-0" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M38.4924 12.006C37.5251 9.57916 36.1399 7.46374 34.3387 5.66196C32.5366 3.86018 30.4215 2.46635 27.9944 1.47937C25.5664 0.493492 22.9108 0 20.0285 0C17.1072 0 14.424 0.493492 11.9773 1.47937C9.53067 2.46635 7.4156 3.86018 5.63302 5.66196C3.84963 7.46374 2.46535 9.57916 1.47938 12.006C0.492603 14.434 0 17.1076 0 20.0291C0 22.9121 0.492603 25.5759 1.47938 28.0225C2.46535 30.4691 3.84963 32.5944 5.63302 34.3951C7.4156 36.1979 9.53067 37.5819 11.9773 38.5491C14.424 39.5164 17.1072 40 20.0285 40C22.462 40 24.7332 39.6535 26.8429 38.9648L22.9494 32.4814C22.0243 32.6755 21.0509 32.7742 20.0285 32.7742C17.6388 32.7742 15.5051 32.2435 13.6274 31.1808C11.7496 30.1193 10.2703 28.63 9.18925 26.7142C8.10818 24.7995 7.56757 22.57 7.56757 20.0291C7.56757 17.4881 8.10818 15.2587 9.18925 13.3428C10.2703 11.4281 11.7496 9.92899 13.6274 8.8477C15.5051 7.76641 17.6388 7.22577 20.0285 7.22577C22.4183 7.22577 24.5423 7.76641 26.4012 8.8477C28.2592 9.92899 29.7201 11.4182 30.7825 13.3143C31.8439 15.2115 32.3757 17.4498 32.3757 20.0291C32.3757 22.5316 31.8439 24.7512 30.7825 26.6857C30.4065 27.37 29.978 27.9973 29.5023 28.573L33.467 35.2066C33.7644 34.9456 34.0567 34.678 34.3387 34.3951C36.1399 32.5944 37.5251 30.4691 38.4924 28.0225C39.4596 25.5759 39.9432 22.9121 39.9432 20.0291C39.9432 17.1076 39.4596 14.434 38.4924 12.006Z"
        fill="#B6B9BF"
      />
      <path d="M31.5819 39.375L20.0312 20.1432H28.9566L40.4503 39.375H31.5819Z" fill="#273042" />
    </svg>
  );
}

function QiveFooterLogo() {
  return (
    <svg className="h-7 w-auto shrink-0" viewBox="0 0 113 40" fill="none" aria-hidden>
      <path d="M52.0063 39.375H44.6094V11.5517H52.0063V39.375Z" fill="#100F0D" />
      <path
        d="M76.5497 11.5517L70.412 30.2148L63.9749 11.5517H56.1797L66.9338 39.375H74.046L84.1741 11.5517H76.5497Z"
        fill="#100F0D"
      />
      <path
        d="M38.4924 12.006C37.5251 9.57916 36.1399 7.46374 34.3387 5.66196C32.5366 3.86018 30.4215 2.46635 27.9944 1.47937C25.5664 0.493492 22.9108 0 20.0285 0C17.1072 0 14.424 0.493492 11.9773 1.47937C9.53067 2.46635 7.4156 3.86018 5.63302 5.66196C3.84963 7.46374 2.46535 9.57916 1.47938 12.006C0.492603 14.434 0 17.1076 0 20.0291C0 22.9121 0.492603 25.5759 1.47938 28.0225C2.46535 30.4691 3.84963 32.5944 5.63302 34.3951C7.4156 36.1979 9.53067 37.5819 11.9773 38.5491C14.424 39.5164 17.1072 40 20.0285 40C22.462 40 24.7332 39.6535 26.8429 38.9648L22.9494 32.4814C22.0243 32.6755 21.0509 32.7742 20.0285 32.7742C17.6388 32.7742 15.5051 32.2435 13.6274 31.1808C11.7496 30.1193 10.2703 28.63 9.18925 26.7142C8.10818 24.7995 7.56757 22.57 7.56757 20.0291C7.56757 17.4881 8.10818 15.2587 9.18925 13.3428C10.2703 11.4281 11.7496 9.92899 13.6274 8.8477C15.5051 7.76641 17.6388 7.22577 20.0285 7.22577C22.4183 7.22577 24.5423 7.76641 26.4012 8.8477C28.2592 9.92899 29.7201 11.4182 30.7825 13.3143C31.8439 15.2115 32.3757 17.4498 32.3757 20.0291C32.3757 22.5316 31.8439 24.7512 30.7825 26.6857C30.4065 27.37 29.978 27.9973 29.5023 28.573L33.467 35.2066C33.7644 34.9456 34.0567 34.678 34.3387 34.3951C36.1399 32.5944 37.5251 30.4691 38.4924 28.0225C39.4596 25.5759 39.9432 22.9121 39.9432 20.0291C39.9432 17.1076 39.4596 14.434 38.4924 12.006Z"
        fill="#100F0D"
      />
      <path d="M31.5819 39.375L20.0312 20.1432H28.9566L40.4503 39.375H31.5819Z" fill="#EF3923" />
      <path
        d="M93.2149 18.6651C94.4468 17.376 96.1073 16.7304 98.1941 16.7304C100.545 16.7304 102.28 17.48 103.4 18.9781C104.057 19.8574 104.519 20.8922 104.79 22.0783H91.5167C91.7671 20.7274 92.3319 19.5887 93.2149 18.6651ZM105.58 30.2473C104.847 31.2707 103.997 32.1325 103.03 32.8327C101.93 33.6296 100.412 34.0281 98.4778 34.0281C96.2391 34.0281 94.4952 33.3835 93.2431 32.0934C92.1553 30.9722 91.5404 29.4926 91.3989 27.6547H111.849C111.924 27.3901 111.972 27.0575 111.991 26.6591C112.01 26.2606 112.02 25.8539 112.02 25.4359C112.02 22.6291 111.451 20.1354 110.313 17.9536C109.174 15.7729 107.572 14.0555 105.505 12.8045C103.437 11.5525 101 10.9265 98.1941 10.9265C95.4247 10.9265 93.0058 11.5432 90.9394 12.7757C88.8712 14.0091 87.2592 15.7163 86.1026 17.897C84.9451 20.0788 84.3672 22.6106 84.3672 25.4925C84.3672 28.4146 84.9451 30.9547 86.1026 33.1169C87.2592 35.2791 88.8712 36.9584 90.9394 38.1527C93.0058 39.3481 95.4247 39.9453 98.1941 39.9453C101.228 39.9453 103.817 39.3286 105.96 38.0961C107.953 36.9491 109.562 35.3347 110.784 33.2517L105.58 30.2473Z"
        fill="#100F0D"
      />
    </svg>
  );
}

function maskConta(conta: string): string {
  const [prefix, suffix] = conta.split("-");
  if (!suffix) return `***${conta.slice(-4)}`;
  return `***${prefix.slice(-2)}-${suffix}`;
}

function formatContaBancariaOrigem(banco?: string): string {
  if (!banco) return "—";
  const bankLabel = banco.includes(" - ") ? banco.split(" - ").slice(1).join(" - ") : banco;

  for (const [key, acc] of Object.entries(bankAccounts)) {
    if (bankLabel.toLowerCase().includes(key.toLowerCase())) {
      return `${key} • Ag. ${acc.agencia} • Cc. ${maskConta(acc.conta)}`;
    }
  }

  return `${bankLabel} • Ag. 1234 • Cc. ***54-3`;
}

function getEmissor(boleto?: AssociatedDoc): string {
  if (boleto?.banco) {
    const name = boleto.banco.includes(" - ") ? boleto.banco.split(" - ")[1] : boleto.banco;
    const lower = name.toLowerCase();
    if (lower.includes("santander")) return "BANCO SANTANDER (BRASIL) S.A.";
    if (lower.includes("itau") || lower.includes("itaú")) return "ITAÚ UNIBANCO S.A.";
    if (lower.includes("brasil")) return "BANCO DO BRASIL S.A.";
    if (lower.includes("bradesco")) return "BANCO BRADESCO S.A.";
    if (lower.includes("caixa")) return "CAIXA ECONÔMICA FEDERAL";
    return name.toUpperCase();
  }
  return "—";
}

function splitCodigoBoleto(codigo?: string): { line1: string; line2: string } {
  if (!codigo) return { line1: "—", line2: "" };
  const parts = codigo.trim().split(/\s+/);
  if (parts.length <= 1) return { line1: codigo, line2: "" };
  const mid = Math.ceil(parts.length / 2);
  return {
    line1: parts.slice(0, mid).join(" "),
    line2: parts.slice(mid).join(" "),
  };
}

export function ComprovanteModal({ open, onClose, doc, currentRow }: ComprovanteModalProps) {
  const [authCode, setAuthCode] = React.useState<string>("");

  React.useEffect(() => {
    if (open) setAuthCode(generateAuthCode());
  }, [open]);

  if (!open || !doc) return null;

  const boletoDoc = (currentRow?.documentosAssociados || []).find((x) => x.tipo === "Boleto");
  const favorecido =
    getSupplier(currentRow?.cnpjFornecedor || "")?.pagamentoPreferencial?.favorecido ||
    currentRow?.pagamentoPreferencial?.favorecido ||
    currentRow?.fornecedor ||
    "—";
  const formaPagamento =
    boletoDoc != null
      ? "Boleto"
      : currentRow?.pagamentoPreferencial?.tipo || currentRow?.formaPagamento?.tipo || "Boleto";
  const codigoBoleto = splitCodigoBoleto(boletoDoc?.codigoBarras);

  const handleDownload = () => {
    try {
      const lines = [
        "COMPROVANTE DE PAGAMENTO",
        `Fornecedor: ${currentRow?.fornecedor || ""}`,
        `Título: #${currentRow?.id || ""}`,
        `Banco: ${doc.banco || ""}`,
        `Data: ${doc.data || ""}`,
        `Valor: ${doc.valor != null ? formatCurrency(doc.valor) : ""}`,
        `Pagador: ${doc.pagador || ""}`,
        `CNPJ Pagador: ${doc.cnpjPagador || ""}`,
      ];
      const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprovante-${currentRow?.id || "pagamento"}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <ScrollableModal
      open={open}
      onClose={onClose}
      title={<span className="sr-only">Comprovante de pagamento</span>}
      maxWidth="780px"
      showClose={true}
      actions={
        <Button onClick={handleDownload} className="inline-flex items-center gap-2 font-bold">
          <Download className="h-4 w-4" aria-hidden />
          Baixar PDF
        </Button>
      }
    >
      <div className="mx-auto flex min-h-[760px] w-full flex-col bg-white px-1 py-4 sm:px-2">
        <div className="flex items-start justify-between gap-6">
          <h1 className="text-[2rem] font-bold leading-[1.15] tracking-tight text-[#273042]">
            Comprovante
            <br />
            de pagamento
          </h1>
          <QiveWatermark />
        </div>

        <section className="mt-10">
          <h2 className="mb-2 text-lg font-bold text-[#273042]">Dados do pagamento</h2>
          <ComprovanteFieldRow label="Data de pagamento" value={doc.data || "—"} />
          <ComprovanteFieldRow
            label="Valor pago"
            value={doc.valor != null ? formatCurrency(doc.valor) : "—"}
          />
          <ComprovanteFieldRow
            label="Conta bancária de origem"
            value={formatContaBancariaOrigem(doc.banco)}
          />
          <ComprovanteFieldRow label="Pagador" value={doc.pagador || "—"} />
          <ComprovanteFieldRow label="CNPJ do pagador" value={doc.cnpjPagador || "—"} />
        </section>

        <SectionDivider />

        <section>
          <h2 className="mb-2 text-lg font-bold text-[#273042]">Dados do documento</h2>
          <ComprovanteFieldRow label="Favorecido" value={favorecido} />
          <ComprovanteFieldRow label="Data de vencimento" value={currentRow?.vencimento || "—"} />
          <ComprovanteFieldRow label="Forma de pagamento" value={formaPagamento} />
          <ComprovanteFieldRow label="Emissor" value={getEmissor(boletoDoc)} />
          <ComprovanteFieldRow
            label="Código do boleto"
            clampLines={false}
            value={
              <div>
                <div>{codigoBoleto.line1}</div>
                {codigoBoleto.line2 ? <div className="mt-1">{codigoBoleto.line2}</div> : null}
              </div>
            }
          />
        </section>

        <SectionDivider />

        <ComprovanteFieldRow
          label="Código de autenticação"
          value={authCode || "—"}
        />

        <SectionDivider />

        <footer className="mt-auto flex items-start gap-4 pb-2 pt-2">
          <QiveFooterLogo />
          <p className="text-sm leading-relaxed text-[#90949D]">
            Organize boletos, notas fiscais e comprovantes em um só lugar com a Qive. Simplifique sua
            gestão financeira! Acesse www.qive.com.br e teste grátis!
          </p>
        </footer>
      </div>
    </ScrollableModal>
  );
}
