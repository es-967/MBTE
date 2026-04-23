import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MousePointer2, GitCommitHorizontal, ListMusic, Hash, Type } from 'lucide-react';

const STRINGS = [64, 59, 55, 50, 45, 40]; // E4, B3, G3, D3, A2, E2
const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'];
const FRETS = 16; // 0 to 15
const MARKERS = [3, 5, 7, 9, 12, 15];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getNoteName = (pitch: number) => {
  return NOTE_NAMES[pitch % 12];
};

const INTERVAL_NAMES = [
  '完全一度', '小二度', '大二度', '小三度', '大三度', '完全四度',
  '減五/增四', '完全五度', '小六度', '大六度', '小七度', '大七度'
];

const EXTENDED_INTERVALS = [
  '完全八度', '小九度', '大九度', '小十度(小三度)', '大十度(大三度)', '完全十一度',
  '增十一/減十二度', '完全十二度(完全五度)', '小十三度', '大十三度', '小十四度(小七度)', '大十四度(大七度)'
];

const getIntervalName = (semitones: number) => {
  const octaves = Math.floor(semitones / 12);
  const remainder = semitones % 12;
  
  if (octaves === 0) return INTERVAL_NAMES[remainder];
  return EXTENDED_INTERVALS[remainder];
};

type Mode = 'absolute' | 'interval' | 'chord';
type DisplayMode = 'note' | 'degree';

type ChordType = 'maj' | 'm' | '7' | 'm7' | 'maj7' | 'm7b5' | 'dim7' | 'aug';

const getDegreeLabel = (diff: number, chordType?: ChordType) => {
  const norm = ((diff % 12) + 12) % 12;
  if (chordType === 'dim7' && norm === 9) return 'bb7';
  if (chordType === 'aug' && norm === 8) return '#5';
  
  const labels = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
  return labels[norm];
};

const CHORD_TYPES: { key: ChordType; name: string }[] = [
  { key: 'maj', name: '大三 (maj)' },
  { key: 'm', name: '小三 (m)' },
  { key: '7', name: '屬七 (7)' },
  { key: 'm7', name: '小七 (m7)' },
  { key: 'maj7', name: '大七 (maj7)' },
  { key: 'm7b5', name: '半減七 (m7b5)' },
  { key: 'dim7', name: '減七 (dim7)' },
  { key: 'aug', name: '增三 (aug)' }
];

// String 6 (idx 5), String 5 (idx 4), String 4 (idx 3)
type StringOffsets = (number | 'X')[];
const CHORD_SHAPES: Record<string, Record<number, StringOffsets>> = {
  'maj': {
    5: [0, 2, 2, 1, 0, 0],
    4: ['X', 0, 2, 2, 2, 0],
    3: ['X', 'X', 0, 2, 3, 2],
    2: ['X', 'X', 0, 0, 0, 3],
    1: ['X', 'X', 1, -1, 0, 'X'],
  },
  'm': {
    5: [0, 2, 2, 0, 0, 0],
    4: ['X', 0, 2, 2, 1, 0],
    3: ['X', 'X', 0, 2, 3, 1],
    2: ['X', 'X', 0, 0, -1, 'X'],
    1: ['X', 'X', 0, -1, 0, 'X'],
  },
  '7': {
    5: [0, 2, 0, 1, 0, 0],
    4: ['X', 0, 2, 0, 2, 0],
    3: ['X', 'X', 0, 2, 1, 2],
    2: ['X', 'X', 0, 0, 0, 1],
    1: ['X', 2, 1, 2, 0, 'X'],
  },
  'm7': {
    5: [0, 2, 0, 0, 0, 0],
    4: ['X', 0, 2, 0, 1, 0],
    3: ['X', 'X', 0, 2, 1, 1],
    2: ['X', 'X', 0, 0, -1, 1],
    1: ['X', 2, 0, 2, 0, 'X'],
  },
  'maj7': {
    5: [0, 'X', 1, 1, 0, 'X'],
    4: ['X', 0, 2, 1, 2, 0],
    3: ['X', 'X', 0, 2, 2, 2],
    2: ['X', 'X', 0, 0, 0, 2],
    1: ['X', 2, 1, -1, -1, -1],
  },
  'm7b5': {
    5: [0, 'X', 0, 0, -1, 'X'],
    4: ['X', 0, 1, 0, 1, 'X'],
    3: ['X', 'X', 0, 1, 1, 1],
    2: ['X', 'X', -1, 0, -1, 1],
    1: ['X', 'X', 0, 2, 0, 1],
  },
  'dim7': {
    5: [0, 'X', -1, 0, -1, 'X'],
    4: ['X', 0, 1, -1, 1, 'X'],
    3: ['X', 'X', 0, 1, 0, 1],
    2: ['X', 'X', -1, 0, -1, 0],
    1: ['X', 'X', 0, 1, 0, 1],
  },
  'aug': {
    5: [0, 'X', 2, 1, 1, 'X'],
    4: ['X', 0, 3, 2, 2, 'X'],
    3: ['X', 'X', 0, 3, 3, 2],
    2: ['X', 'X', 1, 0, 0, 'X'],
    1: ['X', 'X', 1, 0, 0, 'X'],
  }
};

