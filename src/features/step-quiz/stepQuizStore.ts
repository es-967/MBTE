import { create } from 'zustand';
import { StepQuestion, StepQuizMode } from './stepQuiz.types';
import { generateStepQuestion } from './stepQuiz.logic';

interface StepQuizState {
  question: StepQuestion | null;
  score: number;
  combo: number;
  isWrong: boolean;
  isCorrect: boolean;
  
  generateNewQuestion: (level: number, mode?: StepQuizMode) => void;
  submitAnswer: (answer: string) => boolean;
  reset: () => void;
}

export const useStepQuizStore = create<StepQuizState>((set, get) => ({
  question: null,
  score: 0,
  combo: 0,
  isWrong: false,
  isCorrect: false,

  generateNewQuestion: (level, mode = 'mixed') => {
    set({
      question: generateStepQuestion(level, mode),
      isWrong: false,
      isCorrect: false,
    });
  },

  submitAnswer: (answer) => {
    const { question, combo, score } = get();
    if (!question) return false;

    const correct = answer === question.answer;

    if (correct) {
      set({
        score: score + 10 + Math.floor(combo / 3) * 5,
        combo: combo + 1,
        isCorrect: true,
        isWrong: false,
      });
    } else {
      set({
        combo: 0,
        isWrong: true,
        isCorrect: false,
      });
    }

    return correct;
  },

  reset: () => set({
    question: null,
    score: 0,
    combo: 0,
    isWrong: false,
    isCorrect: false,
  }),
}));
