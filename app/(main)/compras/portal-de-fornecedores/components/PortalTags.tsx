"use client";

import * as React from "react";
import { Tag } from "@/components/ui/tag";
import type {
  AcessoFornecedorStatus,
  AcessoPortal,
  FornecedorAcessoPortal,
  PagamentoStatus,
  Recorrencia,
  SituacaoCadastral,
} from "../cadastro/types";
import {
  DOCUMENTO_SITUACAO_DFE_LABELS,
} from "../documentos/lib/documento-situacao-dfe";
import type {
  DocumentoComprovanteStatus,
  DocumentoOrigemTipo,
  DocumentoOrigemVinculo,
  DocumentoSituacaoDfe,
} from "../documentos/types";

type TagColorClasses = {
  bg: string;
  text: string;
  border: string;
};

export type PortalCadastroTagVariant = "success" | "danger" | "warning" | "neutral" | "muted";

const CADASTRO_VARIANT_COLORS: Record<PortalCadastroTagVariant, TagColorClasses> = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  danger: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  warning: {
    bg: "bg-[#FFF7ED]",
    text: "text-[#C2410C]",
    border: "border-[#FED7AA]",
  },
  neutral: {
    bg: "bg-[#F3F4F6]",
    text: "text-[#5B616F]",
    border: "border-[#E5E7EB]",
  },
  muted: {
    bg: "bg-[#F3F4F6]",
    text: "text-[#6B7280]",
    border: "border-[#E5E7EB]",
  },
};

function PortalTagBase({
  children,
  colors,
  className,
}: {
  children: React.ReactNode;
  colors: TagColorClasses;
  className?: string;
}) {
  return (
    <Tag
      bgColor={colors.bg}
      textColor={colors.text}
      borderColor={colors.border}
      className={className ?? "w-fit whitespace-nowrap"}
    >
      {children}
    </Tag>
  );
}

export function normalizePortalStatusKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getDocumentoStatusPortal(etapa: string): string {
  const normalized = normalizePortalStatusKey(etapa);

  if (normalized === "nao iniciados" || normalized === "nao iniciado") return "Não iniciado";
  if (normalized === "em aprovacao") return "Aguar. aprovação";
  if (normalized === "liberados") return "Liberado";
  if (normalized === "processamento") return "Processamento";
  if (normalized === "lancados") return "Lançado";
  if (normalized === "agendados") return "Agendado";
  if (normalized === "pagos") return "Pago";
  if (normalized === "pendencia pedido") return "Bloqueado";
  if (normalized === "cancelados") return "Cancelado";

  return etapa;
}

const DOCUMENTO_ETAPA_TAG_COLORS = {
  aprovacao: {
    bg: "bg-[#E7EEFF]",
    text: "text-[#0C3CF7]",
    border: "border-[#B8CCFF]",
  },
  naoIniciado: {
    bg: "bg-[#F7F8F9]",
    text: "text-[#5B616F]",
    border: "border-[#EAEBEC]",
  },
  liberado: CADASTRO_VARIANT_COLORS.success,
  pendencia: CADASTRO_VARIANT_COLORS.warning,
  cancelado: CADASTRO_VARIANT_COLORS.danger,
  processamento: {
    bg: "bg-[#E6F3FD]",
    text: "text-[#003F70]",
    border: "border-[#A8D5F7]",
  },
} as const satisfies Record<string, TagColorClasses>;

export function getStatusPortalTagColors(status: string): TagColorClasses {
  const key = normalizePortalStatusKey(status);

  if (
    key === "aguar. aprovacao" ||
    key === "em aprovacao"
  ) {
    return DOCUMENTO_ETAPA_TAG_COLORS.aprovacao;
  }
  if (key === "nao iniciado" || key === "nao iniciados") {
    return DOCUMENTO_ETAPA_TAG_COLORS.naoIniciado;
  }
  if (key === "liberado" || key === "liberados") {
    return DOCUMENTO_ETAPA_TAG_COLORS.liberado;
  }
  if (key === "bloqueado" || key === "pendencia pedido") {
    return DOCUMENTO_ETAPA_TAG_COLORS.pendencia;
  }
  if (key === "cancelado" || key === "cancelados") {
    return DOCUMENTO_ETAPA_TAG_COLORS.cancelado;
  }
  if (key === "processamento") {
    return DOCUMENTO_ETAPA_TAG_COLORS.processamento;
  }
  if (key === "lancado") {
    return DOCUMENTO_ETAPA_TAG_COLORS.processamento;
  }
  if (key === "agendado") {
    return DOCUMENTO_ETAPA_TAG_COLORS.naoIniciado;
  }
  if (key === "pago") {
    return DOCUMENTO_ETAPA_TAG_COLORS.liberado;
  }

  return CADASTRO_VARIANT_COLORS.neutral;
}

