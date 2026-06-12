"use client";

import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
} from "@/components/shared/tableStyles";
import { cn } from "@/lib/utils";

function SkeletonRow() {
  return (
    <tr className={TABLE_BODY_ROW_CLASS} aria-hidden>
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
  );
}

export function HistoricoAtividadesLoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando histórico de atividades">
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
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
