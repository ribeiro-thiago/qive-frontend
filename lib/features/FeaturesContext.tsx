"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type FeaturesConfig = {
  produtos: {
    [key: string]: boolean;
  };
  features: {
    [key: string]: boolean;
  };
  origemTypes?: {
    [key: string]: {
      [originType: string]: boolean;
    };
  };
  /**
   * Variantes de features (ex: V1/V2 para o botão Pagar).
   * Mantido separado do mapa booleano para não quebrar chamadas existentes.
   */
  featureVariants?: {
    [key: string]: string;
  };
};

const STORAGE_KEY = "qive-features-config";

const defaultConfig: FeaturesConfig = {
  produtos: {
    "gestao-de-pagamentos": true,
    "dashboard-financeiro": true,
    comprovantes: true,
    "contas-a-receber": true,
    "reforma-tributaria": true,
    "conciliacao-fiscal-triplice": true,
    "erros-em-notas": false,
    "painel-conexoes": false,
    "confere-chaves": false,
    "analise-tax-sped": false,
    "confere-c100d100": false,
    "speds-entregues": false,
    "nfe": true,
    "nfse": true,
    "cte": false,
    "cfe-sat": false,
    "nfce": false,
    "mdfe": false,
    "nfe-etapas": false,
    "integracoes": false,
    "recuperar": false,
    "sincronizar": false,
    "importar": false,
    "painel": false,
    "relatorios": false,
    "fechamento": false,
    "automacoes": false,
    "lote-nfe": false,
    "portal-de-fornecedores": true,
    "analise-de-fornecedores": true,
    "custos-de-transporte": true,
    "preco-de-produto": true,
    "controle-de-devolucao": true,
  },
  features: {
    "gestao-de-pagamentos.erp-sync": false,
    "gestao-de-pagamentos.drawer-expand": false,
    "gestao-de-pagamentos.etapa": false,
    "gestao-de-pagamentos.pagar-button": true,
    "gestao-de-pagamentos.selection-counter": false,
    "gestao-de-pagamentos.novo-pagamento": true,
    "gestao-de-pagamentos.aprovacao-tab": true,
    "gestao-de-pagamentos.tab-new-items-indicator": false,
    "gestao-de-pagamentos.pagamento-preferencial-tag": false,
    "gestao-de-pagamentos.cnab-menu": false,
    "gestao-de-pagamentos.multi-company-selection": true,
    "gestao-de-pagamentos.filtros-alternativos": false,
  },
  origemTypes: {
    "gestao-de-pagamentos": {
      "Manual": true,
      "NF-e": true,
      "NFS-e": false,
      "CT-e": false,
      "Boleto": false,
    },
  },
  featureVariants: {
    // V1 agora é o comportamento padrão do botão Pagar
    "gestao-de-pagamentos.pagar-button": "v1",
  },
};

interface FeaturesContextType {
  config: FeaturesConfig;
  isProductEnabled: (productKey: string) => boolean;
  isFeatureEnabled: (featureKey: string) => boolean;
  isOrigemTypeEnabled: (productKey: string, origemType: string) => boolean;
  toggleProduct: (productKey: string) => void;
  toggleFeature: (featureKey: string) => void;
  toggleOrigemType: (productKey: string, origemType: string) => void;
  setProduct: (productKey: string, enabled: boolean) => void;
  setFeature: (featureKey: string, enabled: boolean) => void;
  setOrigemType: (productKey: string, origemType: string, enabled: boolean) => void;
  getEnabledOrigemTypes: (productKey: string) => string[];
  reloadFromStorage: () => void;
  getFeatureVariant: (featureKey: string, fallbackVariant?: string) => string;
  setFeatureVariant: (featureKey: string, variant: string) => void;
}

