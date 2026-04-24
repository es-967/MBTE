import React from 'react';
import { TrainingModule } from '../../types/TrainingModule';
import { useGameStore, getGlobalProgress, defaultProgress } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { CharacterCard } from './CharacterCard';

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
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const theoryModules = modules.filter(m => m.category === 'theory');
  const fretboardModules = modules.filter(m => m.category === 'fretboard');

  const renderModuleCard = (module: TrainingModule) => {
    const moduleProgress = progress[module.id] || defaultProgress;
    const isLocked = false;
    const diff = difficultyLabel[module.difficulty];
    return (
      <button
        key={module.id}
        onClick={() => !isLocked && onSelectModule(module)}
        disabled={isLocked}
        className={`text-left w-full rounded-2xl border-2 p-4 sm:p-6 transition-all duration-200 space-y-3 sm:space-y-4
          ${isLocked
            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
            : 'border-slate-200/60 bg-white hover:border-indigo-300 hover:shadow-md cursor-pointer active:scale-[0.98]'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-3xl sm:text-4xl">{isLocked ? '🔒' : module.icon}</span>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg sm:text-xl leading-tight">{module.title}</h3>
              {isLocked && <p className="text-xs text-slate-400 mt-1">Lv{module.unlockLevel} 解鎖</p>}
            </div>
          </div>
          <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full ${diff.color}`}>{diff.text}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{module.description}</p>
        <div className="flex justify-between items-center mt-2 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
          <div className="text-xs sm:text-sm text-indigo-600 font-bold bg-indigo-50 px-2 sm:px-3 py-1 rounded-full">Lv {moduleProgress.level}</div>
          <div className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1">
            <span>⏱</span> 約 {module.estimatedMinutes} 分鐘
          </div>
        </div>
      </button>
    );
  };

  return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 sm:space-y-12 animate-in fade-in duration-500">

      <div className="text-center space-y-4 py-4 sm:py-8">
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Music Mastery</span>
          <br />音樂訓練中心
        </h1>
        <p className="text-base sm:text-lg text-slate-500 font-medium px-4">展開你的音樂學習旅程，選擇一個練習開始訓練</p>
      </div>

      <div className="flex justify-center">
        <CharacterCard />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
          <span>🧠</span> 樂理思維
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {theoryModules.map(renderModuleCard)}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
          <span>🎸</span> 指板地圖
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {fretboardModules.length > 0 ? (
            fretboardModules.map(renderModuleCard)
          ) : (
            <div className="md:col-span-2 p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 text-slate-400 font-medium">
              指板視覺記憶和空間推理訓練，即將推出！
            </div>
          )}
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
