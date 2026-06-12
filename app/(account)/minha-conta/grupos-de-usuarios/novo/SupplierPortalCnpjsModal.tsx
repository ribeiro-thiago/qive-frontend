"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import {
  cnpjMatches,
  formatCnpjOrCpf,
  formatCnpjOrCpfInput,
  isValidCnpjOrCpf,
  normalizeCnpj,
} from "@/app/(main)/compras/portal-de-fornecedores/cadastro/lib/cnpj";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import {
  GRUPO_MODAL_BODY_CLASS,
  GRUPO_MODAL_CANCEL_BUTTON_CLASS,
  GRUPO_MODAL_CLOSE_BUTTON_CLASS,
  GRUPO_MODAL_CONTENT_CLASS,
  GRUPO_MODAL_FOOTER_CLASS,
  GRUPO_MODAL_HEADER_CLASS,
  GRUPO_MODAL_SAVE_BUTTON_CLASS,
  GRUPO_MODAL_TITLE_CLASS,
} from "./grupo-modal-styles";

const PAGE_SIZE = 5;

export type SupplierPortalCnpjsSaveResult = {
  cnpjs: string[];
  allSuppliersSelected: boolean;
};

function formatCnpjList(cnpjs: string[]): string[] {
  return cnpjs
    .map((cnpj) => formatCnpjOrCpf(cnpj))
    .filter((cnpj) => normalizeCnpj(cnpj).length > 0);
}

type SupplierPortalCnpjsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cnpjs: string[];
  allSuppliersSelected: boolean;
  onSave: (result: SupplierPortalCnpjsSaveResult) => void;
};

