import React, { useState } from 'react';
import { FretboardTriadHome, FretboardTriadMode } from './FretboardTriadHome';
import { FretboardTriadQuiz } from './FretboardTriadQuiz';
import { TriadPosition } from './chordDefs';

interface FretboardTriadModuleProps {
  onHome: () => void;
}

export function FretboardTriadModule({ onHome }: FretboardTriadModuleProps) {
  const [gameState, setGameState] = useState<'home' | 'quiz'>('home');
  const [mode, setMode] = useState<FretboardTriadMode>('memorize');
  const [targetPos, setTargetPos] = useState<TriadPosition | undefined>();

  const handleStartQuiz = (selectedMode: FretboardTriadMode, selectedPos?: TriadPosition) => {
    setMode(selectedMode);
    setTargetPos(selectedPos);
    setGameState('quiz');
  };

  const handleBackToGameHome = () => {
    setGameState('home');
  };

  if (gameState === 'home') {
    return (
      <FretboardTriadHome 
        onStartQuiz={handleStartQuiz} 
        onHome={onHome} 
      />
    );
  }

  return (
    <FretboardTriadQuiz 
      mode={mode}
      targetPosition={targetPos}
      onHome={handleBackToGameHome} 
    />
  );
}
