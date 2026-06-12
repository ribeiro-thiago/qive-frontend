"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CopyableNumber } from "@/components/ui/copyable-number";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PortalComprovanteStatusTag } from "../components/PortalTags";
import { generateAuthCode } from "@/app/(main)/financeiro/gestao-de-pagamentos/utils/calculations";
import { downloadComprovanteMock } from "./lib/comprovante-actions";
import {
  formatComprovanteCurrency,
  formatContaDestino,
  formatContaOrigem,
  getComprovanteDataLabel,
} from "./lib/comprovante-format";
import type { DocumentoComprovanteStatus, PortalDocumentoRow } from "./types";

const GESTAO_PAGAMENTOS_PATH = "/financeiro/gestao-de-pagamentos";

function ComprovanteField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-sm font-semibold text-[#5B616F]">{label}</Label>
      <div className="text-[#0d0f1c]">{children}</div>
    </div>
  );
}

function ComprovanteSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-[#0d0f1c]">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function GestaoPagamentosLink() {
  const handleClick = () => {
    toast.info("Redirecionamento para Gestão de Pagamentos em breve.", {
      description: GESTAO_PAGAMENTOS_PATH,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-left text-sm font-medium text-[#0C3CF7] hover:underline"
    >
      Ver histórico completo na Gestão de Pagamentos
    </button>
  );
}

function ComprovantesEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md space-y-2">
        <h3 className="text-base font-semibold text-[#0d0f1c]">
          Nenhum comprovante disponível para esta nota.
        </h3>
        <p className="text-sm leading-[1.4] text-[#5B616F]">
          Quando um pagamento for realizado ou agendado, o comprovante aparecerá aqui.
        </p>
      </div>
    </div>
  );
}

type ComprovantesTabProps = {
  documento: PortalDocumentoRow;
};

export function ComprovantesTab({ documento }: ComprovantesTabProps) {
  const comprovante = documento.comprovante ?? null;
  const [authCode, setAuthCode] = React.useState<string>("");

  React.useEffect(() => {
    if (!comprovante) {
      setAuthCode("");
      return;
    }

    setAuthCode(comprovante.codigoAutenticacao ?? generateAuthCode());
  }, [comprovante, documento.id]);

  if (!comprovante) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ComprovantesEmptyState />
        <div className="shrink-0 border-t border-[rgba(4,14,35,0.08)] px-6 py-4">
          <GestaoPagamentosLink />
        </div>
      </div>
    );
  }

  const dataLabel = getComprovanteDataLabel(comprovante.status);
  const canDownload = comprovante.pdfDisponivel;
  const authCodeDisplay = comprovante.codigoAutenticacao ?? authCode;

  const handleDownload = () => {
    downloadComprovanteMock(documento.id, comprovante);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
      <div className="space-y-2">
        {/* Resumo do comprovante */}
        <div className="rounded-lg border border-border bg-white">
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ComprovanteField label="Status">
                <PortalComprovanteStatusTag status={comprovante.status} />
              </ComprovanteField>
              <ComprovanteField label="Valor líquido">
                <span className="text-lg font-semibold tabular-nums">
                  {formatComprovanteCurrency(comprovante.valorLiquido)}
                </span>
              </ComprovanteField>
              <ComprovanteField label={dataLabel}>{comprovante.data}</ComprovanteField>
              <ComprovanteField label="Conta de destino">
                {formatContaDestino(comprovante)}
              </ComprovanteField>
            </div>

            <Button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 font-bold sm:w-auto"
              disabled={!canDownload}
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              Baixar comprovante
            </Button>
          </div>
        </div>

        {/* Dados do pagamento */}
        <ComprovanteSection title="Dados do pagamento">
          <ComprovanteField label={dataLabel}>{comprovante.data}</ComprovanteField>
          <ComprovanteField label="Valor pago">
            {formatComprovanteCurrency(comprovante.valorLiquido)}
          </ComprovanteField>
          <ComprovanteField label="Conta bancária de origem" className="md:col-span-2">
            {formatContaOrigem(comprovante)}
          </ComprovanteField>
          <ComprovanteField label="Pagador">{comprovante.pagador}</ComprovanteField>
          <ComprovanteField label="CNPJ do pagador">{comprovante.cnpjPagador}</ComprovanteField>
        </ComprovanteSection>

        {/* Dados do documento */}
        <ComprovanteSection title="Dados do documento">
          <ComprovanteField label="Favorecido">{comprovante.favorecido}</ComprovanteField>
          <ComprovanteField label="Data de vencimento">{comprovante.dataVencimento}</ComprovanteField>
          <ComprovanteField label="Forma de pagamento">{comprovante.formaPagamento}</ComprovanteField>
          <ComprovanteField label="Código do boleto">
            <div className="break-words">
              <CopyableNumber
                value={comprovante.codigoBoleto}
                ariaLabel="Copiar código do boleto"
              />
            </div>
          </ComprovanteField>
          <ComprovanteField label="Código de autenticação" className="md:col-span-2">
            <div className="break-words">
              {comprovante.status === "Pago" && authCodeDisplay ? (
                <CopyableNumber value={authCodeDisplay} ariaLabel="Copiar código de autenticação" />
              ) : (
                <span className="text-[#90949D]">—</span>
              )}
            </div>
          </ComprovanteField>
        </ComprovanteSection>

        <div className="pt-2">
          <GestaoPagamentosLink />
        </div>
      </div>
    </div>
  );
}
