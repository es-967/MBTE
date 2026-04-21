import React, { useState, useEffect } from 'react';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SeventhTutorial } from './SeventhTutorial';
import { ModuleStats } from '../../components/platform/ModuleStats';

interface SeventhHomeProps {
  onStartQuiz: (isChallenge: boolean, targetLevel: number) => void;
  onHome: () => void;
}

export function SeventhHome({ onStartQuiz, onHome }: SeventhHomeProps) {
  const { progress } = useGameStore();
  const moduleProgress = progress['seventh-practice'] || defaultProgress;
  const { level } = moduleProgress;
  
  const [practiceLevel, setPracticeLevel] = useState<number>(level);
  const [challengeLevel, setChallengeLevel] = useState<number>(level);

  // Keep dropdowns synced if they were at the max level
  useEffect(() => {
    setPracticeLevel(prev => prev === level - 1 ? level : prev);
    setChallengeLevel(prev => prev === level - 1 ? level : prev);
  }, [level]);

  const unlockInfo = [
    { label: '基礎 C 根音 (前四類)', level: 1 },
    { label: 'C, F, G 根音', level: 2 },
    { label: 'C 大調順階七和弦', level: 4 },
    { label: '全根音 + 前六類和弦', level: 6 },
    { label: '全領域開放', level: 9 },
  ];

  // Generate options up to current level
  const levelOptions = Array.from({ length: level }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <button onClick={onHome} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors">
        ← 返回主頁
      </button>

      <ModuleStats progress={moduleProgress} />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-display flex items-center gap-2 text-slate-800">
              <span>📚</span> 練習模式
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
            <Button className="w-full text-lg" size="lg" onClick={() => onStartQuiz(false, practiceLevel)}>
              🎯 開始練習
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
            <Button variant="secondary" className="w-full text-lg" size="lg" onClick={() => onStartQuiz(true, challengeLevel)}>
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

      <SeventhTutorial />
    </div>
  );
}
