"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function EspacamentoPage() {
  return (
    <div className="p-6">
      <div className="container max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Espaçamento</h1>
          <p className="text-sm text-[#71717c] mt-1">
            Sistema de espaçamento do Qive Conecta para consistência visual.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Escala de Espaçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#71717c]">
              Esta seção será expandida com a documentação completa do sistema de espaçamento.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
