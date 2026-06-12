"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Building2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AcessosFornecedorTab } from "./AcessosFornecedorTab";
import { ContratosCertidoesTab } from "./ContratosCertidoesTab";
import { DadosGeraisTab } from "./DadosGeraisTab";
import { DadosPagamentoTab } from "./DadosPagamentoTab";
import type { FornecedorRow } from "./types";

const MODAL_TABS = [
  { id: "dados-gerais", label: "Dados gerais" },
  { id: "dados-pagamento", label: "Dados de pagamento" },
  { id: "contratos-certidoes", label: "Anexos" },
  { id: "acessos", label: "Acessos do fornecedor" },
] as const;

type ModalTabId = (typeof MODAL_TABS)[number]["id"];

type VerFornecedorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor: FornecedorRow | null;
  onUpdateFornecedor: (id: number, updates: Partial<FornecedorRow>) => void;
};

const TABS_WITH_GRAY_BG: ModalTabId[] = [
  "dados-gerais",
  "dados-pagamento",
  "contratos-certidoes",
  "acessos",
];

export function VerFornecedorModal({
  open,
  onOpenChange,
  fornecedor,
  onUpdateFornecedor,
}: VerFornecedorModalProps) {
  const [currentTab, setCurrentTab] = React.useState<ModalTabId>("dados-gerais");

  React.useEffect(() => {
    if (open) {
      setCurrentTab("dados-gerais");
    }
  }, [open, fornecedor?.id]);

  if (!fornecedor) return null;

  const title = fornecedor.razaoSocial;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex h-[min(90vh,720px)] w-[calc(100vw-32px)] max-w-[920px] flex-col gap-0 overflow-hidden rounded-[16px] p-0",
          "top-[50%] translate-y-[-50%]",
        )}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogDescription className="sr-only">
          Detalhes do fornecedor {title}, CNPJ {fornecedor.cnpj}
        </DialogDescription>

        <div className="shrink-0 border-b border-[rgba(4,14,35,0.08)] bg-white">
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <div className="flex min-w-0 items-center gap-3">
              <Building2 className="h-5 w-5 shrink-0 text-[#5B616F]" aria-hidden />
              <DialogTitle className="truncate text-[20px] font-bold leading-tight text-[#0d0f1c]">
                {title}
              </DialogTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="px-6" aria-label="Seções do fornecedor">
            <Tabs
              key={`${fornecedor.id}-${open}`}
              tabs={[...MODAL_TABS]}
              value={currentTab}
              onValueChange={(value) => setCurrentTab(value as ModalTabId)}
              variant="product"
              className="w-full"
            />
          </nav>
        </div>

        <div
          role="tabpanel"
          aria-label={MODAL_TABS.find((tab) => tab.id === currentTab)?.label}
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto",
            TABS_WITH_GRAY_BG.includes(currentTab) ? "bg-[#FAFAFB]" : "bg-white",
          )}
        >
          {currentTab === "dados-gerais" && <DadosGeraisTab fornecedor={fornecedor} />}
          {currentTab === "dados-pagamento" && (
            <DadosPagamentoTab
              fornecedor={fornecedor}
              onUpdateFornecedor={onUpdateFornecedor}
            />
          )}
          {currentTab === "contratos-certidoes" && (
            <ContratosCertidoesTab
              fornecedor={fornecedor}
              onUpdateFornecedor={onUpdateFornecedor}
            />
          )}
          {currentTab === "acessos" && (
            <AcessosFornecedorTab
              fornecedor={fornecedor}
              onUpdateFornecedor={onUpdateFornecedor}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
