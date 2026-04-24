import React, { useState } from 'react';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { ModuleStats } from '../../components/platform/ModuleStats';

export type MajorScaleMode = 'memorize' | 'recall' | 'random';
export type CagedShape = 'C' | 'A' | 'G' | 'E' | 'D';

interface MajorScaleHomeProps {
  onStartQuiz: (mode: MajorScaleMode, shape?: CagedShape) => void;
  onHome: () => void;
}

export function MajorScaleHome({ onStartQuiz, onHome }: MajorScaleHomeProps) {
  const { progress } = useGameStore();
  const moduleProgress = progress['fretboard-major-scale'] || defaultProgress;
  const metadata = moduleProgress.customMetadata || {};
  const cleared = metadata.cleared || {};
  const streaks = metadata.streaks || {};

  const SHAPE_ORDER: CagedShape[] = ['C', 'A', 'G', 'E', 'D'];

  const [selectedShapeMem, setSelectedShapeMem] = useState<CagedShape>(SHAPE_ORDER.find(s => !cleared[`memorize_${s}`]) || 'C');
  const [selectedShapeRec, setSelectedShapeRec] = useState<CagedShape>(SHAPE_ORDER.find(s => !cleared[`recall_${s}`]) || 'C');

  const shapes: { id: CagedShape; name: string }[] = [
    { id: 'C', name: 'C 型 (以第5弦為主音)' },
    { id: 'A', name: 'A 型 (以第5弦為主音)' },
    { id: 'G', name: 'G 型 (以第6弦為主音)' },
    { id: 'E', name: 'E 型 (以第6弦為主音)' },
    { id: 'D', name: 'D 型 (以第4弦為主音)' },
  ];

  const isMemUnlocked = (shape: CagedShape) => {
    const idx = SHAPE_ORDER.indexOf(shape);
    if (idx === 0) return true;
    return !!cleared[`recall_${SHAPE_ORDER[idx - 1]}`]; // 必須先通關上一個形狀的主音推算
  };

  const isRecUnlocked = (shape: CagedShape) => {
    return !!cleared[`memorize_${shape}`]; // 必須先通關同一個形狀的形狀記憶
  };

  const isRandomUnlocked = () => {
    return !!cleared[`recall_D`]; // 必須通關所有形狀
  };

  const renderShapeSelector = (
    mode: 'memorize' | 'recall', 
    selected: CagedShape, 
    setSelected: (s: CagedShape) => void,
    unlockCheck: (s: CagedShape) => boolean
  ) => {
    return (
      <div className="flex flex-wrap gap-2">
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
                flex-1 min-w-[60px] py-2 px-1 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-1
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
                <div className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  連勝 {Math.min(3, currentStreak)}/3
                </div>
              )}
              {isClear && (
                <div className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-emerald-500'}`}>
                  已解鎖
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

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">大調音階練習</h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base">依序完成各個形狀的連勝試煉，解鎖下一階段</p>
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
        customProgressLeftText={<span className="text-indigo-600 font-bold">檢定進度</span>}
        customProgressCenterText={<span>距離大師還差 <span className="text-slate-700 font-bold">{Math.max(0, 11 - (moduleProgress.level - 1))}</span> 個解鎖項目</span>}
        customProgressRightText={<span className="text-slate-400">大師</span>}
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Memory Level */}
        <Card className="border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-indigo-50/50">
            <CardTitle className="text-lg sm:text-xl font-display flex items-center gap-2 text-slate-800">
              <span className="text-2xl">👀</span> 1. 形狀記憶
            </CardTitle>
          </div>
          <CardContent className="space-y-6 pt-6">
            <p className="text-sm font-medium text-slate-600">
              完整顯示音階位置與名稱，提示結束後請憑記憶填寫完整位置。<br/>
              <span className="text-indigo-600 font-bold">通關條件：各形狀滿分連續答對 3 次</span>
            </p>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">挑戰列表：</label>
              {renderShapeSelector('memorize', selectedShapeMem, setSelectedShapeMem, isMemUnlocked)}
            </div>
            <Button 
              className="w-full h-12 text-sm sm:text-base border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all" 
              onClick={() => onStartQuiz('memorize', selectedShapeMem)}
            >
              開始記憶挑戰 ({selectedShapeMem} Shape)
            </Button>
          </CardContent>
        </Card>

        {/* Recall Level */}
        <Card className={`border-2 ${isRecUnlocked('C') ? 'border-emerald-100' : 'border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <div className={`p-4 sm:p-6 border-b border-slate-100 ${isRecUnlocked('C') ? 'bg-emerald-50/50' : 'bg-slate-50'}`}>
            <CardTitle className={`text-lg sm:text-xl font-display flex items-center gap-2 ${isRecUnlocked('C') ? 'text-slate-800' : 'text-slate-400'}`}>
              <span className="text-2xl">{isRecUnlocked('C') ? '🧩' : '🔒'}</span> 2. 主音推算
            </CardTitle>
          </div>
          <CardContent className="space-y-6 pt-6">
            <p className="text-sm font-medium text-slate-600">
              直接給你主音位置，請在腦海中對應指定的音階形狀並完整填寫。<br/>
              <span className="text-emerald-600 font-bold">需先解鎖該形狀的形狀記憶</span>
            </p>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">挑戰列表：</label>
              {renderShapeSelector('recall', selectedShapeRec, setSelectedShapeRec, isRecUnlocked)}
            </div>
            <Button 
              className={`w-full h-12 text-sm sm:text-base border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isRecUnlocked(selectedShapeRec) ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800 text-white' : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed hover:bg-slate-300'}`}
              disabled={!isRecUnlocked(selectedShapeRec)}
              onClick={() => onStartQuiz('recall', selectedShapeRec)}
            >
              {isRecUnlocked(selectedShapeRec) ? `開始推算挑戰 (${selectedShapeRec} Shape)` : '尚未解鎖'}
            </Button>
          </CardContent>
        </Card>

        {/* Random Master */}
        <Card className={`md:col-span-2 border-2 ${isRandomUnlocked() ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-slate-50'} shadow-sm transition-shadow`}>
          <div className={`p-6 border-b border-slate-100 ${isRandomUnlocked() ? 'bg-rose-100/50' : 'bg-slate-100/50'}`}>
            <CardTitle className={`text-xl font-display flex items-center gap-2 ${isRandomUnlocked() ? 'text-slate-800' : 'text-slate-400'}`}>
              <span className="text-2xl">{isRandomUnlocked() ? '🔥' : '🔒'}</span> 3. 隨機大師
            </CardTitle>
          </div>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 space-y-2 text-center md:text-left">
                <p className="text-sm font-medium text-slate-600">
                  亂數選擇不同 Shape 的主音位置，請快速反應並填寫該形狀的完整音階位置。<br/>
                  <span className={`${isRandomUnlocked() ? 'text-rose-600' : 'text-slate-400'} font-bold`}>
                    通關條件：解鎖所有形狀的主音推算，並在此模式達成連勝
                  </span>
                </p>
                {isRandomUnlocked() && cleared['random'] && (
                   <p className="text-amber-500 font-bold text-sm">🏆 你已經制霸指板的大調音階！</p>
                )}
              </div>
              <div className="w-full md:w-auto">
                <Button 
                  disabled={!isRandomUnlocked()}
                  className={`w-full md:w-48 h-14 text-base font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isRandomUnlocked() ? 'bg-rose-500 hover:bg-rose-600 border-rose-700 text-white shadow-rose-200 shadow-lg' : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'}`} 
                  onClick={() => onStartQuiz('random')}
                >
                  {isRandomUnlocked() ? '進入最終測驗' : '尚未解鎖'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
