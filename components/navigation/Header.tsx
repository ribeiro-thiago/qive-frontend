"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import UserMenu from "@/components/navigation/UserMenu";
import NotificationsMenu from "@/components/navigation/NotificationsMenu";
import {
  ChevronDown,
  Building2,
  Home,
  Rocket,
  Sparkles,
  Bell,
  Plug,
  Workflow,
  ArrowDown,
  ArrowUp,
  FileText,
  Wallet,
  Activity,
  Link2,
  ShoppingCart,
  Bot,
  Package,
  BookOpen,
  Calendar,
  History,
  Lock,
  List,
  Send,
  Boxes,
  Box,
  Briefcase,
  Truck,
  Receipt,
  Barcode,
  Files,
  Banknote,
  PiggyBank,
} from "lucide-react";

type IconType = React.ComponentType<{ className?: string }>;

function useHeaderMeta() {
  const pathname = usePathname();
  const map: Array<{
    test: (p: string) => boolean;
    label: string;
    Icon: IconType;
  }> = [
    { test: (p) => p === "/", label: "Início", Icon: Rocket },

    { test: (p) => p === "/ajustes", label: "Configurações", Icon: Lock },

    { test: (p) => p === "/notificacoes", label: "Últimas notificações", Icon: Bell },
    { test: (p) => p.startsWith("/notificacoes/ajustes"), label: "Ajustes de notificações", Icon: FileText },

    { test: (p) => p === "/ia", label: "Visão geral", Icon: Sparkles },
    { test: (p) => p.startsWith("/ia/assistentes"), label: "Assistentes", Icon: Bot },
    { test: (p) => p.startsWith("/ia/modelos"), label: "Modelos", Icon: Package },
    { test: (p) => p.startsWith("/ia/treinamento"), label: "Treinamento", Icon: BookOpen },
    { test: (p) => p.startsWith("/ia/monitoramento"), label: "Monitoramento", Icon: Activity },

    { test: (p) => p === "/integracoes", label: "Visão geral", Icon: Plug },
    { test: (p) => p.startsWith("/integracoes/conectores"), label: "Conectores", Icon: Plug },
    { test: (p) => p.startsWith("/integracoes/webhooks"), label: "Webhooks", Icon: Link2 },
    { test: (p) => p.startsWith("/integracoes/erps"), label: "ERPs", Icon: Building2 },
    { test: (p) => p.startsWith("/integracoes/marketplaces"), label: "Marketplaces", Icon: ShoppingCart },

    { test: (p) => p === "/automacoes", label: "Visão geral", Icon: Workflow },
    { test: (p) => p.startsWith("/automacoes/fluxos"), label: "Fluxos", Icon: Workflow },
    { test: (p) => p.startsWith("/automacoes/regras"), label: "Regras", Icon: List },
    { test: (p) => p.startsWith("/automacoes/disparos"), label: "Disparos", Icon: Send },
    { test: (p) => p.startsWith("/automacoes/logs"), label: "Logs", Icon: FileText },

    { test: (p) => p === "/transferencias", label: "Visão geral", Icon: ArrowDown },
    { test: (p) => p.startsWith("/transferencias/importacao"), label: "Importação", Icon: ArrowDown },
    { test: (p) => p.startsWith("/transferencias/exportacao"), label: "Exportação", Icon: ArrowUp },
    { test: (p) => p.startsWith("/transferencias/agendamentos"), label: "Agendamentos", Icon: Calendar },
    { test: (p) => p.startsWith("/transferencias/historico"), label: "Histórico", Icon: History },

    { test: (p) => p.startsWith("/documentos/nfe"), label: "NF-e", Icon: Box },
    { test: (p) => p.startsWith("/documentos/nfse"), label: "NFS-e", Icon: Briefcase },
    { test: (p) => p.startsWith("/documentos/cte"), label: "CT-e", Icon: Truck },
    { test: (p) => p.startsWith("/documentos/cfe-sat"), label: "CF-e SAT", Icon: Receipt },
    { test: (p) => p.startsWith("/documentos/nfce"), label: "NFC-e", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/documentos/mdfe"), label: "MDF-e", Icon: Boxes },
    { test: (p) => p.startsWith("/documentos/outros"), label: "Outros documentos", Icon: Files },

    { test: (p) => p.startsWith("/financeiro/gestao-de-pagamentos"), label: "Contas a pagar", Icon: Banknote },
    { test: (p) => p.startsWith("/financeiro/contas-a-receber"), label: "Listagem de boletos", Icon: Barcode },

    { test: (p) => p.startsWith("/compras/portal-de-fornecedores/painel-de-transicao-tributaria"), label: "Radar da Reforma Tributária", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/compras/portal-de-fornecedores/documentos"), label: "Documentos", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/compras/portal-de-fornecedores/nfse"), label: "NFS-e", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/compras/portal-de-fornecedores/cte-os"), label: "CTE-OS", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/compras/portal-de-fornecedores/cte"), label: "CT-e", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/compras/portal-de-fornecedores/nfe"), label: "NF-e", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/compras/portal-de-fornecedores/cadastro"), label: "Cadastro", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/compras/portal-de-fornecedores/indicadores"), label: "Indicadores", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/compras/portal-de-fornecedores/historico-de-atividades"), label: "Histórico de Atividades", Icon: History },
    { test: (p) => p.startsWith("/compras/analise-de-fornecedores"), label: "Análise de Fornecedores", Icon: Activity },
    { test: (p) => p.startsWith("/compras/custos-de-transporte"), label: "Custos de Transporte", Icon: Truck },
    { test: (p) => p.startsWith("/compras/preco-de-produto"), label: "Preço de Produto", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/compras/controle-de-devolucao"), label: "Controle de Devolução", Icon: Files },
    { test: (p) => p.startsWith("/fiscal/conciliacao-fiscal-triplice"), label: "Conciliação Fiscal", Icon: Files },
    { test: (p) => p.startsWith("/compras/portal-de-fornecedores"), label: "Portal de Fornecedores", Icon: ShoppingCart },
    { test: (p) => p.startsWith("/fornecedores/analise"), label: "Análise de fornecedores", Icon: Activity },
  ];

  for (const m of map) {
    if (m.test(pathname)) return { label: m.label, Icon: m.Icon };
  }
  return { label: "Início", Icon: Home };
}

