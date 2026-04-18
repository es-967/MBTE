import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStepQuizStore } from './stepQuizStore';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Trophy, Timer, Star } from 'lucide-react';

import { StepQuizMode } from './stepQuiz.types';

interface Props {
  isChallenge: boolean;
  targetLevel: number;
  mode?: StepQuizMode;
  moduleName?: 'step-practice' | 'interval-practice';
  onHome: () => void;
  onPlatformHome: () => void;
}

export function StepQuiz({ isChallenge, targetLevel, mode = 'mixed', moduleName = 'step-practice', onHome, onPlatformHome }: Props) {
  const { question, score, combo, isWrong, isCorrect, generateNewQuestion, submitAnswer, reset } = useStepQuizStore();
  const { addExp, updateBestScore, incrementStreak, resetStreak } = useGameStore();
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    reset();
    generateNewQuestion(targetLevel, mode);
  }, [targetLevel, mode]);

  useEffect(() => {
    if (!isChallenge || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          updateBestScore(moduleName, score);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isChallenge, gameOver, score]);

  const handleAnswer = (answer: string) => {
    if (gameOver) return;
    
    const correct = submitAnswer(answer);
    
    if (correct) {
      if (!isChallenge) {
        addExp(moduleName, 10 + Math.floor(combo / 3) * 5);
        incrementStreak(moduleName);
      }
      setTimeout(() => generateNewQuestion(targetLevel, mode), 500);
    } else {
      if (!isChallenge) {
        resetStreak(moduleName);
      }
      setTimeout(() => generateNewQuestion(targetLevel, mode), 1500);
    }
  };

  const formatOption = (opt: string, type: 'semitones' | 'steps') => {
    if (type === 'semitones') {
      if (opt === '1') return '半音';
      if (opt === '2') return '全音';
      return `${opt} 個半音`;
    } else {
      const [w, h] = opt.split(',').map(Number);
      if (w === 0 && h === 0) return '同音';
      let parts = [];
      if (w > 0) parts.push(`${w} 個全音`);
      if (h > 0) parts.push(`${h} 個半音`);
      return parts.join(' + ');
    }
  };

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-8 animate-in zoom-in duration-500">
        <h1 className="text-5xl font-black text-slate-900">⏰ 時間到！</h1>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-indigo-600">🎯 你的得分：{score}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => {
            setGameOver(false);
            setTimeLeft(60);
            reset();
            generateNewQuestion(targetLevel, mode);
          }} className="w-48">
            再試一次
          </Button>
          <Button size="lg" variant="outline" onClick={onHome} className="w-48">
            🔙 回目錄
          </Button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between text-sm font-medium text-slate-500">
        <div className="flex items-center gap-3">
          <button 
            onClick={onHome}
            className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← 放棄
          </button>
          <span className="text-indigo-600 font-bold">Lv{targetLevel}</span>
        </div>

        <div className="flex items-center gap-4">
          {isChallenge && (
            <span className={`font-display font-bold text-lg px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
              ⏱ {timeLeft}s
            </span>
          )}
          {!isChallenge && (
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">得分 {score}</span>
          )}
          {combo > 1 && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={combo}
              className="text-amber-500 font-bold italic"
            >
              {combo} Combo!
            </motion.div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.title + question.subtitle}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">{question.subtitle}</p>
            <div className="flex items-center justify-center gap-6 mb-10">
              {question.title.includes('→') ? (
                <>
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl font-display font-bold text-slate-800 shadow-sm border border-slate-200">
                    {question.title.split('→')[0].trim()}
                  </div>
                  <div className="text-slate-300 text-3xl">→</div>
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl font-display font-bold text-slate-800 shadow-sm border border-slate-200">
                    {question.title.split('→')[1].trim()}
                  </div>
                </>
              ) : (
                <div className="px-8 py-6 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl font-display font-bold text-slate-800 shadow-sm border border-slate-200">
                  {question.title}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {question.options.map((opt, i) => {
                const isTheCorrectAnswer = opt === question.answer;
                return (
                  <Button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={isWrong || isCorrect}
                    className={`py-4 text-lg ${
                      isWrong && isTheCorrectAnswer
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : isWrong
                        ? 'opacity-50 bg-slate-50 text-slate-400 border-slate-200'
                        : isCorrect && isTheCorrectAnswer
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                    variant={isWrong || isCorrect ? 'primary' : 'outline'}
                  >
                    {formatOption(opt, question.type)}
                  </Button>
                );
              })}
            </div>

            {/* Feedback Block */}
            {(isCorrect || isWrong) && (
              <div className={`p-4 rounded-xl border text-left ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} animate-in slide-in-from-bottom-2`}>
                <p className="font-bold text-lg mb-1">
                  {isCorrect ? '✨ 正確！' : '❌ 答錯了'}
                </p>
                <p className="font-medium opacity-90">
                  {isCorrect 
                    ? (question.type === 'semitones' ? `是 ${formatOption(question.answer, question.type)}` : `相距 ${formatOption(question.answer, question.type)}`)
                    : `正確答案：${formatOption(question.answer, question.type)}`
                  }
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