interface Pos {
  stringIdx: number;
  fret: number;
}

export function FretboardTool() {
  const [mode, setMode] = useState<Mode>('chord');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('degree');
  const [selectedPos, setSelectedPos] = useState<Pos[]>([]);
  const [chordType, setChordType] = useState<ChordType>('maj');

  useEffect(() => {
    if (mode === 'absolute') {
      setDisplayMode('note');
    } else {
      setDisplayMode('degree');
    }
  }, [mode]);

  const handleFretClick = (stringIdx: number, fret: number) => {
    if (mode === 'absolute') {
      setSelectedPos([{ stringIdx, fret }]);
    } else if (mode === 'interval') {
      setSelectedPos(prev => {
        if (prev.length === 2) return [{ stringIdx, fret }]; // Reset
        const alreadySelected = prev.find(p => p.stringIdx === stringIdx && p.fret === fret);
        if (alreadySelected) return prev.filter(p => !(p.stringIdx === stringIdx && p.fret === fret));
        return [...prev, { stringIdx, fret }];
      });
    } else if (mode === 'chord') {
      setSelectedPos([{ stringIdx, fret }]);
    }
  };

  const isSelected = (sIdx: number, f: number) => {
    return selectedPos.some(p => p.stringIdx === sIdx && p.fret === f);
  };

  const renderFretboard = () => {
    // Generate active chord shape if in chord mode
    let chordPositions: Pos[] = [];
    if (mode === 'chord' && selectedPos.length === 1) {
      const root = selectedPos[0];
      const shapeStringIdx = root.stringIdx === 0 ? 5 : root.stringIdx;
      const offsets = CHORD_SHAPES[chordType][shapeStringIdx];
      if (offsets) {
        offsets.forEach((offset, idx) => {
          if (offset !== 'X') {
            const actualFret = root.fret + (offset as number);
            if (actualFret >= 0 && actualFret <= FRETS) {
              chordPositions.push({ stringIdx: 5 - idx, fret: actualFret }); // 5 - idx maps offset back to strings 6..1
            }
          }
        });
      }
    }

    const isChordValid = mode === 'chord' ? chordPositions.some(p => p.fret === selectedPos[0]?.fret && p.stringIdx === selectedPos[0]?.stringIdx) : true;

    return (
      <div className="relative w-full overflow-x-auto select-none rounded-xl bg-slate-800 p-2 sm:p-4 border-4 border-slate-900 shadow-2xl">
        <div className="min-w-[700px] flex text-white relative">
          
          {/* Fret numbers overlay */}
          <div className="absolute top-0 left-8 flex w-[calc(100%-2rem)] h-6 z-10">
            {Array.from({ length: FRETS + 1 }).map((_, f) => (
              <div key={f} className="flex-1 flex justify-center text-[10px] text-slate-400 font-bold opacity-50">
                {f}
              </div>
            ))}
          </div>

          <div className="flex flex-col mt-6 w-full gap-[3px]">
            {STRINGS.map((openPitch, sIdx) => (
              <div key={sIdx} className="flex items-center group relative h-6">
                {/* String Label */}
                <div className="w-8 text-xs font-bold text-slate-400 text-center font-mono relative z-20">
                  {STRING_NAMES[sIdx]}
                </div>
                
                {/* Visual String Line */}
                <div className="absolute right-0 w-[calc(100%-2rem)] h-[1px] bg-gradient-to-r from-slate-600 via-slate-400 to-slate-500 shadow-sm top-1/2 -translate-y-1/2 pointer-events-none z-10" 
                     style={{ height: `${1 + (5 - sIdx) * 0.4}px` }} />

                {/* Frets */}
                <div className="flex flex-1 relative z-20">
                  {Array.from({ length: FRETS + 1 }).map((_, f) => {
                    const pitch = openPitch + f;
                    const isClicked = isSelected(sIdx, f);
                    const isChordTarget = mode === 'chord' && chordPositions.some(p => p.stringIdx === sIdx && p.fret === f);
                    const isRoot = mode === 'chord' && isClicked;
                    
                    // Absolute mode: highlight octaves
                    const isOctaveHighlight = mode === 'absolute' && selectedPos.length === 1 && ((pitch % 12) === ((STRINGS[selectedPos[0].stringIdx] + selectedPos[0].fret) % 12));

                    const rootPitchClass = mode === 'chord' && selectedPos.length > 0 ? (STRINGS[selectedPos[0].stringIdx] + selectedPos[0].fret) % 12 : -1;
                    const isRootColor = mode === 'chord' && isChordTarget && ((pitch % 12) === rootPitchClass);

                    let dotClass = 'opacity-0 scale-50 group-hover:opacity-30 group-hover:scale-75';
                    if (isClicked) dotClass = 'opacity-100 scale-100 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]';
                    if (isOctaveHighlight && !isClicked) dotClass = 'opacity-100 scale-90 bg-indigo-500/80 border border-indigo-300';
                    if (mode === 'chord') {
                      if (isRootColor) dotClass = 'opacity-100 scale-100 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] border border-rose-400';
                      else if (isChordTarget) dotClass = 'opacity-100 scale-100 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]';
                    }

                    // Determine label
                    let label = getNoteName(pitch);
                    if (displayMode === 'degree' && selectedPos.length > 0) {
                      if (mode === 'chord') {
                        if (isChordTarget || isRootColor) {
                          const rootPitch = STRINGS[selectedPos[0].stringIdx] + selectedPos[0].fret;
                          label = getDegreeLabel(pitch - rootPitch, chordType);
                        }
                      } else if (mode === 'interval') {
                        if (isClicked) {
                          if (selectedPos.length === 2) {
                            const pA = STRINGS[selectedPos[0].stringIdx] + selectedPos[0].fret;
                            const pB = STRINGS[selectedPos[1].stringIdx] + selectedPos[1].fret;
                            const rootPitch = Math.min(pA, pB);
                            label = getDegreeLabel(pitch - rootPitch);
                          }
                          // Wait for second click to show degree in interval mode
                        }
                      }
                    }

                    return (
                      <div 
                        key={f} 
                        onClick={() => handleFretClick(sIdx, f)}
                        className={`flex-1 flex justify-center items-center h-full cursor-pointer relative border-r border-slate-700 ${f === 0 ? 'border-r-4 border-r-slate-300 bg-slate-900/40' : 'hover:bg-white/5'}`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 text-[10px] font-bold text-white z-30 ${dotClass}`}>
                          {(isClicked || isOctaveHighlight || isChordTarget) && label}
                        </div>
                        
                        {/* Fret Markers */}
                        {sIdx === 2 && MARKERS.includes(f) && f !== 12 && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-600/50 pointer-events-none -z-10" />
                        )}
                        {sIdx === 2 && f === 12 && (
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
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getInfoDisplay = () => {
    if (mode === 'absolute') {
      if (selectedPos.length === 1) {
        const p = selectedPos[0];
        const pitch = STRINGS[p.stringIdx] + p.fret;
        return (
          <div className="text-center animate-in slide-in-from-top-2">
            <div className="text-3xl font-black text-indigo-600 mb-1">{getNoteName(pitch)}</div>
            <div className="text-sm font-medium text-slate-500">
              第 {6 - p.stringIdx} 弦, 第 {p.fret} 格
            </div>
          </div>
        );
      }
      return <div className="text-slate-400 font-medium">請點擊指板上的任意位置來顯示絕對音高</div>;
    }

    if (mode === 'interval') {
      if (selectedPos.length === 2) {
        let p1 = STRINGS[selectedPos[0].stringIdx] + selectedPos[0].fret;
        let p2 = STRINGS[selectedPos[1].stringIdx] + selectedPos[1].fret;
        
        let label1 = getNoteName(p1);
        let label2 = getNoteName(p2);

        if (p1 > p2) {
          const temp = p1;
          p1 = p2;
          p2 = temp;
          label1 = getNoteName(p1);
          label2 = getNoteName(p2);
        }
        const diff = p2 - p1;
        
        if (displayMode === 'degree') {
          // p1 is always root '1' in display because we ordered it low to high
          label1 = '1';
          label2 = getDegreeLabel(diff);
        }

        return (
          <div className="text-center animate-in slide-in-from-top-2">
            <div className="font-bold text-slate-800 flex items-center justify-center gap-3 mb-2">
              <span className="text-xl bg-slate-100 px-3 py-1 rounded-lg shadow-sm border border-slate-200">{label1}</span>
              <span className="text-slate-400 font-black">→</span>
              <span className="text-xl bg-slate-100 px-3 py-1 rounded-lg shadow-sm border border-slate-200">{label2}</span>
            </div>
            <div className="text-2xl font-black text-amber-600">
              {getIntervalName(diff)}
            </div>
          </div>
        );
      }
      return <div className="text-slate-400 font-medium">請點擊兩個格子來測量音程距離</div>;
    }

    if (mode === 'chord') {
      if (selectedPos.length === 1) {
        const p = selectedPos[0];
        const pitch = STRINGS[p.stringIdx] + p.fret;
        return (
          <div className="text-center animate-in slide-in-from-top-2">
            <div className="text-3xl font-black text-rose-600 mb-1">
              {getNoteName(pitch)}{chordType}
            </div>
            <div className="text-sm font-medium text-slate-500">
              根音: 第 {6 - p.stringIdx} 弦, 第 {p.fret} 格
            </div>
          </div>
        );
      }
      return <div className="text-slate-400 font-medium">請選擇任意一弦作為和弦根音</div>;
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-white rounded-3xl p-6 overflow-hidden">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-wider">吉他指板</h2>
        <p className="text-slate-500 text-sm">探索吉他上的音符對應與和弦按法。</p>
      </div>

      <div className="flex items-start gap-4 w-full max-w-2xl mb-4">
        <div className="flex-1 flex flex-col bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <div className="flex">
            <button
              onClick={() => { setMode('absolute'); setSelectedPos([]); }}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'absolute' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MousePointer2 size={16} />
              絕對音
            </button>
            <button
              onClick={() => { setMode('interval'); setSelectedPos([]); }}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'interval' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GitCommitHorizontal size={16} />
              音程
            </button>
            <button
              onClick={() => { setMode('chord'); setSelectedPos([]); }}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'chord' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ListMusic size={16} />
              和弦
            </button>
          </div>

          {/* Chord Type Selector */}
          {mode === 'chord' && (
            <div className="mt-3 grid grid-cols-4 gap-1 p-1 bg-slate-200 rounded-xl">
              {CHORD_TYPES.map(type => (
                <button
                  key={type.key}
                  onClick={() => setChordType(type.key)}
                  className={`py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${
                    chordType === type.key
                      ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/50'
                  }`}
                >
                  {type.key}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Display mode toggle */}
        {(mode === 'interval' || mode === 'chord') && (
          <div className="flex flex-col gap-1.5 self-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">顯示</span>
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setDisplayMode('note')}
                className={`flex gap-1.5 items-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  displayMode === 'note' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Type size={14} />
                音名
              </button>
              <button
                onClick={() => setDisplayMode('degree')}
                className={`flex gap-1.5 items-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  displayMode === 'degree' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Hash size={14} />
                級數
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="h-20 flex items-center justify-center w-full mb-2">
        {getInfoDisplay()}
      </div>

      <div className="w-full">
        {renderFretboard()}
        
        {/* String numbering hint */}
        <div className="mt-2 text-xs text-slate-400 font-medium text-right pr-4">
          標準調弦 (E A D G B E)
        </div>
      </div>
    </div>
  );
}
