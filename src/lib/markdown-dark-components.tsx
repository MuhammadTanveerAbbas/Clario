"use client";

import type { Components } from "react-markdown";

/** ReactMarkdown component map for dark surfaces (chat bubbles, remix cards). */
export function getMarkdownDarkComponents(): Partial<Components> {
  return {
    script: () => null,
    p: ({ children, ...props }) => (
      <p className="mb-2.5 last:mb-0 leading-[1.7] text-[14.5px]" style={{ color: "var(--text)" }} {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-5 mb-2.5 space-y-1" style={{ color: "var(--text)" }} {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-5 mb-2.5 space-y-1" style={{ color: "var(--text)" }} {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-[1.6]" style={{ color: "var(--text)" }} {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold" style={{ color: "var(--text)" }} {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" style={{ color: "var(--text2)" }} {...props}>
        {children}
      </em>
    ),
    h1: ({ children, ...props }) => (
      <h1 className="text-lg font-bold mt-3 mb-2" style={{ color: "var(--text)" }} {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-base font-bold mt-3 mb-1.5" style={{ color: "var(--text)" }} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-[15px] font-semibold mt-2.5 mb-1" style={{ color: "var(--text)" }} {...props}>
        {children}
      </h3>
    ),
    code: ({ className, children, ...props }) => {
      const inline = !className;
      if (inline) {
        return (
          <code
            className="px-1.5 py-0.5 rounded text-[13px] font-mono"
            style={{ background: "var(--bg3)", color: "var(--accent)" }}
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={`${className} text-sm font-mono`} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre
        className="rounded-lg p-3.5 overflow-x-auto my-2.5 border"
        style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        {...props}
      >
        {children}
      </pre>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-3 pl-4 my-2.5 py-2 pr-3 rounded-r-lg"
        style={{ borderColor: "hsl(var(--accent))", background: "var(--bg2)", color: "var(--text2)" }}
        {...props}
      >
        {children}
      </blockquote>
    ),
    a: ({ children, ...props }) => (
      <a
        className="underline underline-offset-2"
        style={{ color: "hsl(var(--accent))" }}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    hr: (props) => <hr className="my-3" style={{ borderColor: "var(--border)" }} {...props} />,
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-2.5">
        <table className="w-full text-sm border-collapse" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th
        className="border px-3 py-1.5 font-semibold text-left"
        style={{ borderColor: "var(--border)", background: "var(--bg3)", color: "var(--text)" }}
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border px-3 py-1.5" style={{ borderColor: "var(--border)", color: "var(--text)" }} {...props}>
        {children}
      </td>
    ),
  };
}
