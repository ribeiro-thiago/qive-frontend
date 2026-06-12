"use client";

import * as React from "react";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PortalAcessoFornecedorStatusTag } from "../components/PortalTags";
import { MAX_ACESSOS_PORTAL } from "./lib/fornecedor-acessos";
import type { FornecedorAcessoPortal, FornecedorRow } from "./types";

type NovoAcessoForm = {
  nomeCompleto: string;
  email: string;
  telefone: string;
};

const EMPTY_FORM: NovoAcessoForm = {
  nomeCompleto: "",
  email: "",
  telefone: "",
};

type GerenciarAcessosModalProps = {
  open: boolean;
  onClose: () => void;
  fornecedor: FornecedorRow;
  acessos: FornecedorAcessoPortal[];
  podeAdicionar: boolean;
  onSave: (acessos: FornecedorAcessoPortal[]) => void;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function GerenciarAcessosModal({
  open,
  onClose,
  fornecedor,
  acessos,
  podeAdicionar,
  onSave,
}: GerenciarAcessosModalProps) {
  const [draftAcessos, setDraftAcessos] = React.useState<FornecedorAcessoPortal[]>(acessos);
  const [novoAcesso, setNovoAcesso] = React.useState<NovoAcessoForm>(EMPTY_FORM);
  const [showAddForm, setShowAddForm] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDraftAcessos(acessos);
      setNovoAcesso(EMPTY_FORM);
      setShowAddForm(false);
    }
  }, [open, acessos]);

  const limiteAtingido = draftAcessos.length >= MAX_ACESSOS_PORTAL;
  const podeEnviarConvite =
    novoAcesso.nomeCompleto.trim() !== "" &&
    isValidEmail(novoAcesso.email) &&
    novoAcesso.telefone.trim() !== "" &&
    !limiteAtingido;

  const handleRemove = (id: string) => {
    setDraftAcessos((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReenviarConvite = (id: string) => {
    toast.success("Convite reenviado com sucesso.");
    setDraftAcessos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Convite pendente" } : item)),
    );
  };

  const handleAddConvite = () => {
    if (!podeEnviarConvite) return;

    const novo: FornecedorAcessoPortal = {
      id: `${fornecedor.id}-acesso-${Date.now()}`,
      nomeCompleto: novoAcesso.nomeCompleto.trim(),
      email: novoAcesso.email.trim(),
      telefone: novoAcesso.telefone.trim(),
      status: "Convite pendente",
      dataUltimoAcesso: null,
    };

    setDraftAcessos((prev) => [...prev, novo]);
    setNovoAcesso(EMPTY_FORM);
    setShowAddForm(false);
    toast.success("Convite enviado com sucesso.");
  };

  const handleSave = () => {
    onSave(draftAcessos);
    toast.success("Acessos atualizados com sucesso.");
  };

  return (
    <ScrollableModal
      open={open}
      onClose={onClose}
      title="Gerenciar acessos"
      maxWidth="640px"
      icon={<Mail className="h-5 w-5 text-[#5B616F]" aria-hidden />}
      actions={
        <div className="flex w-full justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar alterações
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        <p className="text-sm leading-5 text-[#5B616F]">
          Gerencie os usuários com acesso ao portal do fornecedor{" "}
          <span className="font-semibold text-[#0d0f1c]">{fornecedor.razaoSocial}</span>. Limite de{" "}
          {MAX_ACESSOS_PORTAL} acessos ({draftAcessos.length}/{MAX_ACESSOS_PORTAL} utilizados).
        </p>

        {limiteAtingido ? (
          <p className="rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2 text-sm text-[#C2410C]">
            Este fornecedor atingiu o limite de {MAX_ACESSOS_PORTAL} acessos. Remova um acesso para
            enviar um novo convite.
          </p>
        ) : null}

        <div className="space-y-2">
          {draftAcessos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[rgba(4,14,35,0.16)] bg-[#FAFAFB] px-3 py-6 text-center text-sm text-[#5B616F]">
              Nenhum acesso cadastrado.
            </p>
          ) : (
            draftAcessos.map((acesso) => (
              <div
                key={acesso.id}
                className="flex flex-col gap-3 rounded-lg border border-[rgba(4,14,35,0.08)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-semibold text-[#0d0f1c]">
                    {acesso.nomeCompleto}
                  </p>
                  <p className="truncate text-sm text-[#5B616F]">{acesso.email}</p>
                  <p className="text-sm text-[#5B616F]">{acesso.telefone}</p>
                  <PortalAcessoFornecedorStatusTag status={acesso.status} />
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {acesso.status === "Convite pendente" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleReenviarConvite(acesso.id)}
                    >
                      Reenviar convite
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[#B91C1C] hover:bg-[#FEE2E2] hover:text-[#B91C1C]"
                    aria-label={`Remover acesso de ${acesso.nomeCompleto}`}
                    onClick={() => handleRemove(acesso.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remover
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {!limiteAtingido && podeAdicionar ? (
          <div className="space-y-3 border-t border-[rgba(4,14,35,0.08)] pt-4">
            {!showAddForm ? (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Adicionar acesso
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#FAFAFB] p-4">
                <p className="text-sm font-semibold text-[#0d0f1c]">Novo convite</p>
                <div className="space-y-2">
                  <Label htmlFor="acesso-nome">Nome completo</Label>
                  <Input
                    id="acesso-nome"
                    value={novoAcesso.nomeCompleto}
                    onChange={(event) =>
                      setNovoAcesso((prev) => ({ ...prev, nomeCompleto: event.target.value }))
                    }
                    placeholder="Nome Sobrenome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acesso-email">E-mail</Label>
                  <Input
                    id="acesso-email"
                    type="email"
                    value={novoAcesso.email}
                    onChange={(event) =>
                      setNovoAcesso((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="nome.sobrenome@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acesso-telefone">Telefone</Label>
                  <Input
                    id="acesso-telefone"
                    value={novoAcesso.telefone}
                    onChange={(event) =>
                      setNovoAcesso((prev) => ({ ...prev, telefone: event.target.value }))
                    }
                    placeholder="(00) 90000-0000"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" disabled={!podeEnviarConvite} onClick={handleAddConvite}>
                    Enviar convite
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setNovoAcesso(EMPTY_FORM);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </ScrollableModal>
  );
}
