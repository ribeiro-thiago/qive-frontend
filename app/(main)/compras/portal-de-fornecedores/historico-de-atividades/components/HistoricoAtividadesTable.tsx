"use client";

import * as React from "react";
import {
  BadgeCheck,
  Building2,
  FileText,
  Link2,
  Mail,
  Settings,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { ListingTablePagination } from "@/components/shared/ListingTablePagination";
import { useListingPagination } from "@/components/shared/ListingTablePagination/useListingPagination";
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from "@/components/shared/tableStyles";
import { cn } from "@/lib/utils";
import {
  ACTIVITY_EVENT_TYPES,
  type ActivityEvent,
  type ActivityEventType,
} from "../types";
import { formatActivityDateTime } from "../lib/activity-filters";
import { HistoricoAtividadesEmptyState } from "./HistoricoAtividadesEmptyState";

const EVENT_TYPE_ICONS: Record<ActivityEventType, LucideIcon> = {
  [ACTIVITY_EVENT_TYPES.CONVITE_ENVIADO]: Mail,
  [ACTIVITY_EVENT_TYPES.USUARIO_REGISTRADO]: UserPlus,
  [ACTIVITY_EVENT_TYPES.PO_VINCULADA]: Link2,
  [ACTIVITY_EVENT_TYPES.FRS_VINCULADA]: Link2,
  [ACTIVITY_EVENT_TYPES.REGRA_APROVACAO_REGISTRADA]: ShieldCheck,
  [ACTIVITY_EVENT_TYPES.NOTA_APROVADA]: BadgeCheck,
  [ACTIVITY_EVENT_TYPES.DADOS_CADASTRAIS_ALTERADOS]: Building2,
  [ACTIVITY_EVENT_TYPES.DADOS_BANCARIOS_ALTERADOS]: Building2,
  [ACTIVITY_EVENT_TYPES.CONFIG_LIBERACAO_ALTERADA]: Settings,
};

type HistoricoAtividadesTableProps = {
  events: ActivityEvent[];
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function HistoricoAtividadesTable({
  events,
  hasFilters,
  onClearFilters,
}: HistoricoAtividadesTableProps) {
  const pagination = useListingPagination(events, 25);
  const paginatedEvents = pagination.paginatedItems;

  if (events.length === 0) {
    return (
      <HistoricoAtividadesEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
    );
  }

  return (
    <>
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
            {paginatedEvents.map((event) => {
              const Icon = EVENT_TYPE_ICONS[event.eventType] ?? FileText;

              return (
                <tr key={event.id} className={TABLE_BODY_ROW_CLASS}>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "whitespace-nowrap", TABLE_SECONDARY_TEXT_CLASS)}>
                    {formatActivityDateTime(event.createdAt)}
                  </td>
                  <td className={TABLE_BODY_CELL_CLASS}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F5FF]">
                        <Icon className="h-4 w-4 text-[#0C3CF7]" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className={cn("font-semibold", TABLE_PRIMARY_TEXT_CLASS)}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "whitespace-nowrap", TABLE_PRIMARY_TEXT_CLASS)}>
                    {event.responsibleName}
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, "max-w-[240px]")}>
                    <span
                      className={cn(
                        "block truncate whitespace-nowrap",
                        TABLE_PRIMARY_TEXT_CLASS,
                      )}
                      title={event.responsibleEmail}
                    >
                      {event.responsibleEmail}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ListingTablePagination
        className="border-[rgba(4,14,35,0.08)] px-3 lg:px-4"
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        hasNextPage={pagination.hasNextPage}
        hasPrevPage={pagination.hasPrevPage}
        pageSizeOptions={[10, 25, 50]}
        itemLabel="atividades"
      />
    </>
  );
}
