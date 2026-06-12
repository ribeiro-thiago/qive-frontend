"use client";

import * as React from "react";

export function useListingPagination<T>(items: T[], initialPageSize = 25) {
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const paginatedItems = React.useMemo(() => {
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, Math.max(0, totalPages - 1));

  React.useEffect(() => {
    setPage(0);
  }, [items.length, pageSize]);

  React.useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const handlePageSizeChange = (newSize: number) => {
    setPage(0);
    setPageSize(newSize);
  };

  return {
    page: safePage,
    pageSize,
    setPage,
    setPageSize: handlePageSizeChange,
    paginatedItems,
    hasNextPage: (safePage + 1) * pageSize < items.length,
    hasPrevPage: safePage > 0,
    totalItems: items.length,
  };
}
