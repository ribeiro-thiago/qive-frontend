import { AssociatedDoc, Row } from '../types';

export function getAssociatedDocViewLabel(tipo: AssociatedDoc['tipo']): string {
  switch (tipo) {
    case 'NF-e':
    case 'NFS-e':
      return 'Ver nota';
    case 'Boleto':
      return 'Ver boleto';
    case 'Comprovante':
      return 'Ver comprovante';
    default:
      return 'Ver PDF';
  }
}

export function resolvePayer(row: Row): { nome?: string; cnpj?: string } {
  const cnpj = row.cnpjPagador;
  const docs = row.documentosAssociados ?? [];
  
  // Tenta deduzir pelo documento associado
  let docNome: string | undefined;
  for (const d of docs) {
    if (d.tipo === 'Boleto' && d.sacado) { docNome = d.sacado; break; }
    if (d.tipo === 'NF-e' && d.danfe?.destinatario?.nome) { docNome = d.danfe.destinatario.nome; break; }
    if (d.tipo === 'NFS-e' && d.tomador) { docNome = d.tomador; break; }
    if (d.tipo === 'CT-e' && d.destinatario) { docNome = d.destinatario; break; }
  }
  
  // Se o nome inferido for "Sua Empresa LTDA" (valor de exemplo), substituir por Qive
  if (docNome && docNome !== 'Sua Empresa LTDA') return { nome: docNome, cnpj };
  
  // Fallback: usar nome da empresa pelo CNPJ pagador; priorizar Qive Tecnologia
  const cnpjClean = (cnpj || '').replace(/\D/g, '');
  const map: Record<string, string> = {
    '12345678000190': 'Qive Tecnologia LTDA',
    '03160081000185': 'C.JR. Construtora LTDA',
  };
  const nome = map[cnpjClean] || 'Qive Tecnologia LTDA';
  return { nome, cnpj };
}

export const bankAccounts: Record<string, { agencia: string; conta: string }> = {
  'Itaú': { agencia: '1234', conta: '87654-3' },
  'Santander': { agencia: '4321', conta: '123456-7' },
};

export function renderBankAccount(bank: string): string {
  const acc = bankAccounts[bank];
  return acc ? `Ag ${acc.agencia} • Cc ${acc.conta}` : '';
}

