"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePortalPermissions } from "@/lib/user/usePortalPermissions";
import { getPortalPageTitleFromPathname } from "../lib/portal-paths";
import { fetchActivityEvents } from "./lib/activity-service";
import {
  DEFAULT_ACTIVITY_FILTERS,
  filterActivityEvents,
  hasActiveActivityFilters,
} from "./lib/activity-filters";
import type { ActivityEvent } from "./types";
import {
  HistoricoAtividadesFilters,
} from "./components/HistoricoAtividadesFilters";
import { HistoricoAtividadesLoadingSkeleton } from "./components/HistoricoAtividadesLoadingSkeleton";
import { HistoricoAtividadesTable } from "./components/HistoricoAtividadesTable";

export function HistoricoAtividadesPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { canViewActivityHistory } = usePortalPermissions();
  const pageTitle = getPortalPageTitleFromPathname(pathname);

  const [filters, setFilters] = React.useState(DEFAULT_ACTIVITY_FILTERS);
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!canViewActivityHistory) {
      router.replace("/compras/portal-de-fornecedores/documentos");
    }
  }, [canViewActivityHistory, router]);

  React.useEffect(() => {
    if (!canViewActivityHistory) return;

    let cancelled = false;

    async function loadEvents() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await fetchActivityEvents();
        if (!cancelled) {
          setEvents(data);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Não foi possível carregar o histórico de atividades.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [canViewActivityHistory]);

  const filteredEvents = React.useMemo(
    () => filterActivityEvents(events, filters),
    [events, filters],
  );

  const hasFilters = hasActiveActivityFilters(filters);

  const handleClearFilters = React.useCallback(() => {
    setFilters(DEFAULT_ACTIVITY_FILTERS);
  }, []);

  if (!canViewActivityHistory) {
    return null;
  }

  return (
    <section className="space-y-4 p-3 lg:p-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">{pageTitle}</h1>
        <p className="max-w-3xl text-sm text-[#5B616F]">
          Acompanhe as principais ações realizadas por usuários e pelo sistema no portal.
        </p>
      </header>

      <section className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
        <HistoricoAtividadesFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
        />

        {loadError ? (
          <div className="px-3 py-10 text-center text-sm text-[#B91C1C] lg:px-4">{loadError}</div>
        ) : isLoading ? (
          <HistoricoAtividadesLoadingSkeleton />
        ) : (
          <HistoricoAtividadesTable
            events={filteredEvents}
            hasFilters={hasFilters}
            onClearFilters={handleClearFilters}
          />
        )}
      </section>
    </section>
  );
}
