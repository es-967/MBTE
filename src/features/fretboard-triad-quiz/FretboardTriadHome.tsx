import React, { useState } from 'react';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { ModuleStats } from '../../components/platform/ModuleStats';
import { TriadPosition, POSITIONS_LIST, POSITION_NAMES } from './chordDefs';

export type FretboardTriadMode = 'memorize' | 'recall' | 'random' | 'hell';

interface FretboardTriadHomeProps {
  onStartQuiz: (mode: FretboardTriadMode, position?: TriadPosition) => void;
  onHome: () => void;
}

export function FretboardTriadHome({ onStartQuiz, onHome }: FretboardTriadHomeProps) {
  const { progress } = useGameStore();
  const moduleProgress = progress['fretboard-triad'] || defaultProgress;
  const metadata = moduleProgress.customMetadata || {};
  const cleared = metadata.cleared || {};
  const streaks = metadata.streaks || {};

  const [selectedPosMem, setSelectedPosMem] = useState<TriadPosition>(POSITIONS_LIST.find(p => !cleared[`memorize_${p}`]) || 'pos1');
  const [selectedPosRec, setSelectedPosRec] = useState<TriadPosition>(POSITIONS_LIST.find(p => !cleared[`recall_${p}`]) || 'pos1');

  const isMemUnlocked = (pos: TriadPosition) => {
    const idx = POSITIONS_LIST.indexOf(pos);
    if (idx === 0) return true;
    return !!cleared[`recall_${POSITIONS_LIST[idx - 1]}`];
  };

  const isRecUnlocked = (pos: TriadPosition) => {
    return !!cleared[`memorize_${pos}`];
  };

  const isRandomUnlocked = () => {
    return !!cleared[`recall_pos5`];
  };

  const renderPositionSelector = (
    mode: 'memorize' | 'recall', 
    selected: TriadPosition, 
    setSelected: (p: TriadPosition) => void,
    unlockCheck: (p: TriadPosition) => boolean
  ) => {
    return (
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-2">
        {POSITIONS_LIST.map(pos => {
          const unlocked = unlockCheck(pos);
          const isClear = cleared[`${mode}_${pos}`];
          const currentStreak = streaks[`${mode}_${pos}`] || 0;
          const isSelected = selected === pos;

          return (
            <button
              key={pos}
              onClick={() => unlocked && setSelected(pos)}
              disabled={!unlocked}
              className={`
                flex-1 min-w-[100px] py-2 px-1 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-1
                ${!unlocked ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed' : 
                  isSelected ? 'bg-amber-600 border-amber-700 text-white shadow-md' : 
                  isClear ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' :
                  `bg-white border-slate-200 text-slate-700 hover:border-amber-300`}
              `}
            >
              <div className="flex items-center gap-1 text-[11px] sm:text-[13px]">
                {!unlocked ? '🔒' : isClear ? '✨' : ''} {POSITION_NAMES[pos]}
              </div>
              {unlocked && !isClear && (
                <div className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-slate-400'}`}>
                  {Math.min(3, currentStreak)}/3
                </div>
              )}
              {isClear && (
                <div className={`text-[10px] ${isSelected ? 'text-amber-100' : 'text-emerald-500'}`}>
                  READY
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={onHome} 
        className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        ← 返回音樂訓練中心
      </button>

      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">三和弦練習</h2>
        <p className="text-slate-500 font-medium text-xs sm:text-base px-2">熟悉各大把位的三和弦指型，成為指板和弦大師</p>
      </div>

      <ModuleStats 
        progress={moduleProgress} 
        bestScoreLabel="近期正確率" 
        bestScoreUnit="%" 
        bestScoreOverride={
          moduleProgress.customMetadata?.recentStats?.total > 0 
            ? Math.round((moduleProgress.customMetadata.recentStats.correct / moduleProgress.customMetadata.recentStats.total) * 100) 
            : 0
        }
        expLabelOverride="完成度"
        expValueOverride={`${Math.min(100, Math.floor(((moduleProgress.level - 1) / 11) * 100))}%`}
        streakLabelOverride="連續答對數"
        streakValueOverride={moduleProgress.streak}
        streakIconOverride="🔥"
        customProgressValue={Math.min(100, Math.floor(((moduleProgress.level - 1) / 11) * 100))}
        customProgressMax={100}
        customProgressLeftText={<span className="text-amber-600 font-bold">檢定進度</span>}
        customProgressCenterText={<span>距離大師還差 <span className="text-slate-700 font-bold">{Math.max(0, 11 - (moduleProgress.level - 1))}</span> 個解鎖項目</span>}
        customProgressRightText={<span className="text-slate-400">大師</span>}
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Memory Level */}
        <Card className="border-2 border-amber-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-amber-50/50 text-center sm:text-left">
            <CardTitle className="text-base sm:text-xl font-display flex items-center justify-center sm:justify-start gap-2 text-slate-800">
              <span className="text-xl sm:text-2xl">👀</span> 1. 形狀記憶
            </CardTitle>
          </div>
          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              顯示該 Position 的某個三和弦指型 (maj 或 m)，考驗你是否能認得它是哪一個和弦。<br/>
              <span className="text-amber-600 font-bold block mt-1">連續答對 3 次解鎖推算</span>
            </p>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-700">選擇把位：</label>
              {renderPositionSelector('memorize', selectedPosMem, setSelectedPosMem, isMemUnlocked)}
            </div>
            <Button 
              className="w-full h-11 sm:h-12 text-sm sm:text-base border-b-4 border-amber-700 bg-amber-600 hover:bg-amber-700 text-white active:border-b-0 active:translate-y-1 transition-all" 
              onClick={() => onStartQuiz('memorize', selectedPosMem)}
            >
              開始記憶挑戰 ({POSITION_NAMES[selectedPosMem]})
            </Button>
          </CardContent>
        </Card>

        {/* Recall Level */}
        <Card className={`border-2 ${isRecUnlocked('pos1') ? 'border-emerald-100' : 'border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <div className={`p-4 sm:p-6 border-b border-slate-100 text-center sm:text-left ${isRecUnlocked('pos1') ? 'bg-emerald-50/50' : 'bg-slate-50'}`}>
            <CardTitle className={`text-base sm:text-xl font-display flex items-center justify-center sm:justify-start gap-2 ${isRecUnlocked('pos1') ? 'text-slate-800' : 'text-slate-400'}`}>
              <span className="text-xl sm:text-2xl">{isRecUnlocked('pos1') ? '🧩' : '🔒'}</span> 2. 和弦建構
            </CardTitle>
          </div>
          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              顯示目標和弦名稱與其在該把位的根音位置，請你點擊出正確的按法。<br/>
              <span className="text-emerald-600 font-bold block mt-1">需先解鎖該把位的形狀記憶</span>
            </p>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-700">選擇把位：</label>
              {renderPositionSelector('recall', selectedPosRec, setSelectedPosRec, isRecUnlocked)}
            </div>
            <Button 
              className={`w-full h-11 sm:h-12 text-sm sm:text-base border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isRecUnlocked(selectedPosRec) ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800 text-white' : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed hover:bg-slate-300'}`}
              disabled={!isRecUnlocked(selectedPosRec)}
              onClick={() => onStartQuiz('recall', selectedPosRec)}
            >
              {isRecUnlocked(selectedPosRec) ? `開始建構挑戰 (${POSITION_NAMES[selectedPosRec]})` : '尚未解鎖'}
            </Button>
          </CardContent>
        </Card>

        {/* Random Master */}
        <Card className={`md:col-span-2 border-2 ${isRandomUnlocked() ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-slate-50'} shadow-sm transition-shadow`}>
          <div className={`p-4 sm:p-6 border-b border-slate-100 text-center sm:text-left ${isRandomUnlocked() ? 'bg-rose-100/50' : 'bg-slate-100/50'}`}>
            <CardTitle className={`text-lg sm:text-xl font-display flex items-center justify-center sm:justify-start gap-2 ${isRandomUnlocked() ? 'text-slate-800' : 'text-slate-400'}`}>
              <span className="text-xl sm:text-2xl">{isRandomUnlocked() ? '🔥' : '🔒'}</span> 3. 隨機大師
            </CardTitle>
          </div>
          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center">
              <div className="flex-1 space-y-2 text-center md:text-left">
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  指板上隨機給出 Root 位置跟和弦代號 (maj 或 min)，請你快速點擊出正確的按法。<br/>
                  <span className={`${isRandomUnlocked() ? 'text-rose-600' : 'text-slate-400'} font-bold block mt-1`}>
                    解鎖所有把位的和弦建構後開啟
                  </span>
                </p>
                {isRandomUnlocked() && cleared['random'] && (
                   <p className="text-amber-500 font-bold text-xs sm:text-sm">🏆 你已經制霸指板的三和弦！</p>
                )}
              </div>
              <div className="w-full md:w-auto flex flex-col gap-3">
                <Button 
                  disabled={!isRandomUnlocked()}
                  className={`w-full md:w-48 h-12 sm:h-14 text-sm sm:text-base font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isRandomUnlocked() ? 'bg-rose-500 hover:bg-rose-600 border-rose-700 text-white shadow-rose-200 shadow-lg' : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'}`} 
                  onClick={() => onStartQuiz('random')}
                >
                  {isRandomUnlocked() ? '進入最終測驗' : '尚未解鎖'}
                </Button>
                <Button 
                  disabled={!isRandomUnlocked()}
                  className={`w-full md:w-48 h-12 sm:h-14 text-sm sm:text-base font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isRandomUnlocked() ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-800 text-white shadow-indigo-200 shadow-lg' : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'}`} 
                  onClick={() => onStartQuiz('hell')}
                >
                  {isRandomUnlocked() ? '😈 地獄模式' : '尚未解鎖'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
