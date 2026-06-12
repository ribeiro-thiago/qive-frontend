"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, Trash2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";
import type { AppliedFilterTag } from "./AppliedFiltersBar";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parse } from "date-fns";
import { Row } from "../types";
import { useFeatures } from "@/lib/features/useFeatures";
import {
  LANCADO_EM_FILTER_OPTIONS,
  LANCADO_EM_FILTER_PLACEHOLDER,
  getLancadoEmFilterLabel,
} from "../utils/lancadoEmFilter";
import { AppliedFilterChip } from "./AppliedFiltersBar";

export interface AdvancedFiltersState {
  vencimentoInicio: string;
  vencimentoFim: string;
  emissaoInicio: string;
  emissaoFim: string;
  valorMinimo: string;
  valorMaximo: string;
  formaPagamento: string;
  origemDocumento: string;
  semDataVencimento: boolean;
  divergencias: string;
  cancelamentoOrigem: string;
  tipoCancelamento: string;
  notaAtualizadaAposCriacao: boolean;
  lancadoEm: string;
  cbsPrevistoMinimo: string;
  cbsPrevistoMaximo: string;
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  filters: AdvancedFiltersState;
  onFiltersChange: (filters: AdvancedFiltersState) => void;
  onApply: () => void;
  onClear: () => void;
  availableData?: Row[];
  mapOrigem?: (row: Row) => Row['origem'];
  alternativeMode?: boolean; // Modo alternativo: filtros permanecem abertos
  appliedFilterTags?: AppliedFilterTag[]; // Tags de filtros aplicados (para modo alternativo)
  appliedFilters?: AdvancedFiltersState; // Filtros atualmente aplicados (para comparar com filters e habilitar/desabilitar botões)
  showLancadoEmFilter?: boolean;
}

