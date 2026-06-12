"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Download, Copy, Check, Plus, Settings, Trash2 } from "lucide-react";

export default function BotoesPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("variantes");

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar código:', err);
    }
  };

  const buttonVariants = [
    {
      id: "primary",
      name: "Primário",
      description: "Botão principal para ações importantes",
      usage: "Use para ações primárias como salvar, confirmar, enviar",
      code: `<Button>Botão Primário</Button>`,
      examples: [
        { label: "Salvar", code: `<Button>Salvar</Button>` },
        { label: "Confirmar", code: `<Button>Confirmar</Button>` },
        { label: "Enviar", code: `<Button>Enviar</Button>` },
      ]
    },
    {
      id: "secondary",
      name: "Secundário",
      description: "Botão secundário para ações menos importantes",
      usage: "Use para ações secundárias como cancelar, voltar, adicionar",
      code: `<Button variant="secondary">Botão Secundário</Button>`,
      examples: [
        { label: "Cancelar", code: `<Button variant="secondary">Cancelar</Button>` },
        { label: "Voltar", code: `<Button variant="secondary">Voltar</Button>` },
        { label: "Adicionar", code: `<Button variant="secondary">Adicionar</Button>` },
      ]
    },
    {
      id: "outline",
      name: "Outline",
      description: "Botão com borda para ações alternativas",
      usage: "Use para ações alternativas, seleções ou quando precisa de destaque sem ser primário",
      code: `<Button variant="outline">Botão Outline</Button>`,
      examples: [
        { label: "NF-e", code: `<Button variant="outline">NF-e</Button>` },
        { label: "NFC-e", code: `<Button variant="outline">NFC-e</Button>` },
        { label: "CT-e", code: `<Button variant="outline">CT-e</Button>` },
      ]
    },
    {
      id: "ghost",
      name: "Ghost",
      description: "Botão transparente para ações discretas",
      usage: "Use para ações menos visíveis como editar, excluir, configurações",
      code: `<Button variant="ghost">Botão Ghost</Button>`,
      examples: [
        { label: "Editar", code: `<Button variant="ghost">Editar</Button>` },
        { label: "Excluir", code: `<Button variant="ghost">Excluir</Button>` },
        { label: "Configurações", code: `<Button variant="ghost">Configurações</Button>` },
      ]
    },
    {
      id: "destructive",
      name: "Destrutivo",
      description: "Botão para ações perigosas ou irreversíveis",
      usage: "Use para ações que podem causar perda de dados como excluir, remover, apagar",
      code: `<Button variant="destructive">Botão Destrutivo</Button>`,
      examples: [
        { label: "Excluir", code: `<Button variant="destructive">Excluir</Button>` },
        { label: "Remover", code: `<Button variant="destructive">Remover</Button>` },
        { label: "Apagar", code: `<Button variant="destructive">Apagar</Button>` },
      ]
    },
    {
      id: "link",
      name: "Link",
      description: "Botão estilizado como link para navegação",
      usage: "Use para navegação, links externos ou ações que redirecionam o usuário",
      code: `<Button variant="link">Botão Link</Button>`,
      examples: [
        { label: "Ver mais", code: `<Button variant="link">Ver mais</Button>` },
        { label: "Saiba mais", code: `<Button variant="link">Saiba mais</Button>` },
        { label: "Acessar", code: `<Button variant="link">Acessar</Button>` },
      ]
    }
  ];

  const buttonSizes = [
    { id: "sm", name: "Pequeno", code: `<Button size="sm">Pequeno</Button>` },
    { id: "default", name: "Padrão", code: `<Button>Padrão</Button>` },
    { id: "lg", name: "Grande", code: `<Button size="lg">Grande</Button>` },
  ];

  const buttonStates = [
    { id: "normal", name: "Normal", code: `<Button>Normal</Button>` },
    { id: "hover", name: "Hover", code: `<Button className="hover:opacity-95">Hover</Button>` },
    { id: "active", name: "Ativo", code: `<Button className="active:scale-95">Ativo</Button>` },
    { id: "disabled", name: "Desabilitado", code: `<Button disabled>Desabilitado</Button>` },
  ];

  const iconButtonExamples = [
    { icon: Download, label: "Download", code: `<Button><Download className="w-4 h-4" /></Button>` },
    { icon: Plus, label: "Adicionar", code: `<Button><Plus className="w-4 h-4" /></Button>` },
    { icon: Settings, label: "Configurações", code: `<Button><Settings className="w-4 h-4" /></Button>` },
    { icon: Trash2, label: "Excluir", code: `<Button variant="ghost"><Trash2 className="w-4 h-4" /></Button>` },
  ];

  const tabs = [
    { id: "variantes", label: "Variantes" },
    { id: "tamanhos", label: "Tamanhos" },
    { id: "estados", label: "Estados" },
    { id: "icones", label: "Com Ícones" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "variantes":
        return (
          <div className="space-y-8">
            {buttonVariants.map((variant) => (
              <Card key={variant.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{variant.name}</CardTitle>
                      <p className="text-sm text-[#71717c] mt-1">{variant.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(variant.code, variant.id)}
                    >
                      {copiedCode === variant.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Quando usar:</h4>
                    <p className="text-sm text-[#71717c]">{variant.usage}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-3">Exemplos:</h4>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {variant.examples.map((example, index) => (
                        <Button
                          key={index}
                          variant={variant.id === "primary" ? "default" : variant.id as any}
                        >
                          {example.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Código:</h4>
                    <pre className="bg-[#0b0c0f] text-white p-3 rounded-lg text-xs overflow-x-auto">
                      <code>{variant.code}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case "tamanhos":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tamanhos dos Botões</CardTitle>
              <p className="text-sm text-[#71717c] mt-1">
                Diferentes tamanhos para diferentes contextos de uso
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                {buttonSizes.map((size) => (
                  <div key={size.id} className="flex flex-col items-center gap-2">
                    <Button size={size.id as any}>{size.name}</Button>
                    <pre className="text-xs text-[#71717c] bg-gray-100 px-2 py-1 rounded">
                      {size.code}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case "estados":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Estados dos Botões</CardTitle>
              <p className="text-sm text-[#71717c] mt-1">
                Como os botões se comportam em diferentes interações
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {buttonStates.map((state) => (
                  <div key={state.id} className="flex flex-col items-center gap-2">
                    <Button 
                      variant="default"
                      disabled={state.id === "disabled"}
                      className={state.id === "hover" ? "hover:opacity-95" : ""}
                    >
                      {state.name}
                    </Button>
                    <span className="text-xs text-[#71717c]">{state.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case "icones":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Botões com Ícones</CardTitle>
              <p className="text-sm text-[#71717c] mt-1">
                Botões que incluem ícones para melhor comunicação visual
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {iconButtonExamples.map((example, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <Button variant={index === 3 ? "ghost" : "default"}>
                      <example.icon className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-[#71717c]">{example.label}</span>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-3">Exemplo de código:</h4>
                <pre className="bg-[#0b0c0f] text-white p-3 rounded-lg text-xs overflow-x-auto">
                  <code>{`<Button>
  <Download className="w-4 h-4" />
</Button>`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="container max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Botões</h1>
          <p className="text-sm text-[#71717c] mt-1">
            Os botões são elementos fundamentais para ações do usuário. Eles devem ser usados de forma consistente 
            para guiar o usuário através das principais ações da interface.
          </p>
        </header>

        <Tabs 
          tabs={tabs} 
          value={activeTab}
          onValueChange={setActiveTab}
        />
        
        <div className="mt-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
