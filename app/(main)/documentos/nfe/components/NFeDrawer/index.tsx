"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { X, Download, FileText, Eye, CheckSquare, ChevronDown, Tag, Printer, Mail } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { NFe } from "../../types";
import { NFStatusTag } from "../NFStatusTag";
import { formatCurrency, formatCNPJ, formatChaveAcesso, formatCFOPList } from "../../utils/formatters";
import { downloadXML } from "../../utils/nfe-helpers";
import { toast } from "sonner";
import { CopyableNumber } from "@/components/ui/copyable-number";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme/useTheme";

interface NFeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nfe: NFe | null;
}

export function NFeDrawer({ open, onOpenChange, nfe }: NFeDrawerProps) {
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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
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
    const container = scrollContainerRef.current;
    if (!container || currentTab !== 'nota-completa') return;

    const handleScroll = () => {
      // Scroll spy: encontrar seção visível
      const containerTop = container.getBoundingClientRect().top;
      const offset = 150; // Offset para considerar a navegação sticky
      
      console.log('🔍 [Drawer] Scroll spy running...', { scrollTop: container.scrollTop });
      
      // Itera de trás para frente para pegar a primeira seção que passou do offset
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(`drawer-section-${sections[i].id}`);
        if (element) {
          const elementTop = element.getBoundingClientRect().top;
          const relativePosition = elementTop - containerTop;
          
          console.log(`  Section ${sections[i].id}: relativePosition=${relativePosition.toFixed(0)}px`);
          
          // Se o topo da seção está acima ou próximo do ponto de referência
          if (elementTop <= containerTop + offset) {
            console.log(`  ✅ Selected: ${sections[i].id}`);
            setCurrentSection(sections[i].id);
            return;
          }
        }
      }
      
      // Se nenhuma seção passou do offset, seleciona a primeira
      console.log('  ✅ Selected (default): nfe');
      setCurrentSection(sections[0].id);
    };

    // Executar imediatamente para definir seção inicial
    console.log('🚀 [Drawer] Inicializando scroll spy...');
    handleScroll();

    container.addEventListener('scroll', handleScroll, { passive: true });
    console.log('👂 [Drawer] Listener de scroll adicionado');
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      console.log('🗑️ [Drawer] Listener de scroll removido');
    };
  }, [currentTab, sections]);

  // Função para scroll suave até a seção
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`drawer-section-${sectionId}`);
    const container = scrollContainerRef.current;
    
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const targetScroll = scrollTop + elementRect.top - containerRect.top - 80;
      
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        ref={scrollContainerRef}
        className="w-[480px] sm:w-[540px] p-0 overflow-y-auto" 
        data-sheet
      >
        <SheetTitle className="sr-only">Detalhes da NF-e número {nfe.numero}</SheetTitle>
        <SheetDescription className="sr-only">
          Informações completas da nota fiscal eletrônica incluindo emitente, destinatário, valores e dados fiscais
        </SheetDescription>
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-[#0d0f1c]">Detalhes da NF-e</h2>
              <p className="text-sm text-[#5F6572] mt-0.5">Número {nfe.numero}</p>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          
          {/* Ações */}
          <div className="flex flex-wrap items-center gap-2">
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

        {/* Content */}
        <div className="px-6 pb-4">
          {currentTab === 'danfe' && (
            <div className="flex items-center justify-center min-h-[400px]">
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
            <div className="flex items-center justify-center min-h-[400px]">
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

              <div className="space-y-8 mt-6">
                {/* Seção NF-e */}
                <div id="drawer-section-nfe">
          {/* Status e Ações Rápidas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <NFStatusTag value={nfe.status} type="status" />
              {nfe.manifestacao && (
                <NFStatusTag value={nfe.manifestacao} type="manifestacao" />
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDownloadXML}
              >
                <Download className="h-4 w-4 mr-2" />
                XML
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDownloadPDF}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleViewDANFE}
              >
                <Eye className="h-4 w-4 mr-2" />
                DANFE
              </Button>
            </div>

            {nfe.lancadoEm === 'recebidas' && nfe.manifestacao === 'Não Manifestada' && (
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={handleManifestar}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Manifestar
              </Button>
            )}
          </div>

          {/* Informações Gerais */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0d0f1c]">Informações Gerais</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#5F6572] mb-1">Número</p>
                <p className="text-sm font-semibold text-[#0d0f1c]">{nfe.numero}</p>
              </div>
              <div>
                <p className="text-xs text-[#5F6572] mb-1">Série</p>
                <p className="text-sm font-semibold text-[#0d0f1c]">{nfe.serie}</p>
              </div>
              <div>
                <p className="text-xs text-[#5F6572] mb-1">Modelo</p>
                <p className="text-sm font-semibold text-[#0d0f1c]">{nfe.modelo || '55'}</p>
              </div>
              <div>
                <p className="text-xs text-[#5F6572] mb-1">Tipo</p>
                <p className="text-sm font-semibold text-[#0d0f1c]">{nfe.tipo}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#5F6572] mb-1">Chave de Acesso</p>
              <CopyableNumber value={formatChaveAcesso(nfe.chaveAcesso)} />
            </div>

            <div>
              <p className="text-xs text-[#5F6572] mb-1">Protocolo de Autorização</p>
              <p className="text-sm text-[#0d0f1c] font-mono">{nfe.protocolo || '—'}</p>
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0d0f1c]">Datas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#5F6572] mb-1">Emissão</p>
                <p className="text-sm text-[#0d0f1c]">{nfe.dataEmissao}</p>
              </div>
              {nfe.dataSaida && (
                <div>
                  <p className="text-xs text-[#5F6572] mb-1">Saída</p>
                  <p className="text-sm text-[#0d0f1c]">{nfe.dataSaida}</p>
                </div>
              )}
              {nfe.dataAutorizacao && (
                <div>
                  <p className="text-xs text-[#5F6572] mb-1">Autorização</p>
                  <p className="text-sm text-[#0d0f1c]">{nfe.dataAutorizacao}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#5F6572] mb-1">Importação</p>
                <p className="text-sm text-[#0d0f1c]">{nfe.dataImportacao}</p>
              </div>
            </div>
          </div>

          {/* Dados Fiscais */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0d0f1c]">Dados Fiscais</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-[#5F6572] mb-1">Natureza da Operação</p>
                <p className="text-sm text-[#0d0f1c]">{nfe.naturezaOperacao}</p>
              </div>
              <div>
                <p className="text-xs text-[#5F6572] mb-1">CFOPs</p>
                <p className="text-sm text-[#0d0f1c]">{formatCFOPList(nfe.cfops)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#5F6572] mb-1">Quantidade de Itens</p>
                  <p className="text-sm text-[#0d0f1c]">{nfe.quantidadeItens}</p>
                </div>
                {nfe.ufOrigem && nfe.ufDestino && (
                  <div>
                    <p className="text-xs text-[#5F6572] mb-1">Rota</p>
                    <p className="text-sm text-[#0d0f1c]">{nfe.ufOrigem} → {nfe.ufDestino}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadados */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0d0f1c]">Metadados</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-[#5F6572] mb-1">Origem</p>
                <p className="text-sm text-[#0d0f1c]">{nfe.origem}</p>
              </div>
              <div>
                <p className="text-xs text-[#5F6572] mb-1">Sincronização ERP</p>
                <p className="text-sm text-[#0d0f1c]">{nfe.sincronizadoERP ? 'Sincronizado' : 'Não sincronizado'}</p>
              </div>
              {nfe.etiquetas && nfe.etiquetas.length > 0 && (
                <div>
                  <p className="text-xs text-[#5F6572] mb-1">Etiquetas</p>
                  <div className="flex flex-wrap gap-1">
                    {nfe.etiquetas.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center h-6 px-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {nfe.comentarios && (
                <div>
                  <p className="text-xs text-[#5F6572] mb-1">Comentários</p>
                  <p className="text-sm text-[#0d0f1c]">{nfe.comentarios}</p>
                </div>
              )}
            </div>
              </div>
                </div>

                {/* Seção Emitente */}
                <div id="drawer-section-emitente" className="space-y-6">
                    <h3 className="text-sm font-bold text-[#0d0f1c]">Emitente</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-[#5F6572] mb-1">Razão Social</p>
                        <p className="text-sm text-[#0d0f1c]">{nfe.emitente.razaoSocial}</p>
                      </div>
                      {nfe.emitente.nomeFantasia && (
                        <div>
                          <p className="text-xs text-[#5F6572] mb-1">Nome Fantasia</p>
                          <p className="text-sm text-[#0d0f1c]">{nfe.emitente.nomeFantasia}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-[#5F6572] mb-1">CNPJ</p>
                          <p className="text-sm text-[#0d0f1c] font-mono">{formatCNPJ(nfe.emitente.cnpj)}</p>
                        </div>
                        {nfe.emitente.inscricaoEstadual && (
                          <div>
                            <p className="text-xs text-[#5F6572] mb-1">IE</p>
                            <p className="text-sm text-[#0d0f1c] font-mono">{nfe.emitente.inscricaoEstadual}</p>
                          </div>
                        )}
                      </div>
                      {nfe.emitente.municipio && (
                        <div>
                          <p className="text-xs text-[#5F6572] mb-1">Município / UF</p>
                          <p className="text-sm text-[#0d0f1c]">{nfe.emitente.municipio} / {nfe.emitente.uf}</p>
                        </div>
                        )}
                      </div>
                </div>

                {/* Seção Destinatário */}
                <div id="drawer-section-destinatario" className="space-y-6">
                    <h3 className="text-sm font-bold text-[#0d0f1c]">Destinatário</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-[#5F6572] mb-1">Razão Social</p>
                        <p className="text-sm text-[#0d0f1c]">{nfe.destinatario.razaoSocial}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-[#5F6572] mb-1">CNPJ/CPF</p>
                          <p className="text-sm text-[#0d0f1c] font-mono">{formatCNPJ(nfe.destinatario.cnpjCpf)}</p>
                        </div>
                        {nfe.destinatario.inscricaoEstadual && (
                          <div>
                            <p className="text-xs text-[#5F6572] mb-1">IE</p>
                            <p className="text-sm text-[#0d0f1c] font-mono">{nfe.destinatario.inscricaoEstadual}</p>
                          </div>
                        )}
                      </div>
                      {nfe.destinatario.municipio && (
                        <div>
                          <p className="text-xs text-[#5F6572] mb-1">Município / UF</p>
                          <p className="text-sm text-[#0d0f1c]">{nfe.destinatario.municipio} / {nfe.destinatario.uf}</p>
                        </div>
                        )}
                      </div>
                </div>

                {/* Seção Produtos/serviços */}
                <div id="drawer-section-produtos">
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-3">
                      <FileText className="h-12 w-12 text-[#71717c] mx-auto" />
                      <div>
                        <h3 className="text-lg font-bold text-[#0d0f1c]">Produtos/serviços</h3>
                        <p className="text-sm text-[#5F6572] mt-1">Listagem de produtos em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção Totais */}
                <div id="drawer-section-totais" className="space-y-6">
                    <h3 className="text-sm font-bold text-[#0d0f1c]">Valores</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#5F6572]">Produtos/Serviços</span>
                        <span className="text-sm font-semibold text-[#0d0f1c]">{formatCurrency(nfe.valorProdutos)}</span>
                      </div>
                      {nfe.valorIcms && nfe.valorIcms > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#5F6572]">ICMS</span>
                          <span className="text-sm text-[#0d0f1c]">{formatCurrency(nfe.valorIcms)}</span>
                        </div>
                      )}
                      {nfe.valorIpi && nfe.valorIpi > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#5F6572]">IPI</span>
                          <span className="text-sm text-[#0d0f1c]">{formatCurrency(nfe.valorIpi)}</span>
                        </div>
                      )}
                      <div className="h-px bg-border my-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-[#0d0f1c]">Valor Total da Nota</span>
                        <span className="text-base font-bold text-[#0d0f1c]">{formatCurrency(nfe.valor)}</span>
                        </div>
                      </div>
                </div>

                {/* Seção Transporte */}
                <div id="drawer-section-transporte">
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-3">
                      <FileText className="h-12 w-12 text-[#71717c] mx-auto" />
                      <div>
                        <h3 className="text-lg font-bold text-[#0d0f1c] flex items-center justify-center gap-2">
                          Transporte
                          <span className={getTagClasses('bg-blue-50', 'text-blue-700', 'border-blue-200')}>
                            Em breve
                          </span>
                        </h3>
                        <p className="text-sm text-[#5F6572] mt-1">Seção em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="drawer-section-cobranca">
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-3">
                      <FileText className="h-12 w-12 text-[#71717c] mx-auto" />
                      <div>
                        <h3 className="text-lg font-bold text-[#0d0f1c] flex items-center justify-center gap-2">
                          Cobrança
                          <span className={getTagClasses('bg-blue-50', 'text-blue-700', 'border-blue-200')}>
                            Em breve
                          </span>
                        </h3>
                        <p className="text-sm text-[#5F6572] mt-1">Seção em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="drawer-section-info-adicionais">
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-3">
                      <FileText className="h-12 w-12 text-[#71717c] mx-auto" />
                      <div>
                        <h3 className="text-lg font-bold text-[#0d0f1c] flex items-center justify-center gap-2">
                          Info. Adicionais
                          <span className={getTagClasses('bg-blue-50', 'text-blue-700', 'border-blue-200')}>
                            Em breve
                          </span>
                        </h3>
                        <p className="text-sm text-[#5F6572] mt-1">Seção em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="drawer-section-exportacao">
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-3">
                      <FileText className="h-12 w-12 text-[#71717c] mx-auto" />
                      <div>
                        <h3 className="text-lg font-bold text-[#0d0f1c] flex items-center justify-center gap-2">
                          Exportação
                          <span className={getTagClasses('bg-blue-50', 'text-blue-700', 'border-blue-200')}>
                            Em breve
                          </span>
                        </h3>
                        <p className="text-sm text-[#5F6572] mt-1">Seção em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="drawer-section-compras">
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-3">
                      <FileText className="h-12 w-12 text-[#71717c] mx-auto" />
                      <div>
                        <h3 className="text-lg font-bold text-[#0d0f1c] flex items-center justify-center gap-2">
                          Compras
                          <span className={getTagClasses('bg-blue-50', 'text-blue-700', 'border-blue-200')}>
                            Em breve
                          </span>
                        </h3>
                        <p className="text-sm text-[#5F6572] mt-1">Seção em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="drawer-section-pagamentos">
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-3">
                      <FileText className="h-12 w-12 text-[#71717c] mx-auto" />
                      <div>
                        <h3 className="text-lg font-bold text-[#0d0f1c] flex items-center justify-center gap-2">
                          Pagamentos
                          <span className={getTagClasses('bg-blue-50', 'text-blue-700', 'border-blue-200')}>
                            Em breve
                          </span>
                        </h3>
                        <p className="text-sm text-[#5F6572] mt-1">Seção em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

