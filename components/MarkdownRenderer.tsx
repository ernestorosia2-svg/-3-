import React from 'react';
import { Copy, Check, AlertTriangle, Lightbulb, Calculator } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  simple?: boolean; // For chat/notes mode (less padding, no big headers)
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, simple = false }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('# ')) {
      return simple ? <strong key={index} className="block text-lg font-bold mb-2">{line.replace('# ', '')}</strong> : <h1 key={index} className="text-3xl font-bold text-slate-900 mt-8 mb-6 pb-4 border-b border-slate-200 math-font tracking-tight">{line.replace('# ', '')}</h1>;
    }
    if (line.startsWith('## ')) {
       return simple ? <strong key={index} className="block text-base font-bold mt-4 mb-2 text-blue-700">{line.replace('## ', '')}</strong> : <h2 key={index} className="text-xl font-bold text-slate-800 mt-10 mb-5 flex items-center bg-slate-50 p-2 rounded-lg border-l-4 border-blue-600"><span className="ml-2">{line.replace('## ', '')}</span></h2>;
    }
    if (line.startsWith('### ')) {
       return <h3 key={index} className={`${simple ? 'text-sm mt-3' : 'text-lg mt-6'} font-bold text-blue-800 mb-2 flex items-center`}><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>{line.replace('### ', '')}</h3>;
    }

    // Blockquotes (Tips/Warnings/Examples)
    if (line.trim().startsWith('> ')) {
        const text = line.replace('> ', '');
        const isWarning = text.includes('⚠️') || text.includes('注意') || text.includes('错');
        const isExample = text.includes('例') || text.includes('题') || text.includes('解');
        
        let bgColor = 'bg-blue-50 border-blue-400 text-blue-900';
        let icon = <Lightbulb className="w-5 h-5" />;

        if (isWarning) {
            bgColor = 'bg-amber-50 border-amber-400 text-amber-900';
            icon = <AlertTriangle className="w-5 h-5" />;
        } else if (isExample) {
            bgColor = 'bg-emerald-50 border-emerald-400 text-emerald-900';
            icon = <Calculator className="w-5 h-5" />;
        }

        return (
            <div key={index} className={`my-3 p-3 rounded-lg border-l-4 ${bgColor} flex items-start ${simple ? 'text-xs' : 'text-sm'}`}>
                 {!simple && <div className="flex-shrink-0 mt-0.5 mr-3">{icon}</div>}
                 <div className="leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: parseInlineStyles(text) }} />
            </div>
        );
    }

    // Tables (Simple rendering for pipe tables)
    if (line.trim().startsWith('|')) {
      const cols = line.split('|').filter(c => c.trim() !== '');
      if (line.includes('---')) return null; 
      return (
        <div key={index} className="overflow-x-auto my-1">
            <div className="grid grid-flow-col auto-cols-fr gap-0 border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                {cols.map((col, i) => (
                    <div key={i} className={`px-4 py-2 text-slate-700 border-r border-slate-200 last:border-0 flex items-center ${simple ? 'text-xs' : 'text-sm'}`}>
                       <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(col.trim()) }} />
                    </div>
                ))}
            </div>
        </div>
      );
    }

    // List items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().substring(2);
      return (
        <div key={index} className={`flex items-start mb-1 ml-4 group ${simple ? 'text-xs' : 'text-base'}`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-3 flex-shrink-0 group-hover:bg-blue-500 transition-colors"></span>
          <div className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInlineStyles(text) }}></div>
        </div>
      );
    }

    // Numbered lists
    if (/^\d+\./.test(line.trim())) {
       return (
        <div key={index} className={`flex items-start mb-1 ml-4 ${simple ? 'text-xs' : 'text-base'}`}>
          <span className="font-mono text-blue-600 font-bold mr-3 select-none">{line.trim().split('.')[0]}.</span>
          <div className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInlineStyles(line.trim().replace(/^\d+\.\s*/, '')) }}></div>
        </div>
      );
    }

    // Empty lines
    if (line.trim() === '') {
      return <div key={index} className="h-2"></div>;
    }

    // Standard paragraphs
    return <div key={index} className={`text-slate-700 leading-relaxed mb-2 text-justify ${simple ? 'text-sm' : 'text-base'}`} dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }}></div>;
  };

  const parseInlineStyles = (text: string) => {
    let parsed = text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
      // Italic
      .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="text-slate-800 italic font-serif">$1</em>')
      // Inline Code
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-blue-700 font-mono border border-slate-200">$1</code>')
      // Basic Math LaTeX simulation (color highlighting)
      .replace(/\$([^$]+)\$/g, '<span class="font-serif text-slate-900 bg-slate-50 px-1 rounded-sm border border-slate-100 italic">$1</span>');
    return parsed;
  };

  return (
    <div className={`relative bg-white ${simple ? '' : 'rounded-xl shadow-sm border border-slate-200'} overflow-hidden ${simple ? 'min-h-0' : 'min-h-[500px]'}`}>
      {!simple && (
        <div className="absolute top-4 right-4 z-10 print:hidden">
          <button
            onClick={handleCopy}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center space-x-2 text-slate-600 text-xs font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '已复制' : '复制讲义'}</span>
          </button>
        </div>
      )}
      <div className={`${simple ? 'p-0' : 'p-8 md:p-12'} max-w-4xl mx-auto print:p-0`}>
        {content.split('\n').map((line, idx) => renderLine(line, idx))}
      </div>
    </div>
  );
};