const FeaturesContext = createContext<FeaturesContextType | undefined>(undefined);

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<FeaturesConfig>(defaultConfig);

  // Carregar configuração do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FeaturesConfig;
        // Merge com default para garantir que novas features sejam incluídas
        setConfig({
          produtos: { ...defaultConfig.produtos, ...parsed.produtos },
          features: { ...defaultConfig.features, ...parsed.features },
          origemTypes: parsed.origemTypes
            ? Object.keys(parsed.origemTypes).reduce((acc, key) => {
                acc[key] = {
                  ...defaultConfig.origemTypes?.[key],
                  ...parsed.origemTypes?.[key],
                };
                return acc;
              }, {} as any)
            : defaultConfig.origemTypes,
          featureVariants: {
            ...defaultConfig.featureVariants,
            ...parsed.featureVariants,
          },
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de features:", error);
    }
  }, []);

  // Salvar no localStorage quando config mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Erro ao salvar configurações de features:", error);
    }
  }, [config]);

  const isProductEnabled = useCallback(
    (productKey: string) => {
      return config.produtos[productKey] ?? true;
    },
    [config]
  );

  const isFeatureEnabled = useCallback(
    (featureKey: string) => {
      return config.features[featureKey] ?? true;
    },
    [config]
  );

  const toggleProduct = useCallback(
    (productKey: string) => {
      setConfig((prev) => ({
        ...prev,
        produtos: {
          ...prev.produtos,
          [productKey]: !(prev.produtos[productKey] ?? true),
        },
      }));
    },
    []
  );

  const toggleFeature = useCallback(
    (featureKey: string) => {
      setConfig((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: !(prev.features[featureKey] ?? true),
        },
      }));
    },
    []
  );

  const setProduct = useCallback((productKey: string, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      produtos: {
        ...prev.produtos,
        [productKey]: enabled,
      },
    }));
  }, []);

  const setFeature = useCallback((featureKey: string, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: enabled,
      },
    }));
  }, []);

  const isOrigemTypeEnabled = useCallback(
    (productKey: string, origemType: string) => {
      return config.origemTypes?.[productKey]?.[origemType] ?? true;
    },
    [config]
  );

  const toggleOrigemType = useCallback(
    (productKey: string, origemType: string) => {
      setConfig((prev) => {
        const current = prev.origemTypes?.[productKey]?.[origemType] ?? true;
        const newOrigemTypes = {
          ...prev.origemTypes,
          [productKey]: {
            ...prev.origemTypes?.[productKey],
            [origemType]: !current,
          },
        };
        return {
          ...prev,
          origemTypes: newOrigemTypes,
        };
      });
    },
    []
  );

  const setOrigemType = useCallback(
    (productKey: string, origemType: string, enabled: boolean) => {
      setConfig((prev) => {
        const newOrigemTypes = {
          ...prev.origemTypes,
          [productKey]: {
            ...prev.origemTypes?.[productKey],
            [origemType]: enabled,
          },
        };
        return {
          ...prev,
          origemTypes: newOrigemTypes,
        };
      });
    },
    []
  );

  const getFeatureVariant = useCallback(
    (featureKey: string, fallbackVariant: string = "v1"): string => {
      return (
        config.featureVariants?.[featureKey] ??
        defaultConfig.featureVariants?.[featureKey] ??
        fallbackVariant
      );
    },
    [config.featureVariants]
  );

  const setFeatureVariant = useCallback((featureKey: string, variant: string) => {
    setConfig((prev) => ({
      ...prev,
      featureVariants: {
        ...prev.featureVariants,
        [featureKey]: variant,
      },
    }));
  }, []);

  const getEnabledOrigemTypes = useCallback(
    (productKey: string): string[] => {
      const origemTypes = config.origemTypes?.[productKey] || defaultConfig.origemTypes?.[productKey] || {};
      return Object.entries(origemTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type, _]) => type);
    },
    [config]
  );

  const reloadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FeaturesConfig;
        // Merge com default para garantir que novas features sejam incluídas
        setConfig({
          produtos: { ...defaultConfig.produtos, ...parsed.produtos },
          features: { ...defaultConfig.features, ...parsed.features },
          origemTypes: parsed.origemTypes
            ? Object.keys(parsed.origemTypes).reduce((acc, key) => {
                acc[key] = {
                  ...defaultConfig.origemTypes?.[key],
                  ...parsed.origemTypes?.[key],
                };
                return acc;
              }, {} as any)
            : defaultConfig.origemTypes,
          featureVariants: {
            ...defaultConfig.featureVariants,
            ...parsed.featureVariants,
          },
        });
      } else {
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error("Erro ao recarregar configurações de features:", error);
    }
  }, []);

  return (
    <FeaturesContext.Provider
      value={{
        config,
        isProductEnabled,
        isFeatureEnabled,
        isOrigemTypeEnabled,
        toggleProduct,
        toggleFeature,
        toggleOrigemType,
        setProduct,
        setFeature,
        setOrigemType,
        getEnabledOrigemTypes,
        reloadFromStorage,
        getFeatureVariant,
        setFeatureVariant,
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeaturesContext() {
  const context = useContext(FeaturesContext);
  if (context === undefined) {
    throw new Error("useFeaturesContext deve ser usado dentro de FeaturesProvider");
  }
  return context;
}

