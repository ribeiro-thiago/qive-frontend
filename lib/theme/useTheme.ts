import { useThemeContext } from "./ThemeContext";

/**
 * Hook simplificado para acessar e modificar tema
 */
export function useTheme() {
  const context = useThemeContext();

  return {
    tagModel: context.tagModel,
    openAccountTagColor: context.openAccountTagColor,
    setTagModel: context.setTagModel,
    setOpenAccountTagColor: context.setOpenAccountTagColor,
    reloadFromStorage: context.reloadFromStorage,
  };
}

