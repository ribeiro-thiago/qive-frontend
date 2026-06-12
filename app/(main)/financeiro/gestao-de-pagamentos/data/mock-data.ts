import { Row, AssociatedDoc, RowEvent } from '../types';

// Função para gerar datas futuras
const getFutureDate = (daysFromNow: number): string => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + daysFromNow);
  return futureDate.toLocaleDateString('pt-BR');
};

// Gera um ISO datetime com offset de dias e hora fixa
const getEventDate = (daysAgo: number, hour: number, minute: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// CNPJs das empresas disponíveis (do CompanySelector)
const CNPJ_MATRIZ = '12.345.678/0001-90';
const CNPJ_FILIAL1 = '12.345.678/0002-71';

// Função para gerar CNPJ aleatório
const generateCNPJ = (): string => {
  const numbers = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10));
  return numbers.join('').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Função para gerar código de barras
const generateBarcode = (): string => {
  const numbers = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10));
  return numbers.join('').replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{10})/, '$1.$2 $3.$4 $5.$6 $7 $8');
};

// Função para gerar ordem de compra
const generateOrdemCompra = (): string => {
  return `OC${Math.floor(100000 + Math.random() * 900000)}`;
};

// Função para gerar centro de custo
const generateCentroCusto = (): string => {
  const departamentos = ['Office', 'Produção', 'Vendas', 'TI', 'RH', 'Financeiro', 'Logística', 'Compras'];
  const codigo = Math.floor(100 + Math.random() * 900);
  const departamento = departamentos[Math.floor(Math.random() * departamentos.length)];
  return `${codigo} - ${departamento}`;
};

const makeNFe = (
  fornecedor: string,
  cnpj: string,
  valor: number,
  dataStr: string,
  numero?: string,
): AssociatedDoc => ({
  tipo: 'NF-e',
  numero: numero ?? `00${Math.floor(100000 + Math.random() * 900000)}`,
  serie: '1',
  situacao: 'Autorizada',
  data: dataStr,
  valor,
  xml: {
    CBS: Number((valor * 0.085).toFixed(2)),
  },
  formaPagamento: 'Boleto',
  chaveAcesso: `352025${cnpj.replace(/\D/g, '').slice(0, 14).padEnd(14, '0')}550010${Math.floor(1000000 + Math.random() * 9000000)}1000${Math.floor(10000 + Math.random() * 90000)}`,
  danfe: {
    emitente: { nome: fornecedor, cnpj, municipio: 'São Paulo', uf: 'SP' },
    destinatario: { nome: 'Qive Tecnologia LTDA', cnpjCpf: '12.345.678/0001-90', municipio: 'São Paulo', uf: 'SP' },
  },
  associacao: 'Automática',
  nivelAssociacao: 'ALTO',
});

const makeBoleto = (
  fornecedor: string,
  valor: number,
  dataStr: string,
  vencimentoStr: string,
  banco: string,
  numero?: string,
): AssociatedDoc => ({
  tipo: 'Boleto',
  numero: numero ?? `B${Math.floor(10000 + Math.random() * 90000)}`,
  banco,
  situacao: 'Aberto',
  data: dataStr,
  valor,
  vencimento: vencimentoStr,
  cedente: fornecedor,
  sacado: 'Qive Tecnologia LTDA',
  nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
  seuNumero: `PAG-${Math.floor(10000 + Math.random() * 90000)}`,
  codigoBarras: generateBarcode(),
  descontos: 0,
  moraMulta: 0,
  associacao: 'Automática',
  nivelAssociacao: 'ALTO',
});

const makeComprovante = (
  valor: number,
  dataPgto: string,
  banco: string,
  cnpjPagador: string,
  numero?: string,
): AssociatedDoc => ({
  tipo: 'Comprovante',
  numero: numero ?? '09111216710000455088',
  data: dataPgto,
  valor,
  banco,
  pagador: 'Qive Tecnologia LTDA',
  cnpjPagador,
  associacao: 'Automática',
  nivelAssociacao: 'ALTO',
});

