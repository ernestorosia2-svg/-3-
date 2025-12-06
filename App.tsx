import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { ECNU_CHAPTERS } from './constants';
import { generateChapterAnalysis } from './services/geminiService';
import { Chapter, AnalysisState } from './types';
import { Menu, Info, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
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
        try {
          const result = await generateChapterAnalysis(selectedChapter);
          setAnalysis({ isLoading: false, content: result, error: null });
        } catch (err) {
          setAnalysis({
            isLoading: false,
            content: null,
            error: "We encountered an issue connecting to the Gemini AI. Please check your connection and try again.",
          });
        }
      };
      
      fetchAnalysis();
    }
  }, [selectedChapter]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-md md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-slate-800 truncate">
              {selectedChapter ? selectedChapter.title : 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
              ECNU Math Analysis
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {!selectedChapter ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Welcome to your Math Companion</h1>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Select a chapter from the sidebar to generate a comprehensive analysis of key concepts and difficult points from the ECNU Mathematical Analysis textbook.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-left w-full">
                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-blue-500" />
                  How it works
                </h3>
                <p className="text-sm text-slate-500">
                  We use the Gemini Pro model to synthesize academic knowledge into structured Markdown notes, highlighting theorems, proofs, and problem-solving strategies.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {analysis.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="mt-6 text-slate-600 font-medium animate-pulse">Analyzing Chapter...</p>
                  <p className="text-sm text-slate-400 mt-2">Identifying key theorems and difficulty points</p>
                </div>
              ) : analysis.error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Generation Failed</h3>
                  <p className="text-red-600 mb-4">{analysis.error}</p>
                  <button 
                    onClick={() => {
                        // Retry logic
                        setAnalysis(prev => ({ ...prev, isLoading: true, error: null }));
                        generateChapterAnalysis(selectedChapter).then(res => 
                             setAnalysis({ isLoading: false, content: res, error: null })
                        ).catch(err => 
                             setAnalysis({ isLoading: false, content: null, error: "Retry failed." })
                        );
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="animate-fadeIn">
                   {analysis.content && <MarkdownRenderer content={analysis.content} />}
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
