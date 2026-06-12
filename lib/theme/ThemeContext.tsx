"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type TagModel = "default" | "compact";
export type OpenAccountTagColor = "blue" | "orange";

export type ThemeConfig = {
  tagModel: TagModel;
  openAccountTagColor: OpenAccountTagColor;
};

const STORAGE_KEY = "qive-theme-config";

const defaultConfig: ThemeConfig = {
  tagModel: "compact",
  openAccountTagColor: "orange",
};

interface ThemeContextType {
  config: ThemeConfig;
  tagModel: TagModel;
  openAccountTagColor: OpenAccountTagColor;
  setTagModel: (model: TagModel) => void;
  setOpenAccountTagColor: (color: OpenAccountTagColor) => void;
  reloadFromStorage: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);

  // Carregar configuração do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ThemeConfig;
        setConfig({
          ...defaultConfig,
          ...parsed,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de tema:", error);
    }
  }, []);

  // Salvar no localStorage quando config mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Erro ao salvar configurações de tema:", error);
    }
  }, [config]);

  const setTagModel = useCallback((model: TagModel) => {
    setConfig((prev) => ({
      ...prev,
      tagModel: model,
    }));
  }, []);

  const setOpenAccountTagColor = useCallback((color: OpenAccountTagColor) => {
    setConfig((prev) => ({
      ...prev,
      openAccountTagColor: color,
    }));
  }, []);

  const reloadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ThemeConfig;
        setConfig({
          ...defaultConfig,
          ...parsed,
        });
      } else {
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error("Erro ao recarregar configurações de tema:", error);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        config,
        tagModel: config.tagModel,
        openAccountTagColor: config.openAccountTagColor,
        setTagModel,
        setOpenAccountTagColor,
        reloadFromStorage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext deve ser usado dentro de ThemeProvider");
  }
  return context;
}

