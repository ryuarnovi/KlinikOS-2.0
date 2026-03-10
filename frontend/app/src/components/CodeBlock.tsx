"use client";
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  maxHeight?: string;
}

export function CodeBlock({ code, language, title, maxHeight = '500px' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-sm">
      {title && (
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-2 text-sm font-medium text-slate-300">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-400">{language}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
      <div className="overflow-auto" style={{ maxHeight }}>
        <pre className="p-4 text-sm leading-relaxed">
          <code className="text-slate-300 font-mono whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  );
}
