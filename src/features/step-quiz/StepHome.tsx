import React, { useState, useEffect } from 'react';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ModuleStats } from '../../components/platform/ModuleStats';
import { StepQuizMode } from './stepQuiz.types';

interface Props {
  onStartQuiz: (isChallenge: boolean, targetLevel: number, mode: StepQuizMode) => void;
  onHome: () => void;
}

export function StepHome({ onStartQuiz, onHome }: Props) {
  const { progress } = useGameStore();
  const moduleProgress = progress['step-practice'] || defaultProgress;
  const { level } = moduleProgress;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [practiceLevel, setPracticeLevel] = useState<number>(level);
  const [challengeLevel, setChallengeLevel] = useState<number>(level);
  const [practiceMode, setPracticeMode] = useState<StepQuizMode>('semitones');

  useEffect(() => {
    setPracticeLevel(prev => prev === level - 1 ? level : prev);
    setChallengeLevel(prev => prev === level - 1 ? level : prev);
  }, [level]);

  const unlockInfo = [
    { label: '二度音程（無升降記號）', level: 1 },
    { label: '二至三度音程（單方升降記號）', level: 2 },
    { label: '擴大至四度（雙方升降記號）', level: 3 },
    { label: '擴大至六度音程', level: 4 },
    { label: '擴大至七度音程 (Max)', level: 5 },
  ];

  const levelOptions = Array.from({ length: level }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={onHome}
        className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-2 sm:mb-4 transition-colors"
      >
        ← 返回主頁
      </button>

      <ModuleStats progress={moduleProgress} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-display flex items-center gap-2 text-slate-800">
              <span>🚀</span> 闖關模式
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">選擇練習等級：</label>
              <select
                className="w-full p-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                value={practiceLevel}
                onChange={(e) => setPracticeLevel(Number(e.target.value))}
              >
                {levelOptions.map(l => (
                  <option key={l} value={l}>Lv {l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">選擇題型：</label>
              <select
                className="w-full p-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                value={practiceMode}
                onChange={(e) => setPracticeMode(e.target.value as StepQuizMode)}
              >
                <option value="semitones">全音與半音判斷</option>
                {level >= 2 && <option value="note-steps">音程結構推算 (音名距離)</option>}
                {level >= 2 && <option value="mixed">綜合練習 (隨機混合)</option>}
              </select>
            </div>
            <Button className="w-full text-lg" size="lg" onClick={() => onStartQuiz(false, practiceLevel, practiceMode)}>
              🚀 開始闖關
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-display flex items-center gap-2 text-slate-800">
              <span>⏰</span> 限時挑戰
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm font-medium text-slate-600">一分鐘內答對越多題越好！</p>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">選擇挑戰等級：</label>
              <select
                className="w-full p-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                value={challengeLevel}
                onChange={(e) => setChallengeLevel(Number(e.target.value))}
              >
                {levelOptions.map(l => (
                  <option key={l} value={l}>Lv {l}</option>
                ))}
              </select>
            </div>
            <Button variant="secondary" className="w-full text-lg" size="lg" onClick={() => onStartQuiz(true, challengeLevel, 'mixed')}>
              🚀 開始挑戰
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-display font-bold text-slate-900">🔓 解鎖功能</h3>
        <div className="flex flex-wrap gap-3">
          {unlockInfo.map((info) => (
            <div
              key={info.label}
              className={`px-4 py-2 rounded-full text-sm font-bold ${
                level >= info.level
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200 shadow-sm'
                  : 'bg-slate-100 text-slate-500 border-2 border-slate-200 opacity-70'
              }`}
            >
              {level >= info.level ? '✅' : '🔒'} {info.label} {level < info.level && `(Lv${info.level}解鎖)`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
