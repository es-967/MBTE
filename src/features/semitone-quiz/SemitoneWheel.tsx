import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, animate, useTransform } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { Disc, LayoutList, Music } from 'lucide-react';

const NOTES = [
  { index: 0, natural: 'C', sharp: 'C', flat: 'C', isAccidental: false },
  { index: 1, natural: '', sharp: 'C#', flat: 'Db', isAccidental: true },
  { index: 2, natural: 'D', sharp: 'D', flat: 'D', isAccidental: false },
  { index: 3, natural: '', sharp: 'D#', flat: 'Eb', isAccidental: true },
  { index: 4, natural: 'E', sharp: 'E', flat: 'E', isAccidental: false },
  { index: 5, natural: 'F', sharp: 'F', flat: 'F', isAccidental: false },
  { index: 6, natural: '', sharp: 'F#', flat: 'Gb', isAccidental: true },
  { index: 7, natural: 'G', sharp: 'G', flat: 'G', isAccidental: false },
  { index: 8, natural: '', sharp: 'G#', flat: 'Ab', isAccidental: true },
  { index: 9, natural: 'A', sharp: 'A', flat: 'A', isAccidental: false },
  { index: 10, natural: '', sharp: 'A#', flat: 'Bb', isAccidental: true },
  { index: 11, natural: 'B', sharp: 'B', flat: 'B', isAccidental: false },
];

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const FLAT_ROOTS = [5, 10, 3, 8, 1, 6]; // F, Bb, Eb, Ab, Db, Gb

const GUITAR_STRINGS = [
  { name: 'E2', noteIndex: 4, stringNum: 6 },
  { name: 'A', noteIndex: 9, stringNum: 5 },
  { name: 'D', noteIndex: 2, stringNum: 4 },
  { name: 'G', noteIndex: 7, stringNum: 3 },
  { name: 'B', noteIndex: 11, stringNum: 2 },
  { name: 'E4', noteIndex: 4, stringNum: 1 },
];

const CELL_WIDTH = 80;

function WheelText({ note, angle, isRoot, isMajorScale, showMajorScale, wheelRotation }: any) {
  const textRotation = useTransform(wheelRotation, (r: number) => -(angle + r));
  
  let textColor = 'text-slate-300';
  if (isRoot) textColor = 'text-slate-900';
  else if (showMajorScale && isMajorScale) textColor = 'text-white';
  else if (showMajorScale) textColor = 'text-slate-600';

  return (
    <div 
      className="absolute top-0 left-1/2 w-12 h-1/2 origin-bottom -ml-6 flex flex-col items-center pt-3"
      style={{ transform: `rotate(${angle}deg)` }}
    >
      <motion.div 
        className={`flex flex-col items-center justify-center font-bold ${textColor}`}
        style={{ rotate: textRotation }}
      >
        {isRoot && <span className="text-[8px] uppercase tracking-widest mb-0.5 opacity-80">根音</span>}
        {note.isAccidental ? (
          <div className="flex flex-col items-center leading-none">
            <span className="text-sm">{note.sharp}</span>
            <span className="text-xs opacity-70">{note.flat}</span>
          </div>
        ) : (
          <span className="text-lg">{note.natural}</span>
        )}
      </motion.div>
    </div>
  );
}

