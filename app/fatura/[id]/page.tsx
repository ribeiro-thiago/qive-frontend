"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  EMPRESA_PAGAMENTO,
  formatFaturaCurrency,
  getFaturaById,
  getFaturaFallback,
} from "@/app/(account)/minha-conta/data/mock-faturas";

function QiveLogo() {
  return (
    <Link href="/minha-conta" className="vindi-logo-link" aria-label="Voltar para Minha conta">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/fatura/qive-logo.svg"
        alt="Qive"
        className="vindi-logo"
        width={113}
        height={40}
      />
    </Link>
  );
}

function ChevronIcon({ up }: { up?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      {up ? (
        <path d="M2 8 L6 4 L10 8" stroke="#888" strokeWidth="1.5" fill="none" />
      ) : (
        <path d="M2 4 L6 8 L10 4" stroke="#888" strokeWidth="1.5" fill="none" />
      )}
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <ellipse cx="8" cy="8" rx="6" ry="4" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="5" y="5" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M4 11H3.5C2.67 11 2 10.33 2 9.5V3.5C2 2.67 2.67 2 3.5 2H9.5C10.33 2 11 2.67 11 3.5V4" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function VindiAccordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="vindi-accordion">
      <button
        type="button"
        className={`vindi-accordion-header${open ? "" : " is-closed"}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronIcon up={open} />
      </button>
      {open && children ? <div className="vindi-accordion-body">{children}</div> : null}
    </div>
  );
}

function BoletoView({
  faturaId,
  codigoBoleto,
  valor,
}: {
  faturaId: string;
  codigoBoleto: string;
  valor: number;
}) {
  return (
    <div className="vindi-boleto-page">
      <Link href={`/fatura/${faturaId}`} className="vindi-back-link">
        ← Voltar para pagamento
      </Link>
      <div className="vindi-boleto-card">
        <h1 className="vindi-boleto-title">Boleto bancário</h1>
        <p className="vindi-boleto-code">{codigoBoleto}</p>
        <p>Valor: {formatFaturaCurrency(valor)}</p>
        <div className="vindi-barcode" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function FaturaPagamentoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const faturaId = params.id;
  const fatura = getFaturaById(faturaId) ?? getFaturaFallback(faturaId);
  const viewBoleto = searchParams.get("view") === "boleto";

  const [boletoOpen, setBoletoOpen] = React.useState(true);
  const [cartaoOpen, setCartaoOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopiarCodigoBoleto = async () => {
    const codigo = fatura.codigoBoleto.replace(/\s+/g, "");

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(codigo);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = codigo;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (viewBoleto) {
    return (
      <BoletoView
        faturaId={fatura.id}
        codigoBoleto={fatura.codigoBoleto}
        valor={fatura.valor}
      />
    );
  }

  return (
    <div className="vindi-page">
      <header className="vindi-header">
        <QiveLogo />
        <div className="vindi-company">
          <strong>{EMPRESA_PAGAMENTO.nome}</strong>
          <div>CNPJ {EMPRESA_PAGAMENTO.cnpj}</div>
          {EMPRESA_PAGAMENTO.enderecoLinhas.map((linha) => (
            <div key={linha}>{linha}</div>
          ))}
          <div className="vindi-company-contact">{EMPRESA_PAGAMENTO.telefone}</div>
          <div>{EMPRESA_PAGAMENTO.email}</div>
        </div>
      </header>

      <div className="vindi-content">
        <section className="vindi-invoice">
          <div className="vindi-invoice-title">
            Fatura #{fatura.numero} ({fatura.dataEmissao})
          </div>

          <div className="vindi-table-head">
            <span>Descrição</span>
            <span>Valor</span>
          </div>

          <div className="vindi-table-row">
            <span className="vindi-item">
              <span className="vindi-item-icon">+</span>
              <span>{fatura.descricao}</span>
            </span>
            <span>{formatFaturaCurrency(fatura.valor)}</span>
          </div>

          <div className="vindi-table-subtotal">
            <span>Subtotal</span>
            <span>{formatFaturaCurrency(fatura.valor)}</span>
          </div>

          <div className="vindi-table-total">
            <span>Total a pagar</span>
            <span>{formatFaturaCurrency(fatura.valor)}</span>
          </div>
        </section>

        <aside>
          <h2 className="vindi-payment-title">Escolha uma forma de pagamento</h2>

          <VindiAccordion
            title="Boleto bancário online"
            open={boletoOpen}
            onToggle={() => setBoletoOpen((current) => !current)}
          >
            <p className="vindi-accordion-text">
              Para pagar, imprima ou escaneie o código de barras ao clicar em &quot;Visualizar
              boleto&quot;. Você pode também, copiar o código do boleto e colar no aplicativo da
              sua instituição financeira.
            </p>

            <p className="vindi-due-label">Vencimento</p>
            <p className="vindi-due-value">
              <s>{fatura.vencimentoBoletoInicio}</s> {"->"} {fatura.vencimentoBoletoFim}
            </p>

            <Link href={`/fatura/${fatura.id}?view=boleto`} className="vindi-btn vindi-btn-primary">
              Visualizar boleto
              <EyeIcon />
            </Link>

            <button
              type="button"
              className="vindi-btn vindi-btn-secondary"
              onClick={handleCopiarCodigoBoleto}
            >
              Copiar código do boleto
              <CopyIcon />
            </button>

            <p className="vindi-copy-feedback">{copied ? "Código copiado!" : ""}</p>
          </VindiAccordion>

          <VindiAccordion
            title="Cartão de crédito"
            open={cartaoOpen}
            onToggle={() => setCartaoOpen((current) => !current)}
          />
        </aside>
      </div>

      <footer className="vindi-footer">
        Esta página foi gerada pela plataforma de pagamentos Vindi.
      </footer>
    </div>
  );
}
