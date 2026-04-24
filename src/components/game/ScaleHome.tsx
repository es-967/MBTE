import React, { useEffect } from 'react';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tutorial } from './Tutorial';
import { PracticeMode } from '../../lib/music/skillGraph';
import { ModuleStats } from '../platform/ModuleStats';

interface ScaleHomeProps {
  onStartQuiz: (isChallenge: boolean, difficulty?: 'easy' | 'normal' | 'hard') => void;
  onHome: () => void;
}

export function ScaleHome({ onStartQuiz, onHome }: ScaleHomeProps) {
  const { progress, practiceMode, setPracticeMode } = useGameStore();
  const moduleProgress = progress['scale-practice'] || defaultProgress;
  const { level } = moduleProgress;
  const [challengeDifficulty, setChallengeDifficulty] = React.useState<'easy' | 'normal' | 'hard'>('normal');

  const unlockInfo = [
    { label: '基礎大調', level: 1 },
    { label: '降記號調性', level: 3 },
    { label: '小調練習', level: 6 },
    { label: '重升記號調性', level: 9 },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <button onClick={onHome} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-2 sm:mb-4 transition-colors">
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
              <label className="text-sm font-semibold text-slate-700">選擇調性類型：</label>
              <select
                className="w-full p-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                value={practiceMode}
                onChange={(e) => setPracticeMode(e.target.value as PracticeMode)}
                disabled={level < 6}
              >
                <option value="major">大調</option>
                {level >= 6 && <option value="minor">小調</option>}
                {level >= 6 && <option value="mixed">混答</option>}
              </select>
              {level < 6 && <p className="text-xs font-medium text-slate-500">小調與混答模式將於 Lv6 解鎖</p>}
            </div>
            <Button className="w-full text-lg" size="lg" onClick={() => onStartQuiz(false)}>
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
              <label className="text-sm font-semibold text-slate-700">選擇難度：</label>
              <select
                className="w-full p-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                value={challengeDifficulty}
                onChange={(e) => setChallengeDifficulty(e.target.value as any)}
              >
                <option value="easy">簡單 (-2級)</option>
                <option value="normal">普通</option>
                <option value="hard">困難 (+2級)</option>
              </select>
            </div>
            <Button variant="secondary" className="w-full text-lg" size="lg" onClick={() => onStartQuiz(true, challengeDifficulty)}>
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

      <Tutorial />
    </div>
  );
}
