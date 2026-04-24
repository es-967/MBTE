import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { ModuleProgress } from '../../store/useGameStore';

interface ModuleStatsProps {
  progress: ModuleProgress;
  bestScoreLabel?: string;
  bestScoreUnit?: string;
  bestScoreOverride?: number | string;
  hideExpBar?: boolean;
  
  expLabelOverride?: string;
  expValueOverride?: number | string;
  
  streakLabelOverride?: string;
  streakValueOverride?: number | string;
  streakIconOverride?: string;
  
  levelLabelOverride?: string;
  levelValueOverride?: number | string;

  customProgressValue?: number;
  customProgressMax?: number;
  customProgressCenterText?: React.ReactNode;
  customProgressLeftText?: React.ReactNode;
  customProgressRightText?: React.ReactNode;
}

export function ModuleStats({ 
  progress, 
  bestScoreLabel = '最佳挑戰', 
  bestScoreUnit = '題', 
  bestScoreOverride, 
  hideExpBar = false,
  expLabelOverride,
  expValueOverride,
  streakLabelOverride,
  streakValueOverride,
  streakIconOverride = '🔥',
  levelLabelOverride,
  levelValueOverride,
  customProgressValue,
  customProgressMax,
  customProgressCenterText,
  customProgressLeftText,
  customProgressRightText
}: ModuleStatsProps) {
  const { level, exp, streak, bestChallengeScore } = progress;
  const currentLevelExp = exp - (level * (level - 1) / 2) * 100;
  const nextLevelExp = level * 100;
  
  const displayScore = bestScoreOverride !== undefined ? bestScoreOverride : bestChallengeScore;

  const displayLevel = levelValueOverride !== undefined ? levelValueOverride : level;
  const displayExp = expValueOverride !== undefined ? expValueOverride : Math.floor(exp);
  const displayStreak = streakValueOverride !== undefined ? streakValueOverride : streak;

  const progressVal = customProgressValue !== undefined ? customProgressValue : currentLevelExp;
  const progressMax = customProgressMax !== undefined ? customProgressMax : nextLevelExp;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 p-4 text-center">
          <p className="text-sm font-semibold text-indigo-600/80 uppercase tracking-wider mb-1">{levelLabelOverride || '當前等級'}</p>
          <p className="text-4xl font-display font-bold text-indigo-700">Lv {displayLevel}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-4 text-center">
          <p className="text-sm font-semibold text-emerald-600/80 uppercase tracking-wider mb-1">{expLabelOverride || '經驗值'}</p>
          <p className="text-4xl font-display font-bold text-emerald-700">{displayExp}</p>
        </div>
        <div className="rounded-2xl bg-amber-50/80 border border-amber-100 p-4 text-center">
          <p className="text-sm font-semibold text-amber-600/80 uppercase tracking-wider mb-1">{streakLabelOverride || '連勝'}</p>
          <p className="text-4xl font-display font-bold text-amber-700">{displayStreak} {streakIconOverride && <span className="text-2xl">{streakIconOverride}</span>}</p>
        </div>
        <div className="rounded-2xl bg-purple-50/80 border border-purple-100 p-4 text-center">
          <p className="text-sm font-semibold text-purple-600/80 uppercase tracking-wider mb-1">{bestScoreLabel}</p>
          <p className="text-4xl font-display font-bold text-purple-700">{displayScore} <span className="text-2xl text-purple-500/70">{bestScoreUnit}</span></p>
        </div>
      </div>
      {!hideExpBar && (
        <div className="space-y-2 px-2">
          <div className="flex justify-between text-sm font-medium text-slate-500">
            {customProgressLeftText ? customProgressLeftText : (
              <span className="text-indigo-600 font-bold">Lv {displayLevel}</span>
            )}
            
            {customProgressCenterText ? customProgressCenterText : (
              <span>距下一級還需 <span className="text-slate-700 font-bold">{progressMax - progressVal}</span> EXP</span>
            )}
            
            {customProgressRightText ? customProgressRightText : (
               <span className="text-slate-400">Lv {(typeof displayLevel === 'number' ? displayLevel : level) + 1}</span>
            )}
          </div>
          <Progress value={progressVal} max={progressMax} className="h-3" />
        </div>
      )}
    </div>
  );
}
