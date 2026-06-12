import {
  ACTIVITY_EVENT_TYPES,
  type ActivityEvent,
  type ActivityEventType,
} from "../types";

type Responsible = {
  name: string;
  email: string;
};

function createEventId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildEvent(
  eventType: ActivityEventType,
  params: Omit<ActivityEvent, "id" | "eventType"> & { id?: string },
): ActivityEvent {
  return {
    id: params.id ?? createEventId(),
    eventType,
    description: params.description,
    responsibleName: params.responsibleName,
    responsibleEmail: params.responsibleEmail,
    targetName: params.targetName,
    targetReference: params.targetReference,
    targetType: params.targetType,
    createdAt: params.createdAt,
    metadata: params.metadata,
  };
}

export function buildConviteEnviadoEvent(params: {
  responsible: Responsible;
  recipientName: string;
  createdAt: string;
}): ActivityEvent {
  return buildEvent(ACTIVITY_EVENT_TYPES.CONVITE_ENVIADO, {
    description: `Convite enviado para ${params.recipientName}`,
    responsibleName: params.responsible.name,
    responsibleEmail: params.responsible.email,
    targetName: params.recipientName,
    targetType: "usuario",
    createdAt: params.createdAt,
    metadata: { recipientName: params.recipientName },
  });
}

export function buildUsuarioRegistradoEvent(params: {
  responsible: Responsible;
  registeredUserName: string;
  createdAt: string;
}): ActivityEvent {
  return buildEvent(ACTIVITY_EVENT_TYPES.USUARIO_REGISTRADO, {
    description: `Usuário ${params.registeredUserName} registrado no portal`,
    responsibleName: params.responsible.name,
    responsibleEmail: params.responsible.email,
    targetName: params.registeredUserName,
    targetType: "usuario",
    createdAt: params.createdAt,
    metadata: { registeredUserName: params.registeredUserName },
  });
}

export function buildPoVinculadaEvent(params: {
  responsible: Responsible;
  documentNumber: string;
  createdAt: string;
}): ActivityEvent {
  return buildEvent(ACTIVITY_EVENT_TYPES.PO_VINCULADA, {
    description: `PO ${params.documentNumber} vinculada ao documento`,
    responsibleName: params.responsible.name,
    responsibleEmail: params.responsible.email,
    targetReference: params.documentNumber,
    targetType: "documento",
    createdAt: params.createdAt,
    metadata: { documentType: "PO", documentNumber: params.documentNumber },
  });
}

export function buildFrsVinculadaEvent(params: {
  responsible: Responsible;
  documentNumber: string;
  createdAt: string;
}): ActivityEvent {
  return buildEvent(ACTIVITY_EVENT_TYPES.FRS_VINCULADA, {
    description: `FRS ${params.documentNumber} vinculada ao documento`,
    responsibleName: params.responsible.name,
    responsibleEmail: params.responsible.email,
    targetReference: params.documentNumber,
    targetType: "documento",
    createdAt: params.createdAt,
    metadata: { documentType: "FRS", documentNumber: params.documentNumber },
  });
}

export function buildRegraAprovacaoRegistradaEvent(params: {
  responsible: Responsible;
  ruleName: string;
  createdAt: string;
}): ActivityEvent {
  return buildEvent(ACTIVITY_EVENT_TYPES.REGRA_APROVACAO_REGISTRADA, {
    description: `Regra de aprovação criada para ${params.ruleName}`,
    responsibleName: params.responsible.name,
    responsibleEmail: params.responsible.email,
    targetName: params.ruleName,
    targetType: "regra-aprovacao",
    createdAt: params.createdAt,
    metadata: { ruleName: params.ruleName },
  });
}

export function buildNotaAprovadaEvent(params: {
  responsible: Responsible;
  noteNumber: string;
  createdAt: string;
}): ActivityEvent {
  return buildEvent(ACTIVITY_EVENT_TYPES.NOTA_APROVADA, {
    description: `Nota ${params.noteNumber} aprovada`,
    responsibleName: params.responsible.name,
    responsibleEmail: params.responsible.email,
    targetReference: params.noteNumber,
    targetType: "nota",
    createdAt: params.createdAt,
    metadata: { noteNumber: params.noteNumber },
  });
}

export function buildDadosCadastraisAlteradosEvent(params: {
  responsible: Responsible;
  supplierName: string;
  createdAt: string;
}): ActivityEvent {
  return buildEvent(ACTIVITY_EVENT_TYPES.DADOS_CADASTRAIS_ALTERADOS, {
    description: "Dados cadastrais do fornecedor atualizados",
    responsibleName: params.responsible.name,
    responsibleEmail: params.responsible.email,
    targetName: params.supplierName,
    targetType: "fornecedor",
    createdAt: params.createdAt,
    metadata: { supplierName: params.supplierName },
  });
}

export function buildDadosBancariosAlteradosEvent(params: {
  responsible: Responsible;
  supplierName: string;
  createdAt: string;
}): ActivityEvent {
  return buildEvent(ACTIVITY_EVENT_TYPES.DADOS_BANCARIOS_ALTERADOS, {
    description: "Dados bancários do fornecedor atualizados",
    responsibleName: params.responsible.name,
    responsibleEmail: params.responsible.email,
    targetName: params.supplierName,
    targetType: "fornecedor",
    createdAt: params.createdAt,
    metadata: { supplierName: params.supplierName },
  });
}

export function buildConfigLiberacaoAlteradaEvent(params: {
  responsible: Responsible;
  newState: string;
  createdAt: string;
}): ActivityEvent {
  return buildEvent(ACTIVITY_EVENT_TYPES.CONFIG_LIBERACAO_ALTERADA, {
    description: `Configuração de liberação de documentos alterada para ${params.newState}`,
    responsibleName: params.responsible.name,
    responsibleEmail: params.responsible.email,
    targetName: "Configuração de liberação",
    targetType: "configuracao",
    createdAt: params.createdAt,
    metadata: { newState: params.newState },
  });
}
