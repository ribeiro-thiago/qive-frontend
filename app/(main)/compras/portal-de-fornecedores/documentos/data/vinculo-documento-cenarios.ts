import { MOCK_VINCULO_FRS, MOCK_VINCULO_PO } from "./mock-documentos-origem";

export type VinculoDocumentoCenarioGrupo =
  | "busca-filtro"
  | "po"
  | "frs"
  | "misto"
  | "wizard"
  | "pos-vinculacao";

export type VinculoDocumentoCenario = {
  id: string;
  grupo: VinculoDocumentoCenarioGrupo;
  titulo: string;
  precondicoes: string[];
  passos: string[];
  resultadoEsperado: string[];
  /** IDs de mock a selecionar na tabela (`vinculo-po-*` ou `vinculo-frs-*`). */
  selecionarIds?: string[];
  /** Valores sugeridos para preenchimento na etapa 2 (FRS incomplete). */
  rastreabilidadeSugerida?: Record<
    string,
    { loteProduto: string; dataFabricacao: string; dataVencimento: string }
  >;
};

/** Referência rápida dos mocks disponíveis. */
export const VINCULO_MOCK_REFERENCIA = {
  po: MOCK_VINCULO_PO.map((item) => ({
    id: item.id,
    label: `PO ${item.docCompra}`,
    tipo: "PO" as const,
  })),
  frs: MOCK_VINCULO_FRS.map((item) => ({
    id: item.id,
    label: `FRS ${item.numeroFrs}`,
    tipo: "FRS" as const,
    rastreabilidadeMode: item.rastreabilidadeMode ?? "sem-rastreabilidade",
  })),
};

