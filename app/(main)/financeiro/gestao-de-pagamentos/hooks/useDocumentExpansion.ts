import { useState, useCallback } from 'react';

export function useDocumentExpansion() {
  const [expandedDocs, setExpandedDocs] = useState<Set<number>>(new Set());
  const [lastExpandedIdx, setLastExpandedIdx] = useState<number | null>(null);

  const toggleExpansion = useCallback((idx: number) => {
    setExpandedDocs(prev => {
      const next = new Set(prev);
      const willOpen = !next.has(idx);
      
      if (willOpen) {
        next.add(idx);
        setLastExpandedIdx(idx);
      } else {
        next.delete(idx);
      }
      
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setExpandedDocs(new Set());
    setLastExpandedIdx(null);
  }, []);

  const scrollToExpanded = (containerRef: React.RefObject<HTMLElement>, dataAttr: string) => {
    if (lastExpandedIdx == null || !expandedDocs.has(lastExpandedIdx)) return;
    
    const root = containerRef.current;
    if (!root) return;
    
    const el = root.querySelector(`[${dataAttr}="${lastExpandedIdx}"]`) as HTMLElement | null;
    if (el && 'scrollIntoView' in el) {
      const timer = setTimeout(() => {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        } catch {}
      }, 50);
      return () => clearTimeout(timer);
    }
  };

  return {
    expandedDocs,
    lastExpandedIdx,
    toggleExpansion,
    reset,
    scrollToExpanded,
  };
}

