"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";
import { useFeatures } from "@/lib/features/useFeatures";
import { usePortalUser } from "@/lib/user/PortalUserContext";
import { useSidebarSections } from "@/components/navigation/SidebarSectionsContext";
import {
  COMPRAS_ANALISES_MENU_ITEMS,
  COMPRAS_PORTAL_MENU_ITEMS,
  COMPRAS_RELATORIOS_MENU_ITEMS,
  isComprasSidebarSection,
} from "@/components/navigation/compras-menu";
import type { MenuItem, MenuSection } from "@/components/navigation/sidebar-types";
import type { PortalUserRole } from "@/lib/user/portal-user-types";

// Estrutura de dados do menu
const MENU_SECTIONS: MenuSection[] = [
  {
    id: "principal",
    label: "Principal",
    items: [
      { label: "Home Qive", href: "/" },
    ],
  },
  {
    id: "documentos",
    label: "Documentos",
    items: [
      { label: "NF-e", href: "/documentos/nfe" },
      { label: "NF-e em etapas", href: "/documentos/nfe-etapas" },
      { label: "NFS-e", href: "/documentos/nfse" },
      { label: "CT-e", href: "/documentos/cte" },
      { label: "CF-e SAT", href: "/documentos/cfe-sat" },
      { label: "NFC-e", href: "/documentos/nfce" },
      { label: "MDF-e", href: "/documentos/mdfe" },
    ],
  },
  {
    id: "financeiro",
    label: "Gestão de Pagamentos",
    items: [
      { label: "Painel de performance", href: "/financeiro/dashboard-financeiro" },
      { label: "Contas a pagar", href: "/financeiro/gestao-de-pagamentos?tab=todas" },
      { label: "Listagem de comprovantes", href: "/financeiro/comprovantes" },
      { label: "Listagem de boletos", href: "/financeiro/contas-a-receber" },
    ],
  },
  {
    id: "compras",
    label: "Portal de Fornecedores",
    items: COMPRAS_PORTAL_MENU_ITEMS,
  },
  {
    id: "compras-analises",
    label: "Análises",
    items: COMPRAS_ANALISES_MENU_ITEMS,
  },
  {
    id: "compras-relatorios",
    label: "Relatórios",
    items: COMPRAS_RELATORIOS_MENU_ITEMS,
  },
  {
    id: "fiscal-analises",
    label: "Análises",
    items: [
      { label: "Reforma Tributária", href: "/fiscal/reforma-tributaria" },
      { label: "Erros em Notas", href: "/fiscal/erros-em-notas" },
      { label: "Painel Conexões", href: "/fiscal/painel-conexoes" },
    ],
  },
  {
    id: "fiscal-lancamento",
    label: "Lançamento",
    items: [
      { label: "Confere Chaves", href: "/fiscal/confere-chaves" },
    ],
  },
  {
    id: "fiscal-escrituracao-obrigacoes",
    label: "Escrituração e Obrigações",
    items: [
      { label: "Análise TAX e SPED", href: "/fiscal/analise-tax-sped" },
      { label: "Confere C100D100", href: "/fiscal/confere-c100d100" },
      { label: "SPEDs Entregues", href: "/fiscal/speds-entregues" },
    ],
  },
  {
    id: "fiscal-relatorios",
    label: "Relatórios",
    items: [
      { label: "Conciliação Fiscal", href: "/fiscal/conciliacao-fiscal-triplice" },
    ],
  },
  {
    id: "captura-envio",
    label: "Captura e envio",
    items: [
      { label: "Integrações", href: "/integracoes" },
      { label: "Recuperar Notas", href: "/captura/recuperar" },
      { label: "Sincroniza Notas", href: "/captura/sincronizar" },
      { label: "Importar XMLs", href: "/captura/importar" },
      { label: "Painel de Capturas", href: "/captura/painel" },
    ],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    items: [
      { label: "Relatórios Avançados", href: "/relatorios" },
    ],
  },
  {
    id: "produtividade",
    label: "Produtividade",
    items: [
      { label: "Fechamento de Mês", href: "/produtividade/fechamento" },
      { label: "Automações", href: "/automacoes" },
      { label: "Operações em Lote NF-e", href: "/produtividade/lote-nfe" },
    ],
  },
];

