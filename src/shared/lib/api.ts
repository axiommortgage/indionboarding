import { ApiResponse, StrapiResponse } from "@/shared/types/api";
import { getCookie } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:1339";

class ApiError extends Error {
  status: number;
  statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
  }
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Get JWT token from cookies
    const jwt = getCookie("jwt");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if JWT token exists
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }

    // Merge with any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status,
          response.statusText
        );
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          data: null,
          status: error.status,
          success: false,
          error: error.message,
        };
      }

      return {
        data: null,
        status: 500,
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Strapi specific methods
  async getStrapiCollection<T>(
    collection: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<StrapiResponse<T[]>>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return this.get<StrapiResponse<T[]>>(`/${collection}${queryString}`);
  }

  async getStrapiSingle<T>(
    collection: string,
    id: string | number,
    params?: Record<string, any>
  ): Promise<ApiResponse<StrapiResponse<T>>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return this.get<StrapiResponse<T>>(`/${collection}/${id}${queryString}`);
  }
}

export const apiClient = new ApiClient();
export const api = apiClient;
