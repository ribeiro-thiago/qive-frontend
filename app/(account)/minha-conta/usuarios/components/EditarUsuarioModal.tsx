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
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { toAccountFetchError } from "../../lib/account-fetch-error";
import type { AccountUser } from "../../data/mock-usuarios";
import { updateAccountUsuario } from "../lib/account-usuarios-service";
import { USER_GROUP_OPTIONS } from "../data/grupos-options";

const SELECT_CLASS =
  "flex h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 py-1 pr-9 text-sm shadow-sm transition-colors focus-visible:border-[#0C3CF7] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0C3CF7] disabled:cursor-not-allowed disabled:opacity-50";

const SELECT_CHEVRON_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B616F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
};

type FormErrors = {
  nome: string;
  grupo: string;
};

const EMPTY_ERRORS: FormErrors = {
  nome: "",
  grupo: "",
};

type EditarUsuarioModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AccountUser | null;
  onUserUpdated: (user: AccountUser) => void;
};

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-bold text-[#3D4350]">{label}</Label>
      {children}
      {error ? <p className="text-xs text-[#B91C1C]">{error}</p> : null}
    </div>
  );
}

function getGroupOptions(currentGrupo: string): string[] {
  const options: string[] = [...USER_GROUP_OPTIONS];
  if (currentGrupo && !options.includes(currentGrupo)) {
    return [currentGrupo, ...options];
  }
  return options;
}

export function EditarUsuarioModal({
  open,
  onOpenChange,
  user,
  onUserUpdated,
}: EditarUsuarioModalProps) {
  const [nome, setNome] = React.useState("");
  const [grupo, setGrupo] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>(EMPTY_ERRORS);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open && user) {
      setNome(user.nome);
      setGrupo(user.grupoUsuarios);
      setErrors(EMPTY_ERRORS);
      setIsSubmitting(false);
    }
  }, [open, user]);

  const resetForm = React.useCallback(() => {
    setNome("");
    setGrupo("");
    setErrors(EMPTY_ERRORS);
    setIsSubmitting(false);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = { ...EMPTY_ERRORS };

    if (!nome.trim()) {
      nextErrors.nome = "Informe o nome do usuário.";
    }

    if (!grupo) {
      nextErrors.grupo = "Selecione um grupo de usuários.";
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    if (!user) return;

    const nextErrors = validate();
    const hasErrors = Boolean(nextErrors.nome || nextErrors.grupo);

    setErrors(nextErrors);
    if (hasErrors) return;

    setIsSubmitting(true);

    try {
      const updatedUser = await updateAccountUsuario(user, {
        nome,
        grupoUsuarios: grupo,
      });

      onUserUpdated(updatedUser);
      toast.success("Alterações salvas com sucesso.");
      handleOpenChange(false);
    } catch (error) {
      const fetchError = toAccountFetchError(error);
      toast.error(fetchError.message);
      setIsSubmitting(false);
    }
  };

  const groupOptions = user ? getGroupOptions(user.grupoUsuarios) : [...USER_GROUP_OPTIONS];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[520px] gap-0 rounded-[16px] border border-[rgba(4,14,35,0.08)] p-0 shadow-2xl">
        <DialogTitle className="sr-only">Editar usuário</DialogTitle>
        <DialogDescription className="sr-only">
          Informe os dados da pessoa que terá um usuário na sua conta Qive.
        </DialogDescription>

        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
          <div className="min-w-0 space-y-1.5 pr-4">
            <h2 className="text-[20px] font-bold leading-tight text-[#0d0f1c]">
              Editar usuário
            </h2>
            <p className="text-sm leading-relaxed text-[#8A90A0]">
              Informe os dados da pessoa que terá um usuário na sua conta Qive.
            </p>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-[#5B616F]"
              aria-label="Fechar"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="space-y-4 px-6 py-4">
          <FormField label="Nome" error={errors.nome}>
            <Input
              value={nome}
              onChange={(event) => {
                setNome(event.target.value);
                if (errors.nome) setErrors((current) => ({ ...current, nome: "" }));
              }}
              placeholder="Nome do usuário"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.nome)}
            />
          </FormField>

          <FormField label="Email">
            <Input
              type="email"
              value={user?.email ?? ""}
              readOnly
              disabled
              className="bg-[#F3F4F6] text-[#6B7280] cursor-not-allowed"
            />
          </FormField>

          <FormField label="Grupo de usuários (permissões)" error={errors.grupo}>
            <select
              value={grupo}
              onChange={(event) => {
                setGrupo(event.target.value);
                if (errors.grupo) setErrors((current) => ({ ...current, grupo: "" }));
              }}
              disabled={isSubmitting}
              className={cn(
                SELECT_CLASS,
                !grupo && "text-[#8A90A0]",
                errors.grupo &&
                  "border-[#FECACA] focus-visible:border-[#B91C1C] focus-visible:ring-[#B91C1C]"
              )}
              style={SELECT_CHEVRON_STYLE}
              aria-invalid={Boolean(errors.grupo)}
            >
              <option value="" disabled>
                Selecione
              </option>
              {groupOptions.map((option) => (
                <option key={option} value={option} className="text-[#0d0f1c]">
                  {option}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <DialogFooter className="gap-2 px-6 pb-6 pt-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="min-w-[140px] font-bold"
            onClick={handleSubmit}
            disabled={isSubmitting || !user}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