// Mapeamento de hrefs para product keys
function getProductKeyFromHref(href: string): string | null {
  const mapping: Record<string, string> = {
    "/documentos/nfe": "nfe",
    "/documentos/nfe-etapas": "nfe-etapas",
    "/documentos/nfse": "nfse",
    "/documentos/cte": "cte",
    "/documentos/cfe-sat": "cfe-sat",
    "/documentos/nfce": "nfce",
    "/documentos/mdfe": "mdfe",
    "/financeiro/gestao-de-pagamentos": "gestao-de-pagamentos",
    "/financeiro/dashboard-financeiro": "dashboard-financeiro",
    "/financeiro/comprovantes": "comprovantes",
    "/financeiro/contas-a-receber": "contas-a-receber",
    "/compras/portal-de-fornecedores": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/documentos": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/nfe": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/nfe/importar": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/nfse": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/nfse/importar": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/cte": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/cte/importar": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/cte-os": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/cte-os/importar": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/cadastro": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/indicadores": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/historico-de-atividades": "portal-de-fornecedores",
    "/compras/portal-de-fornecedores/painel-de-transicao-tributaria": "portal-de-fornecedores",
    "/compras/analise-de-fornecedores": "analise-de-fornecedores",
    "/compras/custos-de-transporte": "custos-de-transporte",
    "/compras/preco-de-produto": "preco-de-produto",
    "/compras/controle-de-devolucao": "controle-de-devolucao",
    "/fiscal/conciliacao-fiscal-triplice": "conciliacao-fiscal-triplice",
    "/fiscal/reforma-tributaria": "reforma-tributaria",
    "/fiscal/erros-em-notas": "erros-em-notas",
    "/fiscal/painel-conexoes": "painel-conexoes",
    "/fiscal/confere-chaves": "confere-chaves",
    "/fiscal/analise-tax-sped": "analise-tax-sped",
    "/fiscal/confere-c100d100": "confere-c100d100",
    "/fiscal/speds-entregues": "speds-entregues",
    "/integracoes": "integracoes",
    "/captura/recuperar": "recuperar",
    "/captura/sincronizar": "sincronizar",
    "/captura/importar": "importar",
    "/captura/painel": "painel",
    "/relatorios": "relatorios",
    "/produtividade/fechamento": "fechamento",
    "/automacoes": "automacoes",
    "/produtividade/lote-nfe": "lote-nfe",
  };
  return mapping[href] || null;
}

function isMenuItemActive(href: string, activeHref: string): boolean {
  if (href === "/") return activeHref === "/";
  return activeHref === href || activeHref.startsWith(`${href}/`);
}

function isMenuItemVisibleForUser(
  item: MenuItem,
  hasRole: (roles: PortalUserRole | PortalUserRole[]) => boolean,
): boolean {
  if (!item.requiredRoles?.length) return true;
  return hasRole(item.requiredRoles);
}

function filterMenuItemsByRole(
  items: MenuItem[],
  hasRole: (roles: PortalUserRole | PortalUserRole[]) => boolean,
): MenuItem[] {
  return items
    .filter((item) => isMenuItemVisibleForUser(item, hasRole))
    .map((item) => ({
      ...item,
      children: item.children ? filterMenuItemsByRole(item.children, hasRole) : undefined,
      groupItems: item.groupItems ? filterMenuItemsByRole(item.groupItems, hasRole) : undefined,
    }));
}

