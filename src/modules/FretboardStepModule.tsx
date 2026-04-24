import React, { useState } from 'react';
import { ModuleProps } from '../types/TrainingModule';
import { useGameStore, getGlobalProgress } from '../store/useGameStore';
import { FretboardStepHome } from '../features/fretboard-step-quiz/FretboardStepHome';
import { FretboardStepQuiz } from '../features/fretboard-step-quiz/FretboardStepQuiz';
import { FretboardStepPreCheck } from '../features/fretboard-step-quiz/FretboardStepPreCheck';

export function FretboardStepModule({ onHome }: ModuleProps) {
  const [gameState, setGameState] = useState<'home' | 'quiz'>('home');
  const [isChallenge, setIsChallenge] = useState(false);
  const [targetLevel, setTargetLevel] = useState(1);
  const { progress } = useGameStore();

  const handleStartQuiz = (challenge: boolean, level: number) => {
    setIsChallenge(challenge);
    setTargetLevel(level);
    setGameState('quiz');
  };

  const handleBackToGameHome = () => {
    setGameState('home');
  };

  const hasUnlocked = progress['fretboard-step'] !== undefined;

  return (
    <div className="w-full">
      {!hasUnlocked ? (
        <FretboardStepPreCheck onPass={() => useGameStore.getState().unlockModule('fretboard-step')} onHome={onHome} />
      ) : gameState === 'home' ? (
        <FretboardStepHome onStartQuiz={handleStartQuiz} onHome={onHome} />
      ) : (
        <FretboardStepQuiz 
          isChallenge={isChallenge} 
          targetLevel={targetLevel} 
          onHome={handleBackToGameHome}
          onPlatformHome={onHome}
        />
      )}
    </div>
  );
}
