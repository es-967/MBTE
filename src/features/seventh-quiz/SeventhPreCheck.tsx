import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Music, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface SeventhPreCheckProps {
  onStart: () => void;
  onHome: () => void;
}

export function SeventhPreCheck({ onStart, onHome }: SeventhPreCheckProps) {
  const { progress } = useGameStore();
  const triadLevel = progress['triad-practice']?.level || 1;
  const isEligible = triadLevel >= 3;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <Card className="overflow-hidden border-2 border-indigo-100 shadow-xl">
        <div className="bg-indigo-600 p-8 text-white text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md mb-2">
            <Music size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tight">七和弦練習</h2>
          <p className="text-indigo-100 text-lg font-medium">進階和聲挑戰，掌握四音疊置的奧秘</p>
        </div>
        
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={24} />
              這項練習包含：
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                '大七 (Maj7)',
                '屬七 (7)',
                '小七 (m7)',
                '半減七 (m7b5)',
                '減七 (dim7)',
                '及更多進階變體'
              ].map(item => (
                <li key={item} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {!isEligible && (
            <div className="flex gap-4 p-5 bg-amber-50 rounded-2xl border-2 border-amber-200 text-amber-900 shadow-sm animate-bounce-short">
              <AlertCircle className="shrink-0 text-amber-600" size={24} />
              <div className="space-y-1">
                <p className="font-bold text-lg">建議先完成三和弦練習</p>
                <p className="text-sm opacity-90 font-medium">
                  三和弦是七和弦的基礎，建議將「三和弦練習」提升至 Lv.3 再開始。
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg" 
              className="flex-1 text-xl py-8 shadow-lg shadow-indigo-200" 
              onClick={onStart}
            >
              🚀 即刻開始
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1 text-xl py-8" 
              onClick={onHome}
            >
              🔙 回主選單
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-slate-400 font-medium text-sm">
        提示：練習不限次數，每次答題都能累積經驗值！
      </p>
    </div>
  );
}
