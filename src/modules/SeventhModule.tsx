import React, { useState } from 'react';
import { SeventhPreCheck } from '../features/seventh-quiz/SeventhPreCheck';
import { SeventhHome } from '../features/seventh-quiz/SeventhHome';
import { SeventhQuiz } from '../features/seventh-quiz/SeventhQuiz';

interface SeventhModuleProps {
  onHome: () => void;
}

type Step = 'precheck' | 'home' | 'quiz';

export function SeventhModule({ onHome }: SeventhModuleProps) {
  const [step, setStep] = useState<Step>('precheck');
  const [quizConfig, setQuizConfig] = useState<{ isChallenge: boolean; targetLevel: number }>({
    isChallenge: false,
    targetLevel: 1,
  });

  const startQuiz = (isChallenge: boolean, targetLevel: number) => {
    setQuizConfig({ isChallenge, targetLevel });
    setStep('quiz');
  };

  return (
    <div className="w-full">
      {step === 'precheck' && (
        <SeventhPreCheck onStart={() => setStep('home')} onHome={onHome} />
      )}
      {step === 'home' && (
        <SeventhHome 
          onStartQuiz={startQuiz} 
          onHome={onHome} 
        />
      )}
      {step === 'quiz' && (
        <SeventhQuiz 
          isChallenge={quizConfig.isChallenge}
          targetLevel={quizConfig.targetLevel}
          onHome={() => setStep('home')}
          onPlatformHome={onHome}
        />
      )}
    </div>
  );
}
