import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PracticeMode } from '../lib/music/skillGraph';

interface GameState {
  level: number;
  exp: number;
  streak: number;
  bestChallengeScore: number;
  practiceMode: PracticeMode;
  
  addExp: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  updateBestScore: (score: number) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      level: 1,
      exp: 0,
      streak: 0,
      bestChallengeScore: 0,
      practiceMode: 'major',

      addExp: (amount) => set((state) => {
        const newExp = state.exp + amount;
        const newLevel = Math.floor(newExp / 100) + 1;
        return { exp: newExp, level: newLevel };
      }),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),
      updateBestScore: (score) => set((state) => ({
        bestChallengeScore: Math.max(state.bestChallengeScore, score)
      })),
      setPracticeMode: (mode) => set({ practiceMode: mode }),
      resetProgress: () => set({ level: 1, exp: 0, streak: 0, bestChallengeScore: 0, practiceMode: 'major' }),
    }),
    {
      name: 'music-training-storage',
    }
  )
);
