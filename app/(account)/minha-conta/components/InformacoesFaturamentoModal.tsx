"use client";

import * as React from "react";
import { Building2 } from "lucide-react";

import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";

export type EmpresaFaturamento = {
  nome: string;
  cnpj: string;
  logradouro: string;
  cidadeEstado: string;
  cep: string;
};

const MOCK_EMPRESAS_FATURAMENTO: EmpresaFaturamento[] = [
  {
    nome: "01 C.JR. - CONSTRUTORA LTDA.",
    cnpj: "03.160.081/0001-85",
    logradouro: "ROD WASHINGTON LUIS, S/N KM 242 CXPST 284 - RURAL",
    cidadeEstado: "São Carlos/SP",
    cep: "13560-970",
  },
  {
    nome: "01 C.JR. - CONSTRUTORA LTDA.",
    cnpj: "03.160.081/0001-85",
    logradouro: "ROD WASHINGTON LUIS, S/N KM 242 CXPST 284 - RURAL",
    cidadeEstado: "São Carlos/SP",
    cep: "13560-970",
  },
  {
    nome: "02 C.JR. - CONSTRUTORA LTDA.",
    cnpj: "03.160.081/0002-66",
    logradouro: "AV. SAO PAULO, 1200 - CENTRO",
    cidadeEstado: "São Carlos/SP",
    cep: "13560-230",
  },
];

type InformacoesFaturamentoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresas?: EmpresaFaturamento[];
};

function EmpresaFaturamentoCard({
  index,
  empresa,
}: {
  index: number;
  empresa: EmpresaFaturamento;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 space-y-3">
      <p className="text-sm font-bold text-[#0d0f1c]">
        {index + 1}- Empresa de faturamento
      </p>
      <p className="text-sm font-semibold text-[#0d0f1c]">{empresa.nome}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-[#5F6572]">CNPJ</p>
          <p className="mt-0.5 text-sm text-[#0d0f1c]">{empresa.cnpj}</p>
        </div>
        <div>
          <p className="text-xs text-[#5F6572]">Logradouro</p>
          <p className="mt-0.5 text-sm text-[#0d0f1c]">{empresa.logradouro}</p>
        </div>
        <div>
          <p className="text-xs text-[#5F6572]">Cidade/Estado</p>
          <p className="mt-0.5 text-sm text-[#0d0f1c]">{empresa.cidadeEstado}</p>
        </div>
        <div>
          <p className="text-xs text-[#5F6572]">CEP</p>
          <p className="mt-0.5 text-sm text-[#0d0f1c]">{empresa.cep}</p>
        </div>
      </div>
    </div>
  );
}

export function InformacoesFaturamentoModal({
  open,
  onOpenChange,
  empresas = MOCK_EMPRESAS_FATURAMENTO,
}: InformacoesFaturamentoModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <ScrollableModal
      open={open}
      onClose={handleClose}
      maxWidth="640px"
      icon={<Building2 className="h-5 w-5 text-[#5B616F]" aria-hidden />}
      title={
        <div className="space-y-1">
          <div className="text-[20px] font-bold leading-tight text-[#0d0f1c]">
            Informações de faturamento
          </div>
          <p className="text-sm font-normal text-[#5F6572]">
            Caso precise alterar entre em contato com o atendimento.
          </p>
        </div>
      }
      actions={
        <div className="flex w-full justify-end">
          <Button type="button" onClick={handleClose}>
            Ok
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {empresas.map((empresa, index) => (
          <EmpresaFaturamentoCard key={`${empresa.cnpj}-${index}`} index={index} empresa={empresa} />
        ))}
      </div>
    </ScrollableModal>
  );
}
