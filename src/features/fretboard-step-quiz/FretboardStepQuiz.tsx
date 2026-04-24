import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FretboardStepQuizProps {
  isChallenge: boolean;
  targetLevel: number;
  onHome: () => void;
  onPlatformHome: () => void;
}

const STRINGS = [64, 59, 55, 50, 45, 40]; // 1st to 6th: E4, B3, G3, D3, A2, E2
const STRING_NAMES = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

type FretPos = { sIdx: number; fret: number };
type Question = { pos1: FretPos; pos2: FretPos; isHalfStep: boolean };

const generateQuestion = (level: number): Question => {
  const isHalfStep = Math.random() < 0.5;
  const dist = isHalfStep ? 1 : 2;

  let pos1: FretPos = { sIdx: 0, fret: 0 };
  let pos2: FretPos = { sIdx: 0, fret: 0 };

  // lv1: 同弦 (qType 1)
  // lv2: 相鄰弦不含二三弦 (qType 2)
  // lv3: 單弦與相鄰弦不含二三弦混答 (qType 1 or 2)
  // lv4: 只有二三弦 (qType 4)
  // lv5: 隨機混答 (qType 1, 2, or 4)
  let qType = 1;
  if (level === 1) qType = 1;
  else if (level === 2) qType = 2;
  else if (level === 3) qType = Math.random() < 0.4 ? 1 : 2;
  else if (level === 4) qType = 4;
  else if (level >= 5) {
    const r = Math.random();
    if (r < 0.3) qType = 1;
    else if (r < 0.6) qType = 2;
    else qType = 4;
  }

  if (qType === 1) { // Same string
    pos1.sIdx = Math.floor(Math.random() * 6);
    pos2.sIdx = pos1.sIdx;
    
    // Select valid frets between 0 and 12
    pos1.fret = Math.floor(Math.random() * 11) + 1; // 1 to 11 to allow +1 or -1/+2 or -2
    const direction = Math.random() < 0.5 ? 1 : -1;
    pos2.fret = pos1.fret + (direction * dist);
    
    // Boundary check
    if (pos2.fret < 0 || pos2.fret > 12) {
      pos2.fret = pos1.fret - (direction * dist);
    }
  } else {
    // Adjacent strings
    let pairs = [];
    if (qType === 2) {
      pairs = [
        [5, 4], // 6th, 5th
        [4, 3], // 5th, 4th
        [3, 2], // 4th, 3rd
        [1, 0]  // 2nd, 1st
      ];
    } else { // qType === 4
      pairs = [[2, 1]]; // 3rd, 2nd
    }
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    
    // For ascending scale practice, we want the physically higher string (numerically lower index) 
    // to always have a HIGHER pitch than the lower string.
    const lowIdx = pair[0]; // e.g., 5th string (idx 4)
    const highIdx = pair[1]; // e.g., 4th string (idx 3)

    const lowBase = STRINGS[lowIdx];
    const highBase = STRINGS[highIdx];
    
    let combinations = [];
    for (let lowFret = 0; lowFret <= 12; lowFret++) {
      // (highBase + highFret) - (lowBase + lowFret) === dist
      // highFret = lowBase + lowFret + dist - highBase
      const highFret = lowBase + lowFret + dist - highBase;
      if (highFret >= 0 && highFret <= 12) {
        combinations.push({ lowFret, highFret });
      }
    }
    
    // If no possible combinations (rare, but just in case), fallback to same string calculation
    if (combinations.length === 0) {
       return generateQuestion(1);
    }

    const combo = combinations[Math.floor(Math.random() * combinations.length)];
    pos1.sIdx = lowIdx;
    pos1.fret = combo.lowFret;
    pos2.sIdx = highIdx;
    pos2.fret = combo.highFret;
  }
  
  return { pos1, pos2, isHalfStep };
};

