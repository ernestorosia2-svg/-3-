import React, { useState, useRef, useEffect } from 'react';
import { Chapter, Message } from '../types';
import { askTutor } from '../services/geminiService';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatPanelProps {
  chapter: Chapter;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ chapter }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `你好！我是针对 **${chapter.title}** 的答疑助教。对某个定义不理解？或者某个计算步骤卡住了？随时问我，我会举例说明。` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Clear chat when chapter changes
  useEffect(() => {
    setMessages([{ role: 'assistant', content: `你好！我是针对 **${chapter.title}** 的答疑助教。对某个定义不理解？或者某个计算步骤卡住了？随时问我，我会举例说明。` }]);
  }, [chapter.id]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Build simple history context
    const historyContext = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    try {
      const reply = await askTutor(chapter, userMsg, historyContext);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "抱歉，刚才走神了，请再说一遍？" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                 <MarkdownRenderer content={msg.content} simple={true} />
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex items-center space-x-2 ml-12 text-slate-400 text-sm bg-white px-3 py-2 rounded-lg border border-slate-100">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>编写例题中...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请举例解释一下... / 为什么这里要换元..."
            className="flex-1 max-h-32 min-h-[50px] p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};