import {
  buildConfigLiberacaoAlteradaEvent,
  buildConviteEnviadoEvent,
  buildDadosBancariosAlteradosEvent,
  buildDadosCadastraisAlteradosEvent,
  buildFrsVinculadaEvent,
  buildNotaAprovadaEvent,
  buildPoVinculadaEvent,
  buildRegraAprovacaoRegistradaEvent,
  buildUsuarioRegistradoEvent,
} from "../lib/activity-event-builders";
import type { ActivityEvent } from "../types";

export const MOCK_ACTIVITY_EVENTS: ActivityEvent[] = [
  buildConfigLiberacaoAlteradaEvent({
    responsible: { name: "Mariana Alves", email: "mariana.alves@empresa.com" },
    newState: "ativa",
    createdAt: "2026-05-29T09:30:00",
  }),
  buildDadosBancariosAlteradosEvent({
    responsible: { name: "Pedro Lima", email: "pedro.lima@empresa.com" },
    supplierName: "Fornecedor ABC Ltda.",
    createdAt: "2026-05-29T08:42:00",
  }),
  buildDadosCadastraisAlteradosEvent({
    responsible: { name: "Pedro Lima", email: "pedro.lima@empresa.com" },
    supplierName: "Fornecedor ABC Ltda.",
    createdAt: "2026-05-29T08:15:00",
  }),
  buildNotaAprovadaEvent({
    responsible: { name: "Ana Costa", email: "ana.costa@empresa.com" },
    noteNumber: "042201",
    createdAt: "2026-05-28T13:45:00",
  }),
  buildRegraAprovacaoRegistradaEvent({
    responsible: { name: "Ana Costa", email: "ana.costa@empresa.com" },
    ruleName: "notas acima de R$ 10.000,00",
    createdAt: "2026-05-28T11:20:00",
  }),
  buildFrsVinculadaEvent({
    responsible: { name: "Carlos Souza", email: "carlos.souza@empresa.com" },
    documentNumber: "10004562",
    createdAt: "2026-05-28T10:05:00",
  }),
  buildPoVinculadaEvent({
    responsible: { name: "Carlos Souza", email: "carlos.souza@empresa.com" },
    documentNumber: "45001289",
    createdAt: "2026-05-28T09:44:00",
  }),
  buildUsuarioRegistradoEvent({
    responsible: { name: "Maria Oliveira", email: "maria.oliveira@empresa.com" },
    registeredUserName: "João Silva",
    createdAt: "2026-05-27T15:10:00",
  }),
  buildConviteEnviadoEvent({
    responsible: { name: "Maria Oliveira", email: "maria.oliveira@empresa.com" },
    recipientName: "João Silva",
    createdAt: "2026-05-27T14:32:00",
  }),
].map((event, index) => ({ ...event, id: `mock-activity-${index + 1}` }));