export function SemitoneWheel() {
  const [basePosition, setBasePosition] = useState(0);
  const [rootPosition, setRootPosition] = useState(0);
  const [viewMode, setViewMode] = useState<'band' | 'wheel'>('band');
  const [showMajorScale, setShowMajorScale] = useState(false);
  const [guitarInfo, setGuitarInfo] = useState<string | null>(null);
  const [accidentalMode, setAccidentalMode] = useState<'sharp' | 'flat'>('sharp');

  const dragX = useMotionValue(0);
  const wheelDragX = useMotionValue(0);

  const handleDragEnd = (e: any, info: any) => {
    const offset = dragX.get();
    const projected = offset + info.velocity.x * 0.2;
    const diff = Math.round(-projected / CELL_WIDTH);
    const targetX = -diff * CELL_WIDTH;

    animate(dragX, targetX, { type: 'spring', stiffness: 300, damping: 30 }).then(() => {
      setBasePosition(prev => prev + diff);
      dragX.set(0);
    });
  };

  const handleWheelDragEnd = (e: any, info: any) => {
    const offset = wheelDragX.get();
    const projected = offset + info.velocity.x * 0.2;
    const diff = Math.round(-projected / 60);
    const targetX = -diff * 60;

    animate(wheelDragX, targetX, { type: 'spring', stiffness: 300, damping: 30 }).then(() => {
      setBasePosition(prev => prev + diff);
      wheelDragX.set(0);
    });
  };

  const wheelRotation = useTransform(wheelDragX, x => -basePosition * 30 + (x / 2));

  const rootMod = ((rootPosition % 12) + 12) % 12;
  const useFlats = FLAT_ROOTS.includes(rootMod);

  const scaleNotes = MAJOR_SCALE_INTERVALS.map(interval => {
    const noteIndex = (rootMod + interval) % 12;
    const note = NOTES[noteIndex];
    if (!note.isAccidental) return note.natural;
    return useFlats ? note.flat : note.sharp;
  });

  const visibleNotes = [];
  for (let i = basePosition - 10; i <= basePosition + 10; i++) {
    const noteIndex = ((i % 12) + 12) % 12;
    visibleNotes.push({ absolutePosition: i, note: NOTES[noteIndex] });
  }

  const navigateToNote = (targetIndex: number, info?: string) => {
    const currentMod = ((basePosition % 12) + 12) % 12;
    let diff = targetIndex - currentMod;
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;
    const newPos = basePosition + diff;
    
    if (viewMode === 'band') {
      const pixelDiff = diff * CELL_WIDTH;
      animate(dragX, -pixelDiff, { type: 'spring', stiffness: 300, damping: 30 }).then(() => {
        setBasePosition(newPos);
        setRootPosition(newPos);
        dragX.set(0);
      });
    } else {
      const pixelDiff = diff * 60;
      animate(wheelDragX, -pixelDiff, { type: 'spring', stiffness: 300, damping: 30 }).then(() => {
        setBasePosition(newPos);
        setRootPosition(newPos);
        wheelDragX.set(0);
      });
    }
    
    if (info) setGuitarInfo(info);
    else setGuitarInfo(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 text-slate-100 font-sans">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">全半音互動參考工具</h2>
        <p className="text-slate-400 text-sm">探索音符之間的距離與大調音階的奧秘</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <Button 
          variant={viewMode === 'band' ? 'default' : 'outline'}
          className={viewMode === 'band' ? 'bg-gold-500 hover:bg-gold-600 text-slate-900 border-gold-500' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}
          onClick={() => setViewMode('band')}
        >
          <LayoutList size={18} className="mr-2" /> 橫向音帶
        </Button>
        <Button 
          variant={viewMode === 'wheel' ? 'default' : 'outline'}
          className={viewMode === 'wheel' ? 'bg-gold-500 hover:bg-gold-600 text-slate-900 border-gold-500' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}
          onClick={() => setViewMode('wheel')}
        >
          <Disc size={18} className="mr-2" /> 轉成圓盤
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-1.5 mb-4 items-center">
          {NOTES.map(note => (
            <button 
              key={note.index}
              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all border
                ${rootMod === note.index 
                  ? 'bg-gold-500 text-slate-900 border-gold-400 shadow-[0_0_15px_rgba(201,185,122,0.4)] scale-110 z-10' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}
              `}
              onClick={() => navigateToNote(note.index)}
            >
              {note.natural || (accidentalMode === 'sharp' ? note.sharp : note.flat)}
            </button>
          ))}
          <div className="w-px h-8 bg-slate-700 mx-2 hidden sm:block"></div>
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => setAccidentalMode(prev => prev === 'sharp' ? 'flat' : 'sharp')}
          >
            切換 {accidentalMode === 'sharp' ? '降記號 (b)' : '升記號 (#)'}
          </Button>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2">
          <span className="text-slate-500 text-xs mr-2">吉他空弦快速鍵:</span>
          {GUITAR_STRINGS.map((str, idx) => (
            <button 
              key={`${str.name}-${idx}`}
              className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:bg-slate-700 hover:text-white transition-colors"
              onClick={() => navigateToNote(str.noteIndex, `這是吉他第 ${str.stringNum} 弦空弦音`)}
            >
              {str.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
        {viewMode === 'band' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
          >
            <div className="relative w-full h-32 overflow-hidden flex justify-center items-center bg-slate-800/50 rounded-xl border border-slate-700 shadow-inner">
              <motion.div 
                className="flex absolute cursor-grab active:cursor-grabbing"
                style={{ x: dragX }}
                drag="x"
                onDragStart={() => setGuitarInfo(null)}
                onDragEnd={handleDragEnd}
              >
                {visibleNotes.map(item => {
                  const isAccidental = item.note.isAccidental;
                  const hasHalfStepMarker = item.note.index === 4 || item.note.index === 11;
                  const interval = ((item.absolutePosition - basePosition) % 12 + 12) % 12;
                  const isMajorScale = showMajorScale && MAJOR_SCALE_INTERVALS.includes(interval);
                  const isRoot = interval === 0;
                  
                  let bgClass = isAccidental ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-700/80 text-slate-100 hover:bg-slate-600';
                  if (showMajorScale) {
                    if (isRoot) bgClass = 'bg-gold-500/20 text-gold-400 border-gold-500/50';
                    else if (isMajorScale) bgClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                    else bgClass = 'bg-slate-900/80 text-slate-600';
                  }

                  return (
                    <div 
                      key={item.absolutePosition}
                      className={`relative flex flex-col items-center justify-center h-24 border-x border-slate-700/50 transition-colors ${bgClass}`}
                      style={{ width: CELL_WIDTH }}
                    >
                      {isAccidental ? (
                        <>
                          <span className="text-sm font-mono">{item.note.sharp}</span>
                          <span className="text-xs opacity-50 font-mono">{item.note.flat}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold font-mono">{item.note.natural}</span>
                      )}
                      
                      {hasHalfStepMarker && (
                        <div className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-10 bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-md border border-slate-600 shadow-sm pointer-events-none whitespace-nowrap">
                          半音
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
              
              <div className="absolute top-0 bottom-0 w-1 bg-gold-500 z-10 pointer-events-none shadow-[0_0_15px_rgba(201,185,122,0.6)]" />
            </div>

            <div className="h-20 mt-4 flex justify-center items-start">
              {guitarInfo && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-3 bg-indigo-900/40 rounded-xl border border-indigo-500/30 text-center text-indigo-300 font-bold shadow-lg"
                >
                  🎸 {guitarInfo}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {viewMode === 'wheel' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full flex flex-col items-center"
          >
            <div className="relative w-72 h-72">
              <motion.div 
                className="absolute inset-0 z-20 rounded-full cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                onDragStart={() => setGuitarInfo(null)}
                onDrag={(e, info) => {
                  wheelDragX.set(info.offset.x);
                }}
                onDragEnd={handleWheelDragEnd}
              />
              
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                style={{ rotate: wheelRotation }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                  {NOTES.map((note, i) => {
                    const startAngle = (i * 30 - 15) * Math.PI / 180;
                    const endAngle = (i * 30 + 15) * Math.PI / 180;
                    const x1 = 50 + 50 * Math.sin(startAngle);
                    const y1 = 50 - 50 * Math.cos(startAngle);
                    const x2 = 50 + 50 * Math.sin(endAngle);
                    const y2 = 50 - 50 * Math.cos(endAngle);
                    
                    const isMajorScale = showMajorScale && MAJOR_SCALE_INTERVALS.includes((i - rootMod + 12) % 12);
                    const isRoot = (i === rootMod);
                    
                    let fill = note.isAccidental ? '#1e293b' : '#334155';
                    if (showMajorScale) {
                      if (isRoot) fill = '#c9b97a';
                      else if (isMajorScale) fill = '#3b82f6';
                      else fill = '#0f172a';
                    } else if (isRoot) {
                      fill = '#c9b97a';
                    }

                    return (
                      <path 
                        key={i}
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
                        fill={fill} 
                        stroke="#0f172a"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </svg>
                
                {NOTES.map((note, i) => {
                  const angle = i * 30;
                  const isRoot = (i === rootMod);
                  const isMajorScale = showMajorScale && MAJOR_SCALE_INTERVALS.includes((i - rootMod + 12) % 12);
                  
                  return (
                    <WheelText 
                      key={i}
                      note={note}
                      angle={angle}
                      isRoot={isRoot}
                      isMajorScale={isMajorScale}
                      showMajorScale={showMajorScale}
                      wheelRotation={wheelRotation}
                    />
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="h-20 mt-4 flex justify-center items-start w-full">
        {!showMajorScale && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-3 bg-slate-800 rounded-xl border border-slate-700 text-center shadow-lg"
          >
            {(() => {
              const distance = Math.abs(basePosition - rootPosition) % 12;
              const rootNote = NOTES[((rootPosition % 12) + 12) % 12];
              const selNote = NOTES[((basePosition % 12) + 12) % 12];
              const rootName = rootNote.natural || (accidentalMode === 'sharp' ? rootNote.sharp : rootNote.flat);
              const selName = selNote.natural || (accidentalMode === 'sharp' ? selNote.sharp : selNote.flat);

              if (distance === 0) return <span className="text-gold-400 font-bold">起始音設定為 {rootName}</span>;
              
              const distLabel = distance === 1 ? '半音' : distance === 2 ? '全音' : `${distance} 個半音`;
              const badgeClass = distance === 1 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                                 distance === 2 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                                 'bg-slate-700 text-slate-300 border-slate-600';

              return (
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">從起始音 <strong className="text-white">{rootName}</strong> 到 <strong className="text-white">{selName}</strong> 的距離是</span>
                  <span className={`px-3 py-1 rounded-full font-bold border ${badgeClass}`}>{distLabel}</span>
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          variant={showMajorScale ? 'default' : 'outline'}
          className={showMajorScale ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
          onClick={() => setShowMajorScale(!showMajorScale)}
        >
          <Music size={18} className="mr-2" /> {showMajorScale ? '隱藏大調音階' : '顯示大調音階'}
        </Button>
      </div>

      {showMajorScale && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 w-full max-w-2xl mx-auto"
        >
          <h4 className="text-center text-gold-400 font-bold mb-6 flex items-center justify-center gap-2">
            <Music size={18} /> 大調音階公式
          </h4>
          
          <div className="flex items-center justify-center gap-1 md:gap-2 font-mono overflow-x-auto pb-4">
            {scaleNotes.map((note, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    {note}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center w-6 md:w-10">
                  <span className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    (i === 2 || i === 6) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {(i === 2 || i === 6) ? '半' : '全'}
                  </span>
                  <div className="h-px w-full bg-slate-700 mt-2"></div>
                </div>
              </React.Fragment>
            ))}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {scaleNotes[0]}
              </div>
            </div>
          </div>
          
          <p className="text-center text-slate-400 text-sm mt-4">
            不管從哪個音開始，間隔永遠是 <strong className="text-slate-200">全-全-半-全-全-全-半</strong>
          </p>
        </motion.div>
      )}
    </div>
  );
}
