"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function EstadosPage() {
  return (
    <div className="p-6">
      <div className="container max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Estados</h1>
          <p className="text-sm text-[#71717c] mt-1">
            Documentação do componente Estados do Qive Conecta.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Componente Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#71717c]">
              Esta seção será expandida com a documentação completa do componente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
