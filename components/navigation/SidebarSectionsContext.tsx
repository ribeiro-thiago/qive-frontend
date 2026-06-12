"use client";

import React from "react";
import { COMPRAS_SIDEBAR_SECTION_IDS } from "@/components/navigation/compras-menu";

export const PORTAL_SIDEBAR_SECTION_ID = "compras";

const SIDEBAR_SECTION_IDS = [
  "principal",
  "documentos",
  "financeiro",
  ...COMPRAS_SIDEBAR_SECTION_IDS,
  "captura-envio",
  "relatorios",
  "produtividade",
] as const;

type SidebarSectionsContextValue = {
  openSections: Record<string, boolean>;
  toggleSection: (sectionId: string) => void;
  isSectionOpen: (sectionId: string) => boolean;
};

const SidebarSectionsContext = React.createContext<SidebarSectionsContextValue | null>(null);

export function SidebarSectionsProvider({ children }: { children: React.ReactNode }) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const sections: Record<string, boolean> = {};
      SIDEBAR_SECTION_IDS.forEach((sectionId) => {
        const value = localStorage.getItem(`sb-open-${sectionId}`);
        sections[sectionId] = value === null ? true : value === "true";
      });
      setOpenSections(sections);
    } catch {
      const defaultSections: Record<string, boolean> = {};
      SIDEBAR_SECTION_IDS.forEach((sectionId) => {
        defaultSections[sectionId] = true;
      });
      setOpenSections(defaultSections);
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    Object.entries(openSections).forEach(([sectionId, isOpen]) => {
      try {
        localStorage.setItem(`sb-open-${sectionId}`, String(isOpen));
      } catch {}
    });
  }, [openSections, hydrated]);

  const toggleSection = React.useCallback((sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !(prev[sectionId] ?? true),
    }));
  }, []);

  const isSectionOpen = React.useCallback(
    (sectionId: string) => openSections[sectionId] ?? true,
    [openSections]
  );

  const value = React.useMemo(
    () => ({ openSections, toggleSection, isSectionOpen }),
    [openSections, toggleSection, isSectionOpen]
  );

  return (
    <SidebarSectionsContext.Provider value={value}>{children}</SidebarSectionsContext.Provider>
  );
}

export function useSidebarSections(): SidebarSectionsContextValue {
  const context = React.useContext(SidebarSectionsContext);
  if (!context) {
    throw new Error("useSidebarSections must be used within SidebarSectionsProvider");
  }
  return context;
}
