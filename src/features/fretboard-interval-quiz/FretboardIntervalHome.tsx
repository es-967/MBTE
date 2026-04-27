import React, { useState } from 'react';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { ModuleStats } from '../../components/platform/ModuleStats';

export type FretboardIntervalMode = 'memorize' | 'calculate' | 'random';
export type CagedShape = 'C' | 'A' | 'G' | 'E' | 'D';

interface FretboardIntervalHomeProps {
  onStartQuiz: (mode: FretboardIntervalMode, shape?: CagedShape) => void;
  onHome: () => void;
}

export function FretboardIntervalHome({ onStartQuiz, onHome }: FretboardIntervalHomeProps) {
  const { progress } = useGameStore();
  const moduleProgress = progress['fretboard-interval'] || defaultProgress;
  const metadata = moduleProgress.customMetadata || {};
  const cleared = metadata.cleared || {};
  const streaks = metadata.streaks || {};

  const SHAPE_ORDER: CagedShape[] = ['C', 'A', 'G', 'E', 'D'];

  const [selectedShapeMem, setSelectedShapeMem] = useState<CagedShape>(SHAPE_ORDER.find(s => !cleared[`memorize_${s}`]) || 'C');
  const [selectedShapeCalc, setSelectedShapeCalc] = useState<CagedShape>(SHAPE_ORDER.find(s => !cleared[`calculate_${s}`]) || 'C');

  const shapes: { id: CagedShape; name: string }[] = [
    { id: 'C', name: 'C 型' },
    { id: 'A', name: 'A 型' },
    { id: 'G', name: 'G 型' },
    { id: 'E', name: 'E 型' },
    { id: 'D', name: 'D 型' },
  ];

  const isMemUnlocked = (shape: CagedShape) => {
    const idx = SHAPE_ORDER.indexOf(shape);
    if (idx === 0) return true;
    return !!cleared[`calculate_${SHAPE_ORDER[idx - 1]}`]; // 必須先通關上一個形狀的主音推算
  };

  const isCalcUnlocked = (shape: CagedShape) => {
    return !!cleared[`memorize_${shape}`]; // 必須先通關同一個形狀的形狀記憶
  };

  const isRandomUnlocked = () => {
    return !!cleared[`calculate_D`]; // 必須通關所有形狀
  };

  const renderShapeSelector = (
    mode: 'memorize' | 'calculate', 
    selected: CagedShape, 
    setSelected: (s: CagedShape) => void,
    unlockCheck: (s: CagedShape) => boolean
  ) => {
    return (
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {SHAPE_ORDER.map(shape => {
          const unlocked = unlockCheck(shape);
          const isClear = cleared[`${mode}_${shape}`];
          const currentStreak = streaks[`${mode}_${shape}`] || 0;
          const isSelected = selected === shape;

          return (
            <button
              key={shape}
              onClick={() => unlocked && setSelected(shape)}
              disabled={!unlocked}
              className={`
                flex-1 min-w-[55px] sm:min-w-[60px] py-1.5 sm:py-2 px-1 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-0.5 sm:gap-1
                ${!unlocked ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed' : 
                  isSelected ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' : 
                  isClear ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' :
                  `bg-white border-slate-200 text-slate-700 hover:border-indigo-300`}
              `}
            >
              <div className="flex items-center gap-1">
                {!unlocked ? '🔒' : isClear ? '✨' : ''} {shape}
              </div>
              {unlocked && !isClear && (
                <div className={`text-[8px] sm:text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {Math.min(3, currentStreak)}/3
                </div>
              )}
              {isClear && (
                <div className={`text-[8px] sm:text-[10px] ${isSelected ? 'text-indigo-100' : 'text-emerald-500'}`}>
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
        <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">指板音程判斷</h2>
        <p className="text-slate-500 font-medium text-xs sm:text-base px-2">透過指型記憶與相對位置，快速找出指板上的音程</p>
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
        streakLabelOverride="連續答對"
        streakValueOverride={moduleProgress.streak}
        streakIconOverride="🔥"
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Memory Level */}
        <Card className="border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-indigo-50/50 text-center sm:text-left">
            <CardTitle className="text-base sm:text-xl font-display flex items-center justify-center sm:justify-start gap-2 text-slate-800">
              <span className="text-xl sm:text-2xl">👀</span> 1. 形狀記憶
            </CardTitle>
          </div>
          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              提示大調音階形狀作為基準座標系，倒數後隱藏，隨機指定音程請你點擊對應位置。<br/>
              <span className="text-indigo-600 font-bold block mt-1">連續答對 3 題解鎖音程推算</span>
            </p>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-700">選擇提示形狀：</label>
              {renderShapeSelector('memorize', selectedShapeMem, setSelectedShapeMem, isMemUnlocked)}
            </div>
            <Button 
              className="w-full h-11 sm:h-12 text-sm sm:text-base border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all" 
              onClick={() => onStartQuiz('memorize', selectedShapeMem)}
            >
              開始記憶挑戰 ({selectedShapeMem})
            </Button>
          </CardContent>
        </Card>

        {/* Calculate Level */}
        <Card className={`border-2 ${isCalcUnlocked('C') ? 'border-emerald-100' : 'border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <div className={`p-4 sm:p-6 border-b border-slate-100 text-center sm:text-left ${isCalcUnlocked('C') ? 'bg-emerald-50/50' : 'bg-slate-50'}`}>
            <CardTitle className={`text-base sm:text-xl font-display flex items-center justify-center sm:justify-start gap-2 ${isCalcUnlocked('C') ? 'text-slate-800' : 'text-slate-400'}`}>
              <span className="text-xl sm:text-2xl">{isCalcUnlocked('C') ? '🧩' : '🔒'}</span> 2. 音程推算
            </CardTitle>
          </div>
          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              畫出主音與目標音，請判斷它們之間的音程度數。主音綁定於指型的根音位置。<br/>
              <span className="text-emerald-600 font-bold block mt-1">需先解鎖該形狀的形狀記憶</span>
            </p>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-700">選擇形狀：</label>
              {renderShapeSelector('calculate', selectedShapeCalc, setSelectedShapeCalc, isCalcUnlocked)}
            </div>
            <Button 
              className={`w-full h-11 sm:h-12 text-sm sm:text-base border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isCalcUnlocked(selectedShapeCalc) ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800 text-white' : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed hover:bg-slate-300'}`}
              disabled={!isCalcUnlocked(selectedShapeCalc)}
              onClick={() => onStartQuiz('calculate', selectedShapeCalc)}
            >
              {isCalcUnlocked(selectedShapeCalc) ? `開始推算挑戰 (${selectedShapeCalc})` : '尚未解鎖'}
            </Button>
          </CardContent>
        </Card>

        {/* Random Level */}
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
                  不限制根音所在的弦。隨機給予主音，請在指板上點出指定的隨機音程位置 (一個八度內)。<br/>
                  <span className={`${isRandomUnlocked() ? 'text-rose-600' : 'text-slate-400'} font-bold block mt-1`}>
                    完成所有指型測驗後解鎖
                  </span>
                </p>
                {isRandomUnlocked() && cleared['random'] && (
                   <p className="text-amber-500 font-bold text-xs sm:text-sm">🏆 你已經精通指板的各項音程！</p>
                )}
              </div>
              <div className="w-full md:w-auto">
                <Button 
                  disabled={!isRandomUnlocked()}
                  className={`w-full md:w-48 h-12 sm:h-14 text-sm sm:text-base font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isRandomUnlocked() ? 'bg-rose-500 hover:bg-rose-600 border-rose-700 text-white shadow-rose-200 shadow-lg' : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'}`} 
                  onClick={() => onStartQuiz('random')}
                >
                  {isRandomUnlocked() ? '進入極限挑戰' : '尚未解鎖'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
