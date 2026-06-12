import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "../components/navigation/Sidebar";
import Header from "../components/navigation/Header";
import { Toaster } from "@/components/ui/sonner";
import { NotificationsProvider } from "@/lib/notifications/NotificationsContext";
import localFont from "next/font/local";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Testes Qive",
  description: "Aplicação Next.js (App Router) para Testes Qive",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
};

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../public/fonts/Inter-VariableFont_opsz,wght.ttf", style: "normal", weight: "100 900" },
    { path: "../public/fonts/Inter-Italic-VariableFont_opsz,wght.ttf", style: "italic", weight: "100 900" },
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="text-[#5F6572]">
      <body className={["font-sans", inter.variable].join(" ")}> 
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
        <Toaster />
        <Script 
          src="https://api.useberry.com/integrations/liveUrl/scripts/useberryScript.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
