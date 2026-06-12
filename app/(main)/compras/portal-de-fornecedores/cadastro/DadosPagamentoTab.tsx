"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Banknote, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AdicionarDadosBancariosModal,
  buildEmptyDadosBancariosForm,
  type DadosBancariosFormState,
} from "./AdicionarDadosBancariosModal";
import {
  getFornecedorDadosBancarios,
  hasDadosBancariosCadastrados,
  salvarDadosBancariosFornecedor,
} from "./lib/fornecedor-dados-bancarios";
import type { FornecedorRow } from "./types";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold text-[#8A90A0]">{label}</p>
      <p className="text-sm font-semibold leading-5 text-[#3D4350]">{value}</p>
    </div>
  );
}

type DadosPagamentoTabProps = {
  fornecedor: FornecedorRow;
  onUpdateFornecedor: (id: number, updates: Partial<FornecedorRow>) => void;
};

export function DadosPagamentoTab({ fornecedor, onUpdateFornecedor }: DadosPagamentoTabProps) {
  const [formModalOpen, setFormModalOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"add" | "edit">("add");

  const dadosBancarios = getFornecedorDadosBancarios(fornecedor);
  const hasDados = hasDadosBancariosCadastrados(fornecedor);

  const formInitialValues = React.useMemo((): DadosBancariosFormState => {
    if (formMode === "edit" && dadosBancarios) {
      return { ...dadosBancarios };
    }
    return buildEmptyDadosBancariosForm(fornecedor.cnpj);
  }, [dadosBancarios, formMode, fornecedor.cnpj]);

  const handleOpenAdd = () => {
    setFormMode("add");
    setFormModalOpen(true);
  };

  const handleOpenEdit = () => {
    setFormMode("edit");
    setFormModalOpen(true);
  };

  const handleRemove = () => {
    onUpdateFornecedor(fornecedor.id, {
      dadosPagamento: "Pendente",
      dadosBancarios: null,
    });
    toast.success("Dados bancários removidos.");
  };

  const persistDadosBancarios = async (
    values: DadosBancariosFormState,
    successMessage: string,
  ): Promise<boolean> => {
    const result = await salvarDadosBancariosFornecedor(values.cnpj);

    if (!result.ok) {
      toast.error("Não foi possível adicionar o dado de pagamento. Tente novamente mais tarde.");
      return false;
    }

    onUpdateFornecedor(fornecedor.id, {
      dadosPagamento: "Cadastrados",
      dadosBancarios: values,
    });
    toast.success(successMessage);
    return true;
  };

  const handleSubmitForm = async (values: DadosBancariosFormState) => {
    if (formMode === "add") {
      return persistDadosBancarios(values, "Dado de pagamento adicionados com sucesso.");
    }

    const result = await salvarDadosBancariosFornecedor(values.cnpj);
    if (!result.ok) {
      toast.error("Não foi possível adicionar o dado de pagamento. Tente novamente mais tarde.");
      return false;
    }

    onUpdateFornecedor(fornecedor.id, {
      dadosPagamento: "Cadastrados",
      dadosBancarios: values,
    });
    toast.success("Dados bancários atualizados com sucesso.");
    return true;
  };

  return (
    <>
      <div className="flex-1 p-4">
        <section className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
          <div className="flex items-center gap-2 border-b border-[rgba(4,14,35,0.08)] px-4 py-3">
            <Banknote className="h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
            <h3 className="text-sm font-bold text-[#0d0f1c]">Dados de pagamento cadastrados</h3>
          </div>

          <div className="p-4">
            {!hasDados || !dadosBancarios ? (
              <div className="space-y-4">
                <p className="text-sm text-[#5B616F]">
                  Você ainda não adicionou nenhum dado de pagamento para esse fornecedor.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 gap-2 px-4"
                  onClick={handleOpenAdd}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar dados bancários
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-[#0d0f1c]">Dados bancários</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 gap-2 px-3"
                      onClick={handleOpenEdit}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className={cn("h-8 gap-2 px-3")}
                      onClick={handleRemove}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-4">
                    <InfoField label="Banco" value={dadosBancarios.banco} />
                    <InfoField label="CNPJ" value={dadosBancarios.cnpj} />
                  </div>
                  <div className="space-y-4">
                    <InfoField label="Agência" value={dadosBancarios.agencia} />
                    <InfoField label="Tipo de conta" value={dadosBancarios.tipoConta} />
                  </div>
                  <div className="space-y-4">
                    <InfoField label="Conta" value={dadosBancarios.conta} />
                    <InfoField
                      label="Método de transferência"
                      value={dadosBancarios.metodoTransferencia}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <AdicionarDadosBancariosModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formMode}
        initialValues={formInitialValues}
        onSubmit={handleSubmitForm}
      />
    </>
  );
}
