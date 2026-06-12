"use client";

import * as React from "react";
import { Dialog, DialogPortal, DialogOverlay, DialogClose } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { X, Download, FileText, Eye, CheckSquare, ChevronLeft, ChevronRight, ChevronDown, Tag, Printer, Mail } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { NFe } from "../../types";
import { NFStatusTag } from "../NFStatusTag";
import { formatCurrency, formatCNPJ, formatChaveAcesso, formatCFOPList } from "../../utils/formatters";
import { downloadXML } from "../../utils/nfe-helpers";
import { toast } from "sonner";
import { CopyableNumber } from "@/components/ui/copyable-number";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme/useTheme";

interface NFeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nfe: NFe | null;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function NFeModal({ 
  open, 
  onOpenChange, 
  nfe, 
  onPrevious, 
  onNext, 
  hasPrevious = false, 
  hasNext = false 
}: NFeModalProps) {
  const { tagModel } = useTheme();
  const isCompact = tagModel === 'compact';
  const [openManifestacao, setOpenManifestacao] = React.useState(false);

  // Helper para classes de tag baseado no tema
  const getTagClasses = (bgColor: string, textColor: string, borderColor: string) => {
    return cn(
      isCompact
        ? 'inline-flex items-center h-5 py-[2px] px-2 rounded font-bold leading-4 text-xs'
        : 'inline-flex items-center h-6 px-2 rounded-full border font-medium text-xs',
      bgColor,
      textColor,
      !isCompact && borderColor
    );
  };
  const [openEtiquetas, setOpenEtiquetas] = React.useState(false);
  const [openBaixar, setOpenBaixar] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState('nota-completa');
  const [currentSection, setCurrentSection] = React.useState('nfe');
  const [expandedProducts, setExpandedProducts] = React.useState<Set<number>>(new Set([2])); // Produto 2 expandido por padrão
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  const toggleProduct = (productId: number) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };
  
  const tabs = [
    { id: 'danfe', label: 'DANFE' },
    { id: 'nota-completa', label: 'Nota completa' },
    { id: 'historico', label: 'Histórico de eventos' },
  ];

  const sections = React.useMemo(() => [
    { id: 'nfe', label: 'NF-e' },
    { id: 'emitente', label: 'Emitente' },
    { id: 'destinatario', label: 'Destinatário' },
    { id: 'produtos', label: 'Produtos/serviços' },
    { id: 'totais', label: 'Totais' },
    { id: 'transporte', label: 'Transporte' },
    { id: 'cobranca', label: 'Cobrança' },
    { id: 'info-adicionais', label: 'Info. Adicionais' },
    { id: 'exportacao', label: 'Exportação' },
    { id: 'compras', label: 'Compras' },
    { id: 'pagamentos', label: 'Pagamentos' },
  ], []);

  // Scroll spy para detectar seção ativa
  React.useEffect(() => {
    if (currentTab !== 'nota-completa') return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let rafId: number | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let lastScrollTop = container.scrollTop;

    const updateActiveSection = () => {
      
      const containerRect = container.getBoundingClientRect();
      const triggerPoint = containerRect.top + 150;
      
      let currentActive = sections[0].id;
      
      sections.forEach((section) => {
        const element = document.getElementById(`section-${section.id}`);
        if (element) {
          const elementRect = element.getBoundingClientRect();
          
          if (elementRect.top <= triggerPoint) {
            currentActive = section.id;
          }
        }
      });
      
      setCurrentSection(currentActive);
    };

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(updateActiveSection);
    };

    // Polling como fallback caso o evento de scroll não dispare
    pollInterval = setInterval(() => {
      const currentScrollTop = container.scrollTop;
      if (currentScrollTop !== lastScrollTop) {
        lastScrollTop = currentScrollTop;
        handleScroll();
      }
    }, 100);

    // Executar imediatamente após um pequeno delay para garantir que o DOM está pronto
    const initTimer = setTimeout(() => {
      lastScrollTop = container.scrollTop;
      updateActiveSection();
      
      // Adiciona listener de scroll
      container.addEventListener('scroll', handleScroll, { passive: true });
    }, 50);
    
    return () => {
      clearTimeout(initTimer);
      if (pollInterval) clearInterval(pollInterval);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      container.removeEventListener('scroll', handleScroll);
    };
  }, [currentTab, sections]);

  // Função para scroll suave até a seção
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    const container = scrollContainerRef.current;
    
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      // Calcula o scroll para posicionar a seção 150px do topo
      const targetScroll = scrollTop + elementRect.top - containerRect.top - 150;
      
      // Atualiza o estado imediatamente para feedback instantâneo
      setCurrentSection(sectionId);
      
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };
  
  if (!nfe) return null;

  const handleDownloadXML = () => {
    downloadXML(nfe);
    toast.success('Download do XML iniciado');
  };

  const handleDownloadPDF = () => {
    toast.info('Download do PDF em desenvolvimento');
  };

  const handleViewDANFE = () => {
    toast.info('Visualização do DANFE em desenvolvimento');
  };

  const handleManifestar = () => {
    toast.info('Manifestação em desenvolvimento');
  };

  const handleManifestarCiencia = () => {
    toast.success('Ciência da operação registrada');
    setOpenManifestacao(false);
  };

  const handleManifestarConfirmacao = () => {
    toast.success('Confirmação da operação registrada');
    setOpenManifestacao(false);
  };

  const handleManifestarDesconhecimento = () => {
    toast.warning('Desconhecimento da operação registrado');
    setOpenManifestacao(false);
  };

  const handleManifestarNaoRealizada = () => {
    toast.warning('Operação não realizada registrada');
    setOpenManifestacao(false);
  };

  const handleGerarEtiquetas = () => {
    toast.info('Geração de etiquetas em desenvolvimento');
    setOpenEtiquetas(false);
  };

  const handleImprimir = () => {
    toast.info('Impressão em desenvolvimento');
  };

  const handleEnviarEmail = () => {
    toast.info('Envio por email em desenvolvimento');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-[99999] bg-white overflow-hidden flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "rounded-tl-xl rounded-tr-xl shadow-2xl"
          )}
          style={{
            top: "24px",
            left: "24px",
            right: "24px",
            bottom: "0",
            width: "calc(100vw - 48px)",
            height: "calc(100vh - 24px)",
          }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
            <DialogPrimitive.Title className="text-lg font-bold text-[#0d0f1c]">
              NF-e nº {nfe.numero}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Detalhes completos da nota fiscal eletrônica número {nfe.numero}
            </DialogPrimitive.Description>
            <div className="flex items-center gap-2">
              {/* Ações */}
              {nfe.lancadoEm === 'recebidas' && (
                <DropdownMenu 
                  modal={false} 
                  open={openManifestacao} 
                  onOpenChange={setOpenManifestacao}
                >
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Manifestar
                      <ChevronDown className={`h-4 w-4 transition-transform ${openManifestacao ? "rotate-180" : ""}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={handleManifestarCiencia}>
                      Ciência da Operação
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleManifestarConfirmacao}>
                      Confirmação da Operação
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleManifestarDesconhecimento}>
                      Desconhecimento da Operação
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleManifestarNaoRealizada}>
                      Operação não Realizada
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <DropdownMenu 
                modal={false} 
                open={openEtiquetas} 
                onOpenChange={setOpenEtiquetas}
              >
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]"
                  >
                    <Tag className="h-4 w-4" />
                    Etiquetas
                    <ChevronDown className={`h-4 w-4 transition-transform ${openEtiquetas ? "rotate-180" : ""}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleGerarEtiquetas}>
                    Gerar etiquetas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="sm" 
                className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2]"
                onClick={handleImprimir}
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2]"
                onClick={handleEnviarEmail}
              >
                <Mail className="h-4 w-4" />
                Enviar por email
              </Button>

              <DropdownMenu 
                modal={false} 
                open={openBaixar} 
                onOpenChange={setOpenBaixar}
              >
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]"
                  >
                    <Download className="h-4 w-4" />
                    Baixar
                    <ChevronDown className={`h-4 w-4 transition-transform ${openBaixar ? "rotate-180" : ""}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleDownloadXML}>
                    Download XML
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadPDF}>
                    Download PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Divider */}
              <div className="h-6 w-px bg-border mx-1" />

              {/* Navegação */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={onPrevious}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={onNext}
                disabled={!hasNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border px-6">
            <Tabs 
              tabs={tabs} 
              value={currentTab} 
              onValueChange={setCurrentTab}
              variant="product"
            />
          </div>

          {/* Content - Scrollable */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 pb-4">
            {currentTab === 'danfe' && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-3">
                  <Eye className="h-12 w-12 text-[#71717c] mx-auto" />
                  <div>
                    <h3 className="text-lg font-bold text-[#0d0f1c]">DANFE</h3>
                    <p className="text-sm text-[#5F6572] mt-1">Visualização do DANFE em desenvolvimento</p>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'historico' && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-3">
                  <FileText className="h-12 w-12 text-[#71717c] mx-auto" />
                  <div>
                    <h3 className="text-lg font-bold text-[#0d0f1c] flex items-center justify-center gap-2">
                      Histórico de eventos
                      <span className={getTagClasses('bg-blue-50', 'text-blue-700', 'border-blue-200')}>
                        Em breve
                      </span>
                    </h3>
                    <p className="text-sm text-[#5F6572] mt-1">Histórico completo dos eventos da NF-e</p>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'nota-completa' && (
              <div className="relative">
                {/* Navegação de seções - Sticky */}
                <div className="sticky top-0 z-20 bg-white border-b border-border -mx-6 px-6">
                  <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide py-2">
                    <Tabs 
                      tabs={sections} 
                      value={currentSection} 
                      onValueChange={scrollToSection}
                      variant="default"
                      className="min-w-max"
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Seção NF-e */}
                  <div id="section-nfe" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">NF-e</h2>
                    
                    {/* Principais */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Principais</h3>
                </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Modelo</p>
                </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.modelo || '55'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Série</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.serie}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Número</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.numero}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Data de emissão</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.dataEmissao}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Data Saída/Entrada</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.dataSaida || '—'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Valor Total</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{formatCurrency(nfe.valor)}</p>
                          </div>
                        </div>
                      </div>
                </div>
                
                    {/* Emitente */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Emitente</h3>
                  </div>
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Nome / Razão Social</p>
                  </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.emitente.razaoSocial}</p>
                  </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CNPJ</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">{formatCNPJ(nfe.emitente.cnpj)}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Inscrição Estadual</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">{nfe.emitente.inscricaoEstadual || '—'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">UF</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.emitente.uf || '—'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Tipo de emissão</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">1 - Emissão normal (não em contingência)</p>
                          </div>
                        </div>
                  </div>
                </div>

                    {/* Destinatário */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Destinatário</h3>
                      </div>
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Nome / Razão Social</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.destinatario.razaoSocial}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CNPJ</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">{formatCNPJ(nfe.destinatario.cnpjCpf)}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Inscrição Estadual</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">{nfe.destinatario.inscricaoEstadual || '—'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">UF</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.destinatario.uf || '—'}</p>
                          </div>
                        </div>
                      </div>
                </div>

                    {/* Detalhes da operação */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Detalhes da operação</h3>
                      </div>
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Natureza da operação</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.naturezaOperacao}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Tipo da operação</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.tipo === 'Saída' ? '1 - Saída' : '0 - Entrada'}</p>
                          </div>
                        </div>
                </div>
              </div>

                    {/* Autorização de uso */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Autorização de uso</h3>
                  </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Digest Value da NF-e</p>
                    </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">—</p>
                    </div>
                  </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Protocolo</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">{nfe.protocolo || '—'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Data/Hora</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.dataAutorizacao || '—'}</p>
                          </div>
                        </div>
                      </div>
                </div>
              </div>

                  {/* Seção Emitente */}
                  <div id="section-emitente" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Emitente</h2>
                    
                    {/* Dados */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Dados</h3>
                  </div>
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Nome / Razão Social</p>
                  </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.emitente.razaoSocial}</p>
                    </div>
                      </div>
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Nome Fantasia</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.emitente.nomeFantasia || '—'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CNPJ</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">{formatCNPJ(nfe.emitente.cnpj)}</p>
                          </div>
                  </div>
                </div>
              </div>

                    {/* Endereço */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Endereço</h3>
                  </div>
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Endereço</p>
                  </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.emitente.endereco || 'Av. das Indústrias, 1000'}</p>
                      </div>
                    </div>
                    </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Bairro / Distrito</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">Distrito Industrial</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CEP</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">01000-000</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Município</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.emitente.municipio || '421602 - São Jose'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Fone / Fax</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.emitente.telefone || '(48) 4009-2000'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">UF</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.emitente.uf || 'SC'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">País</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">1058 - Brasil</p>
                          </div>
                </div>
              </div>
                  </div>

                    {/* Dados Complementares */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Dados Complementares</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Inscrição Estadual</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">{nfe.emitente.inscricaoEstadual || '112.223.334.115'}</p>
                          </div>
                            </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">IE Substituto</p>
                        </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Inscrição Municipal</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">903877</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Município ICMS</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">421334</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CNAE Fiscal</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Cod. Regime Tributário</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                      </div>
                  </div>

                  {/* Seção Destinatário */}
                  <div id="section-destinatario" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Destinatário</h2>
                    
                    {/* Dados */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Dados</h3>
                        </div>
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Nome / Razão Social</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.destinatario.razaoSocial}</p>
                            </div>
                        </div>
                          </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CNPJ</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">{formatCNPJ(nfe.destinatario.cnpjCpf)}</p>
                          </div>
                        </div>
                      </div>
                  </div>

                    {/* Endereço */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Endereço</h3>
                        </div>
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Endereço</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.destinatario.endereco || 'Rua das Acácias, 123'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Bairro / Distrito</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">Rua do Comércio, 250</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CEP</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">09000-000</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Município</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.destinatario.municipio || '118732 - Santo Andre'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Fone / Fax</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">(11) 5000-2200</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">UF</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">{nfe.destinatario.uf || 'SP'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">País</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">Brasil</p>
                          </div>
                      </div>
                    </div>
                  </div>

                    {/* Dados Complementares */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Dados Complementares</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Inscrição Estadual</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">{nfe.destinatario.inscricaoEstadual || '223.334.445.556'}</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Inscrição SUFRAMA</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">1</p>
                          </div>
                        </div>
                      </div>
                      </div>
                  </div>

                  {/* Seção Produtos/serviços */}
                  <div id="section-produtos" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Produtos/Serviços</h2>
                    
                    {/* Produto 1 - Fechado */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div 
                        className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-4 py-3 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleProduct(1)}
                      >
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">1 - Parafuso sextavado 10mm (100un)</h3>
                        <div className="flex items-center gap-2">
                  <Button
                            variant="ghost" 
                    size="sm"
                            className="inline-flex items-center gap-2 font-bold text-white bg-[#0066ff] hover:bg-[#0052cc] shadow-none h-8 px-3 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Ação de manifestar
                            }}
                          >
                            <CheckSquare className="h-4 w-4" />
                            Manifestar item
                  </Button>
                          <ChevronDown className={`h-5 w-5 text-[#71717c] transition-transform ${expandedProducts.has(1) ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                </div>

                    {/* Produto 2 - Expandido */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div 
                        className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-4 py-3 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleProduct(2)}
                      >
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">2 - Motor elétrico 1,5HP</h3>
                        <div className="flex items-center gap-2">
                  <Button
                            variant="ghost" 
                    size="sm"
                            className="inline-flex items-center gap-2 font-bold text-white bg-[#0066ff] hover:bg-[#0052cc] shadow-none h-8 px-3 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Ação de manifestar
                            }}
                          >
                            <CheckSquare className="h-4 w-4" />
                            Manifestar item
                  </Button>
                          <ChevronDown className={`h-5 w-5 text-[#71717c] transition-transform ${expandedProducts.has(2) ? 'rotate-180' : ''}`} />
                        </div>
              </div>

                      {/* Conteúdo expandido */}
                      {expandedProducts.has(2) && (
                      <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Descrição</p>
                  </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">Motor elétrico 1,5HP</p>
                  </div>
                  </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Cód. Produto</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">0001</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Qtd. Comercial</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">20.000</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Un. Comercial</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">UN</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Bruto</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">510</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Cód. NCM</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">31835.00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Cód. EX da TIPI</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">01</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Outras despesas</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 0,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CFOP</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">5.102</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CEST</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">0102500</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Frete</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 15,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Seguro</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 0,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Desconto</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 10,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Seguro</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">1 - Valor do item (vProd) compoe o valor total da NFe (vProd)</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Cód. EAN comercial</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">SEM GTIN</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Un. Comercial</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">UN</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Qtd. Comercial</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">20.000</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Cód. EAN tributável</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">-</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Un. Tributável</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 25,50</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Qtd. Tributável</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 25,50</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Un. de com.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">-</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Un. de trib.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">-</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. aprox. de trib.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 4,50</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Nº ped. de com.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">2025-4587</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Item ped. de com.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">3983</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Nº FCI</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">BR-00001-ACME</p>
                          </div>
                  </div>
                </div>

                      {/* ICMS Normal e ST */}
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">ICMS Normal e ST</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Origem da mercadoria</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">1 - Nacional</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Tributação do ICMS</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">00 — Tributada integralmente</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Mod. da BC do ICMS</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">3 — Valor da operação</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Aliq. ICMS Normal</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">12%</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. ICMS Normal</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 61,20</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">BC. ICMS Normal</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 510,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">% Red. BC ICMS Normal</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">5%</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Motivo Deson. ICMS</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">Incentivo Fiscal</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">% MVA ICMS ST</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">30%</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. BC ICMS ST retido</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 153,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. ICMS ST retido</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 18,36</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. BC FCP</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 510,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">% FCP</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">2%</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. FCP</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 10,20</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">% FCP retido ST</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">2%</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. FCP retido ST</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 3,08</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">% BC FCP ret. ant. ST</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 0,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. BC FCP ret. ant. ST</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">0%</p>
                          </div>
                        </div>
                </div>

                      {/* Imposto sobre produtos industrializados */}
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Imposto sobre produtos industrializados</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Cód. enquadramento</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">301</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Cód. Selo</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">S-9999</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CNPJ do produtor</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">22.333.444/0001-56</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Qtd. total un. padrão</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">1</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CST</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">50</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Qtd. total un. padrão</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">20.000</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. por unidade</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 0,02255</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Alíquota</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">2,5%</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. IPI</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 12,75</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Base de cálculo</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 510,00</p>
                          </div>
                </div>
              </div>

                      {/* PIS */}
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">PIS</h3>
                  </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CST</p>
                    </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">01</p>
                    </div>
                  </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Base de cálculo</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 510,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Alíquota</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">0,65%</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Valor</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 3,32</p>
                          </div>
                </div>
              </div>

                      {/* COFINS */}
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">COFINS</h3>
                  </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CST</p>
                  </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">01</p>
                    </div>
                      </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Base de cálculo</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 510,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Alíquota</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">3%</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Valor</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 15,30</p>
                          </div>
                        </div>
                      </div>
                      </>
                      )}
                    </div>
                  </div>

                  {/* Seção Totais */}
                  <div id="section-totais" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Totais</h2>
                    
                    {/* ICMS */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">ICMS</h3>
                  </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">BC ICMS</p>
                  </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">7.590,00</p>
                      </div>
                    </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. ICMS</p>
                    </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">1.366,20</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. ICMS Deson.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">0,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">BC ICMS ST</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. ICMS substituição</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                  </div>
                </div>
              </div>

                    {/* FCP */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">FCP</h3>
                  </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. FCP Tot.</p>
                  </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">45,00</p>
                      </div>
                    </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. FCP ST</p>
                    </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. FCP Ret. ST</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                </div>
              </div>
                  </div>

                    {/* Transporte */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Transporte</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Frete</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">45,00</p>
                          </div>
                            </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Seguro</p>
                        </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">30,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Outras despesas</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">50,00</p>
                          </div>
                        </div>
                      </div>
                  </div>

                    {/* IPI */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">IPI</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. IPI</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">250,00</p>
                            </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. IPI Devolvido</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                      </div>
                      </div>
                  </div>

                    {/* Outros impostos */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Outros impostos</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. PIS</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">60,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. COFINS</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">275,00</p>
                          </div>
                      </div>
                    </div>
                  </div>

                    {/* Totais */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Totais</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Total NF-e</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">7.865,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Total Prod.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">7.590,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Trib. Aprox.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">2.071,00</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Total Desc.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Impos. de Import.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                      </div>
                  </div>

                  {/* Seção Transporte */}
                  <div id="section-transporte" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Transporte</h2>
                    
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="grid grid-cols-1">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Mod. do frete</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">0 – Por conta do emitente</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transportador */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Transportador</h3>
                      </div>
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Nome / Razão Social</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">Rápido Sul Transportes Ltda</p>
                          </div>
                        </div>
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Endereço completo</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">Rod. Anhanguera, Km 104 – Campinas/SP</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Município</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">Campinas</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Inscrição Estadual</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">115.334.229.117</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">CNPJ</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] font-mono truncate">34.678.912/0001-55</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Veículo */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Veículo</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Placa</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">FGH-3E45</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">UF</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">SP</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">RNTC</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">2045789</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Volume</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Quantidade</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">1</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Espécie</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">Volumes</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Marca dos volumes</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Numeração</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Peso líquido</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Peso Bruto</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção Cobrança */}
                  <div id="section-cobranca" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Cobrança</h2>
                    
                    {/* Fatura */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Fatura</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Número</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">5.224,99</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Original</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">5.224,99</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Desconto</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">5.224,99</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vlr. Líquido</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">12/08/2025</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Duplicata */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Duplicata</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Número</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Vencimento</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-36 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Valor</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção Info. Adicionais */}
                  <div id="section-info-adicionais" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Informações Adicionais</h2>
                    
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="grid grid-cols-1">
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Form. Imp. do DANFE</p>
                        </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Interesse do FISCO</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Interesse do Contrib.</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Obs. do Contribuinte</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex min-h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Obs. do FISCO</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documentos fiscais referenciados */}
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Documentos fiscais referenciados</h3>
                      </div>
                      <div className="grid grid-cols-1">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Chave de Acesso</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção Exportação */}
                  <div id="section-exportacao" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Exportação</h2>
                    
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Onde ocorrerá o embarque dos produtos</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">UF</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Local</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção Compras */}
                  <div id="section-compras" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Compras</h2>
                    
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Dados de compra</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Nota de empenho</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Inf. do pedido</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Inf. do contrato</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção Pagamentos */}
                  <div id="section-pagamentos" className="space-y-4">
                    <h2 className="text-lg font-bold text-[rgba(4,14,35,0.86)] mb-2">Pagamentos</h2>
                    
                    <div className="border border-[rgba(4,14,35,0.08)] rounded-lg overflow-hidden">
                      <div className="bg-[#eaebec] border-b border-[rgba(4,14,35,0.16)] px-2 py-2">
                        <h3 className="text-sm font-bold text-[rgba(4,14,35,0.86)]">Dados de pagamento</h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Forma de pagamento</p>
                      </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">03 — Boleto bancário</p>
                    </div>
                  </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Valor do pagamento</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">R$ 3.145,75</p>
                          </div>
                        </div>
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Valor do troco</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1">
                        <div className="flex h-10">
                          <div className="bg-[#f5f5f6] border border-[#dfe0e2] px-2 py-2 w-44 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.64)] truncate">Meio de pagamento</p>
                          </div>
                          <div className="bg-white border border-[#dfe0e2] px-4 py-2 flex-1 flex items-center">
                            <p className="text-sm text-[rgba(4,14,35,0.86)] truncate">—</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Espaçador responsivo para permitir scroll até a última seção */}
                  <div className="h-[calc(100vh-500px)] min-h-[200px] max-h-[600px]" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

