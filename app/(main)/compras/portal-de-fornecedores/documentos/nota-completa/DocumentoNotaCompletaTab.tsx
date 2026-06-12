"use client";

import * as React from "react";
import { toast } from "sonner";
import { Tabs } from "@/components/ui/tabs";
import type { PortalDocumentoRow } from "../types";
import {
  NotaCompletaFieldGrid,
  NotaCompletaFieldRow,
  NotaCompletaProdutoCard,
  NotaCompletaSectionTitle,
  NotaCompletaSubheader,
  NotaCompletaSubsection,
} from "./NotaCompletaUi";
import { buildPortalNotaCompletaData } from "./portal-nota-completa-data";

const SECTIONS = [
  { id: "nfe", label: "NF-e" },
  { id: "emitente", label: "Emitente" },
  { id: "destinatario", label: "Destinatário" },
  { id: "produtos", label: "Produtos/Serviços" },
  { id: "totais", label: "Totais" },
  { id: "cobranca", label: "Cobrança" },
  { id: "info-adicionais", label: "Info. Adicionais" },
  { id: "exportacao", label: "Exportação" },
  { id: "compras", label: "Compras" },
  { id: "pagamentos", label: "Pagamentos" },
] as const;

type NotaCompletaSectionId = (typeof SECTIONS)[number]["id"];

function isNotaCompletaSectionId(id: string): id is NotaCompletaSectionId {
  return SECTIONS.some((section) => section.id === id);
}

type DocumentoNotaCompletaTabProps = {
  documento: PortalDocumentoRow;
};

