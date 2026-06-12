import DesignSystemHeader from "@/components/design-system/DesignSystemHeader";
import DesignSystemSidebar from "@/components/design-system/DesignSystemSidebar";
import { Metadata } from "next";
import localFont from "next/font/local";

export const metadata: Metadata = {
  title: "Design System • Qive Conecta",
  description: "Documentação completa dos componentes do design system do Qive Conecta",
  icons: {
    icon: "/favicon.svg",
  },
};

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../../public/fonts/Inter-VariableFont_opsz,wght.ttf", style: "normal", weight: "100 900" },
    { path: "../../public/fonts/Inter-Italic-VariableFont_opsz,wght.ttf", style: "italic", weight: "100 900" },
  ],
});

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid app-grid grid-cols-[256px_1fr] grid-rows-[48px_1fr] gap-x-4 h-screen overflow-hidden">
      {/* Linha 1: Header atravessando todas as camadas */}
      <div className="col-start-1 col-end-[-1] row-start-1">
        <DesignSystemHeader />
      </div>
      {/* Coluna 1 (linha 2): Navegação (Sidebar) */}
      <div className="col-start-1 row-start-2 sidebar-wrap p-2 pr-0">
        <DesignSystemSidebar />
      </div>
      {/* Coluna 2 (linha 2): Conteúdo */}
      <main className="col-start-2 row-start-2 bg-white overflow-auto">
        {children}
      </main>
    </div>
  );
}
