"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";

export type Company = {
  id: string;
  full: string; // Texto completo para exibir no dropdown
  short: string; // Texto resumido para exibir no botão
  cnpj?: string; // CNPJ da empresa (para filtro)
};

type CompanySelectorProps = {
  className?: string;
  value?: string | string[];
  onValueChange?: (value: string[]) => void;
  multiCompanySelectionEnabled?: boolean;
};

export const companies: Company[] = [
  {
    id: "all",
    full: "Todas as empresas",
    short: "Todas as empresas",
  },
  {
    id: "matriz",
    full: "Qive Tecnologia LTDA - Matriz [SP] [12.345.678/0001-90]",
    short: "Qive Tecnologia LTDA [12.345.678/0001-90]",
    cnpj: "12.345.678/0001-90",
  },
  {
    id: "filial1",
    full: "Qive Tecnologia LTDA - Filial 1 [SP] [12.345.678/0002-71]",
    short: "Qive Tecnologia LTDA [12.345.678/0002-71]",
    cnpj: "12.345.678/0002-71",
  },
];

// Função para extrair apenas o nome da empresa (sem CNPJ)
function getCompanyDisplayName(company: Company): string {
  if (company.id === "all") {
    return company.full;
  }
  
  // Remover o CNPJ que está no final entre colchetes
  // Exemplo: "Qive Tecnologia LTDA - Matriz [SP] [12.345.678/0001-90]" -> "Qive Tecnologia LTDA - Matriz [SP]"
  const full = company.full;
  // Remove o último padrão [CNPJ] do final (formato: [XX.XXX.XXX/XXXX-XX])
  // Procura por um padrão de CNPJ no final: [dígitos com pontos, barra e hífen]
  const cnpjPattern = /\s*\[\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\]\s*$/;
  const withoutCnpj = full.replace(cnpjPattern, '');
  return withoutCnpj.trim() || company.full; // fallback para o full se não conseguir remover
}

// Função para truncar texto no meio quando necessário
function truncateMiddle(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  if (maxLength <= 3) {
    return text.slice(0, maxLength);
  }
  
  // Calcular quantos caracteres mostrar no início e no fim
  const startLength = Math.floor((maxLength - 3) / 2); // -3 para o "..."
  const endLength = maxLength - startLength - 3;
  
  return `${text.slice(0, startLength)}...${text.slice(-endLength)}`;
}