export function DocumentoNotaCompletaTab({ documento }: DocumentoNotaCompletaTabProps) {
  const data = React.useMemo(() => buildPortalNotaCompletaData(documento), [documento]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = React.useState<NotaCompletaSectionId>(SECTIONS[0].id);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateActiveSection = () => {
      const containerRect = container.getBoundingClientRect();
      const triggerPoint = containerRect.top + 150;
      let active: NotaCompletaSectionId = SECTIONS[0].id;

      SECTIONS.forEach((section) => {
        const element = document.getElementById(`portal-section-${section.id}`);
        if (element && element.getBoundingClientRect().top <= triggerPoint) {
          active = section.id;
        }
      });

      setCurrentSection(active);
    };

    updateActiveSection();
    container.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => container.removeEventListener("scroll", updateActiveSection);
  }, []);

  const scrollToSection = React.useCallback((sectionId: string) => {
    if (!isNotaCompletaSectionId(sectionId)) return;

    const element = document.getElementById(`portal-section-${sectionId}`);
    const container = scrollContainerRef.current;
    if (!element || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const targetScroll = container.scrollTop + elementRect.top - containerRect.top - 150;

    setCurrentSection(sectionId);
    container.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, []);

  return (
    <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto bg-white">
      <div className="sticky top-0 z-20 border-b border-[rgba(4,14,35,0.08)] bg-white px-6 py-2">
        <div className="overflow-x-auto scrollbar-hide">
          <Tabs
            tabs={[...SECTIONS]}
            value={currentSection}
            onValueChange={scrollToSection}
            variant="default"
            className="min-w-max"
          />
        </div>
      </div>

      <div className="space-y-4 px-6 py-6">
        <section id="portal-section-nfe" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>NF-e</NotaCompletaSectionTitle>
          <NotaCompletaSubsection title="Principais">
            <NotaCompletaFieldGrid fields={data.nfe.principais} />
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Emitente">
            <NotaCompletaFieldGrid fields={data.nfe.emitenteResumo} />
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Destinatário">
            <NotaCompletaFieldGrid fields={data.nfe.destinatarioResumo} />
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Detalhes da operação">
            <NotaCompletaFieldGrid fields={data.nfe.operacao} columns={2} />
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Autorização de uso">
            <NotaCompletaFieldGrid fields={data.nfe.autorizacao} />
          </NotaCompletaSubsection>
        </section>

        <section id="portal-section-emitente" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>Emitente</NotaCompletaSectionTitle>
          <NotaCompletaSubsection title="Dados">
            <NotaCompletaFieldGrid fields={data.emitente.dados} columns={1} />
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Endereço">
            <NotaCompletaFieldGrid fields={data.emitente.endereco} />
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Dados Complementares">
            <NotaCompletaFieldGrid fields={data.emitente.complementares} />
          </NotaCompletaSubsection>
        </section>

        <section id="portal-section-destinatario" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>Destinatário</NotaCompletaSectionTitle>
          <NotaCompletaSubsection title="Dados">
            <NotaCompletaFieldGrid fields={data.destinatario.dados} columns={1} />
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Endereço">
            <NotaCompletaFieldGrid fields={data.destinatario.endereco} />
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Dados Complementares">
            <NotaCompletaFieldGrid fields={data.destinatario.complementares} columns={2} />
          </NotaCompletaSubsection>
        </section>

        <section id="portal-section-produtos" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>Produtos/Serviços</NotaCompletaSectionTitle>
          {data.produtos.map((produto) => (
            <NotaCompletaProdutoCard
              key={produto.id}
              titulo={produto.titulo}
              onManifestar={() => toast.info("Manifestação do item em desenvolvimento")}
            />
          ))}
        </section>

        <section id="portal-section-totais" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>Totais</NotaCompletaSectionTitle>
          <div className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)]">
            <NotaCompletaSubheader title="ICMS" />
            <NotaCompletaFieldGrid fields={data.totais.icms} />
            <NotaCompletaSubheader title="IBS e CBS" />
            <NotaCompletaFieldGrid fields={data.totais.ibsCbs} columns={4} />
            <NotaCompletaSubheader title="FCP" />
            <NotaCompletaFieldGrid fields={data.totais.fcp} columns={3} />
            <NotaCompletaSubheader title="Transporte" />
            <NotaCompletaFieldGrid fields={data.totais.transporte} columns={3} />
            <NotaCompletaSubheader title="IPI" />
            <NotaCompletaFieldGrid fields={data.totais.ipi} columns={2} />
            <NotaCompletaSubheader title="ISS" />
            <NotaCompletaFieldGrid fields={data.totais.iss} columns={3} />
            <NotaCompletaSubheader title="Volume" />
            <NotaCompletaFieldGrid fields={data.totais.volume} columns={4} labelWidth="w-36" />
          </div>
        </section>

        <section id="portal-section-cobranca" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>Cobrança</NotaCompletaSectionTitle>
          <NotaCompletaSubsection title="Fatura">
            <NotaCompletaFieldGrid fields={data.cobranca.fatura} columns={4} />
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Duplicata">
            <NotaCompletaFieldGrid fields={data.cobranca.duplicata} columns={3} />
          </NotaCompletaSubsection>
        </section>

        <section id="portal-section-info-adicionais" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>Informações Adicionais</NotaCompletaSectionTitle>
          <NotaCompletaSubsection title="Informações complementares">
            <NotaCompletaFieldGrid fields={data.infoAdicionais.geral} columns={2} />
            <div className="grid grid-cols-1">
              <NotaCompletaFieldRow label="Interesse do Contrib." value={data.infoAdicionais.interesseContribuinte} />
            </div>
          </NotaCompletaSubsection>
          <NotaCompletaSubsection title="Documentos fiscais referenciados">
            <div className="grid grid-cols-1">
              <NotaCompletaFieldRow label="Chave de Acesso" value={data.infoAdicionais.chaveReferenciada} mono />
            </div>
          </NotaCompletaSubsection>
        </section>

        <section id="portal-section-exportacao" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>Exportação</NotaCompletaSectionTitle>
          <NotaCompletaSubsection title="Dados de exportação">
            <NotaCompletaFieldGrid fields={data.exportacao} columns={2} />
          </NotaCompletaSubsection>
        </section>

        <section id="portal-section-compras" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>Compras</NotaCompletaSectionTitle>
          <NotaCompletaSubsection title="Dados de compras">
            <NotaCompletaFieldGrid fields={data.compras} columns={3} />
          </NotaCompletaSubsection>
        </section>

        <section id="portal-section-pagamentos" className="space-y-4 scroll-mt-36">
          <NotaCompletaSectionTitle>Pagamentos</NotaCompletaSectionTitle>
          <NotaCompletaSubsection title="Forma de pagamento">
            <NotaCompletaFieldGrid fields={data.pagamentos} columns={3} />
          </NotaCompletaSubsection>
        </section>
      </div>
    </div>
  );
}
