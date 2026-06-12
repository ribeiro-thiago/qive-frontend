"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortalDocumentoRow } from "../types";
import { PortalDanfeBarcode } from "./PortalDanfeBarcode";
import {
  buildPortalDanfeData,
  formatDanfeAccessKey,
  filterNovosImpostosProdutoLinhas,
  resolveNovosImpostosCampoValor,
  type PortalDanfeViewData,
} from "./portal-danfe-data";

const DANFE_BORDER = "border border-[#0d0f1c]";
const DANFE_LABEL = "text-[8px] font-normal uppercase leading-tight text-[#3f3f46]";
const DANFE_VALUE = "text-[11px] leading-snug text-[#0d0f1c]";
const DANFE_SECTION = "bg-[#f4f4f5] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1d4ed8]";

function DanfeCell({
  label,
  value,
  className,
  colSpan,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <div
      className={cn(DANFE_BORDER, "border-t-0 border-l-0 bg-white p-1", className)}
      style={colSpan ? { gridColumn: `span ${colSpan} / span ${colSpan}` } : undefined}
    >
      <div className={DANFE_LABEL}>{label}</div>
      <div className={cn(DANFE_VALUE, "mt-0.5 min-h-[14px]")}>{value || "\u00A0"}</div>
    </div>
  );
}

function DanfeSectionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(DANFE_BORDER, "border-t-0 border-l-0 col-span-full px-1.5 py-0.5")}>
      <div className={DANFE_SECTION}>{children}</div>
    </div>
  );
}

type DocumentoVerDanfeTabProps = {
  documento: PortalDocumentoRow;
  showNovosImpostos: boolean;
};

export function DocumentoVerDanfeTab({ documento, showNovosImpostos }: DocumentoVerDanfeTabProps) {
  const data = React.useMemo(() => buildPortalDanfeData(documento), [documento]);
  const chaveFormatada = formatDanfeAccessKey(data.chaveAcesso);

  return (
    <div className="bg-white px-6 py-4">
      <div className="mx-auto max-w-[1100px] space-y-4 bg-white">
        <ReformaTributariaBanner />
        <EtiquetasRow etiquetas={data.etiquetas} />
        <DanfeDocumento
          data={data}
          chaveFormatada={chaveFormatada}
          showNovosImpostos={showNovosImpostos}
        />
      </div>
    </div>
  );
}

function ReformaTributariaBanner() {
  return (
    <div className="flex gap-3 rounded-md border border-[#93c5fd] bg-[#eff6ff] px-4 py-3">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#2563eb]" aria-hidden />
      <div className="space-y-1 text-sm text-[#1e3a5f]">
        <p className="font-semibold text-[#0d0f1c]">
          Novos impostos da Reforma Tributária disponíveis para impressão
        </p>
        <p className="text-[#334155]">
          A partir de agora, o DANFe pode ser impresso no formato padrão ou expandido, incluindo os
          campos de IBS, CBS e IS conforme a legislação vigente.
        </p>
        <p className="text-xs text-[#64748b]">
          Essa impressão contempla os novos tributos. Consulte seu contador para mais informações.
        </p>
      </div>
    </div>
  );
}

