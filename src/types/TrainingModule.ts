import { ComponentType } from 'react';

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockLevel: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'theory' | 'fretboard';
  estimatedMinutes: number;
  component: ComponentType<ModuleProps>;
}

export interface ModuleProps {
  onHome: () => void;
}
