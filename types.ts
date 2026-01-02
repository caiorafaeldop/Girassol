
export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  subtasks?: SubTask[];
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  content: string;
  mood?: 'happy' | 'neutral' | 'sad' | 'motivated';
  aiAnalysis?: string;
}

export interface DailyLog {
  date: string; // Key: YYYY-MM-DD
  weight?: number;
  workout: boolean;
  meals: {
    breakfast: boolean;     // Café
    morningSnack: boolean;  // Lanche
    lunch: boolean;         // Almoço
    afternoonSnack: boolean;// Lanche
    dinner: boolean;        // Janta
    supper: boolean;        // Ceia
  };
}

// Keeping WeightLog for backward compatibility if needed, but App will use DailyLog
export interface WeightLog {
  id: string;
  date: string;
  weight: number;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[]; 
}

export interface AiNewsItem {
  title: string;
  summary: string;
  source: string;
  date: string;
  url?: string;
}

export enum AppView {
  DASHBOARD = 'Dashboard',
  JOURNAL = 'Diário',
  HABITS = 'Hábitos',
  TODO = 'Tarefas',
  WEIGHT = 'Peso',
  PROGRESS = 'Progresso',
  NEWS = 'Notícias',
}