function collectLeafMenuItems(items: MenuItem[]): Array<MenuItem & { href: string }> {
  const leaves: Array<MenuItem & { href: string }> = [];
  for (const item of items) {
    if (item.href) leaves.push({ ...item, href: item.href });
    if (item.children) leaves.push(...collectLeafMenuItems(item.children));
    if (item.groupItems) leaves.push(...collectLeafMenuItems(item.groupItems));
  }
  return leaves;
}

function getMostSpecificActiveHref(items: MenuItem[], activeHref: string): string | null {
  let best: string | null = null;
  for (const item of collectLeafMenuItems(items)) {
    if (!isMenuItemActive(item.href, activeHref)) continue;
    if (!best || item.href.length > best.length) best = item.href;
  }
  return best;
}

function sectionHasActiveItem(items: MenuItem[], activeHref: string): boolean {
  return collectLeafMenuItems(items).some((item) => {
    if (item.href === "/") return activeHref === "/";
    return isMenuItemActive(item.href, activeHref);
  });
}

function SidebarMenuGroup({
  label,
  items,
  activeHref,
}: {
  label: string;
  items: MenuItem[];
  activeHref: string;
}) {
  const activeChildHref = getMostSpecificActiveHref(items, activeHref);

  return (
    <div className="pt-2">
      <div className="px-2 py-1 text-sm font-medium leading-5 sidebar-section select-none">
        {label}
      </div>
      <div className="mt-1 space-y-1">
        {items.map((child) => (
          <SidebarItem
            key={child.href}
            item={child}
            isActive={child.href === activeChildHref}
          />
        ))}
      </div>
    </div>
  );
}

// Componente para item de menu
function SidebarItem({
  item,
  isActive,
  nested = false,
}: {
  item: MenuItem;
  isActive: boolean;
  nested?: boolean;
}) {
  const { isProductEnabled } = useFeatures();
  const href = item.href ?? "#";
  const productKey = item.href ? getProductKeyFromHref(item.href) : null;
  const isEnabled = productKey ? isProductEnabled(productKey) : true;

  const className = [
    "sidebar-item",
    isActive ? "is-active" : "",
    nested ? "pl-6 text-[13px]" : "",
  ].join(" ");

  if (!isEnabled && productKey) {
    return (
      <button
        type="button"
        onClick={(e) => e.preventDefault()}
        disabled
        aria-disabled="true"
        className={[className, "opacity-50 cursor-not-allowed hover:bg-transparent"].join(" ")}
      >
        <span className="sidebar-label">{item.label}</span>
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      <span className="sidebar-label">{item.label}</span>
    </Link>
  );
}

function SidebarMenuEntry({
  item,
  activeHref,
  sectionOpen,
}: {
  item: MenuItem;
  activeHref: string;
  sectionOpen: boolean;
}) {
  const activeChildHref = item.children
    ? getMostSpecificActiveHref(item.children, activeHref)
    : null;
  const hasActiveChild = activeChildHref !== null;
  const isParentActive =
    !!item.href && isMenuItemActive(item.href, activeHref) && !hasActiveChild;
  const showChildren =
    !!item.children?.length && (sectionOpen || isParentActive || hasActiveChild);

  return (
    <>
      {item.href ? <SidebarItem item={item} isActive={isParentActive} /> : null}
      {showChildren && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.href}
              item={child}
              isActive={child.href === activeChildHref}
              nested
            />
          ))}
        </div>
      )}
    </>
  );
}

