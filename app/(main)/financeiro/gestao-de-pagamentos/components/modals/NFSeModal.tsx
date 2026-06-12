"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { AssociatedDoc, Row } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface NFSeModalProps {
  open: boolean;
  onClose: () => void;
  doc: AssociatedDoc | null;
  currentRow?: Row | null;
}

export function NFSeModal({ open, onClose, doc, currentRow }: NFSeModalProps) {
  if (!open || !doc) return null;

  return (
    <ScrollableModal
      open={open}
      onClose={onClose}
      title={`${doc.tipo} ${doc.numero ? `#${doc.numero}` : ''}`.trim()}
      maxWidth="896px"
      showClose={true}
      actions={
        <div className="flex items-center gap-2">
          <Button size="default" className="inline-flex items-center gap-2 font-bold">
            <Download className="h-4 w-4" aria-hidden />
            Baixar PDF
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="rounded-lg border border-border bg-white p-4">
        <div className="text-center">
          <div className="text-base font-semibold text-[#0d0f1c]">Nota Fiscal de Serviços Eletrônica</div>
          <div className="mt-1 text-xs text-[#5F6572]">Documento fiscal eletrônico de prestação de serviços</div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="rounded-md border border-border">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              <div className="p-3 border-r border-border">
                <div className="text-xs font-semibold text-[#5F6572]">Número</div>
                <div className="text-sm text-[#0d0f1c]">{doc.numero || '—'}</div>
              </div>
              <div className="p-3 border-r border-border">
                <div className="text-xs font-semibold text-[#5F6572]">Série</div>
                <div className="text-sm text-[#0d0f1c]">{doc.serie || '—'}</div>
              </div>
              <div className="p-3 border-r border-border">
                <div className="text-xs font-semibold text-[#5F6572]">Data de Emissão</div>
                <div className="text-sm text-[#0d0f1c]">{doc.data || '—'}</div>
              </div>
              <div className="p-3">
                <div className="text-xs font-semibold text-[#5F6572]">Valor do Serviço</div>
                <div className="text-sm text-[#0d0f1c] font-semibold">{doc.valor != null ? formatCurrency(doc.valor) : '—'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 border-b border-border">
              <div className="text-xs font-semibold text-[#5F6572]">Prestador de Serviços</div>
              <div className="mt-1 text-sm text-[#0d0f1c] font-medium">{currentRow?.fornecedor || '—'}</div>
              <div className="text-xs text-[#5F6572]">CNPJ: {currentRow?.cnpjFornecedor || '—'}</div>
            </div>
            <div className="p-3">
              <div className="text-xs font-semibold text-[#5F6572]">Tomador de Serviços</div>
              <div className="mt-1 text-sm text-[#0d0f1c] font-medium">{doc.tomador || (currentRow?.cnpjPagador === '12.345.678/0001-90' ? 'Qive Tecnologia LTDA - Matriz' : 'Qive Tecnologia LTDA - Filial 1')}</div>
              <div className="text-xs text-[#5F6572]">CNPJ: {currentRow?.cnpjPagador || '—'}</div>
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 text-sm font-semibold text-[#0d0f1c] border-b border-border">Discriminação dos Serviços</div>
            <div className="p-3">
              <div className="text-sm text-[#0d0f1c]">{doc.descricaoServico || 'Prestação de serviços conforme nota fiscal.'}</div>
              {doc.municipio && (
                <div className="mt-2 text-xs text-[#5F6572]">
                  <span className="font-semibold">Município de prestação:</span> {doc.municipio}
                </div>
              )}
              {doc.codigoVerificacao && (
                <div className="mt-1 text-xs text-[#5F6572]">
                  <span className="font-semibold">Código de verificação:</span> {doc.codigoVerificacao}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 text-sm font-semibold text-[#0d0f1c] border-b border-border">Valores</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 text-xs">
              {([
                ['Valor dos Serviços', doc.valor],
                ['(-) Descontos', 0],
                ['Base de Cálculo', doc.valor],
                ['Alíquota ISS', doc.aliquotaISS ? `${doc.aliquotaISS}%` : '5%'],
                ['Valor do ISS', doc.valorISS || (doc.valor ? doc.valor * 0.05 : 0)],
                ['Valor Líquido', doc.valor],
              ] as const).map(([label, val], i) => (
                <div key={i} className={["p-3", i % 3 !== 2 ? "border-r border-border" : "", i < 3 ? "border-b border-border" : ""].join(' ')}>
                  <div className="text-[11px] font-semibold text-[#5F6572]">{label}</div>
                  <div className="mt-1 text-sm text-[#0d0f1c]">
                    {typeof val === 'number' ? formatCurrency(val) : val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {doc.retencoes && (
            <div className="rounded-md border border-border">
              <div className="p-3 text-sm font-semibold text-[#0d0f1c] border-b border-border">Retenções Federais</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 text-xs">
                {([
                  ['IR', doc.retencoes.valorIR],
                  ['PIS', doc.retencoes.valorPIS],
                  ['COFINS', doc.retencoes.valorCOFINS],
                  ['CSLL', doc.retencoes.valorCSLL],
                ] as const).map(([label, val], i) => (
                  <div key={i} className={["p-3", i !== 3 ? "border-r border-border" : ""].join(' ')}>
                    <div className="text-[11px] font-semibold text-[#5F6572]">{label}</div>
                    <div className="mt-1 text-sm text-[#0d0f1c]">
                      {typeof val === 'number' ? formatCurrency(val) : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollableModal>
  );
}
