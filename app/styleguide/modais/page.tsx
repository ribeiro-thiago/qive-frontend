"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Copy, Check, AlertCircle, CheckCircle } from "lucide-react";
import { ScrollableModal } from "@/components/ui/scrollable-modal";

export default function ModaisPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("variantes");
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar código:', err);
    }
  };

  const openModal = (modalId: string) => {
    setOpenModals(prev => ({ ...prev, [modalId]: true }));
  };

  const closeModal = (modalId: string) => {
    setOpenModals(prev => ({ ...prev, [modalId]: false }));
  };


  const modalVariants = [
    {
      id: "basico",
      name: "Modal Básico",
      description: "Modal simples com título e botão de fechar",
      usage: "Para confirmações simples, avisos ou formulários básicos",
      code: `import { ScrollableModal } from "@/components/ui/scrollable-modal";

<ScrollableModal
  open={open}
  onClose={() => setOpen(false)}
  title="Título do Modal"
  showClose={true}
>
  <p className="text-sm text-[#71717c]">Conteúdo do modal aqui.</p>
</ScrollableModal>`,
      examples: [
        { label: "Confirmação", code: `<Button variant="outline">Abrir Modal</Button>` },
        { label: "Aviso", code: `<Button variant="outline">Abrir Modal</Button>` },
        { label: "Formulário", code: `<Button variant="outline">Abrir Modal</Button>` },
      ]
    },
    {
      id: "icone",
      name: "Modal com Ícone",
      description: "Modal com ícone no título para melhor comunicação visual",
      usage: "Para alertas, confirmações importantes ou quando precisa destacar o tipo de ação",
      code: `import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { AlertCircle } from "lucide-react";

<ScrollableModal
  open={open}
  onClose={() => setOpen(false)}
  title="Atenção"
  icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
  showClose={true}
>
  <p className="text-sm text-[#71717c]">Esta ação não pode ser desfeita.</p>
</ScrollableModal>`,
      examples: [
        { label: "Alerta", code: `<Button variant="outline">Abrir Alerta</Button>` },
        { label: "Sucesso", code: `<Button variant="outline">Abrir Sucesso</Button>` },
        { label: "Erro", code: `<Button variant="outline">Abrir Erro</Button>` },
      ]
    },
    {
      id: "sem-fechar",
      name: "Modal sem Botão Fechar",
      description: "Modal que não pode ser fechado pelo usuário",
      usage: "Para processos em andamento, loading states ou quando a ação deve ser completada",
      code: `import { ScrollableModal } from "@/components/ui/scrollable-modal";

<ScrollableModal
  open={open}
  onClose={() => setOpen(false)}
  title="Processando..."
  showClose={false}
  preventClose={true}
>
  <p className="text-sm text-[#71717c]">Por favor, aguarde.</p>
</ScrollableModal>`,
      examples: [
        { label: "Loading", code: `<Button variant="outline">Abrir Loading</Button>` },
        { label: "Processando", code: `<Button variant="outline">Abrir Processo</Button>` },
        { label: "Obrigatório", code: `<Button variant="outline">Abrir Modal</Button>` },
      ]
    },
    {
      id: "2-acoes",
      name: "Modal com 2 Ações",
      description: "Modal com duas opções de ação no rodapé",
      usage: "Para confirmações, cancelamentos ou quando o usuário tem duas opções claras",
      code: `import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";

<ScrollableModal
  open={open}
  onClose={() => setOpen(false)}
  title="Confirmar ação"
  showClose={true}
  actions={
    <>
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>
        Confirmar
      </Button>
    </>
  }
>
  <p className="text-sm text-[#71717c]">Tem certeza que deseja continuar?</p>
</ScrollableModal>`,
      examples: [
        { label: "Confirmação", code: `<Button variant="outline">Confirmar</Button>` },
        { label: "Escolha", code: `<Button variant="outline">Escolher</Button>` },
        { label: "Cancelar", code: `<Button variant="outline">Cancelar</Button>` },
      ]
    },
    {
      id: "1-acao",
      name: "Modal com 1 Ação",
      description: "Modal com uma única ação no rodapé",
      usage: "Para notificações de sucesso, avisos informativos ou quando há apenas uma ação possível",
      code: `import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

<ScrollableModal
  open={open}
  onClose={() => setOpen(false)}
  title="Sucesso"
  icon={<CheckCircle className="h-5 w-5 text-green-500" />}
  showClose={true}
  actions={
    <Button onClick={() => setOpen(false)} className="w-full">
      Entendi
    </Button>
  }
>
  <p className="text-sm text-[#71717c]">Operação realizada com sucesso!</p>
</ScrollableModal>`,
      examples: [
        { label: "Sucesso", code: `<Button variant="outline">Sucesso</Button>` },
        { label: "Informação", code: `<Button variant="outline">Info</Button>` },
        { label: "Notificação", code: `<Button variant="outline">Notificar</Button>` },
      ]
    },
    {
      id: "overflow",
      name: "Modal com Overflow e Scroll",
      description: "Modal com conteúdo extenso e scroll controlado",
      usage: "Para conteúdo extenso, listas, formulários longos ou quando precisa de scroll controlado",
      code: `import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";

<ScrollableModal
  open={open}
  onClose={() => setOpen(false)}
  title="Título do Modal"
  maxWidth="760px"
  showClose={true}
  actions={
    <>
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleAction}>
        Ação Principal
      </Button>
    </>
  }
>
  {/* Conteúdo extenso aqui */}
  <p className="text-sm text-[#71717c]">
    Conteúdo extenso que automaticamente terá scroll quando necessário.
    O header e footer ficam fixos, e gradientes aparecem dinamicamente
    para indicar que há mais conteúdo para visualizar.
  </p>
</ScrollableModal>`,
      examples: [
        { label: "Lista Longa", code: `<Button variant="outline">Lista</Button>` },
        { label: "Formulário", code: `<Button variant="outline">Formulário</Button>` },
        { label: "Relatório", code: `<Button variant="outline">Relatório</Button>` },
      ]
    }
  ];

  const tabs = [
    { id: "variantes", label: "Variantes" },
    { id: "comportamento", label: "Comportamento" },
    { id: "acessibilidade", label: "Acessibilidade" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "variantes":
        return (
          <div className="space-y-8">
            {modalVariants.map((variant) => (
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
                          variant="outline"
                          onClick={() => openModal(`${variant.id}-${index}`)}
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
      
      case "comportamento":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comportamento dos Modais</CardTitle>
                <p className="text-sm text-[#71717c] mt-1">
                  Como os modais se comportam em diferentes situações
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Fechamento:</h4>
                  <ul className="text-sm text-[#71717c] space-y-1">
                    <li>• Clique no botão X no canto superior direito</li>
                    <li>• Pressione a tecla ESC (se habilitado)</li>
                    <li>• Clique fora do modal (se habilitado)</li>
                    <li>• Botões de ação no rodapé</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Estados:</h4>
                  <ul className="text-sm text-[#71717c] space-y-1">
                    <li>• <strong>Aberto:</strong> Modal visível e interativo</li>
                    <li>• <strong>Fechado:</strong> Modal oculto e não interativo</li>
                    <li>• <strong>Carregando:</strong> Modal com conteúdo sendo carregado</li>
                    <li>• <strong>Bloqueado:</strong> Modal que não pode ser fechado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scroll Automático</CardTitle>
                <p className="text-sm text-[#71717c] mt-1">
                  Todos os modais têm comportamento de scroll automático
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Características Automáticas:</h4>
                  <ul className="text-sm text-[#71717c] space-y-1">
                    <li>• <strong>Header fixo:</strong> Título sempre visível no topo</li>
                    <li>• <strong>Footer fixo:</strong> Botões sempre acessíveis na parte inferior</li>
                    <li>• <strong>Scroll automático:</strong> Ativado quando conteúdo excede altura disponível</li>
                    <li>• <strong>Gradientes dinâmicos:</strong> Indicam quando há mais conteúdo acima/abaixo</li>
                    <li>• <strong>Altura responsiva:</strong> Máximo de 85% da altura da tela</li>
                    <li>• <strong>Detecção inteligente:</strong> Observa mudanças de conteúdo em tempo real</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Vantagens:</h4>
                  <ul className="text-sm text-[#71717c] space-y-1">
                    <li>• Experiência consistente em todos os modais</li>
                    <li>• Interface sempre funcional independente do conteúdo</li>
                    <li>• Navegação intuitiva com indicadores visuais</li>
                    <li>• Adaptação automática a diferentes tamanhos de tela</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "acessibilidade":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Diretrizes de Acessibilidade</CardTitle>
              <p className="text-sm text-[#71717c] mt-1">
                Como tornar os modais acessíveis para todos os usuários
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-sm mb-2">Navegação por Teclado:</h4>
                <ul className="text-sm text-[#71717c] space-y-1">
                  <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">ESC</kbd> para fechar o modal</li>
                  <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> para navegar entre elementos</li>
                  <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift + Tab</kbd> para navegação reversa</li>
                  <li>• Foco deve retornar ao elemento que abriu o modal</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">ARIA Labels:</h4>
                <ul className="text-sm text-[#71717c] space-y-1">
                  <li>• <code>aria-label</code> para botões de fechar</li>
                  <li>• <code>role=&quot;dialog&quot;</code> no container do modal</li>
                  <li>• <code>aria-modal=&quot;true&quot;</code> para indicar modal</li>
                  <li>• <code>aria-describedby</code> para referenciar conteúdo</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Contraste e Legibilidade:</h4>
                <ul className="text-sm text-[#71717c] space-y-1">
                  <li>• Contraste mínimo de 4.5:1 para texto normal</li>
                  <li>• Contraste mínimo de 3:1 para texto grande</li>
                  <li>• Overlay escuro para destacar o modal</li>
                  <li>• Tamanho de fonte legível (mínimo 14px)</li>
                </ul>
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
          <h1 className="text-2xl font-semibold text-[#0d0f1c]">Modais</h1>
          <p className="text-sm text-[#71717c] mt-1">
            Os modais são janelas sobrepostas que requerem interação do usuário. Devem ser usados para confirmações, 
            formulários ou informações importantes que precisam de foco total do usuário.
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

      {/* Modais Funcionais com Scroll Automático */}
      {modalVariants.map((variant, variantIndex) => (
        variant.examples.map((example, exampleIndex) => {
          const modalId = `${variant.id}-${exampleIndex}`;
          
          // Definir título e conteúdo baseado no tipo de modal
          const getModalConfig = () => {
            switch (variant.id) {
              case "icone":
                return {
                  title: "Atenção",
                  icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
                  content: "Esta ação não pode ser desfeita. Tem certeza que deseja continuar? Este é um exemplo de modal com conteúdo que pode ser extenso e precisar de scroll automático quando necessário.",
                  showClose: true,
                  actions: null,
                  children: null
                };
              case "sem-fechar":
                return {
                  title: "Processando...",
                  icon: null,
                  content: "Por favor, aguarde enquanto processamos sua solicitação. Este processo pode levar alguns minutos e não deve ser interrompido.",
                  showClose: false,
                  preventClose: true,
                  actions: null,
                  children: null
                };
              case "2-acoes":
                return {
                  title: "Confirmar ação",
                  icon: null,
                  content: "Tem certeza que deseja continuar? Esta ação irá modificar dados importantes e não poderá ser desfeita facilmente. Por favor, revise todas as informações antes de confirmar.",
                  showClose: true,
                  actions: (
                    <>
                      <Button variant="secondary" onClick={() => closeModal(modalId)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => closeModal(modalId)}>
                        Confirmar
                      </Button>
                    </>
                  ),
                  children: null
                };
              case "1-acao":
                return {
                  title: "Sucesso",
                  icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                  content: "Operação realizada com sucesso! Todos os dados foram processados corretamente e as alterações foram aplicadas. Você pode continuar com suas atividades normalmente.",
                  showClose: true,
                  actions: (
                    <Button onClick={() => closeModal(modalId)}>
                      Entendi
                    </Button>
                  ),
                  children: null
                };
              case "overflow":
                return {
                  title: "Modal com Conteúdo Extenso",
                  icon: null,
                  content: "Este modal demonstra como o scroll funciona automaticamente com conteúdo extenso. Quando o conteúdo excede a altura disponível, o header e footer ficam fixos e apenas a área central faz scroll.",
                  showClose: true,
                  actions: (
                    <>
                      <Button variant="secondary" onClick={() => closeModal(modalId)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => closeModal(modalId)}>
                        Continuar
                      </Button>
                    </>
                  ),
                  children: (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm text-[#71717c]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                      <p className="text-sm text-[#71717c]">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                      </p>
                      <p className="text-sm text-[#71717c]">
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                      </p>
                      <p className="text-sm text-[#71717c]">
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                      </p>
                      <p className="text-sm text-[#71717c]">
                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
                      </p>
                      <p className="text-sm text-[#71717c]">
                        Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
                      </p>
                      <p className="text-sm text-[#71717c]">
                        Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
                      </p>
                      <p className="text-sm text-[#71717c]">
                        On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue.
                      </p>
                      <p className="text-sm text-[#71717c]">
                        Equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish.
                      </p>
                      <p className="text-sm text-[#71717c]">
                        In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided.
                      </p>
                    </div>
                  )
                };
              default:
                return {
                  title: "Título do Modal",
                  icon: null,
                  content: "Conteúdo do modal aqui. Este é um exemplo básico de modal com scroll automático quando necessário.",
                  showClose: true,
                  actions: null,
                  children: null
                };
            }
          };

          const config = getModalConfig();
          
          return (
            <ScrollableModal
              key={modalId}
              open={openModals[modalId] || false}
              onClose={() => closeModal(modalId)}
              title={config.title}
              icon={config.icon}
              showClose={config.showClose}
              actions={config.actions}
              preventClose={config.preventClose}
            >
              <p className="text-sm text-[#71717c]">{config.content}</p>
              {config.children}
            </ScrollableModal>
          );
        })
      ))}
    </div>
  );
}
