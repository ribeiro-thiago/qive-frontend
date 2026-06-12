"use client";

import * as React from "react";
import {
  Building2,
  MapPin,
  Package,
  ScrollText,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildFornecedorDadosGerais,
  formatAtividadeCnae,
  type FornecedorDadosGerais,
} from "./lib/fornecedor-dados-gerais";
import type { FornecedorRow } from "./types";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold text-[#8A90A0]">{label}</p>
      <p className="text-sm font-semibold leading-5 text-[#3D4350]">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-[rgba(4,14,35,0.08)] px-4 py-3">
        <Icon className="h-4 w-4 shrink-0 text-[#5B616F]" aria-hidden />
        <h3 className="text-sm font-bold text-[#0d0f1c]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function DadosEmpresaSection({ dados }: { dados: FornecedorDadosGerais }) {
  return (
    <SectionCard title="Dados da empresa" icon={Building2}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        <div className="space-y-4">
          <InfoField label="Razão Social" value={dados.razaoSocial} />
          <InfoField label="Nome fantasia" value={dados.nomeFantasia} />
          <InfoField label="CNPJ" value={dados.cnpj} />
          <InfoField label="Data de abertura" value={dados.dataAbertura} />
          <InfoField label="Matriz ou filial" value={dados.matrizFilial} />
          <InfoField label="Regime tributário" value={dados.regimeTributario} />
        </div>
        <div className="space-y-4">
          <InfoField label="Situação cadastral" value={dados.situacaoCadastral} />
          <InfoField label="Data da situação Cadastral" value={dados.dataSituacaoCadastral} />
          <InfoField label="Natureza jurídica" value={dados.naturezaJuridica} />
          <InfoField label="Capital social" value={dados.capitalSocial} />
          <InfoField label="Porte (FRB)" value={dados.porteFrb} />
        </div>
      </div>
    </SectionCard>
  );
}

function EnderecoContatoSection({ dados }: { dados: FornecedorDadosGerais }) {
  return (
    <SectionCard title="Endereço e contato" icon={MapPin} className="h-full">
      <div className="space-y-4">
        <InfoField label="Endereço" value={dados.endereco} />
        <InfoField label="Telefone" value={dados.telefone} />
        <InfoField label="Site" value={dados.site} />
        <InfoField label="Email" value={dados.email} />
      </div>
    </SectionCard>
  );
}

function QuadroSocietarioSection({ dados }: { dados: FornecedorDadosGerais }) {
  return (
    <SectionCard title="Quadro societário" icon={Users} className="h-full">
      <div className="space-y-4">
        <InfoField label="Nome" value={dados.socio.nome} />
        <InfoField label="PJ/PF" value={dados.socio.pjPf} />
        <InfoField label="Cargo" value={dados.socio.cargo} />
        <InfoField label="Data de entrada" value={dados.socio.dataEntrada} />
      </div>
    </SectionCard>
  );
}

function AtividadesEconomicasSection({ dados }: { dados: FornecedorDadosGerais }) {
  return (
    <SectionCard title="Atividades econômicas (CNAE)" icon={ScrollText}>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#8A90A0]">Atividade</p>
          <p className="text-sm font-semibold leading-5 text-[#3D4350]">
            {formatAtividadeCnae(dados.atividadePrincipal)}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#8A90A0]">Atividades secundárias</p>
          <ul className="space-y-2">
            {dados.atividadesSecundarias.map((atividade) => (
              <li
                key={atividade.codigo}
                className="text-sm font-semibold leading-5 text-[#3D4350]"
              >
                {formatAtividadeCnae(atividade)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}

function ProdutosNcmSection({ dados }: { dados: FornecedorDadosGerais }) {
  return (
    <SectionCard title="Produtos praticados pelo fornecedor (NCM)" icon={Package}>
      <div className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)]">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5F6] text-left text-[#5B616F]">
            <tr>
              <th className="px-3 py-2 font-semibold">Característica do produto</th>
              <th className="w-[180px] px-3 py-2 font-semibold whitespace-nowrap">
                Posição (Código NCM)
              </th>
            </tr>
          </thead>
          <tbody>
            {dados.produtosNcm.map((produto) => (
              <tr
                key={produto.codigoNcm}
                className="border-t border-[rgba(4,14,35,0.08)] text-[#3D4350]"
              >
                <td className="px-3 py-2 align-top font-medium">{produto.caracteristica}</td>
                <td className="px-3 py-2 align-top font-semibold whitespace-nowrap">
                  {produto.codigoNcm}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

export function DadosGeraisTab({ fornecedor }: { fornecedor: FornecedorRow }) {
  const dados = React.useMemo(() => buildFornecedorDadosGerais(fornecedor), [fornecedor]);

  return (
    <div className="flex-1 p-4">
      <div className="space-y-3">
        <DadosEmpresaSection dados={dados} />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <EnderecoContatoSection dados={dados} />
          <QuadroSocietarioSection dados={dados} />
        </div>

        <AtividadesEconomicasSection dados={dados} />
        <ProdutosNcmSection dados={dados} />
      </div>
    </div>
  );
}
