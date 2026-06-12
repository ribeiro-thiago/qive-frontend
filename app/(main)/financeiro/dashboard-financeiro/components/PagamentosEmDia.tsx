"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BigNumberCard } from "./BigNumberCard";
import { formatCurrency } from "../utils/formatters";
import { parseDate } from "../utils/formatters";
import { useRouter } from "next/navigation";

interface PagamentosEmDiaProps {
  contas: Array<{
    vencimento: string | null;
    dataPagamento?: string;
    valor: number;
    status: string;
  }>;
  onNavigate?: () => void;
  selectedCompany?: string;
}

export function PagamentosEmDia({ contas, onNavigate, selectedCompany }: PagamentosEmDiaProps) {
  const router = useRouter();

  const pagamentosEmDia = React.useMemo(() => {
    return contas.filter(conta => {
      if (conta.status !== 'Pago' || !conta.vencimento || !conta.dataPagamento) {
        return false;
      }
      
      const vencimento = parseDate(conta.vencimento);
      const pagamento = parseDate(conta.dataPagamento);
      
      if (!vencimento || !pagamento) return false;
      
      // Pagamento em dia: data de pagamento <= data de vencimento
      return pagamento.getTime() <= vencimento.getTime();
    });
  }, [contas]);

  const totalValor = pagamentosEmDia.reduce((acc, conta) => acc + conta.valor, 0);
  const totalCount = pagamentosEmDia.length;

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      // Navegar para gestão de pagamentos filtrando pagamentos em dia
      const params = new URLSearchParams();
      params.set('status', 'Pago');
      params.set('pagamentoEmDia', 'true');
      if (selectedCompany) {
        params.set('company', selectedCompany);
      }
      router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
    }
  };

  return (
    <Card className="rounded-xl bg-white border border-border">
      <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
        <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Pagamentos em Dia</h3>
      </div>
      <CardContent>
        <BigNumberCard
          value={formatCurrency(totalValor)}
          label="Total pago no prazo"
          count={totalCount}
          onClick={handleClick}
          disabled={totalCount === 0}
        />
      </CardContent>
    </Card>
  );
}

