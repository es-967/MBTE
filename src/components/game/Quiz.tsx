import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/useGameStore';
import { generateQuestion, Question } from '../../lib/music/generator';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface QuizProps {
  isChallenge: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  onHome: () => void;
}

export function Quiz({ isChallenge, difficulty, onHome }: QuizProps) {
  const { level, practiceMode, addExp, incrementStreak, resetStreak, updateBestScore, streak } = useGameStore();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [challengeScore, setChallengeScore] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    loadNewQuestion();
  }, []);

  useEffect(() => {
    if (isChallenge && !isTimeUp) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimeUp(true);
            updateBestScore(challengeScore);
            if (challengeScore > useGameStore.getState().bestChallengeScore) {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isChallenge, isTimeUp, challengeScore, updateBestScore]);

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
        addExp(20);
        incrementStreak();
        if (streak + 1 >= 3) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }
      }
    } else {
      if (!isChallenge) {
        resetStreak();
      }
    }
  };

  if (isTimeUp) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-8 animate-in zoom-in duration-500">
        <h1 className="text-5xl font-black text-gray-900">⏰ 時間到！</h1>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-blue-600">🎯 你的成績：{challengeScore} 題</p>
          <p className="text-gray-500">最高紀錄：{Math.max(challengeScore, useGameStore.getState().bestChallengeScore)} 題</p>
        </div>
        <Button size="lg" onClick={onHome} className="w-full max-w-xs">
          🏠 回首頁
        </Button>
      </div>
    );
  }

  if (!question) return null;

  const modeText = question.mode === 'major' ? '大調' : '小調';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        {isChallenge ? (
          <>
            <h1 className="text-2xl font-bold text-red-600">⏰ 限時挑戰 - {timeLeft}秒</h1>
            <div className="text-xl font-bold text-blue-600">得分：{challengeScore}</div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">🎼 {modeText}音階練習</h1>
            <div className="flex gap-4 text-sm font-medium text-gray-600">
              <span>連勝: {streak} 🔥</span>
              <span>Lv{level}</span>
            </div>
          </>
        )}
      </div>

      <Card className="border-2 border-blue-100 shadow-md">
        <CardContent className="p-8 text-center space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            請選出 【{question.key} {modeText}】 的音階
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {question.options.map((note) => {
              const isSelected = selectedNotes.includes(note);
              let btnVariant: any = isSelected ? 'default' : 'outline';
              
              if (showResult) {
                const isAnswer = question.answer.includes(note);
                if (isAnswer && isSelected) btnVariant = 'default'; // Correctly selected
                else if (isAnswer && !isSelected) btnVariant = 'secondary'; // Missed correct answer
                else if (!isAnswer && isSelected) btnVariant = 'destructive'; // Wrongly selected
                else btnVariant = 'outline';
              }

              return (
                <Button
                  key={note}
                  variant={btnVariant}
                  className={`w-16 h-16 text-lg font-bold transition-all ${isSelected && !showResult ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                  onClick={() => toggleNote(note)}
                  disabled={showResult}
                >
                  {isSelected && !showResult ? `✅ ${note}` : note}
                </Button>
              );
            })}
          </div>

          {!showResult ? (
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" onClick={handleSubmit} disabled={selectedNotes.length === 0} className="w-48">
                ✅ 提交答案
              </Button>
              <Button size="lg" variant="outline" onClick={onHome}>
                🏠 回首頁
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pt-4 animate-in fade-in">
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <h3 className="text-xl font-bold mb-2">
                  {isCorrect ? '✅ 正確！太棒了！' : '❌ 答錯了，別灰心！'}
                </h3>
                {!isCorrect && (
                  <p className="font-medium">
                    正確答案是：{question.answer.sort().join(', ')}
                  </p>
                )}
              </div>
              <div className="flex justify-center gap-4">
                <Button size="lg" onClick={loadNewQuestion} className="w-48">
                  🎯 下一題
                </Button>
                <Button size="lg" variant="outline" onClick={onHome}>
                  🏠 回首頁
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
