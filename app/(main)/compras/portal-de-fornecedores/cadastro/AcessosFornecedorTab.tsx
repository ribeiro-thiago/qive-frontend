"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ContactRound } from "lucide-react";
import { PortalAcessoFornecedorStatusTag } from "../components/PortalTags";
import { GerenciarAcessosModal } from "./GerenciarAcessosModal";
import {
  canAdicionarAcesso,
  countAcessosAtivos,
  countConvitesPendentes,
  deriveAcessoPortal,
  formatDataUltimoAcesso,
  getAcessosPortal,
  MAX_ACESSOS_PORTAL,
} from "./lib/fornecedor-acessos";
import type { AcessoFornecedorStatus, FornecedorRow } from "./types";

type AcessosFornecedorTabProps = {
  fornecedor: FornecedorRow;
  onUpdateFornecedor: (id: number, updates: Partial<FornecedorRow>) => void;
};

function ResumoAcessos({
  ativos,
  pendentes,
}: {
  ativos: number;
  pendentes: number;
}) {
  const ativoLabel = ativos === 1 ? "1 acesso ativo" : `${ativos} acessos ativos`;
  const pendenteLabel =
    pendentes === 1 ? "1 convite pendente" : `${pendentes} convites pendentes`;

  if (ativos === 0 && pendentes === 0) {
    return (
      <p className="text-sm leading-5 text-[#5B616F]">
        Este fornecedor ainda não possui acessos ao portal. Você pode adicionar até{" "}
        {MAX_ACESSOS_PORTAL} acessos para este fornecedor.
      </p>
    );
  }

  return (
    <p className="text-sm leading-5 text-[#5B616F]">
      Este fornecedor possui{" "}
      <span className="font-semibold text-[#0d0f1c]">{ativoLabel}</span>
      {pendentes > 0 ? (
        <>
          {" "}
          e <span className="font-semibold text-[#0d0f1c]">{pendenteLabel}</span>
        </>
      ) : null}
      . Você pode adicionar até {MAX_ACESSOS_PORTAL} acessos para este fornecedor.
    </p>
  );
}

export function AcessosFornecedorTab({
  fornecedor,
  onUpdateFornecedor,
}: AcessosFornecedorTabProps) {
  const [gerenciarOpen, setGerenciarOpen] = React.useState(false);

  const acessos = getAcessosPortal(fornecedor);
  const ativos = countAcessosAtivos(acessos);
  const pendentes = countConvitesPendentes(acessos);
  const podeAdicionar = canAdicionarAcesso(acessos);

  return (
    <>
      <div className="flex-1 p-4">
        <section className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
          <div className="flex items-center gap-2 border-b border-[rgba(4,14,35,0.08)] px-4 py-3">
            <ContactRound className="h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
            <h3 className="text-sm font-bold text-[#0d0f1c]">
              Acessos do fornecedor ao portal de fornecedor
            </h3>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <ResumoAcessos ativos={ativos} pendentes={pendentes} />
              <Button
                type="button"
                className="shrink-0 self-start sm:self-center"
                onClick={() => setGerenciarOpen(true)}
              >
                Gerenciar acessos
              </Button>
            </div>

            {acessos.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[rgba(4,14,35,0.16)] bg-[#FAFAFB] px-4 py-10 text-center">
                <p className="text-sm text-[#5B616F]">
                  Nenhum usuário com acesso cadastrado. Use &quot;Gerenciar acessos&quot; para enviar
                  o primeiro convite.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[rgba(4,14,35,0.08)]">
                <table className="min-w-[720px] w-full text-sm">
                  <thead className="bg-[#F5F5F6] text-left text-[#5B616F]">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Nome completo</th>
                      <th className="px-3 py-2 font-semibold">E-mail</th>
                      <th className="px-3 py-2 font-semibold whitespace-nowrap">Telefone</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold whitespace-nowrap">
                        Data do último acesso
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {acessos.map((acesso) => (
                      <tr
                        key={acesso.id}
                        className="border-t border-[rgba(4,14,35,0.08)] text-[#3D4350] transition-colors hover:bg-[#FAFAFB]"
                      >
                        <td className="px-3 py-2 font-medium">{acesso.nomeCompleto}</td>
                        <td className="px-3 py-2">{acesso.email}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{acesso.telefone}</td>
                        <td className="px-3 py-2">
                          <PortalAcessoFornecedorStatusTag status={acesso.status} />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatDataUltimoAcesso(acesso.dataUltimoAcesso)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      <GerenciarAcessosModal
        open={gerenciarOpen}
        onClose={() => setGerenciarOpen(false)}
        fornecedor={fornecedor}
        acessos={acessos}
        podeAdicionar={podeAdicionar}
        onSave={(nextAcessos) => {
          onUpdateFornecedor(fornecedor.id, {
            acessosPortal: nextAcessos,
            acessoPortal: deriveAcessoPortal(nextAcessos),
          });
          setGerenciarOpen(false);
        }}
      />
    </>
  );
}
