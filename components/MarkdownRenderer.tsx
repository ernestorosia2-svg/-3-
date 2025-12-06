import React from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // A simple way to render the specific structure requested without a heavy parser.
  // We split by lines and apply styling based on simple markdown rules.
  // In a production app, we would use react-markdown, but this ensures standalone functionality.
  const renderLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-3xl font-bold text-slate-900 mt-8 mb-6 pb-2 border-b border-slate-200 math-font">{line.replace('# ', '')}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-bold text-slate-800 mt-8 mb-4 flex items-center"><span className="w-1.5 h-6 bg-blue-600 rounded mr-3 inline-block"></span>{line.replace('## ', '')}</h2>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-lg font-semibold text-slate-700 mt-6 mb-3">{line.replace('### ', '')}</h3>;
    }

    // List items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().substring(2);
      return (
        <div key={index} className="flex items-start mb-2 ml-4">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-3 flex-shrink-0"></span>
          <p className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInlineStyles(text) }}></p>
        </div>
      );
    }

    // Numbered lists (simple detection)
    if (/^\d+\./.test(line.trim())) {
       return (
        <div key={index} className="flex items-start mb-2 ml-4">
          <span className="font-mono text-slate-500 font-bold mr-3 mt-0.5">{line.trim().split('.')[0]}.</span>
          <p className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInlineStyles(line.trim().replace(/^\d+\.\s*/, '')) }}></p>
        </div>
      );
    }

    // Empty lines
    if (line.trim() === '') {
      return <div key={index} className="h-4"></div>;
    }

    // Standard paragraphs
    return <p key={index} className="text-slate-700 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }}></p>;
  };

  // Basic inline parser for bold and basic math
  const parseInlineStyles = (text: string) => {
    let parsed = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em class="text-slate-800 italic">$1</em>') // Italic
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm text-pink-600 font-mono">$1</code>') // Inline Code
      .replace(/\$([^$]+)\$/g, '<span class="math-font text-blue-700 italic">$1</span>'); // Basic Math LaTeX simulation
    return parsed;
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleCopy}
          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center space-x-2 text-slate-600 text-xs font-medium"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
        </button>
      </div>
      <div className="p-8 md:p-12 max-w-4xl mx-auto">
        {content.split('\n').map((line, idx) => renderLine(line, idx))}
      </div>
    </div>
  );
};
