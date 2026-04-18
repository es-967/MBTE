import React, { useState } from 'react';
import { ModuleProps } from '../types/TrainingModule';
import { StepQuiz } from '../features/step-quiz/StepQuiz';
import { StepHome } from '../features/step-quiz/StepHome';
import { StepPreCheck } from '../features/step-quiz/StepPreCheck';
import { useGameStore } from '../store/useGameStore';
import { StepQuizMode } from '../features/step-quiz/stepQuiz.types';

type View = 'home' | 'quiz';

export function StepModule({ onHome }: ModuleProps) {
  const { progress } = useGameStore();
  const isUnlocked = progress['step-practice']?.unlocked;
  const currentLevel = progress['step-practice']?.level || 1;
  const [view, setView] = useState<View>('home');
  const [quizConfig, setQuizConfig] = useState<{isChallenge: boolean, targetLevel: number, autoLevel: boolean, mode: StepQuizMode}>({ isChallenge: false, targetLevel: 1, autoLevel: false, mode: 'mixed' });

  if (!isUnlocked) {
    return <StepPreCheck onHome={onHome} />;
  }

  if (view === 'quiz') {
    const activeLevel = quizConfig.autoLevel ? currentLevel : quizConfig.targetLevel;
    return (
      <StepQuiz
        isChallenge={quizConfig.isChallenge}
        targetLevel={activeLevel}
        mode={quizConfig.mode}
        onHome={() => setView('home')}
        onPlatformHome={onHome}
      />
    );
  }

  return (
    <StepHome
      onStartQuiz={(isChallenge, targetLevel, mode) => {
        setQuizConfig({ isChallenge, targetLevel, autoLevel: targetLevel === currentLevel, mode });
        setView('quiz');
      }}
      onHome={onHome}
    />
  );
}
