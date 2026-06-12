"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Gestão da conta", href: "/minha-conta" },
  { label: "Usuários", href: "/minha-conta/usuarios" },
  { label: "Empresas da conta", href: "/minha-conta/empresas" },
  { label: "Histórico de atividades", href: "#" },
  { label: "Certificados & agendamentos", href: "#" },
  { label: "Pedidos de certificados", href: "#" },
  { label: "Configurações", href: "#" },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col items-start self-stretch w-full shrink-0 lg:w-[260px] min-h-full"
      style={{
        paddingTop: 16,
        borderRadius: 8,
        border:
          "1px solid var(--Borders-e-dividers-gray-support-opacity-2, rgba(4, 14, 35, 0.08))",
        background: "var(--Surfaces-gray-50, #F5F5F6)",
      }}
    >
      <div className="w-full px-4 pb-2">
        <h2 className="text-sm font-semibold text-[#040E236B]">Minha conta</h2>
      </div>
      <nav className="w-full px-2 pb-2 space-y-1">
        {navigationItems.map((item) => {
          const isActive =
            item.href !== "#" &&
            (pathname === item.href ||
              (item.href !== "/minha-conta" && pathname.startsWith(item.href)));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "flex w-full items-center gap-2 rounded-[6px] px-2 py-[6px] text-sm transition-colors flex-1 basis-0",
                isActive
                  ? "bg-[#EAEBEC] font-semibold text-[rgba(4,14,35,0.86)]"
                  : "text-[#5B616F] hover:bg-white/70",
              ].join(" ")}
            >
              <span className="truncate text-left flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
