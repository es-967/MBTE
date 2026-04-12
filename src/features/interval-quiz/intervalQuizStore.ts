import { create } from 'zustand'
import { generateQuestion } from './intervalQuiz.logic'
import type {
  IntervalQuizState,
  IntervalQuizActions,
  IntervalQuality,
  IntervalDegree
} from './intervalQuiz.types'

export const useIntervalQuizStore = create<IntervalQuizState & IntervalQuizActions>(
  (set, get) => ({
    question: null,
    selectedQuality: null,
    selectedDegree: null,
    submitted: false,
    isCorrect: null,
    score: 0,
    total: 0,
    qnum: 1,

    nextQuestion: (level: number) => {
      set({
        question: generateQuestion(level),
        selectedQuality: null,
        selectedDegree: null,
        submitted: false,
        isCorrect: null,
        qnum: get().qnum + 1,
      })
    },

    selectQuality: (q) => {
      if (get().submitted) return
      set({ selectedQuality: q })
    },

    selectDegree: (d) => {
      if (get().submitted) return
      set({ selectedDegree: d })
    },

    submit: () => {
      const { question, selectedQuality, selectedDegree, score, total } = get()
      if (!question || !selectedQuality || !selectedDegree) return false
      const qualityOk = selectedQuality === question.answer.q
      const degreeOk = selectedDegree === question.answer.deg
      const isCorrect = qualityOk && degreeOk
      set({
        submitted: true,
        isCorrect,
        score: isCorrect ? score + 1 : score,
        total: total + 1,
      })
      return isCorrect
    },
  })
)
