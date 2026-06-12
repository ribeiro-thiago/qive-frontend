"use client";

import * as React from "react";
import { DataTableActions, ActionDropdown } from "@/components/shared/DataTableActions";
import { Download, FileText, Tag, CheckSquare } from "lucide-react";
import { NFe } from "../../types";
import { exportToCSV, downloadXML } from "../../utils/nfe-helpers";
import { toast } from "sonner";

interface NFeActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  allSelected: boolean;
  selectedNFes: NFe[];
  currentTab: string;
}

export function NFeActions({
  selectedCount,
  totalCount,
  onSelectAll,
  allSelected,
  selectedNFes,
  currentTab,
}: NFeActionsProps) {
  const handleExportCSV = React.useCallback(() => {
    exportToCSV(selectedNFes);
    toast.success(`${selectedCount} NF-e${selectedCount > 1 ? 's' : ''} exportada${selectedCount > 1 ? 's' : ''} com sucesso`);
  }, [selectedNFes, selectedCount]);

  const handleExportXLSX = React.useCallback(() => {
    toast.info('Exportação para XLSX em desenvolvimento');
  }, []);

  const handleDownloadXMLs = React.useCallback(() => {
    selectedNFes.forEach((nfe, index) => {
      setTimeout(() => downloadXML(nfe), index * 200);
    });
    toast.success(`Download de ${selectedCount} XML${selectedCount > 1 ? 's' : ''} iniciado`);
  }, [selectedNFes, selectedCount]);

  const handleRelatorioAnalytics = React.useCallback(() => {
    toast.info('Relatório Analytics em desenvolvimento');
  }, []);

  const handleRelatorioFiscal = React.useCallback(() => {
    toast.info('Relatório Fiscal em desenvolvimento');
  }, []);

  const handleGerarEtiquetas = React.useCallback(() => {
    toast.info('Geração de etiquetas em desenvolvimento');
  }, []);

  const handleManifestarCiencia = React.useCallback(() => {
    toast.success(`Ciência registrada para ${selectedCount} NF-e${selectedCount > 1 ? 's' : ''}`);
  }, [selectedCount]);

  const handleManifestarConfirmacao = React.useCallback(() => {
    toast.success(`Operação confirmada para ${selectedCount} NF-e${selectedCount > 1 ? 's' : ''}`);
  }, [selectedCount]);

  const handleManifestarDesconhecimento = React.useCallback(() => {
    toast.warning(`Desconhecimento registrado para ${selectedCount} NF-e${selectedCount > 1 ? 's' : ''}`);
  }, [selectedCount]);

  const handleManifestarNaoRealizada = React.useCallback(() => {
    toast.warning(`Operação não realizada registrada para ${selectedCount} NF-e${selectedCount > 1 ? 's' : ''}`);
  }, [selectedCount]);

  const actions: ActionDropdown[] = React.useMemo(() => {
    const baseActions: ActionDropdown[] = [
      {
        label: 'Exportar',
        icon: <Download className="h-4 w-4" />,
        items: [
          {
            label: 'CSV',
            onClick: handleExportCSV,
          },
          {
            label: 'XLSX',
            onClick: handleExportXLSX,
          },
          {
            label: 'Download XMLs',
            onClick: handleDownloadXMLs,
          },
        ],
      },
      {
        label: 'Relatórios',
        icon: <FileText className="h-4 w-4" />,
        items: [
          {
            label: 'Relatório Analytics',
            onClick: handleRelatorioAnalytics,
          },
          {
            label: 'Relatório Fiscal',
            onClick: handleRelatorioFiscal,
          },
        ],
      },
      {
        label: 'Etiquetas',
        icon: <Tag className="h-4 w-4" />,
        items: [
          {
            label: 'Gerar etiquetas',
            onClick: handleGerarEtiquetas,
          },
        ],
      },
    ];

    // Adicionar ações de manifestação apenas na tab "recebidas"
    if (currentTab === 'recebidas') {
      baseActions.push({
        label: 'Manifestar',
        icon: <CheckSquare className="h-4 w-4" />,
        items: [
          {
            label: 'Ciência da Operação',
            onClick: handleManifestarCiencia,
          },
          {
            label: 'Confirmação da Operação',
            onClick: handleManifestarConfirmacao,
          },
          {
            label: 'Desconhecimento da Operação',
            onClick: handleManifestarDesconhecimento,
          },
          {
            label: 'Operação não Realizada',
            onClick: handleManifestarNaoRealizada,
          },
        ],
      });
    }
    return baseActions;
  }, [
    currentTab,
    handleExportCSV,
    handleExportXLSX,
    handleDownloadXMLs,
    handleRelatorioAnalytics,
    handleRelatorioFiscal,
    handleGerarEtiquetas,
    handleManifestarCiencia,
    handleManifestarConfirmacao,
    handleManifestarDesconhecimento,
    handleManifestarNaoRealizada,
  ]);

  return (
    <DataTableActions
      selectedCount={selectedCount}
      totalCount={totalCount}
      onSelectAll={onSelectAll}
      allSelected={allSelected}
      actions={actions}
    />
  );
}