export const VINCULO_DOCUMENTO_CENARIOS: VinculoDocumentoCenario[] = [
  // ── Busca e filtro ──────────────────────────────────────────────────────
  {
    id: "busca-01",
    grupo: "busca-filtro",
    titulo: "Nenhum documento selecionado",
    precondicoes: ["Modal aberto na aba Detalhes → Vincular Documento"],
    passos: ["Abrir o modal sem marcar checkboxes"],
    resultadoEsperado: [
      "CTA principal desabilitado (Avançar ou Adicionar)",
      "Tabela exibe PO e FRS sem colunas de rastreabilidade",
      "Sem scroll horizontal",
    ],
  },
  {
    id: "busca-02",
    grupo: "busca-filtro",
    titulo: "Busca sem resultados",
    precondicoes: ["Modal aberto"],
    passos: ['Digitar "zzzzzzzzz" no campo de busca', "Aguardar debounce (~250ms)"],
    resultadoEsperado: ['Mensagem "Nenhum documento encontrado para a busca informada."'],
  },
  {
    id: "busca-03",
    grupo: "busca-filtro",
    titulo: "Filtro por tipo PO",
    precondicoes: ["Modal aberto"],
    passos: ['Selecionar critério "PO"', "Confirmar que a tabela lista apenas POs"],
    resultadoEsperado: ["3 linhas PO visíveis", "Nenhuma FRS na listagem"],
  },
  {
    id: "busca-04",
    grupo: "busca-filtro",
    titulo: "Filtro por tipo FRS",
    precondicoes: ["Modal aberto"],
    passos: ['Selecionar critério "FRS"', "Confirmar que a tabela lista apenas FRS"],
    resultadoEsperado: ["4 linhas FRS visíveis", "Nenhuma PO na listagem"],
  },
  {
    id: "busca-05",
    grupo: "busca-filtro",
    titulo: "Busca por número FRS",
    precondicoes: ["Modal aberto"],
    passos: ['Selecionar critério "Nº do Documento"', 'Buscar "10004562"'],
    resultadoEsperado: ["Apenas FRS 10004562 (vinculo-frs-1) exibida"],
  },
  {
    id: "busca-06",
    grupo: "busca-filtro",
    titulo: "Busca por descrição",
    precondicoes: ["Modal aberto"],
    passos: ['Selecionar critério "Descrição"', 'Buscar "assistencia"'],
    resultadoEsperado: ["PO 4500012458 exibida (texto contém assistência médica)"],
  },
  {
    id: "busca-07",
    grupo: "busca-filtro",
    titulo: "Busca por material (PO)",
    precondicoes: ["Modal aberto"],
    passos: ['Selecionar critério "Material"', 'Buscar "MAT-000378"'],
    resultadoEsperado: ["PO 4500012459 exibida"],
  },
  {
    id: "busca-08",
    grupo: "busca-filtro",
    titulo: "Busca por código (FRS)",
    precondicoes: ["Modal aberto"],
    passos: ['Selecionar critério "Código"', 'Buscar "140204"'],
    resultadoEsperado: ["FRS 10004565 exibida (sem rastreabilidade)"],
  },

  // ── PO ──────────────────────────────────────────────────────────────────
  {
    id: "po-01",
    grupo: "po",
    titulo: "Vincular uma PO",
    precondicoes: ["Modal aberto"],
    passos: ["Selecionar vinculo-po-1", 'Clicar "Adicionar"'],
    selecionarIds: ["vinculo-po-1"],
    resultadoEsperado: [
      "Fluxo em etapa única (sem wizard)",
      'CTA "Adicionar" habilitado após seleção',
      'Toast "PO vinculada com sucesso."',
      "Tag PO 4500012458 na coluna Ação",
    ],
  },
  {
    id: "po-02",
    grupo: "po",
    titulo: "Vincular múltiplas POs",
    precondicoes: ["Modal aberto"],
    passos: ["Selecionar vinculo-po-1, vinculo-po-2 e vinculo-po-3", 'Clicar "Adicionar"'],
    selecionarIds: ["vinculo-po-1", "vinculo-po-2", "vinculo-po-3"],
    resultadoEsperado: [
      "Fluxo em etapa única",
      'Toast "3 documentos vinculados com sucesso."',
      "3 tags PO na coluna Ação",
    ],
  },

  // ── FRS ─────────────────────────────────────────────────────────────────
  {
    id: "frs-01",
    grupo: "frs",
    titulo: "FRS sem rastreabilidade — vínculo direto",
    precondicoes: ["Modal aberto"],
    passos: ["Selecionar vinculo-frs-4 (10004565)", 'Clicar "Adicionar"'],
    selecionarIds: ["vinculo-frs-4"],
    resultadoEsperado: [
      "Fluxo em etapa única (sem wizard)",
      'CTA "Adicionar" (não "Avançar")',
      'Toast "FRS vinculada com sucesso."',
      "Tag FRS 10004565 na coluna Ação",
      "NCM exibe Não aplicável após vincular FRS",
    ],
  },
  {
    id: "frs-02",
    grupo: "frs",
    titulo: "FRS com rastreabilidade completa — vínculo direto",
    precondicoes: ["Modal aberto"],
    passos: ["Selecionar vinculo-frs-2 (10004563)", 'Clicar "Adicionar"'],
    selecionarIds: ["vinculo-frs-2"],
    resultadoEsperado: [
      "Fluxo em etapa única",
      "Dados de lote/fabricação/vencimento já existentes no mock",
      'Toast "FRS vinculada com sucesso."',
    ],
  },
  {
    id: "frs-03",
    grupo: "frs",
    titulo: "Uma FRS incomplete — wizard completo",
    precondicoes: ["Modal aberto"],
    passos: [
      "Selecionar vinculo-frs-1 (10004562)",
      'Clicar "Avançar"',
      "Preencher Lote, Data de Fabricação e Data de Vencimento",
      'Clicar "Adicionar"',
    ],
    selecionarIds: ["vinculo-frs-1"],
    rastreabilidadeSugerida: {
      "vinculo-frs-1": {
        loteProduto: "LOT12345",
        dataFabricacao: "01/06/2026",
        dataVencimento: "01/06/2028",
      },
    },
    resultadoEsperado: [
      'Etapa 1: CTA "Avançar" habilitado',
      "Etapa 2: 1 card FRS com 3 campos editáveis",
      "Foco automático no campo Lote",
      'Toast "FRS vinculada com sucesso."',
    ],
  },
  {
    id: "frs-04",
    grupo: "frs",
    titulo: "Múltiplas FRS incomplete — wizard com 2 cards editáveis",
    precondicoes: ["Modal aberto"],
    passos: [
      "Selecionar vinculo-frs-1 e vinculo-frs-3",
      'Clicar "Avançar"',
      "Preencher campos de ambos os documentos",
      'Clicar "Adicionar"',
    ],
    selecionarIds: ["vinculo-frs-1", "vinculo-frs-3"],
    rastreabilidadeSugerida: {
      "vinculo-frs-1": {
        loteProduto: "LOT-A001",
        dataFabricacao: "05/06/2026",
        dataVencimento: "05/06/2028",
      },
      "vinculo-frs-3": {
        loteProduto: "LOT-B002",
        dataFabricacao: "10/06/2026",
        dataVencimento: "10/06/2028",
      },
    },
    resultadoEsperado: [
      "Etapa 2: 2 cards FRS, ambos com campos editáveis",
      "TAB percorre Lote → Fabricação → Vencimento do 1º doc, depois do 2º",
      'Toast "2 documentos vinculados com sucesso."',
    ],
  },
  {
    id: "frs-05",
    grupo: "frs",
    titulo: "Todas as FRS selecionadas — mix complete + incomplete",
    precondicoes: ["Modal aberto"],
    passos: [
      "Selecionar vinculo-frs-1, vinculo-frs-2, vinculo-frs-3 e vinculo-frs-4",
      'Clicar "Avançar"',
      "Preencher apenas os campos das FRS incomplete (frs-1 e frs-3)",
      'Clicar "Adicionar"',
    ],
    selecionarIds: ["vinculo-frs-1", "vinculo-frs-2", "vinculo-frs-3", "vinculo-frs-4"],
    rastreabilidadeSugerida: {
      "vinculo-frs-1": {
        loteProduto: "LOT-C003",
        dataFabricacao: "15/06/2026",
        dataVencimento: "15/06/2028",
      },
      "vinculo-frs-3": {
        loteProduto: "LOT-D004",
        dataFabricacao: "20/06/2026",
        dataVencimento: "20/06/2028",
      },
    },
    resultadoEsperado: [
      "Etapa 2: 4 cards FRS visíveis",
      "frs-2 (complete): campos somente leitura com LOT99887, 10/05/2026, 10/05/2028",
      "frs-4 (sem rastreabilidade): card sem seção de lote/fabricação/vencimento",
      "frs-1 e frs-3: campos editáveis",
      'Toast "4 documentos vinculados com sucesso."',
    ],
  },

  // ── Seleção mista PO + FRS ──────────────────────────────────────────────
  {
    id: "misto-01",
    grupo: "misto",
    titulo: "PO + FRS incomplete — wizard, PO vinculada no confirm",
    precondicoes: ["Modal aberto"],
    passos: [
      "Selecionar vinculo-po-1 e vinculo-frs-1",
      'Clicar "Avançar"',
      "Preencher rastreabilidade da FRS",
      'Clicar "Adicionar"',
    ],
    selecionarIds: ["vinculo-po-1", "vinculo-frs-1"],
    rastreabilidadeSugerida: {
      "vinculo-frs-1": {
        loteProduto: "LOT-MIX1",
        dataFabricacao: "01/07/2026",
        dataVencimento: "01/07/2028",
      },
    },
    resultadoEsperado: [
      "Etapa 2: apenas 1 card FRS (PO não aparece)",
      "Ao confirmar: 2 tags na coluna Ação (PO + FRS)",
      'Toast "2 documentos vinculados com sucesso."',
    ],
  },
  {
    id: "misto-02",
    grupo: "misto",
    titulo: "PO + FRS complete — vínculo direto",
    precondicoes: ["Modal aberto"],
    passos: ["Selecionar vinculo-po-2 e vinculo-frs-2", 'Clicar "Adicionar"'],
    selecionarIds: ["vinculo-po-2", "vinculo-frs-2"],
    resultadoEsperado: [
      "Fluxo em etapa única (nenhuma FRS incomplete)",
      'CTA "Adicionar" habilitado',
      "2 tags na coluna Ação após confirmar",
    ],
  },
  {
    id: "misto-03",
    grupo: "misto",
    titulo: "PO + múltiplas FRS (complete + incomplete)",
    precondicoes: ["Modal aberto"],
    passos: [
      "Selecionar vinculo-po-3, vinculo-frs-2 e vinculo-frs-3",
      'Clicar "Avançar"',
      "Preencher rastreabilidade da frs-3",
      'Clicar "Adicionar"',
    ],
    selecionarIds: ["vinculo-po-3", "vinculo-frs-2", "vinculo-frs-3"],
    rastreabilidadeSugerida: {
      "vinculo-frs-3": {
        loteProduto: "LOT-MIX3",
        dataFabricacao: "10/07/2026",
        dataVencimento: "10/07/2028",
      },
    },
    resultadoEsperado: [
      "Etapa 2: 2 cards FRS (frs-2 read-only, frs-3 editável)",
      "3 documentos vinculados ao confirmar (1 PO + 2 FRS)",
    ],
  },

  // ── Wizard — estados e persistência ───────────────────────────────────
  {
    id: "wizard-01",
    grupo: "wizard",
    titulo: "Validação — campos obrigatórios vazios na etapa 2",
    precondicoes: ["Modal aberto", "FRS incomplete selecionada"],
    passos: [
      "Selecionar vinculo-frs-1",
      'Clicar "Avançar"',
      "Não preencher nenhum campo",
      "Tentar clicar Adicionar",
    ],
    selecionarIds: ["vinculo-frs-1"],
    resultadoEsperado: [
      'Botão "Adicionar" desabilitado',
      "Campos vazios com borda laranja (alerta visual)",
    ],
  },
  {
    id: "wizard-02",
    grupo: "wizard",
    titulo: "Validação — preenchimento parcial",
    precondicoes: ["Etapa 2 aberta"],
    passos: [
      "Selecionar vinculo-frs-1 → Avançar",
      "Preencher apenas Lote",
      "Verificar estado do CTA",
    ],
    selecionarIds: ["vinculo-frs-1"],
    rastreabilidadeSugerida: {
      "vinculo-frs-1": {
        loteProduto: "LOT-PARCIAL",
        dataFabricacao: "",
        dataVencimento: "",
      },
    },
    resultadoEsperado: [
      '"Adicionar" permanece desabilitado',
      "Datas vazias com borda laranja",
    ],
  },
  {
    id: "wizard-03",
    grupo: "wizard",
    titulo: "Voltar preserva seleção e dados preenchidos",
    precondicoes: ["Modal aberto"],
    passos: [
      "Selecionar vinculo-frs-1 e vinculo-frs-3",
      'Avançar → preencher parcialmente frs-1',
      'Clicar "Voltar"',
      'Clicar "Avançar" novamente',
    ],
    selecionarIds: ["vinculo-frs-1", "vinculo-frs-3"],
    rastreabilidadeSugerida: {
      "vinculo-frs-1": {
        loteProduto: "LOT-PRESERV",
        dataFabricacao: "01/08/2026",
        dataVencimento: "",
      },
    },
    resultadoEsperado: [
      "Etapa 1: ambas FRS ainda selecionadas",
      "Etapa 2: Lote e Fabricação da frs-1 preservados",
      "Vencimento ainda vazio",
    ],
  },
  {
    id: "wizard-04",
    grupo: "wizard",
    titulo: "Desmarcar na etapa 1 descarta draft",
    precondicoes: ["Dados preenchidos na etapa 2", "Usuário voltou para etapa 1"],
    passos: [
      "Selecionar frs-1 e frs-3 → Avançar → preencher frs-3",
      "Voltar → desmarcar frs-3",
      "Avançar novamente",
    ],
    selecionarIds: ["vinculo-frs-1", "vinculo-frs-3"],
    resultadoEsperado: [
      "Etapa 2 exibe apenas frs-1",
      "Draft da frs-3 descartado (campos vazios se remarcada depois)",
    ],
  },
  {
    id: "wizard-05",
    grupo: "wizard",
    titulo: "Fechar modal reseta estado",
    precondicoes: ["Seleção e/ou dados preenchidos"],
    passos: [
      "Selecionar documentos e avançar para etapa 2",
      "Fechar modal (X ou Cancelar)",
      "Reabrir modal",
    ],
    resultadoEsperado: [
      "Nenhuma seleção marcada",
      "Busca e filtros resetados",
      "Etapa 1 exibida",
    ],
  },
  {
    id: "wizard-06",
    grupo: "wizard",
    titulo: "Navegação por teclado (TAB)",
    precondicoes: ["Etapa 2 com 2 FRS incomplete"],
    passos: [
      "Selecionar frs-1 e frs-3 → Avançar",
      "Usar TAB repetidamente sem mouse",
    ],
    selecionarIds: ["vinculo-frs-1", "vinculo-frs-3"],
    resultadoEsperado: [
      "Ordem: Lote frs-1 → Fabricação frs-1 → Vencimento frs-1 → Lote frs-3 → ...",
      "Foco inicial no Lote da frs-1 ao entrar na etapa 2",
    ],
  },
  {
    id: "wizard-07",
    grupo: "wizard",
    titulo: "Loading ao confirmar vínculo",
    precondicoes: ["Etapa 2 com campos válidos"],
    passos: ['Clicar "Adicionar"'],
    selecionarIds: ["vinculo-frs-1"],
    rastreabilidadeSugerida: {
      "vinculo-frs-1": {
        loteProduto: "LOT-LOAD",
        dataFabricacao: "01/09/2026",
        dataVencimento: "01/09/2028",
      },
    },
    resultadoEsperado: [
      'Botão exibe "Adicionando..." com spinner (~700ms)',
      "Modal fecha após sucesso",
    ],
  },

  // ── Pós-vinculação (tela de detalhes) ───────────────────────────────────
  {
    id: "pos-01",
    grupo: "pos-vinculacao",
    titulo: "Tags na coluna Ação após vincular",
    precondicoes: ["Ao menos 1 documento vinculado"],
    passos: ["Vincular qualquer documento", "Observar coluna Ação da tabela de itens"],
    resultadoEsperado: [
      "Botão Vincular Documento substituído por tags PO/FRS",
      "Cada tag exibe tipo e número do documento",
    ],
  },
  {
    id: "pos-02",
    grupo: "pos-vinculacao",
    titulo: "Editar vínculos existentes",
    precondicoes: ["Documentos já vinculados"],
    passos: ["Clicar ícone de lápis na última coluna", "Modal reabre para nova seleção"],
    resultadoEsperado: ["Modal abre na etapa 1 com busca e tabela"],
  },
  {
    id: "pos-03",
    grupo: "pos-vinculacao",
    titulo: "Remover todos os vínculos",
    precondicoes: ["Documentos vinculados"],
    passos: ["Clicar ícone de lixeira", "Confirmar remoção"],
    resultadoEsperado: [
      'Toast "Vínculos removidos com sucesso."',
      "Botão Vincular Documento volta a aparecer",
      "NCM volta a exibir - (sem FRS vinculada)",
    ],
  },
  {
    id: "pos-04",
    grupo: "pos-vinculacao",
    titulo: "Efeito colateral — NCM após vincular FRS",
    precondicoes: ["Nenhuma FRS vinculada"],
    passos: ["Vincular vinculo-frs-4", "Observar coluna NCM do item"],
    selecionarIds: ["vinculo-frs-4"],
    resultadoEsperado: ['NCM exibe "Não aplicável"'],
  },
];

export const VINCULO_CENARIOS_POR_GRUPO = VINCULO_DOCUMENTO_CENARIOS.reduce<
  Record<VinculoDocumentoCenarioGrupo, VinculoDocumentoCenario[]>
>(
  (acc, cenario) => {
    acc[cenario.grupo] = [...(acc[cenario.grupo] ?? []), cenario];
    return acc;
  },
  {
    "busca-filtro": [],
    po: [],
    frs: [],
    misto: [],
    wizard: [],
    "pos-vinculacao": [],
  },
);

export function getVinculoCenarioById(id: string): VinculoDocumentoCenario | undefined {
  return VINCULO_DOCUMENTO_CENARIOS.find((cenario) => cenario.id === id);
}
