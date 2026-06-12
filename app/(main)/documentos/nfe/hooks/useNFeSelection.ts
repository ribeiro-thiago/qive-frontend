import { useState, useCallback } from 'react';

export function useNFeSelection(totalCount: number) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleRow = useCallback((index: number, checked?: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (checked === undefined) {
        next.has(index) ? next.delete(index) : next.add(index);
      } else {
        checked ? next.add(index) : next.delete(index);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback((checked: boolean, visibleIndices: number[]) => {
    if (checked) {
      setSelected(new Set(visibleIndices));
    } else {
      setSelected(new Set());
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const hasSelection = selected.size > 0;
  const allSelected = totalCount > 0 && selected.size === totalCount;

  return {
    selected,
    setSelected,
    toggleRow,
    toggleAll,
    clearSelection,
    hasSelection,
    allSelected,
  };
}

