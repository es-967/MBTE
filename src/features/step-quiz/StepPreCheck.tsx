import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../store/useGameStore';
import confetti from 'canvas-confetti';

export function StepPreCheck({ onHome }: { onHome: () => void }) {
  const unlockModule = useGameStore(s => s.unlockModule);
  const [error, setError] = useState(false);

  const options = [
    { text: '半音', correct: false },
    { text: '全音', correct: true },
    { text: '一個半音', correct: false },
    { text: '兩個全音', correct: false }
  ];

  const handleSelect = (correct: boolean) => {
    if (correct) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      unlockModule('step-practice');
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <button onClick={onHome} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors">
        ← 返回主頁
      </button>
      <Card className="border-2 border-indigo-100 shadow-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-display font-bold text-indigo-700">解鎖測驗：全音與半音</CardTitle>
          <p className="text-slate-500 font-medium mt-2">回答正確即可解鎖「全音半音練習」模組！</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="text-xl font-display font-bold text-center text-slate-800 mb-6">
            請問自然音 C 和 D 之間的距離是？
          </div>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full text-lg py-6 h-auto whitespace-normal font-medium"
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
