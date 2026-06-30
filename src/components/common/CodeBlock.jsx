import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ children, language, ...props }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    const codeString = String(children).replace(/\n$/, '');
    navigator.clipboard.writeText(codeString)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Lỗi khi copy code:', err);
      });
  };

  return (
    <div className="relative group/code-block my-2 rounded-lg overflow-hidden border border-gray-250 dark:border-gray-800">
      <button
        onClick={handleCopy}
        type="button"
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/90 text-gray-300 hover:text-white transition-all opacity-0 group-hover/code-block:opacity-100 z-10 focus:opacity-100"
        title="Sao chép mã"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
      <SyntaxHighlighter
        {...props}
        style={vscDarkPlus}
        language={language}
        PreTag="pre"
        codeTagProps={{
          style: {
            backgroundColor: 'transparent',
            padding: 0,
            borderRadius: 0,
            border: 'none',
          }
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
