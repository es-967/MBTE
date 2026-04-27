import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import type { FretboardIntervalMode, CagedShape } from './FretboardIntervalHome';

interface FretboardIntervalQuizProps {
  mode: FretboardIntervalMode;
  targetShape?: CagedShape;
  onHome: () => void;
}

const STRINGS = [64, 59, 55, 50, 45, 40]; // 1st to 6th
const STRING_NAMES = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

const INTERVALS = [
  { halfSteps: 1, name: '小二度' },
  { halfSteps: 2, name: '大二度' },
  { halfSteps: 3, name: '小三度' },
  { halfSteps: 4, name: '大三度' },
  { halfSteps: 5, name: '完全四度' },
  { halfSteps: 6, name: '增四 / 減五度' },
  { halfSteps: 7, name: '完全五度' },
  { halfSteps: 8, name: '小六度' },
  { halfSteps: 9, name: '大六度' },
  { halfSteps: 10, name: '小七度' },
  { halfSteps: 11, name: '大七度' },
  { halfSteps: 12, name: '完全八度' }
];

const MAJOR_SCALE_INTERVALS: Record<number, string> = { 0: '1', 2: '2', 4: '3', 5: '4', 7: '5', 9: '6', 11: '7' };
const CAGED_LIST: CagedShape[] = ['C', 'A', 'G', 'E', 'D'];

const SHAPES: Record<CagedShape, { win: [number, number], roots: { s: number, offset: number }[] }> = {
  'C': { win: [-3, 0], roots: [{ s: 4, offset: 0 }, { s: 1, offset: -2 }] },
  'A': { win: [-1, 3], roots: [{ s: 4, offset: 0 }, { s: 2, offset: 2 }] },
  'G': { win: [-4, 0], roots: [{ s: 5, offset: 0 }, { s: 2, offset: -3 }, { s: 0, offset: 0 }] },
  'E': { win: [-1, 2], roots: [{ s: 5, offset: 0 }, { s: 3, offset: 2 }, { s: 0, offset: 0 }] },
  'D': { win: [-1, 3], roots: [{ s: 3, offset: 0 }, { s: 1, offset: 3 }] }
};

interface Question {
  shapeId: CagedShape;
  primaryRootFret: number;
  rootSIdx: number;
  rootFret: number;
  targetInterval: { halfSteps: number, name: string };
  targetNode: { sIdx: number, fret: number }; // In calculate mode, this is the dot. In memorize/random, this is the answer.
  majorScaleDots: { sIdx: number, fret: number, degree: string }[]; // Used for memory preview
  multipleChoiceOptions?: string[]; // Used for calculate mode
}

