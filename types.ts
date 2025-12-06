export interface Chapter {
  id: string;
  volume: 1 | 2;
  title: string;
  description: string;
}

export interface AnalysisState {
  isLoading: boolean;
  content: string | null;
  error: string | null;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface NoteAnalysis {
  weakness: string;
  suggestion: string;
  practiceProblem: string;
}

export interface GenerationConfig {
  chapter: Chapter;
}