"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardEmptyState() {
  const router = useRouter();

  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push("/financeiro/gestao-de-pagamentos");
  };

  return (
    <Card className="rounded-xl bg-white border border-border h-full">
      <CardContent className="flex items-center justify-center !pt-24 !pb-32 h-full">
        <div className="flex flex-col items-center justify-center gap-3 max-w-md">
          <svg width="159" height="90" viewBox="0 0 159 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M69.9779 23.7272H76.168C85.6322 23.7272 93.3043 31.3994 93.3043 40.8635C93.3043 50.3277 85.6321 57.9999 76.168 57.9999H17.1363C7.67219 57.9999 0 50.3277 0 40.8635C0 31.3994 7.67221 23.7272 17.1364 23.7272H23.3258C23.3258 10.623 33.7693 0 46.6519 0C59.5345 0 69.9779 10.623 69.9779 23.7272Z" fill="#FFEDE8"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M132.87 52.1817H139.7C150.143 52.1817 158.609 60.6476 158.609 71.0908C158.609 81.534 150.143 89.9999 139.7 89.9999H74.5614C64.1182 89.9999 55.6523 81.534 55.6523 71.0908C55.6523 60.6476 64.1182 52.1817 74.5614 52.1817H81.3915C81.3915 37.7219 92.9153 26 107.131 26C121.346 26 132.87 37.7219 132.87 52.1817Z" fill="#FFDAD1"/>
          </svg>
          <h3 className="text-lg font-semibold text-[#0d0f1c] text-center">
            Ainda não há dados para exibir
          </h3>
          <p className="text-sm text-[#5F6572] text-center leading-[1.4]">
            Quando houver movimentação em{" "}
            <button
              onClick={handleLinkClick}
              className="text-[#0C3CF7] hover:underline font-medium"
            >
              Gestão de pagamentos
            </button>
            ,<br />
            os dados aparecerão aqui.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
