export enum Difficulty {
  Bajo = "Bajo",
  Medio = "Medio",
  Alto = "Alto",
}

export interface FormData {
  studentName: string;
  grade: string;
  topic: string;
  desempenos: string;
  textType: string;
  difficulty: Difficulty;
  additionalDetails: string;
  preferences: string[];
  characterCount: number;
  saberQuestionCount: number;
  openQuestionCount: number;
  extraActivities: string[];
  sopaDeLetrasWordCount: number;
  sopaDeLetrasRows: number;
  sopaDeLetrasCols: number;
}

export interface SaberQuestion {
  context: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface MatchingExercise {
  columnA: string[];
  columnB: string[];
  answers: {
    itemA: string;
    itemB: string;
  }[];
}

export interface CreativeActivity {
  title: string;
  description: string;
}

export type WordSolution = {
  word: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
};

export type SopaDeLetrasContent = {
  grid: string[][];
  words: string[];
  solution: WordSolution[];
};

export type VerdaderoFalsoItem = {
  statement: string;
  answer: boolean;
};

export type CompletarFraseItem = {
  phrase: string;
  options: string[];
  answer: string;
};

export type OrdenaFraseItem = {
  scrambledWords: string[];
  correctSentence: string;
};

export interface ExtraActivity {
  title: string;
  description: string;
  content?: string; // For simple markdown-based activities
  sopaDeLetras?: SopaDeLetrasContent;
  verdaderoFalso?: VerdaderoFalsoItem[];
  completarFrase?: CompletarFraseItem[];
  ordenaFrase?: OrdenaFraseItem[];
}


export interface Workshop {
  saberQuestions: SaberQuestion[];
  matchingExercise?: MatchingExercise;
  openQuestions?: string[];
  creativeActivity?: CreativeActivity;
  conceptMapFacts?: string[];
  extraActivities: ExtraActivity[];
}

export interface Narrative {
  title: string;
  text: string; // Contendrá placeholders como [VIGNETTE_1]
  coverImage: string; // Base64 string
  vignetteImages: string[]; // Array de Base64 strings
}

export interface GeneratedContent {
  narrative: Narrative;
  workshop: Workshop;
}
