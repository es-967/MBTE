import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface FretboardStepPreCheckProps {
  onPass: () => void;
  onHome: () => void;
}

const QUESTIONS = [
  {
    text: "吉他指板上，相鄰的格子（例如第 3 格到第 4 格）距離是半音還是全音？",
    options: ["全音", "半音", "一又二分之一音"],
    answer: "半音"
  },
  {
    text: "吉他標準調音下，第 3 弦 (G) 與第 2 弦 (B) 之間的調音距離是？",
    options: ["完全四度 (5個半音)", "大三度 (4個半音)", "大二度 (2個半音)"],
    answer: "大三度 (4個半音)"
  }
];

export function FretboardStepPreCheck({ onPass, onHome }: FretboardStepPreCheckProps) {
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelect = (option: string) => {
    if (option === QUESTIONS[step].answer) {
      setErrorMsg("");
      if (step === QUESTIONS.length - 1) {
        onPass();
      } else {
        setStep(step + 1);
      }
    } else {
      setErrorMsg("答錯囉，再想想看！提示：吉他每一格代表一個半音，而除了 G 與 B 弦之外，其他弦的空弦距離都是完全四度。");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <button onClick={onHome} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors">
        ← 返回
      </button>

      <Card className="border-2 border-indigo-100 shadow-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-display font-bold text-indigo-700">解鎖測驗 ({step + 1}/{QUESTIONS.length})</CardTitle>
          <p className="text-slate-500 font-medium mt-2">回答正確即可解鎖「指板全半音練習」模組！</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="text-xl font-display font-bold text-center text-slate-800 mb-6">
            {QUESTIONS[step].text}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {QUESTIONS[step].options.map(opt => (
              <Button 
                key={opt}
                variant="outline" 
                onClick={() => handleSelect(opt)}
                className="w-full text-lg py-6 h-auto whitespace-normal font-medium hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
              >
                {opt}
              </Button>
            ))}
          </div>

          {errorMsg && (
            <p className="text-rose-500 text-center font-bold animate-in slide-in-from-bottom-2">
              {errorMsg}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
