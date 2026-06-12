"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FeatureToggle } from "@/components/settings/FeatureToggle";
import { TagModelSelector } from "@/components/settings/TagModelSelector";
import { OpenAccountTagColorSelector } from "@/components/settings/OpenAccountTagColorSelector";
import { useFeatures } from "@/lib/features/useFeatures";
import { useTheme } from "@/lib/theme/useTheme";
import { ArrowLeft, Save, Download, Upload, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Estrutura igual à sidebar
const MENU_SECTIONS = [
  {
    id: "principal",
    label: "Principal",
    items: [
      { label: "Home Qive", href: "/", productKey: null }, // Não tem product key pois é a home
    ],
  },
  {
    id: "documentos",
    label: "Documentos",
    items: [
      { label: "NF-e", href: "/documentos/nfe", productKey: "nfe" },
      { label: "NF-e em etapas", href: "/documentos/nfe-etapas", productKey: "nfe-etapas" },
      { label: "NFS-e", href: "/documentos/nfse", productKey: "nfse" },
      { label: "CT-e", href: "/documentos/cte", productKey: "cte" },
      { label: "CF-e SAT", href: "/documentos/cfe-sat", productKey: "cfe-sat" },
      { label: "NFC-e", href: "/documentos/nfce", productKey: "nfce" },
      { label: "MDF-e", href: "/documentos/mdfe", productKey: "mdfe" },
    ],
  },
  {
    id: "financeiro",
    label: "Financeiro",
    items: [
      { label: "Painel de performance", href: "/financeiro/dashboard-financeiro", productKey: "dashboard-financeiro" },
      { label: "Contas a pagar", href: "/financeiro/gestao-de-pagamentos", productKey: "gestao-de-pagamentos" },
      { label: "Listagem de comprovantes", href: "/financeiro/comprovantes", productKey: "comprovantes" },
      { label: "Listagem de boletos", href: "/financeiro/contas-a-receber", productKey: "contas-a-receber" },
    ],
  },
  {
    id: "compras",
    label: "Compras",
    items: [
      { label: "Portal de Fornecedores", href: "/compras/portal-de-fornecedores", productKey: "portal-de-fornecedores" },
      { label: "Documentos", href: "/compras/portal-de-fornecedores/documentos", productKey: "portal-de-fornecedores" },
      { label: "NF-e", href: "/compras/portal-de-fornecedores/nfe", productKey: "portal-de-fornecedores" },
      { label: "NFS-e", href: "/compras/portal-de-fornecedores/nfse", productKey: "portal-de-fornecedores" },
      { label: "CT-e", href: "/compras/portal-de-fornecedores/cte", productKey: "portal-de-fornecedores" },
      { label: "CTE-OS", href: "/compras/portal-de-fornecedores/cte-os", productKey: "portal-de-fornecedores" },
      { label: "Cadastro", href: "/compras/portal-de-fornecedores/cadastro", productKey: "portal-de-fornecedores" },
      { label: "Radar da Reforma Tributária", href: "/compras/portal-de-fornecedores/painel-de-transicao-tributaria", productKey: "portal-de-fornecedores" },
      { label: "Indicadores", href: "/compras/portal-de-fornecedores/indicadores", productKey: "portal-de-fornecedores" },
      { label: "Histórico de Atividades", href: "/compras/portal-de-fornecedores/historico-de-atividades", productKey: "portal-de-fornecedores" },
      { label: "Análise de Fornecedores", href: "/compras/analise-de-fornecedores", productKey: "analise-de-fornecedores" },
      { label: "Custos de Transporte", href: "/compras/custos-de-transporte", productKey: "custos-de-transporte" },
      { label: "Preço de Produto", href: "/compras/preco-de-produto", productKey: "preco-de-produto" },
      { label: "Controle de Devolução", href: "/compras/controle-de-devolucao", productKey: "controle-de-devolucao" },
    ],
  },
  {
    id: "captura-envio",
    label: "Captura e envio",
    items: [
      { label: "Integrações", href: "/integracoes", productKey: "integracoes" },
      { label: "Recuperar Notas", href: "/captura/recuperar", productKey: "recuperar" },
      { label: "Sincroniza Notas", href: "/captura/sincronizar", productKey: "sincronizar" },
      { label: "Importar XMLs", href: "/captura/importar", productKey: "importar" },
      { label: "Painel de Capturas", href: "/captura/painel", productKey: "painel" },
    ],
  },
  {
    id: "fiscal-analises",
    label: "Análises",
    items: [
      { label: "Reforma Tributária", href: "/fiscal/reforma-tributaria", productKey: "reforma-tributaria" },
      { label: "Erros em Notas", href: "/fiscal/erros-em-notas", productKey: "erros-em-notas" },
      { label: "Painel Conexões", href: "/fiscal/painel-conexoes", productKey: "painel-conexoes" },
    ],
  },
  {
    id: "fiscal-lancamento",
    label: "Lançamento",
    items: [
      { label: "Confere Chaves", href: "/fiscal/confere-chaves", productKey: "confere-chaves" },
    ],
  },
  {
    id: "fiscal-escrituracao-obrigacoes",
    label: "Escrituração e Obrigações",
    items: [
      { label: "Análise TAX e SPED", href: "/fiscal/analise-tax-sped", productKey: "analise-tax-sped" },
      { label: "Confere C100D100", href: "/fiscal/confere-c100d100", productKey: "confere-c100d100" },
      { label: "SPEDs Entregues", href: "/fiscal/speds-entregues", productKey: "speds-entregues" },
    ],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    items: [
      { label: "Relatórios Avançados", href: "/relatorios", productKey: "relatorios" },
    ],
  },
  {
    id: "produtividade",
    label: "Produtividade",
    items: [
      { label: "Fechamento de Mês", href: "/produtividade/fechamento", productKey: "fechamento" },
      { label: "Automações", href: "/automacoes", productKey: "automacoes" },
      { label: "Operações em Lote NF-e", href: "/produtividade/lote-nfe", productKey: "lote-nfe" },
    ],
  },
];

// Mapeamento de produtos para descrições
const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  "gestao-de-pagamentos": "Controle de contas a pagar e pagamentos",
  "dashboard-financeiro":
    "Painel analítico com indicadores e gráficos de contas a pagar",
  comprovantes: "Visualização e importação de comprovantes de pagamento",
  "contas-a-receber": "Gerenciamento de contas a receber",
  "reforma-tributaria": "Acompanhamento da reforma tributária",
  "erros-em-notas": "Monitoramento de inconsistências em notas fiscais",
  "painel-conexoes": "Visão consolidada de integrações e conexões fiscais",
  "confere-chaves": "Validação de chaves de documentos fiscais",
  "analise-tax-sped": "Análises de TAX e SPED para escrituração",
  "confere-c100d100": "Conferência de registros C100 e D100",
  "speds-entregues": "Histórico e status de SPEDs enviados",
  "portal-de-fornecedores": "Portal para gestão de relacionamento e operação com fornecedores",
  "analise-de-fornecedores": "Análise de fornecedores (Compras)",
  "custos-de-transporte": "Custos de transporte (Compras)",
  "preco-de-produto": "Preço de produto (Compras)",
  "controle-de-devolucao": "Controle de devolução (Compras)",
  nfe: "Nota Fiscal Eletrônica",
  "nfe-etapas": "Processamento de NF-e em etapas",
  nfse: "Nota Fiscal de Serviços Eletrônica",
  cte: "Conhecimento de Transporte Eletrônico",
  "cfe-sat": "Cupom Fiscal Eletrônico SAT",
  nfce: "Nota Fiscal de Consumidor Eletrônica",
  mdfe: "Manifesto de Documentos Fiscais Eletrônicos",
  integracoes: "Conectores, ERPs e Marketplaces",
  recuperar: "Recuperação de notas fiscais",
  sincronizar: "Sincronização de notas fiscais",
  importar: "Importação de arquivos XML",
  painel: "Painel de captura de documentos",
  relatorios: "Relatórios e análises",
  fechamento: "Fechamento mensal",
  automacoes: "Fluxos, regras e disparos",
  "lote-nfe": "Processamento em lote de NF-e",
};

