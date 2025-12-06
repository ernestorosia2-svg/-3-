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

export interface GenerationConfig {
  chapter: Chapter;
}