// Componente para seção do menu
function SidebarSection({
  section,
  isOpen,
  onToggle,
  activeHref,
  isFirst,
}: {
  section: MenuSection;
  isOpen: boolean;
  onToggle: () => void;
  activeHref: string;
  isFirst?: boolean;
}) {
  // Não filtrar itens - todos aparecem, mesmo desabilitados
  const filteredItems = section.items;

  const activeItemHref = React.useMemo(
    () => getMostSpecificActiveHref(filteredItems, activeHref),
    [filteredItems, activeHref]
  );

  const hasActiveItem = React.useMemo(
    () => sectionHasActiveItem(filteredItems, activeHref),
    [filteredItems, activeHref]
  );

  const strictCollapse = isComprasSidebarSection(section.id);
  const showItems =
    filteredItems.length > 0 && (strictCollapse ? isOpen : isOpen || hasActiveItem);

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
            "pointer-events-none absolute right-2 h-4 w-4 transition-transform",
            isOpen ? "" : "-rotate-90",
          ].join(" ")}
        />
      </button>
      {showItems && (
        <div className="mt-1 space-y-1">
          {filteredItems.map((item) => {
            if (item.groupItems?.length) {
              if (strictCollapse && !isOpen) return null;
              return (
                <SidebarMenuGroup
                  key={item.label}
                  label={item.label}
                  items={item.groupItems}
                  activeHref={activeHref}
                />
              );
            }

            if (item.children?.length) {
              const isVisible =
                (!!item.href && isMenuItemActive(item.href, activeHref)) ||
                (item.children?.some((child) => child.href && isMenuItemActive(child.href, activeHref)) ??
                  false);
              if (!strictCollapse && !isOpen && !isVisible) return null;
              if (strictCollapse && !isOpen) return null;
              return (
                <SidebarMenuEntry
                  key={item.href ?? item.label}
                  item={item}
                  activeHref={activeHref}
                  sectionOpen={isOpen}
                />
              );
            }

            if (!item.href) return null;
            if (!strictCollapse && !isOpen && item.href !== activeItemHref) return null;
            return (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={item.href === activeItemHref}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const { hasRole } = usePortalUser();

  // Determinar qual aba está ativa baseado no pathname
  const activeTab = React.useMemo(() => {
    if (pathname.startsWith("/compras")) {
      return "compras";
    }
    if (pathname.startsWith("/fiscal")) {
      return "fiscal";
    }
    return "geral";
  }, [pathname]);

  // Filtrar seções baseado na aba ativa
  const visibleSections = React.useMemo(() => {
    const sections =
      activeTab === "compras"
        ? MENU_SECTIONS.filter((section) => isComprasSidebarSection(section.id))
        : activeTab === "fiscal"
          ? MENU_SECTIONS.filter((section) => section.id.startsWith("fiscal-"))
          : MENU_SECTIONS.filter(
              (section) =>
                !isComprasSidebarSection(section.id) && !section.id.startsWith("fiscal-")
            );

    return sections.map((section) => ({
      ...section,
      items: filterMenuItemsByRole(section.items, hasRole),
    }));
  }, [activeTab, hasRole]);

  const { openSections, toggleSection } = useSidebarSections();
  const [collapsed, setCollapsed] = React.useState(false);

  // Carregar estado de collapse da sidebar
  React.useEffect(() => {
    try {
      const collapsedValue = localStorage.getItem("sidebar-collapsed");
      const isCollapsed = collapsedValue === "true";
      setCollapsed(isCollapsed);
      const root = document.documentElement.classList;
      isCollapsed ? root.add("sidebar-collapsed") : root.remove("sidebar-collapsed");
    } catch {}
  }, []);

  // Toggle de colapso da sidebar
  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar-collapsed", String(next));
        const root = document.documentElement.classList;
        next ? root.add("sidebar-collapsed") : root.remove("sidebar-collapsed");
      } catch {}
      return next;
    });
  }

  return (
    <aside
      className="sidebar-panel group relative z-50 rounded-[8px] border w-[256px] flex flex-col"
      style={{
        borderColor: "var(--Borders-e-dividers-gray-support-opacity-2, rgba(4, 14, 35, 0.08))",
        background: "var(--Surfaces-gray-50, #F5F5F6)",
        height: "calc(100vh - 48px - 32px)", // 100vh - header - gap superior - padding inferior do wrapper
      }}
    >
      <nav
        className="nav-slide flex-1 pl-3 pr-5 py-3 space-y-4 overflow-y-auto min-h-0 scrollbars-hidden"
      >
        {visibleSections.map((section, index) => (
          <SidebarSection
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
