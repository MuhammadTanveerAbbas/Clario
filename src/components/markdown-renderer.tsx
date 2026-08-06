"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getMarkdownDarkComponents } from "@/lib/markdown-dark-components";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={getMarkdownDarkComponents()}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
