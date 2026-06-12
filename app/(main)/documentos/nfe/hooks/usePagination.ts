import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], initialPageSize = 20) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginatedItems = useMemo(() => {
    const start = page * pageSize;
    const end = Math.min(items.length, start + pageSize);
    return items.slice(start, end);
  }, [items, page, pageSize]);

  const totalPages = Math.ceil(items.length / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPage(0);
    setPageSize(newSize);
  };

  const nextPage = () => {
    if ((page + 1) * pageSize < items.length) {
      setPage(p => p + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage(p => p - 1);
    }
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize: handlePageSizeChange,
    paginatedItems,
    totalPages,
    nextPage,
    prevPage,
    hasNextPage: (page + 1) * pageSize < items.length,
    hasPrevPage: page > 0,
  };
}

