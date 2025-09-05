import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/shared/lib/api";

// API response structure for branches
interface BranchApiResponse {
  data: Array<{
    id: number;
    title: string;
    slug: string;
    address: string;
    city: string;
    province: string;
    postal: string;
    provinceLicenseNumber: string | null;
    suiteUnit: string | null;
    isCorporate: boolean | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    documentId: string;
  }>;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Transformed branch type for our component
export interface Branch {
  id: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  suiteUnit?: string;
  provinceLicenseNumber?: string;
}

export interface UseBranchesResult {
  branches: Branch[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBranches(): UseBranchesResult {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<BranchApiResponse>("/branches");

      if (response.success && response.data) {
        // Check if response has nested data structure or direct array
        const branchesData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        // Transform the API response to match our Branch interface
        const transformedBranches: Branch[] = branchesData.map((branch) => ({
          id: branch.id.toString(),
          address: branch.address || "",
          city: branch.city || "",
          province: branch.province || "",
          postalCode: branch.postal || "",
          suiteUnit: branch.suiteUnit || undefined,
          provinceLicenseNumber: branch.provinceLicenseNumber || undefined,
        }));

        setBranches(transformedBranches);
      } else {
        setError(response.error || "Failed to fetch branches");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch branches");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    branches,
    isLoading,
    error,
    refetch,
  };
}
