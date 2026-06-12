export const ACTIVITY_EVENT_TYPES = {
  CONVITE_ENVIADO: "convite-enviado",
  USUARIO_REGISTRADO: "usuario-registrado",
  PO_VINCULADA: "po-vinculada",
  FRS_VINCULADA: "frs-vinculada",
  REGRA_APROVACAO_REGISTRADA: "regra-aprovacao-registrada",
  NOTA_APROVADA: "nota-aprovada",
  DADOS_CADASTRAIS_ALTERADOS: "dados-cadastrais-alterados",
  DADOS_BANCARIOS_ALTERADOS: "dados-bancarios-alterados",
  CONFIG_LIBERACAO_ALTERADA: "config-liberacao-alterada",
} as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[keyof typeof ACTIVITY_EVENT_TYPES];

export type ActivityTargetType =
  | "usuario"
  | "documento"
  | "fornecedor"
  | "regra-aprovacao"
  | "nota"
  | "configuracao";

export type ActivityEvent = {
  id: string;
  eventType: ActivityEventType;
  description: string;
  responsibleName: string;
  responsibleEmail: string;
  targetName?: string;
  targetReference?: string;
  targetType?: ActivityTargetType;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type ActivityEventFilterValue =
  | "all"
  | ActivityEventType
  | "po-frs-vinculada";

export const ACTIVITY_EVENT_FILTER_OPTIONS: Array<{
  value: ActivityEventFilterValue;
  label: string;
}> = [
  { value: "all", label: "Todos os eventos" },
  { value: ACTIVITY_EVENT_TYPES.CONVITE_ENVIADO, label: "Convite enviado" },
  { value: ACTIVITY_EVENT_TYPES.USUARIO_REGISTRADO, label: "Usuário registrado" },
  { value: "po-frs-vinculada", label: "PO/FRS vinculada" },
  { value: ACTIVITY_EVENT_TYPES.REGRA_APROVACAO_REGISTRADA, label: "Regra de aprovação registrada" },
  { value: ACTIVITY_EVENT_TYPES.NOTA_APROVADA, label: "Nota aprovada" },
  { value: ACTIVITY_EVENT_TYPES.DADOS_CADASTRAIS_ALTERADOS, label: "Dados cadastrais alterados" },
  { value: ACTIVITY_EVENT_TYPES.DADOS_BANCARIOS_ALTERADOS, label: "Dados bancários alterados" },
  { value: ACTIVITY_EVENT_TYPES.CONFIG_LIBERACAO_ALTERADA, label: "Configuração de liberação alterada" },
];

export const ACTIVITY_EVENT_TYPE_LABELS: Record<ActivityEventType, string> = {
  [ACTIVITY_EVENT_TYPES.CONVITE_ENVIADO]: "Convite enviado",
  [ACTIVITY_EVENT_TYPES.USUARIO_REGISTRADO]: "Usuário registrado",
  [ACTIVITY_EVENT_TYPES.PO_VINCULADA]: "PO vinculada",
  [ACTIVITY_EVENT_TYPES.FRS_VINCULADA]: "FRS vinculada",
  [ACTIVITY_EVENT_TYPES.REGRA_APROVACAO_REGISTRADA]: "Regra de aprovação registrada",
  [ACTIVITY_EVENT_TYPES.NOTA_APROVADA]: "Nota aprovada",
  [ACTIVITY_EVENT_TYPES.DADOS_CADASTRAIS_ALTERADOS]: "Dados cadastrais alterados",
  [ACTIVITY_EVENT_TYPES.DADOS_BANCARIOS_ALTERADOS]: "Dados bancários alterados",
  [ACTIVITY_EVENT_TYPES.CONFIG_LIBERACAO_ALTERADA]: "Configuração de liberação alterada",
};

export const PO_FRS_EVENT_TYPES: ActivityEventType[] = [
  ACTIVITY_EVENT_TYPES.PO_VINCULADA,
  ACTIVITY_EVENT_TYPES.FRS_VINCULADA,
];
