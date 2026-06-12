"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TipografiaPage() {
  return (
    <div className="p-6">
      <div className="container max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Tipografia</h1>
          <p className="text-sm text-[#71717c] mt-1">
            Sistema tipográfico do Qive Conecta para hierarquia e legibilidade.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Famílias de Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#71717c]">
              Esta seção será expandida com a documentação completa da tipografia utilizada no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
