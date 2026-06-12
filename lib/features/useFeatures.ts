import { useFeaturesContext } from "./FeaturesContext";

/**
 * Hook simplificado para acessar e modificar features
 */
export function useFeatures() {
  const context = useFeaturesContext();

  return {
    features: context.config,
    isProductEnabled: context.isProductEnabled,
    isFeatureEnabled: context.isFeatureEnabled,
    isOrigemTypeEnabled: context.isOrigemTypeEnabled,
    toggleProduct: context.toggleProduct,
    toggleFeature: context.toggleFeature,
    toggleOrigemType: context.toggleOrigemType,
    setProduct: context.setProduct,
    setFeature: context.setFeature,
    setOrigemType: context.setOrigemType,
    getEnabledOrigemTypes: context.getEnabledOrigemTypes,
    reloadFromStorage: context.reloadFromStorage,
    getFeatureVariant: context.getFeatureVariant,
    setFeatureVariant: context.setFeatureVariant,
    getPagarButtonVersion: () =>
      context.getFeatureVariant("gestao-de-pagamentos.pagar-button", "v2"),
  };
}

