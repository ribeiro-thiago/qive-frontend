"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme/useTheme";
import { NFeStatus, NFeManifestacao } from "../types";

interface NFStatusTagProps {
  value: NFeStatus | NFeManifestacao;
  type?: 'status' | 'manifestacao';
}

export function NFStatusTag({ value, type = 'status' }: NFStatusTagProps) {
  const { tagModel } = useTheme();
  const isCompact = tagModel === 'compact';

  const getStyles = () => {
    if (type === 'status') {
      const statusStyles: Record<NFeStatus, { bg: string; text: string; border: string }> = {
        'Autorizada': {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
        },
        'Cancelada': {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
        },
        'Denegada': {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
        },
        'Rejeitada': {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
        },
        'Inutilizada': {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          border: 'border-gray-200',
        },
        'Pendente': {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
        },
      };
      return statusStyles[value as NFeStatus] || statusStyles['Pendente'];
    } else {
      const manifestacaoStyles: Record<NFeManifestacao, { bg: string; text: string; border: string }> = {
        'Ciência da Operação': {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
        },
        'Confirmação da Operação': {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
        },
        'Desconhecimento da Operação': {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
        },
        'Operação não Realizada': {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
        },
        'Não Manifestada': {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          border: 'border-gray-200',
        },
      };
      return manifestacaoStyles[value as NFeManifestacao] || manifestacaoStyles['Não Manifestada'];
    }
  };

  const styles = getStyles();

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs whitespace-nowrap",
        isCompact
          ? "h-5 py-[2px] px-2 rounded font-bold leading-4"
          : "h-6 px-2 rounded-full border font-medium",
        styles.bg,
        styles.text,
        !isCompact && styles.border
      )}
    >
      {value}
    </span>
  );
}