const generateQuestion = (mode: FretboardIntervalMode, selectedShape?: CagedShape): Question => {
  const shapeId = mode === 'random' ? CAGED_LIST[Math.floor(Math.random() * CAGED_LIST.length)] : (selectedShape || 'E');
  const shapeDef = SHAPES[shapeId];
  
  let primaryRootFret = 0;
  let rootSIdx = 0;
  let rootFret = 0;
  let minFret = 0;
  let maxFret = 0;
  let possibleIntervals: typeof INTERVALS = [];

  if (mode === 'random') {
    primaryRootFret = Math.floor(Math.random() * 10) + 1;
    rootFret = primaryRootFret;
    rootSIdx = Math.floor(Math.random() * 4) + 2; // String 3rd to 6th
    minFret = Math.max(0, rootFret - 3);
    maxFret = Math.min(16, rootFret + 3);
    
    const rootPitch = STRINGS[rootSIdx] + rootFret;
    possibleIntervals = INTERVALS.filter(intrvl => {
      const targetPitch = rootPitch + intrvl.halfSteps;
      for (let s = 0; s < 6; s++) {
        const f = targetPitch - STRINGS[s];
        if (f >= minFret && f <= maxFret) return true;
      }
      return false;
    });
  } else {
    const minPossible = Math.max(1, 1 - shapeDef.win[0]);
    const maxPossible = Math.min(15, 15 - shapeDef.win[1]);
    primaryRootFret = Math.floor(Math.random() * (maxPossible - minPossible + 1)) + minPossible;
    minFret = Math.max(0, primaryRootFret + shapeDef.win[0]);
    maxFret = Math.min(16, primaryRootFret + shapeDef.win[1]);
    
    const validRoots = [];
    for (const rootInfo of shapeDef.roots) {
      const rFret = primaryRootFret + rootInfo.offset;
      const rootPitch = STRINGS[rootInfo.s] + rFret;
      const validInts = INTERVALS.filter(intrvl => {
        const targetPitch = rootPitch + intrvl.halfSteps;
        for (let s = 0; s < 6; s++) {
          const f = targetPitch - STRINGS[s];
          if (f >= minFret && f <= maxFret) return true;
        }
        return false;
      });
      if (validInts.length > 0) {
        validRoots.push({ rootInfo, intervals: validInts });
      }
    }
    
    let chosenRootObj;
    if (validRoots.length === 0) {
      maxFret += 5; // Expand window slightly as fallback
      chosenRootObj = { rootInfo: shapeDef.roots[0], intervals: INTERVALS };
    } else {
      chosenRootObj = validRoots[Math.floor(Math.random() * validRoots.length)];
    }
    
    rootSIdx = chosenRootObj.rootInfo.s;
    rootFret = primaryRootFret + chosenRootObj.rootInfo.offset;
    possibleIntervals = chosenRootObj.intervals;
  }
  
  const rootPitch = STRINGS[rootSIdx] + rootFret;
  const targetInterval = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
  const targetPitch = rootPitch + targetInterval.halfSteps;
  
  const validTargetNodes = [];
  for (let sIdx = 0; sIdx < 6; sIdx++) {
    const fret = targetPitch - STRINGS[sIdx];
    if (fret >= minFret && fret <= maxFret) {
      validTargetNodes.push({ sIdx, fret });
    }
  }
  
  const targetNode = validTargetNodes[Math.floor(Math.random() * validTargetNodes.length)] || {sIdx: 0, fret: 0};
  
  const majorScaleDots = [];
  if (mode === 'memorize') {
    for (let sIdx = 0; sIdx < 6; sIdx++) {
      for (let fret = minFret; fret <= maxFret; fret++) {
        if (fret < 0 || fret > 16) continue;
        const pitch = STRINGS[sIdx] + fret;
        const diff = ((pitch - rootPitch) % 12 + 12) % 12;
        if (MAJOR_SCALE_INTERVALS[diff] && pitch >= rootPitch && pitch <= rootPitch + 12) {
          majorScaleDots.push({ sIdx, fret, degree: MAJOR_SCALE_INTERVALS[diff] });
        }
      }
    }
  }

  let multipleChoiceOptions: string[] = [];
  if (mode === 'calculate') {
    const pool = INTERVALS.map(i => i.name).filter(n => n !== targetInterval.name);
    // pick 3 wrong options
    const shuffledPool = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    multipleChoiceOptions = [...shuffledPool, targetInterval.name].sort(() => 0.5 - Math.random());
  }

  return { shapeId, primaryRootFret, rootSIdx, rootFret, targetInterval, targetNode, majorScaleDots, multipleChoiceOptions };
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const getNoteName = (pitch: number) => NOTES[pitch % 12];

export function FretboardIntervalQuiz({ mode, targetShape, onHome }: FretboardIntervalQuizProps) {
  const { progress, addExp, setLevel, incrementStreak, resetStreak, updateCustomMetadata, updateBestScore } = useGameStore();
  const moduleProgress = progress['fretboard-interval'] || defaultProgress;
  const globalLevel = moduleProgress.level;

  const [question, setQuestion] = useState<Question>(generateQuestion(mode, targetShape));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const [quizState, setQuizState] = useState<'memorizing' | 'playing' | 'result'>(mode === 'memorize' ? 'memorizing' : 'playing');
  const [countdown, setCountdown] = useState(5);
  
  const [selectedNode, setSelectedNode] = useState<{sIdx: number, fret: number} | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const prevLevelRef = useRef(globalLevel);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (question) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const centerFret = question.rootFret;
          const scrollTarget = (centerFret / 16) * scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth / 2;
          scrollContainerRef.current.scrollTo({
            left: scrollTarget,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, [question]);

  useEffect(() => {
    updateCustomMetadata('fretboard-interval', { manualLeveling: true });
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, []);

  useEffect(() => {
    prevLevelRef.current = globalLevel;
  }, [globalLevel]);

  useEffect(() => {
    if (quizState === 'memorizing') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setQuizState('playing');
      }
    }
  }, [quizState, countdown]);

  const loadNewQuestion = useCallback(() => {
    setQuestion(generateQuestion(mode, targetShape));
    setSelectedNode(null);
    setSelectedOption(null);
    setIsCorrect(false);
    if (mode === 'memorize') {
      setQuizState('memorizing');
      setCountdown(3); // Wait, "倒數完之後僅顯示1音". Let's use 3s for rhythm
    } else {
      setQuizState('playing');
    }
  }, [mode, targetShape]);

  const toggleNode = (sIdx: number, fret: number) => {
    if (quizState !== 'playing' || mode === 'calculate') return; // calculate mode points are read-only
    
    // skip clicking root
    if (sIdx === question.rootSIdx && fret === question.rootFret) return;

    setSelectedNode({ sIdx, fret });
    
    // Auto submit upon click for memorize / random
    handleNodeSubmit(sIdx, fret);
  };
  
  const handleNodeSubmit = (sIdx: number, fret: number) => {
    const clickedPitch = STRINGS[sIdx] + fret;
    const targetPitch = STRINGS[question.targetNode.sIdx] + question.targetNode.fret;

    const shapeDef = SHAPES[question.shapeId];
    let minFret = question.primaryRootFret + shapeDef.win[0];
    let maxFret = question.primaryRootFret + shapeDef.win[1];

    if (mode === 'random') {
      minFret = Math.max(0, question.rootFret - 3);
      maxFret = Math.min(16, question.rootFret + 3);
    } else {
      minFret = Math.max(0, minFret);
      maxFret = Math.min(16, maxFret);
    }

    const expandedMin = Math.max(0, minFret - 2);
    const expandedMax = Math.min(16, maxFret + 2);
    const correct = clickedPitch === targetPitch && fret >= expandedMin && fret <= expandedMax;

    if (correct && (sIdx !== question.targetNode.sIdx || fret !== question.targetNode.fret)) {
       setQuestion(prev => ({...prev, targetNode: {sIdx, fret}}));
    }

    setIsCorrect(correct);
    processResult(correct);
  }
  
  const handleOptionSubmit = (option: string) => {
    if (quizState !== 'playing') return;
    setSelectedOption(option);
    
    const correct = option === question.targetInterval.name;
    setIsCorrect(correct);
    processResult(correct);
  };

  const processResult = (correct: boolean) => {
    setQuizState('result');

    const recentStats = moduleProgress.customMetadata?.recentStats || { total: 0, correct: 0 };
    const newStats = { total: recentStats.total + 1, correct: recentStats.correct + (correct ? 1 : 0) };
    const newAccuracy = Math.round((newStats.correct / newStats.total) * 100);

    if (correct) {
      const expEarned = mode === 'calculate' ? 15 : 20 + Math.floor(combo / 2) * 5;
      setScore(s => s + expEarned);
      setCombo(c => c + 1);
      incrementStreak('fretboard-interval');
      addExp('fretboard-interval', expEarned);
      
      const key = mode === 'random' ? 'random' : `${mode}_${question.shapeId}`;
      const streaks = moduleProgress.customMetadata?.streaks || {};
      const cleared = moduleProgress.customMetadata?.cleared || {};
      
      const newStreak = (streaks[key] || 0) + 1;
      const newStreaks = { ...streaks, [key]: newStreak };
      const newCleared = { ...cleared };
      
      if (newStreak >= 3) { // 3 consecutive wins
        newCleared[key] = true;
      }
      
      updateCustomMetadata('fretboard-interval', {
        streaks: newStreaks,
        cleared: newCleared,
        recentStats: newStats
      });
      updateBestScore('fretboard-interval', newAccuracy);
      
      const totalCleared = Object.values(newCleared).filter(Boolean).length;
      const newLevel = 1 + totalCleared; 
      
      if (newLevel > globalLevel) {
        setLevel('fretboard-interval', newLevel);
      }
      
      // Auto-next for correct answer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        loadNewQuestion();
      }, 800);

    } else {
      setCombo(0);
      resetStreak('fretboard-interval');
      
      const key = mode === 'random' ? 'random' : `${mode}_${question.shapeId}`;
      const streaks = moduleProgress.customMetadata?.streaks || {};
      
      updateCustomMetadata('fretboard-interval', {
        streaks: { ...streaks, [key]: 0 },
        recentStats: newStats
      });
      updateBestScore('fretboard-interval', newAccuracy);
    }
  };

  const renderFretboard = () => {
    return (
      <div ref={scrollContainerRef} className="relative w-full overflow-x-auto select-none rounded-xl bg-slate-800 p-1.5 sm:p-4 border-2 sm:border-4 border-slate-900 shadow-xl my-4 sm:my-6">
        {quizState === 'memorizing' && countdown > 0 && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 pointer-events-none rounded-lg">
            <motion.div 
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-6xl sm:text-8xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            >
              {countdown}
            </motion.div>
          </div>
        )}
        <div className="min-w-[480px] sm:min-w-[700px] flex text-white relative">
          <div className="absolute top-0 left-8 flex w-[calc(100%-2rem)] h-6 z-10 pointer-events-none">
            {Array.from({ length: 17 }).map((_, f) => (
              <div key={f} className="flex-1 flex justify-center text-[10px] text-slate-400 font-bold opacity-50">
                {f}
              </div>
            ))}
          </div>
          <div className="flex flex-col mt-6 w-full gap-0 py-1 sm:py-2 relative bg-slate-800/50 rounded-lg">
            {STRINGS.map((pitch, sIdx) => (
              <div key={sIdx} className="flex items-stretch group relative h-8 sm:h-12 border-b border-white/5 last:border-b-0">
                <div className="w-8 flex justify-center items-center text-[10px] sm:text-xs font-bold text-slate-400 font-mono relative z-20 pointer-events-none">
                  {STRING_NAMES[sIdx]}
                </div>
                <div className="absolute right-0 w-[calc(100%-2rem)] h-[2px] bg-gradient-to-r from-slate-600 via-slate-400 to-slate-500 shadow-sm top-1/2 -translate-y-1/2 pointer-events-none z-10" 
                     style={{ height: `${1 + (5 - sIdx) * 0.3}px` }} />
                     
                <div className="flex flex-1 relative z-20">
                  {Array.from({ length: 17 }).map((_, f) => {
                    const isRoot = question.rootSIdx === sIdx && question.rootFret === f;
                    const isTarget = question.targetNode.sIdx === sIdx && question.targetNode.fret === f;
                    const isSelectedNode = selectedNode?.sIdx === sIdx && selectedNode?.fret === f;
                    
                    const isMajorScaleDot = question.majorScaleDots.find(n => n.sIdx === sIdx && n.fret === f);

                    let content = null;
                    let dotClass = '';

                    if (quizState === 'memorizing') {
                      if (isRoot) {
                        dotClass = 'bg-amber-400 text-amber-900 ring-2 sm:ring-4 ring-white shadow-[0_0_15px_rgba(251,191,36,0.6)]';
                        content = '1';
                      } else if (isMajorScaleDot) {
                        dotClass = 'bg-slate-400 text-slate-900 border-2 border-slate-600 opacity-60';
                        content = isMajorScaleDot.degree;
                      }
                    } else if (quizState === 'playing' || quizState === 'result') {
                      if (isRoot) {
                        dotClass = 'bg-amber-400 text-amber-900 ring-2 sm:ring-4 ring-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.6)]';
                        content = '1';
                      } else if (mode === 'calculate' && isTarget) {
                        // Display the target dot for calculation
                        dotClass = 'bg-sky-400 text-sky-900 ring-2 sm:ring-4 ring-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.6)]';
                        content = '?';
                        if (quizState === 'result') {
                            content = question.targetInterval.name;
                            if (isCorrect) dotClass = 'bg-emerald-400 text-emerald-900 ring-4 ring-emerald-200';
                            else dotClass = 'bg-rose-500 text-white ring-4 ring-rose-200';
                        }
                      } else if ((mode === 'memorize' || mode === 'random') && quizState === 'result') {
                        if (isTarget) {
                            dotClass = 'bg-emerald-400 text-emerald-900 ring-2 sm:ring-4 ring-emerald-200 shadow-md';
                            content = question.targetInterval.name.replace('度', '');
                            if (!isCorrect) dotClass += ' animate-pulse'; // show correct answer if wrong
                        } else if (isSelectedNode && !isCorrect) {
                            dotClass = 'bg-rose-500 text-white ring-2 sm:ring-4 ring-rose-200';
                            content = 'X';
                        }
                      } else if (isSelectedNode) {
                        dotClass = 'bg-slate-200 text-slate-800 ring-2 ring-slate-400 shadow-sm';
                      }
                    }

                    return (
                      <div 
                        key={f} 
                        className={`flex-1 flex justify-center items-center h-full relative cursor-pointer border-r border-slate-600 hover:bg-white/5 transition-colors ${f === 0 ? 'border-r-2 sm:border-r-4 border-r-slate-300 bg-slate-900/40' : ''}`}
                        onClick={() => toggleNode(sIdx, f)}
                      >
                        {dotClass && (
                          <div className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold z-30 transition-all ${dotClass}`}>
                            {content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center h-3 sm:h-4 mt-1">
              <div className="w-8" />
              <div className="flex flex-1">
                {Array.from({ length: 17 }).map((_, f) => (
                  <div key={f} className="flex-1 flex justify-center items-start">
                    {[3, 5, 7, 9, 15].includes(f) && (
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-500/60" />
                    )}
                    {f === 12 && (
                      <div className="flex gap-1 sm:gap-1.5 -translate-x-[1px]">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-500/60" />
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-500/60" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getTitle = () => {
    if (mode === 'memorize') {
      return <span>這題的 <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-4">{question.targetInterval.name}</span> 是在哪裡？</span>;
    } else if (mode === 'calculate') {
      return <span>此音與主音的音程度數為何？</span>;
    } else if (mode === 'random') {
      return <span>隨機挑戰：找找 <span className="text-rose-600 underline decoration-rose-300 underline-offset-4">{question.targetInterval.name}</span> 的位置！</span>;
    }
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500 px-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onHome} className="flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            ← 放棄
          </button>
          <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Lv{globalLevel}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="bg-emerald-50 text-emerald-700 px-2 sm:px-3 py-1 rounded-full">
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

      <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="text-center mb-4 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">
            {getTitle()}
          </h3>
          <p className="text-xs sm:text-slate-500 font-medium text-slate-400">
            {quizState === 'memorizing' ? '以大調音階形狀為基準推導...' : 
             quizState === 'playing' ? (mode === 'calculate' ? '請從下方選項中作答' : '點擊指板上的正確音程') : 
             isCorrect ? '🎉 完美答對！' : `答錯了，正解為 ${question.targetInterval.name}`}
          </p>
        </div>

        {renderFretboard()}

        {mode === 'calculate' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
              {question.multipleChoiceOptions?.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectOption = opt === question.targetInterval.name;
                
                let btnClass = "bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50";
                
                if (quizState === 'result') {
                  if (isCorrectOption) {
                    btnClass = "bg-emerald-500 border-emerald-600 text-white";
                  } else if (isSelected && !isCorrectOption) {
                    btnClass = "bg-rose-500 border-rose-600 text-white";
                  } else {
                    btnClass = "bg-slate-100 border-slate-200 text-slate-400 opacity-50";
                  }
                }
                
                return (
                    <Button 
                        key={i} 
                        className={`h-12 sm:h-14 text-sm sm:text-base font-bold shadow-sm ${btnClass}`}
                        onClick={() => handleOptionSubmit(opt)}
                        disabled={quizState !== 'playing'}
                    >
                        {opt}
                    </Button>
                )
              })}
            </div>
        )}

        <div className="flex justify-center mt-4 sm:mt-8 px-4">
          {quizState === 'result' && !isCorrect && (
            <Button size="lg" className="w-full sm:w-48 text-lg h-12 sm:h-14 font-bold" onClick={loadNewQuestion}>
              下一題
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
