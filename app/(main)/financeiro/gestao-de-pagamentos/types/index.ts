export type AssociatedDoc = {
  tipo: 'NF-e' | 'NFS-e' | 'CT-e' | 'Boleto' | 'Comprovante';
  numero?: string;
  serie?: string;
  chaveAcesso?: string;
  situacao?: string;
  data?: string;
  valor?: number;
  xml?: {
    CBS?: number;
  };
  formaPagamento?: string;
  itens?: Array<{
    descricao: string;
    unidade: string;
    quantidade: number;
    precoUnitario: number;
    valorTotal: number;
    codigo?: string;
    ncm?: string;
    cfop?: string;
    cst?: string;
    bcICMS?: number;
    vICMS?: number;
    vIPI?: number;
    aliqICMS?: number;
    aliqIPI?: number;
  }>;
  danfe?: {
    naturezaOperacao?: string;
    protocolo?: string;
    emitente?: {
      nome?: string;
      cnpj?: string;
      endereco?: string;
      bairro?: string;
      cep?: string;
      municipio?: string;
      uf?: string;
      ie?: string;
      im?: string;
    };
    destinatario?: {
      nome?: string;
      cnpjCpf?: string;
      endereco?: string;
      bairro?: string;
      cep?: string;
      municipio?: string;
      uf?: string;
      ie?: string;
    };
    calculoImposto?: {
      baseICMS?: number;
      valorICMS?: number;
      baseICMSST?: number;
      valorICMSST?: number;
      valorProdutos?: number;
      valorFrete?: number;
      valorSeguro?: number;
      desconto?: number;
      outrasDespesas?: number;
      valorIPI?: number;
      valorTotalNota?: number;
    };
    transporte?: {
      modalidadeFrete?: string;
      transportador?: string;
      placa?: string;
      uf?: string;
      rntc?: string;
      volumes?: {
        quantidade?: number;
        especie?: string;
        marca?: string;
        numeracao?: string;
        pesoBruto?: number;
        pesoLiquido?: number;
      };
    };
    duplicatas?: Array<{ numero?: string; vencimento?: string; valor?: number }>;
    dadosAdicionais?: { informacoesComplementares?: string; reservadoAoFisco?: string };
  };
  banco?: string;
  vencimento?: string;
  cedente?: string;
  sacado?: string;
  nossoNumero?: string;
  seuNumero?: string;
  codigoBarras?: string;
  descontos?: number;
  moraMulta?: number;
  pagador?: string;
  cnpjPagador?: string;
  remetente?: string;
  destinatario?: string;
  origem?: string;
  destino?: string;
  pesoTotal?: number;
  valorCarga?: number;
  modalidade?: string;
  tipoServico?: string;
  naturezaCarga?: string;
  quantidadeVolumes?: number;
  tipoVeiculo?: string;
  placa?: string;
  ufVeiculo?: string;
  observacoes?: string;
  codigoVerificacao?: string;
  prestador?: string;
  tomador?: string;
  municipio?: string;
  descricaoServico?: string;
  aliquotaISS?: number;
  valorISS?: number;
  retencoes?: {
    valorIR?: number;
    valorPIS?: number;
    valorCOFINS?: number;
    valorCSLL?: number;
  };
  associacao: 'Automática' | 'Manual';
  /** Nível de associação do matching: ALTO = auto-associado, MEDIO/BAIXO = exige conferência */
  nivelAssociacao?: 'ALTO' | 'MEDIO' | 'BAIXO';
  vinculoAutomatico?: {
    data: string;
    usuario: string;
  };
};

export type RowEventType = 'approved' | 'rejected' | 'pendency_resolved' | 'boleto_link_confirmed' | 'boleto_link_rejected';

export type RowEvent = {
  id: string;
  type: RowEventType;
  userName: string;
  /** ISO 8601 datetime string */
  createdAt: string;
  /** Rótulo da pendência resolvida, exibido como tag no histórico */
  pendencyLabel?: string;
};

