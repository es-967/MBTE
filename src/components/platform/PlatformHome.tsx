import React from 'react';
import { TrainingModule } from '../../types/TrainingModule';
import { useGameStore, getGlobalProgress, defaultProgress } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';

interface PlatformHomeProps {
  modules: TrainingModule[];
  onSelectModule: (module: TrainingModule) => void;
}

const difficultyLabel = {
  beginner: { text: '入門', color: 'bg-green-100 text-green-700' },
  intermediate: { text: '進階', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { text: '高階', color: 'bg-red-100 text-red-700' },
};

export function PlatformHome({ modules, onSelectModule }: PlatformHomeProps) {
  const { progress } = useGameStore();
  const globalProgress = getGlobalProgress(progress, modules.length);
  const { completionPercentage, exp, streak, bestChallengeScore } = globalProgress;
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12 animate-in fade-in duration-500">

      <div className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-display font-extrabold tracking-tight text-slate-900">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Music Mastery</span>
          <br />音樂訓練中心
        </h1>
        <p className="text-lg text-slate-500 font-medium">展開你的音樂學習旅程，選擇一個練習開始訓練</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 p-4 text-center">
          <p className="text-sm font-semibold text-indigo-600/80 uppercase tracking-wider mb-1">總完成度</p>
          <p className="text-4xl font-display font-bold text-indigo-700">{completionPercentage}%</p>
        </div>
        <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-4 text-center">
          <p className="text-sm font-semibold text-emerald-600/80 uppercase tracking-wider mb-1">總經驗值</p>
          <p className="text-4xl font-display font-bold text-emerald-700">{exp}</p>
        </div>
        <div className="rounded-2xl bg-amber-50/80 border border-amber-100 p-4 text-center">
          <p className="text-sm font-semibold text-amber-600/80 uppercase tracking-wider mb-1">總連勝</p>
          <p className="text-4xl font-display font-bold text-amber-700">{streak} <span className="text-2xl">🔥</span></p>
        </div>
        <div className="rounded-2xl bg-purple-50/80 border border-purple-100 p-4 text-center">
          <p className="text-sm font-semibold text-purple-600/80 uppercase tracking-wider mb-1">最佳挑戰</p>
          <p className="text-4xl font-display font-bold text-purple-700">{bestChallengeScore} <span className="text-2xl text-purple-500/70">題</span></p>
        </div>
      </div>

      <div className="space-y-2 px-2">
        <div className="flex justify-between text-sm font-medium text-slate-500">
          <span className="text-indigo-600 font-bold">訓練進度</span>
          <span className="text-slate-700 font-bold">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} max={100} className="h-3" />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
          <span>📚</span> 練習項目
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {modules.map((module) => {
            const moduleProgress = progress[module.id] || defaultProgress;
            const isLocked = false;
            const diff = difficultyLabel[module.difficulty];
            return (
              <button
                key={module.id}
                onClick={() => !isLocked && onSelectModule(module)}
                disabled={isLocked}
                className={`text-left w-full rounded-2xl border-2 p-6 transition-all duration-200 space-y-4
                  ${isLocked
                    ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                    : 'border-slate-200/60 bg-white hover:border-indigo-300 hover:shadow-md cursor-pointer active:scale-[0.98]'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{isLocked ? '🔒' : module.icon}</span>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-xl leading-tight">{module.title}</h3>
                      {isLocked && <p className="text-xs text-slate-400 mt-1">Lv{module.unlockLevel} 解鎖</p>}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${diff.color}`}>{diff.text}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{module.description}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                  <div className="text-sm text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">Lv {moduleProgress.level}</div>
                  <div className="text-sm text-slate-500 font-medium flex items-center gap-1">
                    <span>⏱</span> 約 {module.estimatedMinutes} 分鐘
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-6 border-t flex justify-center">
        {showResetConfirm ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-red-600 font-medium">確定要重置所有進度嗎？</span>
            <button className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md" onClick={() => { useGameStore.getState().resetProgress(); setShowResetConfirm(false); }}>確定重置</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md" onClick={() => setShowResetConfirm(false)}>取消</button>
          </div>
        ) : (
          <button className="text-sm text-red-400 hover:text-red-500 px-4 py-2 rounded-md" onClick={() => setShowResetConfirm(true)}>🔄 重置進度</button>
        )}
      </div>
    </div>
  );
}
