import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { ModuleStats } from '../../components/platform/ModuleStats';

interface FretboardStepHomeProps {
  onStartQuiz: (isChallenge: boolean, targetLevel: number) => void;
  onHome: () => void;
}

export function FretboardStepHome({ onStartQuiz, onHome }: FretboardStepHomeProps) {
  const { progress } = useGameStore();
  const moduleProgress = progress['fretboard-step'] || defaultProgress;
  const level = moduleProgress.level;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [practiceLevel, setPracticeLevel] = useState<number>(Math.max(1, Math.min(5, level)));
  const [challengeLevel, setChallengeLevel] = useState<number>(Math.max(1, Math.min(5, level)));

  const difficultyLevels = [
    { level: 1, name: '單弦', desc: '相距全半音的兩個音位於同一根弦上' },
    { level: 2, name: '相鄰弦 (不含二三) ', desc: '位於相鄰的兩根弦上，不包含第二與第三弦的跨距' },
    { level: 3, name: '單弦與相鄰弦混答', desc: '混合單弦與相鄰弦(不含二三弦)的綜合測驗' },
    { level: 4, name: '只考二三弦', desc: '專注於調音距離為大三度的二三弦跨距' },
    { level: 5, name: '隨機混答', desc: '指板全區間、包含二三弦的終極隨機測驗' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={onHome} 
        className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        ← 返回音樂訓練中心
      </button>

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight">指板全半音練習</h2>
        <p className="text-slate-500 font-medium">提升你在吉他指板上的視覺距離感與全半音判斷能力</p>
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
        expValueOverride={`${Math.min(100, Math.floor(((moduleProgress.level - 1) / 20) * 100))}%`}
        streakLabelOverride="連續答對數"
        streakValueOverride={moduleProgress.streak}
        streakIconOverride="🔥"
        customProgressValue={Math.min(100, Math.floor(((moduleProgress.level - 1) / 20) * 100))}
        customProgressMax={100}
        customProgressLeftText={<span className="text-indigo-600 font-bold">目前進度</span>}
        customProgressCenterText={<span>距離滿級還差 <span className="text-slate-700 font-bold">{Math.max(0, 100 - Math.min(100, Math.floor(((moduleProgress.level - 1) / 20) * 100)))}</span> %</span>}
        customProgressRightText={<span className="text-slate-400">大師</span>}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-slate-100 bg-indigo-50/50">
            <CardTitle className="text-2xl font-display flex items-center gap-2 text-slate-800">
              <span className="text-3xl">🚀</span> 闖關模式
            </CardTitle>
          </div>
          <CardContent className="space-y-5 pt-6">
            <p className="text-sm font-medium text-slate-600">不限時間，依照自己的步調穩紮穩打。</p>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">選擇難度：</label>
              <select 
                value={practiceLevel} 
                onChange={(e) => setPracticeLevel(Number(e.target.value))}
                className="w-full p-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
              >
                {difficultyLevels.map(diff => (
                  <option key={diff.level} value={diff.level} disabled={level < diff.level}>
                    Lv {diff.level} - {diff.name} {level < diff.level ? '(未解鎖)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <p className="text-xs text-slate-500 font-semibold italic mt-2 ml-1">
              當前選擇：{difficultyLevels.find(d => d.level === practiceLevel)?.desc}
            </p>

            <Button className="w-full text-lg mt-4 shadow-sm" size="lg" onClick={() => onStartQuiz(false, practiceLevel)}>
              開始闖關
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-rose-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="relative p-6 border-b border-slate-100 bg-rose-50/30">
            <CardTitle className="text-2xl font-display flex items-center gap-2 text-slate-800">
              <span className="text-3xl">⏱</span> 限時挑戰
            </CardTitle>
          </div>
          <CardContent className="space-y-5 pt-6 relative">
            <p className="text-sm font-medium text-slate-600">一分鐘內答對越多題越好！解鎖更高難度。</p>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">選擇難度：</label>
              <select 
                value={challengeLevel} 
                onChange={(e) => setChallengeLevel(Number(e.target.value))}
                className="w-full p-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:border-rose-500 focus:ring-rose-500 transition-colors"
              >
                {difficultyLevels.map(diff => (
                  <option key={diff.level} value={diff.level} disabled={level < diff.level}>
                    Lv {diff.level} - {diff.name} {level < diff.level ? '(未解鎖)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <p className="text-xs text-slate-500 font-semibold italic mt-2 ml-1">
              過關條件：一分鐘內答對 {challengeLevel * 5 + 5} 題
            </p>

            <Button variant="secondary" className="w-full text-lg mt-4 shadow-sm bg-rose-100 text-rose-700 hover:bg-rose-200 border-none" size="lg" onClick={() => onStartQuiz(true, challengeLevel)}>
              開始挑戰
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
