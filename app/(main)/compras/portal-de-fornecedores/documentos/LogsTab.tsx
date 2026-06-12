"use client";

import * as React from "react";
import {
  BadgeCheck,
  FileText,
  Link2,
  MessageSquareText,
  Paperclip,
  RefreshCw,
  Send,
  type LucideIcon,
} from "lucide-react";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import { cn } from "@/lib/utils";
import { formatActivityDateTime } from "../historico-de-atividades/lib/activity-filters";
import {
  DOCUMENTO_LOG_EVENT_TYPES,
  type DocumentoLog,
  type DocumentoLogEventType,
  type PortalDocumentoRow,
} from "./types";
import { fetchDocumentoLogs } from "./lib/documento-logs-service";

const LOG_EVENT_TYPE_ICONS: Record<DocumentoLogEventType, LucideIcon> = {
  [DOCUMENTO_LOG_EVENT_TYPES.DOCUMENTO_RECEBIDO]: FileText,
  [DOCUMENTO_LOG_EVENT_TYPES.STATUS_ALTERADO]: RefreshCw,
  [DOCUMENTO_LOG_EVENT_TYPES.DOCUMENTO_APROVADO]: BadgeCheck,
  [DOCUMENTO_LOG_EVENT_TYPES.PO_VINCULADA]: Link2,
  [DOCUMENTO_LOG_EVENT_TYPES.FRS_VINCULADA]: Link2,
  [DOCUMENTO_LOG_EVENT_TYPES.COMPROVANTE_REGISTRADO]: FileText,
  [DOCUMENTO_LOG_EVENT_TYPES.COMENTARIO_ENVIADO]: MessageSquareText,
  [DOCUMENTO_LOG_EVENT_TYPES.ANEXO_ENVIADO]: Paperclip,
  [DOCUMENTO_LOG_EVENT_TYPES.ENVIADO_ERP]: Send,
};

function LogsLoadingSkeleton() {
  return (
    <div className="px-6 py-5" aria-busy="true" aria-label="Carregando logs">
      <table className="min-w-[800px] w-full text-sm">
        <thead>
          <tr className={TABLE_HEAD_ROW_CLASS}>
            <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Data e hora</th>
            <th className={TABLE_HEAD_CELL_CLASS}>Atividade</th>
            <th className={TABLE_HEAD_CELL_CLASS}>Responsável</th>
            <th className={TABLE_HEAD_CELL_CLASS}>E-mail</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, index) => (
            <tr key={index} className={TABLE_BODY_ROW_CLASS} aria-hidden>
              <td className={TABLE_BODY_CELL_CLASS}>
                <div className="h-4 w-28 animate-pulse rounded bg-[#E5E7EB]" />
              </td>
              <td className={TABLE_BODY_CELL_CLASS}>
                <div className="h-4 w-full max-w-[320px] animate-pulse rounded bg-[#E5E7EB]" />
              </td>
              <td className={TABLE_BODY_CELL_CLASS}>
                <div className="h-4 w-32 animate-pulse rounded bg-[#E5E7EB]" />
              </td>
              <td className={TABLE_BODY_CELL_CLASS}>
                <div className="h-4 w-44 animate-pulse rounded bg-[#E5E7EB]" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogsEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md space-y-2">
        <h3 className="text-base font-semibold text-[#0d0f1c]">Nenhum log registrado</h3>
        <p className="text-sm leading-[1.4] text-[#5B616F]">
          As ações realizadas neste documento serão exibidas aqui para facilitar auditoria e
          rastreabilidade.
        </p>
      </div>
    </div>
  );
}

type LogsTabProps = {
  documento: PortalDocumentoRow;
};

export function LogsTab({ documento }: LogsTabProps) {
  const [logs, setLogs] = React.useState<DocumentoLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    fetchDocumentoLogs(documento.id)
      .then((result) => {
        if (!cancelled) {
          setLogs(result);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [documento.id]);

  if (isLoading) {
    return <LogsLoadingSkeleton />;
  }

  if (logs.length === 0) {
    return <LogsEmptyState />;
  }

  return (
    <div className="overflow-y-auto px-6 py-5">
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead>
            <tr className={TABLE_HEAD_ROW_CLASS}>
              <th className={cn(TABLE_HEAD_CELL_CLASS, "whitespace-nowrap")}>Data e hora</th>
              <th className={TABLE_HEAD_CELL_CLASS}>Atividade</th>
              <th className={TABLE_HEAD_CELL_CLASS}>Responsável</th>
              <th className={TABLE_HEAD_CELL_CLASS}>E-mail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const Icon = LOG_EVENT_TYPE_ICONS[log.eventType] ?? FileText;

              return (
                <tr key={log.id} className={TABLE_BODY_ROW_CLASS}>
                  <td
                    className={cn(
                      TABLE_BODY_CELL_CLASS,
                      "whitespace-nowrap",
                      TABLE_SECONDARY_TEXT_CLASS,
                    )}
                  >
                    {formatActivityDateTime(log.createdAt)}
                  </td>
                  <td className={TABLE_BODY_CELL_CLASS}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F5FF]">
                        <Icon className="h-4 w-4 text-[#0C3CF7]" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className={cn("font-semibold", TABLE_PRIMARY_TEXT_CLASS)}>
                          {log.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    className={cn(
                      TABLE_BODY_CELL_CLASS,
                      "whitespace-nowrap",
                      TABLE_PRIMARY_TEXT_CLASS,
                    )}
                  >
                    {log.responsibleName}
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "max-w-[240px]")}>
                    <span
                      className={cn(
                        "block truncate whitespace-nowrap",
                        TABLE_PRIMARY_TEXT_CLASS,
                      )}
                      title={log.responsibleEmail}
                    >
                      {log.responsibleEmail}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
