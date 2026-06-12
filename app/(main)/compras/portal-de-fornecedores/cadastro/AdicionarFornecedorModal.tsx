"use client";

import * as React from "react";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Building2, Loader2, SearchX } from "lucide-react";
import { toast } from "sonner";
import {
  cnpjMatches,
  formatCnpjInput,
  isAcceptableCnpj,
  isCnpjComplete,
} from "./lib/cnpj";
import { lookupFornecedorByCnpj } from "./data/mock-fornecedor-lookup";
import type { FornecedorCadastroLookup, FornecedorRow } from "./types";

type ModalStep = "search" | "loading" | "review" | "not_found" | "duplicate" | "error";

type AdicionarFornecedorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRows: FornecedorRow[];
  onAddFornecedor: (row: FornecedorRow) => void;
};

const CNAE_DESCRICAO =
  "Serviços de manutenção e reparação mecânica de veículos automotores";

function formatTodayPtBr(): string {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function lookupToRow(data: FornecedorCadastroLookup, nextId: number): FornecedorRow {
  return {
    id: nextId,
    cnpj: data.cnpj,
    razaoSocial: data.razaoSocial,
    nomeFantasia: data.nomeFantasia,
    comproCgsIss: [],
    dadosPagamento: "Pendente",
    situacaoCadastral: data.situacaoCadastral,
    acessoPortal: "-",
    regimeTributario: data.regimeTributario,
    localizacao: data.localizacao,
    telefone: data.telefone,
    ultimaCompra: "—",
    valorComprado: "R$ 0,00",
    qtdNotas: 0,
    recorrencia: data.recorrencia,
    cnaeCodigo: "4520001",
    cnaeDescricao: CNAE_DESCRICAO,
    ultimaAtualizacaoReceita: formatTodayPtBr(),
  };
}

function ReviewField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-[#8A90A0]">{label}</p>
      <p
        className={`text-sm text-[#3D4350] ${highlight ? "font-semibold text-[#0d0f1c]" : "font-medium"}`}
      >
        {value}
      </p>
    </div>
  );
}