export function CompanySelector({ className, value = ["all"], onValueChange, multiCompanySelectionEnabled = true }: CompanySelectorProps) {
  // Filtrar empresas baseado na feature
  const availableCompanies = React.useMemo(() => {
    if (multiCompanySelectionEnabled) {
      return companies;
    }
    // Quando desabilitado, remove "Todas as empresas" e retorna apenas empresas individuais
    return companies.filter(c => c.id !== "all");
  }, [multiCompanySelectionEnabled]);
  
  // Normalizar valor para array
  const selectedIds = React.useMemo(() => {
    if (!value || value.length === 0) return ["all"];
    return Array.isArray(value) ? value : [value];
  }, [value]);
  
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const preventOpenRef = React.useRef(false);
  const [visibleChips, setVisibleChips] = React.useState<{ company: Company; index: number; displayText?: string }[]>([]);
  const [remainingCount, setRemainingCount] = React.useState(0);
  
  // Interceptar eventos de pointer/mouse no documento para prevenir abertura do dropdown quando clicar no X
  React.useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      
      // Se o clique foi no botão X (ou em um elemento dentro dele), prevenir abertura do dropdown
      const xButton = target.closest('button[type="button"]');
      if (xButton && xButton !== button && button.contains(xButton)) {
        preventOpenRef.current = true;
        e.stopPropagation();
        e.preventDefault();
        setOpen(false);
        
        // Limpar a flag após um pequeno delay
        setTimeout(() => {
          preventOpenRef.current = false;
        }, 200);
      }
    };
    
    // Interceptar no documento com capture para pegar antes do Radix UI
    document.addEventListener('pointerdown', handlePointerDown, true);
    
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, []);
  
  // Determinar empresas selecionadas
  const selectedCompanies = React.useMemo(() => {
    // Se "all" está selecionado, retornar apenas "all"
    if (selectedIds.includes("all")) {
      return [companies.find(c => c.id === "all")!];
    }
    
    // Verificar se todas as empresas individuais estão selecionadas
    const individualCompanies = availableCompanies.filter(c => c.id !== "all");
    const selectedIndividual = individualCompanies.filter(c => selectedIds.includes(c.id));
    
    // Se todas as empresas individuais estão selecionadas, retornar "all"
    if (selectedIndividual.length === individualCompanies.length && individualCompanies.length > 0) {
      return [companies.find(c => c.id === "all")!];
    }
    
    // Caso contrário, retornar empresas selecionadas
    return availableCompanies.filter(c => selectedIds.includes(c.id));
  }, [selectedIds, availableCompanies]);
  
  // Função para calcular chips visíveis
  const calculateVisibleChips = React.useCallback(() => {
    // Se "Todas as empresas" está selecionada, não precisa calcular chips
    if (selectedCompanies.length === 1 && selectedCompanies[0]?.id === "all") {
      setVisibleChips([]);
      setRemainingCount(0);
      return;
    }
    
    if (!buttonRef.current) {
      // Se não há referência, mostrar todas (será recalculado quando houver)
      const individualCompanies = selectedCompanies.filter(c => c.id !== "all");
      setVisibleChips(individualCompanies.map((company, index) => ({ company, index })));
      setRemainingCount(0);
      return;
    }
    
    const button = buttonRef.current;
    const buttonWidth = button.offsetWidth || 400; // fallback para 400px
    const iconWidth = 16; // Building2 icon
    const chevronWidth = 16; // ChevronDown icon
    const padding = 24; // padding interno
    const gap = 8; // gap entre chips
    const availableWidth = buttonWidth - iconWidth - chevronWidth - padding - gap * 2;
    
    // Calcular quantos chips cabem
    const chips: { company: Company; index: number; displayText: string }[] = [];
    let totalWidth = 0;
    const individualCompanies = selectedCompanies.filter(c => c.id !== "all");
    
      // A primeira empresa sempre deve aparecer
      if (individualCompanies.length > 0) {
        const firstCompany = individualCompanies[0];
        let firstDisplayName = getCompanyDisplayName(firstCompany);
        const firstTextWidth = firstDisplayName.length * 8;
        let firstChipWidth = firstTextWidth + 56 + gap; // 56px para padding, ícone X e espaçamentos
        
        // Se a primeira empresa não cabe completamente, truncar no meio
        if (firstChipWidth > availableWidth) {
          // Calcular quantos caracteres cabem (reservando espaço para padding, ícone X e gap)
          const maxTextWidth = availableWidth - 56 - gap;
          const maxChars = Math.max(10, Math.floor(maxTextWidth / 8)); // Mínimo de 10 caracteres
          firstDisplayName = truncateMiddle(firstDisplayName, maxChars);
          // Recalcular largura com o texto truncado
          firstChipWidth = firstDisplayName.length * 8 + 56 + gap;
        }
        
        chips.push({ company: firstCompany, index: 0, displayText: firstDisplayName });
        totalWidth = firstChipWidth;
      
      // Tentar adicionar mais empresas se houver espaço
      for (let i = 1; i < individualCompanies.length; i++) {
        const company = individualCompanies[i];
        if (!company) continue;
        
        const displayName = getCompanyDisplayName(company);
        const textWidth = displayName.length * 8;
        const chipWidth = textWidth + 56 + gap; // 56px para padding, ícone X e espaçamentos
        
        // Reservar espaço para o chip "+N" se necessário (estimativa: ~40px)
        const remainingChipWidth = individualCompanies.length - i > 1 ? 40 + gap : 0;
        
        if (totalWidth + chipWidth + remainingChipWidth <= availableWidth) {
          chips.push({ company, index: i, displayText: displayName });
          totalWidth += chipWidth;
        } else {
          // Não cabe mais, calcular quantos restam
          const remaining = individualCompanies.length - chips.length;
          setVisibleChips(chips);
          setRemainingCount(remaining);
          return;
        }
      }
    }
    
    setVisibleChips(chips);
    setRemainingCount(0);
  }, [selectedCompanies]);
  
  // Calcular chips visíveis quando empresas mudam
  React.useEffect(() => {
    calculateVisibleChips();
  }, [calculateVisibleChips]);
  
  // Recalcular quando o botão muda de tamanho
  React.useEffect(() => {
    if (!buttonRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleChips();
    });
    
    resizeObserver.observe(buttonRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateVisibleChips]);
  
  // Sincronizar com valor externo
  React.useEffect(() => {
    if (!multiCompanySelectionEnabled && selectedIds.includes("all")) {
      const firstAvailable = availableCompanies.find(c => c.id !== "all");
      if (firstAvailable) {
        onValueChange?.([firstAvailable.id]);
      }
    }
  }, [multiCompanySelectionEnabled, selectedIds, availableCompanies, onValueChange]);
  
  const handleToggleCompany = (companyId: string) => {
    let newSelection: string[];
    
    if (companyId === "all") {
      // Se "all" está selecionado, deselecionar todas as empresas individuais
      newSelection = ["all"];
    } else {
      // Remover "all" se estiver selecionado
      const withoutAll = selectedIds.filter(id => id !== "all");
      
      if (withoutAll.includes(companyId)) {
        // Deselecionar empresa
        newSelection = withoutAll.filter(id => id !== companyId);
      } else {
        // Selecionar empresa
        newSelection = [...withoutAll, companyId];
      }
      
      // Se todas as empresas individuais estão selecionadas, usar "all"
      const individualCompanies = availableCompanies.filter(c => c.id !== "all");
      if (newSelection.length === individualCompanies.length && individualCompanies.length > 0) {
        newSelection = ["all"];
      }
      
      // Se nenhuma empresa está selecionada, usar "all"
      if (newSelection.length === 0) {
        newSelection = ["all"];
      }
    }
    
    onValueChange?.(newSelection);
  };
  
  const handleRemoveCompany = React.useCallback((e: React.MouseEvent | React.PointerEvent, companyId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Prevenir abertura do dropdown
    preventOpenRef.current = true;
    
    // Fechar o dropdown imediatamente
    setOpen(false);
    
    // Remover a empresa selecionada
    const withoutAll = selectedIds.filter(id => id !== "all");
    let newSelection = withoutAll.filter(id => id !== companyId);

    // Se não sobrar nenhuma empresa selecionada, selecionar "Todas as empresas"
    if (newSelection.length === 0) {
      newSelection = ["all"];
    } else {
      // Verificar se todas as empresas individuais estão selecionadas, usar "all"
      const individualCompanies = availableCompanies.filter(c => c.id !== "all");
      if (newSelection.length === individualCompanies.length && individualCompanies.length > 0) {
        newSelection = ["all"];
      }
    }
    
    // Atualizar o estado
    onValueChange?.(newSelection);
    
    // Limpar a flag após um pequeno delay
    setTimeout(() => {
      preventOpenRef.current = false;
    }, 200);
  }, [selectedIds, availableCompanies, onValueChange]);
  
  const displayText = selectedCompanies.length === 1 && selectedCompanies[0]?.id === "all"
    ? "Todas as empresas"
    : null;
  
  return (
    <div className={cn("", className)}>
      <DropdownMenu open={open} onOpenChange={(newOpen) => {
        // Se estamos prevenindo a abertura, não abrir
        if (newOpen && preventOpenRef.current) {
          preventOpenRef.current = false;
          return;
        }
        setOpen(newOpen);
      }} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="h-9 w-[400px] justify-between rounded-lg bg-white text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2]"
          >
            <span className="inline-flex items-center gap-2 overflow-hidden flex-1 min-w-0">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {displayText ? (
                <span className="text-sm truncate">{displayText}</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 scrollbar-hide">
                  {visibleChips.map(({ company, index, displayText }) => {
                    const isTruncated = displayText !== getCompanyDisplayName(company);
                    
                    return (
                      <Tag
                        key={company.id}
                        className="flex-shrink-0 bg-[#EFF1F2] text-[#0d0f1c] border-[#E5E7EB] h-6 text-xs"
                      >
                        <span className={isTruncated ? "" : "truncate max-w-[200px]"}>{displayText}</span>
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleRemoveCompany(e as any, company.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleRemoveCompany(e, company.id);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          className="ml-1.5 hover:bg-[#D1D5DB] rounded-full p-0.5 transition-colors z-10 relative"
                          aria-label={`Remover ${getCompanyDisplayName(company)}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Tag>
                    );
                  })}
                  {remainingCount > 0 && (
                    <Tag className="flex-shrink-0 bg-[#EFF1F2] text-[#0d0f1c] border-[#E5E7EB] h-6 text-xs">
                      +{remainingCount}
                    </Tag>
                  )}
                </span>
              )}
            </span>
            <ChevronDown className={cn("h-4 w-4 text-[#0d0f1c] transition-transform flex-shrink-0", open ? "rotate-180" : "rotate-0")} aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[400px] border-0 max-h-80 overflow-y-auto">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Empresas</DropdownMenuLabel>
          {availableCompanies.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={isSelected}
                onCheckedChange={() => handleToggleCompany(c.id)}
                className="gap-2 pl-8"
              >
                <span className="absolute left-2 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                  />
                </span>
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1">{c.full}</span>
              </DropdownMenuCheckboxItem>
            );
          })}
          {selectedIds.length > 0 && !selectedIds.includes("all") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => onValueChange?.(["all"])}
                className="gap-2 text-muted-foreground"
              >
                <span>Limpar seleção</span>
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
