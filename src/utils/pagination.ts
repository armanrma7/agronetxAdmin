export interface NormalizedPaginated<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

export const normalizePaginated = <T,>(
  data: any,
  listKeyCandidates: string[]
): NormalizedPaginated<T> => {
  if (!data) return { items: [], total: 0 };

  if (Array.isArray(data)) {
    return { items: data as T[], total: data.length };
  }

  for (const key of listKeyCandidates) {
    const list = data?.[key];
    if (Array.isArray(list)) {
      return {
        items: list as T[],
        total: typeof data.total === "number" ? data.total : list.length,
        page: typeof data.page === "number" ? data.page : undefined,
        limit: typeof data.limit === "number" ? data.limit : undefined
      };
    }
  }

  if (Array.isArray(data.items)) {
    return {
      items: data.items as T[],
      total: typeof data.total === "number" ? data.total : data.items.length
    };
  }

  return { items: [], total: 0 };
};