export function PortalDocumentoStatusTag({ status }: { status: string }) {
  return <PortalTagBase colors={getStatusPortalTagColors(status)}>{status}</PortalTagBase>;
}

export function PortalDocumentoEtapaTag({ etapa }: { etapa: string }) {
  const statusPortal = getDocumentoStatusPortal(etapa);
  return (
    <PortalTagBase colors={getStatusPortalTagColors(statusPortal)}>{etapa}</PortalTagBase>
  );
}

export function PortalDocumentoEtapaErpTag({ etapa }: { etapa: string }) {
  const isMovimentado = normalizePortalStatusKey(etapa) === "movimentado";
  const colors = isMovimentado
    ? CADASTRO_VARIANT_COLORS.success
    : CADASTRO_VARIANT_COLORS.neutral;

  return <PortalTagBase colors={colors}>{etapa}</PortalTagBase>;
}

const SITUACAO_DFE_TAG_COLORS: Record<DocumentoSituacaoDfe, TagColorClasses> = {
  captured: DOCUMENTO_ETAPA_TAG_COLORS.naoIniciado,
  "awaiting-approval": DOCUMENTO_ETAPA_TAG_COLORS.aprovacao,
  released: DOCUMENTO_ETAPA_TAG_COLORS.liberado,
};

export function PortalDocumentoSituacaoDfeTag({ situacao }: { situacao: DocumentoSituacaoDfe }) {
  return (
    <PortalTagBase colors={SITUACAO_DFE_TAG_COLORS[situacao]}>
      {DOCUMENTO_SITUACAO_DFE_LABELS[situacao]}
    </PortalTagBase>
  );
}

export function PortalDocumentoVinculoTipoTag({ tipo }: { tipo: DocumentoOrigemVinculo["tipo"] }) {
  return (
    <PortalTagBase
      colors={{
        bg: "bg-[#EEF2FF]",
        text: "text-[#2942A3]",
        border: "border-[#B8CCFF]",
      }}
    >
      {tipo}
    </PortalTagBase>
  );
}

export function PortalOrigemTipoTag({ tipo }: { tipo: DocumentoOrigemTipo }) {
  return (
    <PortalTagBase
      colors={{
        bg: "bg-[#EEF2FF]",
        text: "text-[#2942A3]",
        border: "border-[#B8CCFF]",
      }}
    >
      {tipo}
    </PortalTagBase>
  );
}

export function PortalComprovanteStatusTag({ status }: { status: DocumentoComprovanteStatus }) {
  const colors =
    status === "Pago"
      ? CADASTRO_VARIANT_COLORS.success
      : {
          bg: "bg-[#E7EEFF]",
          text: "text-[#003F70]",
          border: "border-[#B8CCFF]",
        };

  return <PortalTagBase colors={colors}>{status}</PortalTagBase>;
}

export function PortalCadastroTag({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: PortalCadastroTagVariant;
}) {
  return <PortalTagBase colors={CADASTRO_VARIANT_COLORS[variant]}>{children}</PortalTagBase>;
}

export function PortalCadastroComproTag({ label }: { label: string }) {
  return <PortalTagBase colors={CADASTRO_VARIANT_COLORS.neutral}>{label}</PortalTagBase>;
}

export function pagamentoCadastroVariant(status: PagamentoStatus): PortalCadastroTagVariant {
  return status === "Cadastrados" ? "success" : "neutral";
}

export function situacaoCadastroVariant(status: SituacaoCadastral): PortalCadastroTagVariant {
  if (status === "Ativo") return "success";
  if (status === "Suspenso") return "warning";
  return "danger";
}

export function acessoPortalCadastroVariant(acesso: AcessoPortal): PortalCadastroTagVariant | null {
  if (acesso === "Cadastro ativo") return "success";
  if (acesso === "Convite enviado") return "muted";
  return null;
}

export function recorrenciaCadastroVariant(recorrencia: Recorrencia): PortalCadastroTagVariant {
  if (recorrencia === "Alta") return "success";
  if (recorrencia === "Média") return "warning";
  return "muted";
}

export function acessoFornecedorStatusVariant(
  status: AcessoFornecedorStatus | FornecedorAcessoPortal["status"],
): PortalCadastroTagVariant {
  return status === "Cadastro ativo" ? "success" : "warning";
}

export function PortalAcessoFornecedorStatusTag({
  status,
}: {
  status: AcessoFornecedorStatus | FornecedorAcessoPortal["status"];
}) {
  return (
    <PortalCadastroTag variant={acessoFornecedorStatusVariant(status)}>{status}</PortalCadastroTag>
  );
}
