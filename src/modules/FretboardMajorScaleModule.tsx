import React, { useState } from 'react';
import { ModuleProps } from '../types/TrainingModule';
import { useGameStore } from '../store/useGameStore';
import { MajorScaleHome, MajorScaleMode, CagedShape } from '../features/fretboard-major-scale/MajorScaleHome';
import { MajorScaleQuiz } from '../features/fretboard-major-scale/MajorScaleQuiz';

export function FretboardMajorScaleModule({ onHome }: ModuleProps) {
  const [gameState, setGameState] = useState<'home' | 'quiz'>('home');
  const [quizMode, setQuizMode] = useState<MajorScaleMode>('memorize');
  const [targetShape, setTargetShape] = useState<CagedShape | undefined>();

  const handleStartQuiz = (mode: MajorScaleMode, shape?: CagedShape) => {
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
        <MajorScaleHome onStartQuiz={handleStartQuiz} onHome={onHome} />
      ) : (
        <MajorScaleQuiz 
          mode={quizMode} 
          targetShape={targetShape} 
          onHome={handleBackToGameHome}
        />
      )}
    </div>
  );
}
