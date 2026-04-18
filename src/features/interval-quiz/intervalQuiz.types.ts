export type IntervalQuality = '完全' | '大' | '小' | '增' | '減';
export type IntervalDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type IntervalQuizMode = 'mixed' | 'interval-name' | 'note-interval';

export interface IntervalDef {
  deg: IntervalDegree;
  q: IntervalQuality;
  st: number;
  name: string;
}

export interface QuizQuestion {
  root: string;
  note2: string;
  answer: IntervalDef;
  qualityOptions: IntervalQuality[];
  degreeOptions: IntervalDegree[];
}

export interface IntervalQuizState {
  question: QuizQuestion | null;
  selectedQuality: IntervalQuality | null;
  selectedDegree: IntervalDegree | null;
  submitted: boolean;
  isCorrect: boolean | null;
  score: number;
  total: number;
  qnum: number;
}

export interface IntervalQuizActions {
  nextQuestion: (level: number) => void;
  selectQuality: (q: IntervalQuality) => void;
  selectDegree: (d: IntervalDegree) => void;
  submit: () => boolean;
}
