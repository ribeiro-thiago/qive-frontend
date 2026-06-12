"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Download, Copy, Check, ChevronDown, Plus, Settings, Trash2, X, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function DesignSystem() {
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
    { id: "icones", label: "Com Ícones" },
    { id: "modais", label: "Modais" }
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
      
      case "modais":
        return (
          <div className="space-y-8">
            {/* Modal Básico */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Modal Básico</CardTitle>
                    <p className="text-sm text-[#71717c] mt-1">Modal simples com título e botão de fechar</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="rounded-[16px] max-w-[500px]">
    <div className="flex items-center justify-between px-4 py-2">
      <div className="text-[20px] font-bold">Título do Modal</div>
      <DialogClose asChild>
        <Button variant="ghost" size="icon" aria-label="Fechar">
          <X className="h-4 w-4" />
        </Button>
      </DialogClose>
    </div>
    <div className="px-4 pb-4">
      <p className="text-sm text-[#71717c]">Conteúdo do modal aqui.</p>
    </div>
  </DialogContent>
</Dialog>`, "modal-basico")}
                  >
                    {copiedCode === "modal-basico" ? (
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
                  <p className="text-sm text-[#71717c]">Para confirmações simples, avisos ou formulários básicos</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Exemplo:</h4>
                  <div className="border border-border rounded-lg p-4 bg-gray-50">
                    <div className="text-sm text-[#71717c] mb-2">Modal básico com título e botão fechar</div>
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                      <div className="text-[16px] font-bold">Título do Modal</div>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modal com Ícone */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Modal com Ícone</CardTitle>
                    <p className="text-sm text-[#71717c] mt-1">Modal com ícone no título para melhor comunicação visual</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="rounded-[16px] max-w-[500px]">
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-orange-500" />
        <div className="text-[20px] font-bold">Atenção</div>
      </div>
      <DialogClose asChild>
        <Button variant="ghost" size="icon" aria-label="Fechar">
          <X className="h-4 w-4" />
        </Button>
      </DialogClose>
    </div>
    <div className="px-4 pb-4">
      <p className="text-sm text-[#71717c]">Esta ação não pode ser desfeita.</p>
    </div>
  </DialogContent>
</Dialog>`, "modal-icone")}
                  >
                    {copiedCode === "modal-icone" ? (
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
                  <p className="text-sm text-[#71717c]">Para alertas, confirmações importantes ou quando precisa destacar o tipo de ação</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Exemplo:</h4>
                  <div className="border border-border rounded-lg p-4 bg-gray-50">
                    <div className="text-sm text-[#71717c] mb-2">Modal com ícone de alerta</div>
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <div className="text-[16px] font-bold">Atenção</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modal sem Botão Fechar */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Modal sem Botão Fechar</CardTitle>
                    <p className="text-sm text-[#71717c] mt-1">Modal que não pode ser fechado pelo usuário</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent 
    className="rounded-[16px] max-w-[500px]"
    onInteractOutside={(e) => e.preventDefault()}
    onEscapeKeyDown={(e) => e.preventDefault()}
  >
    <div className="px-4 py-2">
      <div className="text-[20px] font-bold">Processando...</div>
    </div>
    <div className="px-4 pb-4">
      <p className="text-sm text-[#71717c]">Por favor, aguarde.</p>
    </div>
  </DialogContent>
</Dialog>`, "modal-sem-fechar")}
                  >
                    {copiedCode === "modal-sem-fechar" ? (
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
                  <p className="text-sm text-[#71717c]">Para processos em andamento, loading states ou quando a ação deve ser completada</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Exemplo:</h4>
                  <div className="border border-border rounded-lg p-4 bg-gray-50">
                    <div className="text-sm text-[#71717c] mb-2">Modal de processamento</div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-[16px] font-bold">Processando...</div>
                      <div className="text-sm text-[#71717c] mt-1">Por favor, aguarde.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modal com 2 Ações */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Modal com 2 Ações</CardTitle>
                    <p className="text-sm text-[#71717c] mt-1">Modal com duas opções de ação no rodapé</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="rounded-[16px] max-w-[500px]">
    <div className="flex items-center justify-between px-4 py-2">
      <div className="text-[20px] font-bold">Confirmar ação</div>
      <DialogClose asChild>
        <Button variant="ghost" size="icon" aria-label="Fechar">
          <X className="h-4 w-4" />
        </Button>
      </DialogClose>
    </div>
    <div className="px-4 pb-4">
      <p className="text-sm text-[#71717c]">Tem certeza que deseja continuar?</p>
    </div>
    <DialogFooter className="px-4 pt-3 pb-6">
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>
        Confirmar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`, "modal-2-acoes")}
                  >
                    {copiedCode === "modal-2-acoes" ? (
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
                  <p className="text-sm text-[#71717c]">Para confirmações, cancelamentos ou quando o usuário tem duas opções claras</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Exemplo:</h4>
                  <div className="border border-border rounded-lg p-4 bg-gray-50">
                    <div className="text-sm text-[#71717c] mb-2">Modal de confirmação</div>
                    <div className="bg-white rounded-lg border">
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="text-[16px] font-bold">Confirmar ação</div>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-[#71717c]">Tem certeza que deseja continuar?</p>
                      </div>
                      <div className="flex gap-2 p-3 pt-0">
                        <Button variant="secondary" size="sm">Cancelar</Button>
                        <Button size="sm">Confirmar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modal com 1 Ação */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Modal com 1 Ação</CardTitle>
                    <p className="text-sm text-[#71717c] mt-1">Modal com uma única ação no rodapé</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="rounded-[16px] max-w-[500px]">
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <div className="text-[20px] font-bold">Sucesso</div>
      </div>
      <DialogClose asChild>
        <Button variant="ghost" size="icon" aria-label="Fechar">
          <X className="h-4 w-4" />
        </Button>
      </DialogClose>
    </div>
    <div className="px-4 pb-4">
      <p className="text-sm text-[#71717c]">Operação realizada com sucesso!</p>
    </div>
    <DialogFooter className="px-4 pt-3 pb-6">
      <Button onClick={() => setOpen(false)} className="w-full">
        Entendi
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`, "modal-1-acao")}
                  >
                    {copiedCode === "modal-1-acao" ? (
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
                  <p className="text-sm text-[#71717c]">Para notificações de sucesso, avisos informativos ou quando há apenas uma ação possível</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Exemplo:</h4>
                  <div className="border border-border rounded-lg p-4 bg-gray-50">
                    <div className="text-sm text-[#71717c] mb-2">Modal de sucesso</div>
                    <div className="bg-white rounded-lg border">
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div className="text-[16px] font-bold">Sucesso</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-[#71717c]">Operação realizada com sucesso!</p>
                      </div>
                      <div className="p-3 pt-0">
                        <Button size="sm" className="w-full">Entendi</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modal com Overflow */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Modal com Overflow e Scroll</CardTitle>
                    <p className="text-sm text-[#71717c] mt-1">Modal com conteúdo extenso e scroll controlado</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="rounded-[16px] max-w-[760px] p-0 max-h-[85vh] overflow-hidden gap-0">
    <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-white border-b">
      <div className="text-[20px] font-bold">Título do Modal</div>
      <DialogClose asChild>
        <Button variant="ghost" size="icon" aria-label="Fechar">
          <X className="h-4 w-4" />
        </Button>
      </DialogClose>
    </div>
    
    <div className="relative flex-1 min-h-0 overflow-hidden">
      {/* Gradientes para indicar scroll */}
      <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent z-10" />
      
      <div className="px-4 pt-2 pb-4 overflow-y-auto flex-1 min-h-0 max-h-[calc(85vh-124px)]">
        {/* Conteúdo extenso aqui */}
      </div>
    </div>

    <DialogFooter className="sticky bottom-0 z-20 px-4 pt-3 pb-6 bg-white border-t">
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleAction}>
        Ação Principal
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`, "modal-overflow")}
                  >
                    {copiedCode === "modal-overflow" ? (
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
                  <p className="text-sm text-[#71717c]">Para conteúdo extenso, listas, formulários longos ou quando precisa de scroll controlado</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Características:</h4>
                  <ul className="text-sm text-[#71717c] space-y-1">
                    <li>• Header e footer fixos (sticky)</li>
                    <li>• Gradientes para indicar scroll disponível</li>
                    <li>• Altura máxima controlada (85vh)</li>
                    <li>• Scroll suave e responsivo</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Exemplo:</h4>
                  <div className="border border-border rounded-lg p-4 bg-gray-50">
                    <div className="text-sm text-[#71717c] mb-2">Modal com scroll (simulação)</div>
                    <div className="bg-white rounded-lg border max-h-64 overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b bg-white sticky top-0">
                        <div className="text-[16px] font-bold">Modal com Scroll</div>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                            Item {i + 1} do conteúdo
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 p-3 pt-0 border-t bg-white">
                        <Button variant="secondary" size="sm">Cancelar</Button>
                        <Button size="sm">Confirmar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="container max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Design System</h1>
          <p className="text-sm text-[#71717c] mt-1">
            Documentação completa dos componentes do Qive Conecta para uma experiência consistente
          </p>
        </header>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#0d0f1c] mb-4">
            {activeTab === "modais" ? "Modais" : "Botões"}
          </h2>
          <p className="text-sm text-[#71717c] mb-6">
            {activeTab === "modais" 
              ? "Os modais são janelas sobrepostas que requerem interação do usuário. Devem ser usados para confirmações, formulários ou informações importantes que precisam de foco total do usuário."
              : "Os botões são elementos fundamentais para ações do usuário. Eles devem ser usados de forma consistente para guiar o usuário através das principais ações da interface."
            }
          </p>
        </div>

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
