"use client";

import React from "react";
import { Markdown } from "./markdown";
import { cn } from "@/shared/lib/utils";

export interface BodyTextRendererProps {
  content: string;
  className?: string;
}

/**
 * Detects if content is markdown and renders accordingly
 * Uses similar logic to content-detail-page component
 */
const isMarkdownContent = (content: string): boolean => {
  if (!content) return false;
  
  // Check for common markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // Headers (# ## ### etc)
    /\*\*.*?\*\*/,           // Bold text
    /\*.*?\*/,               // Italic text
    /__.*?__/,               // Bold text (alternative)
    /_.*?_/,                 // Italic text (alternative)
    /\[.*?\]\(.*?\)/,        // Links
    /^\s*[-*+]\s+/m,         // Unordered lists
    /^\s*\d+\.\s+/m,         // Ordered lists
    /```[\s\S]*?```/,        // Code blocks
    /`.*?`/,                 // Inline code
    /^\s*>\s+/m,             // Blockquotes
    /\n\n/,                  // Double line breaks (paragraph separation)
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
};

const BodyTextRenderer: React.FC<BodyTextRendererProps> = ({
  content,
  className,
}) => {
  if (!content) {
    return null;
  }

  const shouldRenderAsMarkdown = isMarkdownContent(content);

  if (shouldRenderAsMarkdown) {
    return (
      <Markdown className={cn("prose-lg", className)}>
        {content}
      </Markdown>
    );
  }

  // Render as plain text with basic formatting
  return (
    <div
      className={cn(
        "text-muted-foreground leading-relaxed",
        "whitespace-pre-wrap", // Preserve line breaks
        className
      )}
    >
      {content}
    </div>
  );
};

export default BodyTextRenderer;
export { BodyTextRenderer };
