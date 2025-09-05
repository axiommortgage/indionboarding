"use client";

import { useMemo } from "react";

interface MarkdownProps {
  children: string;
  className?: string;
}

/**
 * Simple markdown detection and rendering component
 * Detects common markdown patterns and renders accordingly
 */
export function Markdown({ children, className = "" }: MarkdownProps) {
  const isMarkdown = useMemo(() => {
    if (!children || typeof children !== "string") return false;
    
    // Check for common markdown patterns
    const markdownPatterns = [
      /^#{1,6}\s+.+$/m,           // Headers (# ## ### etc)
      /\*\*[^*]+\*\*/,            // Bold text **text**
      /\*[^*]+\*/,                // Italic text *text*
      /^\s*[-*+]\s+/m,            // Unordered lists
      /^\s*\d+\.\s+/m,            // Ordered lists
      /\[.+\]\(.+\)/,             // Links [text](url)
      /`[^`]+`/,                  // Inline code `code`
      /^```[\s\S]*?```$/m,        // Code blocks
      /^\s*>\s+/m,                // Blockquotes
    ];
    
    return markdownPatterns.some(pattern => pattern.test(children));
  }, [children]);

  const processedContent = useMemo(() => {
    if (!isMarkdown) {
      return children;
    }

    let processed = children;

    // Process headers
    processed = processed.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level} class="text-${level === 1 ? '3xl' : level === 2 ? '2xl' : level === 3 ? 'xl' : 'lg'} font-bold mb-4 mt-6">${text}</h${level}>`;
    });

    // Process bold text
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');

    // Process italic text
    processed = processed.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Process links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Process inline code
    processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

    // Process line breaks
    processed = processed.replace(/\n\n/g, '</p><p class="mb-4">');
    processed = processed.replace(/\n/g, '<br>');

    // Wrap in paragraph tags
    if (!processed.startsWith('<h') && !processed.startsWith('<p')) {
      processed = `<p class="mb-4">${processed}</p>`;
    }

    return processed;
  }, [children, isMarkdown]);

  if (isMarkdown) {
    return (
      <div 
        className={`prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  }

  // If not markdown, render as HTML or plain text
  if (children.includes('<') && children.includes('>')) {
    return (
      <div 
        className={`prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <p className="mb-4">{children}</p>
    </div>
  );
}
