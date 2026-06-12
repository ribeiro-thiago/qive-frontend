"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { AssociatedDoc, Row } from "../../types";
import { FakeBarcode } from "../FakeBarcode";
import { formatAccessKey, formatCurrency } from "../../utils/formatters";
import { CopyableNumber } from "@/components/ui/copyable-number";

interface DANFEModalProps {
  open: boolean;
  onClose: () => void;
  doc: AssociatedDoc | null;
  currentRow?: Row | null;
}

export function DANFEModal({ open, onClose, doc, currentRow }: DANFEModalProps) {
  if (!open || !doc) return null;

  const key = doc.chaveAcesso || '';
  const keySpaced = formatAccessKey(key);
  const nf = doc.danfe || {};
  const em = nf.emitente || {};
  const de = nf.destinatario || {};
  const calc = nf.calculoImposto || {};
  const transp = nf.transporte || {};
  const vol = transp.volumes || {};
  const dups = nf.duplicatas || [];

  return (
    <ScrollableModal
      open={open}
      onClose={onClose}
      title={`${doc.tipo} ${doc.numero ? `#${doc.numero}` : ''}`.trim()}
      maxWidth="1280px"
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
          <div className="text-base font-semibold text-[#0d0f1c]">DANFE - Documento Auxiliar da Nota Fiscal Eletrônica</div>
          <div className="mt-1 text-xs text-[#5F6572]">Não permite aproveitamento de crédito do ICMS</div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="rounded-md border border-border">
            <div className="grid grid-cols-2">
              <div className="p-3 border-r border-border">
                <div className="text-xs font-semibold text-[#5F6572]">Natureza da Operação</div>
                <div className="text-sm text-[#0d0f1c]">{nf.naturezaOperacao || '—'}</div>
                <div className="mt-2 text-xs font-semibold text-[#5F6572]">Protocolo de Autorização</div>
                <div className="text-sm text-[#0d0f1c]">{nf.protocolo || '—'}</div>
              </div>
              <div className="p-3">
                <div className="text-xs font-semibold text-[#5F6572]">Chave de Acesso</div>
                <div className="mt-1 text-sm">
                  <CopyableNumber value={keySpaced} copyValue={key} ariaLabel="Copiar chave de acesso" />
                </div>
                <div className="mt-2 w-full rounded overflow-hidden">
                  <FakeBarcode value={key} height={56} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 border-b border-border">
              <div className="text-xs font-semibold text-[#5F6572]">Identificação do Emitente</div>
              <div className="mt-1 text-sm text-[#0d0f1c] font-medium">{em.nome || currentRow?.fornecedor || '—'}</div>
              <div className="text-xs text-[#5F6572]">CNPJ: {em.cnpj || currentRow?.cnpjFornecedor || '—'} • IE: {em.ie || '—'} • IM: {em.im || '—'}</div>
              <div className="text-xs text-[#5F6572]">{[em.endereco, em.bairro, em.cep, em.municipio, em.uf].filter(Boolean).join(' - ') || '—'}</div>
            </div>
            <div className="p-3">
              <div className="text-xs font-semibold text-[#5F6572]">Identificação do Destinatário</div>
              <div className="mt-1 text-sm text-[#0d0f1c] font-medium">{de.nome || (currentRow?.cnpjPagador === '12.345.678/0001-90' ? 'Qive Tecnologia LTDA - Matriz' : 'Qive Tecnologia LTDA - Filial 1')}</div>
              <div className="text-xs text-[#5F6572]">CNPJ/CPF: {de.cnpjCpf || currentRow?.cnpjPagador || '—'} • IE: {de.ie || '—'}</div>
              <div className="text-xs text-[#5F6572]">{[de.endereco, de.bairro, de.cep, de.municipio, de.uf].filter(Boolean).join(' - ') || '—'}</div>
            </div>
          </div>

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
                <div className="text-xs font-semibold text-[#5F6572]">Emissão</div>
                <div className="text-sm text-[#0d0f1c]">{doc.data || '—'}</div>
              </div>
              <div className="p-3">
                <div className="text-xs font-semibold text-[#5F6572]">Saída/Entrada</div>
                <div className="text-sm text-[#0d0f1c]">—</div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 text-sm font-semibold text-[#0d0f1c] border-b border-border">Cálculo do Imposto</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 text-xs">
              {([
                ['Base de Cálculo do ICMS', calc.baseICMS],
                ['Valor do ICMS', calc.valorICMS],
                ['Base de Cálculo do ICMS ST', calc.baseICMSST],
                ['Valor do ICMS ST', calc.valorICMSST],
                ['Valor Total dos Produtos', calc.valorProdutos],
                ['Valor do Frete', calc.valorFrete],
                ['Valor do Seguro', calc.valorSeguro],
                ['Desconto', calc.desconto],
                ['Outras Despesas', calc.outrasDespesas],
                ['Valor do IPI', calc.valorIPI],
                ['Valor Total da Nota', calc.valorTotalNota],
              ] as const).map(([label, val], i) => (
                <div key={i} className={["p-3", i % 3 !== 2 ? "border-r border-border" : "", i < 9 ? "border-b border-border" : ""].join(' ')}>
                  <div className="text-[11px] font-semibold text-[#5F6572]">{label}</div>
                  <div className="mt-1 text-sm text-[#0d0f1c]">
                    {typeof val === 'number' ? formatCurrency(val) : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 text-sm font-semibold text-[#0d0f1c] border-b border-border">Transportador / Volumes Transportados</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 text-xs">
              {([
                ['Modalidade do Frete', transp.modalidadeFrete === '0' ? 'Emitente' : transp.modalidadeFrete === '1' ? 'Destinatário' : transp.modalidadeFrete || '—'],
                ['Transportador', transp.transportador || '—'],
                ['Placa do Veículo', transp.placa || '—'],
                ['UF', transp.uf || '—'],
                ['RNTC', transp.rntc || '—'],
                ['Quantidade', vol.quantidade != null ? String(vol.quantidade) : '—'],
                ['Espécie', vol.especie || '—'],
                ['Marca', vol.marca || '—'],
                ['Numeração', vol.numeracao || '—'],
                ['Peso Bruto', vol.pesoBruto != null ? `${vol.pesoBruto} kg` : '—'],
                ['Peso Líquido', vol.pesoLiquido != null ? `${vol.pesoLiquido} kg` : '—'],
              ] as const).map(([label, val], i, arr) => (
                <div key={i} className={["p-3", (i % 3 !== 2) ? "border-r border-border" : "", i < arr.length - 3 ? "border-b border-border" : ""].join(' ')}>
                  <div className="text-[11px] font-semibold text-[#5F6572]">{label}</div>
                  <div className="mt-1 text-sm text-[#0d0f1c]">{val as string}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="p-3 text-sm font-semibold text-[#0d0f1c] border-b border-border">Fatura / Duplicatas</div>
            {dups.length > 0 ? (
              <div className="p-3 text-sm text-[#0d0f1c]">
                {dups.map((dp, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div><span className="text-xs font-semibold text-[#5F6572]">Nº:</span> {dp.numero || '—'}</div>
                    <div><span className="text-xs font-semibold text-[#5F6572]">Venc.:</span> {dp.vencimento || '—'}</div>
                    <div><span className="text-xs font-semibold text-[#5F6572]">Valor:</span> {dp.valor != null ? formatCurrency(dp.valor) : '—'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-sm text-[#90949D]">Nenhuma duplicata</div>
            )}
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-[#0d0f1c]">Dados dos Produtos / Serviços</div>
            <div className="overflow-x-auto">
              <div className="min-w-full rounded-md border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="h-9 border-b border-border text-left bg-[#F5F5F6]">
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Descrição</th>
                      <th className="px-3 py-2">NCM/SH</th>
                      <th className="px-3 py-2">CFOP</th>
                      <th className="px-3 py-2">CST</th>
                      <th className="px-3 py-2">UN</th>
                      <th className="px-3 py-2">Qtd.</th>
                      <th className="px-3 py-2">V. Unit</th>
                      <th className="px-3 py-2">V. Total</th>
                      <th className="px-3 py-2">BC ICMS</th>
                      <th className="px-3 py-2">V. ICMS</th>
                      <th className="px-3 py-2">V. IPI</th>
                      <th className="px-3 py-2">Alíq ICMS</th>
                      <th className="px-3 py-2">Alíq IPI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(doc.itens && doc.itens.length > 0) ? doc.itens.map((it, ii) => (
                      <tr key={ii} className="h-10 border-b border-border last:border-b-0">
                        <td className="px-3 py-2 text-[#5F6572]">{it.codigo || '—'}</td>
                        <td className="px-3 py-2 text-[#0d0f1c]">{it.descricao}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.ncm || '—'}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.cfop || '—'}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.cst || '—'}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.unidade}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.quantidade}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{formatCurrency(it.precoUnitario)}</td>
                        <td className="px-3 py-2 text-[#0d0f1c] font-medium">{formatCurrency(it.valorTotal)}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.bcICMS != null ? formatCurrency(it.bcICMS) : '—'}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.vICMS != null ? formatCurrency(it.vICMS) : '—'}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.vIPI != null ? formatCurrency(it.vIPI) : '—'}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.aliqICMS != null ? `${it.aliqICMS}%` : '—'}</td>
                        <td className="px-3 py-2 text-[#5F6572]">{it.aliqIPI != null ? `${it.aliqIPI}%` : '—'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={14} className="px-3 py-3 text-sm text-[#90949D]">Nenhum item</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-3 border-b md:border-b-0 md:border-r border-border">
                <div className="text-xs font-semibold text-[#5F6572]">Informações Complementares</div>
                <div className="mt-1 text-sm text-[#0d0f1c] whitespace-pre-wrap">{nf.dadosAdicionais?.informacoesComplementares || '—'}</div>
              </div>
              <div className="p-3">
                <div className="text-xs font-semibold text-[#5F6572]">Reservado ao Fisco</div>
                <div className="mt-1 text-sm text-[#0d0f1c] whitespace-pre-wrap">{nf.dadosAdicionais?.reservadoAoFisco || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollableModal>
  );
}
