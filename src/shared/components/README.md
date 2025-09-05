# Common Layout Components for Category-Based Features

This directory contains reusable components for implementing category-based features like printables, compliance, resources, brand-materials, and custom-shop.

## Components Overview

### 1. CategoryLandingPage

A landing page component that displays categories in a grid layout. Each category is represented by a card with an icon, title, description, and action button.

**Usage:**
```tsx
import { CategoryLandingPage } from "@/shared/components";

<CategoryLandingPage
  title="Printables"
  subtitle="Printable documents applicable for all provinces"
  description="Access printable documents organized by province."
  categories={categories}
  isLoading={isLoading}
  error={error}
  onCategorySelect={handleCategorySelect}
  buttonLabel="View Documents"
  emptyStateMessage="No printable categories found"
  retryAction={retry}
/>
```

**Props:**
- `title`: Main page title
- `subtitle`: Optional subtitle
- `description`: Optional description text
- `categories`: Array of category items
- `isLoading`: Loading state
- `error`: Error message if any
- `onCategorySelect`: Callback when a category is selected
- `buttonLabel`: Text for the action button
- `layout`: "grid" or "list" layout
- `emptyStateMessage`: Message when no categories exist
- `retryAction`: Function to retry on error

### 2. CategoryItemsList

A component for displaying items within a specific category. Supports search, filtering, and grid/list layouts.

**Usage:**
```tsx
import { CategoryItemsList } from "@/shared/components";

<CategoryItemsList
  title="Alberta Printable Documents"
  subtitle="Printable documents applicable for Alberta"
  items={items}
  isLoading={isLoading}
  error={error}
  onItemSelect={handleItemSelect}
  buttonLabel="View Printable"
  showSearchAndFilter={true}
  onSearch={handleSearch}
  onFilterChange={handleFilterChange}
  availableFilters={["Alberta"]}
/>
```

**Props:**
- `title`: Page title
- `subtitle`: Optional subtitle
- `items`: Array of items to display
- `isLoading`: Loading state
- `error`: Error message if any
- `onItemSelect`: Callback when an item is selected
- `buttonLabel`: Text for the action button
- `layout`: "grid" or "list" layout
- `showSearchAndFilter`: Enable search and filter UI
- `onSearch`: Search callback function
- `onFilterChange`: Filter change callback function
- `availableFilters`: Array of available filter options

## Data Types

### CategoryItem
```tsx
interface CategoryItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: {
    url: string;
    alternativeText?: string;
    formats?: {
      thumbnail?: { url: string };
    };
  };
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}
```

## Hooks

### useCategoryData

A generic hook for managing category-based data with search and filtering capabilities.

**Usage:**
```tsx
import { useCategoryData } from "@/shared/hooks/use-category-data";

const { categories, filteredItems, searchQuery, selectedCategory, setSearchQuery, setSelectedCategory } = useCategoryData({
  data: documents,
  categoryExtractor: (doc) => doc.province,
  itemTransformer: (doc) => ({
    id: doc.province,
    title: doc.province,
    description: `${doc.count} documents available`,
  }),
  searchFields: ["title", "description"],
});
```

## API Client

### CategoryApiClient

A common API client for fetching category-based data from different endpoints.

**Usage:**
```tsx
import { CategoryApiClient } from "@/shared/lib/category-api-client";

const apiClient = new CategoryApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
});

// Fetch printables
const printables = await apiClient.fetchPrintables();

// Fetch compliance documents
const compliance = await apiClient.fetchComplianceDocuments();

// Transform to categories
const categories = apiClient.transformDocumentsToCategories(documents, "province");
```

## Implementation Examples

### Printables Feature
```tsx
// Landing page
<PrintablesLandingPage />

// Category items page
<PrintablesCategoryItems category="Alberta" />
```

### Compliance Feature
```tsx
// Landing page
<ComplianceLandingPage />

// Category items page
<ComplianceCategoryItems category="Ontario" />
```

### Brand Materials Feature
```tsx
// Landing page
<BrandMaterialsLandingPage />

// Category items page
<BrandMaterialsCategoryItems category="Banners" />
```

## Styling

All components use Tailwind CSS classes and follow the design system established in the project. The components are responsive and include:

- Loading skeletons
- Error states with retry functionality
- Empty states
- Hover effects and transitions
- Accessible keyboard navigation
- Responsive grid layouts

## Customization

Components can be customized through:
- Props for different button labels, titles, and messages
- CSS classes via the `className` prop
- Custom icons and thumbnails
- Different layout options (grid vs list)
- Custom search and filter implementations

## Best Practices

1. **Consistent Naming**: Use consistent naming conventions for categories and items
2. **Error Handling**: Always provide meaningful error messages and retry functionality
3. **Loading States**: Show loading skeletons during data fetching
4. **Accessibility**: Ensure keyboard navigation and screen reader support
5. **Performance**: Use the provided hooks for efficient data management
6. **Type Safety**: Leverage TypeScript interfaces for type safety
