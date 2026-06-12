import { NFe } from '../types';

// Helper para gerar chave de acesso aleatória
function generateChaveAcesso(): string {
  const digits = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10));
  return digits.join('');
}

// Helper para gerar CFOP
function generateCFOP(tipo: 'Entrada' | 'Saída'): string[] {
  const cfopsEntrada = ['1102', '1403', '2102', '1556', '2403', '1101', '2556'];
  const cfopsSaida = ['5102', '5405', '6102', '5556', '6403', '5101', '6556'];
  const list = tipo === 'Entrada' ? cfopsEntrada : cfopsSaida;
  return [list[Math.floor(Math.random() * list.length)]];
}

// Helper para data no formato DD/MM/YYYY
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Gerar datas nos últimos 90 dias
function getRandomDateInLast90Days(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

const fornecedores = [
  { nome: 'Tech Solutions Ltda', cnpj: '12.345.678/0001-90', ie: '123.456.789.123', uf: 'SP', cidade: 'São Paulo' },
  { nome: 'Distribuidora ABC S/A', cnpj: '98.765.432/0001-10', ie: '987.654.321.987', uf: 'RJ', cidade: 'Rio de Janeiro' },
  { nome: 'Indústria Machado & Cia', cnpj: '11.222.333/0001-44', ie: '111.222.333.444', uf: 'MG', cidade: 'Belo Horizonte' },
  { nome: 'Comércio XYZ Ltda', cnpj: '55.666.777/0001-88', ie: '555.666.777.888', uf: 'PR', cidade: 'Curitiba' },
  { nome: 'Serviços Tech S/A', cnpj: '22.333.444/0001-55', ie: '222.333.444.555', uf: 'RS', cidade: 'Porto Alegre' },
  { nome: 'Importadora Global Ltda', cnpj: '77.888.999/0001-00', ie: '777.888.999.000', uf: 'SC', cidade: 'Florianópolis' },
  { nome: 'Materiais de Construção Silva', cnpj: '33.444.555/0001-66', ie: '333.444.555.666', uf: 'BA', cidade: 'Salvador' },
  { nome: 'Eletrônicos Premium Ltda', cnpj: '44.555.666/0001-77', ie: '444.555.666.777', uf: 'PE', cidade: 'Recife' },
];

const naturezasOperacao = [
  'Venda de mercadoria adquirida',
  'Compra para comercialização',
  'Devolução de venda',
  'Remessa para industrialização',
  'Retorno de industrialização',
  'Transferência',
  'Venda de produção',
  'Compra para industrialização',
];

const etiquetasDisponiveis = [
  'Urgente',
  'Conferido',
  'Pendente',
  'Recorrente',
  'Importação',
  'Devolução',
  'Bonificação',
];

const origensDisponiveis: NFe['origem'][] = [
  'Importação XML',
  'Sincronização ERP',
  'API',
  'E-mail',
  'Importação Manual',
];

export const mockNFes: NFe[] = [];

// Gerar 15 NFes recebidas
for (let i = 1; i <= 15; i++) {
  const fornecedor = fornecedores[Math.floor(Math.random() * fornecedores.length)];
  const dataEmissao = getRandomDateInLast90Days();
  const valor = Math.random() * 50000 + 500;
  const status: NFe['status'] = ['Autorizada', 'Autorizada', 'Autorizada', 'Autorizada', 'Cancelada'][Math.floor(Math.random() * 5)] as NFe['status'];
  const manifestacoes: NFe['manifestacao'][] = [
    'Ciência da Operação',
    'Confirmação da Operação',
    'Não Manifestada',
    'Não Manifestada',
    'Ciência da Operação',
  ];
  const manifestacao = manifestacoes[Math.floor(Math.random() * manifestacoes.length)];
  
  const nfe: NFe = {
    id: `nfe-rec-${i}`,
    numero: String(100000 + i).padStart(9, '0'),
    serie: '1',
    chaveAcesso: generateChaveAcesso(),
    tipo: 'Entrada',
    status,
    manifestacao,
    dataEmissao: formatDate(dataEmissao),
    dataAutorizacao: formatDate(new Date(dataEmissao.getTime() + 1000 * 60 * 60)),
    dataImportacao: formatDate(new Date(dataEmissao.getTime() + 1000 * 60 * 60 * 2)),
    valor,
    valorProdutos: valor * 0.9,
    valorIcms: valor * 0.12,
    valorIpi: valor * 0.05,
    emitente: {
      razaoSocial: fornecedor.nome,
      cnpj: fornecedor.cnpj,
      inscricaoEstadual: fornecedor.ie,
      municipio: fornecedor.cidade,
      uf: fornecedor.uf,
    },
    destinatario: {
      razaoSocial: 'Qive Tecnologia LTDA',
      cnpjCpf: '12.345.678/0001-90',
      inscricaoEstadual: '123.456.789.123',
      municipio: 'São Paulo',
      uf: 'SP',
    },
    cfops: generateCFOP('Entrada'),
    naturezaOperacao: naturezasOperacao[Math.floor(Math.random() * naturezasOperacao.length)],
    protocolo: `${Math.floor(Math.random() * 900000000) + 100000000}`,
    quantidadeItens: Math.floor(Math.random() * 20) + 1,
    origem: origensDisponiveis[Math.floor(Math.random() * origensDisponiveis.length)],
    lancadoEm: 'recebidas',
    sincronizadoERP: Math.random() > 0.3,
    empresaCnpj: '12.345.678/0001-90',
    empresaNome: 'Qive Tecnologia LTDA',
    ufOrigem: fornecedor.uf,
    ufDestino: 'SP',
    modelo: '55',
    etiquetas: Math.random() > 0.5 ? [etiquetasDisponiveis[Math.floor(Math.random() * etiquetasDisponiveis.length)]] : undefined,
    prazoManifestacao: Math.random() > 0.5 ? formatDate(new Date(dataEmissao.getTime() + 1000 * 60 * 60 * 24 * 30)) : undefined,
  };
  
  mockNFes.push(nfe);
}

// Gerar 10 NFes emitidas
for (let i = 1; i <= 10; i++) {
  const cliente = fornecedores[Math.floor(Math.random() * fornecedores.length)];
  const dataEmissao = getRandomDateInLast90Days();
  const valor = Math.random() * 80000 + 1000;
  const status: NFe['status'] = ['Autorizada', 'Autorizada', 'Autorizada', 'Cancelada', 'Rejeitada'][Math.floor(Math.random() * 5)] as NFe['status'];
  
  const nfe: NFe = {
    id: `nfe-emit-${i}`,
    numero: String(200000 + i).padStart(9, '0'),
    serie: '1',
    chaveAcesso: generateChaveAcesso(),
    tipo: 'Saída',
    status,
    dataEmissao: formatDate(dataEmissao),
    dataSaida: formatDate(dataEmissao),
    dataAutorizacao: formatDate(new Date(dataEmissao.getTime() + 1000 * 60 * 30)),
    dataImportacao: formatDate(new Date(dataEmissao.getTime() + 1000 * 60 * 60)),
    valor,
    valorProdutos: valor * 0.92,
    valorIcms: valor * 0.12,
    valorIpi: valor * 0.03,
    emitente: {
      razaoSocial: 'Qive Tecnologia LTDA',
      cnpj: '12.345.678/0001-90',
      inscricaoEstadual: '123.456.789.123',
      municipio: 'São Paulo',
      uf: 'SP',
    },
    destinatario: {
      razaoSocial: cliente.nome,
      cnpjCpf: cliente.cnpj,
      inscricaoEstadual: cliente.ie,
      municipio: cliente.cidade,
      uf: cliente.uf,
    },
    cfops: generateCFOP('Saída'),
    naturezaOperacao: naturezasOperacao[Math.floor(Math.random() * naturezasOperacao.length)],
    protocolo: status === 'Autorizada' || status === 'Cancelada' ? `${Math.floor(Math.random() * 900000000) + 100000000}` : undefined,
    quantidadeItens: Math.floor(Math.random() * 15) + 1,
    origem: origensDisponiveis[Math.floor(Math.random() * origensDisponiveis.length)],
    lancadoEm: 'emitidas',
    sincronizadoERP: Math.random() > 0.2,
    empresaCnpj: '12.345.678/0001-90',
    empresaNome: 'Qive Tecnologia LTDA',
    ufOrigem: 'SP',
    ufDestino: cliente.uf,
    modelo: '55',
    etiquetas: Math.random() > 0.6 ? [etiquetasDisponiveis[Math.floor(Math.random() * etiquetasDisponiveis.length)]] : undefined,
  };
  
  mockNFes.push(nfe);
}

// Gerar 5 NFes de transporte (CT-e)
for (let i = 1; i <= 5; i++) {
  const transportadora = fornecedores[Math.floor(Math.random() * fornecedores.length)];
  const dataEmissao = getRandomDateInLast90Days();
  const valor = Math.random() * 5000 + 200;
  
  const nfe: NFe = {
    id: `nfe-trans-${i}`,
    numero: String(300000 + i).padStart(9, '0'),
    serie: '1',
    chaveAcesso: generateChaveAcesso(),
    tipo: 'Entrada',
    status: 'Autorizada',
    dataEmissao: formatDate(dataEmissao),
    dataAutorizacao: formatDate(new Date(dataEmissao.getTime() + 1000 * 60 * 60)),
    dataImportacao: formatDate(new Date(dataEmissao.getTime() + 1000 * 60 * 60 * 2)),
    valor,
    valorProdutos: valor,
    emitente: {
      razaoSocial: transportadora.nome,
      cnpj: transportadora.cnpj,
      inscricaoEstadual: transportadora.ie,
      municipio: transportadora.cidade,
      uf: transportadora.uf,
    },
    destinatario: {
      razaoSocial: 'Qive Tecnologia LTDA',
      cnpjCpf: '12.345.678/0001-90',
      inscricaoEstadual: '123.456.789.123',
      municipio: 'São Paulo',
      uf: 'SP',
    },
    cfops: ['1352'],
    naturezaOperacao: 'Prestação de serviço de transporte',
    protocolo: `${Math.floor(Math.random() * 900000000) + 100000000}`,
    quantidadeItens: 1,
    origem: 'API',
    lancadoEm: 'transporte',
    sincronizadoERP: true,
    empresaCnpj: '12.345.678/0001-90',
    empresaNome: 'Qive Tecnologia LTDA',
    ufOrigem: transportadora.uf,
    ufDestino: 'SP',
    modelo: '57',
    transporte: {
      modalidade: 'Rodoviário',
      transportadora: {
        razaoSocial: transportadora.nome,
        cnpj: transportadora.cnpj,
        inscricaoEstadual: transportadora.ie,
      },
      veiculo: {
        placa: `ABC${Math.floor(Math.random() * 9000) + 1000}`,
        uf: transportadora.uf,
      },
      volumes: {
        quantidade: Math.floor(Math.random() * 50) + 1,
        pesoBruto: Math.random() * 1000 + 100,
        pesoLiquido: Math.random() * 900 + 90,
      },
    },
  };
  
  mockNFes.push(nfe);
}

// Gerar 5 NFes citadas (onde a empresa é citada mas não é emitente nem destinatário principal)
for (let i = 1; i <= 5; i++) {
  const emitente = fornecedores[Math.floor(Math.random() * fornecedores.length)];
  const destinatario = fornecedores[Math.floor(Math.random() * fornecedores.length)];
  const dataEmissao = getRandomDateInLast90Days();
  const valor = Math.random() * 30000 + 1000;
  
  const nfe: NFe = {
    id: `nfe-cit-${i}`,
    numero: String(400000 + i).padStart(9, '0'),
    serie: '1',
    chaveAcesso: generateChaveAcesso(),
    tipo: 'Entrada',
    status: 'Autorizada',
    dataEmissao: formatDate(dataEmissao),
    dataAutorizacao: formatDate(new Date(dataEmissao.getTime() + 1000 * 60 * 60)),
    dataImportacao: formatDate(new Date(dataEmissao.getTime() + 1000 * 60 * 60 * 3)),
    valor,
    valorProdutos: valor * 0.9,
    valorIcms: valor * 0.12,
    emitente: {
      razaoSocial: emitente.nome,
      cnpj: emitente.cnpj,
      inscricaoEstadual: emitente.ie,
      municipio: emitente.cidade,
      uf: emitente.uf,
    },
    destinatario: {
      razaoSocial: destinatario.nome,
      cnpjCpf: destinatario.cnpj,
      inscricaoEstadual: destinatario.ie,
      municipio: destinatario.cidade,
      uf: destinatario.uf,
    },
    cfops: generateCFOP('Entrada'),
    naturezaOperacao: 'Remessa em triangulação',
    protocolo: `${Math.floor(Math.random() * 900000000) + 100000000}`,
    quantidadeItens: Math.floor(Math.random() * 10) + 1,
    origem: 'API',
    lancadoEm: 'citadas',
    sincronizadoERP: false,
    empresaCnpj: '12.345.678/0001-90',
    empresaNome: 'Qive Tecnologia LTDA',
    ufOrigem: emitente.uf,
    ufDestino: destinatario.uf,
    modelo: '55',
    comentarios: 'Empresa citada como intermediária na operação',
  };
  
  mockNFes.push(nfe);
}

export const initialNFes = mockNFes;

