import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className 
}) => {
  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown
        components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-lg font-semibold text-foreground mb-2 mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold text-foreground mb-2 mt-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-foreground mb-1 mt-2">
            {children}
          </h3>
        ),
        
        // Paragraphs
        p: ({ children }) => (
          <p className="text-foreground/90 mb-2 last:mb-0 leading-relaxed">
            {children}
          </p>
        ),
        
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-2 text-foreground/90">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-2 text-foreground/90">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        
        // Strong/Bold text
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        
        // Emphasis/Italic text
        em: ({ children }) => (
          <em className="italic text-foreground/90">{children}</em>
        ),
        
        // Code
        code: ({ children }) => (
          <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">
            {children}
          </code>
        ),
        
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/30 pl-3 my-2 text-foreground/80 italic">
            {children}
          </blockquote>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            className="text-primary hover:text-primary/80 underline"
            target="_blank" 
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};