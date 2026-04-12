import React, { useState } from 'react';
import { ModuleProps } from '../types/TrainingModule';
import { ScaleHome } from '../components/game/ScaleHome';
import { Quiz } from '../components/game/Quiz';
import { ScalePreCheck } from '../components/game/ScalePreCheck';
import { useGameStore } from '../store/useGameStore';

type ScaleView = 'home' | 'quiz';

export function ScaleModule({ onHome }: ModuleProps) {
  const { progress } = useGameStore();
  const isUnlocked = progress['scale-practice']?.unlocked;

  const [view, setView] = useState<ScaleView>('home');
  const [isChallenge, setIsChallenge] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  if (!isUnlocked) {
    return <ScalePreCheck onHome={onHome} />;
  }

  const handleStartQuiz = (challenge: boolean, diff: 'easy' | 'normal' | 'hard' = 'normal') => {
    setIsChallenge(challenge);
    setDifficulty(diff);
    setView('quiz');
  };

  return (
    <>
      {view === 'home' ? (
        <ScaleHome onStartQuiz={handleStartQuiz} onHome={onHome} />
      ) : (
        <Quiz
          isChallenge={isChallenge}
          difficulty={difficulty}
          onHome={() => setView('home')}
          onPlatformHome={onHome}
        />
      )}
    </>
  );
}
