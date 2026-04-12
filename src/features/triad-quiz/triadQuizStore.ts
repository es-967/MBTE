import { create } from 'zustand'
import { generateQuestion } from './triadQuiz.logic'
import type {
  TriadQuizState,
  TriadQuizActions,
  ChordKey,
} from './triadQuiz.types'

export const useTriadQuizStore = create<TriadQuizState & TriadQuizActions>(
  (set, get) => ({
    question: null,
    selectedRoot: null,
    selectedType: null,
    submitted: false,
    isCorrect: null,
    score: 0,
    total: 0,
    qnum: 1,

    nextQuestion: (level: number) => {
      set({
        question: generateQuestion(level),
        selectedRoot: null,
        selectedType: null,
        submitted: false,
        isCorrect: null,
        qnum: get().qnum + 1,
      })
    },

    selectRoot: (root) => {
      if (get().submitted) return
      set({ selectedRoot: root })
    },

    selectType: (key) => {
      if (get().submitted) return
      set({ selectedType: key })
    },

    submit: () => {
      const { question, selectedRoot, selectedType, score, total } = get()
      if (!question || !selectedRoot || !selectedType) return false
      const rootOk = selectedRoot === question.answer.root
      const typeOk = selectedType === question.answer.chordType.key
      const isCorrect = rootOk && typeOk
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
