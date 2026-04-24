import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CircleDashed, ListOrdered, Guitar } from 'lucide-react';
import { SemitoneWheel } from '../../features/semitone-quiz/SemitoneWheel';
import { DegreeTool } from '../../features/degree-tool/DegreeTool';
import { FretboardTool } from '../../features/fretboard-tool/FretboardTool';

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'wheel' | 'degree' | 'fretboard';

export function ToolModal({ isOpen, onClose }: ToolModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('wheel');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-2 sm:p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex bg-slate-200/50 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-[calc(100%-48px)]">
                  <button
                    onClick={() => setActiveTab('wheel')}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === 'wheel' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <CircleDashed size={14} className="sm:w-4 sm:h-4" />
                    半音羅盤
                  </button>
                  <button
                    onClick={() => setActiveTab('degree')}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === 'degree' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ListOrdered size={14} className="sm:w-4 sm:h-4" />
                    級數對照
                  </button>
                  <button
                    onClick={() => setActiveTab('fretboard')}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === 'fretboard' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Guitar size={14} className="sm:w-4 sm:h-4" />
                    吉他指板
                  </button>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors flex-shrink-0"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-2 max-h-[80vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'wheel' ? (
                    <motion.div
                      key="wheel"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="p-4 flex justify-center">
                        <SemitoneWheel />
                      </div>
                    </motion.div>
                  ) : activeTab === 'degree' ? (
                    <motion.div
                      key="degree"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <DegreeTool />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="fretboard"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <FretboardTool />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
