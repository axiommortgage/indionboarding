# Quick Implementation Guide for Category-Based Features

This guide shows how to quickly implement the remaining features (compliance, resources, brand-materials, custom-shop) using the common layout components.

## 1. Compliance Feature

### Create the landing page component:
```tsx
// src/features/compliance/components/compliance-landing-page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CategoryLandingPage, CategoryItem } from "@/shared/components";
import { useCompliance } from "../hooks/use-compliance";

const ComplianceLandingPage: React.FC = () => {
  const router = useRouter();
  const { categories, isLoading, error, retry } = useCompliance();

  const handleCategorySelect = (category: CategoryItem) => {
    router.push(`/compliance/${category.id}`);
  };

  return (
    <CategoryLandingPage
      title="Compliance"
      subtitle="Compliance documents applicable for all provinces"
      description="Access compliance documents organized by province. Each province contains relevant compliance forms and documents."
      categories={categories}
      isLoading={isLoading}
      error={error}
      onCategorySelect={handleCategorySelect}
      buttonLabel="View Documents"
      emptyStateMessage="No compliance categories found"
      retryAction={retry}
    />
  );
};

export default ComplianceLandingPage;
```

### Create the hook:
```tsx
// src/features/compliance/hooks/use-compliance.ts
import { useState, useEffect } from "react";
import { CategoryItem } from "@/shared/components";
import { DocumentItem, CategoryApiClient } from "@/shared/lib/category-api-client";
import { useCategoryData } from "@/shared/hooks/use-category-data";

export function useCompliance() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new CategoryApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  });

  const fetchCompliance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.fetchComplianceDocuments();
      setDocuments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch compliance documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  const { categories } = useCategoryData({
    data: documents,
    categoryExtractor: (doc) => {
      if (doc.provinceFile && doc.provinceFile.length > 0) {
        return doc.provinceFile[0].province;
      }
      return "General";
    },
    itemTransformer: (doc) => {
      const province = doc.provinceFile?.[0]?.province || "General";
      const provinceDocs = documents.filter((d) => 
        d.provinceFile?.some((pf) => pf.province === province)
      );
      
      return {
        id: province,
        title: province,
        description: `${provinceDocs.length} document${provinceDocs.length !== 1 ? "s" : ""} available`,
        metadata: { province, documentCount: provinceDocs.length },
      };
    },
    searchFields: ["title", "description"],
  });

  return {
    categories,
    documents,
    isLoading,
    error,
    retry: fetchCompliance,
  };
}
```

## 2. Resources Feature

### Create the landing page component:
```tsx
// src/features/resources/components/resources-landing-page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CategoryLandingPage, CategoryItem } from "@/shared/components";
import { useResources } from "../hooks/use-resources";

const ResourcesLandingPage: React.FC = () => {
  const router = useRouter();
  const { categories, isLoading, error, retry } = useResources();

  const handleCategorySelect = (category: CategoryItem) => {
    router.push(`/resources/${category.id}`);
  };

  return (
    <CategoryLandingPage
      title="Resources"
      subtitle="Resource documents applicable for all provinces"
      description="Access resource documents organized by province. Each province contains relevant resources and materials."
      categories={categories}
      isLoading={isLoading}
      error={error}
      onCategorySelect={handleCategorySelect}
      buttonLabel="View Documents"
      emptyStateMessage="No resource categories found"
      retryAction={retry}
    />
  );
};

export default ResourcesLandingPage;
```

### Create the hook:
```tsx
// src/features/resources/hooks/use-resources.ts
import { useState, useEffect } from "react";
import { CategoryItem } from "@/shared/components";
import { DocumentItem, CategoryApiClient } from "@/shared/lib/category-api-client";
import { useCategoryData } from "@/shared/hooks/use-category-data";

export function useResources() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new CategoryApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  });

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.fetchResourceDocuments();
      setDocuments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch resource documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const { categories } = useCategoryData({
    data: documents,
    categoryExtractor: (doc) => {
      if (doc.provinceFile && doc.provinceFile.length > 0) {
        return doc.provinceFile[0].province;
      }
      return "General";
    },
    itemTransformer: (doc) => {
      const province = doc.provinceFile?.[0]?.province || "General";
      const provinceDocs = documents.filter((d) => 
        d.provinceFile?.some((pf) => pf.province === province)
      );
      
      return {
        id: province,
        title: province,
        description: `${provinceDocs.length} document${provinceDocs.length !== 1 ? "s" : ""} available`,
        metadata: { province, documentCount: provinceDocs.length },
      };
    },
    searchFields: ["title", "description"],
  });

  return {
    categories,
    documents,
    isLoading,
    error,
    retry: fetchResources,
  };
}
```

## 3. Brand Materials Feature

### Create the landing page component:
```tsx
// src/features/brand-materials/components/brand-materials-landing-page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CategoryLandingPage, CategoryItem } from "@/shared/components";
import { useBrandMaterials } from "../hooks/use-brand-materials";

const BrandMaterialsLandingPage: React.FC = () => {
  const router = useRouter();
  const { categories, isLoading, error, retry } = useBrandMaterials();

  const handleCategorySelect = (category: CategoryItem) => {
    router.push(`/brand-materials/${category.id}`);
  };

  return (
    <CategoryLandingPage
      title="Brand Materials"
      subtitle="Brand materials and assets organized by category"
      description="Access brand materials including banners, logos, and marketing assets organized by category."
      categories={categories}
      isLoading={isLoading}
      error={error}
      onCategorySelect={handleCategorySelect}
      buttonLabel="View Items"
      emptyStateMessage="No brand material categories found"
      retryAction={retry}
    />
  );
};

export default BrandMaterialsLandingPage;
```

