import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../store/useGameStore';

const QUESTIONS = [
  {
    q: '大三和弦 (Major Triad) 的結構是？',
    options: [
      { text: '根音 + 大三度 + 完全五度', correct: true },
      { text: '根音 + 小三度 + 完全五度', correct: false },
      { text: '根音 + 大三度 + 增五度', correct: false },
      { text: '根音 + 小三度 + 減五度', correct: false }
    ]
  },
  {
    q: '小三和弦 (Minor Triad) 的結構是？',
    options: [
      { text: '根音 + 小三度 + 完全五度', correct: true },
      { text: '根音 + 大三度 + 完全五度', correct: false },
      { text: '根音 + 大三度 + 增五度', correct: false },
      { text: '根音 + 小三度 + 減五度', correct: false }
    ]
  },
  {
    q: '增三和弦 (Augmented Triad) 的結構是？',
    options: [
      { text: '根音 + 大三度 + 增五度', correct: true },
      { text: '根音 + 大三度 + 完全五度', correct: false },
      { text: '根音 + 小三度 + 完全五度', correct: false },
      { text: '根音 + 小三度 + 減五度', correct: false }
    ]
  },
  {
    q: '減三和弦 (Diminished Triad) 的結構是？',
    options: [
      { text: '根音 + 小三度 + 減五度', correct: true },
      { text: '根音 + 小三度 + 完全五度', correct: false },
      { text: '根音 + 大三度 + 完全五度', correct: false },
      { text: '根音 + 大三度 + 增五度', correct: false }
    ]
  }
];

export function TriadPreCheck({ onHome }: { onHome: () => void }) {
  const unlockModule = useGameStore(s => s.unlockModule);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);

  const handleSelect = (correct: boolean) => {
    if (correct) {
      if (step === QUESTIONS.length - 1) {
        unlockModule('triad-practice');
      } else {
        setStep(s => s + 1);
      }
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  const currentQ = QUESTIONS[step];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <button onClick={onHome} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-2 sm:mb-4 transition-colors">
        ← 返回主頁
      </button>
      <Card className="border-2 border-indigo-100 shadow-md">
        <CardHeader className="text-center pb-2 px-4">
          <CardTitle className="text-xl sm:text-3xl font-display font-bold text-indigo-700">解鎖測驗：三和弦 ({step + 1}/{QUESTIONS.length})</CardTitle>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1 sm:mt-2">回答正確即可解鎖「三和弦練習」模組！</p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pt-4 px-4">
          <div className="text-base sm:text-xl font-display font-bold text-center text-slate-800 mb-4 sm:mb-6 leading-relaxed">
            {currentQ.q}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {currentQ.options.map((opt, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full text-sm sm:text-lg py-4 sm:py-8 h-auto whitespace-normal font-medium leading-tight"
                onClick={() => handleSelect(opt.correct)}
              >
                {opt.text}
              </Button>
            ))}
          </div>
          {error && (
            <p className="text-rose-500 text-center font-bold animate-in slide-in-from-bottom-2">
              ❌ 答錯了，請再想想看！
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