function EtiquetasRow({ etiquetas }: { etiquetas: PortalDanfeViewData["etiquetas"] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-[#3D4350]">Etiquetas</span>
      {etiquetas.map((tag) => (
        <span
          key={tag.id}
          className={cn(
            "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold",
            tag.className,
          )}
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}

function DanfeDocumento({
  data,
  chaveFormatada,
  showNovosImpostos,
}: {
  data: PortalDanfeViewData;
  chaveFormatada: string;
  showNovosImpostos: boolean;
}) {
  return (
    <div className={cn(DANFE_BORDER, "bg-white text-[#0d0f1c]")}>
      {/* Cabeçalho: emitente | DANFE | chave */}
      <div className="grid grid-cols-[1fr_140px_1fr]">
        <div className={cn(DANFE_BORDER, "border-t-0 border-l-0 bg-white p-2")}>
          <div className={DANFE_LABEL}>Identificação do emitente</div>
          <div className="mt-1 text-sm font-bold uppercase">{data.emitente.nome}</div>
          <div className="mt-1 text-[11px] leading-snug">{data.emitente.endereco}</div>
          <div className="text-[11px] leading-snug">{data.emitente.municipioUf}</div>
          <div className="text-[11px] leading-snug">{data.emitente.fone}</div>
        </div>

        <div
          className={cn(
            DANFE_BORDER,
            "flex flex-col items-center justify-center border-t-0 border-l-0 bg-white px-2 py-3 text-center",
          )}
        >
          <div className="text-2xl font-black tracking-tight">DANFE</div>
          <div className="mt-1 text-[9px] font-semibold leading-tight">
            Documento Auxiliar da
            <br />
            Nota Fiscal Eletrônica
          </div>
          <div className="mt-2 flex w-full items-center justify-center gap-3 text-[10px]">
            <span>
              0 - Entrada
              <br />
              <span className="inline-block h-3 w-3 border border-[#0d0f1c] align-middle">
                {data.tipoOperacao === "0" ? "X" : ""}
              </span>
            </span>
            <span>
              1 - Saída
              <br />
              <span className="inline-block h-3 w-3 border border-[#0d0f1c] align-middle text-center text-[8px] leading-3">
                {data.tipoOperacao === "1" ? "X" : ""}
              </span>
            </span>
          </div>
          <div className="mt-2 text-[10px]">
            <span className="font-bold">Nº</span> {data.numero}
          </div>
          <div className="text-[10px]">
            <span className="font-bold">SÉRIE</span> {data.serie}
          </div>
          <div className="mt-2 text-[8px] leading-tight text-[#3f3f46]">
            CONTROLE DO FISCO
          </div>
        </div>

        <div className={cn(DANFE_BORDER, "border-t-0 border-l-0 bg-white p-2")}>
          <div className={DANFE_LABEL}>Chave de acesso</div>
          <div className="mt-1 overflow-hidden rounded border border-[#0d0f1c]">
            <PortalDanfeBarcode value={data.chaveAcesso} height={48} />
          </div>
          <div className="mt-1 break-all text-center text-[10px] font-medium tracking-wide">
            {chaveFormatada}
          </div>
          <div className="mt-2 text-center text-[8px] text-[#3f3f46]">
            Consulta de autenticidade no portal nacional da NF-e
            <br />
            www.nfe.fazenda.gov.br/portal ou no site da Sefaz autorizadora
          </div>
          <div className="mt-2">
            <div className={DANFE_LABEL}>Protocolo de autorização de uso</div>
            <div className={cn(DANFE_VALUE, "text-center")}>{data.protocolo}</div>
          </div>
        </div>
      </div>

      {/* Natureza + IE + CNPJ */}
      <div className="grid grid-cols-12">
        <DanfeCell label="Natureza da operação" value={data.naturezaOperacao} colSpan={12} />
        <DanfeCell label="Inscrição estadual" value={data.inscricaoEstadual} colSpan={4} />
        <DanfeCell
          label="Inscrição estadual do subst. tribut."
          value={data.inscricaoEstadualSubst}
          colSpan={4}
        />
        <DanfeCell label="CNPJ / CPF" value={data.cnpjEmitente} colSpan={4} />
      </div>

      {/* Destinatário */}
      <div className="grid grid-cols-12">
        <DanfeSectionBar>Destinatário / remetente</DanfeSectionBar>
        <DanfeCell label="Nome / razão social" value={data.destinatario.nome} colSpan={7} />
        <DanfeCell label="CNPJ / CPF" value={data.destinatario.cnpjCpf} colSpan={3} />
        <DanfeCell label="Data da emissão" value={data.destinatario.dataEmissao} colSpan={2} />
        <DanfeCell label="Endereço" value={data.destinatario.endereco} colSpan={5} />
        <DanfeCell label="Bairro / distrito" value={data.destinatario.bairro} colSpan={3} />
        <DanfeCell label="CEP" value={data.destinatario.cep} colSpan={2} />
        <DanfeCell label="Data da entrada / saída" value={data.destinatario.dataEntradaSaida} colSpan={2} />
        <DanfeCell label="Município" value={data.destinatario.municipio} colSpan={4} />
        <DanfeCell label="UF" value={data.destinatario.uf} colSpan={1} />
        <DanfeCell label="Fone / fax" value={data.destinatario.fone} colSpan={3} />
        <DanfeCell label="Inscrição estadual" value={data.destinatario.inscricaoEstadual} colSpan={3} />
        <DanfeCell label="Hora da saída" value={data.destinatario.horaSaida} colSpan={1} />
      </div>

      {/* Fatura */}
      <div className="grid grid-cols-12">
        <DanfeSectionBar>Fatura / duplicata</DanfeSectionBar>
        <div className={cn(DANFE_BORDER, "col-span-12 border-t-0 border-l-0 bg-white")}>
          <table className="w-full bg-white text-[10px]">
            <thead>
              <tr className={DANFE_LABEL}>
                <th className="border-r border-[#0d0f1c] bg-white px-2 py-1 text-left font-normal">Num.</th>
                <th className="border-r border-[#0d0f1c] px-2 py-1 text-left font-normal">Venc.</th>
                <th className="px-2 py-1 text-left font-normal">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.duplicatas.map((dup) => (
                <tr key={dup.num} className={DANFE_VALUE}>
                  <td className="border-r border-t border-[#0d0f1c] px-2 py-1">{dup.num}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-2 py-1">{dup.venc}</td>
                  <td className="border-t border-[#0d0f1c] px-2 py-1">{dup.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cálculo do imposto */}
      <div className="grid grid-cols-12">
        <DanfeSectionBar>Cálculo do imposto</DanfeSectionBar>
        <DanfeCell label="Base de cálculo do ICMS" value={data.imposto.baseIcms} colSpan={2} />
        <DanfeCell label="Valor do ICMS" value={data.imposto.valorIcms} colSpan={2} />
        <DanfeCell label="Base de cálc. do ICMS ST" value={data.imposto.baseIcmsSt} colSpan={2} />
        <DanfeCell label="Valor do ICMS ST" value={data.imposto.valorIcmsSt} colSpan={2} />
        <DanfeCell label="Valor do imp. importação" value={data.imposto.valorImpImportacao} colSpan={2} />
        <DanfeCell label="Valor do PIS" value={data.imposto.valorPis} colSpan={1} />
        <DanfeCell label="Valor total dos produtos" value={data.imposto.valorTotalProdutos} colSpan={1} />
        <DanfeCell label="Valor do frete" value={data.imposto.valorFrete} colSpan={2} />
        <DanfeCell label="Valor do seguro" value={data.imposto.valorSeguro} colSpan={2} />
        <DanfeCell label="Desconto" value={data.imposto.desconto} colSpan={2} />
        <DanfeCell label="Outras despesas" value={data.imposto.outrasDespesas} colSpan={2} />
        <DanfeCell label="Valor total do IPI" value={data.imposto.valorIpi} colSpan={2} />
        <DanfeCell label="Valor da COFINS" value={data.imposto.valorCofins} colSpan={1} />
        <DanfeCell label="Valor total da nota" value={data.imposto.valorTotalNota} colSpan={1} />
        <DanfeCell
          label="Base de cálculo do IBS/CBS"
          value={resolveNovosImpostosCampoValor(data.imposto.baseIbsCbs, showNovosImpostos)}
          colSpan={3}
        />
        <DanfeCell label="Valor do IBS" value={data.imposto.valorIbs} colSpan={2} />
        <DanfeCell
          label="Valor do IBS UF"
          value={resolveNovosImpostosCampoValor(data.imposto.valorIbsUf, showNovosImpostos)}
          colSpan={2}
        />
        <DanfeCell label="Valor do IBS MUN" value={data.imposto.valorIbsMun} colSpan={2} />
        <DanfeCell label="Valor do IS" value={data.imposto.valorIs} colSpan={3} />
      </div>

      {/* Transportadora */}
      <div className="grid grid-cols-12">
        <DanfeSectionBar>Transportador / volumes transportados</DanfeSectionBar>
        <DanfeCell label="Nome / razão social" value={data.transporte.nome} colSpan={5} />
        <DanfeCell label="Frete por conta" value={data.transporte.fretePorConta} colSpan={1} />
        <DanfeCell label="Código ANTT" value={data.transporte.codigoAntt} colSpan={2} />
        <DanfeCell label="Placa do veículo" value={data.transporte.placa} colSpan={2} />
        <DanfeCell label="UF" value={data.transporte.uf} colSpan={1} />
        <DanfeCell label="CNPJ / CPF" value={data.transporte.cnpjCpf} colSpan={1} />
        <DanfeCell label="Endereço" value={data.transporte.endereco} colSpan={5} />
        <DanfeCell label="Município" value={data.transporte.municipio} colSpan={4} />
        <DanfeCell label="UF" value={data.transporte.ufEndereco} colSpan={1} />
        <DanfeCell label="Inscrição estadual" value={data.transporte.inscricaoEstadual} colSpan={2} />
        <DanfeCell label="Quantidade" value={data.transporte.quantidade} colSpan={2} />
        <DanfeCell label="Espécie" value={data.transporte.especie} colSpan={2} />
        <DanfeCell label="Marca" value={data.transporte.marca} colSpan={2} />
        <DanfeCell label="Número" value={data.transporte.numero} colSpan={2} />
        <DanfeCell label="Peso bruto" value={data.transporte.pesoBruto} colSpan={2} />
        <DanfeCell label="Peso líquido" value={data.transporte.pesoLiquido} colSpan={2} />
      </div>

      {/* Produtos */}
      <div className="grid grid-cols-12">
        <DanfeSectionBar>Dados do produto / serviço</DanfeSectionBar>
        <div className={cn(DANFE_BORDER, "col-span-12 overflow-x-auto border-t-0 border-l-0 bg-white")}>
          <table className="min-w-full border-collapse bg-white text-[9px]">
            <thead>
              <tr className={cn(DANFE_LABEL, "bg-white")}>
                {[
                  "Cód.",
                  "Descrição",
                  "NCM/SH",
                  "O/CST",
                  "CFOP",
                  "UNID",
                  "QTD",
                  "VL UNIT.",
                  "VL TOTAL",
                  "BC ICMS",
                  "VL ICMS",
                  "VL IPI",
                  "AL. ICMS",
                  "AL. IPI",
                ].map((h, i, arr) => (
                  <th
                    key={h}
                    className={cn(
                      "border-b border-[#0d0f1c] px-1 py-1 text-left font-normal",
                      i < arr.length - 1 && "border-r",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.produtos.map((item) => {
                const linhasProduto = filterNovosImpostosProdutoLinhas(
                  item.descricaoLinhas,
                  showNovosImpostos,
                );

                return (
                <tr key={item.codigo} className={DANFE_VALUE}>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.codigo}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">
                    <div>{item.descricao}</div>
                    {linhasProduto.map((linha) => (
                      <div key={linha} className="text-[8px] text-[#52525b]">
                        {linha}
                      </div>
                    ))}
                  </td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.ncm}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.ocst}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.cfop}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.unid}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.qtd}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.vlUnit}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.vlTotal}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.bcIcms}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.vlIcms}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.vlIpi}</td>
                  <td className="border-r border-t border-[#0d0f1c] px-1 py-1 align-top">{item.alIcms}</td>
                  <td className="border-t border-[#0d0f1c] px-1 py-1 align-top">{item.alIpi}</td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dados adicionais */}
      <div className="grid grid-cols-12">
        <DanfeSectionBar>Dados adicionais</DanfeSectionBar>
        <div className={cn(DANFE_BORDER, "col-span-12 min-h-[80px] border-t-0 border-l-0 bg-white p-2")}>
          <div className={DANFE_LABEL}>Informações complementares</div>
          <div className={cn(DANFE_VALUE, "mt-1 whitespace-pre-wrap")}>
            {data.informacoesComplementares}
          </div>
        </div>
      </div>

      <p className="py-2 pr-2 text-right text-[10px] text-[#71717c]">
        Notas fiscais gerenciadas pela Qive — www.qive.com.br
      </p>
    </div>
  );
}
