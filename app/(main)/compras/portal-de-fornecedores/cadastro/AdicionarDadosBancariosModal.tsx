"use client";

import * as React from "react";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { FornecedorDadosBancarios } from "./types";

export type DadosBancariosFormState = FornecedorDadosBancarios;

type AdicionarDadosBancariosModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialValues: DadosBancariosFormState;
  onSubmit: (values: DadosBancariosFormState) => Promise<boolean>;
};

const EMPTY_FORM: DadosBancariosFormState = {
  banco: "",
  agencia: "",
  conta: "",
  cnpj: "",
  tipoConta: "",
  metodoTransferencia: "",
};

export function AdicionarDadosBancariosModal({
  open,
  onClose,
  mode,
  initialValues,
  onSubmit,
}: AdicionarDadosBancariosModalProps) {
  const [form, setForm] = React.useState<DadosBancariosFormState>(initialValues);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(initialValues);
      setIsSubmitting(false);
    }
  }, [open, initialValues]);

  const handleChange =
    (field: keyof DadosBancariosFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const isValid =
    form.banco.trim() !== "" &&
    form.agencia.trim() !== "" &&
    form.conta.trim() !== "" &&
    form.cnpj.trim() !== "" &&
    form.tipoConta.trim() !== "" &&
    form.metodoTransferencia.trim() !== "";

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(form);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === "add" ? "Adicionar dados bancários" : "Editar dados bancários";

  return (
    <ScrollableModal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title={title}
      maxWidth="520px"
      preventClose={isSubmitting}
      actions={
        <div className="flex w-full justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="banco" className="text-sm font-semibold text-[#0d0f1c]">
            Banco
          </Label>
          <Input
            id="banco"
            value={form.banco}
            onChange={handleChange("banco")}
            placeholder="001 - Banco do Brasil"
            className="shadow-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="agencia" className="text-sm font-semibold text-[#0d0f1c]">
              Agência
            </Label>
            <Input
              id="agencia"
              value={form.agencia}
              onChange={handleChange("agencia")}
              placeholder="001-4"
              className="shadow-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conta" className="text-sm font-semibold text-[#0d0f1c]">
              Conta
            </Label>
            <Input
              id="conta"
              value={form.conta}
              onChange={handleChange("conta")}
              placeholder="12345-6"
              className="shadow-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpjPagamento" className="text-sm font-semibold text-[#0d0f1c]">
            CNPJ
          </Label>
          <Input
            id="cnpjPagamento"
            value={form.cnpj}
            onChange={handleChange("cnpj")}
            placeholder="00.000.000/0001-00"
            className="shadow-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tipoConta" className="text-sm font-semibold text-[#0d0f1c]">
              Tipo de conta
            </Label>
            <Input
              id="tipoConta"
              value={form.tipoConta}
              onChange={handleChange("tipoConta")}
              placeholder="Conta corrente"
              className="shadow-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metodoTransferencia" className="text-sm font-semibold text-[#0d0f1c]">
              Método de transferência
            </Label>
            <Input
              id="metodoTransferencia"
              value={form.metodoTransferencia}
              onChange={handleChange("metodoTransferencia")}
              placeholder="TED"
              className="shadow-none"
            />
          </div>
        </div>
      </div>
    </ScrollableModal>
  );
}

export function buildEmptyDadosBancariosForm(cnpj: string): DadosBancariosFormState {
  return {
    ...EMPTY_FORM,
    cnpj,
    banco: "001 - Banco do Brasil",
    tipoConta: "Conta corrente",
    metodoTransferencia: "TED",
  };
}
