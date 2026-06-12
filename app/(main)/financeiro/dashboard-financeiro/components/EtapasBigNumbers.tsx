"use client";

import * as React from "react";
import { BigNumberCard } from "./BigNumberCard";
import { formatCurrency } from "../utils/formatters";
import { groupByEtapa } from "../utils/calculations";
import { useRouter } from "next/navigation";

interface EtapasBigNumbersProps {
  contas: Array<{
    etapa: string;
    valor: number;
  }>;
  etapasTotais?: {
    [key: string]: { value: number; count: number };
  };
  onNavigate?: (etapa: string) => void;
  selectedCompany?: string | string[];
}

const ETAPAS = [
  { id: "conferir", label: "Conferir" },
  { id: "aprovacao", label: "Aprovar" },
  { id: "pagar", label: "Pagar" },
  { id: "bloqueados", label: "Bloqueados" },
];

export function EtapasBigNumbers({ contas, etapasTotais, onNavigate, selectedCompany }: EtapasBigNumbersProps) {
  const router = useRouter();
  const [selectedEtapa, setSelectedEtapa] = React.useState<string | null>(null);
  const [isWideScreen, setIsWideScreen] = React.useState(false);

  React.useEffect(() => {
    const checkWidth = () => {
      setIsWideScreen(window.innerWidth >= 1650);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const etapaData = React.useMemo(() => {
    // Se etapasTotais foi fornecido, usar diretamente os valores totais (mais preciso)
    if (etapasTotais) {
      return ETAPAS.map(etapa => {
        const total = etapasTotais[etapa.id];
        return {
          ...etapa,
          count: total?.count || 0,
          value: total?.value || 0,
        };
      });
    }
    
    // Fallback: usar groupByEtapa se etapasTotais não foi fornecido
    const grouped = groupByEtapa(contas);
    const map = new Map(grouped.map(e => [e.etapa.toLowerCase(), e]));
    
    return ETAPAS.map(etapa => {
      const data = map.get(etapa.id);
      return {
        ...etapa,
        count: data?.count || 0,
        value: data?.value || 0,
      };
    });
  }, [contas, etapasTotais]);

  const handleClick = (etapaId: string) => {
    setSelectedEtapa(selectedEtapa === etapaId ? null : etapaId);
    if (onNavigate) {
      onNavigate(etapaId);
    } else {
      const params = new URLSearchParams();
      params.set('tab', etapaId);
      if (selectedCompany) {
        const companyParam = Array.isArray(selectedCompany) 
          ? selectedCompany.join(',') 
          : selectedCompany;
        params.set('company', companyParam);
      }
      router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
    }
  };

  return (
    <div 
      className={`grid gap-4 h-full ${isWideScreen ? 'grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}
    >
      {etapaData.map((etapa) => (
        <BigNumberCard
          key={etapa.id}
          value={formatCurrency(etapa.value)}
          label={etapa.label}
          count={etapa.count}
          onClick={() => handleClick(etapa.id)}
          isSelected={selectedEtapa === etapa.id}
          disabled={etapa.count === 0}
        />
      ))}
    </div>
  );
}

