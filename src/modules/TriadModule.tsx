import React, { useState } from 'react';
import { ModuleProps } from '../types/TrainingModule';
import { TriadQuiz } from '../features/triad-quiz/TriadQuiz';
import { TriadHome } from '../features/triad-quiz/TriadHome';
import { TriadPreCheck } from '../features/triad-quiz/TriadPreCheck';
import { useGameStore } from '../store/useGameStore';

type View = 'home' | 'quiz';

export function TriadModule({ onHome }: ModuleProps) {
  const { progress } = useGameStore();
  const isUnlocked = progress['triad-practice']?.unlocked;
  const currentLevel = progress['triad-practice']?.level || 1;
  const [view, setView] = useState<View>('home');
  const [quizConfig, setQuizConfig] = useState({ isChallenge: false, targetLevel: 1, autoLevel: false });

  if (!isUnlocked) {
    return <TriadPreCheck onHome={onHome} />;
  }

  if (view === 'quiz') {
    const activeLevel = quizConfig.autoLevel ? currentLevel : quizConfig.targetLevel;
    return (
      <TriadQuiz
        isChallenge={quizConfig.isChallenge}
        targetLevel={activeLevel}
        onHome={() => setView('home')}
        onPlatformHome={onHome}
      />
    );
  }

  return (
    <TriadHome
      onStartQuiz={(isChallenge, targetLevel) => {
        setQuizConfig({ isChallenge, targetLevel, autoLevel: targetLevel === currentLevel });
        setView('quiz');
      }}
      onHome={onHome}
    />
  );
}
