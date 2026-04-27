import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import type { MajorScaleMode, CagedShape } from './MajorScaleHome';

interface MajorScaleQuizProps {
  mode: MajorScaleMode;
  targetShape?: CagedShape;
  onHome: () => void;
}

const STRINGS = [64, 59, 55, 50, 45, 40]; // 1st to 6th
const STRING_NAMES = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
const INTERVAL_MAP: Record<number, string> = { 0: '1', 2: '2', 4: '3', 5: '4', 7: '5', 9: '6', 11: '7' };
const CAGED_LIST: CagedShape[] = ['C', 'A', 'G', 'E', 'D'];

const SHAPES: Record<CagedShape, { rootStr: number, win: [number, number] }> = {
  'C': { rootStr: 4, win: [-3, 0] },
  'A': { rootStr: 4, win: [-1, 3] },
  'G': { rootStr: 5, win: [-4, 0] },
  'E': { rootStr: 5, win: [-1, 2] },
  'D': { rootStr: 3, win: [-1, 3] }
};

interface TargetNode {
  sIdx: number;
  fret: number;
  degree: string;
}

interface Question {
  shapeId: CagedShape;
  rootSIdx: number;
  rootFret: number;
  targetNodes: TargetNode[];
}

const generateQuestion = (mode: MajorScaleMode, selectedShape?: CagedShape): Question => {
  const shapeId = (mode === 'random' || mode === 'hell') ? CAGED_LIST[Math.floor(Math.random() * CAGED_LIST.length)] : (selectedShape || 'E');
  const shapeDef = SHAPES[shapeId];
  
  const minPossible = Math.max(1, 1 - shapeDef.win[0]);
  const maxPossible = Math.min(15, 15 - shapeDef.win[1]);
  const rootFret = Math.floor(Math.random() * (maxPossible - minPossible + 1)) + minPossible;

  const rootPitch = STRINGS[shapeDef.rootStr] + rootFret;
  const targetNodes: TargetNode[] = [];

  for (let sIdx = 0; sIdx < 6; sIdx++) {
    for (let fret = rootFret + shapeDef.win[0]; fret <= rootFret + shapeDef.win[1]; fret++) {
      if (fret < 0 || fret > 16) continue;
      const pitch = STRINGS[sIdx] + fret;
      const diff = ((pitch - rootPitch) % 12 + 12) % 12;
      if (INTERVAL_MAP[diff]) {
        targetNodes.push({ sIdx, fret, degree: INTERVAL_MAP[diff] });
      }
    }
  }

  return { shapeId, rootSIdx: shapeDef.rootStr, rootFret, targetNodes };
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getNoteName = (pitch: number) => NOTES[pitch % 12];

export function MajorScaleQuiz({ mode, targetShape, onHome }: MajorScaleQuizProps) {
  const { progress, addExp, setLevel, incrementStreak, resetStreak, updateCustomMetadata, updateBestScore } = useGameStore();
  const moduleProgress = progress['fretboard-major-scale'] || defaultProgress;
  const globalLevel = moduleProgress.level;

  const [question, setQuestion] = useState<Question>(generateQuestion(mode, targetShape));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const [quizState, setQuizState] = useState<'memorizing' | 'playing' | 'result'>(mode === 'memorize' ? 'memorizing' : 'playing');
  const [countdown, setCountdown] = useState(5);
  
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [resultStats, setResultStats] = useState({ correct: 0, wrong: 0, missed: 0 });

  const prevLevelRef = useRef(globalLevel);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    // Set manualLeveling to true initially
    updateCustomMetadata('fretboard-major-scale', { manualLeveling: true });
  }, []);

  useEffect(() => {
    if (globalLevel > prevLevelRef.current) {
      // Confetti removed due to potential freezing issues
    }
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
    setSelectedNodes(new Set());
    if (mode === 'memorize') {
      setQuizState('memorizing');
      setCountdown(5);
    } else {
      setQuizState('playing');
    }
  }, [mode, targetShape]);

  const toggleNode = (sIdx: number, fret: number) => {
    if (quizState !== 'playing') return;
    
    // In memorize and random modes, the root note is pre-given, so don't toggle it
    if ((mode === 'memorize' || mode === 'random') && sIdx === question.rootSIdx && fret === question.rootFret) return;

    const key = `${sIdx}-${fret}`;
    setSelectedNodes(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    let wrong = 0;
    
    selectedNodes.forEach(key => {
      const isTarget = question.targetNodes.some(n => `${n.sIdx}-${n.fret}` === key);
      if (isTarget) correct++;
      else wrong++;
    });

    // -1 for root note which is pre-given only in memorize and random modes
    const preGivenNodes = (mode === 'memorize' || mode === 'random') ? 1 : 0;
    const missed = question.targetNodes.length - preGivenNodes - correct; 

    setResultStats({ correct, wrong, missed });
    setQuizState('result');

    const recentStats = moduleProgress.customMetadata?.recentStats || { total: 0, correct: 0 };
    const newStats = { total: recentStats.total + 1, correct: recentStats.correct + (wrong === 0 && missed === 0 ? 1 : 0) };
    const newAccuracy = Math.round((newStats.correct / newStats.total) * 100);

    if (wrong === 0 && missed === 0) {
      const expEarned = 20 + Math.floor(combo / 2) * 10;
      setScore(s => s + expEarned);
      setCombo(c => c + 1);
      incrementStreak('fretboard-major-scale');
      addExp('fretboard-major-scale', expEarned);
      
      const key = (mode === 'random' || mode === 'hell') ? mode : `${mode}_${question.shapeId}`;
      const streaks = moduleProgress.customMetadata?.streaks || {};
      const cleared = moduleProgress.customMetadata?.cleared || {};
      
      const newStreak = (streaks[key] || 0) + 1;
      const newStreaks = { ...streaks, [key]: newStreak };
      const newCleared = { ...cleared };
      
      if (newStreak >= 3) { // 3 consecutive wins to advance that shape/mode
        newCleared[key] = true;
      }
      
      updateCustomMetadata('fretboard-major-scale', {
        streaks: newStreaks,
        cleared: newCleared,
        recentStats: newStats
      });
      updateBestScore('fretboard-major-scale', newAccuracy);
      
      const totalCleared = Object.values(newCleared).filter(Boolean).length;
      const newLevel = 1 + totalCleared; // Max 11
      
      if (newLevel > globalLevel) {
        setLevel('fretboard-major-scale', newLevel);
      }
      
      setTimeout(() => {
        loadNewQuestion();
      }, 1000);
    } else {
      setCombo(0);
      resetStreak('fretboard-major-scale');
      
      const key = (mode === 'random' || mode === 'hell') ? mode : `${mode}_${question.shapeId}`;
      const streaks = moduleProgress.customMetadata?.streaks || {};
      
      updateCustomMetadata('fretboard-major-scale', {
        streaks: { ...streaks, [key]: 0 },
        recentStats: newStats
      });
      updateBestScore('fretboard-major-scale', newAccuracy);
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
        <div className="min-w-[480px] sm:min-w-[600px] flex text-white relative">
          <div className="absolute top-0 left-8 flex w-[calc(100%-2rem)] h-6 z-10 pointer-events-none">
            {Array.from({ length: 16 }).map((_, f) => (
              <div key={f} className="flex-1 flex justify-center text-[10px] text-slate-400 font-bold opacity-50">
                {f}
              </div>
            ))}
          </div>
          <div className="flex flex-col mt-6 w-full gap-0 py-1 sm:py-2 relative bg-slate-800/50 rounded-lg">
            {STRINGS.map((pitch, sIdx) => (
              <div key={sIdx} className="flex items-stretch group relative h-8 sm:h-11">
                <div className="w-8 flex justify-center items-center text-[10px] sm:text-xs font-bold text-slate-400 font-mono relative z-20 pointer-events-none">
                  {STRING_NAMES[sIdx]}
                </div>
                <div className="absolute right-0 w-[calc(100%-2rem)] h-[2px] bg-gradient-to-r from-slate-600 via-slate-400 to-slate-500 shadow-sm top-1/2 -translate-y-1/2 pointer-events-none z-10" 
                     style={{ height: `${1 + (5 - sIdx) * 0.3}px` }} />
                     
                <div className="flex flex-1 relative z-20">
                  {Array.from({ length: 16 }).map((_, f) => {
                    const isRoot = question.rootSIdx === sIdx && question.rootFret === f;
                    const targetNode = question.targetNodes.find(n => n.sIdx === sIdx && n.fret === f);
                    const isTarget = !!targetNode;
                    const key = `${sIdx}-${f}`;
                    const isSelected = selectedNodes.has(key);

                    const preGivenRoot = (mode === 'memorize' || mode === 'random') && isRoot;

                    let content = null;
                    let dotClass = '';

                    if (quizState === 'memorizing') {
                      if (preGivenRoot) {
                        dotClass = 'bg-amber-400 text-amber-900 ring-2 sm:ring-4 ring-white shadow-[0_0_15px_rgba(251,191,36,0.6)]';
                        content = '1';
                      } else if (isTarget) {
                        dotClass = 'bg-sky-400 text-sky-900 shadow-md opacity-90';
                        content = targetNode.degree;
                      }
                    } else if (quizState === 'playing') {
                      if (preGivenRoot) {
                        dotClass = 'bg-amber-400 text-amber-900 ring-2 sm:ring-4 ring-white shadow-[0_0_15px_rgba(251,191,36,0.6)]';
                        content = '1';
                      } else if (isSelected) {
                        if ((mode === 'recall' || mode === 'hell') && Array.from(selectedNodes).length === 1 && selectedNodes.has(key)) {
                          dotClass = 'bg-amber-100 text-amber-800 ring-2 sm:ring-4 ring-amber-300 shadow-sm';
                          content = '1';
                        } else {
                          dotClass = 'bg-slate-200 text-slate-800 ring-2 ring-slate-400 shadow-sm';
                        }
                      }
                    } else if (quizState === 'result') {
                      if (preGivenRoot) {
                        dotClass = 'bg-amber-400 text-amber-900 ring-2 sm:ring-4 ring-white';
                        content = '1';
                      } else if (isSelected && isTarget) {
                        dotClass = 'bg-emerald-400 text-emerald-900 ring-2 sm:ring-4 ring-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.5)]';
                        content = targetNode.degree;
                      } else if (isSelected && !isTarget) {
                        dotClass = 'bg-rose-500 text-white ring-2 sm:ring-4 ring-rose-200';
                        content = 'X';
                      } else if (!isSelected && isTarget) {
                        dotClass = 'bg-transparent border-2 border-emerald-400 text-emerald-400 animate-pulse';
                        content = targetNode.degree;
                      }
                    }

                    return (
                      <div 
                        key={f} 
                        className={`flex-1 flex justify-center items-center h-full relative cursor-pointer border-r border-slate-600 hover:bg-white/5 transition-colors ${f === 0 ? 'border-r-2 sm:border-r-4 border-r-slate-300 bg-slate-900/40' : ''}`}
                        onClick={() => toggleNode(sIdx, f)}
                      >
                        {dotClass && (
                          <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-xs font-bold z-30 transition-all ${dotClass}`}>
                            {content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Bottom Fret Markers (Side Dots) */}
            <div className="flex items-center h-3 sm:h-4 mt-1">
              <div className="w-8" />
              <div className="flex flex-1">
                {Array.from({ length: 16 }).map((_, f) => (
                  <div key={f} className="flex-1 flex justify-center items-start">
                    {[3, 5, 7, 9, 15].includes(f) && (
                      <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-slate-500/60" />
                    )}
                    {f === 12 && (
                      <div className="flex gap-0.5 sm:gap-1 -translate-x-[1px]">
                        <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-slate-500/60" />
                        <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-slate-500/60" />
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
    const rootName = getNoteName(STRINGS[question.rootSIdx] + question.rootFret);
    if (mode === 'memorize') {
      return (
        <span>{rootName} 大調音階 <br className="sm:hidden" /> <span className="text-indigo-600">({question.shapeId} Shape)</span></span>
      );
    } else if (mode === 'recall') {
      return (
        <span className="leading-tight">
          {rootName} 大調音階 <span className="text-indigo-600">({question.shapeId} Shape)</span>
          <br />
          <span className="text-sm font-medium text-slate-400 uppercase tracking-widest block mt-1">
            主音於第 {STRING_NAMES[question.rootSIdx]} 弦
          </span>
        </span>
      );
    } else if (mode === 'random' || mode === 'hell') {
      return (
        <span>{rootName} 大調音階 <br className="sm:hidden" /> <span className="text-rose-500">({question.shapeId} Shape)</span></span>
      );
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
          <p className="text-xs sm:text-slate-500 font-medium text-slate-400 mt-2">
            {quizState === 'memorizing' ? '請記住音階的位置...' : 
             quizState === 'playing' ? 
               (mode === 'hell' ? '請確實點出主音(1)與所有音階位置！' : '請點擊指板，填滿所有音階位置！') : 
               (resultStats.wrong === 0 && resultStats.missed === 0 ? '🎉 完美答對！' : '還有進步空間，看看漏了或按錯了哪裡')}
          </p>
        </div>

        {renderFretboard()}

        <div className="flex justify-center mt-4 sm:mt-8 px-4">
          {quizState === 'playing' && (
            <Button size="lg" className="w-full sm:w-48 text-lg h-12 sm:h-14 font-bold" onClick={handleSubmit}>
              送出答案
            </Button>
          )}
          {quizState === 'result' && (resultStats.wrong !== 0 || resultStats.missed !== 0) && (
            <Button size="lg" className="w-full sm:w-48 text-lg h-12 sm:h-14 font-bold" onClick={loadNewQuestion}>
              下一題
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
