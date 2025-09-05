export interface ApiResponse<T> {
  data: T | null;
  status: number;
  success: boolean;
  error?: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity {
  id: number;
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiPopulate {
  [key: string]: boolean | string | StrapiPopulate;
}

export interface StrapiParams {
  populate?: StrapiPopulate | string;
  filters?: Record<string, any>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  fields?: string[];
  locale?: string;
  publicationState?: "live" | "preview";
}
