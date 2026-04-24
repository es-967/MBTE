import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, Lock, Sparkles } from 'lucide-react';

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_PITCHES = [0, 2, 4, 5, 7, 9, 11]; // C=0, D=2, E=4...
const MAJOR_SCALE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];

const SCALE_DICTIONARY: Record<string, string> = {
  '0,0,0,0,0,0,0': '大調音階 (Ionian)',
  '0,0,-1,0,0,-1,-1': '小調音階 (Aeolian)',
  '0,0,-1,0,0,-1,0': '和聲小調 (Harmonic Minor)',
  '0,0,-1,0,0,0,0': '旋律小調 (Melodic Minor)',
  '0,0,-1,0,0,0,-1': 'Dorian',
  '0,-1,-1,0,0,-1,-1': 'Phrygian',
  '0,0,0,1,0,0,0': 'Lydian',
  '0,0,0,0,0,0,-1': 'Mixolydian',
  '0,-1,-1,0,-1,-1,-1': 'Locrian'
};

const TRIAD_DICTIONARY: Record<string, string> = {
  '0,0,0': 'Major (大三和弦)',
  '0,-1,0': 'Minor (小三和弦)',
  '0,0,1': 'Augmented (增三和弦)',
  '0,-1,-1': 'Diminished (減三和弦)'
};

const SEVENTH_DICTIONARY: Record<string, string> = {
  '0,0,0,0': 'Major 7th (大七和弦)',
  '0,0,0,-1': 'Dominant 7th (屬七和弦)',
  '0,-1,0,-1': 'Minor 7th (小七和弦)',
  '0,-1,-1,-1': 'm7b5 (半減七和弦)',
  '0,0,1,0': 'Maj7#5 (大七升五和弦)',
  '0,-1,0,0': 'mMaj7 (小大七和弦)',
  '0,-1,-1,-2': 'Diminished 7th (減七和弦)',
  '0,0,1,-1': 'Aug7 (增屬七和弦)'
};

type ViewMode = 'scale' | 'triad' | 'seventh' | 'diatonic';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const DIATONIC_QUALITY_SUFFIXES = ['maj', 'm', 'm', 'maj', 'maj', 'm', 'dim'];

// Pitch arrays mapped to indexes 0-11
const FLAT_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SHARP_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function parseNote(noteStr: string) {
  const letter = noteStr[0].toUpperCase();
  const acc = noteStr.slice(1);
  const letterIdx = LETTERS.indexOf(letter);
  const naturalPitch = NATURAL_PITCHES[letterIdx];
  let accValue = 0;
  for (const char of acc) {
    if (char === 'b') accValue -= 1;
    if (char === '#') accValue += 1;
  }
  return { letter, letterIdx, naturalPitch, accValue, pitch: (naturalPitch + accValue + 12) % 12 };
}

function getNoteName(letterIdx: number, pitch: number) {
  const natural = NATURAL_PITCHES[letterIdx];
  let diff = pitch - natural;
  while (diff < -6) diff += 12;
  while (diff > 5) diff -= 12;
  
  const letter = LETTERS[letterIdx];
  let accStr = '';
  if (diff === 2) {
    accStr = '𝄪';
  } else if (diff === 3) {
    accStr = '𝄪#';
  } else if (diff > 0) {
    accStr = '#'.repeat(diff);
  } else if (diff < 0) {
    accStr = 'b'.repeat(-diff);
  }
  return letter + accStr;
}

function getDegreeString(degreeNum: number, alteration: number) {
  if (alteration === 0) return degreeNum.toString();
  if (alteration === 2) return '𝄪' + degreeNum;
  if (alteration === 3) return '𝄪#' + degreeNum;
  if (alteration > 0) return '#'.repeat(alteration) + degreeNum;
  return 'b'.repeat(-alteration) + degreeNum;
}

