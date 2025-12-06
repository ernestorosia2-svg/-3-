import React, { useState, useEffect } from 'react';
import { Chapter, NoteAnalysis } from '../types';
import { analyzeWeakness } from '../services/geminiService';
import { Save, BrainCircuit, AlertTriangle, CheckCircle, PenTool } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface NotePanelProps {
  chapter: Chapter;
}

export const NotePanel: React.FC<NotePanelProps> = ({ chapter }) => {
  const [noteContent, setNoteContent] = useState('');
  const [analysis, setAnalysis] = useState<NoteAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedStatus, setSavedStatus] = useState<'saved' | 'saving' | null>(null);

  // Load notes from local storage
  useEffect(() => {
    const saved = localStorage.getItem(`notes-${chapter.id}`);
    if (saved) setNoteContent(saved);
    else setNoteContent('');
    setAnalysis(null);
  }, [chapter.id]);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`notes-${chapter.id}`, noteContent);
      setSavedStatus('saved');
      setTimeout(() => setSavedStatus(null), 2000);
    }, 1000);
    setSavedStatus('saving');
    return () => clearTimeout(timer);
  }, [noteContent, chapter.id]);

  const handleAnalyze = async () => {
    if (noteContent.length < 10) {
      alert("请多写一点笔记（至少10个字），助教才能分析哦。");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeWeakness(chapter, noteContent);
      setAnalysis(result);
    } catch (e) {
      alert("分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Note Taking Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-slate-700 font-medium">
             <PenTool className="w-4 h-4" />
             <span>我的笔记</span>
          </div>
          <span className="text-xs text-slate-400">
            {savedStatus === 'saving' ? '保存中...' : savedStatus === 'saved' ? '已保存' : ''}
          </span>
        </div>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="在这里记录你的理解、疑惑或者公式... 例如：'全微分的定义我不大理解，为什么Δz和dz差一个无穷小...'"
          className="flex-1 p-4 resize-none focus:outline-none text-slate-700 leading-relaxed"
        />
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            {isAnalyzing ? <BrainCircuit className="w-4 h-4 animate-pulse" /> : <BrainCircuit className="w-4 h-4" />}
            <span>诊断薄弱环节</span>
          </button>
        </div>
      </div>

      {/* Analysis Result Area */}
      {analysis && (
        <div className="bg-white rounded-xl shadow-sm border border-indigo-200 overflow-hidden animate-fadeIn">
          <div className="bg-indigo-50 p-3 border-b border-indigo-100 flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-indigo-900">助教诊断报告</span>
          </div>
          <div className="p-5 space-y-4">
            
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">薄弱点识别</h4>
                <p className="text-sm text-slate-600 mt-1">{analysis.weakness}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">复习建议</h4>
                <p className="text-sm text-slate-600 mt-1">{analysis.suggestion}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
               <h4 className="font-bold text-slate-800 text-sm mb-2">💊 配套专项练习</h4>
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                  <MarkdownRenderer content={analysis.practiceProblem} simple={true} />
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};