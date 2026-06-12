import { useState, useEffect } from 'react';
import { NFeTab } from '../types';

export function useNFeTabs(defaultTab: NFeTab = 'recebidas') {
  const [currentTab, setCurrentTab] = useState<NFeTab>(defaultTab);

  // Limpar seleção quando mudar de tab
  const handleTabChange = (newTab: string) => {
    setCurrentTab(newTab as NFeTab);
  };

  return {
    currentTab,
    setCurrentTab: handleTabChange,
  };
}

