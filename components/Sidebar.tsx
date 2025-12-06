import React from 'react';
import { ECNU_CHAPTERS } from '../constants';
import { Chapter } from '../types';
import { BookOpen, ChevronRight, GraduationCap } from 'lucide-react';

interface SidebarProps {
  selectedChapterId: string | null;
  onSelectChapter: (chapter: Chapter) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  selectedChapterId, 
  onSelectChapter,
  isOpen,
  onCloseMobile
}) => {
  const volume1 = ECNU_CHAPTERS.filter(c => c.volume === 1);
  const volume2 = ECNU_CHAPTERS.filter(c => c.volume === 2);

  const ChapterList = ({ chapters, label }: { chapters: Chapter[], label: string }) => (
    <div className="mb-6">
      <h3 className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-900 z-10">
        {label}
      </h3>
      <ul className="space-y-1 mt-1">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <button
              onClick={() => {
                onSelectChapter(chapter);
                onCloseMobile();
              }}
              className={`w-full text-left px-4 py-3 flex items-start space-x-3 transition-colors duration-200 border-l-4 ${
                selectedChapterId === chapter.id
                  ? 'bg-slate-800 border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className={`w-4 h-4 mt-1 flex-shrink-0 ${selectedChapterId === chapter.id ? 'text-blue-500' : 'text-slate-500'}`} />
              <div>
                <span className="block text-sm font-medium">{chapter.title}</span>
                <span className="block text-xs text-slate-500 mt-0.5 line-clamp-1">{chapter.description}</span>
              </div>
              {selectedChapterId === chapter.id && <ChevronRight className="w-4 h-4 ml-auto self-center text-blue-500" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 border-r border-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="p-6 border-b border-slate-700 bg-slate-900 flex-shrink-0">
        <div className="flex items-center space-x-3 text-white">
          <div className="p-2 bg-blue-600 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">ECNU Math</h1>
            <p className="text-xs text-blue-400 font-medium">Study Companion</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <ChapterList chapters={volume1} label="Volume 1 (上册)" />
        <ChapterList chapters={volume2} label="Volume 2 (下册)" />
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-900 flex-shrink-0">
        <p className="text-xs text-slate-500 text-center">
          Powered by Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
};
