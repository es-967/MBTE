/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home } from './components/game/Home';
import { Quiz } from './components/game/Quiz';

export default function App() {
  const [page, setPage] = useState<'home' | 'quiz'>('home');
  const [isChallenge, setIsChallenge] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  const handleStartQuiz = (challenge: boolean, diff: 'easy' | 'normal' | 'hard' = 'normal') => {
    setIsChallenge(challenge);
    setDifficulty(diff);
    setPage('quiz');
  };

  const handleHome = () => {
    setPage('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      <main className="container mx-auto py-8">
        {page === 'home' ? (
          <Home onStartQuiz={handleStartQuiz} />
        ) : (
          <Quiz isChallenge={isChallenge} difficulty={difficulty} onHome={handleHome} />
        )}
      </main>
    </div>
  );
}

