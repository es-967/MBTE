import React, { useState } from 'react';
import { FretboardSeventhHome, FretboardSeventhMode } from './FretboardSeventhHome';
import { FretboardSeventhQuiz } from './FretboardSeventhQuiz';
import { SeventhPosition } from './chordDefs';

interface FretboardSeventhModuleProps {
  onHome: () => void;
}

export function FretboardSeventhModule({ onHome }: FretboardSeventhModuleProps) {
  const [gameState, setGameState] = useState<'home' | 'quiz'>('home');
  const [mode, setMode] = useState<FretboardSeventhMode>('memorize');
  const [targetPos, setTargetPos] = useState<SeventhPosition | undefined>();

  const handleStartQuiz = (selectedMode: FretboardSeventhMode, selectedPos?: SeventhPosition) => {
    setMode(selectedMode);
    setTargetPos(selectedPos);
    setGameState('quiz');
  };

  const handleBackToGameHome = () => {
    setGameState('home');
  };

  if (gameState === 'home') {
    return (
      <FretboardSeventhHome 
        onStartQuiz={handleStartQuiz} 
        onHome={onHome} 
      />
    );
  }

  return (
    <FretboardSeventhQuiz 
      mode={mode}
      targetPosition={targetPos}
      onHome={handleBackToGameHome} 
    />
  );
}