export function AdvancedFilters({
  isOpen,
  filters,
  onFiltersChange,
  onApply,
  onClear,
  availableData = [],
  mapOrigem,
  alternativeMode = false,
  appliedFilterTags = [],
  appliedFilters,
  showLancadoEmFilter = false,
}: AdvancedFiltersProps) {
  const { isOrigemTypeEnabled } = useFeatures();
  const formasPagamento = React.useMemo(() => ["Todos os tipos", "Boleto", "PIX", "TED", "Não informado"], []);
  const origensDocumento = React.useMemo(() => {
    const origemMap: Record<string, string> = {
      "NFe": "NF-e",
      "CTe": "CT-e",
      "NFSe": "NFS-e",
    };
    const all = ["Todos os tipos", "Boleto", "NFe", "CTe", "NFSe", "Manual"];
    return all.filter((o) => {
      const flagKey = origemMap[o];
      if (flagKey) return isOrigemTypeEnabled("gestao-de-pagamentos", flagKey);
      return true;
    });
  }, [isOrigemTypeEnabled]);

  // Calcular quais formas de pagamento têm documentos disponíveis
  const availableFormasPagamento = React.useMemo(() => {
    if (!availableData || availableData.length === 0) {
      return new Set(formasPagamento); // Se não há dados, todas estão disponíveis
    }

    const available = new Set<string>(["Todos os tipos"]);
    
    availableData.forEach((row) => {
      const tipo = (row.formaPagamento?.tipo as string) || 'Não informado';
      // Mapear tipos para os valores do filtro
      if (tipo === 'PIX' || tipo === 'pix') {
        available.add('PIX');
      } else if (tipo === 'TED' || tipo === 'ted') {
        available.add('TED');
      } else if (tipo === 'Boleto' || tipo === 'boleto') {
        available.add('Boleto');
      } else {
        available.add('Não informado');
      }
    });

    return available;
  }, [availableData, formasPagamento]);

  // Calcular quais origens de documento têm documentos disponíveis
  // IMPORTANTE: Usar apenas o campo 'origem' da linha (row.origem),
  // NÃO considerar documentosAssociados para determinar disponibilidade
  const availableOrigensDocumento = React.useMemo(() => {
    if (!availableData || availableData.length === 0) {
      return new Set(origensDocumento); // Se não há dados, todas estão disponíveis
    }

    const available = new Set<string>(["Todos os tipos"]);
    
    availableData.forEach((row) => {
      // Usar a origem mapeada (se mapOrigem fornecida) ou a origem original
      // Isso garante que apenas origens que realmente aparecem na tabela sejam consideradas
      const origemOriginal = mapOrigem ? mapOrigem(row) : row.origem;
      // Normalizar a origem para corresponder às opções do filtro (usando string para permitir valores normalizados)
      let origemNormalizada: string = origemOriginal;
      if (origemOriginal === 'NF-e') origemNormalizada = 'NFe';
      else if (origemOriginal === 'CT-e') origemNormalizada = 'CTe';
      else if (origemOriginal === 'NFS-e') origemNormalizada = 'NFSe';
      
      if (origemNormalizada === 'Boleto' || origemNormalizada === 'NFe' || origemNormalizada === 'CTe' || origemNormalizada === 'NFSe' || origemNormalizada === 'Manual') {
        available.add(origemNormalizada);
      }
    });

    return available;
  }, [availableData, mapOrigem, origensDocumento]);

  // Resetar filtros se a opção selecionada não estiver disponível (apenas quando availableData muda)
  React.useEffect(() => {
    const updates: Partial<AdvancedFiltersState> = {};
    
    if (filters.formaPagamento && !availableFormasPagamento.has(filters.formaPagamento)) {
      updates.formaPagamento = 'Todos os tipos';
    }
    
    if (filters.origemDocumento && !availableOrigensDocumento.has(filters.origemDocumento)) {
      updates.origemDocumento = 'Todos os tipos';
    }
    
    if (Object.keys(updates).length > 0) {
      onFiltersChange({
        ...filters,
        ...updates,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableData]);

  const updateFilter = (key: keyof AdvancedFiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Função auxiliar para converter string dd/mm/yyyy para Date
  const parseStringToDate = (dateString: string): Date | undefined => {
    if (!dateString || dateString.length !== 10) return undefined;
    try {
      return parse(dateString, "dd/MM/yyyy", new Date());
    } catch {
      return undefined;
    }
  };

  // Função auxiliar para converter Date para string dd/mm/yyyy
  const formatDateToString = (date: Date | undefined): string => {
    if (!date) return "";
    try {
      return format(date, "dd/MM/yyyy");
    } catch {
      return "";
    }
  };

  const handleDateChange = (key: keyof AdvancedFiltersState, date: Date | undefined) => {
    // Se estiver selecionando uma data de vencimento, desmarcar "Sem data de vencimento"
    if ((key === 'vencimentoInicio' || key === 'vencimentoFim') && date) {
      onFiltersChange({
        ...filters,
        [key]: formatDateToString(date),
        semDataVencimento: false,
      });
    } else {
      updateFilter(key, formatDateToString(date));
    }
  };

  const handleNoDateSelect = (newState: boolean) => {
    // Toggle: se newState é true, ativa "Sem data de vencimento"
    // Se newState é false, desativa e volta ao estado normal
    onFiltersChange({
      ...filters,
      vencimentoInicio: '',
      vencimentoFim: '',
      semDataVencimento: newState,
    });
  };

  const displayCurrencyValue = (value: string): string => {
    if (!value) return '';
    const num = parseFloat(value);
    return isNaN(num) ? '' : num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCurrencyChange = (key: keyof AdvancedFiltersState, value: string) => {
    const cleanedValue = value.replace(/[^0-9,.]/g, '').replace(',', '.');
    updateFilter(key, cleanedValue);
  };

  // Verificar se há diferenças entre os filtros temporários e os aplicados
  const hasFilterChanges = React.useMemo(() => {
    if (!appliedFilters) return false;
    
    return (
      filters.vencimentoInicio !== appliedFilters.vencimentoInicio ||
      filters.vencimentoFim !== appliedFilters.vencimentoFim ||
      filters.emissaoInicio !== appliedFilters.emissaoInicio ||
      filters.emissaoFim !== appliedFilters.emissaoFim ||
      filters.valorMinimo !== appliedFilters.valorMinimo ||
      filters.valorMaximo !== appliedFilters.valorMaximo ||
      filters.formaPagamento !== appliedFilters.formaPagamento ||
      filters.origemDocumento !== appliedFilters.origemDocumento ||
      filters.semDataVencimento !== appliedFilters.semDataVencimento ||
      filters.divergencias !== appliedFilters.divergencias ||
      filters.cancelamentoOrigem !== appliedFilters.cancelamentoOrigem ||
      filters.tipoCancelamento !== appliedFilters.tipoCancelamento ||
      filters.notaAtualizadaAposCriacao !== appliedFilters.notaAtualizadaAposCriacao ||
      filters.lancadoEm !== appliedFilters.lancadoEm ||
      filters.cbsPrevistoMinimo !== appliedFilters.cbsPrevistoMinimo ||
      filters.cbsPrevistoMaximo !== appliedFilters.cbsPrevistoMaximo
    );
  }, [filters, appliedFilters]);

  // Verificar se há filtros aplicados (diferentes dos valores padrão)
  const hasAppliedFilters = React.useMemo(() => {
    if (!appliedFilters) return false;
    
    return (
      appliedFilters.vencimentoInicio !== '' ||
      appliedFilters.vencimentoFim !== '' ||
      appliedFilters.emissaoInicio !== '' ||
      appliedFilters.emissaoFim !== '' ||
      appliedFilters.valorMinimo !== '' ||
      appliedFilters.valorMaximo !== '' ||
      appliedFilters.formaPagamento !== 'Todos os tipos' ||
      appliedFilters.origemDocumento !== 'Todos os tipos' ||
      appliedFilters.semDataVencimento !== false ||
      appliedFilters.divergencias !== '' ||
      appliedFilters.cancelamentoOrigem !== 'Todos os tipos' ||
      appliedFilters.tipoCancelamento !== 'Todos os tipos' ||
      appliedFilters.notaAtualizadaAposCriacao !== false ||
      appliedFilters.lancadoEm !== LANCADO_EM_FILTER_PLACEHOLDER ||
      appliedFilters.cbsPrevistoMinimo !== '' ||
      appliedFilters.cbsPrevistoMaximo !== ''
    );
  }, [appliedFilters]);

  // No modo alternativo, os filtros sempre ficam visíveis quando isOpen é true
  // No modo padrão, os filtros fecham quando isOpen é false
  const shouldShow = alternativeMode ? isOpen : isOpen;
  
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        shouldShow ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className="space-y-4 py-4">
        {/* Período de vencimento e emissão - 4 campos na mesma linha */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
              Vencimento a partir de
            </Label>
            <DatePicker
              date={parseStringToDate(filters.vencimentoInicio)}
              onDateChange={(date) => handleDateChange('vencimentoInicio', date)}
              placeholder="dd/mm/yyyy"
              showNoDateOption={true}
              noDateLabel="Sem data de vencimento"
              onNoDateSelect={handleNoDateSelect}
              isNoDateSelected={filters.semDataVencimento}
            />
          </div>
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
              Vencimento até
            </Label>
            <DatePicker
              date={parseStringToDate(filters.vencimentoFim)}
              onDateChange={(date) => handleDateChange('vencimentoFim', date)}
              placeholder="dd/mm/yyyy"
              showNoDateOption={true}
              noDateLabel="Sem data de vencimento"
              onNoDateSelect={handleNoDateSelect}
              isNoDateSelected={filters.semDataVencimento}
            />
          </div>
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
              Emissão a partir de
            </Label>
            <DatePicker
              date={parseStringToDate(filters.emissaoInicio)}
              onDateChange={(date) => handleDateChange('emissaoInicio', date)}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
              Emissão até
            </Label>
            <DatePicker
              date={parseStringToDate(filters.emissaoFim)}
              onDateChange={(date) => handleDateChange('emissaoFim', date)}
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>

        {/* Intervalo de valor, Forma de pagamento, Origem do documento - 4 campos na mesma linha */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
              Valor a partir de
            </Label>
            <Input
              placeholder="R$ 0,00"
              className="w-full shadow-none"
              value={displayCurrencyValue(filters.valorMinimo)}
              onChange={(e) => handleCurrencyChange('valorMinimo', e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
              Valor até
            </Label>
            <Input
              placeholder="R$ 0,00"
              className="w-full shadow-none"
              value={displayCurrencyValue(filters.valorMaximo)}
              onChange={(e) => handleCurrencyChange('valorMaximo', e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
              Forma de pagamento
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between shadow-none font-normal"
                >
                  {filters.formaPagamento}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                {formasPagamento.map((forma) => {
                  const isAvailable = availableFormasPagamento.has(forma);
                  const isDisabled = !isAvailable;
                  
                  return (
                    <DropdownMenuItem
                      key={forma}
                      onSelect={() => !isDisabled && updateFilter('formaPagamento', forma)}
                      disabled={isDisabled}
                      className={cn(
                        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                        filters.formaPagamento === forma && "bg-accent"
                      )}
                    >
                      {forma}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
              Origem da conta
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between shadow-none font-normal"
                >
                  {filters.origemDocumento}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                {origensDocumento.map((origem) => {
                  const isAvailable = availableOrigensDocumento.has(origem);
                  const isDisabled = !isAvailable;
                  
                  return (
                    <DropdownMenuItem
                      key={origem}
                      onSelect={() => !isDisabled && updateFilter('origemDocumento', origem)}
                      disabled={isDisabled}
                      className={cn(
                        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                        filters.origemDocumento === origem && "bg-accent"
                      )}
                    >
                      {origem}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showLancadoEmFilter && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="flex-1">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                Lançado em
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between shadow-none font-normal"
                  >
                    <span
                      className={cn(
                        "truncate",
                        filters.lancadoEm === LANCADO_EM_FILTER_PLACEHOLDER && "text-muted-foreground"
                      )}
                    >
                      {getLancadoEmFilterLabel(filters.lancadoEm)}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuItem onClick={() => updateFilter('lancadoEm', LANCADO_EM_FILTER_PLACEHOLDER)}>
                    {LANCADO_EM_FILTER_PLACEHOLDER}
                  </DropdownMenuItem>
                  {LANCADO_EM_FILTER_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => updateFilter('lancadoEm', option.value)}
                      className={cn(filters.lancadoEm === option.value && "bg-accent")}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex-1">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                CBS previsto a partir de
              </Label>
              <Input
                placeholder="R$ 0,00"
                className="w-full shadow-none"
                value={displayCurrencyValue(filters.cbsPrevistoMinimo)}
                onChange={(e) => handleCurrencyChange('cbsPrevistoMinimo', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label className="mb-2 block text-sm font-semibold" style={{ color: '#5F6572' }}>
                CBS previsto até
              </Label>
              <Input
                placeholder="R$ 0,00"
                className="w-full shadow-none"
                value={displayCurrencyValue(filters.cbsPrevistoMaximo)}
                onChange={(e) => handleCurrencyChange('cbsPrevistoMaximo', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Botões de ação e barra de filtros aplicados (modo alternativo) */}
        <div className={cn(
          "pt-2",
          alternativeMode && appliedFilterTags.length > 0 && isOpen
            ? "flex items-center gap-3 justify-between" 
            : "flex gap-3 justify-end"
        )}>
          {/* Barra "Filtrando por" - apenas no modo alternativo quando há filtros aplicados E os filtros estão abertos */}
          {alternativeMode && appliedFilterTags.length > 0 && isOpen && (
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
              <Filter className="h-4 w-4 shrink-0 text-[#5F6572]" aria-hidden />
              <span className="text-sm font-semibold shrink-0 text-[#5F6572]">
                Filtrando por:
              </span>
              {appliedFilterTags.map((tag) => (
                <AppliedFilterChip
                  key={tag.key}
                  label={tag.label}
                  onRemove={tag.onRemove}
                />
              ))}
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="flex gap-3 shrink-0">
            {/* Botão "Limpar filtros" - apenas quando os filtros estão abertos no modo alternativo */}
            {(!alternativeMode || isOpen) && (
              <Button
                variant="ghost"
                size="default"
                className="inline-flex items-center gap-2 font-bold text-[#5F6572] shadow-none hover:bg-[#EFF1F2] hover:text-[#0d0f1c]"
                onClick={onClear}
                disabled={!hasAppliedFilters}
              >
                <Trash2 className="h-4 w-4" />
                Limpar filtros
              </Button>
            )}
            <Button
              variant="default"
              size="default"
              className="font-bold"
              onClick={onApply}
              disabled={!hasFilterChanges}
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