export function FretboardStepQuiz({ isChallenge, targetLevel, onHome, onPlatformHome }: FretboardStepQuizProps) {
  const { progress, addExp, updateBestScore, incrementStreak, resetStreak } = useGameStore();
  const moduleProgress = progress['fretboard-step'] || defaultProgress;
  const globalLevel = moduleProgress.level;

  const [currentDifficulty, setCurrentDifficulty] = useState(targetLevel);
  const [question, setQuestion] = useState<Question>(generateQuestion(currentDifficulty));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  
  const [feedback, setFeedback] = useState<'none'|'correct'|'wrong'>('none');
  const [lastSelected, setLastSelected] = useState<boolean | null>(null);

  const prevLevelRef = useRef(globalLevel);

  useEffect(() => {
    if (globalLevel > prevLevelRef.current) {
      if (globalLevel > currentDifficulty && currentDifficulty < 5) {
        setCurrentDifficulty(Math.min(5, globalLevel));
      }
    }
    prevLevelRef.current = globalLevel;
  }, [globalLevel, currentDifficulty]);

  const loadNewQuestion = useCallback(() => {
    setQuestion(generateQuestion(currentDifficulty));
    setFeedback('none');
    setLastSelected(null);
  }, [currentDifficulty]);

  // Timer logic for challenge mode
  useEffect(() => {
    if (!isChallenge || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          updateBestScore('fretboard-step', score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isChallenge, gameOver, score, updateBestScore, targetLevel]);

  const handleAnswer = (answerIsHalf: boolean) => {
    setLastSelected(answerIsHalf);
    
    // Store recent stats tracking
    const { progress, updateCustomMetadata } = useGameStore.getState();
    const metadata = progress['fretboard-step']?.customMetadata || {};
    const recentStats = metadata.recentStats || { correct: 0, total: 0 };
    let newStats = { ...recentStats };
    
    if (newStats.total >= 50) {
      // Rough rolling window
      newStats.correct = Math.max(0, newStats.correct - 1);
      newStats.total -= 1;
    }

    if (answerIsHalf === question.isHalfStep) {
      newStats.correct += 1;
      newStats.total += 1;

      const expEarned = 10 + Math.floor(combo / 3) * 5;
      setScore(s => s + expEarned);
      setCombo(c => c + 1);
      setFeedback('correct');
      if (!isChallenge) {
        incrementStreak('fretboard-step');
        addExp('fretboard-step', expEarned);
        updateCustomMetadata('fretboard-step', { ...metadata, recentStats: newStats });
      }
      setTimeout(() => {
        if (!gameOver) loadNewQuestion();
      }, 500);
    } else {
      newStats.total += 1;
      
      setCombo(0);
      if (!isChallenge) {
        resetStreak('fretboard-step');
        updateCustomMetadata('fretboard-step', { ...metadata, recentStats: newStats });
      }
      setFeedback('wrong');
    }
    setTotal(t => t + 1);
  };

  const fretboardRenderer = useMemo(() => {
    return (
      <div className="relative w-full overflow-x-auto select-none rounded-xl bg-slate-800 p-2 sm:p-4 border-4 border-slate-900 shadow-xl my-6">
        <div className="min-w-[500px] flex text-white relative">
          <div className="absolute top-0 left-8 flex w-[calc(100%-2rem)] h-6 z-10">
            {Array.from({ length: 13 }).map((_, f) => (
              <div key={f} className="flex-1 flex justify-center text-[10px] text-slate-400 font-bold opacity-50">
                {f}
              </div>
            ))}
          </div>
          <div className="flex flex-col mt-6 w-full gap-0 py-2 relative">
            {/* Absolute Fret Lines */}
            <div className="absolute inset-y-2 right-0 left-8 flex pointer-events-none z-10">
              {Array.from({ length: 13 }).map((_, f) => (
                <div key={f} className={`flex-1 ${f === 0 ? 'border-r-4 border-r-slate-300' : 'border-r-2 border-r-slate-500'}`} />
              ))}
            </div>

            {STRINGS.map((pitch, sIdx) => (
              <div key={sIdx} className="flex items-center group relative h-6 sm:h-8">
                <div className="w-8 text-xs font-bold text-slate-400 text-center font-mono relative z-20">
                  {STRING_NAMES[sIdx]}
                </div>
                <div className="absolute right-0 w-[calc(100%-2rem)] h-[2px] bg-gradient-to-r from-slate-600 via-slate-400 to-slate-500 shadow-sm top-1/2 -translate-y-1/2 pointer-events-none z-10" 
                     style={{ height: `${1 + (5 - sIdx) * 0.3}px` }} />
                     
                <div className="flex flex-1 relative z-20">
                  {Array.from({ length: 13 }).map((_, f) => {
                    const isP1 = question.pos1.sIdx === sIdx && question.pos1.fret === f;
                    const isP2 = question.pos2.sIdx === sIdx && question.pos2.fret === f;
                    const isActive = isP1 || isP2;
                    let dotClass = '';
                    if (isActive) {
                        dotClass = 'bg-amber-400 text-amber-900 ring-4 ring-white shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-110';
                    }

                    return (
                      <div key={f} className={`flex-1 flex justify-center items-center h-full relative ${f === 0 ? 'bg-slate-900/40' : ''}`}>
                        {[3, 5, 7, 9, 12].includes(f) && sIdx === 2 && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-600/50 pointer-events-none -z-10" />
                        )}
                        {f === 12 && sIdx === 2 && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%] w-3 h-3 rounded-full bg-slate-600/50 pointer-events-none -z-10" />
                        )}
                        
                        {isActive && (
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-bold z-30 ${dotClass}`}>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [question]);


  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-8 animate-in zoom-in duration-500">
        <h1 className="text-5xl font-black text-slate-900">⏰ 時間到！</h1>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-indigo-600">🎯 你的得分：{score}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => {
            setScore(0);
            setCombo(0);
            setTotal(0);
            setTimeLeft(60);
            setGameOver(false);
            loadNewQuestion();
          }} className="w-48">
            <PlayCircle className="w-5 h-5 mr-2" /> 再玩一次
          </Button>
          <Button size="lg" variant="outline" onClick={onHome} className="w-48">
            返回選單
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between text-sm font-medium text-slate-500">
        <div className="flex items-center gap-3">
          <button onClick={onHome} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            ← 放棄
          </button>
          <span className="text-indigo-600 font-bold">Lv{currentDifficulty}</span>
        </div>
        <div className="flex items-center gap-4">
          {isChallenge && (
            <span className={`font-display font-bold text-lg px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
              ⏱ {timeLeft}s
            </span>
          )}
          
          <span className={`${isChallenge ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'} px-3 py-1 rounded-full`}>
            得分 {score}
          </span>
          
          <AnimatePresence>
            {combo > 1 && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                key={combo}
                className="text-amber-500 font-bold italic"
              >
                {combo} Combo!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-2xl font-black text-slate-800">這是全音還是半音？</h2>
          <p className="text-slate-500 font-medium">觀察指板上兩個亮點的距離</p>
        </div>

        {fretboardRenderer}

        <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
          <Button 
            size="lg" 
            variant="outline"
            className={`text-xl py-8 font-bold border-2 ${feedback === 'wrong' && lastSelected === true ? 'bg-rose-50 border-rose-400 text-rose-700' : 'hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'}`}
            onClick={() => handleAnswer(true)}
            disabled={feedback === 'correct'}
          >
            半音
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className={`text-xl py-8 font-bold border-2 ${feedback === 'wrong' && lastSelected === false ? 'bg-rose-50 border-rose-400 text-rose-700' : 'hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'}`}
            onClick={() => handleAnswer(false)}
            disabled={feedback === 'correct'}
          >
            全音
          </Button>
        </div>
        
        {feedback !== 'none' && (
          <div className="mt-8 text-center animate-in slide-in-from-bottom-2 h-8">
            {feedback === 'correct' ? (
              <span className="text-emerald-500 font-bold text-lg flex items-center justify-center gap-2">
                <span className="text-2xl">✨</span> 答對了！
              </span>
            ) : (
              <span className="text-rose-500 font-bold text-lg flex items-center justify-center gap-2">
                <span className="text-2xl">💡</span> 不太對喔，再觀察一下！
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
