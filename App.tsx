import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { ChatPanel } from './components/ChatPanel';
import { NotePanel } from './components/NotePanel';
import { generateChapterAnalysis } from './services/geminiService';
import { Chapter, AnalysisState } from './types';
import { Menu, Sparkles, AlertCircle, BookOpenCheck, MessageCircle, PenTool, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [activeTab, setActiveTab] = useState<'lecture' | 'chat' | 'notes'>('lecture');
  
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    content: null,
    error: null,
  });

  // Effect to generate content when a chapter is selected
  useEffect(() => {
    if (selectedChapter) {
      const fetchAnalysis = async () => {
        setAnalysis({ isLoading: true, content: null, error: null });
        setActiveTab('lecture'); // Reset to lecture tab on new chapter
        try {
          const result = await generateChapterAnalysis(selectedChapter);
          setAnalysis({ isLoading: false, content: result, error: null });
        } catch (err) {
          setAnalysis({
            isLoading: false,
            content: null,
            error: "连接服务器遇到问题，请检查网络或稍后重试。",
          });
        }
      };
      
      fetchAnalysis();
    }
  }, [selectedChapter]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        selectedChapterId={selectedChapter?.id || null} 
        onSelectChapter={setSelectedChapter}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-72 h-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-md md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-slate-800 truncate max-w-[150px] sm:max-w-md">
              {selectedChapter ? selectedChapter.title : '概览'}
            </h2>
          </div>
          
          {selectedChapter && (
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('lecture')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-1 ${
                        activeTab === 'lecture' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">复习讲义</span>
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-1 ${
                        activeTab === 'chat' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">在线答疑</span>
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-1 ${
                        activeTab === 'notes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <PenTool className="w-4 h-4" />
                    <span className="hidden sm:inline">智能笔记</span>
                </button>
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {!selectedChapter ? (
            <div className="h-full overflow-y-auto p-4 md:p-8 scroll-smooth flex flex-col items-center justify-center text-center max-w-lg mx-auto">
               {/* Empty State */}
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <BookOpenCheck className="w-10 h-10 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">期末复习助教系统</h1>
              <p className="text-slate-600 mb-8 leading-relaxed">
                别慌，我们把难啃的骨头拆开来吃。<br/>请选择左侧章节，我们将通过<b>类比一元微积分</b>，带你梳理计算套路。
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-left w-full">
                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                  复习策略
                </h3>
                <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
                  <li>建立新旧知识联系 (Knowledge Bridge)</li>
                  <li>掌握核心计算模版 (Algorithm)</li>
                  <li>对应历年真题演练 (Exam Context)</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full max-w-4xl mx-auto w-full p-4 md:p-6">
                {/* Tab Content: Lecture */}
                {activeTab === 'lecture' && (
                    <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
                        {analysis.isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative w-16 h-16">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <p className="mt-6 text-slate-600 font-medium">助教正在整理讲义...</p>
                            <p className="text-sm text-slate-400 mt-2">检索知识点与真题关联</p>
                            </div>
                        ) : analysis.error ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-semibold text-red-700 mb-2">生成中断</h3>
                            <p className="text-red-600 mb-4">{analysis.error}</p>
                            <button 
                                onClick={() => {
                                    setAnalysis(prev => ({ ...prev, isLoading: true, error: null }));
                                    generateChapterAnalysis(selectedChapter).then(res => 
                                        setAnalysis({ isLoading: false, content: res, error: null })
                                    ).catch(err => 
                                        setAnalysis({ isLoading: false, content: null, error: "重试失败" })
                                    );
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                                重新生成
                            </button>
                            </div>
                        ) : (
                            <div className="animate-fadeIn pb-10">
                                {analysis.content && <MarkdownRenderer content={analysis.content} />}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: Chat */}
                {activeTab === 'chat' && (
                    <div className="h-full">
                        <ChatPanel chapter={selectedChapter} />
                    </div>
                )}

                {/* Tab Content: Notes */}
                {activeTab === 'notes' && (
                    <div className="h-full">
                        <NotePanel chapter={selectedChapter} />
                    </div>
                )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;