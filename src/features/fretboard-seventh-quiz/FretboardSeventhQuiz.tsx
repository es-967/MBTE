import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { useGameStore, defaultProgress } from '../../store/useGameStore';
import type { FretboardSeventhMode } from './FretboardSeventhHome';
import { SeventhPosition, POSITION_RANGES, SEVENTH_SHAPES, SeventhChordQuality, POSITION_NAMES } from './chordDefs';

interface FretboardSeventhQuizProps {
  mode: FretboardSeventhMode;
  targetPosition?: SeventhPosition;
  onHome: () => void;
}

const STRINGS = [64, 59, 55, 50, 45, 40]; // 1st to 6th E4 to E2
const STRING_NAMES = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const getNoteName = (pitch: number, useFlat: boolean) => (useFlat ? FLAT_NOTES : SHARP_NOTES)[pitch % 12];

interface TargetNode {
  sIdx: number;
  fret: number;
  isRoot: boolean;
}

interface Question {
  positionId: SeventhPosition | 'random';
  rootSIdx: number;
  rootFret: number;
  chordQuality: SeventhChordQuality;
  chordName: string;
  targetNodes: TargetNode[];
  options?: string[];
  focusCenterFret: number;
}

const generateQuestion = (mode: FretboardSeventhMode, selectedPos?: SeventhPosition): Question => {
  let actualSelectedPos = selectedPos;
  if (mode === 'hell') {
     const posArray: SeventhPosition[] = ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'];
     actualSelectedPos = posArray[Math.floor(Math.random() * posArray.length)];
  }

  let validConfigurations: { rootSIdx: number, rootFret: number, quality: SeventhChordQuality, targetNodes: TargetNode[] }[] = [];
  
  let minFret = 0;
  let maxFret = 16;
  
  if (mode !== 'random' && actualSelectedPos) {
    const range = POSITION_RANGES[actualSelectedPos];
    minFret = range[0];
    maxFret = range[1];
  } else {
    minFret = 1;
    maxFret = 12;
  }

  const qualities: SeventhChordQuality[] = ['maj7', '7', 'm7', 'm7b5', 'dim7'];
  const rootStrings = [5, 4]; // Only use roots on 6th (5) and 5th (4) strings

  for (const q of qualities) {
    for (const rs of rootStrings) {
      const offsets = SEVENTH_SHAPES[q][rs];
      
      for (let rf = minFret; rf <= maxFret; rf++) {
        let isValid = true;
        const nodes: TargetNode[] = [];
        
        offsets.forEach((offset, idx) => {
          if (offset !== 'X') {
            const actualFret = rf + (offset as number);
            const actualStringIdx = 5 - idx; // Map idx (0 -> 6th string) to stringIdx (5)
            
            if (actualFret < 0 || actualFret > 16) {
              isValid = false;
            }
            
            if (mode !== 'random') {
              if (actualFret < minFret || actualFret > maxFret) {
                isValid = false;
              }
            }
            
            nodes.push({
              sIdx: actualStringIdx,
              fret: actualFret,
              isRoot: actualStringIdx === rs && actualFret === rf
            });
          }
        });
        
        if (isValid && nodes.length > 0) {
          validConfigurations.push({
            rootSIdx: rs,
            rootFret: rf,
            quality: q,
            targetNodes: nodes
          });
        }
      }
    }
  }

  if (validConfigurations.length === 0) {
    console.warn("No valid chord configurations found in window, expanding window");
    validConfigurations.push({
      rootSIdx: 5, rootFret: 3, quality: 'maj7', targetNodes: [{sIdx: 5, fret: 3, isRoot: true}]
    });
  }

  const chosenConfig = validConfigurations[Math.floor(Math.random() * validConfigurations.length)];
  const useFlatQuestion = Math.random() > 0.5;
  const rootPitch = STRINGS[chosenConfig.rootSIdx] + chosenConfig.rootFret;
  const noteName = getNoteName(rootPitch, useFlatQuestion);
  
  let qualityName = '';
  if (chosenConfig.quality === 'maj7') qualityName = 'maj7';
  else if (chosenConfig.quality === '7') qualityName = '7';
  else if (chosenConfig.quality === 'm7') qualityName = 'm7';
  else if (chosenConfig.quality === 'm7b5') qualityName = 'm7b5';
  else if (chosenConfig.quality === 'dim7') qualityName = 'dim7';
  
  const chordName = `${noteName}${qualityName}`;
  
  let options: string[] | undefined;
  if (mode === 'memorize') {
    const possibleAnswers = new Set<string>();
    possibleAnswers.add(chordName);
    
    while(possibleAnswers.size < 4) {
      const randQ = qualities[Math.floor(Math.random() * qualities.length)];
      const useFlatOption = Math.random() > 0.5;
      const notesArray = useFlatOption ? FLAT_NOTES : SHARP_NOTES;
      const randRoot = notesArray[Math.floor(Math.random() * notesArray.length)];
      
      let randQualityName = '';
      if (randQ === 'maj7') randQualityName = 'maj7';
      else if (randQ === '7') randQualityName = '7';
      else if (randQ === 'm7') randQualityName = 'm7';
      else if (randQ === 'm7b5') randQualityName = 'm7b5';
      else if (randQ === 'dim7') randQualityName = 'dim7';
      
      possibleAnswers.add(`${randRoot}${randQualityName}`);
    }
    options = Array.from(possibleAnswers).sort(() => 0.5 - Math.random());
  }

  return {
    positionId: mode === 'random' ? 'random' : (actualSelectedPos as SeventhPosition),
    rootSIdx: chosenConfig.rootSIdx,
    rootFret: chosenConfig.rootFret,
    chordQuality: chosenConfig.quality,
    chordName,
    targetNodes: chosenConfig.targetNodes,
    options,
    focusCenterFret: chosenConfig.rootFret
  };
};

