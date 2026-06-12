export type Supplier = {
  cnpj: string;
  nome: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  telefone?: string;
  email?: string;
  pagamentoPreferencial: {
    tipo: 'PIX';
    chavePix: string;
    favorecido: string;
  };
};

const registry: Supplier[] = [
  {
    cnpj: '03.160.081/0001-85',
    nome: 'C.JR. Construtora LTDA',
    endereco: 'Rua Exemplo, 123',
    cidade: 'São Paulo',
    uf: 'SP',
    telefone: '(11) 3500-1000',
    email: 'contato@cjrltda.com.br',
    pagamentoPreferencial: { tipo: 'PIX', chavePix: 'contas@cjrltda.com.br', favorecido: 'C.JR. Construtora LTDA' },
  },
  {
    cnpj: '12.345.678/0001-90',
    nome: 'Qive Tecnologia LTDA',
    endereco: 'Av. Tech, 500',
    cidade: 'São Paulo',
    uf: 'SP',
    telefone: '(11) 4000-2000',
    email: 'financeiro@qive.com',
    pagamentoPreferencial: { tipo: 'PIX', chavePix: 'financeiro@qive.com', favorecido: 'Qive Tecnologia LTDA' },
  },
  {
    cnpj: '21.765.432/0001-10',
    nome: 'Alpha Materiais Ltda',
    endereco: 'Rua Materiais, 77',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    telefone: '(21) 3000-9000',
    email: 'contato@alphamateriais.com',
    pagamentoPreferencial: { tipo: 'PIX', chavePix: 'pix@alphamateriais.com', favorecido: 'Alpha Materiais Ltda' },
  },
  {
    cnpj: '76.543.210/0001-55',
    nome: 'Transportes Delta ME',
    endereco: 'Av. Logística, 222',
    cidade: 'Curitiba',
    uf: 'PR',
    telefone: '(41) 2500-7000',
    email: 'financeiro@deltame.com',
    pagamentoPreferencial: { tipo: 'PIX', chavePix: 'delta@pix.com', favorecido: 'Transportes Delta ME' },
  },
  {
    cnpj: '33.222.111/0001-44',
    nome: 'Serviços Beta S/A',
    endereco: 'Rua Serviços, 10',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    telefone: '(31) 2800-1234',
    email: 'beta@pagamentos.com',
    pagamentoPreferencial: { tipo: 'PIX', chavePix: 'beta@pagamentos.com', favorecido: 'Serviços Beta S/A' },
  },
];

export function getSupplier(cnpj: string): Supplier | null {
  if (!cnpj) return null;
  const found = registry.find((s) => s.cnpj === cnpj);
  return found ?? null;
}

export const suppliers = registry;

