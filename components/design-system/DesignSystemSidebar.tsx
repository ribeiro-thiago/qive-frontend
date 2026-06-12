"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LucideIcon,
  Palette,
  Square,
  Layers,
  Type,
  Eye,
  Code,
  Zap,
  Layout,
} from "lucide-react";

// Tipos
type DesignSystemMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type DesignSystemMenuSection = {
  id: string;
  label: string;
  items: DesignSystemMenuItem[];
};

// Estrutura de dados do menu do design system
const DESIGN_SYSTEM_MENU_SECTIONS: DesignSystemMenuSection[] = [
  {
    id: "fundamentos",
    label: "Fundamentos",
    items: [
      { label: "Cores", href: "/styleguide/cores", icon: Palette },
      { label: "Tipografia", href: "/styleguide/tipografia", icon: Type },
      { label: "Espaçamento", href: "/styleguide/espacamento", icon: Square },
      { label: "Ícones", href: "/styleguide/icones", icon: Eye },
    ],
  },
  {
    id: "componentes",
    label: "Componentes",
    items: [
      { label: "Botões", href: "/styleguide/botoes", icon: Square },
      { label: "Modais", href: "/styleguide/modais", icon: Layers },
      { label: "Formulários", href: "/styleguide/formularios", icon: Layout },
      { label: "Navegação", href: "/styleguide/navegacao", icon: Code },
      { label: "Cards", href: "/styleguide/cards", icon: Square },
      { label: "Tabelas", href: "/styleguide/tabelas", icon: Layout },
    ],
  },
  {
    id: "padroes",
    label: "Padrões",
    items: [
      { label: "Layout", href: "/styleguide/layout", icon: Layout },
      { label: "Estados", href: "/styleguide/estados", icon: Zap },
      { label: "Acessibilidade", href: "/styleguide/acessibilidade", icon: Eye },
    ],
  },
];

// Componente para item de menu
function DesignSystemSidebarItem({ item, isActive }: { item: DesignSystemMenuItem; isActive: boolean }) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={["sidebar-item", isActive ? "is-active" : ""].join(" ")}
    >
      <Icon className="h-4 w-4" />
      <span className="sidebar-label">{item.label}</span>
    </Link>
  );
}

// Componente para seção do menu
function DesignSystemSidebarSection({
  section,
  isOpen,
  onToggle,
  activeHref,
  isFirst,
}: {
  section: DesignSystemMenuSection;
  isOpen: boolean;
  onToggle: () => void;
  activeHref: string;
  isFirst?: boolean;
}) {
  const hasActiveItem = React.useMemo(() => {
    return section.items.some((item) => {
      if (item.href === "/styleguide") return activeHref === "/styleguide";
      return activeHref === item.href || activeHref.startsWith(item.href);
    });
  }, [section.items, activeHref]);

  return (
    <div className={`-mx-3 px-3 pt-2 sb-section ${isFirst ? "sb-first" : ""} group/section`}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="relative w-full flex items-center px-2 py-1.5 t-text-sm sidebar-section cursor-pointer select-none pr-8"
      >
        <span className="flex-1 text-left">{section.label}</span>
        <ChevronDown
          className={[
            "pointer-events-none absolute right-2 h-4 w-4 transition-transform transition-opacity opacity-0",
            isOpen ? "" : "-rotate-90",
            "group-hover/section:opacity-100 group-focus-within/section:opacity-100",
          ].join(" ")}
        />
      </button>
      {(isOpen || hasActiveItem) && (
        <div className="mt-1 space-y-1">
          {section.items.map((item) => {
            const isActive =
              activeHref === item.href ||
              (item.href !== "/styleguide" && activeHref.startsWith(item.href));
            if (!isOpen && !isActive) return null;
            return <DesignSystemSidebarItem key={item.href} item={item} isActive={isActive} />;
          })}
        </div>
      )}
    </div>
  );
}

