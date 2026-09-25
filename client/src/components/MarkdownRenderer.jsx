import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Normalizes raw LLM output so remark-gfm reliably parses tables, bold text, and lists.
 */
function normalizeMarkdown(text) {
  if (!text) return '';
  let normalized = text;

  // 1. Ensure table starting line is preceded by a double newline if preceded by text/heading
  normalized = normalized.replace(/([^\n])\n(\|.*\|)\n(\|[-:\s|]+\|)/g, '$1\n\n$2\n$3');

  // 2. Ensure list items have clean spacing if preceded directly by text
  normalized = normalized.replace(/([^\n])\n(-|\*|\d+\.)\s+/g, '$1\n\n$2 ');

  return normalized;
}

/**
 * MarkdownRenderer
 * Renders AI assistant messages with formatted markdown, bold text, tables, and lists.
 */
const MarkdownRenderer = ({ content = '', className = '' }) => {
  if (!content) return null;

  const cleanContent = normalizeMarkdown(content);

  return (
    <div className={`markdown-content text-left leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-extrabold text-[#111827] dark:text-white mt-3 mb-2 tracking-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-bold text-[#111827] dark:text-white mt-2.5 mb-1.5 tracking-tight" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-bold text-[#111827] dark:text-white mt-2 mb-1 uppercase tracking-wider" {...props} />
          ),
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-[#1f2937] dark:text-[#f3f4f6]" {...props} />
          ),
          // Strong / Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-[#111827] dark:text-white" {...props} />
          ),
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside space-y-1.5 my-2.5 pl-4 text-[#1f2937] dark:text-[#f3f4f6]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside space-y-1.5 my-2.5 pl-4 text-[#1f2937] dark:text-[#f3f4f6]" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed marker:text-slate-500 dark:marker:text-slate-400" {...props} />
          ),
          // Table with clean minimal border styling (no glassmorphism blur inside table)
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-2xl border border-[#e2e5f0] dark:border-[#272a33] bg-white dark:bg-[#18191d] shadow-sm">
              <table className="min-w-full divide-y divide-[#e2e5f0] dark:divide-[#272a33] text-left text-xs" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#f0f2fa] dark:bg-[#131417] text-[#111827] dark:text-white font-bold" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-[#e2e5f0] dark:divide-[#22242a]" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-[#f8f9fd] dark:hover:bg-[#1a1c22] transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2.5 font-bold text-[11px] tracking-wider uppercase text-[#111827] dark:text-white" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2.5 text-[#374151] dark:text-[#d1d5db] whitespace-normal leading-normal text-xs" {...props} />
          ),
          // Code Blocks & Inline Code
          code: ({ node, inline, className: codeClass, children, ...props }) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-[#e6e9f6] dark:bg-[#252831] text-[#111827] dark:text-[#f3f4f6] font-mono text-[11px] font-semibold" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3.5 my-2.5 rounded-2xl bg-[#111827] dark:bg-black text-slate-100 font-mono text-xs overflow-x-auto border border-black/20">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-3 border-[#111827] dark:border-white pl-3.5 my-2.5 italic text-slate-600 dark:text-slate-400 text-xs" {...props} />
          ),
          hr: () => <hr className="my-3 border-[#e2e5f0] dark:border-[#272a33]" />,
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
