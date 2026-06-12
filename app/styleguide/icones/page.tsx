"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function IconesPage() {
  return (
    <div className="p-6">
      <div className="container max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Ícones</h1>
          <p className="text-sm text-[#71717c] mt-1">
            Biblioteca de ícones do Qive Conecta para comunicação visual consistente.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Biblioteca de Ícones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#71717c]">
              Esta seção será expandida com a documentação completa dos ícones utilizados no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
