"use client";

import { Loader2 } from "lucide-react";
import { useTheme } from "@/lib/theme/useTheme";
import { cn } from "@/lib/utils";

interface StatusTagProps {
  value?: string;
}

export function StatusTag({ value }: StatusTagProps) {
  const { tagModel, openAccountTagColor } = useTheme();
  
  if (!value) return <span className="text-xs text-muted-foreground">—</span>;
  
  const isCompact = tagModel === 'compact';

  // Classes de cores para "Aberto" baseado na configuração de tema
  const getAbertoClasses = () => {
    if (openAccountTagColor === 'orange') {
      return isCompact
        ? 'bg-[#FFD294] text-[#B85600]'
        : 'bg-[#FFD294] text-[#B85600] border-[#FFD294]';
    } else {
      // Azul (padrão)
      return isCompact
        ? 'bg-[#E7EEFF] text-[#0C3CF7]'
        : 'bg-[#E7EEFF] text-[#0C3CF7] border-[#B8CCFF]';
    }
  };

  // Classes de cores - sem borda no modelo compacto
  const cls =
    value === 'Pago'
      ? isCompact
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : value === 'Vencido'
      ? isCompact
        ? 'bg-[#F8B9B4] text-[#B9221D]'
        : 'bg-[#F8B9B4] text-[#B9221D] border-[#F8B9B4]'
      : value === 'Aberto'
      ? getAbertoClasses()
      : value === 'Processando'
      ? isCompact
        ? 'bg-[#E6F3FD] text-[#003F70]'
        : 'bg-[#E6F3FD] text-[#003F70] border-[#A8D5F7]'
      : value === 'Aguardando'
      ? isCompact
        ? 'bg-[#F7F8F9] text-[#5F6572]'
        : 'bg-[#F7F8F9] text-[#5F6572] border-[#EAEBEC]'
      : isCompact
        ? 'bg-gray-100 text-gray-600'
        : 'bg-gray-100 text-gray-600 border-gray-200';
      
  return (
    <span className={cn(
      'inline-flex items-center text-xs',
      isCompact
        ? 'h-5 py-[2px] px-2 rounded font-bold leading-4'
        : 'h-6 px-2 rounded-full border font-medium',
      cls,
    )}>
      {value === 'Processando' ? (
        <>
          <Loader2 className={cn("h-3.5 w-3.5 animate-spin", isCompact ? "mr-1" : "mr-1")} />
          {value}
        </>
      ) : (
        value
      )}
    </span>
  );
}

