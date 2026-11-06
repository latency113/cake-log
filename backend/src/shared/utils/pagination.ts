export interface PaginationParams {
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  itemsPerPage: number;
  total: number;
  totalPages: number;
  nextPage: boolean;
  previousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta_data: PaginationMeta;
}

export const getPaginationParams = (page = 1, itemsPerPage = 10): PaginationParams => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeItemsPerPage = Math.max(1, Number(itemsPerPage) || 10);
  return {
    skip: (safePage - 1) * safeItemsPerPage,
    take: safeItemsPerPage,
  };
};

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page = 1,
  itemsPerPage = 10
): PaginatedResult<T> => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeItemsPerPage = Math.max(1, Number(itemsPerPage) || 10);
  const totalPages = Math.ceil(total / safeItemsPerPage);

  return {
    data,
    meta_data: {
      page: safePage,
      itemsPerPage: safeItemsPerPage,
      total,
      totalPages,
      nextPage: safePage < totalPages,
      previousPage: safePage > 1,
    },
  };
};