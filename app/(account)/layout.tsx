import Header from "../../components/navigation/Header";
import { FeaturesProvider } from "@/lib/features/FeaturesContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeaturesProvider>
      <ThemeProvider>
        <div className="grid app-grid grid-rows-[48px_1fr] h-screen overflow-hidden">
          {/* Header ocupando toda a largura */}
          <div className="row-start-1 col-start-1 col-end-[-1]">
            <Header />
          </div>

          {/* Conteúdo sem sidebar lateral principal */}
          <main className="row-start-2 col-start-1 col-end-[-1] bg-white overflow-auto">
            {children}
          </main>
        </div>
      </ThemeProvider>
    </FeaturesProvider>
  );
}

