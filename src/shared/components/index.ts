// Common Layout Components
export { default as CategoryLandingPage } from "./category-landing-page";
export { default as CategoryItemsList } from "./category-items-list";
export { default as DocumentViewer } from "./document-viewer";

// Content List/Detail Components
export { default as ContentListPage } from "./content-list-page";
export { default as ContentDetailPage } from "./content-detail-page";
export { default as MarkdownRenderer } from "./markdown-renderer";
export { default as BodyTextRenderer } from "./body-text-renderer";

// Legacy Feature Layout Components
export { default as StaticPageLayout } from "./static-page-layout";
export { default as EmbeddedContentLayout } from "./embedded-content-layout";
export { default as AwardsLayout } from "./awards-layout";
export { default as BrandGuidelinesLayout } from "./brand-guidelines-layout";
export { default as BrandMaterialsLayout } from "./brand-materials-layout";

// Re-export types for convenience
export type { CategoryItem, CategoryLandingPageProps } from "./category-landing-page";
export type { CategoryItemsListProps } from "./category-items-list";
export type { DocumentViewerProps } from "./document-viewer";
export type { ContentItem, ContentListPageProps } from "./content-list-page";
export type { ContentDetailItem, ContentDetailPageProps } from "./content-detail-page";
export type { MarkdownRendererProps } from "./markdown-renderer";
export type { BodyTextRendererProps } from "./body-text-renderer";
export type { StaticPageData, StaticPageLayoutProps } from "./static-page-layout";
export type { EmbeddedContentData, EmbeddedContentLayoutProps, FilterOption } from "./embedded-content-layout";
export type { AwardsPageData, AwardsLayoutProps, AwardsPrize, AdditionalAward } from "./awards-layout";
export type { BrandGuidelinesData, BrandGuidelinesLayoutProps, ColorPalette } from "./brand-guidelines-layout";
export type { BrandMaterialsData, BrandMaterialsLayoutProps, BrandMaterial } from "./brand-materials-layout";

// Re-export existing shared components
export * from "@/shared/ui";