export function DegreeTool() {
  const [keyStr, setKeyStr] = useState('C');
  const [viewMode, setViewMode] = useState<ViewMode>('scale');
  // Store the semitone deviation from the major scale for each of the 7 degrees
  const [alterations, setAlterations] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const parsedRoot = parseNote(keyStr);

  const matchedResult = (() => {
    if (viewMode === 'diatonic') return `順階和弦範例 (${keyStr} 大調)`;
    if (viewMode === 'scale') {
      const alterationsKey = alterations.join(',');
      return SCALE_DICTIONARY[alterationsKey];
    } else if (viewMode === 'triad') {
      const triadKey = [alterations[0], alterations[2], alterations[4]].join(',');
      return TRIAD_DICTIONARY[triadKey];
    } else {
      const seventhKey = [alterations[0], alterations[2], alterations[4], alterations[6]].join(',');
      return SEVENTH_DICTIONARY[seventhKey];
    }
  })();

  // Check if collision boundaries allow the degree to go sharper
  const canIncrease = (index: number) => {
    if (viewMode === 'diatonic') return true;
    if (index === 0) return false;
    const currPitch = MAJOR_SCALE_OFFSETS[index] + alterations[index];
    const nextPitch = index === 6 ? 12 : (MAJOR_SCALE_OFFSETS[index + 1] + alterations[index + 1]);
    return currPitch + 1 < nextPitch;
  };

  // Check if collision boundaries allow the degree to go flatter
  const canDecrease = (index: number) => {
    if (viewMode === 'diatonic') return true;
    if (index === 0) return false;
    const currPitch = MAJOR_SCALE_OFFSETS[index] + alterations[index];
    const prevPitch = MAJOR_SCALE_OFFSETS[index - 1] + alterations[index - 1];

    // Exception for dim7: Allow 7th to reach 7bb (pitch 9) even if its predecessor is also 9
    // Provided we are in Seventh mode and lower voices are 1, b3, b5
    if (index === 6 && viewMode === 'seventh' && alterations[0] === 0 && alterations[2] === -1 && alterations[4] === -1) {
      // 7bb is pitch 9. MAJOR_SCALE_OFFSETS[6] is 11. 11 - 2 = 9.
      return currPitch - 1 >= prevPitch;
    }

    return currPitch - 1 > prevPitch;
  };

  const changeKey = (delta: number) => {
    const currentPitch = parsedRoot.pitch;
    const targetPitch = (currentPitch + delta + 12) % 12;
    
    if (viewMode === 'scale' || viewMode === 'diatonic') {
      setKeyStr(FLAT_KEYS[targetPitch]);
    } else {
      if (delta > 0) {
        setKeyStr(SHARP_KEYS[targetPitch]);
      } else {
        setKeyStr(FLAT_KEYS[targetPitch]);
      }
    }
  };

  const changeAlt = (index: number, delta: number) => {
    if (viewMode === 'diatonic') {
      changeKey(delta);
      return;
    }
    if (index === 0) return;
    if (delta > 0 && !canIncrease(index)) return;
    if (delta < 0 && !canDecrease(index)) return;

    setAlterations(prev => {
      const next = [...prev];
      next[index] += delta;
      return next;
    });
  };

  // Generate the 7 columns data
  const columns = Array.from({ length: 7 }).map((_, i) => {
     const degreeNum = i + 1;
     const baseLetterIdx = (parsedRoot.letterIdx + i) % 7;
     
     // In diatonic mode, alterations are effectively ignored (fixed Major scale)
     const effectiveAlt = viewMode === 'diatonic' ? 0 : alterations[i];
     
     const targetStandardPitch = (parsedRoot.pitch + MAJOR_SCALE_OFFSETS[i]) % 12;
     const targetAlteredPitch = (targetStandardPitch + effectiveAlt + 12) % 12;

     let degreeStr = getDegreeString(degreeNum, effectiveAlt);
     let noteStr = getNoteName(baseLetterIdx, targetAlteredPitch);

     if (viewMode === 'diatonic') {
       degreeStr = ROMAN_NUMERALS[i] + DIATONIC_QUALITY_SUFFIXES[i];
       noteStr = noteStr + DIATONIC_QUALITY_SUFFIXES[i];
     } else if (i === 0 && viewMode !== 'scale') {
       degreeStr = 'Root';
     }

     return {
       index: i,
       degreeStr,
       noteStr,
       canInc: canIncrease(i),
       canDec: canDecrease(i),
       isRoot: i === 0 && viewMode !== 'diatonic' // in diatonic, Root is just another chord
     };
  });

  return (
    <div className="flex flex-col items-center w-full min-h-[400px] bg-white rounded-3xl p-6 overflow-hidden">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-wider">級數對照儀</h2>
        <p className="text-slate-500 text-sm">上下微調根音與各級音，學習音階與和弦的對應關係。</p>
      </div>

      <div className="flex w-full max-w-xs mb-6 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="flex w-full bg-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('scale')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'scale' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            音階
          </button>
          <button
            onClick={() => setViewMode('triad')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              viewMode === 'triad' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            三和弦
          </button>
          <button
            onClick={() => setViewMode('seventh')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              viewMode === 'seventh' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            七和弦
          </button>
          <button
            onClick={() => setViewMode('diatonic')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              viewMode === 'diatonic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            順階和弦
          </button>
        </div>
      </div>

      <div className="h-16 flex items-center justify-center w-full mb-6 px-4">
        <AnimatePresence mode="wait">
          {matchedResult ? (
            <motion.div
              key={matchedResult}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-200/50 border border-indigo-400/30 text-center"
            >
              <Sparkles size={20} className="text-amber-300 hidden sm:block" />
              <span className="font-bold text-base sm:text-lg tracking-wide">{matchedResult}</span>
              <Sparkles size={20} className="text-amber-300 hidden sm:block" />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-slate-400 font-medium text-xs sm:text-sm flex items-center gap-2"
            >
              嘗試上下調整，找出特定的{viewMode === 'scale' ? '音階' : '和弦'}...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex w-full overflow-x-auto pb-4 px-2 snap-x justify-start sm:justify-center items-center gap-2 no-scrollbar">
         {columns
           .filter(col => {
             if (viewMode === 'triad') return [0, 2, 4].includes(col.index);
             if (viewMode === 'seventh') return [0, 2, 4, 6].includes(col.index);
             return true;
           })
           .map((col) => (
           <div 
             key={col.index} 
             className={`flex flex-col items-center shrink-0 w-16 sm:w-20 ${col.isRoot ? 'bg-slate-100' : 'bg-slate-50 hover:bg-slate-100/80'} rounded-2xl py-3 border border-slate-200/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] transition-colors`}
           >
             {/* Degree Section */}
             <div className="flex flex-col items-center w-full relative">
               <button 
                 onClick={() => changeAlt(col.index, 1)}
                 disabled={!col.canInc || col.isRoot}
                 className={`p-1 rounded-lg transition-all ${col.isRoot ? 'opacity-0' : col.canInc ? 'text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700 active:scale-90' : 'text-slate-200 cursor-not-allowed'}`}
               >
                 <ChevronUp size={24} />
               </button>
               
               <div className="h-10 flex items-center justify-center">
                 <motion.div 
                   key={col.degreeStr}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`text-xl sm:text-2xl font-black ${col.isRoot ? 'text-slate-800' : 'text-indigo-600'}`}
                 >
                   {col.degreeStr}
                 </motion.div>
               </div>
               
               <button 
                 onClick={() => changeAlt(col.index, -1)}
                 disabled={!col.canDec || col.isRoot}
                 className={`p-1 rounded-lg transition-all ${col.isRoot ? 'opacity-0' : col.canDec ? 'text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700 active:scale-90' : 'text-slate-200 cursor-not-allowed'}`}
               >
                 <ChevronDown size={24} />
               </button>
             </div>

             {/* Divider */}
             <div className="w-10 h-px bg-slate-200 my-2 relative">
               {col.isRoot && <Lock size={12} className="absolute left-1/2 -top-1.5 -ml-1.5 text-slate-300 bg-slate-100 px-0.5" />}
             </div>

             {/* Note Section */}
             <div className="flex flex-col items-center w-full">
               <button 
                 onClick={() => col.isRoot ? changeKey(1) : changeAlt(col.index, 1)}
                 disabled={col.isRoot ? false : !col.canInc}
                 className={`p-1 rounded-lg transition-all ${col.isRoot || col.canInc ? 'text-emerald-400 hover:bg-emerald-100 hover:text-emerald-700 active:scale-90' : 'text-slate-200 cursor-not-allowed'}`}
               >
                 <ChevronUp size={24} />
               </button>
               
               <div className="h-10 flex items-center justify-center">
                 <motion.div 
                   key={col.noteStr}
                   initial={{ opacity: 0, y: -5 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`text-xl sm:text-2xl font-black ${col.isRoot ? 'text-slate-800' : 'text-emerald-600'}`}
                 >
                   {col.noteStr}
                 </motion.div>
               </div>
               
               <button 
                 onClick={() => col.isRoot ? changeKey(-1) : changeAlt(col.index, -1)}
                 disabled={col.isRoot ? false : !col.canDec}
                 className={`p-1 rounded-lg transition-all ${col.isRoot || col.canDec ? 'text-emerald-400 hover:bg-emerald-100 hover:text-emerald-700 active:scale-90' : 'text-slate-200 cursor-not-allowed'}`}
               >
                 <ChevronDown size={24} />
               </button>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
