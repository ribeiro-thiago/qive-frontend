import Sidebar from "../../components/navigation/Sidebar";
import Header from "../../components/navigation/Header";
import Footer from "../../components/navigation/Footer";
import { SidebarSectionsProvider } from "@/components/navigation/SidebarSectionsContext";
import { FeaturesProvider } from "@/lib/features/FeaturesContext";
import { PortalUserProvider } from "@/lib/user/PortalUserContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

export const dynamic = 'force-dynamic';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeaturesProvider>
      <PortalUserProvider>
      <ThemeProvider>
        <SidebarSectionsProvider>
        <div className="grid app-grid grid-cols-[256px_1fr] grid-rows-[48px_1fr_auto] gap-x-6 gap-y-6 h-screen overflow-hidden">
          {/* Linha 1: Header atravessando todas as camadas */}
          <div className="col-start-1 col-end-[-1] row-start-1">
            <Header />
          </div>
          {/* Coluna 1 (linha 2): Navegação (Sidebar) */}
          <div className="col-start-1 row-start-2 sidebar-wrap pl-2 pb-2 pr-0">
            <Sidebar />
          </div>
          {/* Coluna 2 (linha 2): Conteúdo */}
          <main className="col-start-2 row-start-2 bg-white overflow-auto pr-6">
            {children}
            <Footer />
          </main>
        </div>
        </SidebarSectionsProvider>
      </ThemeProvider>
      </PortalUserProvider>
    </FeaturesProvider>
  );
}
