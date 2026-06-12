export type DocumentoAnexo = {
  id: string;
  nome: string;
  extensao: string;
  tamanhoBytes: number;
  dataEnvio?: string;
  canDelete?: boolean;
  apagado?: boolean;
};

export type FornecedorAcessoPortalStatus = "ativo" | "convite-pendente" | "sem-acesso";

export type DocumentoMensagem = {
  id: string;
  autor: string;
  dataHora: string;
  texto?: string;
  anexos?: DocumentoAnexo[];
};

export const DOCUMENTO_SITUACAO_DFE_VALUES = {
  CAPTURED: "captured",
  RELEASED: "released",
  AWAITING_APPROVAL: "awaiting-approval",
} as const;

export type DocumentoSituacaoDfe =
  (typeof DOCUMENTO_SITUACAO_DFE_VALUES)[keyof typeof DOCUMENTO_SITUACAO_DFE_VALUES];

export type DocumentoComprovanteStatus = "Pago" | "Agendado";

export type DocumentoComprovante = {
  status: DocumentoComprovanteStatus;
  valorLiquido: number;
  data: string;
  /** Conta de destino (resumo). */
  banco: string;
  agencia: string;
  contaMascarada: string;
  /** Conta bancária de origem do pagamento. */
  bancoOrigem: string;
  agenciaOrigem: string;
  contaOrigemMascarada: string;
  pagador: string;
  cnpjPagador: string;
  favorecido: string;
  dataVencimento: string;
  formaPagamento: string;
  codigoBoleto?: string | null;
  codigoAutenticacao?: string | null;
  pdfDisponivel: boolean;
};

export type PortalDocumentoRow = {
  id: number;
  tipoDocumento: string;
  nfNumero: string;
  dataEmissao: string;
  cnpjEmissor: string;
  nomeEmissor: string;
  cnpjDestinatario: string;
  valor: string;
  etapa: string;
  /** Situação no funil de governança do DF-e. Quando ausente, é derivada da etapa. */
  situacaoDfe?: DocumentoSituacaoDfe;
  aprovadores: string;
  aprovacoesNecessarias: string;
  showCommunicationAlert: boolean;
  /** Status do acesso do fornecedor emissor ao portal. Default implícito: "ativo". */
  fornecedorAcessoPortal?: FornecedorAcessoPortalStatus;
  anexosDocumento: DocumentoAnexo[];
  mensagensFornecedor: DocumentoMensagem[];
  mensagensInterno: DocumentoMensagem[];
  /** Ausente ou null = sem comprovante (empty state na aba). */
  comprovante?: DocumentoComprovante | null;
};

export type PendingAttachment = {
  file: File;
  id: string;
};

export type DocumentoOrigemTipo = "PO" | "FRS";

export type DocumentoOrigemRastreabilidadeMode = "complete" | "incomplete";

export type DocumentoOrigemRastreabilidade = {
  loteProduto: string;
  dataFabricacao: string;
  dataVencimento: string;
};

export type DocumentoOrigemPoItem = {
  id: string;
  docCompra: string;
  item: string;
  material: string;
  textoInfo: string;
  qtdePedido: string;
  precoLiquido: string;
  saldo: string;
  ump: string;
};

export type DocumentoOrigemFrsItem = {
  id: string;
  numeroFrs: string;
  item: string;
  codigo: string;
  descricao: string;
  qtde: string;
  precoLiquido: string;
  saldo: string;
  ump: string;
  /** Quando preenchido, exige Lote, Data de Fabricação e Data de Vencimento. */
  rastreabilidadeMode?: DocumentoOrigemRastreabilidadeMode;
  rastreabilidade?: DocumentoOrigemRastreabilidade;
};

export type DocumentoOrigemVinculo = {
  origemId: string;
  tipo: DocumentoOrigemTipo;
  numeroDocumento: string;
  item: string;
  codigo: string;
  descricao: string;
  rastreabilidade?: DocumentoOrigemRastreabilidade;
};

export type VinculoOrigemTableRow =
  | { tipo: "PO"; data: DocumentoOrigemPoItem }
  | { tipo: "FRS"; data: DocumentoOrigemFrsItem };

export const DOCUMENTO_LOG_EVENT_TYPES = {
  DOCUMENTO_RECEBIDO: "documento-recebido",
  STATUS_ALTERADO: "status-alterado",
  DOCUMENTO_APROVADO: "documento-aprovado",
  PO_VINCULADA: "po-vinculada",
  FRS_VINCULADA: "frs-vinculada",
  COMPROVANTE_REGISTRADO: "comprovante-registrado",
  COMENTARIO_ENVIADO: "comentario-enviado",
  ANEXO_ENVIADO: "anexo-enviado",
  ENVIADO_ERP: "enviado-erp",
} as const;

export type DocumentoLogEventType =
  (typeof DOCUMENTO_LOG_EVENT_TYPES)[keyof typeof DOCUMENTO_LOG_EVENT_TYPES];

export type DocumentoLog = {
  id: string;
  documentoId: number;
  eventType: DocumentoLogEventType;
  description: string;
  responsibleName: string;
  responsibleEmail: string;
  createdAt: string;
};
