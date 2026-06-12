"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Tag } from "@/components/ui/tag";
import { Row } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { getCbsPrevistoValue } from "../../utils/cbs-previsto";

const CBS_TOOLTIP_TEXT =
  "Este valor reflete a tag <CBS> identificada no XML da notas vinculada à conta a pagar. Os valores zerados correspondem a casos em que a tag <CBS> não foi preenchida no XML.";

const CBS_DISCLAIMER =
  "Esse valor é uma previsão e não indica crédito liberado, validado ou apurado oficialmente pela Receita Federal.";

interface ReformaTributariaSectionProps {
  row: Row;
}

export function ReformaTributariaSection({ row }: ReformaTributariaSectionProps) {
  const cbsPrevisto = getCbsPrevistoValue(row);

  return (
    <div className="relative z-10 rounded-lg border border-border bg-white">
      <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px]">
        <h3 className="text-sm font-semibold text-[#0d0f1c]">Reforma Tributária</h3>
        <Tag
          bgColor="bg-[#E7EEFF]"
          textColor="text-[#0C3CF7]"
          borderColor="border-[#B8CCFF]"
        >
          Novo
        </Tag>
      </div>
      <div className="flex flex-col">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#5F6572]">
              Crédito previsto de CBS
            </span>
            <div className="group relative">
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-[#E7EEFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-1"
                aria-label="Informações sobre crédito previsto de CBS"
              >
                <Info className="h-4 w-4 text-[#5F6572]" />
              </button>
              <div className="pointer-events-none invisible absolute left-0 top-6 z-50 w-80 rounded-md border border-[#EBECEE] bg-white p-3 opacity-0 shadow-lg transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
                <p className="text-xs font-normal leading-relaxed text-[#5F6572]">
                  {CBS_TOOLTIP_TEXT}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-[1cap] w-1.5 shrink-0 rounded-full bg-[#0C3CF7]"
              aria-hidden
            />
            <span className="text-xl font-bold leading-7 text-[rgba(4,14,35,0.88)]">
              {formatCurrency(cbsPrevisto)}
            </span>
          </div>
        </div>
        <div className="border-t border-[#EBECEE] px-4 py-3">
          <p className="text-xs leading-5 text-[#5F6572]">{CBS_DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
