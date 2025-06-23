'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeExampleProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeExample({ code, language = 'typescript', title }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {title && (
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors z-10"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-300" />
          )}
        </button>
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            fontSize: '14px',
            paddingRight: '3rem',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}