// Mapeamento de features para labels amigáveis
const FEATURE_LABELS: Record<string, { label: string; description?: string }> = {
  "gestao-de-pagamentos.erp-sync": {
    label: "Sincronização com ERP",
    description: "Exibe coluna de sincronização ERP e campos relacionados na Gestão de Pagamentos",
  },
  "gestao-de-pagamentos.drawer-expand": {
    label: "Expandir e retrair drawer",
    description: "Permite expandir o drawer para tela cheia. Quando desabilitado, o drawer fica com largura limitada e overlay de fundo",
  },
  "gestao-de-pagamentos.etapa": {
    label: "Etapa",
    description: "Exibe a seção de etapas do processo de pagamento no drawer",
  },
  "gestao-de-pagamentos.pagar-button": {
    label: "Botão Pagar",
    description: "Exibe o botão de pagamento na aba Pagar",
  },
  "gestao-de-pagamentos.selection-counter": {
    label: "Contador de seleção",
    description: "Exibe o contador de documentos selecionados nos botões Exportar e Lançar",
  },
  "gestao-de-pagamentos.novo-pagamento": {
    label: "Novo pagamento",
    description: "Exibe o botão '+ Novo pagamento' na aba Pagar para criar novas contas a pagar",
  },
  "gestao-de-pagamentos.aprovacao-tab": {
    label: "Aba de Aprovação",
    description: "Exibe a aba de Aprovação e a opção de lançar em aprovação no menu Lançar",
  },
  "gestao-de-pagamentos.tab-new-items-indicator": {
    label: "Indicador de novos itens nas abas",
    description: "Exibe a bolinha azul nas abas quando há novos itens lançados para aquela aba",
  },
  "gestao-de-pagamentos.pagamento-preferencial-tag": {
    label: "Tag de pagamento preferencial",
    description: "Exibe a tag 'Pagamento preferencial' na seção de meio de pagamento no drawer",
  },
  "gestao-de-pagamentos.cnab-menu": {
    label: "Menu Arquivo CNAB",
    description: "Exibe o menu 'Arquivo CNAB' na aba Pagar",
  },
  "gestao-de-pagamentos.multi-company-selection": {
    label: "Seleção múltipla de empresas",
    description: "Permite selecionar 'Todas as empresas'. Quando desabilitado, apenas uma empresa pode ser selecionada e a primeira vem como padrão",
  },
  "gestao-de-pagamentos.filtros-alternativos": {
    label: "Filtros alternativos",
    description: "Mantém os filtros avançados abertos após aplicar e move a barra 'Filtrando por' para a mesma linha dos botões de ação",
  },
};