export function FretboardSeventhQuiz({ mode, targetPosition, onHome }: FretboardSeventhQuizProps) {
  const { progress, addExp, setLevel, incrementStreak, resetStreak, updateCustomMetadata, updateBestScore } = useGameStore();
  const moduleProgress = progress['fretboard-seventh'] || defaultProgress;
  const globalLevel = moduleProgress.level;

  const [question, setQuestion] = useState<Question>(generateQuestion(mode, targetPosition));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const [quizState, setQuizState] = useState<'playing' | 'result'>('playing');
  
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [resultStats, setResultStats] = useState({ correct: 0, wrong: 0, missed: 0 });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const prevLevelRef = useRef(globalLevel);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const scrollToFret = (fret: number) => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const scrollTarget = (fret / 16) * scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth / 2;
        scrollContainerRef.current.scrollTo({
          left: scrollTarget,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  useEffect(() => {
    if (question) {
      if (mode === 'random') {
          scrollToFret(question.rootFret);
      } else if (targetPosition) {
          const midFret = (POSITION_RANGES[targetPosition][0] + POSITION_RANGES[targetPosition][1]) / 2;
          scrollToFret(midFret);
      }
    }
  }, [question, mode, targetPosition]);

  useEffect(() => {
    updateCustomMetadata('fretboard-seventh', { manualLeveling: true });
  }, [updateCustomMetadata]);

  const loadNewQuestion = useCallback(() => {
    setQuestion(generateQuestion(mode, targetPosition));
    setSelectedNodes(new Set());
    setSelectedOption(null);
    setQuizState('playing');
  }, [mode, targetPosition]);

  const toggleNode = (sIdx: number, fret: number) => {
    if (quizState !== 'playing' || mode === 'memorize') return;
    
    if (mode !== 'hell') {
      if (sIdx === question.rootSIdx && fret === question.rootFret) return;
    }

    const key = `${sIdx}-${fret}`;
    setSelectedNodes(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  
  const handleOptionSelect = (option: string) => {
    if (quizState !== 'playing' || mode !== 'memorize') return;
    setSelectedOption(option);
    
    const isCorrect = option === question.chordName;
    processSubmitResult(isCorrect ? 0 : 1, isCorrect ? 0 : 1, isCorrect ? 0 : 0);
  };

  const handleSubmit = () => {
    let correct = 0;
    let wrong = 0;
    
    selectedNodes.forEach(key => {
      const isTarget = question.targetNodes.some(n => {
        if (mode === 'hell') return `${n.sIdx}-${n.fret}` === key;
        return `${n.sIdx}-${n.fret}` === key && !(n.sIdx === question.rootSIdx && n.fret === question.rootFret);
      });
      if (isTarget) correct++;
      else wrong++;
    });

    const expectedTargets = mode === 'hell' 
      ? question.targetNodes 
      : question.targetNodes.filter(n => !(n.sIdx === question.rootSIdx && n.fret === question.rootFret));
    const missed = expectedTargets.length - correct;

    processSubmitResult(correct, wrong, missed);
  };
  
  const processSubmitResult = (correctCount: number, wrongCount: number, missedCount: number) => {
    setResultStats({ correct: correctCount, wrong: wrongCount, missed: missedCount });
    setQuizState('result');

    const isWin = wrongCount === 0 && missedCount === 0;

    const recentStats = moduleProgress.customMetadata?.recentStats || { total: 0, correct: 0 };
    const newStats = { total: recentStats.total + 1, correct: recentStats.correct + (isWin ? 1 : 0) };
    const newAccuracy = Math.round((newStats.correct / newStats.total) * 100);

    if (isWin) {
      const expEarned = 20 + Math.floor(combo / 2) * 10;
      setScore(s => s + expEarned);
      setCombo(c => c + 1);
      incrementStreak('fretboard-seventh');
      addExp('fretboard-seventh', expEarned);
      
      const key = (mode === 'random' || mode === 'hell') ? mode : `${mode}_${question.positionId}`;
      const streaks = moduleProgress.customMetadata?.streaks || {};
      const cleared = moduleProgress.customMetadata?.cleared || {};
      
      const newStreak = (streaks[key] || 0) + 1;
      const newStreaks = { ...streaks, [key]: newStreak };
      const newCleared = { ...cleared };
      
      if (newStreak >= 3) {
        newCleared[key] = true;
      }
      
      updateCustomMetadata('fretboard-seventh', {
        streaks: newStreaks,
        cleared: newCleared,
        recentStats: newStats
      });
      updateBestScore('fretboard-seventh', newAccuracy);
      
      const totalCleared = Object.values(newCleared).filter(Boolean).length;
      const newLevel = 1 + totalCleared; // Max 11
      
      if (newLevel > globalLevel) {
        setLevel('fretboard-seventh', newLevel);
      }
      
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        loadNewQuestion();
      }, 1000);
    } else {
      setCombo(0);
      resetStreak('fretboard-seventh');
      updateCustomMetadata('fretboard-seventh', {
        recentStats: newStats
      });
      updateBestScore('fretboard-seventh', newAccuracy);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500 px-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onHome} className="flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            ← 放棄測驗
          </button>
          <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Lv{globalLevel}</span>
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
          {mode === 'memorize' ? (
            <>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">這是什麼七和弦？</h3>
              <p className="text-xs sm:text-sm font-medium text-slate-400">觀察指板上的和弦形狀，並選擇正確的和弦名稱</p>
            </>
          ) : (
            <>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">
                在指板上建構 <span className="text-emerald-600">{question.chordName}</span> 和弦
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                {mode === 'hell' ? '在選定範圍內建構和弦 (請點擊出根音與所有和弦組成音)' : '以提供的根音 (Root) 為基準，點擊出剩下的和弦組成音'}
                {mode !== 'hell' && (
                  <span className="font-bold text-amber-600 ml-1">
                    (共需點擊 {question.targetNodes.filter(n => !n.isRoot).length} 個音)
                  </span>
                )}
              </p>
            </>
          )}
        </div>

        {true && (
        <div className="relative w-full overflow-x-auto select-none rounded-2xl bg-slate-800 p-2 sm:p-4 border-4 border-slate-900 shadow-2xl" ref={scrollContainerRef}>
          <div className="min-w-[800px] flex text-white relative">
            {mode !== 'random' && question.positionId !== 'random' && (
              <div 
                className="absolute inset-y-0 bg-white/5 border-x border-white/20 z-0 pointer-events-none"
                style={{
                  left: `${(POSITION_RANGES[question.positionId as SeventhPosition][0] / 16) * 100}%`,
                  width: `${((POSITION_RANGES[question.positionId as SeventhPosition][1] - POSITION_RANGES[question.positionId as SeventhPosition][0] + 1) / 17) * 100}%`
                }}
              />
            )}
            
            <div className="absolute top-0 left-8 flex w-[calc(100%-2rem)] h-6 z-10">
              {Array.from({ length: 17 }).map((_, f) => (
                <div key={f} className="flex-1 flex justify-center text-[10px] text-slate-400 font-bold opacity-50">
                  {f}
                </div>
              ))}
            </div>

            <div className="flex flex-col mt-6 w-full gap-[4px] sm:gap-[6px]">
              {STRINGS.map((openPitch, sIdx) => {
                return (
                  <div key={sIdx} className="flex items-center group relative h-7 sm:h-8">
                    <div className="w-8 text-[10px] sm:text-xs font-bold text-slate-400 text-center font-mono relative z-20">
                      {STRING_NAMES[sIdx]}
                    </div>
                    
                    <div className="absolute right-0 w-[calc(100%-2rem)] h-[1px] bg-gradient-to-r from-slate-600 via-slate-400 to-slate-500 shadow-sm top-1/2 -translate-y-1/2 pointer-events-none z-10" 
                         style={{ height: `${1 + sIdx * 0.4}px` }} />

                    <div className="flex flex-1 relative z-20">
                      {Array.from({ length: 17 }).map((_, fret) => {
                        const isRoot = sIdx === question.rootSIdx && fret === question.rootFret;
                        
                        let isTarget = false;
                        if (mode === 'memorize' || quizState === 'result') {
                          isTarget = question.targetNodes.some(n => n.sIdx === sIdx && n.fret === fret);
                        }

                        const isSelected = selectedNodes.has(`${sIdx}-${fret}`);

                        let dotClass = 'opacity-0 scale-50 group-hover:opacity-30 group-hover:scale-75 cursor-pointer';
                        let label = '';

                        if (mode === 'memorize') {
                          dotClass = 'opacity-0'; // no hover interactions
                          if (isRoot) {
                            dotClass = 'opacity-100 scale-100 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] text-white';
                            label = 'R';
                          } else if (isTarget) {
                            dotClass = 'opacity-100 scale-100 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] text-white';
                          }
                        } else if (mode === 'hell') {
                          if (isSelected) {
                            dotClass = 'opacity-100 scale-100 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] text-white';
                          }
                          
                          if (quizState === 'result') {
                            const correctTarget = question.targetNodes.some(n => n.sIdx === sIdx && n.fret === fret);
                            if (correctTarget && isSelected) {
                              dotClass = 'opacity-100 scale-100 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] text-white';
                              label = isRoot ? 'R' : '✓';
                            } else if (correctTarget && !isSelected) {
                              dotClass = 'opacity-100 scale-100 bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)] text-white border-2 border-emerald-400 border-dashed';
                              label = isRoot ? 'R' : '';
                            } else if (!correctTarget && isSelected) {
                              dotClass = 'opacity-100 scale-100 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] text-white';
                              label = '✗';
                            }
                          }
                        } else {
                          // recall or random mode
                          if (isRoot) {
                            dotClass = 'opacity-100 scale-100 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] text-white cursor-not-allowed';
                            label = 'R';
                          } else if (isSelected) {
                            dotClass = 'opacity-100 scale-100 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] text-white';
                          }
                          
                          if (quizState === 'result') {
                            const correctTarget = question.targetNodes.some(n => n.sIdx === sIdx && fret === n.fret);
                            if (correctTarget && isSelected) {
                              dotClass = 'opacity-100 scale-100 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] text-white';
                              label = '✓';
                            } else if (correctTarget && !isSelected && !isRoot) {
                              dotClass = 'opacity-100 scale-100 bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)] text-white border-2 border-emerald-400 border-dashed';
                            } else if (!correctTarget && isSelected) {
                              dotClass = 'opacity-100 scale-100 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] text-white';
                              label = '✗';
                            }
                          }
                        }

                        return (
                          <div 
                            key={fret} 
                            onPointerDown={() => toggleNode(sIdx, fret)}
                            className={`flex-1 flex justify-center items-center h-full relative border-r border-slate-700 ${fret === 0 ? 'border-r-4 border-r-slate-300 bg-slate-900/40' : 'hover:bg-white/5'}`}
                          >
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-200 text-[10px] sm:text-xs font-bold z-30 ${dotClass} ${fret === 0 ? 'rounded-md' : ''}`}>
                              {label}
                            </div>
                            
                            {sIdx === 2 && [3, 5, 7, 9, 15].includes(fret) && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-600/50 pointer-events-none -z-10" />
                            )}
                            {sIdx === 2 && fret === 12 && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 pointer-events-none -z-10">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center mt-6">
        {mode === 'memorize' ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {question.options?.map(opt => {
              let btnClass = "bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50 active:bg-amber-100";
              if (quizState === 'result') {
                if (opt === question.chordName) {
                  btnClass = "bg-emerald-100 border-emerald-500 text-emerald-800 shadow-md shadow-emerald-200";
                } else if (opt === selectedOption) {
                  btnClass = "bg-red-50 border-red-400 text-red-600 opacity-50";
                } else {
                  btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                }
              }

              return (
                <Button
                  key={opt}
                  className={`h-12 sm:h-14 text-sm sm:text-base font-bold border-2 transition-all shadow-sm ${btnClass}`}
                  disabled={quizState === 'result'}
                  onClick={() => handleOptionSelect(opt)}
                >
                  {opt}
                </Button>
              );
            })}
          </div>
        ) : (
          quizState === 'playing' ? (
            <Button 
              className="w-full sm:w-64 h-12 sm:h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all"
              onClick={handleSubmit}
            >
              送出答案
            </Button>
          ) : null
        )}
      </div>

      {quizState === 'result' && (
        <div className="mt-8">
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200/60 animate-in slide-in-from-bottom-4">
            {resultStats.wrong === 0 && resultStats.missed === 0 ? (
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl">✨</div>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-600">Perfect!</h3>
                {mode !== 'memorize' && <p className="text-slate-500 text-xs sm:text-sm font-medium">你準確點出了所有的組成音</p>}
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl">💪</div>
                <h3 className="text-lg sm:text-xl font-black text-slate-800">再接再厲！</h3>
                {mode !== 'memorize' && (
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    答對: <span className="text-emerald-600 font-bold">{resultStats.correct}</span> | 
                    錯誤: <span className="text-red-500 font-bold">{resultStats.wrong}</span> | 
                    漏掉: <span className="text-amber-500 font-bold">{resultStats.missed}</span>
                  </p>
                )}
                {mode === 'memorize' && (
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    正確答案是 <span className="text-emerald-600 font-bold">{question.chordName}</span>
                  </p>
                )}
              </div>
            )}
            
            {!(resultStats.wrong === 0 && resultStats.missed === 0) && (
              <Button 
                className="mt-6 w-full sm:w-48 h-12 bg-slate-800 hover:bg-slate-900 text-white font-bold tracking-wider"
                onClick={loadNewQuestion}
              >
                下一題 →
              </Button>
            )}
          </div>
        </div>
      )}
      
      </div>
      
    </div>
  );
}
