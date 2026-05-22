export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
}

/**
 * Parses query parameters for pagination.
 * Standardizes defaults: page = 1, limit = 20, maxLimit = 100.
 */
export function parsePagination(query: any): PaginationParams {
  let page = parseInt(query.page as string, 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  let limit = parseInt(query.limit as string, 10);
  if (isNaN(limit) || limit < 1) {
    limit = 20;
  }
  if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;
  const take = limit;

  return { page, limit, skip, take };
}

/**
 * Formats data and metadata into a standard paginated response object.
 */
export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;

  return {
    items,
    total,
    page,
    totalPages,
    hasNext,
  };
}
