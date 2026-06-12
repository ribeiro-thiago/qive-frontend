export type NFeStatus = 
  | 'Autorizada' 
  | 'Cancelada' 
  | 'Denegada' 
  | 'Rejeitada' 
  | 'Inutilizada'
  | 'Pendente';

export type NFeManifestacao = 
  | 'Ciência da Operação'
  | 'Confirmação da Operação'
  | 'Desconhecimento da Operação'
  | 'Operação não Realizada'
  | 'Não Manifestada';

export type NFeOrigem = 
  | 'Importação XML'
  | 'Importação Manual'
  | 'Sincronização ERP'
  | 'API'
  | 'E-mail';

export type NFeTab = 'recebidas' | 'emitidas' | 'transporte' | 'citadas';

export type NFeTipo = 'Entrada' | 'Saída';

export interface NFeEmitente {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  endereco?: string;
  municipio?: string;
  uf?: string;
  telefone?: string;
}

export interface NFeDestinatario {
  razaoSocial: string;
  cnpjCpf: string;
  inscricaoEstadual?: string;
  endereco?: string;
  municipio?: string;
  uf?: string;
}

export interface NFeProduto {
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  valorIcms?: number;
  valorIpi?: number;
  aliquotaIcms?: number;
  aliquotaIpi?: number;
}

export interface NFeImposto {
  baseIcms?: number;
  valorIcms?: number;
  baseIcmsSt?: number;
  valorIcmsSt?: number;
  valorFrete?: number;
  valorSeguro?: number;
  desconto?: number;
  outrasDespesas?: number;
  valorIpi?: number;
  valorPis?: number;
  valorCofins?: number;
}

export interface NFeTransporte {
  modalidade?: string;
  transportadora?: {
    razaoSocial?: string;
    cnpj?: string;
    inscricaoEstadual?: string;
    endereco?: string;
  };
  veiculo?: {
    placa?: string;
    uf?: string;
    rntc?: string;
  };
  volumes?: {
    quantidade?: number;
    especie?: string;
    marca?: string;
    pesoBruto?: number;
    pesoLiquido?: number;
  };
}

export interface NFe {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso: string;
  tipo: NFeTipo;
  status: NFeStatus;
  manifestacao?: NFeManifestacao;
  
  // Datas
  dataEmissao: string;
  dataSaida?: string;
  dataAutorizacao?: string;
  dataImportacao: string;
  
  // Valores
  valor: number;
  valorProdutos: number;
  valorIcms?: number;
  valorIpi?: number;
  
  // Partes
  emitente: NFeEmitente;
  destinatario: NFeDestinatario;
  
  // Dados fiscais
  cfops: string[];
  naturezaOperacao: string;
  protocolo?: string;
  
  // Produtos/Itens
  produtos?: NFeProduto[];
  quantidadeItens: number;
  
  // Impostos
  impostos?: NFeImposto;
  
  // Transporte
  transporte?: NFeTransporte;
  
  // Metadados
  origem: NFeOrigem;
  lancadoEm: NFeTab;
  comentarios?: string;
  etiquetas?: string[];
  
  // Sincronização
  sincronizadoERP: boolean;
  erpAtualizandoEm?: Date;
  
  // Anexos
  xmlUrl?: string;
  pdfUrl?: string;
  
  // Empresa (para filtro)
  empresaCnpj: string;
  empresaNome: string;
  
  // UF origem e destino
  ufOrigem?: string;
  ufDestino?: string;
  
  // Modelo
  modelo?: string;
  
  // Prazo de manifestação (para recebidas)
  prazoManifestacao?: string;
}

export interface NFeFilter {
  query: string;
  period: string;
  startDate?: Date;
  endDate?: Date;
}

export interface NFeStats {
  total: number;
  totalValue: number;
  byStatus: Record<NFeStatus, { count: number; value: number }>;
  byManifestacao?: Record<NFeManifestacao, { count: number; value: number }>;
}

