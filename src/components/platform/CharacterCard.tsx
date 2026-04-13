import React, { useState, useEffect } from 'react';
import { useGameStore, getGlobalProgress, defaultProgress } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

export function CharacterCard() {
  const { progress, gender, setGender } = useGameStore();
  
  const { completionPercentage } = getGlobalProgress(progress);
  
  // Calculate stage based on completionPercentage
  let stage = 0;
  if (completionPercentage >= 100) stage = 4;
  else if (completionPercentage >= 75) stage = 3;
  else if (completionPercentage >= 50) stage = 2;
  else if (completionPercentage >= 25) stage = 1;

  const imageSrc = gender ? `/character/stage${stage}${gender}.jpg` : '';

  const scaleLevel = progress['scale-practice']?.level || defaultProgress.level;
  const intervalLevel = progress['interval-practice']?.level || defaultProgress.level;
  const triadLevel = progress['triad-practice']?.level || defaultProgress.level;

  const overallLevel = Math.floor((scaleLevel + intervalLevel + triadLevel) / 3);

  const titles: { text: string, colorClass: string }[] = [];
  
  const allAtLeast10 = scaleLevel >= 10 && intervalLevel >= 10 && triadLevel >= 10;
  const allAtLeast8 = scaleLevel >= 8 && intervalLevel >= 8 && triadLevel >= 8;

  if (allAtLeast10) {
    titles.push({ text: '音樂大師', colorClass: 'bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-amber-900 border-amber-300 shadow-sm' });
  } else if (allAtLeast8) {
    titles.push({ text: '全能樂手', colorClass: 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm' });
  } else {
    if (scaleLevel >= 5) titles.push({ text: '調性探索者', colorClass: 'bg-blue-100 text-blue-800 border-blue-200' });
    if (intervalLevel >= 5) titles.push({ text: '音程達人', colorClass: 'bg-purple-100 text-purple-800 border-purple-200' });
    if (triadLevel >= 5) titles.push({ text: '和弦獵人', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' });
  }

  const [currentImage, setCurrentImage] = useState(imageSrc);
  const [fade, setFade] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [whiteOverlay, setWhiteOverlay] = useState(false);
  const [bounceBadge, setBounceBadge] = useState(false);

  useEffect(() => {
    if (imageSrc && imageSrc !== currentImage) {
      setIsTransforming(true);
      setFade(true);
      
      const t1 = setTimeout(() => {
        setWhiteOverlay(true);
      }, 300);
      
      const t2 = setTimeout(() => {
        setCurrentImage(imageSrc);
        setFade(false);
      }, 500);
      
      const t3 = setTimeout(() => {
        setWhiteOverlay(false);
      }, 550);
      
      const t4 = setTimeout(() => {
        setBounceBadge(true);
      }, 850);
      
      const t5 = setTimeout(() => {
        setBounceBadge(false);
        setIsTransforming(false);
      }, 1850);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
      };
    }
  }, [imageSrc, currentImage]);

  let quote = "我聽得見音樂，但還叫不出它們的名字...";
  if (completionPercentage >= 100) quote = "所有音符都在我掌握之中了。";
  else if (completionPercentage >= 75) quote = "我快找到屬於自己的聲音了...";
  else if (completionPercentage >= 50) quote = "每個音程都是一條路，我走過了一半。";
  else if (completionPercentage >= 25) quote = "音階的規律開始在我腦中發光。";

  const nextStage = Math.min(stage + 1, 4);
  const nextImageSrc = gender ? `/character/stage${nextStage}${gender}.jpg` : '';

  if (!gender) {
    return (
      <Card className="max-w-xs mx-auto overflow-hidden border-2 border-indigo-100 shadow-md">
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-xl font-display font-bold text-slate-800">選擇你的角色</h3>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setGender('M')} className="flex-1 bg-blue-500 hover:bg-blue-600">男生</Button>
            <Button onClick={() => setGender('F')} className="flex-1 bg-rose-500 hover:bg-rose-600">女生</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-xs mx-auto overflow-hidden border-2 border-indigo-100 shadow-md">
      <CardContent className="p-4 flex flex-col items-center space-y-4">
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
          <img 
            src={currentImage} 
            alt="Character" 
            className={`w-full h-full object-cover transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'}`}
            onError={(e) => {
              // Fallback if image is not found
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('picsum.photos')) {
                target.src = `https://picsum.photos/seed/${gender}${stage}/400/600`;
              }
            }}
          />
          <div 
            className={`absolute inset-0 bg-white transition-opacity duration-200 pointer-events-none ${whiteOverlay ? 'opacity-100' : 'opacity-0'}`} 
          />
        </div>
        
        <div className="italic text-sm text-slate-500 text-center px-4 py-2 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-lg mx-2">
          "{quote}"
        </div>

        <div className="text-center w-full">
          <p className="text-xl font-display font-bold text-slate-800 mb-3">Lv {overallLevel}</p>
          <div className={`flex flex-wrap justify-center gap-2 ${bounceBadge ? 'animate-bounce' : ''}`}>
            {titles.map((title, idx) => (
              <span 
                key={idx} 
                className={`px-3 py-1 rounded-full text-xs font-bold border ${title.colorClass} ${allAtLeast8 || allAtLeast10 ? 'w-full text-sm py-1.5' : ''}`}
              >
                {title.text}
              </span>
            ))}
            {titles.length === 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-500 border-slate-200">
                見習生
              </span>
            )}
          </div>
        </div>
        
        <div className="w-full pt-4 mt-2 border-t border-slate-100">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>總完成度</span>
            <span className="text-indigo-600">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} max={100} className="h-2" />
          
          {completionPercentage < 100 && (
            <div className="mt-4">
              <div className="relative w-24 aspect-[3/4] mx-auto rounded-xl overflow-hidden bg-slate-100">
                <img 
                  src={nextImageSrc} 
                  alt="Next Stage" 
                  className="w-full h-full object-cover blur-sm brightness-75 scale-95"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('picsum.photos')) {
                      target.src = `https://picsum.photos/seed/${gender}${nextStage}/400/600`;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  🔒 ???
                </div>
              </div>
              <p className="text-[10px] text-indigo-500 font-bold text-center mt-1">
                再 {100 - completionPercentage}% 即可解鎖新外觀
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
