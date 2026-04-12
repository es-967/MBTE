import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { ModuleProgress } from '../../store/useGameStore';

export function ModuleStats({ progress }: { progress: ModuleProgress }) {
  const { level, exp, streak, bestChallengeScore } = progress;
  const currentLevelExp = exp - (level * (level - 1) / 2) * 100;
  const nextLevelExp = level * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 p-4 text-center">
          <p className="text-sm font-semibold text-indigo-600/80 uppercase tracking-wider mb-1">當前等級</p>
          <p className="text-4xl font-display font-bold text-indigo-700">Lv {level}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-4 text-center">
          <p className="text-sm font-semibold text-emerald-600/80 uppercase tracking-wider mb-1">經驗值</p>
          <p className="text-4xl font-display font-bold text-emerald-700">{currentLevelExp}</p>
        </div>
        <div className="rounded-2xl bg-amber-50/80 border border-amber-100 p-4 text-center">
          <p className="text-sm font-semibold text-amber-600/80 uppercase tracking-wider mb-1">連勝</p>
          <p className="text-4xl font-display font-bold text-amber-700">{streak} <span className="text-2xl">🔥</span></p>
        </div>
        <div className="rounded-2xl bg-purple-50/80 border border-purple-100 p-4 text-center">
          <p className="text-sm font-semibold text-purple-600/80 uppercase tracking-wider mb-1">最佳挑戰</p>
          <p className="text-4xl font-display font-bold text-purple-700">{bestChallengeScore} <span className="text-2xl text-purple-500/70">題</span></p>
        </div>
      </div>
      <div className="space-y-2 px-2">
        <div className="flex justify-between text-sm font-medium text-slate-500">
          <span className="text-indigo-600 font-bold">Lv {level}</span>
          <span>距下一級還需 <span className="text-slate-700 font-bold">{nextLevelExp - currentLevelExp}</span> EXP</span>
          <span className="text-slate-400">Lv {level + 1}</span>
        </div>
        <Progress value={currentLevelExp} max={nextLevelExp} className="h-3" />
      </div>
    </div>
  );
}
