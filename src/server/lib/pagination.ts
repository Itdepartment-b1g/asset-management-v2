import "server-only";

export type PaginationInput = {
  page?: number;
  limit?: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginationMeta;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Normalize page/limit from API input and compute Prisma skip/take.
export function parse_pagination(input?: PaginationInput) {
  const page = Math.max(1, input?.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, input?.limit ?? DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
}

export function build_pagination_meta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const total_pages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    total_pages,
    has_next_page: page < total_pages,
    has_prev_page: page > 1,
  };
}

// Run count + findMany in parallel and return a standard paginated shape.
export async function paginated_query<T>({
  page,
  limit,
  skip,
  take,
  count,
  find_many,
}: {
  page: number;
  limit: number;
  skip: number;
  take: number;
  count: () => Promise<number>;
  find_many: (args: { skip: number; take: number }) => Promise<T[]>;
}): Promise<PaginatedResult<T>> {
  const [total, data] = await Promise.all([
    count(),
    find_many({ skip, take }),
  ]);

  return {
    data,
    meta: build_pagination_meta(total, page, limit),
  };
}
