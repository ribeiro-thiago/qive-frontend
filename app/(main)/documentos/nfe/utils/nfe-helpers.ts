import { NFe, NFeStatus, NFeManifestacao } from '../types';

export function getNFeStatusColor(status: NFeStatus): string {
  const colors: Record<NFeStatus, string> = {
    'Autorizada': 'emerald',
    'Cancelada': 'gray',
    'Denegada': 'red',
    'Rejeitada': 'orange',
    'Inutilizada': 'gray',
    'Pendente': 'yellow',
  };
  return colors[status] || 'gray';
}

export function getManifestacaoColor(manifestacao: NFeManifestacao): string {
  const colors: Record<NFeManifestacao, string> = {
    'Ciência da Operação': 'blue',
    'Confirmação da Operação': 'emerald',
    'Desconhecimento da Operação': 'red',
    'Operação não Realizada': 'orange',
    'Não Manifestada': 'gray',
  };
  return colors[manifestacao] || 'gray';
}

export function isNFeRecebida(nfe: NFe): boolean {
  return nfe.tipo === 'Entrada' && nfe.lancadoEm === 'recebidas';
}

export function isNFeEmitida(nfe: NFe): boolean {
  return nfe.tipo === 'Saída' && nfe.lancadoEm === 'emitidas';
}

export function canManifestar(nfe: NFe): boolean {
  return (
    isNFeRecebida(nfe) &&
    nfe.status === 'Autorizada' &&
    (!nfe.manifestacao || nfe.manifestacao === 'Não Manifestada')
  );
}

export function needsManifestacao(nfe: NFe): boolean {
  return (
    isNFeRecebida(nfe) &&
    nfe.status === 'Autorizada' &&
    nfe.manifestacao === 'Não Manifestada'
  );
}

export function getCompanyRole(nfe: NFe, companyCNPJ: string): 'emitente' | 'destinatario' | 'citada' | null {
  const cleanCNPJ = (cnpj: string) => cnpj.replace(/\D/g, '');
  const cleanCompany = cleanCNPJ(companyCNPJ);
  
  if (cleanCNPJ(nfe.emitente.cnpj) === cleanCompany) return 'emitente';
  if (cleanCNPJ(nfe.destinatario.cnpjCpf) === cleanCompany) return 'destinatario';
  if (nfe.lancadoEm === 'citadas') return 'citada';
  
  return null;
}

export function downloadXML(nfe: NFe): void {
  // Simula download de XML
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${nfe.chaveAcesso}">
      <ide>
        <cUF>35</cUF>
        <nNF>${nfe.numero}</nNF>
        <serie>${nfe.serie}</serie>
        <dhEmi>${nfe.dataEmissao}</dhEmi>
      </ide>
      <emit>
        <CNPJ>${nfe.emitente.cnpj.replace(/\D/g, '')}</CNPJ>
        <xNome>${nfe.emitente.razaoSocial}</xNome>
      </emit>
      <dest>
        <CNPJ>${nfe.destinatario.cnpjCpf.replace(/\D/g, '')}</CNPJ>
        <xNome>${nfe.destinatario.razaoSocial}</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vNF>${nfe.valor.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NFe_${nfe.numero}_${nfe.chaveAcesso.slice(0, 8)}.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function exportToCSV(nfes: NFe[]): void {
  const headers = [
    'Número',
    'Série',
    'Chave de Acesso',
    'Data Emissão',
    'Emitente',
    'CNPJ Emitente',
    'Destinatário',
    'CNPJ Destinatário',
    'Valor',
    'Status',
    'CFOPs',
  ];

  const rows = nfes.map(nfe => [
    nfe.numero,
    nfe.serie,
    nfe.chaveAcesso,
    nfe.dataEmissao,
    nfe.emitente.razaoSocial,
    nfe.emitente.cnpj,
    nfe.destinatario.razaoSocial,
    nfe.destinatario.cnpjCpf,
    nfe.valor.toFixed(2),
    nfe.status,
    nfe.cfops.join('; '),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nfe_export_${new Date().getTime()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

