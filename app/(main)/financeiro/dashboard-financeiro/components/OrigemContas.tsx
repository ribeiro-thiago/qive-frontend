"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { calculateOrigemProporcao } from "../utils/calculations";
import { formatPercent } from "../utils/formatters";

interface OrigemContasProps {
  contas: Array<{
    origem: string;
  }>;
}

export function OrigemContas({ contas }: OrigemContasProps) {
  const origemData = React.useMemo(() => {
    return calculateOrigemProporcao(contas);
  }, [contas]);

  const total = contas.length;
  const percentualAutomacao = origemData.find(o => o.tipo === "Automática")?.percentual || 0;

  return (
    <Card className="rounded-xl bg-white border border-border">
      <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
        <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Origem das Contas</h3>
      </div>
      <CardContent>
        <div className="space-y-4">
          {/* Indicador de nível de automação */}
          <div className="p-4 rounded-lg border border-border bg-gray-50">
            <div className="text-sm font-semibold text-[#5F6572] mb-2">
              Nível de Automação
            </div>
            <div className="text-2xl font-bold text-[#0d0f1c]">
              {formatPercent(percentualAutomacao)}
            </div>
            <div className="text-xs text-[#5F6572] mt-1">
              {total > 0 ? `${origemData.find(o => o.tipo === "Automática")?.count || 0} de ${total} contas criadas automaticamente` : "Nenhuma conta"}
            </div>
          </div>

          {/* Distribuição Manual vs Automática */}
          <div className="grid grid-cols-2 gap-4">
            {origemData.map((origem) => (
              <div
                key={origem.tipo}
                className="p-4 rounded-lg border border-border"
              >
                <div className="text-sm font-semibold text-[#5F6572] mb-1">
                  {origem.tipo === "Manual" ? "Criação Manual" : "Criação Automática"}
                </div>
                <div className="text-xl font-bold text-[#0d0f1c] mb-1">
                  {origem.count}
                </div>
                <div className="text-xs text-[#5F6572]">
                  {formatPercent(origem.percentual)}
                </div>
                
                {/* Barra de progresso visual */}
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${origem.percentual}%`,
                      backgroundColor: origem.tipo === "Manual" ? "#6366F1" : "#10B981",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

