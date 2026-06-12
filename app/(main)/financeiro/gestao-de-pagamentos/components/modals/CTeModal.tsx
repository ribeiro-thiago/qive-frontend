"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { AssociatedDoc, Row } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface CTeModalProps {
  open: boolean;
  onClose: () => void;
  doc: AssociatedDoc | null;
  currentRow?: Row | null;
}

export function CTeModal({ open, onClose, doc, currentRow }: CTeModalProps) {
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
          <div className="text-base font-semibold text-[#0d0f1c]">DACTE - Documento Auxiliar do CT-e</div>
          <div className="mt-1 text-xs text-[#5F6572]">Conhecimento de Transporte Eletrônico</div>
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
                <div className="text-xs font-semibold text-[#5F6572]">Modal</div>
                <div className="text-sm text-[#0d0f1c]">{doc.modalidade || 'Rodoviário'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 border-b border-border">
              <div className="text-xs font-semibold text-[#5F6572]">Remetente</div>
              <div className="mt-1 text-sm text-[#0d0f1c] font-medium">{doc.remetente || currentRow?.fornecedor || '—'}</div>
              <div className="text-xs text-[#5F6572]">CNPJ: {currentRow?.cnpjFornecedor || '—'}</div>
              <div className="text-xs text-[#5F6572]">{doc.origem || '—'}</div>
            </div>
            <div className="p-3 border-b border-border">
              <div className="text-xs font-semibold text-[#5F6572]">Destinatário</div>
              <div className="mt-1 text-sm text-[#0d0f1c] font-medium">{doc.destinatario || (currentRow?.cnpjPagador === '12.345.678/0001-90' ? 'Qive Tecnologia LTDA - Matriz' : 'Qive Tecnologia LTDA - Filial 1')}</div>
              <div className="text-xs text-[#5F6572]">CNPJ: {currentRow?.cnpjPagador || '—'}</div>
              <div className="text-xs text-[#5F6572]">{doc.destino || '—'}</div>
            </div>
            <div className="p-3">
              <div className="text-xs font-semibold text-[#5F6572]">Tipo de Serviço</div>
              <div className="mt-1 text-sm text-[#0d0f1c]">{doc.tipoServico || 'Normal'}</div>
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 text-sm font-semibold text-[#0d0f1c] border-b border-border">Informações da Carga</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 text-xs">
              {([
                ['Natureza da Carga', doc.naturezaCarga || 'Mercadorias diversas'],
                ['Peso Total (kg)', doc.pesoTotal ? doc.pesoTotal.toFixed(2) : '—'],
                ['Qtd. de Volumes', doc.quantidadeVolumes?.toString() || '—'],
                ['Valor da Carga', doc.valorCarga ? formatCurrency(doc.valorCarga) : '—'],
              ] as const).map(([label, val], i) => (
                <div key={i} className={["p-3", i !== 3 ? "border-r border-border" : ""].join(' ')}>
                  <div className="text-[11px] font-semibold text-[#5F6572]">{label}</div>
                  <div className="mt-1 text-sm text-[#0d0f1c]">{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 text-sm font-semibold text-[#0d0f1c] border-b border-border">Componentes do Valor da Prestação</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 text-xs">
              {([
                ['Valor do Serviço', doc.valor],
                ['Valor a Receber', doc.valor],
                ['ICMS', 0],
              ] as const).map(([label, val], i) => (
                <div key={i} className={["p-3", i !== 2 ? "border-r border-border" : ""].join(' ')}>
                  <div className="text-[11px] font-semibold text-[#5F6572]">{label}</div>
                  <div className="mt-1 text-sm text-[#0d0f1c]">
                    {typeof val === 'number' ? formatCurrency(val) : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 text-sm font-semibold text-[#0d0f1c] border-b border-border">Informações do Veículo</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 text-xs">
              {([
                ['Tipo de Veículo', doc.tipoVeiculo || '—'],
                ['Placa', doc.placa || '—'],
                ['UF', doc.ufVeiculo || '—'],
              ] as const).map(([label, val], i) => (
                <div key={i} className={["p-3", i !== 2 ? "border-r border-border" : ""].join(' ')}>
                  <div className="text-[11px] font-semibold text-[#5F6572]">{label}</div>
                  <div className="mt-1 text-sm text-[#0d0f1c]">{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3">
              <div className="text-xs font-semibold text-[#5F6572]">Observações</div>
              <div className="mt-1 text-sm text-[#0d0f1c]">{doc.observacoes || 'Transporte conforme CT-e.'}</div>
            </div>
          </div>
        </div>
      </div>
    </ScrollableModal>
  );
}