interface ProductWithFeatures {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
  features: Array<{
    key: string;
    label: string;
    description?: string;
    enabled: boolean;
  }>;
}

interface SectionWithProducts {
  id: string;
  label: string;
  products: ProductWithFeatures[];
}

const ORIGEM_TYPES = [
  { value: "Manual", label: "Manual" },
  { value: "NF-e", label: "NF-e" },
  { value: "NFS-e", label: "NFS-e" },
  { value: "CT-e", label: "CT-e" },
  { value: "Boleto", label: "Boleto" },
] as const;

export default function Page() {
  const router = useRouter();
  const { 
    features, 
    toggleProduct, 
    toggleFeature, 
    isOrigemTypeEnabled,
    toggleOrigemType,
    reloadFromStorage: reloadFeatures,
    getFeatureVariant,
    setFeatureVariant,
  } = useFeatures();
  const { tagModel, setTagModel, openAccountTagColor, setOpenAccountTagColor, reloadFromStorage: reloadTheme } = useTheme();
  const [saveModalOpen, setSaveModalOpen] = React.useState(false);
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const handleBack = () => {
    router.back();
  };

  const handleSaveAsDefault = () => {
    setSaveModalOpen(true);
  };

  const handleSaveLocal = () => {
    try {
      localStorage.setItem("qive-features-config", JSON.stringify(features));
      localStorage.setItem("qive-theme-config", JSON.stringify({ tagModel, openAccountTagColor }));
      
      toast.success("Configurações salvas!", {
        description: "Suas configurações foram salvas para este navegador e serão mantidas ao recarregar a página.",
        duration: 3000,
      });
      setSaveModalOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar configurações", {
        description: "Não foi possível salvar as configurações. Tente novamente.",
        duration: 3000,
      });
    }
  };

  const handleExport = () => {
    try {
      const config = {
        features,
        theme: { tagModel, openAccountTagColor },
        exportedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qive-config-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Configurações exportadas!", {
        description: "Você pode importar este arquivo em outro navegador ou dispositivo.",
        duration: 3000,
      });
      setSaveModalOpen(false);
    } catch (error) {
      toast.error("Erro ao exportar configurações", {
        description: "Não foi possível exportar as configurações. Tente novamente.",
        duration: 3000,
      });
    }
  };

  const handleImport = () => {
    if (importInputRef.current) {
      importInputRef.current.click();
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content);
        
        if (config.features) {
          localStorage.setItem("qive-features-config", JSON.stringify(config.features));
          // Recarregar configurações de features do localStorage
          reloadFeatures();
        }
        if (config.theme) {
          // Garantir que todas as propriedades do tema estejam presentes
          const themeConfig = {
            tagModel: config.theme.tagModel || tagModel,
            openAccountTagColor: config.theme.openAccountTagColor || openAccountTagColor,
          };
          localStorage.setItem("qive-theme-config", JSON.stringify(themeConfig));
          // Recarregar configurações de tema do localStorage
          reloadTheme();
        }
        
        toast.success("Configurações importadas!", {
          description: "As configurações foram importadas e aplicadas com sucesso.",
          duration: 3000,
        });
        setSaveModalOpen(false);
      } catch (error) {
        toast.error("Erro ao importar configurações", {
          description: "O arquivo selecionado não é válido. Verifique se é um arquivo de configuração do Qive.",
          duration: 3000,
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = "";
  };

  // Organizar produtos por seção, seguindo a estrutura da sidebar
  const sectionsWithProducts = React.useMemo(() => {
    const featuresList = Object.entries(features.features)
      // O botão Pagar terá um controle próprio de versão (V1/V2), então não entra na lista genérica
      .filter(([key]) => key !== "gestao-de-pagamentos.pagar-button")
      .map(([key, enabled]) => ({
        key,
        enabled,
        ...FEATURE_LABELS[key],
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return MENU_SECTIONS.map((section) => {
      const products: ProductWithFeatures[] = section.items
        .filter((item) => item.productKey !== null) // Filtrar itens sem productKey (como "Painel da Conta")
        .map((item) => {
          const productKey = item.productKey!;
          const enabled = features.produtos[productKey] ?? true;
          
          // Filtrar features que pertencem a este produto (mostrar todas, habilitadas ou não)
          const produtoFeatures = featuresList.filter((feature) =>
            feature.key.startsWith(`${productKey}.`)
          );

          return {
            key: productKey,
            label: item.label,
            description: PRODUCT_DESCRIPTIONS[productKey],
            enabled,
            features: produtoFeatures,
          } as ProductWithFeatures;
        });

      return {
        id: section.id,
        label: section.label,
        products,
      } as SectionWithProducts;
    }).filter((section) => section.products.length > 0); // Filtrar seções sem produtos
  }, [features]);

  return (
    <div className="p-6">
      {/* Header com botão Voltar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-[#0d0f1c]">Configurações</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleImport}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button
            onClick={handleSaveAsDefault}
            className="inline-flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar como padrão
          </Button>
        </div>
      </div>

      {/* Seção de Customização de Tema */}
      <Card className="rounded-xl bg-white border border-border mb-6">
        <CardHeader>
          <CardTitle className="card-title">Customização de Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-[#0d0f1c] mb-3 block">
                Modelo das Etiquetas
              </Label>
              <TagModelSelector value={tagModel} onChange={setTagModel} />
            </div>
            <div>
              <Label className="text-sm font-semibold text-[#0d0f1c] mb-3 block">
                Cor das Tags de Contas em Aberto
              </Label>
              <OpenAccountTagColorSelector value={openAccountTagColor} onChange={setOpenAccountTagColor} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Seções com Produtos e Features */}
      <div className="space-y-6">
        {sectionsWithProducts.map((section) => (
          <Card key={section.id} className="rounded-xl bg-white border border-border">
            <CardHeader>
              <CardTitle className="card-title">{section.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {section.products.map((produto, produtoIndex) => (
                  <div key={produto.key}>
                    {/* Toggle do Produto */}
                    <div
                      className={cn(
                        "border-b border-border",
                        produto.features.length > 0 && "pb-4"
                      )}
                    >
                      <FeatureToggle
                        label={produto.label}
                        description={produto.description}
                        enabled={produto.enabled}
                        onToggle={() => toggleProduct(produto.key)}
                      />
                    </div>

                    {/* Features do Produto - só mostra se houver features habilitadas */}
                    {produto.features.length > 0 && (
                      <div className="pl-6 pt-2 pb-4 bg-[#FAFAFA] border-b border-border last:border-b-0">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-[#5F6572] uppercase tracking-wide">
                            Features
                          </span>
                        </div>
                        <div className="space-y-0">
                          {produto.features.map((feature, featureIndex) => (
                            <div
                              key={feature.key}
                              className={cn(
                                "border-l-2 border-[#E7EEFF] pl-4",
                                featureIndex < produto.features.length - 1 && "border-b border-border"
                              )}
                            >
                              <FeatureToggle
                                label={feature.label}
                                description={feature.description}
                                enabled={feature.enabled}
                                onToggle={() => toggleFeature(feature.key)}
                                disabled={!produto.enabled}
                                noBorder={true}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Versão do Botão Pagar (apenas para Gestão de Pagamentos) */}
                    {produto.key === "gestao-de-pagamentos" && (
                      <div className="pl-6 pt-2 pb-4 bg-[#FAFAFA] border-b border-border last:border-b-0">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold text-[#5F6572] uppercase tracking-wide block">
                              Botão Pagar
                            </span>
                            <span className="text-xs text-[#5F6572]">
                              Escolha a versão do fluxo do botão Pagar
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="text-xs font-semibold text-[#5F6572] block mb-1">
                            Versão do botão Pagar
                          </label>
                          <select
                            className="h-9 rounded-md border border-border bg-white px-3 text-sm text-[#0d0f1c] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0C3CF7]"
                            value={getFeatureVariant("gestao-de-pagamentos.pagar-button", "v2")}
                            onChange={(e) =>
                              setFeatureVariant("gestao-de-pagamentos.pagar-button", e.target.value)
                            }
                          >
                            <option value="v1">V1 – Cadastro de bancos antes do pagamento</option>
                            <option value="v2">V2 – Fluxo atual de pagamento com extrato</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Tipos de Origem - apenas para Gestão de Pagamentos */}
                    {produto.key === "gestao-de-pagamentos" && (
                      <div className="pl-6 pt-2 pb-4 bg-[#FAFAFA] border-b border-border last:border-b-0">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-[#5F6572] uppercase tracking-wide">
                            Tipos de Origem
                          </span>
                        </div>
                        <div className="space-y-0">
                          {ORIGEM_TYPES.map((origemType) => (
                            <div
                              key={origemType.value}
                              className={cn(
                                "border-l-2 border-[#E7EEFF] pl-4",
                                origemType.value !== ORIGEM_TYPES[ORIGEM_TYPES.length - 1].value && "border-b border-border"
                              )}
                            >
                              <FeatureToggle
                                label={origemType.label}
                                description={`Permite que documentos apareçam com origem "${origemType.label}" na coluna Origem`}
                                enabled={isOrigemTypeEnabled("gestao-de-pagamentos", origemType.value)}
                                onToggle={() => toggleOrigemType("gestao-de-pagamentos", origemType.value)}
                                disabled={!produto.enabled}
                                noBorder={true}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Filtros - apenas para Gestão de Pagamentos */}
                    {produto.key === "gestao-de-pagamentos" && (
                      <div className="pl-6 pt-2 pb-4 bg-[#FAFAFA] border-b border-border last:border-b-0">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-[#5F6572] uppercase tracking-wide">
                            Filtros
                          </span>
                        </div>
                        <div className="space-y-0">
                          <div className="border-l-2 border-[#E7EEFF] pl-4">
                            <FeatureToggle
                              label="Filtros alternativos"
                              description="Os filtros permanecem abertos após aplicar e a barra 'Filtrando por' aparece na mesma linha dos botões"
                              enabled={features.features["gestao-de-pagamentos.filtros-alternativos"] ?? false}
                              onToggle={() => toggleFeature("gestao-de-pagamentos.filtros-alternativos")}
                              disabled={!produto.enabled}
                              noBorder={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Salvar Configurações */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="rounded-[16px] max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0d0f1c]">
              Salvar configurações
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5F6572]">
              Escolha como deseja salvar suas configurações
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Opção 1: Salvar localmente */}
            <div className="rounded-lg border border-border p-4 hover:bg-[#FAFAFA] transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#0d0f1c] mb-1">
                    Salvar para este navegador
                  </h3>
                  <p className="text-xs text-[#5F6572]">
                    As configurações serão salvas apenas neste navegador e dispositivo. 
                    Elas permanecerão mesmo após recarregar a página.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSaveLocal}
                className="mt-3 w-full"
                variant="default"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar localmente
              </Button>
            </div>

            {/* Opção 2: Exportar */}
            <div className="rounded-lg border border-border p-4 hover:bg-[#FAFAFA] transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#0d0f1c] mb-1">
                    Exportar configurações
                  </h3>
                  <p className="text-xs text-[#5F6572]">
                    Baixe um arquivo JSON com suas configurações para importar em outro navegador ou dispositivo.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExport}
                className="mt-3 w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar arquivo
              </Button>
            </div>

            {/* Info sobre compartilhamento */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#E7EEFF] border border-[#B8CCFF]">
              <Info className="h-4 w-4 text-[#0C3CF7] mt-0.5 shrink-0" />
              <p className="text-xs text-[#003F70]">
                <strong>Nota:</strong> Sem um servidor backend, não é possível compartilhar configurações 
                automaticamente entre navegadores. Use a opção de exportar/importar para transferir 
                suas configurações manualmente.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveModalOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Input hidden para importar arquivo */}
      <input
        type="file"
        accept=".json"
        ref={importInputRef}
        onChange={handleImportFile}
        className="hidden"
      />
    </div>
  );
}
