"use client";

import * as React from "react";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { NFe } from "../../types";
import { NFStatusTag } from "../NFStatusTag";
import { useTheme } from "@/lib/theme/useTheme";
import { formatCurrency, formatCNPJ, formatCFOPList, shortenText } from "../../utils/formatters";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NFeTableProps {
  nfes: NFe[];
  pageItems: NFe[];
  selected: Set<number>;
  onToggleRow: (index: number, checked?: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  allSelected: boolean;
  hasSelection: boolean;
  viewingNFeId?: string | null;
  focusedRowIndex?: number;
  onOpenDetail: (nfe: NFe) => void;
  erpUpdating?: Set<string>;
  currentTab: string;
}

export function NFeTable({
  nfes,
  pageItems,
  selected,
  onToggleRow,
  onToggleAll,
  allSelected,
  hasSelection,
  viewingNFeId,
  focusedRowIndex,
  onOpenDetail,
  erpUpdating = new Set(),
  currentTab,
}: NFeTableProps) {
  const { tagModel } = useTheme();
  const isCompact = tagModel === 'compact';

  // Helper para classes de tag baseado no tema
  const getTagClasses = (bgColor: string, textColor: string, borderColor: string) => {
    return cn(
      isCompact
        ? 'inline-flex items-center h-5 py-[2px] px-2 rounded font-bold leading-4 text-xs'
        : 'inline-flex items-center h-6 px-2 rounded-full border font-medium text-xs',
      bgColor,
      textColor,
      !isCompact && borderColor
    );
  };

  const columns: DataTableColumn<NFe>[] = [
    {
      key: 'empresa',
      label: 'Empresa',
      width: 'w-[200px]',
      render: (nfe) => (
        <span className="text-[#0d0f1c] whitespace-nowrap truncate" title={nfe.empresaNome}>
          {shortenText(nfe.empresaNome, 25)}
        </span>
      ),
    },
    {
      key: 'cfops',
      label: 'CFOPs da Nota',
      width: 'w-[140px]',
      render: (nfe) => (
        <span className="text-[#5F6572] whitespace-nowrap truncate" title={formatCFOPList(nfe.cfops)}>
          {formatCFOPList(nfe.cfops)}
        </span>
      ),
    },
    {
      key: 'numero',
      label: 'Número',
      width: 'w-[120px]',
      render: (nfe) => (
        <span className="text-[#0d0f1c] font-semibold whitespace-nowrap truncate">
          {nfe.numero}
        </span>
      ),
    },
    {
      key: 'valor',
      label: 'Valor',
      width: 'w-[132px]',
      render: (nfe) => (
        <span className="text-[#0d0f1c] font-semibold tabular-nums whitespace-nowrap">
          {formatCurrency(nfe.valor)}
        </span>
      ),
    },
    {
      key: 'emissao',
      label: 'Emissão',
      width: 'w-[120px]',
      render: (nfe) => (
        <span className="text-[#0d0f1c] whitespace-nowrap truncate">
          {nfe.dataEmissao}
        </span>
      ),
    },
    {
      key: 'manifestacao',
      label: 'Manifestação',
      width: 'w-[180px]',
      render: (nfe) => (
        nfe.manifestacao ? (
          <NFStatusTag value={nfe.manifestacao} type="manifestacao" />
        ) : (
          <span className="text-[#5F6572] text-xs">—</span>
        )
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-[128px]',
      render: (nfe) => <NFStatusTag value={nfe.status} type="status" />,
    },
    {
      key: 'erp',
      label: 'Sincronização ERP',
      width: 'w-[160px]',
      render: (nfe) => {
        const isUpdating = erpUpdating.has(nfe.id);
        return isUpdating ? (
          <span className={getTagClasses('bg-[#E6F3FD]', 'text-[#003F70]', 'border-[#A8D5F7]')}>
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            Atualizando...
          </span>
        ) : nfe.sincronizadoERP ? (
          <span className={getTagClasses('bg-emerald-50', 'text-emerald-700', 'border-emerald-200')}>
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Sincronizado
          </span>
        ) : (
          <span className={getTagClasses('bg-gray-50', 'text-gray-600', 'border-gray-200')}>
            Não sincronizado
          </span>
        );
      },
    },
    {
      key: 'origem',
      label: 'Origem',
      width: 'w-[140px]',
      render: (nfe) => (
        <span className="text-[#5F6572] whitespace-nowrap truncate" title={nfe.origem}>
          {nfe.origem}
        </span>
      ),
    },
    {
      key: 'serie',
      label: 'Série',
      width: 'w-[80px]',
      render: (nfe) => (
        <span className="text-[#5F6572] whitespace-nowrap truncate">
          {nfe.serie}
        </span>
      ),
    },
  ];

  // Adicionar coluna de emitente/destinatário dependendo da tab
  if (currentTab === 'recebidas' || currentTab === 'transporte') {
    columns.splice(3, 0, {
      key: 'emitente',
      label: 'Emitente',
      width: 'w-[200px]',
      render: (nfe) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[#0d0f1c] whitespace-nowrap truncate" title={nfe.emitente.razaoSocial}>
            {shortenText(nfe.emitente.razaoSocial, 25)}
          </span>
          <span className="text-[#5F6572] text-xs whitespace-nowrap truncate">
            {formatCNPJ(nfe.emitente.cnpj)}
          </span>
        </div>
      ),
    });
  } else if (currentTab === 'emitidas') {
    columns.splice(3, 0, {
      key: 'destinatario',
      label: 'Destinatário',
      width: 'w-[200px]',
      render: (nfe) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[#0d0f1c] whitespace-nowrap truncate" title={nfe.destinatario.razaoSocial}>
            {shortenText(nfe.destinatario.razaoSocial, 25)}
          </span>
          <span className="text-[#5F6572] text-xs whitespace-nowrap truncate">
            {formatCNPJ(nfe.destinatario.cnpjCpf)}
          </span>
        </div>
      ),
    });
  }

  const emptyStates = {
    recebidas: {
      title: 'Nenhuma NF-e recebida',
      description: 'Notas fiscais recebidas aparecerão aqui.',
    },
    emitidas: {
      title: 'Nenhuma NF-e emitida',
      description: 'Notas fiscais emitidas aparecerão aqui.',
    },
    transporte: {
      title: 'Nenhum CT-e de transporte',
      description: 'Conhecimentos de transporte aparecerão aqui.',
    },
    citadas: {
      title: 'Nenhuma NF-e citada',
      description: 'Notas fiscais onde sua empresa é citada aparecerão aqui.',
    },
  };

  return (
    <DataTable
      columns={columns}
      data={pageItems}
      getRowId={(nfe) => nfe.id}
      selected={selected}
      onToggleRow={onToggleRow}
      onToggleAll={onToggleAll}
      allSelected={allSelected}
      hasSelection={hasSelection}
      viewingRowId={viewingNFeId}
      focusedRowIndex={focusedRowIndex}
      onRowClick={onOpenDetail}
      emptyState={emptyStates[currentTab as keyof typeof emptyStates]}
    />
  );
}

