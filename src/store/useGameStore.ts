import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PracticeMode } from '../lib/music/skillGraph';

export interface ModuleProgress {
  level: number;
  exp: number;
  streak: number;
  bestChallengeScore: number;
  unlocked: boolean;
}

export const defaultProgress: ModuleProgress = {
  level: 1,
  exp: 0,
  streak: 0,
  bestChallengeScore: 0,
  unlocked: false,
};

interface GameState {
  progress: Record<string, ModuleProgress>;
  practiceMode: PracticeMode;
  
  addExp: (moduleId: string, amount: number) => void;
  incrementStreak: (moduleId: string) => void;
  resetStreak: (moduleId: string) => void;
  updateBestScore: (moduleId: string, score: number) => void;
  unlockModule: (moduleId: string) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      progress: {},
      practiceMode: 'major',

      addExp: (moduleId, amount) => set((state) => {
        const current = state.progress[moduleId] || { ...defaultProgress };
        const newExp = current.exp + amount;
        let newLevel = 1;
        let expNeeded = 0;
        while (newExp >= expNeeded + newLevel * 100) {
          expNeeded += newLevel * 100;
          newLevel++;
        }
        return {
          progress: {
            ...state.progress,
            [moduleId]: { ...current, exp: newExp, level: newLevel }
          }
        };
      }),
      incrementStreak: (moduleId) => set((state) => {
        const current = state.progress[moduleId] || { ...defaultProgress };
        return {
          progress: {
            ...state.progress,
            [moduleId]: { ...current, streak: current.streak + 1 }
          }
        };
      }),
      resetStreak: (moduleId) => set((state) => {
        const current = state.progress[moduleId] || { ...defaultProgress };
        return {
          progress: {
            ...state.progress,
            [moduleId]: { ...current, streak: 0 }
          }
        };
      }),
      updateBestScore: (moduleId, score) => set((state) => {
        const current = state.progress[moduleId] || { ...defaultProgress };
        return {
          progress: {
            ...state.progress,
            [moduleId]: { ...current, bestChallengeScore: Math.max(current.bestChallengeScore, score) }
          }
        };
      }),
      unlockModule: (moduleId) => set((state) => {
        const current = state.progress[moduleId] || { ...defaultProgress };
        return {
          progress: {
            ...state.progress,
            [moduleId]: { ...current, unlocked: true }
          }
        };
      }),
      setPracticeMode: (mode) => set({ practiceMode: mode }),
      resetProgress: () => set({ progress: {}, practiceMode: 'major' }),
    }),
    {
      name: 'music-training-storage',
    }
  )
);

export function getGlobalProgress(progress: Record<string, ModuleProgress>, totalModules: number = 3) {
  let totalExp = 0;
  let totalStreak = 0;
  let totalBestScore = 0;
  const MAX_LEVEL = 11;
  let totalCompletion = 0;
  
  Object.values(progress).forEach(p => {
    totalExp += p.exp;
    totalStreak += p.streak;
    totalBestScore = Math.max(totalBestScore, p.bestChallengeScore);
    totalCompletion += Math.min(p.level, MAX_LEVEL) / MAX_LEVEL;
  });

  const completionPercentage = Math.round((totalCompletion / totalModules) * 100);

  return {
    completionPercentage,
    exp: totalExp,
    streak: totalStreak,
    bestChallengeScore: totalBestScore
  };
}
