import React, { useState } from 'react';
import { ModuleProps } from '../types/TrainingModule';
import { IntervalQuiz } from '../features/interval-quiz/IntervalQuiz';
import { IntervalHome } from '../features/interval-quiz/IntervalHome';
import { IntervalPreCheck } from '../features/interval-quiz/IntervalPreCheck';
import { useGameStore } from '../store/useGameStore';
import { IntervalQuizMode } from '../features/interval-quiz/intervalQuiz.types';
import { StepQuiz } from '../features/step-quiz/StepQuiz';

type View = 'home' | 'quiz';

export function IntervalModule({ onHome }: ModuleProps) {
  const { progress } = useGameStore();
  const isUnlocked = progress['interval-practice']?.unlocked;
  const currentLevel = progress['interval-practice']?.level || 1;
  const [view, setView] = useState<View>('home');
  const [quizConfig, setQuizConfig] = useState<{isChallenge: boolean, targetLevel: number, autoLevel: boolean, mode: IntervalQuizMode}>({ isChallenge: false, targetLevel: 1, autoLevel: false, mode: 'note-interval' });

  if (!isUnlocked) {
    return <IntervalPreCheck onHome={onHome} />;
  }

  if (view === 'quiz') {
    const activeLevel = quizConfig.autoLevel ? currentLevel : quizConfig.targetLevel;
    
    if (quizConfig.mode === 'interval-name') {
      return (
        <StepQuiz
          isChallenge={quizConfig.isChallenge}
          targetLevel={activeLevel}
          mode="interval-name"
          moduleName="interval-practice"
          onHome={() => setView('home')}
          onPlatformHome={onHome}
        />
      );
    }

    return (
      <IntervalQuiz
        isChallenge={quizConfig.isChallenge}
        targetLevel={activeLevel}
        onHome={() => setView('home')}
        onPlatformHome={onHome}
      />
    );
  }

  return (
    <IntervalHome
      onStartQuiz={(isChallenge, targetLevel, mode) => {
        setQuizConfig({ isChallenge, targetLevel, autoLevel: targetLevel === currentLevel, mode });
        setView('quiz');
      }}
      onHome={onHome}
    />
  );
}
