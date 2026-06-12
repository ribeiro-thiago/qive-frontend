export type PagamentoStatus = "Pendente" | "Cadastrados";

export type AnexoContratoStatus = "carregando" | "invalido" | "concluido";

export type FornecedorAnexoContrato = {
  id: string;
  nomeArquivo: string;
  tamanhoBytes: number;
  dataEnvio: string;
  status: AnexoContratoStatus;
};

export type FornecedorDadosBancarios = {
  banco: string;
  agencia: string;
  conta: string;
  cnpj: string;
  tipoConta: string;
  metodoTransferencia: string;
};
export type SituacaoCadastral = "Suspenso" | "Cancelado" | "Nulo" | "Inapto" | "Ativo";
export type AcessoPortal = "-" | "Convite enviado" | "Cadastro ativo";
export type AcessoFornecedorStatus = "Cadastro ativo" | "Convite pendente";

export type FornecedorAcessoPortal = {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  status: AcessoFornecedorStatus;
  dataUltimoAcesso: string | null;
};

export type Recorrencia = "Alta" | "Média" | "Baixa";

export type FornecedorRow = {
  id: number;
  cnpj: string;
  razaoSocial: string;
  comproCgsIss: string[];
  dadosPagamento: PagamentoStatus;
  dadosBancarios?: FornecedorDadosBancarios | null;
  anexosContratosCertidoes?: FornecedorAnexoContrato[];
  acessosPortal?: FornecedorAcessoPortal[];
  situacaoCadastral: SituacaoCadastral;
  acessoPortal: AcessoPortal;
  regimeTributario: string;
  localizacao: string;
  nomeFantasia: string;
  telefone: string;
  ultimaCompra: string;
  valorComprado: string;
  qtdNotas: number;
  recorrencia: Recorrencia;
  cnaeCodigo: string;
  cnaeDescricao: string;
  ultimaAtualizacaoReceita: string;
};

export type FornecedorCadastroLookup = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  dataAbertura: string;
  matrizFilial: string;
  situacaoCadastral: SituacaoCadastral;
  naturezaJuridica: string;
  regimeTributario: string;
  localizacao: string;
  telefone: string;
  recorrencia: Recorrencia;
};
