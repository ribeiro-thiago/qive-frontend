import * as React from 'react';
import { Row } from '../types';

interface ViewedState {
  [tabId: string]: Set<string>; // Set de IDs de contas visualizadas em cada tab
}

// Funções helper para localStorage
const STORAGE_KEY = 'contasAPagar.viewedItems';

const loadViewedItems = (): ViewedState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Converte arrays de volta para Sets
      const result: ViewedState = {};
      for (const [key, value] of Object.entries(parsed)) {
        result[key] = new Set(value as string[]);
      }
      return result;
    }
  } catch (error) {
    console.error('Erro ao carregar itens visualizados:', error);
  }
  return {};
};

const saveViewedItems = (viewedItems: ViewedState) => {
  try {
    // Converte Sets para arrays para JSON
    const toSave: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(viewedItems)) {
      toSave[key] = Array.from(value);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Erro ao salvar itens visualizados:', error);
  }
};

export function useNewItemsIndicator(currentTab: string, data: Row[]) {
  // Não carrega do localStorage - sempre começa vazio após refresh
  const [viewedItems, setViewedItems] = React.useState<ViewedState>({});
  const [highlightItems, setHighlightItems] = React.useState<Set<string>>(new Set());
  const prevTabRef = React.useRef<string>(currentTab);
  const highlightTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Calcula quantos itens novos existem em cada tab
  const getNewItemsCount = React.useCallback((tabId: string): number => {
    const itemsInTab = data.filter(r => r.lancadoEm === tabId);
    const viewedInThisTab = viewedItems[tabId] || new Set();
    
    // Considera como "novo" se não foi visualizado NESTA TAB ESPECÍFICA
    const newItems = itemsInTab.filter(r => !viewedInThisTab.has(r.id));
    return newItems.length;
  }, [data, viewedItems]);

  // Quando o usuário muda de tab, aplica o efeito visual nos itens novos daquela tab
  React.useEffect(() => {
    // Se mudou de tab
    if (prevTabRef.current !== currentTab) {
      // Cancela timeout anterior se existir
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }

      const itemsInCurrentTab = data.filter(r => r.lancadoEm === currentTab);
      
      // Usa o estado atual de viewedItems (captura do closure)
      setViewedItems(prev => {
        const viewedInTab = prev[currentTab] || new Set();
        
        // Encontra itens novos (não visualizados) na tab atual
        const newItemsInTab = itemsInCurrentTab
          .filter(r => !viewedInTab.has(r.id))
          .map(r => r.id);
        
        // Se há itens novos, aplica o highlight
        if (newItemsInTab.length > 0) {
          setHighlightItems(new Set(newItemsInTab));
          
          // Remove o highlight após 1.5 segundos
          highlightTimeoutRef.current = setTimeout(() => {
            setHighlightItems(new Set());
            highlightTimeoutRef.current = null;
          }, 1500);
        } else {
          // Se não há itens novos, remove qualquer highlight existente
          setHighlightItems(new Set());
        }
        
        // Marca todos os itens da tab atual como visualizados
        return {
          ...prev,
          [currentTab]: new Set(itemsInCurrentTab.map(r => r.id)),
        };
      });
      
      prevTabRef.current = currentTab;
    }
  }, [currentTab, data]);

  // Cleanup: cancela timeout ao desmontar
  React.useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // Inicialização: marca a tab inicial como visualizada automaticamente
  const isInitialized = React.useRef(false);
  
  React.useEffect(() => {
    if (!isInitialized.current && data.length > 0) {
      isInitialized.current = true;
      
      // Tabs que devem ser marcadas como já visualizadas desde o início
      // (tabs de histórico/arquivo que não recebem itens novos com frequência)
      const preViewedTabs = ['aprovacao', 'bloqueados', 'liquidados', 'cancelados'];
      
      const initialViewedState: ViewedState = {};
      
      // Marca os itens da tab atual como visualizados
      const itemsInCurrentTab = data
        .filter(r => r.lancadoEm === currentTab)
        .map(r => r.id);
      
      if (itemsInCurrentTab.length > 0) {
        initialViewedState[currentTab] = new Set(itemsInCurrentTab);
      }
      
      // Marca as tabs de histórico como já visualizadas
      preViewedTabs.forEach(tabId => {
        const itemsInTab = data
          .filter(r => r.lancadoEm === tabId)
          .map(r => r.id);
        
        if (itemsInTab.length > 0) {
          initialViewedState[tabId] = new Set(itemsInTab);
        }
      });
      
      setViewedItems(initialViewedState);
    }
  }, [data, currentTab]);

  const hasNewItems = React.useCallback((tabId: string): boolean => {
    return getNewItemsCount(tabId) > 0;
  }, [getNewItemsCount]);

  const isRecentlyAdded = React.useCallback((itemId: string): boolean => {
    return highlightItems.has(itemId);
  }, [highlightItems]);

  return {
    hasNewItems,
    getNewItemsCount,
    isRecentlyAdded,
  };
}

