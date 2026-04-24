import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PracticeMode } from '../lib/music/skillGraph';

export interface ModuleProgress {
  level: number;
  exp: number;
  streak: number;
  bestChallengeScore: number;
  unlocked: boolean;
  customMetadata?: Record<string, any>;
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
  gender: 'M' | 'F' | null;
  
  addExp: (moduleId: string, amount: number) => void;
  setLevel: (moduleId: string, level: number) => void;
  incrementStreak: (moduleId: string) => void;
  resetStreak: (moduleId: string) => void;
  updateBestScore: (moduleId: string, score: number) => void;
  unlockModule: (moduleId: string) => void;
  updateCustomMetadata: (moduleId: string, data: Partial<Record<string, any>>) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  setGender: (gender: 'M' | 'F') => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      progress: {},
      practiceMode: 'major',
      gender: null,

      addExp: (moduleId, amount) => set((state) => {
        const current = state.progress[moduleId] || { ...defaultProgress };
        const newExp = current.exp + amount;
        
        if (current.customMetadata?.manualLeveling) {
          return {
            progress: {
              ...state.progress,
              [moduleId]: { ...current, exp: newExp }
            }
          };
        }

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
      setLevel: (moduleId, level) => set((state) => {
        const current = state.progress[moduleId] || { ...defaultProgress };
        return {
          progress: {
            ...state.progress,
            [moduleId]: { ...current, level }
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
      updateCustomMetadata: (moduleId, data) => set((state) => {
        const current = state.progress[moduleId] || { ...defaultProgress };
        return {
          progress: {
            ...state.progress,
            [moduleId]: { 
              ...current, 
              customMetadata: { ...(current.customMetadata || {}), ...data }
            }
          }
        };
      }),
      setPracticeMode: (mode) => set({ practiceMode: mode }),
      setGender: (gender) => set({ gender }),
      resetProgress: () => set({ progress: {}, practiceMode: 'major', gender: null }),
    }),
    {
      name: 'music-training-storage',
    }
  )
);

export function getGlobalProgress(progress: Record<string, ModuleProgress>, totalModules: number = 4) {
  let totalExp = 0;
  let totalStreak = 0;
  let totalBestScore = 0;
  const MAX_LEVEL = 11;
  let totalCompletion = 0;
  
  const moduleIds = ['scale-practice', 'step-practice', 'interval-practice', 'triad-practice', 'seventh-practice'];
  
  moduleIds.forEach(id => {
    const p = progress[id] || defaultProgress;
    totalExp += p.exp;
    totalStreak += p.streak;
    totalBestScore = Math.max(totalBestScore, p.bestChallengeScore);
    // Level 1 is 0% completion, Level 11 is 100% completion
    const completion = (Math.min(p.level, MAX_LEVEL) - 1) / (MAX_LEVEL - 1);
    totalCompletion += completion;
  });

  const completionPercentage = Math.round((totalCompletion / moduleIds.length) * 100);

  return {
    completionPercentage,
    exp: totalExp,
    streak: totalStreak,
    bestChallengeScore: totalBestScore
  };
}