export function SupplierPortalCnpjsModal({
  open,
  onOpenChange,
  cnpjs,
  allSuppliersSelected,
  onSave,
}: SupplierPortalCnpjsModalProps) {
  const [draftCnpjs, setDraftCnpjs] = React.useState<string[]>([]);
  const [draftAllSuppliersSelected, setDraftAllSuppliersSelected] = React.useState(true);
  const [inputValue, setInputValue] = React.useState("");
  const [inputError, setInputError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(0);
  const wasOpenRef = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;

    if (!justOpened) return;

    const formattedCnpjs = formatCnpjList(cnpjs);
    setDraftCnpjs(formattedCnpjs);
    setDraftAllSuppliersSelected(
      formattedCnpjs.length === 0 ? allSuppliersSelected : false
    );
    setInputValue("");
    setInputError(null);
    setCurrentPage(0);
  }, [open, cnpjs, allSuppliersSelected]);

  const totalItems = draftCnpjs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const clampedPage = Math.min(currentPage, totalPages - 1);
  const pageStart = clampedPage * PAGE_SIZE;
  const pageItems = draftCnpjs.slice(pageStart, pageStart + PAGE_SIZE);
  const showingFrom = totalItems === 0 ? 0 : pageStart + 1;
  const showingTo = Math.min(totalItems, pageStart + PAGE_SIZE);
  const hasPrevPage = clampedPage > 0;
  const hasNextPage = clampedPage < totalPages - 1;
  const showPagination = !draftAllSuppliersSelected && totalItems > 0;

  const handleToggleAllSuppliers = (checked: boolean) => {
    setDraftAllSuppliersSelected(checked);
    if (checked) {
      setDraftCnpjs([]);
      setCurrentPage(0);
    }
  };

  const handleAddCnpj = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (!isValidCnpjOrCpf(trimmed)) {
      setInputError("CNPJ / CPF inválido");
      return;
    }

    const formatted = formatCnpjOrCpf(trimmed);
    const isDuplicate = draftCnpjs.some((cnpj) => cnpjMatches(cnpj, formatted));

    if (isDuplicate) {
      setInputError("CNPJ / CPF já adicionado");
      return;
    }

    setInputError(null);
    setDraftAllSuppliersSelected(false);
    setDraftCnpjs((current) => [...current, formatted]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleDeleteCnpj = (cnpjToRemove: string) => {
    setDraftCnpjs((current) => {
      const next = current.filter((cnpj) => !cnpjMatches(cnpj, cnpjToRemove));
      const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setCurrentPage((page) => Math.min(page, nextTotalPages - 1));
      return next;
    });
  };

  const handleSave = () => {
    onSave({
      cnpjs: draftAllSuppliersSelected ? [] : draftCnpjs,
      allSuppliersSelected: draftAllSuppliersSelected,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className={GRUPO_MODAL_CONTENT_CLASS}>
        <DialogTitle className="sr-only">Acesso a fornecedores do portal</DialogTitle>
        <DialogDescription className="sr-only">
          Defina quais CNPJs / CPFs de fornecedores poderão ser acessados por usuários deste
          grupo.
        </DialogDescription>

        <div className={GRUPO_MODAL_HEADER_CLASS}>
          <h2 className={GRUPO_MODAL_TITLE_CLASS}>Acesso a fornecedores do portal</h2>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className={GRUPO_MODAL_CLOSE_BUTTON_CLASS}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className={GRUPO_MODAL_BODY_CLASS}>
          <p className="text-sm leading-relaxed text-[#8A90A0]">
            Defina quais CNPJs / CPFs de fornecedores poderão ser acessados por usuários deste
            grupo.
          </p>

          <div className="mt-4 rounded-lg border border-[rgba(4,14,35,0.08)] bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="supplier-portal-all-suppliers"
                className="cursor-pointer text-sm font-medium text-[#5F6572]"
              >
                Acessar todos os fornecedores
              </Label>
              <Switch
                id="supplier-portal-all-suppliers"
                checked={draftAllSuppliersSelected}
                onCheckedChange={handleToggleAllSuppliers}
              />
            </div>
          </div>

          <div className="mt-4 space-y-4 rounded-lg border border-[rgba(4,14,35,0.08)] bg-white p-4">
            <div className="space-y-1.5">
              <Label htmlFor="supplier-portal-cnpj-input" className="text-[#5F6572]">
                CNPJ / CPF
              </Label>
              <Input
                ref={inputRef}
                id="supplier-portal-cnpj-input"
                value={inputValue}
                onChange={(event) => {
                  setInputValue(formatCnpjOrCpfInput(event.target.value));
                  if (inputError) setInputError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddCnpj();
                  }
                }}
                placeholder="Digite o CNPJ / CPF e pressione enter"
                aria-label="CNPJ / CPF"
                aria-invalid={Boolean(inputError)}
                aria-describedby={inputError ? "supplier-portal-cnpj-error" : undefined}
                inputMode="numeric"
                className={
                  inputError
                    ? "border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-[#DC2626]"
                    : undefined
                }
              />
              {inputError ? (
                <p id="supplier-portal-cnpj-error" className="text-xs text-[#DC2626]">
                  {inputError}
                </p>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)]">
              <table className="w-full text-sm">
                <tbody>
                  {draftAllSuppliersSelected ? (
                    <tr className={`${TABLE_BODY_ROW_CLASS} bg-white`}>
                      <td
                        className={`${TABLE_BODY_CELL_CLASS} bg-white text-center text-[#8A90A0]`}
                      >
                        Todos os fornecedores selecionados
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr className={`${TABLE_BODY_ROW_CLASS} bg-white`}>
                      <td
                        colSpan={2}
                        className={`${TABLE_BODY_CELL_CLASS} bg-white text-center text-[#8A90A0]`}
                      >
                        Nenhum CNPJ / CPF adicionado
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((cnpj) => (
                      <tr key={cnpj} className={`${TABLE_BODY_ROW_CLASS} bg-white`}>
                        <td
                          className={`${TABLE_BODY_CELL_CLASS} bg-white ${TABLE_PRIMARY_TEXT_CLASS}`}
                        >
                          {cnpj}
                        </td>
                        <td className={`${TABLE_BODY_CELL_CLASS} bg-white text-right`}>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 font-semibold"
                            onClick={() => handleDeleteCnpj(cnpj)}
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showPagination ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <p className="text-sm text-[#5F6572]">
                Mostrando{" "}
                <span className="font-medium text-[#0d0f1c]">
                  {`${showingFrom} - ${showingTo}`}
                </span>{" "}
                de {totalItems} empresas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 px-4 font-semibold"
                  disabled={!hasPrevPage}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 px-4 font-semibold"
                  disabled={!hasNextPage}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className={GRUPO_MODAL_FOOTER_CLASS}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={GRUPO_MODAL_CANCEL_BUTTON_CLASS}
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className={GRUPO_MODAL_SAVE_BUTTON_CLASS}
            onClick={handleSave}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
