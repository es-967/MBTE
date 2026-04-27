import React, { useState } from 'react';
import { ModuleProps } from '../types/TrainingModule';
import { useGameStore } from '../store/useGameStore';
import { FretboardIntervalHome, FretboardIntervalMode, CagedShape } from '../features/fretboard-interval-quiz/FretboardIntervalHome';
import { FretboardIntervalQuiz } from '../features/fretboard-interval-quiz/FretboardIntervalQuiz';

export function FretboardIntervalModule({ onHome }: ModuleProps) {
  const [gameState, setGameState] = useState<'home' | 'quiz'>('home');
  const [quizMode, setQuizMode] = useState<FretboardIntervalMode>('memorize');
  const [targetShape, setTargetShape] = useState<CagedShape | undefined>();

  const handleStartQuiz = (mode: FretboardIntervalMode, shape?: CagedShape) => {
    setQuizMode(mode);
    setTargetShape(shape);
    setGameState('quiz');
  };

  const handleBackToGameHome = () => {
    setGameState('home');
  };

  return (
    <div className="w-full">
      {gameState === 'home' ? (
        <FretboardIntervalHome onStartQuiz={handleStartQuiz} onHome={onHome} />
      ) : (
        <FretboardIntervalQuiz 
          mode={quizMode} 
          targetShape={targetShape} 
          onHome={handleBackToGameHome}
        />
      )}
    </div>
  );
}
