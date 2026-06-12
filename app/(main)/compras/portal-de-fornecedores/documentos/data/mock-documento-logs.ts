import { DOCUMENTO_LOG_EVENT_TYPES, type DocumentoLog } from "../types";

const SYSTEM_RESPONSIBLE = {
  name: "Sistema",
  email: "sistema@portal.qive.com.br",
} as const;

const MOCK_LOGS_BY_DOCUMENTO: Record<number, DocumentoLog[]> = {
  1: [
    {
      id: "log-1-1",
      documentoId: 1,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.DOCUMENTO_RECEBIDO,
      description: "Documento recebido no portal",
      responsibleName: SYSTEM_RESPONSIBLE.name,
      responsibleEmail: SYSTEM_RESPONSIBLE.email,
      createdAt: "2023-12-14T10:15:00",
    },
    {
      id: "log-1-2",
      documentoId: 1,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.STATUS_ALTERADO,
      description: 'Status alterado para "Em aprovação"',
      responsibleName: "Ana Costa",
      responsibleEmail: "ana.costa@empresa.com",
      createdAt: "2023-12-14T11:30:00",
    },
  ],
  2: [
    {
      id: "log-2-1",
      documentoId: 2,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.DOCUMENTO_RECEBIDO,
      description: "Documento recebido no portal",
      responsibleName: SYSTEM_RESPONSIBLE.name,
      responsibleEmail: SYSTEM_RESPONSIBLE.email,
      createdAt: "2026-05-10T09:00:00",
    },
    {
      id: "log-2-2",
      documentoId: 2,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.COMENTARIO_ENVIADO,
      description: "Comentário enviado pelo fornecedor",
      responsibleName: "Fornecedor",
      responsibleEmail: "contato@fornecedor.com.br",
      createdAt: "2026-05-16T14:20:00",
    },
    {
      id: "log-2-3",
      documentoId: 2,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.ANEXO_ENVIADO,
      description: "Anexo nota-fiscal.pdf enviado",
      responsibleName: "Fornecedor",
      responsibleEmail: "contato@fornecedor.com.br",
      createdAt: "2026-05-16T14:21:00",
    },
    {
      id: "log-2-4",
      documentoId: 2,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.DOCUMENTO_APROVADO,
      description: "Documento aprovado",
      responsibleName: "João Silva",
      responsibleEmail: "joao.silva@empresa.com",
      createdAt: "2026-05-17T10:45:00",
    },
    {
      id: "log-2-5",
      documentoId: 2,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.COMPROVANTE_REGISTRADO,
      description: "Comprovante de pagamento registrado",
      responsibleName: SYSTEM_RESPONSIBLE.name,
      responsibleEmail: SYSTEM_RESPONSIBLE.email,
      createdAt: "2026-05-18T16:00:00",
    },
  ],
  3: [
    {
      id: "log-3-1",
      documentoId: 3,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.DOCUMENTO_RECEBIDO,
      description: "Documento recebido no portal",
      responsibleName: SYSTEM_RESPONSIBLE.name,
      responsibleEmail: SYSTEM_RESPONSIBLE.email,
      createdAt: "2026-05-08T08:30:00",
    },
    {
      id: "log-3-2",
      documentoId: 3,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.DOCUMENTO_APROVADO,
      description: "Documento aprovado",
      responsibleName: "Maria Oliveira",
      responsibleEmail: "maria.oliveira@empresa.com",
      createdAt: "2026-05-09T15:20:00",
    },
    {
      id: "log-3-3",
      documentoId: 3,
      eventType: DOCUMENTO_LOG_EVENT_TYPES.ENVIADO_ERP,
      description: "Documento enviado ao ERP",
      responsibleName: SYSTEM_RESPONSIBLE.name,
      responsibleEmail: SYSTEM_RESPONSIBLE.email,
      createdAt: "2026-05-09T15:25:00",
    },
  ],
};

const DEFAULT_LOGS: DocumentoLog[] = [
  {
    id: "log-default-1",
    documentoId: 0,
    eventType: DOCUMENTO_LOG_EVENT_TYPES.DOCUMENTO_RECEBIDO,
    description: "Documento recebido no portal",
    responsibleName: SYSTEM_RESPONSIBLE.name,
    responsibleEmail: SYSTEM_RESPONSIBLE.email,
    createdAt: "2026-05-01T09:00:00",
  },
];

export function getMockDocumentoLogs(documentoId: number): DocumentoLog[] {
  const logs = MOCK_LOGS_BY_DOCUMENTO[documentoId];
  if (logs) {
    return [...logs].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  return DEFAULT_LOGS.map((log) => ({
    ...log,
    id: `log-default-${documentoId}`,
    documentoId,
  }));
}
