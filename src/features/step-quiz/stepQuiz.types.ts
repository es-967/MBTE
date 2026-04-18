export type StepQuestionType = 'semitones' | 'steps';
export type StepQuizMode = 'mixed' | 'semitones' | 'note-steps' | 'interval-name';

export interface StepQuestion {
  type: StepQuestionType;
  title: string; // e.g., "C → F#" or "大三度"
  subtitle: string; // e.g., "向上相距幾個半音？" or "包含幾個全音與半音？"
  answer: string; // stringified answer, e.g., "6" or "3,0"
  options: string[]; // array of stringified options
}
