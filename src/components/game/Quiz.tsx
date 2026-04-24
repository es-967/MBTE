import React, { useState, useEffect } from 'react';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { generateQuestion, Question } from '../../lib/music/generator';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface QuizProps {
  isChallenge: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  onHome: () => void;
  onPlatformHome: () => void;
}

export function Quiz({ isChallenge, difficulty, onHome, onPlatformHome }: QuizProps) {
  const { progress, practiceMode, addExp, incrementStreak, resetStreak, updateBestScore } = useGameStore();
  const moduleProgress = progress['scale-practice'] || defaultProgress;
  const { level, streak, bestChallengeScore } = moduleProgress;
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [challengeScore, setChallengeScore] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const prevLevelRef = React.useRef(level);
  useEffect(() => {
    if (level > prevLevelRef.current) {
      // Confetti removed
    }
    prevLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    loadNewQuestion();
  }, []);

  const challengeScoreRef = React.useRef(challengeScore);
  useEffect(() => {
    challengeScoreRef.current = challengeScore;
  }, [challengeScore]);

  useEffect(() => {
    if (isChallenge && !isTimeUp) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimeUp(true);
            const finalScore = challengeScoreRef.current;
            updateBestScore('scale-practice', finalScore);
            if (finalScore > bestChallengeScore) {
              // Confetti removed
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isChallenge, isTimeUp, updateBestScore, bestChallengeScore]);

  const loadNewQuestion = () => {
    const q = generateQuestion(level, practiceMode, difficulty);
    setQuestion(q);
    setSelectedNotes([]);
    setShowResult(false);
  };

  const toggleNote = (note: string) => {
    if (showResult) return;
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const handleSubmit = () => {
    if (!question) return;
    
    const correctSet = new Set(question.answer);
    const selectedSet = new Set(selectedNotes);
    
    const correct = 
      correctSet.size === selectedSet.size && 
      [...correctSet].every((value) => selectedSet.has(value));

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      if (isChallenge) {
        setChallengeScore((s) => s + 1);
      } else {
        addExp('scale-practice', 20);
        incrementStreak('scale-practice');
      }
      setTimeout(() => {
        loadNewQuestion();
      }, 800);
    } else {
      if (!isChallenge) {
        resetStreak('scale-practice');
      }
    }
  };

  if (isTimeUp) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-8 animate-in zoom-in duration-500">
        <h1 className="text-5xl font-black text-gray-900">⏰ 時間到！</h1>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-blue-600">🎯 你的成績：{challengeScore} 題</p>
          <p className="text-gray-500">最高紀錄：{Math.max(challengeScore, bestChallengeScore)} 題</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={onHome} className="w-48">
            🏠 回設定頁
          </Button>
          <Button size="lg" variant="outline" onClick={onPlatformHome} className="w-48">
            🔙 回主頁
          </Button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const modeText = question.mode === 'major' ? '大調' : '小調';

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
        {isChallenge ? (
          <>
            <h1 className="text-xl sm:text-3xl font-display font-bold text-rose-600">⏰ 限時挑戰 - {timeLeft}秒</h1>
            <div className="text-lg sm:text-2xl font-display font-bold text-indigo-600">得分：{challengeScore}</div>
          </>
        ) : (
          <>
            <h1 className="text-xl sm:text-3xl font-display font-bold text-slate-900">🎼 {modeText}音階練習</h1>
            <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
              <span className="text-amber-600">連勝: {streak} 🔥</span>
              <span className="text-indigo-600">Lv{level}</span>
            </div>
          </>
        )}
      </div>

      <Card className="border-2 border-indigo-100 shadow-md">
        <CardContent className="p-4 sm:p-8 text-center space-y-6 sm:space-y-10">
          <h2 className="text-lg sm:text-3xl font-display font-bold text-slate-800">
            請選出 【<span className="text-indigo-600">{question.key} {modeText}</span>】 的音階
          </h2>

          <div className="grid grid-cols-4 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-4">
            {question.options.map((note) => {
              const isSelected = selectedNotes.includes(note);
              let btnVariant: any = isSelected ? 'default' : 'outline';
              
              if (showResult) {
                const isAnswer = question.answer.includes(note);
                if (isAnswer && isSelected) btnVariant = 'default';
                else if (isAnswer && !isSelected) btnVariant = 'secondary';
                else if (!isAnswer && isSelected) btnVariant = 'destructive';
                else btnVariant = 'outline';
              }

              return (
                <Button
                  key={note}
                  variant={btnVariant}
                  className={`w-full sm:w-16 h-12 sm:h-16 text-sm sm:text-xl font-display transition-all p-0 ${isSelected && !showResult ? 'ring-2 sm:ring-4 ring-indigo-200 ring-offset-1 sm:ring-offset-2 scale-105' : ''}`}
                  onClick={() => toggleNote(note)}
                  disabled={showResult}
                >
                  {isSelected && !showResult ? `✅${note}` : note}
                </Button>
              );
            })}
          </div>

          {!showResult ? (
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 pt-2 sm:pt-4">
              <Button size="lg" onClick={handleSubmit} disabled={selectedNotes.length === 0} className="w-full sm:w-48 order-1 sm:order-none h-12">
                ✅ 提交答案
              </Button>
              <div className="flex gap-2 w-full sm:w-auto order-2 sm:order-none">
                <Button size="lg" variant="outline" onClick={onHome} className="flex-1 sm:w-auto h-12">
                  🏠 設定
                </Button>
                <Button size="lg" variant="ghost" onClick={onPlatformHome} className="flex-1 sm:w-auto h-12">
                  🔙 主頁
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4 animate-in fade-in">
              <div className={`p-3 sm:p-4 rounded-lg ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">
                  {isCorrect ? '✅ 正確！太棒了！' : '❌ 答錯了，別灰心！'}
                </h3>
                {!isCorrect && (
                  <p className="text-sm sm:text-base font-medium">
                    正確答案是：{question.answer.sort().join(', ')}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                {!isCorrect && (
                  <Button size="lg" onClick={loadNewQuestion} className="w-full sm:w-48 order-1 sm:order-none h-12">
                    🎯 下一題
                  </Button>
                )}
                <div className="flex gap-2 w-full sm:w-auto order-2 sm:order-none">
                  <Button size="lg" variant="outline" onClick={onHome} className="flex-1 sm:w-auto h-12">
                    🏠 設定
                  </Button>
                  <Button size="lg" variant="ghost" onClick={onPlatformHome} className="flex-1 sm:w-auto h-12">
                    🔙 主頁
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