### Create the hook:
```tsx
// src/features/brand-materials/hooks/use-brand-materials.ts
import { useState, useEffect } from "react";
import { CategoryItem } from "@/shared/components";
import { MediaItem, CategoryApiClient } from "@/shared/lib/category-api-client";
import { useCategoryData } from "@/shared/hooks/use-category-data";

export function useBrandMaterials() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new CategoryApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  });

  const fetchBrandMaterials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.fetchBrandMaterials();
      setMediaItems(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch brand materials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandMaterials();
  }, []);

  const { categories } = useCategoryData({
    data: mediaItems,
    categoryExtractor: (item) => item.category || "General",
    itemTransformer: (item) => {
      const category = item.category || "General";
      const categoryItems = mediaItems.filter((i) => i.category === category);
      
      return {
        id: category,
        title: category,
        description: `${categoryItems.length} item${categoryItems.length !== 1 ? "s" : ""} available`,
        metadata: { category, itemCount: categoryItems.length },
      };
    },
    searchFields: ["title", "description", "category"],
  });

  return {
    categories,
    mediaItems,
    isLoading,
    error,
    retry: fetchBrandMaterials,
  };
}
```

## 4. Custom Shop Feature

### Create the landing page component:
```tsx
// src/features/custom-shop/components/custom-shop-landing-page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CategoryLandingPage, CategoryItem } from "@/shared/components";
import { useCustomShop } from "../hooks/use-custom-shop";

const CustomShopLandingPage: React.FC = () => {
  const router = useRouter();
  const { categories, isLoading, error, retry } = useCustomShop();

  const handleCategorySelect = (category: CategoryItem) => {
    router.push(`/custom-shop/${category.id}`);
  };

  return (
    <CategoryLandingPage
      title="The Custom Shop"
      subtitle="Looking for a specific project? We can help!"
      description="Here are some examples of what we have created in the past. Pick from below or request something new: marketing@indimortgage.ca"
      categories={categories}
      isLoading={isLoading}
      error={error}
      onCategorySelect={handleCategorySelect}
      buttonLabel="View Designs"
      emptyStateMessage="No custom shop categories found"
      retryAction={retry}
    />
  );
};

export default CustomShopLandingPage;
```

### Create the hook:
```tsx
// src/features/custom-shop/hooks/use-custom-shop.ts
import { useState, useEffect } from "react";
import { CategoryItem } from "@/shared/components";
import { MediaItem, CategoryApiClient } from "@/shared/lib/category-api-client";
import { useCategoryData } from "@/shared/hooks/use-category-data";

export function useCustomShop() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new CategoryApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  });

  const fetchCustomShop = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.fetchCustomShopItems();
      setMediaItems(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch custom shop items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomShop();
  }, []);

  const { categories } = useCategoryData({
    data: mediaItems,
    categoryExtractor: (item) => item.category || "General",
    itemTransformer: (item) => {
      const category = item.category || "General";
      const categoryItems = mediaItems.filter((i) => i.category === category);
      
      return {
        id: category,
        title: category,
        description: `${categoryItems.length} design${categoryItems.length !== 1 ? "s" : ""} available`,
        metadata: { category, itemCount: categoryItems.length },
      };
    },
    searchFields: ["title", "description", "category"],
  });

  return {
    categories,
    mediaItems,
    isLoading,
    error,
    retry: fetchCustomShop,
  };
}
```

## 5. Create Category Items Components

For each feature, create a category items component similar to the printables example:

```tsx
// Example for compliance
const ComplianceCategoryItems: React.FC<{ category: string }> = ({ category }) => {
  const { items, isLoading, error, retry } = useComplianceCategory(category);

  return (
    <CategoryItemsList
      title={`${category} Compliance Documents`}
      subtitle={`Compliance documents applicable for ${category}`}
      items={items}
      isLoading={isLoading}
      error={error}
      onItemSelect={handleItemSelect}
      buttonLabel="View Document"
      showSearchAndFilter={true}
      onSearch={handleSearch}
      onFilterChange={handleFilterChange}
      availableFilters={[category]}
    />
  );
};
```

## 6. Update Feature Index Files

For each feature, update the index.ts file to export the new components:

```tsx
// src/features/compliance/index.ts
export { default as ComplianceLandingPage } from "./components/compliance-landing-page";
export { default as ComplianceCategoryItems } from "./components/compliance-category-items";
export { useCompliance } from "./hooks/use-compliance";
export { useComplianceCategory } from "./hooks/use-compliance-category";
```

## 7. Create Page Components

Finally, create the actual page components that use these features:

```tsx
// src/app/(inapp)/printables/page.tsx
import { PrintablesLandingPage } from "@/features/printables";

export default function PrintablesPage() {
  return <PrintablesLandingPage />;
}

// src/app/(inapp)/printables/[category]/page.tsx
import { PrintablesCategoryItems } from "@/features/printables";

export default function PrintablesCategoryPage({ params }: { params: { category: string } }) {
  return <PrintablesCategoryItems category={params.category} />;
}
```

## Summary

By following this pattern, you can quickly implement all five features using the common layout components. The key benefits are:

1. **Consistent UI**: All features will have the same look and feel
2. **Reusable Logic**: Common hooks and API client reduce duplication
3. **Type Safety**: Full TypeScript support across all features
4. **Maintainability**: Changes to the layout only need to be made in one place
5. **Performance**: Optimized rendering and data management

Each feature only needs:
- A landing page component
- A category items component  
- A hook for data management
- Page components for routing
