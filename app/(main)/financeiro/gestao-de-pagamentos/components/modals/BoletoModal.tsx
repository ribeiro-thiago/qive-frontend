"use client";

import { Button } from "@/components/ui/button";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { AssociatedDoc, Row } from "../../types";
import { BankIcon } from "../BankIcon";
import { FakeBarcode } from "../FakeBarcode";
import { formatCurrency } from "../../utils/formatters";
import { CopyableNumber } from "@/components/ui/copyable-number";
import { Download } from "lucide-react";

interface BoletoModalProps {
  open: boolean;
  onClose: () => void;
  doc: AssociatedDoc | null;
  currentRow?: Row | null;
}

export function BoletoModal({ open, onClose, doc, currentRow }: BoletoModalProps) {
  if (!open || !doc) return null;

  const banco = doc.banco || '—';
  const valor = doc.valor != null ? formatCurrency(doc.valor) : formatCurrency(currentRow?.valor ?? 0);
  const codigo = (doc.codigoBarras || '').replace(/\s+/g, '');
  const codigoFmt = doc.codigoBarras || '00190.00009 01234.567890 12345.678901 2 95640000153240';

  return (
    <ScrollableModal
      open={open}
      onClose={onClose}
      title={`${doc.tipo} ${doc.numero ? `#${doc.numero}` : ''}`.trim()}
      maxWidth="1000px"
      showClose={true}
      actions={
        <Button size="default" className="px-5 inline-flex items-center gap-2 font-bold">
          <Download className="h-4 w-4" aria-hidden />
          Baixar PDF
        </Button>
      }
    >
      <div className="rounded-lg border border-border bg-white p-4">
        {/* Primeira linha do boleto - Header com logo, código do banco e linha digitável */}
        <div className="h-[74px] flex items-center border-b border-gray-300">
          <div className="flex items-center h-full">
            {/* Container do logo */}
            <div className="flex items-center justify-center w-20">
              <BankIcon bank="Itaú" size={32} />
            </div>
            {/* Divisória vertical */}
            <div className="w-[1px] h-full bg-gray-400"></div>
            {/* Container do código do banco */}
            <div className="flex items-center justify-center w-24">
              <div className="text-xl font-bold text-[#0d0f1c]">341</div>
            </div>
            {/* Divisória vertical */}
            <div className="w-[1px] h-full bg-gray-400"></div>
            {/* Linha digitável */}
            <div className="flex-1 flex items-center px-4">
              <div className="text-base tracking-wider whitespace-nowrap">h
                <CopyableNumber value={codigoFmt} copyValue={codigo} ariaLabel="Copiar código de barras" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Segunda linha do boleto - Beneficiário, Vencimento e Espécie */}
        <div className="h-[74px] flex border-b border-gray-300">
          {/* Primeiro quadrante - Nome do beneficiário / CNPJ */}
          <div className="w-1/2 p-3 border-r border-gray-300">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">Nome do beneficiário / CNPJ</div>
            <div className="text-sm text-[#0d0f1c]">
              {doc.cedente || currentRow?.fornecedor || '—'} • CNPJ: {currentRow?.cnpjFornecedor || '—'}
            </div>
          </div>
          
          {/* Segundo quadrante - Data de vencimento */}
          <div className="w-56 p-3 border-r border-gray-300 bg-gray-100">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">Data de vencimento</div>
            <div className="text-sm text-[#0d0f1c]">
              {doc.vencimento || currentRow?.vencimento || '—'}
            </div>
          </div>
          
          {/* Terceiro quadrante - Espécie */}
          <div className="w-24 p-3">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">Espécie</div>
            <div className="text-sm text-[#0d0f1c]">BRL</div>
          </div>
        </div>
        
        {/* Terceira linha do boleto - Documento, Nosso Número, Nº do Documento e Valor */}
        <div className="h-[74px] flex border-b border-gray-300">
          {/* Primeiro quadrante - Data do documento */}
          <div className="w-1/4 p-3 border-r border-gray-300">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">Data do documento</div>
            <div className="text-sm text-[#0d0f1c]">
              {doc.data || '12/09/2025'}
            </div>
          </div>
          
          {/* Segundo quadrante - Nosso número */}
          <div className="w-1/4 p-3 border-r border-gray-300">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">Nosso Número</div>
            <div className="text-sm text-[#0d0f1c]">
              {doc.nossoNumero || '09111216710900455068'}
            </div>
          </div>
          
          {/* Terceiro quadrante - Nº do documento */}
          <div className="w-1/6 p-3 border-r border-gray-300">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">N° do Documento</div>
            <div className="text-sm text-[#0d0f1c]">
              {doc.numero || '—'}
            </div>
          </div>
          
          {/* Quarto quadrante - Valor Documento */}
          <div className="w-1/3 p-3">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">(=) Valor Documento</div>
            <div className="text-sm text-[#0d0f1c]">
              {valor}
            </div>
          </div>
        </div>
        
        {/* Quarta linha do boleto - Instruções e Descontos */}
        <div className="h-[74px] flex">
          {/* Primeiro quadrante - Instruções (conectado às próximas linhas) */}
          <div className="w-2/3 p-3 border-r border-gray-300">
            <div className="text-sm text-[#0d0f1c]">
              Instruções (texto de responsabilidade do cedente) Produto ou serviço entregue por {doc.cedente || currentRow?.fornecedor || '—'}.
            </div>
          </div>
          
          {/* Segundo quadrante - Descontos */}
          <div className="w-1/3 p-3 border-b border-gray-300">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">(-) Descontos / abatimento</div>
            <div className="text-sm text-[#0d0f1c]">
              {doc.descontos != null && doc.descontos > 0 ? formatCurrency(doc.descontos) : '—'}
            </div>
          </div>
        </div>
        
        {/* Quinta linha do boleto - Instruções e Mora */}
        <div className="h-[74px] flex">
          {/* Primeiro quadrante - Instruções (conectado às outras linhas) */}
          <div className="w-2/3 p-3 border-r border-gray-300">
            {/* Vazio conforme especificado */}
          </div>
          
          {/* Segundo quadrante - Mora */}
          <div className="w-1/3 p-3 border-b border-gray-300">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">(+) Mora / Multa</div>
            <div className="text-sm text-[#0d0f1c]">
              {doc.moraMulta != null && doc.moraMulta > 0 ? formatCurrency(doc.moraMulta) : '—'}
            </div>
          </div>
        </div>
        
        {/* Sexta linha do boleto - Instruções e Valor Cobrado */}
        <div className="h-[74px] flex border-b border-gray-300">
          {/* Primeiro quadrante - Instruções (conectado às outras linhas) */}
          <div className="w-2/3 p-3 border-r border-gray-300">
            <div className="text-sm text-[#0d0f1c]">
              Em caso de atraso no pagamento recomenda-se entrar em contato com o beneficiário para informações sobre condições.
            </div>
          </div>
          
          {/* Segundo quadrante - Valor Cobrado */}
          <div className="w-1/3 p-3 bg-gray-100">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">(=) Valor Cobrado</div>
            <div className="text-sm text-[#0d0f1c]">
              {valor}
            </div>
          </div>
        </div>
        
        {/* Sétima linha do boleto - Pagador */}
        <div className="h-[74px] flex border-b border-gray-300">
          <div className="w-full p-3">
            <div className="text-sm font-semibold text-[#5F6572] mb-1">Pagador</div>
            <div className="text-sm text-[#0d0f1c]">
              {doc.sacado || (currentRow?.cnpjPagador === '12.345.678/0001-90' ? 'Qive Tecnologia LTDA - Matriz' : 'Qive Tecnologia LTDA - Filial 1')} • CNPJ: {currentRow?.cnpjPagador || '—'}
            </div>
          </div>
        </div>
        
        {/* Código de barras */}
        <div className="mt-4">
          <div className="w-full rounded overflow-hidden">
            <FakeBarcode value={codigo || (currentRow?.id || '000000000000')} height={56} />
          </div>
        </div>
      </div>
    </ScrollableModal>
  );
}
