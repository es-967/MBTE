import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../store/useGameStore';

const QUESTIONS = [
  {
    q: '音程（兩個音之間的距離）的計算單位是什麼？',
    options: [
      { text: '度 (Degree)', correct: true },
      { text: '階 (Step)', correct: false },
      { text: '級 (Class)', correct: false },
      { text: '音 (Tone)', correct: false }
    ]
  },
  {
    q: '音程的「性質」包含以下哪些？',
    options: [
      { text: '完全、大、小、增、減', correct: true },
      { text: '高、低、長、短', correct: false },
      { text: '明、暗、清、濁', correct: false },
      { text: '軟、硬、強、弱', correct: false }
    ]
  }
];

export function IntervalPreCheck({ onHome }: { onHome: () => void }) {
  const unlockModule = useGameStore(s => s.unlockModule);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);

  const handleSelect = (correct: boolean) => {
    if (correct) {
      if (step === QUESTIONS.length - 1) {
        unlockModule('interval-practice');
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
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <button onClick={onHome} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors">
        ← 返回主頁
      </button>
      <Card className="border-2 border-indigo-100 shadow-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-display font-bold text-indigo-700">解鎖測驗：音程判斷 ({step + 1}/{QUESTIONS.length})</CardTitle>
          <p className="text-slate-500 font-medium mt-2">回答正確即可解鎖「音程判斷」模組！</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="text-xl font-display font-bold text-center text-slate-800 mb-6">
            {currentQ.q}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full text-lg py-8 h-auto whitespace-normal font-medium"
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