export type LancadoEm =
  | 'conferir'
  | 'aprovacao'
  | 'pagar'
  | 'bloqueados'
  | 'liquidados'
  | 'cancelados';

/** Abas da tela de Gestão de pagamentos (inclui visão consolidada) */
export type PaymentTabId = LancadoEm | 'todas';

export const ETAPA_LABELS: Record<LancadoEm, string> = {
  conferir: 'Conferência',
  aprovacao: 'Aprovação',
  pagar: 'Pagamento',
  bloqueados: 'Bloqueado',
  liquidados: 'Liquidado',
  cancelados: 'Cancelado',
};

export type Row = {
  id: string;
  /** Data/hora de geração da conta a pagar (ISO 8601 ou DD/MM/YYYY com hora opcional) */
  geradoEm?: string;
  fornecedor: string;
  cnpjFornecedor: string;
  cnpjPagador: string;
  valor: number;
  vencimento: string;
  /** Indica que a data de vencimento foi alterada manualmente na UI. */
  vencimentoEditadoManual?: boolean;
  vencimentoEditadoManualMeta?: {
    userName: string;
    editedAt: string;
  };
  /** Número de dias da regra de vencimento aplicada automaticamente. */
  vencimentoDiasRegra?: number;
  status?: 'Pago' | 'Vencido' | 'Aberto' | 'Cancelado';
  origem: 'Manual' | 'NF-e' | 'Boleto' | 'CT-e' | 'NFS-e';
  lancadoEm: LancadoEm;
  etapasVisitadas?: LancadoEm[];
  ordemCompra?: string;
  parcela?: string;
  centroCusto?: string;
  observacoes?: string;
  formaPagamento: {
    tipo: 'PIX';
    chavePix: string;
    dataGeracao: string;
    valor: number;
    descontos?: number;
  };
  documentosAssociados?: AssociatedDoc[];
  /** Documentos sugeridos para conferência (nível MEDIO/BAIXO), ainda não associados */
  documentosParaConferencia?: AssociatedDoc[];
  fornecedorInfo?: {
    endereco?: string;
    cidade?: string;
    uf?: string;
    contato?: string;
    email?: string;
  };
  pagamentoPreferencial?: {
    tipo: 'PIX' | 'TED' | 'Boleto';
    chavePix?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
    favorecido?: string;
  };
  aprovacao?: {
    aprovador?: string;
    emailAprovador?: string;
    statusAprovacao: 'Pendente' | 'Aprovado' | 'Rejeitado';
    dataEnvio?: string;
    dataAprovacao?: string;
  };
  cancelamentoOrigem?: 'Manual' | 'Nota' | 'Boleto' | 'Por nota' | 'Por boleto';
  tipoCancelamento?: 'Automático - Boleto' | 'Automático - Nota' | 'Manual';
  notaAtualizadaAposCriacao?: boolean;
  eventHistory?: RowEvent[];
};

export type BankAccount = {
  id: string;
  nomeBanco: string;
  apelido?: string;
  tipoConta: 'corrente' | 'poupanca' | 'pagamento';
  agencia: string;
  conta: string;
  digitoConta?: string;
  titular: string;
  documentoTitular: string;
  principal?: boolean;
  ativa: boolean;
  status?: 'processando' | 'ativo';
};

export interface PaymentFilter {
  status: string;
  period: string;
  query: string;
  visaoGeralFilter: string | null;
  vencimentoInicio?: string;
  vencimentoFim?: string;
  emissaoInicio?: string;
  emissaoFim?: string;
  valorMinimo?: string;
  valorMaximo?: string;
  formaPagamento?: string;
  origemDocumento?: string;
  semDataVencimento?: boolean;
  divergencias?: string;
  cancelamentoOrigem?: string;
  tipoCancelamento?: string;
  notaAtualizadaAposCriacao?: boolean;
  lancadoEm?: string;
  cbsPrevistoMinimo?: string;
  cbsPrevistoMaximo?: string;
}

