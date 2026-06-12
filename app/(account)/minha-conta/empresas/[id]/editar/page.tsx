"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronLeft, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs } from "@/components/ui/tabs";
import Footer from "@/components/navigation/Footer";
import { cn } from "@/lib/utils";
import { AccountSidebar } from "../../../components/AccountSidebar";
import {
  getCompanyById,
  type AccountCompany,
} from "../../data/mock-empresas";

const PAGE_MAX_WIDTH = "max-w-[720px]";
const READONLY_INPUT_CLASS = "bg-[#F5F5F6] text-[#5F6572] shadow-none";
const SECTION_TITLE_CLASS = "text-sm font-semibold text-[#0d0f1c]";
const FIELD_LABEL_CLASS = "mb-1 block text-sm font-semibold text-[#5F6572]";

const COMPANY_TABS = [
  { id: "empresa", label: "Empresa" },
  { id: "dominio", label: "Integração Domínio" },
  { id: "painel-basico", label: "Painel Básico" },
] as const;

const SITUACAO_OPTIONS = ["Ativa", "Inativa"] as const;

type CompanyTabId = (typeof COMPANY_TABS)[number]["id"];

function InfoAlert({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#B8DBFF] bg-[#E7F3FF] px-4 py-3">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#0C3CF7]" aria-hidden />
        <div className="space-y-1 text-sm text-[#003F70]">
          {title ? <p className="font-semibold text-[#003F70]">{title}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={SECTION_TITLE_CLASS}>{children}</h2>;
}

function cloneCompany(company: AccountCompany): AccountCompany {
  return {
    ...company,
    endereco: { ...company.endereco },
  };
}

function AccountPageShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="p-6 min-h-full box-border">
      <div className="w-full min-h-full mx-auto">
        <div className="flex min-h-full gap-6 items-stretch flex-col lg:flex-row">
          <AccountSidebar />

          <div className="flex-1 min-w-0 flex flex-col">
            {children}

            <div className="mt-auto pt-8">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function EditarEmpresaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const companyId = params.id;

  const sourceCompany = React.useMemo(
    () => (companyId ? getCompanyById(companyId) : undefined),
    [companyId],
  );

  const [activeTab, setActiveTab] = React.useState<CompanyTabId>("empresa");
  const [formData, setFormData] = React.useState<AccountCompany | null>(() =>
    sourceCompany ? cloneCompany(sourceCompany) : null,
  );

  React.useEffect(() => {
    if (sourceCompany) {
      setFormData(cloneCompany(sourceCompany));
    }
  }, [sourceCompany]);

  const handleBack = () => {
    router.push("/minha-conta/empresas");
  };

  const handleSave = () => {
    toast.success("Dados da empresa salvos com sucesso.");
    router.push("/minha-conta/empresas");
  };

  const updateField = <K extends keyof AccountCompany>(
    key: K,
    value: AccountCompany[K],
  ) => {
    setFormData((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateEndereco = <K extends keyof AccountCompany["endereco"]>(
    key: K,
    value: AccountCompany["endereco"][K],
  ) => {
    setFormData((current) =>
      current
        ? {
            ...current,
            endereco: { ...current.endereco, [key]: value },
          }
        : current,
    );
  };

  if (!formData) {
    return (
      <AccountPageShell>
        <div className={cn("w-full", PAGE_MAX_WIDTH)}>
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Dados da empresa</h1>
          <p className="mt-2 text-sm text-[#5F6572]">Empresa não encontrada.</p>
          <Button variant="link" className="mt-4 px-0" onClick={handleBack}>
            Voltar para empresas da conta
          </Button>
        </div>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell>
      <div className={cn("w-full", PAGE_MAX_WIDTH)}>
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Dados da empresa</h1>
          <Link
            href="/minha-conta/empresas"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#8A90A0] transition-colors hover:text-[#5B616F]"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            Voltar para empresas da conta
          </Link>
        </header>

        <Card className="overflow-hidden border-border">
          <div className="rounded-t-xl bg-[#F5F5F6]">
            <Tabs
              tabs={[...COMPANY_TABS]}
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as CompanyTabId)}
              variant="product"
            />
          </div>

          <CardContent className="space-y-8 p-6">
            {activeTab === "empresa" ? (
              <>
                <InfoAlert>
                  Evite problemas de integração, mantenha os dados sempre atualizados.
                </InfoAlert>

                <div className="space-y-4">
                  <SectionTitle>Configurações na Qive</SectionTitle>
                  <div>
                    <Label className={FIELD_LABEL_CLASS}>Situação no cadastro</Label>
                    <div className="relative max-w-md">
                      <select
                        value={formData.situacaoCadastro}
                        onChange={(event) =>
                          updateField("situacaoCadastro", event.target.value)
                        }
                        className="h-9 w-full appearance-none rounded-lg border border-input bg-white px-3 pr-9 text-sm font-medium text-[#0d0f1c] shadow-none"
                      >
                        {SITUACAO_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6572]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle>Dados da empresa</SectionTitle>
                  <div>
                    <Label className={FIELD_LABEL_CLASS}>Nome</Label>
                    <Input
                      readOnly
                      value={formData.name}
                      className={READONLY_INPUT_CLASS}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className={FIELD_LABEL_CLASS}>CNPJ</Label>
                      <Input
                        readOnly
                        value={formData.cpfCnpj}
                        className={READONLY_INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <Label className={FIELD_LABEL_CLASS}>Razão social</Label>
                      <Input
                        value={formData.razaoSocial}
                        onChange={(event) =>
                          updateField("razaoSocial", event.target.value)
                        }
                        className="shadow-none"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className={FIELD_LABEL_CLASS}>Inscrição municipal</Label>
                      <Input
                        value={formData.im}
                        onChange={(event) => updateField("im", event.target.value)}
                        className="shadow-none"
                      />
                    </div>
                    <div>
                      <Label className={FIELD_LABEL_CLASS}>Inscrição estadual</Label>
                      <Input
                        value={formData.inscricaoEstadual}
                        onChange={(event) =>
                          updateField("inscricaoEstadual", event.target.value)
                        }
                        className="shadow-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0d0f1c]">
                      Empresa de faturamento do plano?
                    </p>
                    <p className="mt-1 text-sm text-[#8A90A0]">
                      Caso precise alterar entre em contato com o atendimento.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex cursor-not-allowed items-center gap-2 text-sm font-semibold text-[#8A90A0]">
                      <input
                        type="radio"
                        name="empresa-faturamento-plano"
                        checked
                        disabled
                        className="h-4 w-4 accent-[#0C3CF7] disabled:cursor-not-allowed"
                      />
                      Sim
                    </label>
                    <label className="inline-flex cursor-not-allowed items-center gap-2 text-sm font-semibold text-[#8A90A0]">
                      <input
                        type="radio"
                        name="empresa-faturamento-plano"
                        checked={false}
                        disabled
                        className="h-4 w-4 accent-[#0C3CF7] disabled:cursor-not-allowed"
                      />
                      Não
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle>Endereço</SectionTitle>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className={FIELD_LABEL_CLASS}>CEP</Label>
                      <Input
                        value={formData.endereco.cep}
                        onChange={(event) => updateEndereco("cep", event.target.value)}
                        className="shadow-none"
                      />
                    </div>
                    <div className="hidden sm:block" />
                  </div>
                  <div>
                    <Label className={FIELD_LABEL_CLASS}>Rua</Label>
                    <Input
                      value={formData.endereco.rua}
                      onChange={(event) => updateEndereco("rua", event.target.value)}
                      className="shadow-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className={FIELD_LABEL_CLASS}>Número</Label>
                      <Input
                        value={formData.endereco.numero}
                        onChange={(event) => updateEndereco("numero", event.target.value)}
                        className="shadow-none"
                      />
                    </div>
                    <div>
                      <Label className={FIELD_LABEL_CLASS}>Complemento</Label>
                      <Input
                        value={formData.endereco.complemento}
                        onChange={(event) =>
                          updateEndereco("complemento", event.target.value)
                        }
                        className="shadow-none"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className={FIELD_LABEL_CLASS}>Bairro</Label>
                    <Input
                      value={formData.endereco.bairro}
                      onChange={(event) => updateEndereco("bairro", event.target.value)}
                      className="shadow-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className={FIELD_LABEL_CLASS}>UF</Label>
                      <Input
                        value={formData.endereco.uf}
                        onChange={(event) => updateEndereco("uf", event.target.value)}
                        className="shadow-none"
                      />
                    </div>
                    <div>
                      <Label className={FIELD_LABEL_CLASS}>Cidade</Label>
                      <Input
                        value={formData.endereco.cidade}
                        onChange={(event) => updateEndereco("cidade", event.target.value)}
                        className="shadow-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === "dominio" ? (
              <>
                <InfoAlert title="Integração com a Domínio Sistemas">
                  <p>
                    Importe XMLs da Qive para o sistema contábil Domínio de forma automática.{" "}
                    <button
                      type="button"
                      className="font-semibold text-[#0C3CF7] underline"
                    >
                      Saiba mais
                    </button>
                  </p>
                </InfoAlert>

                <div>
                  <Label className={FIELD_LABEL_CLASS}>Código da empresa na Domínio</Label>
                  <Input
                    value={formData.dominioCodigo}
                    onChange={(event) => updateField("dominioCodigo", event.target.value)}
                    className="max-w-md shadow-none"
                  />
                </div>
              </>
            ) : null}

            {activeTab === "painel-basico" ? (
              <>
                <InfoAlert title="Acesso básico a conta">
                  <p>
                    Cadastre um usuário externo, para ter acesso aos dados apenas desta
                    empresa.{" "}
                    <button
                      type="button"
                      className="font-semibold text-[#0C3CF7] underline"
                    >
                      Saiba mais
                    </button>
                  </p>
                </InfoAlert>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Label className={FIELD_LABEL_CLASS}>E-mail</Label>
                    <Input
                      value={formData.painelBasicoEmail}
                      onChange={(event) =>
                        updateField("painelBasicoEmail", event.target.value)
                      }
                      className="shadow-none"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 shrink-0 gap-1.5 px-3 text-xs font-semibold bg-white text-[#111827] border border-[rgba(4,14,35,0.08)] shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar convite
                  </Button>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            className="font-semibold text-[#5F6572] hover:text-[#0d0f1c]"
            onClick={handleBack}
          >
            Cancelar
          </Button>
          <Button className="px-6 font-bold" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </AccountPageShell>
  );
}
