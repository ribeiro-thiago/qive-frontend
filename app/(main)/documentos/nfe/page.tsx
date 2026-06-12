"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ProductToolbar } from "@/components/layout/ProductToolbar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { DataTableFilters } from "@/components/shared/DataTableFilters";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { companies } from "@/components/layout/CompanySelector";
import { NFe, NFeTab } from "./types";
import { initialNFes } from "./data/mock-data";
import { useNFeFilters } from "./hooks/useNFeFilters";
import { usePagination } from "./hooks/usePagination";
import { useNFeSelection } from "./hooks/useNFeSelection";
import { useNFeTabs } from "./hooks/useNFeTabs";
import { NFeTable } from "./components/NFeTable";
import { NFeActions } from "./components/NFeActions";
import { NFeModal } from "./components/NFeModal";
import { formatCurrency } from "./utils/formatters";

export default function PageNFe() {
  const [nfes, setNFes] = React.useState<NFe[]>([]);
  const [selectedCompany, setSelectedCompany] = React.useState<string[]>(["all"]);
  const [period, setPeriod] = React.useState<string>("Últimos 90 dias");
  const [query, setQuery] = React.useState<string>("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [currentNFe, setCurrentNFe] = React.useState<NFe | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number>(-1);
  const [erpUpdating, setErpUpdating] = React.useState<Set<string>>(new Set());

  // Tabs
  const { currentTab, setCurrentTab } = useNFeTabs('recebidas');

  // Inicializar dados
  React.useEffect(() => {
    setNFes(initialNFes);
  }, []);

  // Sincronização ERP inicial
  React.useEffect(() => {
    if (nfes.length === 0) return;
    const allIds = nfes.map(n => n.id);
    setErpUpdating(new Set(allIds));
    const timer = setTimeout(() => setErpUpdating(new Set()), 2000);
    return () => clearTimeout(timer);
  }, [nfes]);

  // Filtro por empresa
  const companyFilteredNFes = React.useMemo(() => {
    if (selectedCompany.includes("all")) return nfes;
    
    const selectedCompanies = companies.filter(c => selectedCompany.includes(c.id));
    const cleanCNPJ = (cnpj: string) => cnpj.replace(/\D/g, '');
    const selectedCnpjs = selectedCompanies
      .map(c => c.cnpj ? cleanCNPJ(c.cnpj) : null)
      .filter(Boolean) as string[];
    
    if (selectedCnpjs.length === 0) return nfes;
    
    return nfes.filter(nfe => selectedCnpjs.includes(cleanCNPJ(nfe.empresaCnpj)));
  }, [nfes, selectedCompany]);

  // Filtros
  const { filteredData, totalValue, totalCount } = useNFeFilters(
    companyFilteredNFes,
    currentTab as NFeTab,
    { query, period }
  );

  // Paginação
  const pagination = usePagination(filteredData, 20);

  // Seleção
  const selection = useNFeSelection(filteredData.length);

  // Limpar seleção quando muda de aba
  React.useEffect(() => {
    selection.clearSelection();
  }, [currentTab, selection]);

  // Resetar índice focado quando mudamos de tab ou página
  React.useEffect(() => {
    setFocusedRowIndex(-1);
  }, [currentTab, pagination.page]);

  // Sincronizar currentNFe com mudanças em nfes
  React.useEffect(() => {
    if (currentNFe) {
      const updatedNFe = nfes.find(n => n.id === currentNFe.id);
      if (updatedNFe && updatedNFe !== currentNFe) {
        setCurrentNFe(updatedNFe);
      }
    }
  }, [nfes, currentNFe]);

  // Navegação por teclado
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        return;
      }

      const target = e.target as HTMLElement;
      
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' ||
        target.closest('[role="dialog"]:not([data-sheet])')
      ) {
        return;
      }

      const pageItems = pagination.paginatedItems;
      if (pageItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const nextIndex = focusedRowIndex === -1 ? 0 : 
                         focusedRowIndex < pageItems.length - 1 ? focusedRowIndex + 1 : 0;
        setFocusedRowIndex(nextIndex);
        const nextNFe = pageItems[nextIndex];
        setCurrentNFe(nextNFe);
        setModalOpen(true);
        
        setTimeout(() => {
          if (document.activeElement && document.activeElement !== document.body) {
            (document.activeElement as HTMLElement).blur();
          }
        }, 0);
      }
      
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const prevIndex = focusedRowIndex === -1 ? pageItems.length - 1 :
                         focusedRowIndex > 0 ? focusedRowIndex - 1 : pageItems.length - 1;
        setFocusedRowIndex(prevIndex);
        const prevNFe = pageItems[prevIndex];
        setCurrentNFe(prevNFe);
        setModalOpen(true);
        
        setTimeout(() => {
          if (document.activeElement && document.activeElement !== document.body) {
            (document.activeElement as HTMLElement).blur();
          }
        }, 0);
      }
      
      else if (e.key === ' ') {
        if (focusedRowIndex >= 0 && focusedRowIndex < pageItems.length) {
          e.preventDefault();
          e.stopPropagation();
          const focusedNFe = pageItems[focusedRowIndex];
          const globalIndex = filteredData.indexOf(focusedNFe);
          if (globalIndex !== -1) {
            selection.toggleRow(globalIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [focusedRowIndex, pagination.paginatedItems, filteredData, selection]);

  const openDetail = (nfe: NFe) => {
    setCurrentNFe(nfe);
    setModalOpen(true);
    const nfeIndex = pagination.paginatedItems.findIndex(n => n.id === nfe.id);
    if (nfeIndex !== -1) {
      setFocusedRowIndex(nfeIndex);
    }
  };

  const handlePreviousNFe = () => {
    const pageItems = pagination.paginatedItems;
    if (!currentNFe || pageItems.length === 0) return;
    
    const currentIndex = pageItems.findIndex(n => n.id === currentNFe.id);
    if (currentIndex > 0) {
      const prevNFe = pageItems[currentIndex - 1];
      setCurrentNFe(prevNFe);
      setFocusedRowIndex(currentIndex - 1);
    }
  };

  const handleNextNFe = () => {
    const pageItems = pagination.paginatedItems;
    if (!currentNFe || pageItems.length === 0) return;
    
    const currentIndex = pageItems.findIndex(n => n.id === currentNFe.id);
    if (currentIndex !== -1 && currentIndex < pageItems.length - 1) {
      const nextNFe = pageItems[currentIndex + 1];
      setCurrentNFe(nextNFe);
      setFocusedRowIndex(currentIndex + 1);
    }
  };

  const hasPreviousNFe = React.useMemo(() => {
    if (!currentNFe) return false;
    const pageItems = pagination.paginatedItems;
    const currentIndex = pageItems.findIndex(n => n.id === currentNFe.id);
    return currentIndex > 0;
  }, [currentNFe, pagination.paginatedItems]);

  const hasNextNFe = React.useMemo(() => {
    if (!currentNFe) return false;
    const pageItems = pagination.paginatedItems;
    const currentIndex = pageItems.findIndex(n => n.id === currentNFe.id);
    return currentIndex !== -1 && currentIndex < pageItems.length - 1;
  }, [currentNFe, pagination.paginatedItems]);

  const tabs = [
    { id: "recebidas", label: "Recebidas" },
    { id: "emitidas", label: "Emitidas" },
    { id: "transporte", label: "Transporte" },
    { id: "citadas", label: "Citadas" },
  ];

  const periodOptions = [
    "Todos os períodos",
    "Hoje",
    "Últimos 7 dias",
    "Últimos 30 dias",
    "Últimos 90 dias",
    "Este mês",
    "Mês passado",
    "Personalizado...",
  ];

  // NFes selecionadas para ações
  const selectedNFes = React.useMemo(() => {
    return filteredData.filter((_, index) => selection.selected.has(index));
  }, [filteredData, selection.selected]);

  // Índices visíveis para seleção
  const visibleIndices = React.useMemo(() => {
    return filteredData.map((_, index) => index);
  }, [filteredData]);

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">NF-e</h1>
      <ProductToolbar 
        selectedCompany={selectedCompany} 
        onCompanyChange={setSelectedCompany}
      >
        <Button size="default" variant="secondary" className="font-bold" onClick={(e) => e.preventDefault()}>
          <Settings className="h-4 w-4" />
        </Button>
      </ProductToolbar>

      <Card className="rounded-xl bg-white border border-border mt-4">
        <CardContent className="p-0">
          <div className="bg-[#F5F5F6] rounded-t-xl overflow-hidden">
            <Tabs tabs={tabs} value={currentTab} onValueChange={setCurrentTab} variant="product" />
          </div>

          <DataTableFilters
            searchPlaceholder="Busque por número, chave de acesso, emitente, destinatário, CFOP..."
            searchValue={query}
            onSearchChange={setQuery}
            periodLabel="Data de emissão"
            periodValue={period}
            periodOptions={periodOptions}
            onPeriodChange={setPeriod}
            totalLabel="Total das notas"
            totalValue={formatCurrency(totalValue)}
            showStatusFilter={false}
          />

          <div className="h-px bg-[#EBECEE]" />

          <NFeActions
            selectedCount={selection.selected.size}
            totalCount={totalCount}
            onSelectAll={() => selection.toggleAll(!selection.allSelected, visibleIndices)}
            allSelected={selection.allSelected}
            selectedNFes={selectedNFes}
            currentTab={currentTab}
          />

          <div className="overflow-x-auto rounded-b-xl overflow-hidden">
            <NFeTable
              nfes={filteredData}
              pageItems={pagination.paginatedItems}
              selected={selection.selected}
              onToggleRow={selection.toggleRow}
              onToggleAll={(checked) => selection.toggleAll(checked, visibleIndices)}
              allSelected={selection.allSelected}
              hasSelection={selection.hasSelection}
              viewingNFeId={currentNFe?.id}
              focusedRowIndex={focusedRowIndex}
              onOpenDetail={openDetail}
              erpUpdating={erpUpdating}
              currentTab={currentTab}
            />
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      <DataTablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={filteredData.length}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        hasNextPage={pagination.hasNextPage}
        hasPrevPage={pagination.hasPrevPage}
      />

      {/* Modal de detalhes */}
      <NFeModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setCurrentNFe(null);
            setFocusedRowIndex(-1);
          }
        }}
        nfe={currentNFe}
        onPrevious={handlePreviousNFe}
        onNext={handleNextNFe}
        hasPrevious={hasPreviousNFe}
        hasNext={hasNextNFe}
      />
    </section>
  );
}