export const initialRows: Row[] = [
  // Documentos com vencimento nos próximos 7 dias (3 documentos)
  // Caso de divergência (Tipo A): emissor do boleto diferente do emissor da NF-e
  {
    id: 'div-emitente-1',
    fornecedor: 'Comercial Almeida & Cia LTDA', cnpjFornecedor: '11.111.111/0001-11', cnpjPagador: CNPJ_MATRIZ,
    valor: 7650.35, vencimento: getFutureDate(2), status: 'Aberto', origem: 'NF-e', lancadoEm: 'conferir',
    etapasVisitadas: ['conferir'],
    ordemCompra: 'OC-DIV-001', centroCusto: '305 - Compras',
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@comercialalmeida.com.br', dataGeracao: getFutureDate(-1), valor: 7650.35, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Comercial Almeida & Cia LTDA' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '009900001', serie: '1', situacao: 'Autorizada', data: getFutureDate(-1),
        valor: 7650.35, formaPagamento: 'Boleto', chaveAcesso: '35202511111111000111550010009900011000099000',
        xml: { CBS: 125.4 },
        danfe: {
          emitente: {
            nome: 'Comercial Almeida & Cia LTDA',
            cnpj: '11.111.111/0001-11',
            municipio: 'São Paulo',
            uf: 'SP',
          },
          destinatario: {
            nome: 'Qive Tecnologia LTDA - Matriz',
            cnpjCpf: '12.345.678/0001-90',
            municipio: 'São Paulo',
            uf: 'SP',
          },
        },
        associacao: 'Automática',
        nivelAssociacao: 'ALTO',
      },
      {
        tipo: 'Boleto', numero: 'DIV001', banco: '341 - Itaú Unibanco', situacao: 'Aberto',
        data: getFutureDate(-1), valor: 7650.35, vencimento: getFutureDate(2),
        cedente: 'Financeira CrediBem S/A', sacado: 'Qive Tecnologia LTDA - Matriz',
        nossoNumero: '99001122334', seuNumero: 'NF-009900001',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
        nivelAssociacao: 'ALTO',
      },
      // Boleto aguardando validação manual de vínculo (nivelAssociacao MEDIO):
      // combinado com a divergência de emissor acima, cria caso representativo de múltiplas pendências.
      {
        tipo: 'Boleto', numero: 'PEND-001', banco: '237 - Bradesco', situacao: 'Aberto',
        data: getFutureDate(-1), valor: 7650.35, vencimento: getFutureDate(2),
        cedente: 'Comercial Almeida & Cia LTDA', sacado: 'Qive Tecnologia LTDA - Matriz',
        nossoNumero: '99001122555', seuNumero: 'NF-009900001-B',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
        nivelAssociacao: 'MEDIO',
      },
    ],
    documentosParaConferencia: [
      {
        tipo: 'Boleto', numero: 'CONF-001', banco: '341 - Itaú Unibanco', situacao: 'Aberto',
        data: getFutureDate(-1), valor: 7650.35, vencimento: getFutureDate(2),
        cedente: 'Comercial Almeida & Cia LTDA', sacado: 'Qive Tecnologia LTDA - Matriz',
        nossoNumero: '99001122999', seuNumero: 'NF-009900001',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
        nivelAssociacao: 'MEDIO',
      },
    ],
    eventHistory: [
      { id: 'ev-div1-2', type: 'pendency_resolved', userName: 'Ana Lima', createdAt: getEventDate(0, 11, 45), pendencyLabel: 'Divergência de emissores' },
      { id: 'ev-div1-1', type: 'approved', userName: 'Roberto Dias', createdAt: getEventDate(3, 8, 30) },
    ] satisfies RowEvent[],
  },

  // Caso de divergência (Tipo B): NF-e com forma de pagamento diferente de boleto, mas há boleto associado
  {
    id: 'div-forma-1',
    fornecedor: 'Tech Solutions Brasil LTDA', cnpjFornecedor: '22.222.222/0001-22', cnpjPagador: CNPJ_MATRIZ,
    valor: 4321.10, vencimento: getFutureDate(4), status: 'Aberto', origem: 'NF-e', lancadoEm: 'conferir',
    etapasVisitadas: ['conferir'],
    ordemCompra: 'OC-DIV-002', centroCusto: '201 - Administrativo',
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@techsolutions.com.br', dataGeracao: getFutureDate(-2), valor: 4321.10, descontos: 0 },
    pagamentoPreferencial: { tipo: 'PIX', chavePix: 'financeiro@techsolutions.com.br' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '009900002', serie: '1', situacao: 'Autorizada', data: getFutureDate(-2),
        valor: 4321.10, formaPagamento: 'PIX', chaveAcesso: '35202522222222000122550010009900021000099000',
        danfe: {
          emitente: {
            nome: 'Tech Solutions Brasil LTDA',
            cnpj: '22.222.222/0001-22',
            municipio: 'São Paulo',
            uf: 'SP',
          },
          destinatario: {
            nome: 'Qive Tecnologia LTDA - Matriz',
            cnpjCpf: '12.345.678/0001-90',
            municipio: 'São Paulo',
            uf: 'SP',
          },
        },
        associacao: 'Automática',
        nivelAssociacao: 'ALTO',
      },
      {
        tipo: 'Boleto', numero: 'DIV002', banco: '001 - Banco do Brasil', situacao: 'Aberto',
        data: getFutureDate(-2), valor: 4321.10, vencimento: getFutureDate(4),
        cedente: 'Tech Solutions Brasil LTDA', sacado: 'Qive Tecnologia LTDA - Matriz',
        nossoNumero: '99002233445', seuNumero: 'NF-009900002',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
        nivelAssociacao: 'ALTO',
      },
    ],
    documentosParaConferencia: [
      {
        tipo: 'Boleto', numero: 'CONF-002A', banco: '001 - Banco do Brasil', situacao: 'Aberto',
        data: getFutureDate(-2), valor: 4321.10, vencimento: getFutureDate(4),
        cedente: 'Tech Solutions Brasil LTDA', sacado: 'Qive Tecnologia LTDA - Matriz',
        nossoNumero: '99002233888', seuNumero: 'NF-009900002',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
        nivelAssociacao: 'MEDIO',
      },
      {
        tipo: 'Boleto', numero: 'CONF-002B', banco: '237 - Bradesco', situacao: 'Aberto',
        data: getFutureDate(-3), valor: 4310.00, vencimento: getFutureDate(5),
        cedente: 'Tech Solutions Brasil LTDA', sacado: 'Qive Tecnologia LTDA - Matriz',
        nossoNumero: '99002233777', seuNumero: 'NF-009900002',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
        nivelAssociacao: 'BAIXO',
      },
    ],
    eventHistory: [
      { id: 'ev-divf1-1', type: 'rejected', userName: 'Lucas Ferreira', createdAt: getEventDate(1, 15, 10) },
    ] satisfies RowEvent[],
  },

  {
    id: '1',
    fornecedor: 'Atacado RL Brasil', cnpjFornecedor: '45.123.456/0001-78', cnpjPagador: CNPJ_MATRIZ,
    valor: 4847.89, vencimento: getFutureDate(3), status: 'Aberto', origem: 'NF-e', lancadoEm: 'conferir',
    etapasVisitadas: ['conferir'],
    ordemCompra: 'OC245817', centroCusto: '305 - Compras',
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@atacadorl.com.br', dataGeracao: getFutureDate(-2), valor: 4847.89, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Atacado RL Brasil' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '000123456', serie: '1', situacao: 'Autorizada', data: getFutureDate(-2),
        valor: 4847.89, formaPagamento: 'Boleto', chaveAcesso: '35202512345678000190550010001234561000012345',
        itens: [
          { descricao: 'Arroz Tipo 1 - Pacote 5kg - Marca Tio João', unidade: 'PC', quantidade: 80, precoUnitario: 28.90, valorTotal: 2312.00, codigo: 'ALI-ARR-001', ncm: '10063021', cfop: '5102', cst: '00', aliqICMS: 12, aliqIPI: 0, bcICMS: 2312.00, vICMS: 277.44, vIPI: 0 },
          { descricao: 'Feijão Preto Tipo 1 - Pacote 1kg - Marca Camil', unidade: 'PC', quantidade: 120, precoUnitario: 7.45, valorTotal: 894.00, codigo: 'ALI-FEI-003', ncm: '07133300', cfop: '5102', cst: '00', aliqICMS: 12, aliqIPI: 0, bcICMS: 894.00, vICMS: 107.28, vIPI: 0 },
          { descricao: 'Óleo de Soja 900ml - Marca Liza', unidade: 'UN', quantidade: 48, precoUnitario: 8.75, valorTotal: 420.00, codigo: 'ALI-OLE-015', ncm: '15079011', cfop: '5102', cst: '00', aliqICMS: 12, aliqIPI: 0, bcICMS: 420.00, vICMS: 50.40, vIPI: 0 },
          { descricao: 'Açúcar Cristal 1kg - Marca União', unidade: 'PC', quantidade: 60, precoUnitario: 4.25, valorTotal: 255.00, codigo: 'ALI-ACU-007', ncm: '17019900', cfop: '5102', cst: '00', aliqICMS: 12, aliqIPI: 0, bcICMS: 255.00, vICMS: 30.60, vIPI: 0 },
          { descricao: 'Café Torrado e Moído 500g - Marca Pilão', unidade: 'PC', quantidade: 96, precoUnitario: 10.20, valorTotal: 979.20, codigo: 'ALI-CAF-022', ncm: '09012190', cfop: '5102', cst: '00', aliqICMS: 12, aliqIPI: 0, bcICMS: 979.20, vICMS: 117.50, vIPI: 0 },
        ],
        danfe: {
          naturezaOperacao: 'Venda de Mercadorias',
          protocolo: '135251234567890 - 12/10/2025 14:23:15',
          emitente: {
            nome: 'Atacado RL Brasil LTDA',
            cnpj: '45.123.456/0001-78',
            endereco: 'Av. do Comércio, 1500',
            bairro: 'Centro',
            cep: '01310-100',
            municipio: 'São Paulo',
            uf: 'SP',
            ie: '245.123.456.880',
          },
          destinatario: {
            nome: 'Qive Tecnologia LTDA - Matriz',
            cnpjCpf: '12.345.678/0001-90',
            endereco: 'Av. Paulista, 1500 - Sala 1201',
            bairro: 'Bela Vista',
            cep: '01310-100',
            municipio: 'São Paulo',
            uf: 'SP',
            ie: '123.456.789.012',
          },
          calculoImposto: {
            baseICMS: 4860.20,
            valorICMS: 583.22,
            baseICMSST: 0,
            valorICMSST: 0,
            valorProdutos: 4860.20,
            valorFrete: 0,
            valorSeguro: 0,
            desconto: 12.31,
            outrasDespesas: 0,
            valorIPI: 0,
            valorTotalNota: 4847.89,
          },
          transporte: {
            modalidadeFrete: '0',
            transportador: 'Atacado RL Brasil LTDA',
            placa: 'ABC-1234',
            uf: 'SP',
            rntc: '12345678',
            volumes: {
              quantidade: 364,
              especie: 'Caixas',
              marca: 'Diversos',
              numeracao: '1-364',
              pesoBruto: 1250.5,
              pesoLiquido: 1200.0,
            },
          },
          dadosAdicionais: {
            informacoesComplementares: 'Pedido: OC245817 | Centro de Custo: 305 - Compras',
          },
        },
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '001', banco: '001 - Banco do Brasil', situacao: 'Aberto',
        data: getFutureDate(-2), valor: 4847.89, vencimento: getFutureDate(3),
        cedente: 'Atacado RL Brasil', sacado: 'Qive Tecnologia LTDA - Matriz',
        nossoNumero: '12345678901', seuNumero: 'NF-123456',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
        nivelAssociacao: 'MEDIO',
      },
    ],
    eventHistory: [
      { id: 'ev-1-3', type: 'pendency_resolved', userName: 'João Silva', createdAt: getEventDate(0, 14, 32), pendencyLabel: 'Documento com associação pendente' },
      { id: 'ev-1-2', type: 'approved', userName: 'Mariana Costa', createdAt: getEventDate(1, 9, 15) },
      { id: 'ev-1-1', type: 'rejected', userName: 'Carlos Mendes', createdAt: getEventDate(2, 17, 48) },
    ] satisfies RowEvent[],
  },
  {
    id: '2',
    fornecedor: 'AutoPeças VR', cnpjFornecedor: '23.456.789/0001-01', cnpjPagador: CNPJ_FILIAL1,
    valor: 3284.75, vencimento: getFutureDate(5), status: 'Aberto', origem: 'Manual', lancadoEm: 'conferir',
    etapasVisitadas: ['conferir'],
    ordemCompra: 'OC245829', centroCusto: '412 - Manutenção',
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@autopecasvr.com', dataGeracao: getFutureDate(-1), valor: 3284.75, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'AutoPeças VR' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '000234567', serie: '1', situacao: 'Autorizada', data: getFutureDate(-1),
        valor: 3284.75, formaPagamento: 'Boleto', chaveAcesso: '35202523456789000101550010002345671000023456',
        itens: [
          { descricao: 'Filtro de Óleo Lubrificante - Mann W950/26 - Aplicação VW/Ford', unidade: 'UN', quantidade: 12, precoUnitario: 38.90, valorTotal: 466.80, codigo: 'FIL-OLE-W950', ncm: '84212300', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 5, bcICMS: 466.80, vICMS: 84.02, vIPI: 23.34 },
          { descricao: 'Pastilha de Freio Dianteira - Bosch BB1214 - Aplicação Fiat/GM', unidade: 'JG', quantidade: 6, precoUnitario: 142.50, valorTotal: 855.00, codigo: 'FRE-PAS-BB1214', ncm: '87083010', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 5, bcICMS: 855.00, vICMS: 153.90, vIPI: 42.75 },
          { descricao: 'Disco de Freio Ventilado - Fremax BD4515 - 280mm - Par', unidade: 'PR', quantidade: 4, precoUnitario: 245.00, valorTotal: 980.00, codigo: 'FRE-DIS-BD4515', ncm: '87083030', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 5, bcICMS: 980.00, vICMS: 176.40, vIPI: 49.00 },
          { descricao: 'Correia Dentada - Gates 5617XS - Aplicação VW/Audi 1.6/1.8', unidade: 'UN', quantidade: 8, precoUnitario: 89.75, valorTotal: 718.00, codigo: 'MOT-COR-5617XS', ncm: '40103900', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 5, bcICMS: 718.00, vICMS: 129.24, vIPI: 35.90 },
          { descricao: 'Vela de Ignição - NGK BKR6E - Aplicação Diversos', unidade: 'UN', quantidade: 24, precoUnitario: 18.50, valorTotal: 444.00, codigo: 'IGN-VEL-BKR6E', ncm: '85111000', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 5, bcICMS: 444.00, vICMS: 79.92, vIPI: 22.20 },
        ],
        danfe: {
          naturezaOperacao: 'Venda de Mercadorias',
          protocolo: '135252345678901 - 13/10/2025 10:15:42',
          emitente: {
            nome: 'AutoPeças VR LTDA',
            cnpj: '23.456.789/0001-01',
            endereco: 'Rua das Peças, 2800',
            bairro: 'Industrial',
            cep: '13200-000',
            municipio: 'Jundiaí',
            uf: 'SP',
            ie: '234.567.890.115',
          },
          destinatario: {
            nome: 'Qive Tecnologia LTDA - Filial 1',
            cnpjCpf: '12.345.678/0002-71',
            endereco: 'Rua das Indústrias, 850',
            bairro: 'Distrito Industrial',
            cep: '13050-000',
            municipio: 'Campinas',
            uf: 'SP',
            ie: '123.456.789.013',
          },
          calculoImposto: {
            baseICMS: 3463.80,
            valorICMS: 623.48,
            baseICMSST: 0,
            valorICMSST: 0,
            valorProdutos: 3463.80,
            valorFrete: 0,
            valorSeguro: 0,
            desconto: 0,
            outrasDespesas: 0,
            valorIPI: 173.19,
            valorTotalNota: 3636.99,
          },
          transporte: {
            modalidadeFrete: '0',
            transportador: 'AutoPeças VR LTDA',
            placa: 'DEF-5678',
            uf: 'SP',
            rntc: '23456789',
            volumes: {
              quantidade: 50,
              especie: 'Volumes',
              marca: 'AutoPeças',
              numeracao: '1-50',
              pesoBruto: 185.5,
              pesoLiquido: 178.0,
            },
          },
          dadosAdicionais: {
            informacoesComplementares: 'Pedido: OC245829 | Centro de Custo: 412 - Manutenção | Lançamento Manual',
          },
        },
        associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '002', banco: '341 - Itaú Unibanco', situacao: 'Aberto',
        data: getFutureDate(-1), valor: 3284.75, vencimento: getFutureDate(5),
        cedente: 'AutoPeças VR', sacado: 'Qive Tecnologia LTDA - Filial 1',
        nossoNumero: '23456789012', seuNumero: 'MAN-2025-002',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
        nivelAssociacao: 'MEDIO',
      },
    ],
    eventHistory: [
      { id: 'ev-2-2', type: 'approved', userName: 'Fernanda Rocha', createdAt: getEventDate(0, 10, 5) },
      { id: 'ev-2-1', type: 'rejected', userName: 'Pedro Alves', createdAt: getEventDate(1, 16, 20) },
    ] satisfies RowEvent[],
  },
  {
    id: '3',
    fornecedor: 'Monitore SPL Transforma', cnpjFornecedor: '67.890.123/0001-45', cnpjPagador: CNPJ_MATRIZ,
    valor: 4875.50, vencimento: getFutureDate(7), status: 'Aberto', origem: 'CT-e', lancadoEm: 'conferir',
    etapasVisitadas: ['conferir'],
    ordemCompra: 'OC245833', centroCusto: '518 - Logística',
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@monitorespl.com', dataGeracao: getFutureDate(-3), valor: 4875.50, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Monitore SPL Transforma' },
    documentosAssociados: [
      makeNFe('Monitore SPL Transforma', '67.890.123/0001-45', 4875.50, getFutureDate(-3)),
      {
        tipo: 'CT-e', numero: '000234567', serie: '1', situacao: 'Autorizado', data: getFutureDate(-3),
        valor: 4875.50, chaveAcesso: '51251034567890000112570010002345671234567890',
        remetente: 'Monitore SPL Transforma', destinatario: 'Qive Tecnologia LTDA - Matriz',
        origem: 'São Paulo - SP', destino: 'Belo Horizonte - MG',
        pesoTotal: 3842.5, valorCarga: 68450.00, 
        modalidade: 'Rodoviário',
        tipoServico: 'Normal',
        naturezaCarga: 'Produtos Industrializados',
        quantidadeVolumes: 158,
        tipoVeiculo: 'Caminhão Baú',
        placa: 'FRJ-4523',
        ufVeiculo: 'SP',
        observacoes: 'Carga fracionada - Entrega preferencial período matutino - Destinatário: Filial Centro',
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '003', banco: '237 - Bradesco', situacao: 'Aberto',
        data: getFutureDate(-3), valor: 4875.50, vencimento: getFutureDate(7),
        cedente: 'Monitore SPL Transforma', sacado: 'Qive Tecnologia LTDA - Matriz',
        nossoNumero: '34567890123', seuNumero: 'CTE-234567',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },

  // Documentos com vencimento após 7 dias (23 documentos)
  {
    id: '6',
    fornecedor: 'Comercial Bela Vista Ltda', cnpjFornecedor: '67.890.123/0001-45', cnpjPagador: CNPJ_FILIAL1,
    valor: 4200.00, vencimento: getFutureDate(12), status: 'Aberto', origem: 'NF-e', lancadoEm: 'conferir',
    etapasVisitadas: ['conferir'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@belavista.com.br', dataGeracao: getFutureDate(-5), valor: 4200.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Comercial Bela Vista Ltda' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '000456789', serie: '1', situacao: 'Autorizada', data: getFutureDate(-5),
        valor: 4200.00, formaPagamento: 'Boleto', chaveAcesso: '35202567890123000145550010004567891000045678',
        itens: [
          { descricao: 'Mercadorias diversas', unidade: 'UN', quantidade: 100, precoUnitario: 42.00, valorTotal: 4200.00, codigo: 'MER001', ncm: '99999999', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 4200.00, vICMS: 756.00, vIPI: 0 },
        ],
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '006', banco: '001 - Banco do Brasil', situacao: 'Aberto',
        data: getFutureDate(-5), valor: 4200.00, vencimento: getFutureDate(12),
        cedente: 'Comercial Bela Vista Ltda', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '67890123456', seuNumero: 'NF-456789',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '7',
    fornecedor: 'Auto Peças Rota 77 Ltda', cnpjFornecedor: '78.901.234/0001-56', cnpjPagador: CNPJ_MATRIZ,
    valor: 1650.75, vencimento: getFutureDate(15), status: 'Aberto', origem: 'Manual', lancadoEm: 'conferir',
    etapasVisitadas: ['conferir'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@rota77.com', dataGeracao: getFutureDate(-3), valor: 1650.75, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Auto Peças Rota 77 Ltda' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '000456789', serie: '1', situacao: 'Autorizada', data: getFutureDate(-3),
        valor: 1650.75, formaPagamento: 'Boleto', chaveAcesso: '35202578901234000156550010004567891000045678',
        itens: [
          { descricao: 'Filtros automotivos', unidade: 'UN', quantidade: 15, precoUnitario: 110.05, valorTotal: 1650.75, codigo: 'FIL001', ncm: '84212300', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 1650.75, vICMS: 297.135, vIPI: 0 },
        ],
        associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '007', banco: '341 - Itaú Unibanco', situacao: 'Aberto',
        data: getFutureDate(-3), valor: 1650.75, vencimento: getFutureDate(15),
        cedente: 'Auto Peças Rota 77 Ltda', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '78901234567', seuNumero: 'MAN-2025-007',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '8',
    fornecedor: 'DigitalMind Softwares', cnpjFornecedor: '89.012.345/0001-67', cnpjPagador: CNPJ_FILIAL1,
    valor: 5500.00, vencimento: getFutureDate(20), status: 'Aberto', origem: 'NFS-e', lancadoEm: 'conferir',
    etapasVisitadas: ['conferir'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@digitalmind.com.br', dataGeracao: getFutureDate(-7), valor: 5500.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'DigitalMind Softwares' },
    documentosAssociados: [
      makeNFe('DigitalMind Softwares', '89.012.345/0001-67', 5500.00, getFutureDate(-7)),
      {
        tipo: 'NFS-e', numero: '000567890', situacao: 'Autorizada', data: getFutureDate(-7), valor: 5500.00,
        codigoVerificacao: 'GHI789JKL012', prestador: 'DigitalMind Softwares', tomador: 'Qive Tecnologia LTDA',
        municipio: 'São Paulo - SP', descricaoServico: 'Desenvolvimento de software e soluções tecnológicas',
        aliquotaISS: 5.0, valorISS: 275.00,
        retencoes: { valorIR: 0, valorPIS: 35.75, valorCOFINS: 165.00, valorCSLL: 110.00 },
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '008', banco: '237 - Bradesco', situacao: 'Aberto',
        data: getFutureDate(-7), valor: 5500.00, vencimento: getFutureDate(20),
        cedente: 'DigitalMind Softwares', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '89012345678', seuNumero: 'NFS-567890',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '9',
    fornecedor: 'Transportes Veiculares MTK', cnpjFornecedor: '90.123.456/0001-78', cnpjPagador: CNPJ_MATRIZ,
    valor: 3200.50, vencimento: getFutureDate(18), status: 'Aberto', origem: 'CT-e', lancadoEm: 'conferir',
    etapasVisitadas: ['conferir'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@mtk.com.br', dataGeracao: getFutureDate(-4), valor: 3200.50, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Transportes Veiculares MTK' },
    documentosAssociados: [
      makeNFe('Transportes Veiculares MTK', '90.123.456/0001-78', 3200.50, getFutureDate(-4)),
      {
        tipo: 'CT-e', numero: '000678901', serie: '1', situacao: 'Autorizado', data: getFutureDate(-4),
        valor: 3200.50, chaveAcesso: '51251090123456000178570010006789012345678901',
        remetente: 'Transportes Veiculares MTK', destinatario: 'Qive Tecnologia LTDA',
        origem: 'São Paulo - SP', destino: 'Porto Alegre - RS',
        pesoTotal: 3200.0, valorCarga: 45000.0, associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '009', banco: '104 - Caixa Econômica Federal', situacao: 'Aberto',
        data: getFutureDate(-4), valor: 3200.50, vencimento: getFutureDate(18),
        cedente: 'Transportes Veiculares MTK', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '90123456789', seuNumero: 'CTE-678901',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '10',
    fornecedor: 'Serviços de Refeição e Hotéis', cnpjFornecedor: '01.234.567/0001-89', cnpjPagador: CNPJ_FILIAL1,
    valor: 2800.25, vencimento: getFutureDate(25), status: 'Aberto', origem: 'Boleto', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@refeicaohoteis.com', dataGeracao: getFutureDate(-6), valor: 2800.25, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Serviços de Refeição e Hotéis' },
    documentosAssociados: [
      makeNFe('Serviços de Refeição e Hotéis', '01.234.567/0001-89', 2800.25, getFutureDate(-6)),
      {
        tipo: 'Boleto', numero: '010', banco: '033 - Santander', situacao: 'Aberto',
        data: getFutureDate(-6), valor: 2800.25, vencimento: getFutureDate(25),
        cedente: 'Serviços de Refeição e Hotéis', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '01234567890', seuNumero: 'BOL-2025-010',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '10A',
    fornecedor: 'Fornecedora Global Supply', cnpjFornecedor: '12.345.678/0001-90', cnpjPagador: CNPJ_MATRIZ,
    valor: 5840.50, vencimento: getFutureDate(8), status: 'Aberto', origem: 'NF-e', lancadoEm: 'aprovacao',
    etapasVisitadas: ['conferir', 'aprovacao'],
    ordemCompra: 'OC248901', centroCusto: '201 - Administrativo',
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@globalsupply.com.br', dataGeracao: getFutureDate(-3), valor: 5840.50, descontos: 0 },
    pagamentoPreferencial: { tipo: 'PIX', chavePix: 'financeiro@globalsupply.com.br' },
    aprovacao: {
      aprovador: 'Carlos Mendes',
      emailAprovador: 'carlos.mendes@qive.com.br',
      statusAprovacao: 'Pendente',
      dataEnvio: getFutureDate(-2),
    },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '000123456', serie: '1', situacao: 'Autorizada', data: getFutureDate(-3),
        valor: 5840.50, formaPagamento: 'PIX', chaveAcesso: '35202512345678000190550010001234561000123456',
        itens: [
          { descricao: 'Material de escritório', unidade: 'UN', quantidade: 150, precoUnitario: 38.94, valorTotal: 5840.50, codigo: 'MAT001', ncm: '48201000', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 5840.50, vICMS: 1051.29, vIPI: 0 },
        ],
        associacao: 'Automática',
      },
      makeBoleto('Fornecedora Global Supply', 5840.50, getFutureDate(-3), getFutureDate(8), '001 - Banco do Brasil'),
    ],
  },
  {
    id: '10B',
    fornecedor: 'Serviços TechMind Consultoria', cnpjFornecedor: '98.765.432/0001-10', cnpjPagador: CNPJ_FILIAL1,
    valor: 3200.00, vencimento: getFutureDate(12), status: 'Aberto', origem: 'NFS-e', lancadoEm: 'aprovacao',
    etapasVisitadas: ['conferir', 'aprovacao'],
    ordemCompra: 'OC248902', centroCusto: '305 - Tecnologia',
    formaPagamento: { tipo: 'PIX', chavePix: 'contato@techmind.com', dataGeracao: getFutureDate(-1), valor: 3200.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'PIX', chavePix: 'contato@techmind.com' },
    aprovacao: {
      aprovador: 'Ana Silva',
      emailAprovador: 'ana.silva@qive.com.br',
      statusAprovacao: 'Pendente',
      dataEnvio: getFutureDate(-1),
    },
    documentosAssociados: [
      makeNFe('Serviços TechMind Consultoria', '98.765.432/0001-10', 3200.00, getFutureDate(-1)),
      {
        tipo: 'NFS-e', numero: '000987654', situacao: 'Autorizada', data: getFutureDate(-1), valor: 3200.00,
        codigoVerificacao: 'ABC123DEF456', prestador: 'Serviços TechMind Consultoria', tomador: 'Qive Tecnologia LTDA',
        municipio: 'São Paulo - SP', descricaoServico: 'Consultoria em sistemas de gestão',
        aliquotaISS: 5.0, valorISS: 160.00,
        retencoes: { valorIR: 0, valorPIS: 20.80, valorCOFINS: 96.00, valorCSLL: 64.00 },
        associacao: 'Automática',
      },
      makeBoleto('Serviços TechMind Consultoria', 3200.00, getFutureDate(-1), getFutureDate(12), '341 - Itaú Unibanco'),
    ],
  },
  {
    id: '11',
    fornecedor: 'Materiais de Construção Alpha', cnpjFornecedor: '78.901.234/0001-56', cnpjPagador: CNPJ_MATRIZ,
    valor: 7500.00, vencimento: getFutureDate(30), status: 'Aberto', origem: 'NF-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@alpha.com.br', dataGeracao: getFutureDate(-8), valor: 7500.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Materiais de Construção Alpha' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '000789012', serie: '1', situacao: 'Autorizada', data: getFutureDate(-8),
        valor: 7500.00, formaPagamento: 'Boleto', chaveAcesso: '35202512345678000190550010007890121000078901',
        itens: [
          { descricao: 'Cimento Portland', unidade: 'SC', quantidade: 200, precoUnitario: 37.50, valorTotal: 7500.00, codigo: 'CIM002', ncm: '25231000', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 7500.00, vICMS: 1350.00, vIPI: 0 },
        ],
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '011', banco: '001 - Banco do Brasil', situacao: 'Aberto',
        data: getFutureDate(-8), valor: 7500.00, vencimento: getFutureDate(30),
        cedente: 'Materiais de Construção Alpha', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '12345678901', seuNumero: 'NF-789012',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '12',
    fornecedor: 'Logística Express Beta', cnpjFornecedor: '23.456.789/0001-01', cnpjPagador: CNPJ_FILIAL1,
    valor: 1950.80, vencimento: getFutureDate(22), status: 'Aberto', origem: 'Manual', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@beta.com', dataGeracao: getFutureDate(-5), valor: 1950.80, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Logística Express Beta' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '000678901', serie: '1', situacao: 'Autorizada', data: getFutureDate(-5),
        valor: 1950.80, formaPagamento: 'Boleto', chaveAcesso: '35202523456789000101550010006789011000067890',
        itens: [
          { descricao: 'Equipamentos de logística', unidade: 'UN', quantidade: 8, precoUnitario: 243.85, valorTotal: 1950.80, codigo: 'LOG001', ncm: '84289090', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 1950.80, vICMS: 351.144, vIPI: 0 },
        ],
        associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '012', banco: '341 - Itaú Unibanco', situacao: 'Aberto',
        data: getFutureDate(-5), valor: 1950.80, vencimento: getFutureDate(22),
        cedente: 'Logística Express Beta', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '23456789012', seuNumero: 'MAN-2025-012',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '13',
    fornecedor: 'Tecnologia Gamma Ltda', cnpjFornecedor: '34.567.890/0001-12', cnpjPagador: CNPJ_MATRIZ,
    valor: 4800.00, vencimento: getFutureDate(35), status: 'Aberto', origem: 'NFS-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@gamma.com.br', dataGeracao: getFutureDate(-10), valor: 4800.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Tecnologia Gamma Ltda' },
    documentosAssociados: [
      makeNFe('Tecnologia Gamma Ltda', '34.567.890/0001-12', 4800.00, getFutureDate(-10)),
      {
        tipo: 'NFS-e', numero: '000890123', situacao: 'Autorizada', data: getFutureDate(-10), valor: 4800.00,
        codigoVerificacao: 'JKL012MNO345', prestador: 'Tecnologia Gamma Ltda', tomador: 'Qive Tecnologia LTDA',
        municipio: 'São Paulo - SP', descricaoServico: 'Consultoria em tecnologia da informação',
        aliquotaISS: 5.0, valorISS: 240.00,
        retencoes: { valorIR: 0, valorPIS: 31.20, valorCOFINS: 144.00, valorCSLL: 96.00 },
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '013', banco: '237 - Bradesco', situacao: 'Aberto',
        data: getFutureDate(-10), valor: 4800.00, vencimento: getFutureDate(35),
        cedente: 'Tecnologia Gamma Ltda', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '34567890123', seuNumero: 'NFS-890123',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '14',
    fornecedor: 'Transportes Delta Express', cnpjFornecedor: '45.678.901/0001-23', cnpjPagador: CNPJ_FILIAL1,
    valor: 3600.75, vencimento: getFutureDate(28), status: 'Aberto', origem: 'CT-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@delta.com.br', dataGeracao: getFutureDate(-6), valor: 3600.75, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Transportes Delta Express' },
    documentosAssociados: [
      makeNFe('Transportes Delta Express', '45.678.901/0001-23', 3600.75, getFutureDate(-6)),
      {
        tipo: 'CT-e', numero: '000901234', serie: '1', situacao: 'Autorizado', data: getFutureDate(-6),
        valor: 3600.75, chaveAcesso: '51251045678901000123570010009012345678901234',
        remetente: 'Transportes Delta Express', destinatario: 'Qive Tecnologia LTDA',
        origem: 'São Paulo - SP', destino: 'Salvador - BA',
        pesoTotal: 2800.0, valorCarga: 35000.0, associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '014', banco: '104 - Caixa Econômica Federal', situacao: 'Aberto',
        data: getFutureDate(-6), valor: 3600.75, vencimento: getFutureDate(28),
        cedente: 'Transportes Delta Express', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '45678901234', seuNumero: 'CTE-901234',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '15',
    fornecedor: 'Serviços Epsilon S/A', cnpjFornecedor: '56.789.012/0001-34', cnpjPagador: CNPJ_MATRIZ,
    valor: 2200.50, vencimento: getFutureDate(40), status: 'Aberto', origem: 'Boleto', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@epsilon.com', dataGeracao: getFutureDate(-9), valor: 2200.50, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Serviços Epsilon S/A' },
    documentosAssociados: [
      makeNFe('Serviços Epsilon S/A', '56.789.012/0001-34', 2200.50, getFutureDate(-9)),
      {
        tipo: 'Boleto', numero: '015', banco: '033 - Santander', situacao: 'Aberto',
        data: getFutureDate(-9), valor: 2200.50, vencimento: getFutureDate(40),
        cedente: 'Serviços Epsilon S/A', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '56789012345', seuNumero: 'BOL-2025-015',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '16',
    fornecedor: 'Materiais Zeta Ltda', cnpjFornecedor: '67.890.123/0001-45', cnpjPagador: CNPJ_FILIAL1,
    valor: 8900.00, vencimento: getFutureDate(45), status: 'Aberto', origem: 'NF-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@zeta.com.br', dataGeracao: getFutureDate(-12), valor: 8900.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Materiais Zeta Ltda' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '001012345', serie: '1', situacao: 'Autorizada', data: getFutureDate(-12),
        valor: 8900.00, formaPagamento: 'Boleto', chaveAcesso: '35202567890123000145550010010123451000010123',
        itens: [
          { descricao: 'Aço para construção', unidade: 'KG', quantidade: 1000, precoUnitario: 8.90, valorTotal: 8900.00, codigo: 'ACO001', ncm: '72142000', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 8900.00, vICMS: 1602.00, vIPI: 0 },
        ],
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '016', banco: '001 - Banco do Brasil', situacao: 'Aberto',
        data: getFutureDate(-12), valor: 8900.00, vencimento: getFutureDate(45),
        cedente: 'Materiais Zeta Ltda', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '67890123456', seuNumero: 'NF-1012345',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '17',
    fornecedor: 'Logística Eta ME', cnpjFornecedor: '78.901.234/0001-56', cnpjPagador: CNPJ_MATRIZ,
    valor: 1450.25, vencimento: getFutureDate(32), status: 'Aberto', origem: 'Manual', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@eta.com', dataGeracao: getFutureDate(-7), valor: 1450.25, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Logística Eta ME' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '000890123', serie: '1', situacao: 'Autorizada', data: getFutureDate(-7),
        valor: 1450.25, formaPagamento: 'Boleto', chaveAcesso: '35202578901234000156550010008901231000089012',
        itens: [
          { descricao: 'Material de embalagem', unidade: 'UN', quantidade: 50, precoUnitario: 29.005, valorTotal: 1450.25, codigo: 'EMB001', ncm: '48191000', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 1450.25, vICMS: 261.045, vIPI: 0 },
        ],
        associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '017', banco: '341 - Itaú Unibanco', situacao: 'Aberto',
        data: getFutureDate(-7), valor: 1450.25, vencimento: getFutureDate(32),
        cedente: 'Logística Eta ME', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '78901234567', seuNumero: 'MAN-2025-017',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '18',
    fornecedor: 'Tecnologia Theta S/A', cnpjFornecedor: '89.012.345/0001-67', cnpjPagador: CNPJ_FILIAL1,
    valor: 6200.00, vencimento: getFutureDate(50), status: 'Aberto', origem: 'NFS-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@theta.com.br', dataGeracao: getFutureDate(-15), valor: 6200.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Tecnologia Theta S/A' },
    documentosAssociados: [
      makeNFe('Tecnologia Theta S/A', '89.012.345/0001-67', 6200.00, getFutureDate(-15)),
      {
        tipo: 'NFS-e', numero: '001123456', situacao: 'Autorizada', data: getFutureDate(-15), valor: 6200.00,
        codigoVerificacao: 'MNO345PQR678', prestador: 'Tecnologia Theta S/A', tomador: 'Qive Tecnologia LTDA',
        municipio: 'São Paulo - SP', descricaoServico: 'Desenvolvimento de aplicações web e mobile',
        aliquotaISS: 5.0, valorISS: 310.00,
        retencoes: { valorIR: 0, valorPIS: 40.30, valorCOFINS: 186.00, valorCSLL: 124.00 },
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '018', banco: '237 - Bradesco', situacao: 'Aberto',
        data: getFutureDate(-15), valor: 6200.00, vencimento: getFutureDate(50),
        cedente: 'Tecnologia Theta S/A', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '89012345678', seuNumero: 'NFS-1123456',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '19',
    fornecedor: 'Transportes Iota Express', cnpjFornecedor: '90.123.456/0001-78', cnpjPagador: CNPJ_MATRIZ,
    valor: 4100.80, vencimento: getFutureDate(38), status: 'Aberto', origem: 'CT-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@iota.com', dataGeracao: getFutureDate(-8), valor: 4100.80, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Transportes Iota Express' },
    documentosAssociados: [
      makeNFe('Transportes Iota Express', '90.123.456/0001-78', 4100.80, getFutureDate(-8)),
      {
        tipo: 'CT-e', numero: '001234567', serie: '1', situacao: 'Autorizado', data: getFutureDate(-8),
        valor: 4100.80, chaveAcesso: '51251090123456000178570010012345678901234567',
        remetente: 'Transportes Iota Express', destinatario: 'Qive Tecnologia LTDA',
        origem: 'São Paulo - SP', destino: 'Fortaleza - CE',
        pesoTotal: 3500.0, valorCarga: 55000.0, associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '019', banco: '104 - Caixa Econômica Federal', situacao: 'Aberto',
        data: getFutureDate(-8), valor: 4100.80, vencimento: getFutureDate(38),
        cedente: 'Transportes Iota Express', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '90123456789', seuNumero: 'CTE-1234567',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '20',
    fornecedor: 'Serviços Kappa Ltda', cnpjFornecedor: '01.234.567/0001-89', cnpjPagador: CNPJ_FILIAL1,
    valor: 1800.90, vencimento: getFutureDate(42), status: 'Aberto', origem: 'Boleto', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@kappa.com.br', dataGeracao: getFutureDate(-11), valor: 1800.90, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Serviços Kappa Ltda' },
    documentosAssociados: [
      makeNFe('Serviços Kappa Ltda', '01.234.567/0001-89', 1800.90, getFutureDate(-11)),
      {
        tipo: 'Boleto', numero: '020', banco: '033 - Santander', situacao: 'Aberto',
        data: getFutureDate(-11), valor: 1800.90, vencimento: getFutureDate(42),
        cedente: 'Serviços Kappa Ltda', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '01234567890', seuNumero: 'BOL-2025-020',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '21',
    fornecedor: 'Materiais Lambda S/A', cnpjFornecedor: '89.012.345/0001-67', cnpjPagador: CNPJ_MATRIZ,
    valor: 10500.00, vencimento: getFutureDate(55), status: 'Aberto', origem: 'NF-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@lambda.com', dataGeracao: getFutureDate(-18), valor: 10500.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Materiais Lambda S/A' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '001345678', serie: '1', situacao: 'Autorizada', data: getFutureDate(-18),
        valor: 10500.00, formaPagamento: 'Boleto', chaveAcesso: '35202512345678000190550010013456781000013456',
        itens: [
          { descricao: 'Tijolos cerâmicos', unidade: 'UN', quantidade: 5000, precoUnitario: 2.10, valorTotal: 10500.00, codigo: 'TIJ001', ncm: '69041000', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 10500.00, vICMS: 1890.00, vIPI: 0 },
        ],
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '021', banco: '001 - Banco do Brasil', situacao: 'Aberto',
        data: getFutureDate(-18), valor: 10500.00, vencimento: getFutureDate(55),
        cedente: 'Materiais Lambda S/A', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '12345678901', seuNumero: 'NF-1345678',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '22',
    fornecedor: 'Logística Mu ME', cnpjFornecedor: '23.456.789/0001-01', cnpjPagador: CNPJ_FILIAL1,
    valor: 2750.60, vencimento: getFutureDate(48), status: 'Aberto', origem: 'Manual', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@mu.com.br', dataGeracao: getFutureDate(-13), valor: 2750.60, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Logística Mu ME' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '001012345', serie: '1', situacao: 'Autorizada', data: getFutureDate(-13),
        valor: 2750.60, formaPagamento: 'Boleto', chaveAcesso: '35202523456789000101550010010123451000010123',
        itens: [
          { descricao: 'Equipamentos de movimentação', unidade: 'UN', quantidade: 12, precoUnitario: 229.22, valorTotal: 2750.60, codigo: 'MOV001', ncm: '84289090', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 2750.60, vICMS: 495.108, vIPI: 0 },
        ],
        associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '022', banco: '341 - Itaú Unibanco', situacao: 'Aberto',
        data: getFutureDate(-13), valor: 2750.60, vencimento: getFutureDate(48),
        cedente: 'Logística Mu ME', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '23456789012', seuNumero: 'MAN-2025-022',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '23',
    fornecedor: 'Tecnologia Nu Ltda', cnpjFornecedor: '34.567.890/0001-12', cnpjPagador: CNPJ_MATRIZ,
    valor: 3800.00, vencimento: getFutureDate(60), status: 'Aberto', origem: 'NFS-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@nu.com', dataGeracao: getFutureDate(-20), valor: 3800.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Tecnologia Nu Ltda' },
    documentosAssociados: [
      makeNFe('Tecnologia Nu Ltda', '34.567.890/0001-12', 3800.00, getFutureDate(-20)),
      {
        tipo: 'NFS-e', numero: '001456789', situacao: 'Autorizada', data: getFutureDate(-20), valor: 3800.00,
        codigoVerificacao: 'PQR678STU901', prestador: 'Tecnologia Nu Ltda', tomador: 'Qive Tecnologia LTDA',
        municipio: 'São Paulo - SP', descricaoServico: 'Manutenção de sistemas e suporte técnico',
        aliquotaISS: 5.0, valorISS: 190.00,
        retencoes: { valorIR: 0, valorPIS: 24.70, valorCOFINS: 114.00, valorCSLL: 76.00 },
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '023', banco: '237 - Bradesco', situacao: 'Aberto',
        data: getFutureDate(-20), valor: 3800.00, vencimento: getFutureDate(60),
        cedente: 'Tecnologia Nu Ltda', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '34567890123', seuNumero: 'NFS-1456789',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '24',
    fornecedor: 'Transportes Xi Express', cnpjFornecedor: '45.678.901/0001-23', cnpjPagador: CNPJ_FILIAL1,
    valor: 5200.40, vencimento: getFutureDate(52), status: 'Aberto', origem: 'CT-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@xi.com.br', dataGeracao: getFutureDate(-14), valor: 5200.40, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Transportes Xi Express' },
    documentosAssociados: [
      makeNFe('Transportes Xi Express', '45.678.901/0001-23', 5200.40, getFutureDate(-14)),
      {
        tipo: 'CT-e', numero: '001567890', serie: '1', situacao: 'Autorizado', data: getFutureDate(-14),
        valor: 5200.40, chaveAcesso: '51251045678901000123570010015678901234567890',
        remetente: 'Transportes Xi Express', destinatario: 'Qive Tecnologia LTDA',
        origem: 'São Paulo - SP', destino: 'Recife - PE',
        pesoTotal: 4200.0, valorCarga: 75000.0, associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '024', banco: '104 - Caixa Econômica Federal', situacao: 'Aberto',
        data: getFutureDate(-14), valor: 5200.40, vencimento: getFutureDate(52),
        cedente: 'Transportes Xi Express', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '45678901234', seuNumero: 'CTE-1567890',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '25',
    fornecedor: 'Serviços Omicron S/A', cnpjFornecedor: '56.789.012/0001-34', cnpjPagador: CNPJ_MATRIZ,
    valor: 3100.75, vencimento: getFutureDate(65), status: 'Aberto', origem: 'Boleto', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@omicron.com', dataGeracao: getFutureDate(-16), valor: 3100.75, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Serviços Omicron S/A' },
    documentosAssociados: [
      makeNFe('Serviços Omicron S/A', '56.789.012/0001-34', 3100.75, getFutureDate(-16)),
      {
        tipo: 'Boleto', numero: '025', banco: '033 - Santander', situacao: 'Aberto',
        data: getFutureDate(-16), valor: 3100.75, vencimento: getFutureDate(65),
        cedente: 'Serviços Omicron S/A', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '56789012345', seuNumero: 'BOL-2025-025',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '26',
    fornecedor: 'Materiais Pi Ltda', cnpjFornecedor: '67.890.123/0001-45', cnpjPagador: CNPJ_FILIAL1,
    valor: 12500.00, vencimento: getFutureDate(70), status: 'Aberto', origem: 'NF-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@pi.com.br', dataGeracao: getFutureDate(-22), valor: 12500.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Materiais Pi Ltda' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '001678901', serie: '1', situacao: 'Autorizada', data: getFutureDate(-22),
        valor: 12500.00, formaPagamento: 'Boleto', chaveAcesso: '35202567890123000145550010016789011000016789',
        itens: [
          { descricao: 'Concreto pré-moldado', unidade: 'M3', quantidade: 50, precoUnitario: 250.00, valorTotal: 12500.00, codigo: 'CON001', ncm: '68109100', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 12500.00, vICMS: 2250.00, vIPI: 0 },
        ],
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '026', banco: '001 - Banco do Brasil', situacao: 'Aberto',
        data: getFutureDate(-22), valor: 12500.00, vencimento: getFutureDate(70),
        cedente: 'Materiais Pi Ltda', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '67890123456', seuNumero: 'NF-1678901',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '27',
    fornecedor: 'Logística Rho ME', cnpjFornecedor: '78.901.234/0001-56', cnpjPagador: CNPJ_MATRIZ,
    valor: 1950.30, vencimento: getFutureDate(58), status: 'Aberto', origem: 'Manual', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@rho.com', dataGeracao: getFutureDate(-17), valor: 1950.30, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Logística Rho ME' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '001123456', serie: '1', situacao: 'Autorizada', data: getFutureDate(-17),
        valor: 1950.30, formaPagamento: 'Boleto', chaveAcesso: '35202578901234000156550010011234561000011234',
        itens: [
          { descricao: 'Sistemas de rastreamento', unidade: 'UN', quantidade: 6, precoUnitario: 325.05, valorTotal: 1950.30, codigo: 'RAS001', ncm: '85291090', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 1950.30, vICMS: 351.054, vIPI: 0 },
        ],
        associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '027', banco: '341 - Itaú Unibanco', situacao: 'Aberto',
        data: getFutureDate(-17), valor: 1950.30, vencimento: getFutureDate(58),
        cedente: 'Logística Rho ME', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '78901234567', seuNumero: 'MAN-2025-027',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '28',
    fornecedor: 'Tecnologia Sigma S/A', cnpjFornecedor: '89.012.345/0001-67', cnpjPagador: CNPJ_FILIAL1,
    valor: 7200.00, vencimento: getFutureDate(75), status: 'Aberto', origem: 'NFS-e', lancadoEm: 'conferir',
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@sigma.com.br', dataGeracao: getFutureDate(-25), valor: 7200.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Tecnologia Sigma S/A' },
    documentosAssociados: [
      makeNFe('Tecnologia Sigma S/A', '89.012.345/0001-67', 7200.00, getFutureDate(-25)),
      {
        tipo: 'NFS-e', numero: '001789012', situacao: 'Autorizada', data: getFutureDate(-25), valor: 7200.00,
        codigoVerificacao: 'STU901VWX234', prestador: 'Tecnologia Sigma S/A', tomador: 'Qive Tecnologia LTDA',
        municipio: 'São Paulo - SP', descricaoServico: 'Implementação de sistemas de gestão empresarial',
        aliquotaISS: 5.0, valorISS: 360.00,
        retencoes: { valorIR: 0, valorPIS: 46.80, valorCOFINS: 216.00, valorCSLL: 144.00 },
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '028', banco: '237 - Bradesco', situacao: 'Aberto',
        data: getFutureDate(-25), valor: 7200.00, vencimento: getFutureDate(75),
        cedente: 'Tecnologia Sigma S/A', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '89012345678', seuNumero: 'NFS-1789012',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },

  // Documentos PAGOS (3 documentos)
  {
    id: '29',
    fornecedor: 'Construções Omega Ltda', cnpjFornecedor: '90.123.456/0001-78', cnpjPagador: CNPJ_MATRIZ,
    valor: 4500.00, vencimento: getFutureDate(-5), status: 'Pago', origem: 'NF-e', lancadoEm: 'liquidados',
    etapasVisitadas: ['conferir', 'aprovacao', 'pagar', 'liquidados'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@omega.com.br', dataGeracao: getFutureDate(-8), valor: 4500.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Construções Omega Ltda' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '001890123', serie: '1', situacao: 'Autorizada', data: getFutureDate(-8),
        valor: 4500.00, formaPagamento: 'Boleto', chaveAcesso: '35202590123456000178550010018901231000018901',
        itens: [
          { descricao: 'Tubos de PVC', unidade: 'UN', quantidade: 100, precoUnitario: 45.00, valorTotal: 4500.00, codigo: 'TUB001', ncm: '39172300', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 4500.00, vICMS: 810.00, vIPI: 0 },
        ],
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '029', banco: '001 - Banco do Brasil', situacao: 'Pago',
        data: getFutureDate(-8), valor: 4500.00, vencimento: getFutureDate(-5),
        cedente: 'Construções Omega Ltda', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '90123456789', seuNumero: 'NF-1890123',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
      makeComprovante(
        4500.0,
        getFutureDate(-5),
        '001 - Banco do Brasil',
        CNPJ_MATRIZ,
        '09111216710000455088',
      ),
    ],
  },
  {
    id: '30',
    fornecedor: 'Serviços Técnicos Phi', cnpjFornecedor: '01.234.567/0001-89', cnpjPagador: CNPJ_FILIAL1,
    valor: 2200.75, vencimento: getFutureDate(-3), status: 'Pago', origem: 'NFS-e', lancadoEm: 'liquidados',
    etapasVisitadas: ['conferir', 'aprovacao', 'pagar', 'liquidados'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@phi.com.br', dataGeracao: getFutureDate(-6), valor: 2200.75, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Serviços Técnicos Phi' },
    documentosAssociados: [
      makeNFe('Serviços Técnicos Phi', '01.234.567/0001-89', 2200.75, getFutureDate(-6)),
      {
        tipo: 'NFS-e', numero: '002012345', situacao: 'Autorizada', data: getFutureDate(-6), valor: 2200.75,
        codigoVerificacao: 'VWX234YZA567', prestador: 'Serviços Técnicos Phi', tomador: 'Qive Tecnologia LTDA',
        municipio: 'São Paulo - SP', descricaoServico: 'Serviços de manutenção e reparo técnico',
        aliquotaISS: 5.0, valorISS: 110.04,
        retencoes: { valorIR: 0, valorPIS: 14.30, valorCOFINS: 66.02, valorCSLL: 44.02 },
        associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '030', banco: '341 - Itaú Unibanco', situacao: 'Pago',
        data: getFutureDate(-6), valor: 2200.75, vencimento: getFutureDate(-3),
        cedente: 'Serviços Técnicos Phi', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '01234567890', seuNumero: 'NFS-2012345',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
      makeComprovante(
        2200.75,
        getFutureDate(-3),
        '341 - Itaú Unibanco',
        CNPJ_FILIAL1,
        '09111216710900455068',
      ),
    ],
  },
  {
    id: '31',
    fornecedor: 'Distribuidora Chi S/A', cnpjFornecedor: '90.123.456/0001-78', cnpjPagador: CNPJ_MATRIZ,
    valor: 6800.50, vencimento: getFutureDate(-7), status: 'Pago', origem: 'CT-e', lancadoEm: 'liquidados',
    etapasVisitadas: ['conferir', 'aprovacao', 'pagar', 'liquidados'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@chi.com', dataGeracao: getFutureDate(-10), valor: 6800.50, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Distribuidora Chi S/A' },
    documentosAssociados: [
      makeNFe('Distribuidora Chi S/A', '90.123.456/0001-78', 6800.50, getFutureDate(-10)),
      {
        tipo: 'CT-e', numero: '001234567', serie: '1', situacao: 'Autorizado', data: getFutureDate(-10),
        valor: 6800.50, chaveAcesso: '51251012345678000190570010012345678901234567',
        remetente: 'Distribuidora Chi S/A', destinatario: 'Qive Tecnologia LTDA',
        origem: 'São Paulo - SP', destino: 'Curitiba - PR',
        pesoTotal: 5000.0, valorCarga: 85000.0, associacao: 'Automática',
      },
      {
        tipo: 'Boleto', numero: '031', banco: '104 - Caixa Econômica Federal', situacao: 'Pago',
        data: getFutureDate(-10), valor: 6800.50, vencimento: getFutureDate(-7),
        cedente: 'Distribuidora Chi S/A', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '12345678901', seuNumero: 'CTE-1234567',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },

  // Documentos CANCELADOS (4 documentos)
  {
    id: '32',
    fornecedor: 'Materiais Psi Ltda', cnpjFornecedor: '23.456.789/0001-01', cnpjPagador: CNPJ_FILIAL1,
    valor: 850.00, vencimento: getFutureDate(10), status: 'Cancelado', origem: 'NF-e', lancadoEm: 'cancelados',
    cancelamentoOrigem: 'Por nota',
    notaAtualizadaAposCriacao: true,
    etapasVisitadas: ['conferir'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@psi.com.br', dataGeracao: getFutureDate(-2), valor: 850.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Materiais Psi Ltda' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '002123456', serie: '1', situacao: 'Cancelada', data: getFutureDate(-2),
        valor: 850.00, formaPagamento: 'Boleto', chaveAcesso: '35202523456789000101550010021234561000021234',
        itens: [
          { descricao: 'Materiais elétricos', unidade: 'UN', quantidade: 10, precoUnitario: 85.00, valorTotal: 850.00, codigo: 'ELE001', ncm: '85369090', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 850.00, vICMS: 153.00, vIPI: 0 },
        ],
        associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '032', banco: '237 - Bradesco', situacao: 'Cancelado',
        data: getFutureDate(-2), valor: 850.00, vencimento: getFutureDate(10),
        cedente: 'Materiais Psi Ltda', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '23456789012', seuNumero: 'NF-2123456',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '33',
    fornecedor: 'Logística Omega Express', cnpjFornecedor: '34.567.890/0001-12', cnpjPagador: CNPJ_MATRIZ,
    valor: 420.75, vencimento: getFutureDate(8), status: 'Cancelado', origem: 'Manual', lancadoEm: 'cancelados',
    cancelamentoOrigem: 'Manual',
    etapasVisitadas: ['conferir', 'aprovacao'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@omega.com', dataGeracao: getFutureDate(-1), valor: 420.75, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Logística Omega Express' },
    documentosAssociados: [
      {
        tipo: 'NF-e', numero: '002234567', serie: '1', situacao: 'Cancelada', data: getFutureDate(-1),
        valor: 420.75, formaPagamento: 'Boleto', chaveAcesso: '35202534567890000112550010022345671000022345',
        itens: [
          { descricao: 'Equipamentos de segurança', unidade: 'UN', quantidade: 3, precoUnitario: 140.25, valorTotal: 420.75, codigo: 'SEG001', ncm: '84289090', cfop: '5102', cst: '00', aliqICMS: 18, aliqIPI: 0, bcICMS: 420.75, vICMS: 75.735, vIPI: 0 },
        ],
        associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '033', banco: '341 - Itaú Unibanco', situacao: 'Cancelado',
        data: getFutureDate(-1), valor: 420.75, vencimento: getFutureDate(8),
        cedente: 'Logística Omega Express', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '34567890123', seuNumero: 'MAN-2025-033',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '34',
    fornecedor: 'Tecnologia Tau S/A', cnpjFornecedor: '45.678.901/0001-23', cnpjPagador: CNPJ_FILIAL1,
    valor: 1200.00, vencimento: getFutureDate(12), status: 'Cancelado', origem: 'NFS-e', lancadoEm: 'cancelados',
    cancelamentoOrigem: 'Por nota',
    notaAtualizadaAposCriacao: true,
    etapasVisitadas: ['conferir', 'aprovacao', 'pagar'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@tau.com.br', dataGeracao: getFutureDate(-4), valor: 1200.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Tecnologia Tau S/A' },
    documentosAssociados: [
      makeNFe('Tecnologia Tau S/A', '45.678.901/0001-23', 1200.00, getFutureDate(-4)),
      {
        tipo: 'NFS-e', numero: '002345678', situacao: 'Cancelada', data: getFutureDate(-4), valor: 1200.00,
        codigoVerificacao: 'YZA567BCD890', prestador: 'Tecnologia Tau S/A', tomador: 'Qive Tecnologia LTDA',
        municipio: 'São Paulo - SP', descricaoServico: 'Desenvolvimento de aplicações customizadas',
        aliquotaISS: 5.0, valorISS: 60.00,
        retencoes: { valorIR: 0, valorPIS: 7.80, valorCOFINS: 36.00, valorCSLL: 24.00 },
        associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '034', banco: '237 - Bradesco', situacao: 'Cancelado',
        data: getFutureDate(-4), valor: 1200.00, vencimento: getFutureDate(12),
        cedente: 'Tecnologia Tau S/A', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '45678901234', seuNumero: 'NFS-2345678',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },
  {
    id: '35',
    fornecedor: 'Transportes Upsilon ME', cnpjFornecedor: '56.789.012/0001-34', cnpjPagador: CNPJ_MATRIZ,
    valor: 680.50, vencimento: getFutureDate(15), status: 'Cancelado', origem: 'CT-e', lancadoEm: 'cancelados',
    cancelamentoOrigem: 'Por boleto',
    etapasVisitadas: ['conferir'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@upsilon.com', dataGeracao: getFutureDate(-3), valor: 680.50, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Transportes Upsilon ME' },
    documentosAssociados: [
      makeNFe('Transportes Upsilon ME', '56.789.012/0001-34', 680.50, getFutureDate(-3)),
      {
        tipo: 'CT-e', numero: '002456789', serie: '1', situacao: 'Cancelado', data: getFutureDate(-3),
        valor: 680.50, chaveAcesso: '51251056789012000134570010024567891234567890',
        remetente: 'Transportes Upsilon ME', destinatario: 'Qive Tecnologia LTDA',
        origem: 'São Paulo - SP', destino: 'Brasília - DF',
        pesoTotal: 1800.0, valorCarga: 30000.0, associacao: 'Manual',
      },
      {
        tipo: 'Boleto', numero: '035', banco: '104 - Caixa Econômica Federal', situacao: 'Cancelado',
        data: getFutureDate(-3), valor: 680.50, vencimento: getFutureDate(15),
        cedente: 'Transportes Upsilon ME', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '56789012345', seuNumero: 'CTE-2456789',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Manual',
      },
    ],
  },

  // Gerar dados em lote
  ...Array.from({ length: 124 }, (_, i) => {
    const id = 100 + i;
    const daysAgo = Math.floor(Math.random() * 120) + 30; // 30 a 150 dias atrás
    const vencimentoDaysAgo = Math.floor(Math.random() * 30) + daysAgo - 10;
    const fornecedores = [
      'Fornecedora Alpha', 'Distribuidora Beta', 'Comercial Gamma', 'Indústria Delta',
      'Serviços Epsilon', 'Materiais Zeta', 'Logística Eta', 'Tecnologia Theta',
      'Transportes Iota', 'Atacado Kappa', 'AutoPeças Lambda', 'Construções Mu',
      'DigitalMind Nu', 'Soluções Xi', 'Equipamentos Omicron', 'Produtos Pi',
      'Comercial Rho', 'Materiais Sigma', 'Serviços Tau', 'Logística Upsilon',
    ];
    const origens = ['NF-e', 'NFS-e', 'CT-e', 'Boleto', 'Manual'] as const;
    const bancos = ['001 - Banco do Brasil', '341 - Itaú Unibanco', '237 - Bradesco', '104 - Caixa Econômica Federal', '033 - Santander'];
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const banco = bancos[i % bancos.length];
    const valor = Math.floor(Math.random() * 10000) + 500;
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: getFutureDate(-vencimentoDaysAgo),
      status: 'Pago' as const,
      origem,
      lancadoEm: 'liquidados' as const,
      etapasVisitadas: ['conferir', 'aprovacao', 'pagar', 'liquidados'] as Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'Boleto' as const, favorecido: `${fornecedor} ${i}` },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (100 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Autorizada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: (100 + i).toString().padStart(3, '0'),
          banco,
          situacao: 'Pago',
          data: getFutureDate(-daysAgo),
          valor,
          vencimento: getFutureDate(-vencimentoDaysAgo),
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `PAG-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
        ...(i % 2 === 0
          ? [
              makeComprovante(
                valor,
                getFutureDate(-vencimentoDaysAgo),
                banco,
                cnpjPagador,
                `09111216710${String(i).padStart(8, '0')}`,
              ),
            ]
          : []),
      ],
    };
  }),

  // Gerar contas canceladas em lote
  ...Array.from({ length: 42 }, (_, i) => {
    const id = 300 + i;
    const daysAgo = Math.floor(Math.random() * 90) + 15; // 15 a 105 dias atrás
    const fornecedores = [
      'Fornecedora Alpha', 'Distribuidora Beta', 'Comercial Gamma', 'Indústria Delta',
      'Serviços Epsilon', 'Materiais Zeta', 'Logística Eta', 'Tecnologia Theta',
      'Transportes Iota', 'Atacado Kappa', 'AutoPeças Lambda', 'Construções Mu',
      'DigitalMind Nu', 'Soluções Xi', 'Equipamentos Omicron', 'Produtos Pi',
      'Comercial Rho', 'Materiais Sigma', 'Serviços Tau', 'Logística Upsilon',
    ];
    const origens = ['NF-e', 'NFS-e', 'CT-e', 'Boleto', 'Manual'] as const;
    const bancos = ['001 - Banco do Brasil', '341 - Itaú Unibanco', '237 - Bradesco', '104 - Caixa Econômica Federal', '033 - Santander'];
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const banco = bancos[i % bancos.length];
    const valor = Math.floor(Math.random() * 5000) + 200;
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;
    const vencimentoDays = Math.floor(Math.random() * 30) + 5;

    // Variar as etapas visitadas para mostrar diferentes cenários de cancelamento
    const etapasVariacoes: Array<Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>> = [
      ['conferir'],
      ['conferir', 'aprovacao'],
      ['conferir', 'aprovacao', 'pagar'],
    ];
    const etapasVisitadas: Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'> = etapasVariacoes[i % etapasVariacoes.length];
    const tiposCancelamento = ['Manual', 'Por nota', 'Por boleto'] as const;
    const cancelamentoOrigem = tiposCancelamento[i % tiposCancelamento.length];

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: getFutureDate(vencimentoDays),
      status: 'Cancelado' as const,
      origem,
      lancadoEm: 'cancelados' as const,
      cancelamentoOrigem,
      etapasVisitadas,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'Boleto' as const, favorecido: `${fornecedor} ${i}` },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (300 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Cancelada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: (300 + i).toString().padStart(3, '0'),
          banco,
          situacao: 'Cancelado',
          data: getFutureDate(-daysAgo),
          valor,
          vencimento: getFutureDate(vencimentoDays),
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `CAN-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
      ],
    };
  }),

  // Documentos BLOQUEADOS (3 documentos)
  {
    id: '36',
    fornecedor: 'Comercial ABC Distribuidora', cnpjFornecedor: '11.222.333/0001-44', cnpjPagador: CNPJ_MATRIZ,
    valor: 3250.80, vencimento: getFutureDate(14), status: 'Aberto', origem: 'Boleto', lancadoEm: 'bloqueados',
    etapasVisitadas: ['conferir'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    observacoes: '[ERP] Fornecedor emitiu boleto com valor errado',
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@abcdistribuidora.com.br', dataGeracao: getFutureDate(-5), valor: 3250.80, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Comercial ABC Distribuidora' },
    documentosAssociados: [
      makeNFe('Comercial ABC Distribuidora', '11.222.333/0001-44', 3250.80, getFutureDate(-5)),
      {
        tipo: 'Boleto', numero: '036', banco: '001 - Banco do Brasil', situacao: 'Aberto',
        data: getFutureDate(-5), valor: 3250.80, vencimento: getFutureDate(14),
        cedente: 'Comercial ABC Distribuidora', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '11222333444', seuNumero: 'BOL-2025-036',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '37',
    fornecedor: 'Indústria XYZ Componentes', cnpjFornecedor: '22.333.444/0001-55', cnpjPagador: CNPJ_FILIAL1,
    valor: 5890.00, vencimento: getFutureDate(21), status: 'Aberto', origem: 'Boleto', lancadoEm: 'bloqueados',
    etapasVisitadas: ['conferir', 'aprovacao', 'pagar'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    observacoes: '[ERP] Boleto com data de vencimento divergente da NF-e',
    formaPagamento: { tipo: 'PIX', chavePix: 'pix@xyzcomponentes.com.br', dataGeracao: getFutureDate(-8), valor: 5890.00, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Indústria XYZ Componentes' },
    documentosAssociados: [
      makeNFe('Indústria XYZ Componentes', '22.333.444/0001-55', 5890.00, getFutureDate(-8)),
      {
        tipo: 'Boleto', numero: '037', banco: '341 - Itaú Unibanco', situacao: 'Aberto',
        data: getFutureDate(-8), valor: 5890.00, vencimento: getFutureDate(21),
        cedente: 'Indústria XYZ Componentes', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '22333444555', seuNumero: 'BOL-2025-037',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },
  {
    id: '38',
    fornecedor: 'Serviços LMN Consultoria', cnpjFornecedor: '33.444.555/0001-66', cnpjPagador: CNPJ_MATRIZ,
    valor: 2100.50, vencimento: getFutureDate(18), status: 'Aberto', origem: 'Boleto', lancadoEm: 'bloqueados',
    etapasVisitadas: ['conferir'],
    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),
    observacoes: '[ERP] Código de barras do boleto inválido',
    formaPagamento: { tipo: 'PIX', chavePix: 'financeiro@lmnconsultoria.com', dataGeracao: getFutureDate(-6), valor: 2100.50, descontos: 0 },
    pagamentoPreferencial: { tipo: 'Boleto', favorecido: 'Serviços LMN Consultoria' },
    documentosAssociados: [
      makeNFe('Serviços LMN Consultoria', '33.444.555/0001-66', 2100.50, getFutureDate(-6)),
      {
        tipo: 'Boleto', numero: '038', banco: '237 - Bradesco', situacao: 'Aberto',
        data: getFutureDate(-6), valor: 2100.50, vencimento: getFutureDate(18),
        cedente: 'Serviços LMN Consultoria', sacado: 'Qive Tecnologia LTDA',
        nossoNumero: '33444555666', seuNumero: 'BOL-2025-038',
        codigoBarras: generateBarcode(), descontos: 0, moraMulta: 0, associacao: 'Automática',
      },
    ],
  },

  // EXPANSÃO: Mais registros para tornar gráficos mais interessantes
  // Adicionar mais registros em CONFERIR (40% do total)
  ...Array.from({ length: 80 }, (_, i) => {
    const id = 400 + i;
    const daysAgo = Math.floor(Math.random() * 30) + 1; // 1 a 30 dias atrás
    const vencimentoDays = Math.floor(Math.random() * 60) - 10; // -10 a 50 dias (alguns vencidos, alguns futuros)
    const fornecedores = [
      'Materiais Industriais SP', 'Equipamentos Tech', 'Suprimentos Office', 'Serviços Gerais',
      'Logística Rápida', 'Construções Modernas', 'Tecnologia Avançada', 'Distribuidora Central',
      'Comércio Eletrônico', 'Indústria Nacional', 'Importadora Global', 'Exportadora Premium',
    ];
    const origens = ['NF-e', 'NFS-e', 'CT-e', 'Boleto', 'Manual'] as const;
    const bancos = ['001 - Banco do Brasil', '341 - Itaú Unibanco', '237 - Bradesco', '104 - Caixa Econômica Federal', '033 - Santander'];
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const banco = bancos[i % bancos.length];
    // Variação de valores: pequenos (500-2000), médios (2000-8000), grandes (8000-15000)
    const valorTier = i % 3;
    const valor = valorTier === 0 
      ? Math.floor(Math.random() * 1500) + 500
      : valorTier === 1
      ? Math.floor(Math.random() * 6000) + 2000
      : Math.floor(Math.random() * 7000) + 8000;
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;
    
    // Alguns vencidos, alguns futuros
    const status: 'Aberto' | 'Vencido' = vencimentoDays < 0 ? 'Vencido' : 'Aberto';

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: getFutureDate(vencimentoDays),
      status,
      origem,
      lancadoEm: 'conferir' as const,
      etapasVisitadas: ['conferir'] as Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}${i}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'Boleto' as const, favorecido: `${fornecedor} ${i}` },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (400 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Autorizada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: `B${(400 + i).toString().padStart(5, '0')}`,
          banco,
          situacao: 'Aberto',
          data: getFutureDate(-daysAgo),
          valor,
          vencimento: getFutureDate(vencimentoDays),
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `PAG-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
      ],
    };
  }),

  // Adicionar mais registros em APROVACAO (25% do total)
  ...Array.from({ length: 50 }, (_, i) => {
    const id = 500 + i;
    const daysAgo = Math.floor(Math.random() * 20) + 1; // 1 a 20 dias atrás
    const vencimentoDays = Math.floor(Math.random() * 45) + 5; // 5 a 50 dias futuros
    const fornecedores = [
      'Consultoria Estratégica', 'Serviços Profissionais', 'Assessoria Empresarial', 'Gestão de Projetos',
      'Desenvolvimento de Software', 'Marketing Digital', 'Publicidade e Propaganda', 'Recursos Humanos',
    ];
    const origens = ['NF-e', 'NFS-e', 'Manual'] as const;
    const bancos = ['001 - Banco do Brasil', '341 - Itaú Unibanco', '237 - Bradesco'];
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const banco = bancos[i % bancos.length];
    // Valores maiores para aprovação (geralmente acima de R$ 5.000)
    const valor = Math.floor(Math.random() * 20000) + 5000;
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;
    
    // Aprovações pendentes
    const aprovadores = ['Carlos Mendes', 'Ana Silva', 'Roberto Santos', 'Maria Oliveira'];
    const aprovador = aprovadores[i % aprovadores.length];

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: getFutureDate(vencimentoDays),
      status: 'Aberto' as const,
      origem,
      lancadoEm: 'aprovacao' as const,
      etapasVisitadas: ['conferir', 'aprovacao'] as Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}${i}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'Boleto' as const, favorecido: `${fornecedor} ${i}` },
      aprovacao: {
        aprovador,
        emailAprovador: `${aprovador.toLowerCase().replace(/\s/g, '.')}@qive.com.br`,
        statusAprovacao: 'Pendente' as const,
        dataEnvio: getFutureDate(-daysAgo),
      },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (500 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Autorizada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: `B${(500 + i).toString().padStart(5, '0')}`,
          banco,
          situacao: 'Aberto',
          data: getFutureDate(-daysAgo),
          valor,
          vencimento: getFutureDate(vencimentoDays),
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `PAG-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
      ],
    };
  }),

  // Adicionar mais registros em PAGAR (20% do total)
  ...Array.from({ length: 40 }, (_, i) => {
    const id = 600 + i;
    const daysAgo = Math.floor(Math.random() * 15) + 1; // 1 a 15 dias atrás
    const vencimentoDays = Math.floor(Math.random() * 14) + 1; // 1 a 14 dias futuros (próximos a vencer)
    const fornecedores = [
      'Fornecedor Urgente A', 'Pagamento Imediato B', 'Vencimento Próximo C', 'Conta Prioritária D',
      'Serviço Essencial E', 'Material Crítico F', 'Operação Importante G', 'Negócio Estratégico H',
    ];
    const origens = ['NF-e', 'NFS-e', 'Boleto', 'Manual'] as const;
    const bancos = ['001 - Banco do Brasil', '341 - Itaú Unibanco', '237 - Bradesco', '104 - Caixa Econômica Federal'];
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const banco = bancos[i % bancos.length];
    // Valores variados para pagar
    const valor = Math.floor(Math.random() * 12000) + 1000;
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: getFutureDate(vencimentoDays),
      status: 'Aberto' as const,
      origem,
      lancadoEm: 'pagar' as const,
      etapasVisitadas: ['conferir', 'aprovacao', 'pagar'] as Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}${i}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'Boleto' as const, favorecido: `${fornecedor} ${i}` },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (600 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Autorizada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: `B${(600 + i).toString().padStart(5, '0')}`,
          banco,
          situacao: 'Aberto',
          data: getFutureDate(-daysAgo),
          valor,
          vencimento: getFutureDate(vencimentoDays),
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `PAG-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
      ],
    };
  }),

  // Adicionar mais registros BLOQUEADOS (5% do total)
  ...Array.from({ length: 10 }, (_, i) => {
    const id = 700 + i;
    const daysAgo = Math.floor(Math.random() * 10) + 1;
    const vencimentoDays = Math.floor(Math.random() * 30) + 5;
    const fornecedores = [
      'Fornecedor Problemático A', 'Divergência Documental B', 'Erro de Dados C', 'Inconsistência Fiscal D',
    ];
    const origens = ['Boleto', 'NF-e'] as const;
    const bancos = ['001 - Banco do Brasil', '341 - Itaú Unibanco', '237 - Bradesco'];
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const banco = bancos[i % bancos.length];
    const valor = Math.floor(Math.random() * 8000) + 2000;
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;
    
    const observacoes = [
      '[ERP] Valor divergente entre boleto e NF-e',
      '[ERP] Data de vencimento inconsistente',
      '[ERP] Código de barras inválido',
      '[ERP] CNPJ do fornecedor não confere',
      '[ERP] Duplicidade de pagamento detectada',
    ];

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: getFutureDate(vencimentoDays),
      status: 'Aberto' as const,
      origem,
      lancadoEm: 'bloqueados' as const,
      etapasVisitadas: ['conferir'] as Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      observacoes: observacoes[i % observacoes.length],
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}${i}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'Boleto' as const, favorecido: `${fornecedor} ${i}` },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (700 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Autorizada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: `B${(700 + i).toString().padStart(5, '0')}`,
          banco,
          situacao: 'Aberto',
          data: getFutureDate(-daysAgo),
          valor,
          vencimento: getFutureDate(vencimentoDays),
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `BOL-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
      ],
    };
  }),

  // Adicionar mais registros PAGOS com variações (alguns em dia, alguns atrasados)
  ...Array.from({ length: 30 }, (_, i) => {
    const id = 800 + i;
    const daysAgo = Math.floor(Math.random() * 60) + 10; // 10 a 70 dias atrás
    // Variação: alguns pagos em dia (vencimento futuro ou igual), alguns atrasados (vencimento passado)
    const vencimentoDaysAgo = i % 3 === 0 
      ? Math.floor(Math.random() * 5) - 2 // Em dia (pago 2 dias antes até 3 dias depois)
      : Math.floor(Math.random() * 15) + 1; // Atrasado (1 a 15 dias depois do vencimento)
    const fornecedores = [
      'Fornecedor Pago A', 'Liquidação Completa B', 'Pagamento Realizado C', 'Conta Quitada D',
    ];
    const origens = ['NF-e', 'NFS-e', 'Boleto', 'Manual'] as const;
    const bancos = ['001 - Banco do Brasil', '341 - Itaú Unibanco', '237 - Bradesco', '104 - Caixa Econômica Federal'];
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const banco = bancos[i % bancos.length];
    const valor = Math.floor(Math.random() * 15000) + 1000;
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: getFutureDate(-vencimentoDaysAgo),
      status: 'Pago' as const,
      origem,
      lancadoEm: 'liquidados' as const,
      etapasVisitadas: ['conferir', 'aprovacao', 'pagar', 'liquidados'] as Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}${i}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'Boleto' as const, favorecido: `${fornecedor} ${i}` },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (800 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Autorizada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: `B${(800 + i).toString().padStart(5, '0')}`,
          banco,
          situacao: 'Pago',
          data: getFutureDate(-daysAgo),
          valor,
          vencimento: getFutureDate(-vencimentoDaysAgo),
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `PAG-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
        makeComprovante(
          valor,
          getFutureDate(-vencimentoDaysAgo + (i % 3 === 0 ? 0 : Math.floor(Math.random() * 5) + 1)),
          banco,
          cnpjPagador,
          `09111216710${String(800 + i).padStart(8, '0')}`,
        ),
      ],
    };
  }),

  // Adicionar alguns registros VENCIDOS para alertas
  ...Array.from({ length: 20 }, (_, i) => {
    const id = 900 + i;
    const daysAgo = Math.floor(Math.random() * 90) + 10; // 10 a 100 dias atrás
    const vencimentoDaysAgo = Math.floor(Math.random() * 60) + 1; // 1 a 60 dias vencidos
    const fornecedores = [
      'Fornecedor Vencido A', 'Conta Atrasada B', 'Pagamento Pendente C', 'Atraso Crítico D',
    ];
    const origens = ['NF-e', 'Boleto', 'Manual'] as const;
    const bancos = ['001 - Banco do Brasil', '341 - Itaú Unibanco', '237 - Bradesco'];
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const banco = bancos[i % bancos.length];
    const valor = Math.floor(Math.random() * 10000) + 1000;
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: getFutureDate(-vencimentoDaysAgo),
      status: 'Vencido' as const,
      origem,
      lancadoEm: 'conferir' as const,
      etapasVisitadas: ['conferir'] as Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}${i}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'Boleto' as const, favorecido: `${fornecedor} ${i}` },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (900 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Autorizada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: `B${(900 + i).toString().padStart(5, '0')}`,
          banco,
          situacao: 'Aberto',
          data: getFutureDate(-daysAgo),
          valor,
          vencimento: getFutureDate(-vencimentoDaysAgo),
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `PAG-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
      ],
    };
  }),

  // Adicionar alguns registros SEM VENCIMENTO para alertas (3 registros)
  ...Array.from({ length: 3 }, (_, i) => {
    const id = 1000 + i;
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const fornecedores = [
      'Serviço Contínuo A', 'Assinatura Mensal B', 'Contrato Anual C',
    ];
    const origens = ['Manual', 'NFS-e'] as const;
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const valor = Math.floor(Math.random() * 5000) + 1000;
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: '', // Sem vencimento - será tratado como null na conversão
      status: 'Aberto' as const,
      origem,
      lancadoEm: 'conferir' as const,
      etapasVisitadas: ['conferir'] as Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}${i}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}${i}.com` },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (1000 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Autorizada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: `B${(1000 + i).toString().padStart(5, '0')}`,
          banco: '001 - Banco do Brasil',
          situacao: 'Aberto',
          data: getFutureDate(-daysAgo),
          valor,
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `PAG-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
      ],
    };
  }),

  // Adicionar alguns registros com VALORES ALTOS (>R$ 10.000) para alertas de divergências
  ...Array.from({ length: 15 }, (_, i) => {
    const id = 1100 + i;
    const daysAgo = Math.floor(Math.random() * 20) + 1;
    const vencimentoDays = Math.floor(Math.random() * 30) + 5;
    const fornecedores = [
      'Grande Fornecedor A', 'Contrato Premium B', 'Operação Estratégica C', 'Investimento Alto D',
    ];
    const origens = ['NF-e', 'Manual'] as const;
    const bancos = ['001 - Banco do Brasil', '341 - Itaú Unibanco', '237 - Bradesco'];
    
    const fornecedor = fornecedores[i % fornecedores.length];
    const origem = origens[i % origens.length];
    const banco = bancos[i % bancos.length];
    const valor = Math.floor(Math.random() * 50000) + 10000; // R$ 10.000 a R$ 60.000
    const cnpjPagador = i % 2 === 0 ? CNPJ_MATRIZ : CNPJ_FILIAL1;
    const lancadoEm: ('conferir' | 'aprovacao' | 'pagar') = i % 3 === 0 ? 'conferir' : i % 3 === 1 ? 'aprovacao' : 'pagar';
    const status: ('Aberto' | 'Vencido') = i % 4 === 0 ? 'Vencido' : 'Aberto';

    return {
      id: id.toString(),
      fornecedor: `${fornecedor} ${i}`,
      cnpjFornecedor: generateCNPJ(),
      cnpjPagador,
      valor,
      vencimento: getFutureDate(vencimentoDays),
      status,
      origem,
      lancadoEm,
      etapasVisitadas: (lancadoEm === 'conferir' ? ['conferir'] : lancadoEm === 'aprovacao' ? ['conferir', 'aprovacao'] : ['conferir', 'aprovacao', 'pagar']) as Array<'conferir' | 'aprovacao' | 'pagar' | 'bloqueados' | 'liquidados' | 'cancelados'>,
      ordemCompra: generateOrdemCompra(),
      centroCusto: generateCentroCusto(),
      formaPagamento: { tipo: 'PIX' as const, chavePix: `pix@${fornecedor.toLowerCase().replace(/\s/g, '')}${i}.com`, dataGeracao: getFutureDate(-daysAgo), valor, descontos: 0 },
      pagamentoPreferencial: { tipo: 'Boleto' as const, favorecido: `${fornecedor} ${i}` },
      documentosAssociados: [
        {
          tipo: 'NF-e' as const,
          numero: (1100 + i).toString().padStart(6, '0'),
          serie: '1',
          situacao: 'Autorizada',
          data: getFutureDate(-daysAgo),
          valor,
          formaPagamento: 'Boleto',
          associacao: 'Automática' as const,
        },
        {
          tipo: 'Boleto' as const,
          numero: `B${(1100 + i).toString().padStart(5, '0')}`,
          banco,
          situacao: 'Aberto',
          data: getFutureDate(-daysAgo),
          valor,
          vencimento: getFutureDate(vencimentoDays),
          cedente: `${fornecedor} ${i}`,
          sacado: 'Qive Tecnologia LTDA',
          nossoNumero: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
          seuNumero: `PAG-${id}`,
          codigoBarras: generateBarcode(),
          descontos: 0,
          moraMulta: 0,
          associacao: 'Automática' as const,
        },
      ],
    };
  }),
];

