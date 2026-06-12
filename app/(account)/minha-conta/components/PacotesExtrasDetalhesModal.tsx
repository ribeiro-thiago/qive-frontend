"use client";

import { Box } from "lucide-react";

import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import { cn } from "@/lib/utils";

const MOCK_DFES_CONSUMO = [
  { tipo: "NFe Recebida", detalhe: "99" },
  { tipo: "NFSe Recebida", detalhe: "49" },
  { tipo: "CTe Tomador", detalhe: "9" },
  { tipo: "Consumo de Cupom", detalhe: "93 de 1000" },
];

const MOCK_PACOTES_EXTRAS = [
  { pacote: "Recuperar Notas", detalhe: "Recuperar Notas 1 - Até 100" },
  { pacote: "Recuperar Notas", detalhe: "Recuperar Notas 1 - Até 100" },
  { pacote: "Recuperar Notas", detalhe: "Recuperar Notas 1 - Até 100" },
];

type PacotesExtrasDetalhesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailsTable<T extends { id: string }>({
  col1Label,
  col2Label,
  rows,
  getCol1,
  getCol2,
}: {
  col1Label: string;
  col2Label: string;
  rows: T[];
  getCol1: (row: T) => string;
  getCol2: (row: T) => string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className={TABLE_HEAD_ROW_CLASS}>
            <th className={TABLE_HEAD_CELL_CLASS}>{col1Label}</th>
            <th className={TABLE_HEAD_CELL_CLASS}>{col2Label}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={TABLE_BODY_ROW_CLASS}>
              <td className={cn(TABLE_BODY_CELL_CLASS, TABLE_PRIMARY_TEXT_CLASS)}>
                {getCol1(row)}
              </td>
              <td className={cn(TABLE_BODY_CELL_CLASS, TABLE_PRIMARY_TEXT_CLASS)}>
                {getCol2(row)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PacotesExtrasDetalhesModal({
  open,
  onOpenChange,
}: PacotesExtrasDetalhesModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const dfesRows = MOCK_DFES_CONSUMO.map((row, index) => ({
    id: `dfe-${index}`,
    ...row,
  }));

  const pacotesRows = MOCK_PACOTES_EXTRAS.map((row, index) => ({
    id: `pacote-${index}`,
    ...row,
  }));

  return (
    <ScrollableModal
      open={open}
      onClose={handleClose}
      maxWidth="640px"
      icon={<Box className="h-5 w-5 text-[#5B616F]" aria-hidden />}
      title="Pacotes extras e detalhes"
      actions={
        <div className="flex w-full justify-end">
          <Button type="button" onClick={handleClose}>
            Ok
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <DetailsTable
          col1Label="DFes"
          col2Label="Detalhes do consumo"
          rows={dfesRows}
          getCol1={(row) => row.tipo}
          getCol2={(row) => row.detalhe}
        />

        <DetailsTable
          col1Label="Pacotes extras"
          col2Label="Detalhes do consumo"
          rows={pacotesRows}
          getCol1={(row) => row.pacote}
          getCol2={(row) => row.detalhe}
        />
      </div>
    </ScrollableModal>
  );
}
