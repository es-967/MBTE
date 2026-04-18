import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { SemitoneWheel } from '../../features/semitone-quiz/SemitoneWheel';

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToolModal({ isOpen, onClose }: ToolModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto rounded-3xl shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <SemitoneWheel />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
