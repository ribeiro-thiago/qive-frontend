import { TagModel } from "./ThemeContext";

/**
 * Retorna as classes CSS para tags baseado no modelo de tema
 */
export function getTagClasses(tagModel: TagModel): {
  base: string;
  applyBorder: (borderClass: string) => string;
} {
  const isCompact = tagModel === 'compact';

  return {
    base: isCompact
      ? "inline-flex items-center h-5 py-[2px] px-2 rounded font-bold leading-4 text-xs"
      : "inline-flex items-center h-6 px-2 rounded-full border font-medium text-xs",
    applyBorder: (borderClass: string) => {
      return isCompact ? '' : borderClass;
    },
  };
}






