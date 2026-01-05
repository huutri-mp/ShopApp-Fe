export interface Paging<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type PagingResult<T> = Paging<T>;
