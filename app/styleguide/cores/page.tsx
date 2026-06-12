"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CoresPage() {
  return (
    <div className="p-6">
      <div className="container max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Cores</h1>
          <p className="text-sm text-[#71717c] mt-1">
            Sistema de cores do Qive Conecta para manter consistência visual em toda a aplicação.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Paleta de Cores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#71717c]">
              Esta seção será expandida com a documentação completa das cores utilizadas no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