export function AdicionarFornecedorModal({
  open,
  onOpenChange,
  existingRows,
  onAddFornecedor,
}: AdicionarFornecedorModalProps) {
  const cnpjInputRef = React.useRef<HTMLInputElement>(null);
  const [cnpj, setCnpj] = React.useState("");
  const [step, setStep] = React.useState<ModalStep>("search");
  const [lookupData, setLookupData] = React.useState<FornecedorCadastroLookup | null>(null);
  const [cnpjTouched, setCnpjTouched] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const resetState = React.useCallback(() => {
    setCnpj("");
    setStep("search");
    setLookupData(null);
    setCnpjTouched(false);
    setIsSubmitting(false);
  }, []);

  React.useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      cnpjInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, resetState]);

  const isComplete = isCnpjComplete(cnpj);
  const isAcceptable = isAcceptableCnpj(cnpj);
  const showInvalidCnpj = cnpjTouched && isComplete && !isAcceptable;
  const isDuplicateInList = existingRows.some((row) => cnpjMatches(row.cnpj, cnpj));

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCnpjInput(e.target.value));
    if (step === "not_found" || step === "duplicate" || step === "error") {
      setStep("search");
    }
    if (lookupData) {
      setLookupData(null);
    }
  };

  const handleClose = () => {
    if (isSubmitting || step === "loading") return;
    onOpenChange(false);
  };

  const runLookup = async () => {
    if (!isAcceptable || isSubmitting) return;

    setCnpjTouched(true);

    if (isDuplicateInList) {
      setStep("duplicate");
      toast.error("Este fornecedor já está cadastrado.");
      return;
    }

    setStep("loading");
    setIsSubmitting(true);

    try {
      const result = await lookupFornecedorByCnpj(cnpj);

      if (result.status === "error") {
        setStep("error");
        return;
      }

      if (result.status === "not_found") {
        setStep("not_found");
        return;
      }

      setLookupData(result.data);
      setStep("review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!lookupData || isSubmitting) return;

    if (existingRows.some((row) => cnpjMatches(row.cnpj, lookupData.cnpj))) {
      setStep("duplicate");
      toast.error("Este fornecedor já está cadastrado.");
      return;
    }

    const nextId = existingRows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    onAddFornecedor(lookupToRow(lookupData, nextId));
    onOpenChange(false);
    toast.success("Fornecedor adicionado com sucesso!");
  };

  const handlePrimaryAction = () => {
    if (step === "review") {
      handleConfirmAdd();
      return;
    }
    if (step === "search") {
      void runLookup();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePrimaryAction();
  };

  const description =
    step === "review"
      ? "Revise os dados do fornecedor antes de adicionar."
      : "Insira o CNPJ do fornecedor que deseja adicionar, iremos realizar a busca dos dados cadastrais.";

  const primaryDisabled =
    step === "loading" ||
    isSubmitting ||
    step === "not_found" ||
    step === "duplicate" ||
    step === "error" ||
    (step === "search" && (!isAcceptable || !isComplete)) ||
    (step === "review" && !lookupData);

  const primaryLabel = step === "review" ? "Adicionar" : "Adicionar";

  const preventClose = step === "loading" || isSubmitting;

  return (
    <ScrollableModal
      open={open}
      onClose={handleClose}
      title="Adicionar fornecedor"
      maxWidth="600px"
      showClose={!preventClose}
      preventClose={preventClose}
      actions={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={preventClose}
            className="font-bold"
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePrimaryAction}
            disabled={primaryDisabled}
            className="font-bold"
          >
            {step === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {primaryLabel}
          </Button>
        </>
      }
    >
      <form onSubmit={handleFormSubmit} className="space-y-5">
        <p className="text-sm text-[#5B616F]">{description}</p>

        <div className="space-y-2">
          <Label htmlFor="cnpj-fornecedor" className="text-sm font-bold text-[#3D4350]">
            CNPJ do fornecedor<span className="text-[#DC2626]">*</span>
          </Label>
          <Input
            ref={cnpjInputRef}
            id="cnpj-fornecedor"
            placeholder="Digite o CNPJ"
            value={cnpj}
            onChange={handleCnpjChange}
            onBlur={() => setCnpjTouched(true)}
            disabled={step === "loading" || isSubmitting}
            aria-invalid={showInvalidCnpj || step === "duplicate"}
            aria-describedby={
              showInvalidCnpj
                ? "cnpj-error"
                : step === "duplicate"
                  ? "cnpj-duplicate"
                  : step === "not_found"
                    ? "cnpj-not-found"
                    : step === "error"
                      ? "cnpj-general-error"
                      : undefined
            }
            className={
              showInvalidCnpj || step === "duplicate"
                ? "border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-[#DC2626]"
                : undefined
            }
          />
          {showInvalidCnpj && (
            <p id="cnpj-error" className="text-xs text-[#DC2626]">
              Informe um CNPJ válido.
            </p>
          )}
        </div>

        {step === "loading" && (
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] px-6 py-10"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#0C3CF7]" aria-hidden />
            <p className="text-sm font-medium text-[#3D4350]">Buscando dados cadastrais...</p>
          </div>
        )}

        {step === "duplicate" && (
          <div
            id="cnpj-duplicate"
            className="flex gap-3 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#C2410C]" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#0d0f1c]">Este fornecedor já está cadastrado.</p>
              <p className="text-sm text-[#5B616F]">
                Verifique a lista de fornecedores ou informe outro CNPJ.
              </p>
            </div>
          </div>
        )}

        {step === "error" && (
          <div
            id="cnpj-general-error"
            className="flex gap-3 rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-4 py-3"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#0d0f1c]">
                Não foi possível adicionar o fornecedor. Tente novamente.
              </p>
              <p className="text-sm text-[#5B616F]">
                Revise o CNPJ informado ou tente novamente em instantes.
              </p>
            </div>
          </div>
        )}

        {step === "not_found" && (
          <div
            id="cnpj-not-found"
            className="flex flex-col items-center gap-3 rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] px-6 py-8 text-center"
            role="status"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6]">
              <SearchX className="h-7 w-7 text-[#8A90A0]" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-[#0d0f1c]">Nenhum fornecedor encontrado</p>
              <p className="text-sm text-[#5B616F]">Revise o CNPJ informado e tente novamente.</p>
            </div>
          </div>
        )}

        {step === "review" && lookupData && (
          <div className="space-y-3 rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] p-4">
            <div className="flex items-center gap-2 border-b border-[rgba(4,14,35,0.08)] pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF]">
                <Building2 className="h-5 w-5 text-[#0C3CF7]" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium text-[#8A90A0]">Razão social</p>
                <p className="text-sm font-semibold text-[#0d0f1c]">{lookupData.razaoSocial}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewField label="Nome fantasia" value={lookupData.nomeFantasia} />
              <ReviewField label="CNPJ" value={lookupData.cnpj} highlight />
              <ReviewField label="Data de abertura" value={lookupData.dataAbertura} />
              <ReviewField label="Matriz ou filial" value={lookupData.matrizFilial} />
              <ReviewField
                label="Situação cadastral"
                value={lookupData.situacaoCadastral}
                highlight
              />
              <ReviewField label="Natureza jurídica" value={lookupData.naturezaJuridica} />
              <ReviewField
                label="Regime tributário"
                value={lookupData.regimeTributario}
                highlight
              />
            </div>
          </div>
        )}
      </form>
    </ScrollableModal>
  );
}
