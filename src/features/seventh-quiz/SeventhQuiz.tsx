import React, { useEffect, useState, useRef } from 'react'
import { useSeventhQuizStore } from './seventhQuizStore'
import type { SeventhChordKey } from './seventhQuiz.types'
import { useGameStore, defaultProgress } from '../../store/useGameStore'
import { Button } from '../../components/ui/Button'

interface SeventhQuizProps {
  isChallenge: boolean;
  targetLevel: number;
  onHome: () => void;
  onPlatformHome: () => void;
}

export function SeventhQuiz({ isChallenge, targetLevel, onHome, onPlatformHome }: SeventhQuizProps) {
  const { progress } = useGameStore();
  const moduleProgress = progress['seventh-practice'] || defaultProgress;
  const { bestChallengeScore } = moduleProgress;

  const {
    question, selectedRoot, selectedType,
    submitted, isCorrect, score, total, qnum,
    nextQuestion, selectRoot, selectType, submit,
  } = useSeventhQuizStore()

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
            useGameStore.getState().updateBestScore('seventh-practice', finalScore);
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

  const canSubmit = !!selectedRoot && !!selectedType && !submitted
  const correctRoot = question.answer.root
  const correctTypeKey = question.answer.chordType.key

  const getChordSymbol = (key: SeventhChordKey) => {
    const map: Record<string, string> = {
      'Maj7': 'maj7',
      '7': '7',
      'Min7': 'm7',
      'm7b5': 'm7b5',
      'Maj7#5': 'maj7#5',
      'mMaj7': 'mMaj7',
      'Dim7': 'dim7',
      'Aug7': 'aug7'
    };
    return map[key] || key;
  };

  const getChordDisplay = (key: SeventhChordKey, name: string) => {
    return `${getChordSymbol(key)} (${name})`;
  };

  const getIntervalName = (semis: number) => {
    if (semis === 4) return '大三度';
    if (semis === 3) return '小三度';
    if (semis === 2) return '減三度';
    return `${semis}半音`;
  };

  const rootBtnClass = (r: string) => {
    const base = 'px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors'
    if (!submitted) {
      return `${base} ${
        selectedRoot === r
          ? 'bg-blue-50 border-blue-400 text-blue-800'
          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
      }`
    }
    if (r === correctRoot) return `${base} bg-green-50 border-green-500 text-green-800`
    if (r === selectedRoot) return `${base} bg-red-50 border-red-400 text-red-800`
    return `${base} bg-white border-gray-100 text-gray-400`
  }

  const typeBtnClass = (key: SeventhChordKey) => {
    const base = 'px-3 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors'
    if (!submitted) {
      return `${base} ${
        selectedType === key
          ? 'bg-blue-50 border-blue-400 text-blue-800'
          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
      }`
    }
    if (key === correctTypeKey) return `${base} bg-green-50 border-green-500 text-green-800`
    if (key === selectedType) return `${base} bg-red-50 border-red-400 text-red-800`
    return `${base} bg-white border-gray-100 text-gray-400`
  }

  const handleSubmit = () => {
    const correct = submit();
    if (correct) {
      if (isChallenge) {
        setChallengeScore(s => s + 1);
      } else {
        useGameStore.getState().addExp('seventh-practice', 25); // Slightly more exp for 7th chords
        useGameStore.getState().incrementStreak('seventh-practice');
      }
    } else {
      if (!isChallenge) {
        useGameStore.getState().resetStreak('seventh-practice');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between text-sm font-medium text-slate-500">
        <div className="flex items-center gap-3">
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full">第 {qnum - 1} 題</span>
          <span className="text-indigo-600 font-bold">Lv{targetLevel}</span>
        </div>
        {isChallenge ? (
          <span className={`font-display font-bold text-lg px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
            ⏱ {timeLeft}s
          </span>
        ) : (
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">答對 {score} / {total}</span>
        )}
      </div>

      {/* Notes display */}
      <div className="text-center py-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">這四個音組成哪個和弦？</p>
        <p className="text-2xl sm:text-3xl font-display font-bold tracking-[0.15em] sm:tracking-[0.2em] text-slate-800 px-2">
          {question.displayNotes.join(' · ')}
        </p>
      </div>

      {/* Step 1: Root */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-500 flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs">1</span> 
          選擇根音
        </p>
        <div className="grid grid-cols-4 gap-2">
          {question.rootOptions.map(r => (
            <button
              key={r}
              className={rootBtnClass(r)}
              onClick={() => selectRoot(r)}
              disabled={submitted}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Type */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-500 flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs">2</span> 
          選擇和弦類型
        </p>
        <div className="grid grid-cols-2 gap-2">
          {question.typeOptions.map(t => (
            <button
              key={t.key}
              className={typeBtnClass(t.key)}
              onClick={() => selectType(t.key)}
              disabled={submitted}
            >
              {getChordSymbol(t.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {submitted && (
        <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} animate-in slide-in-from-bottom-2`}>
          <p className="font-bold text-lg mb-1">
            {isCorrect ? '✨ 正確！' : '❌ 答錯了'}
          </p>
          <p className="font-medium opacity-90">
            {isCorrect 
              ? `${correctRoot} ${getChordDisplay(question.answer.chordType.key, question.answer.chordType.name)}`
              : `正確答案：${correctRoot} ${getChordDisplay(question.answer.chordType.key, question.answer.chordType.name)}（${question.answer.notes.join(' ')}）`
            }
          </p>
          {!isCorrect && (
            <p className="text-xs mt-2 opacity-75 font-medium leading-relaxed">
              結構：{question.answer.notes[0]}→{question.answer.notes[1]}（{getIntervalName(question.answer.chordType.steps[0])}）
              + {question.answer.notes[1]}→{question.answer.notes[2]}（{getIntervalName(question.answer.chordType.steps[1] - question.answer.chordType.steps[0])}）
              + {question.answer.notes[2]}→{question.answer.notes[3]}（{getIntervalName(question.answer.chordType.steps[2] - question.answer.chordType.steps[1])}）
              = {question.answer.chordType.name}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {!submitted ? (
          <Button
            size="lg"
            className="flex-1 text-lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            確認答案
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-1 text-lg"
            onClick={() => nextQuestion(targetLevel)}
          >
            下一題 →
          </Button>
        )}
        <Button
          size="lg"
          variant="outline"
          className="px-4"
          onClick={onHome}
        >
          設定
        </Button>
      </div>
    </div>
  )
}
