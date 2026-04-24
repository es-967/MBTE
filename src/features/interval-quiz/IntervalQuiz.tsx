import React, { useEffect, useState, useRef } from 'react'
import { useIntervalQuizStore } from './intervalQuizStore'
import type { IntervalQuality, IntervalDegree } from './intervalQuiz.types'
import { useGameStore, defaultProgress } from '../../store/useGameStore'
import { Button } from '../../components/ui/Button'

interface IntervalQuizProps {
  isChallenge: boolean;
  targetLevel: number;
  onHome: () => void;
  onPlatformHome: () => void;
}

export function IntervalQuiz({ isChallenge, targetLevel, onHome, onPlatformHome }: IntervalQuizProps) {
  const { progress } = useGameStore();
  const moduleProgress = progress['interval-practice'] || defaultProgress;
  const { bestChallengeScore } = moduleProgress;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    question, selectedQuality, selectedDegree,
    submitted, isCorrect, score, total, qnum,
    nextQuestion, selectQuality, selectDegree, submit,
  } = useIntervalQuizStore()

  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [challengeScore, setChallengeScore] = useState(0);
  const challengeScoreRef = useRef(0);

  const prevLevelRef = useRef(moduleProgress.level);
  useEffect(() => {
    if (moduleProgress.level > prevLevelRef.current) {
      // Confetti removed
    }
    prevLevelRef.current = moduleProgress.level;
  }, [moduleProgress.level]);

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
            useGameStore.getState().updateBestScore('interval-practice', finalScore);
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
  }, [isChallenge, isTimeUp, bestChallengeScore]);

  // Only generate the first question on mount.
  // Subsequent questions will use the latest targetLevel when the user clicks "Next Question".
  useEffect(() => { nextQuestion(targetLevel) }, [])

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

  if (!question) return null

  const canSubmit = !!selectedQuality && !!selectedDegree && !submitted
  const correctQuality = question.answer.q
  const correctDegree = question.answer.deg

  const qualityBtnClass = (q: IntervalQuality) => {
    const base = 'px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors'
    if (!submitted) {
      return `${base} ${
        selectedQuality === q
          ? 'bg-blue-50 border-blue-400 text-blue-800'
          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
      }`
    }
    if (q === correctQuality) return `${base} bg-green-50 border-green-500 text-green-800`
    if (q === selectedQuality) return `${base} bg-red-50 border-red-400 text-red-800`
    return `${base} bg-white border-gray-100 text-gray-400`
  }

  const degreeBtnClass = (d: IntervalDegree) => {
    const base = 'px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors'
    if (!submitted) {
      return `${base} ${
        selectedDegree === d
          ? 'bg-blue-50 border-blue-400 text-blue-800'
          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
      }`
    }
    if (d === correctDegree) return `${base} bg-green-50 border-green-500 text-green-800`
    if (d === selectedDegree) return `${base} bg-red-50 border-red-400 text-red-800`
    return `${base} bg-white border-gray-100 text-gray-400`
  }

  const handleSubmit = () => {
    const correct = submit();
    if (correct) {
      if (isChallenge) {
        setChallengeScore(s => s + 1);
      } else {
        useGameStore.getState().addExp('interval-practice', 20);
        useGameStore.getState().incrementStreak('interval-practice');
      }
    } else {
      if (!isChallenge) {
        useGameStore.getState().resetStreak('interval-practice');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500 px-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="bg-slate-100 text-slate-700 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">第 {qnum - 1} 題</span>
          <span className="text-indigo-600 font-bold">Lv{targetLevel}</span>
        </div>
        {isChallenge ? (
          <span className={`font-display font-bold text-base sm:text-lg px-2 sm:px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
            ⏱ {timeLeft}s
          </span>
        ) : (
          <span className="bg-emerald-50 text-emerald-700 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">答對 {score} / {total}</span>
        )}
      </div>

      {/* Notes display */}
      <div className="text-center py-4 sm:py-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm px-2">
        <p className="text-[10px] sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3 whitespace-nowrap">這兩個音是什麼音程？</p>
        <p className="text-2xl sm:text-4xl font-display font-bold tracking-[0.15em] sm:tracking-[0.2em] text-slate-800">
          {question.root} <span className="text-slate-300 mx-1 sm:mx-2">→</span> {question.note2}
        </p>
      </div>

      {/* Step 1: Quality */}
      <div className="space-y-2 sm:space-y-3">
        <p className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-2">
          <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] sm:text-xs">1</span> 
          選擇性質
        </p>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {question.qualityOptions.map(q => (
            <button
              key={q}
              className={`${qualityBtnClass(q)} py-2 sm:py-2.5 text-xs sm:text-sm`}
              onClick={() => selectQuality(q)}
              disabled={submitted}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Degree */}
      <div className="space-y-2 sm:space-y-3">
        <p className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-2">
          <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] sm:text-xs">2</span> 
          選擇度數
        </p>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {question.degreeOptions.map(d => (
            <button
              key={d}
              className={`${degreeBtnClass(d)} py-2 sm:py-2.5 text-xs sm:text-sm`}
              onClick={() => selectDegree(d)}
              disabled={submitted}
            >
              {d}度
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {submitted && (
        <div className={`p-3 sm:p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} animate-in slide-in-from-bottom-2`}>
          <p className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">
            {isCorrect ? '✨ 正確！' : '❌ 答錯了'}
          </p>
          <p className="text-sm sm:text-base font-medium opacity-90">
            {isCorrect 
              ? question.answer.name
              : `正確答案：${question.answer.name}`
            }
          </p>
          {!isCorrect && (
            <p className="text-[10px] sm:text-sm mt-1.5 sm:mt-2 opacity-75 leading-tight">
              推導：{question.root} 到 {question.note2}，字母距離 {question.answer.deg} 度，半音距離 {question.answer.st} 個 → {question.answer.name}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
        {!submitted ? (
          <Button
            size="lg"
            className="flex-[2] text-base sm:text-lg h-11 sm:h-12"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            確認答案
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-[2] text-base sm:text-lg h-11 sm:h-12"
            onClick={() => nextQuestion(targetLevel)}
          >
            下一題 →
          </Button>
        )}
        <Button
          size="lg"
          variant="outline"
          className="flex-1 text-sm sm:text-base h-11 sm:h-12 px-2"
          onClick={onHome}
        >
          放棄
        </Button>
      </div>
    </div>
  )
}