export default function Header(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

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

  // Handler para mudança de aba
  const handleTabChange = React.useCallback((tabId: string) => {
    if (tabId === "compras") {
      router.push("/compras/portal-de-fornecedores/documentos");
    } else if (tabId === "fiscal") {
      router.push("/fiscal/reforma-tributaria");
    } else if (tabId === "geral") {
      router.push("/");
    }
  }, [router]);

  return (
    <header className="bg-white">
      <div className="h-[48px] box-border border-b border-border px-4 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Logo completo (máx. 24px de altura) + Tabs a 40px (ml-10) */}
        <div className="flex items-center">
          <svg className="h-6 w-auto" viewBox="0 0 113 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Qive">
            <path d="M52.0063 39.375H44.6094V11.5517H52.0063V39.375Z" fill="#100F0D"/>
            <path d="M76.5497 11.5517L70.412 30.2148L63.9749 11.5517H56.1797L66.9338 39.375H74.046L84.1741 11.5517H76.5497Z" fill="#100F0D"/>
            <path d="M38.4924 12.006C37.5251 9.57916 36.1399 7.46374 34.3387 5.66196C32.5366 3.86018 30.4215 2.46635 27.9944 1.47937C25.5664 0.493492 22.9108 -5.98375e-07 20.0285 -5.98375e-07C17.1072 -5.98375e-07 14.424 0.493492 11.9773 1.47937C9.53067 2.46635 7.4156 3.86018 5.63302 5.66196C3.84963 7.46374 2.46535 9.57916 1.47938 12.006C0.492603 14.434 0 17.1076 0 20.0291C0 22.9121 0.492603 25.5759 1.47938 28.0225C2.46535 30.4691 3.84963 32.5944 5.63302 34.3951C7.4156 36.1979 9.53067 37.5819 11.9773 38.5491C14.424 39.5164 17.1072 40 20.0285 40C22.462 40 24.7332 39.6535 26.8429 38.9648L22.9494 32.4814C22.0243 32.6755 21.0509 32.7742 20.0285 32.7742C17.6388 32.7742 15.5051 32.2435 13.6274 31.1808C11.7496 30.1193 10.2703 28.63 9.18925 26.7142C8.10818 24.7995 7.56757 22.57 7.56757 20.0291C7.56757 17.4881 8.10818 15.2587 9.18925 13.3428C10.2703 11.4281 11.7496 9.92899 13.6274 8.8477C15.5051 7.76641 17.6388 7.22577 20.0285 7.22577C22.4183 7.22577 24.5423 7.76641 26.4012 8.8477C28.2592 9.92899 29.7201 11.4182 30.7825 13.3143C31.8439 15.2115 32.3757 17.4498 32.3757 20.0291C32.3757 22.5316 31.8439 24.7512 30.7825 26.6857C30.4065 27.37 29.978 27.9973 29.5023 28.573L33.467 35.2066C33.7644 34.9456 34.0567 34.678 34.3387 34.3951C36.1399 32.5944 37.5251 30.4691 38.4924 28.0225C39.4596 25.5759 39.9432 22.9121 39.9432 20.0291C39.9432 17.1076 39.4596 14.434 38.4924 12.006Z" fill="#100F0D"/>
            <path d="M31.5819 39.375L20.0312 20.1432H28.9566L40.4503 39.375H31.5819Z" fill="#EF3923"/>
            <path d="M93.2149 18.6651C94.4468 17.376 96.1073 16.7304 98.1941 16.7304C100.545 16.7304 102.28 17.48 103.4 18.9781C104.057 19.8574 104.519 20.8922 104.79 22.0783H91.5167C91.7671 20.7274 92.3319 19.5887 93.2149 18.6651ZM105.58 30.2473C104.847 31.2707 103.997 32.1325 103.03 32.8327C101.93 33.6296 100.412 34.0281 98.4778 34.0281C96.2391 34.0281 94.4952 33.3835 93.2431 32.0934C92.1553 30.9722 91.5404 29.4926 91.3989 27.6547H111.849C111.924 27.3901 111.972 27.0575 111.991 26.6591C112.01 26.2606 112.02 25.8539 112.02 25.4359C112.02 22.6291 111.451 20.1354 110.313 17.9536C109.174 15.7729 107.572 14.0555 105.505 12.8045C103.437 11.5525 101 10.9265 98.1941 10.9265C95.4247 10.9265 93.0058 11.5432 90.9394 12.7757C88.8712 14.0091 87.2592 15.7163 86.1026 17.897C84.9451 20.0788 84.3672 22.6106 84.3672 25.4925C84.3672 28.4146 84.9451 30.9547 86.1026 33.1169C87.2592 35.2791 88.8712 36.9584 90.9394 38.1527C93.0058 39.3481 95.4247 39.9453 98.1941 39.9453C101.228 39.9453 103.817 39.3286 105.96 38.0961C107.953 36.9491 109.562 35.3347 110.784 33.2517L105.58 30.2473Z" fill="#100F0D"/>
          </svg>
          <div className="ml-10">
            <Tabs
              tabs={[
                { id: "geral", label: "Geral" },
                { id: "fiscal", label: "Fiscal" },
                { id: "compras", label: "Compras" },
              ]}
              value={activeTab}
              onValueChange={handleTabChange}
              variant="header"
              className="w-auto"
            />
          </div>
        </div>
        {/* Ícones à direita: notificações, ajuda, avatar */}
        <div className="justify-self-end flex items-center gap-2">
          <NotificationsMenu />
          <button type="button" aria-label="Ajuda" className="nav-icon-btn">
            <svg width="20" height="20" className="text-[#5B616F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 9a3 3 0 1 1 6 0c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
          {/* Avatar com dropdown */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