export default function DesignSystemSidebar(): JSX.Element {
  const pathname = usePathname();

  // Estado unificado para todas as seções
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = React.useState(false);

  // Carregar estado salvo do localStorage
  React.useEffect(() => {
    const loadState = () => {
      try {
        // Carregar estado de collapse
        const collapsedValue = localStorage.getItem("design-system-sidebar-collapsed");
        const isCollapsed = collapsedValue === "true";
        setCollapsed(isCollapsed);
        const root = document.documentElement.classList;
        isCollapsed ? root.add("design-system-sidebar-collapsed") : root.remove("design-system-sidebar-collapsed");

        // Carregar estado das seções
        const sections: Record<string, boolean> = {};
        DESIGN_SYSTEM_MENU_SECTIONS.forEach((section) => {
          const key = `ds-sb-open-${section.id}`;
          const value = localStorage.getItem(key);
          sections[section.id] = value === null ? true : value === "true";
        });
        setOpenSections(sections);
      } catch (error) {
        // Fallback: todas as seções abertas por padrão
        const defaultSections: Record<string, boolean> = {};
        DESIGN_SYSTEM_MENU_SECTIONS.forEach((section) => {
          defaultSections[section.id] = true;
        });
        setOpenSections(defaultSections);
      }
    };

    loadState();
  }, []);

  // Garantir que a seção da rota atual esteja aberta apenas se ainda não houver estado definido para ela
  React.useEffect(() => {
    const sectionToOpen = DESIGN_SYSTEM_MENU_SECTIONS.find((section) =>
      section.items.some((item) => {
        if (item.href === "/styleguide") return pathname === "/styleguide";
        return pathname.startsWith(item.href);
      })
    );

    if (sectionToOpen && openSections[sectionToOpen.id] === undefined) {
      setOpenSections((prev) => ({ ...prev, [sectionToOpen.id]: true }));
    }
  }, [pathname, openSections]);

  // Persistir mudanças no localStorage
  React.useEffect(() => {
    Object.entries(openSections).forEach(([sectionId, isOpen]) => {
      try {
        localStorage.setItem(`ds-sb-open-${sectionId}`, String(isOpen));
      } catch {}
    });
  }, [openSections]);

  // Toggle de colapso da sidebar
  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("design-system-sidebar-collapsed", String(next));
        const root = document.documentElement.classList;
        next ? root.add("design-system-sidebar-collapsed") : root.remove("design-system-sidebar-collapsed");
      } catch {}
      return next;
    });
  }

  // Toggle de seção
  function toggleSection(sectionId: string) {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  return (
    <aside
      className="sidebar-panel group relative z-50 rounded-[8px] border w-[256px] flex flex-col"
      style={{
        borderColor: "var(--Borders-e-dividers-gray-support-opacity-2, rgba(4, 14, 35, 0.08))",
        background: "var(--Surfaces-gray-50, #F5F5F6)",
        height: "calc(100vh - 48px - 16px)", // 100vh - header - padding do wrapper
      }}
    >
      <nav
        className="nav-slide flex-1 pl-3 pr-5 py-3 space-y-4 overflow-y-auto min-h-0 scrollbars-hidden"
      >
        {DESIGN_SYSTEM_MENU_SECTIONS.map((section, index) => (
          <DesignSystemSidebarSection
            key={section.id}
            section={section}
            isOpen={openSections[section.id] ?? true}
            onToggle={() => toggleSection(section.id)}
            activeHref={pathname}
            isFirst={index === 0}
          />
        ))}
      </nav>

      {/* Botão de collapse */}
      <div className="absolute bottom-3 right-[-18px] z-50">
        <Button
          variant="secondary"
          size="icon"
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          className={[
            "shadow-[0_1px_0_0_rgba(4,14,35,0.04)]",
            collapsed
              ? "opacity-100"
              : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
          ].join(" ")}
          onClick={toggleCollapsed}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
