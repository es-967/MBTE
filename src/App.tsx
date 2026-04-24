/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlatformHome } from './components/platform/PlatformHome';
import { TRAINING_MODULES } from './modules/index';
import { TrainingModule } from './types/TrainingModule';
import { ToolModal } from './components/platform/ToolModal';
import { Wrench } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [isToolOpen, setIsToolOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeModule]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative">
      <main className="container mx-auto py-4 sm:py-8 px-4 sm:px-0">
        {activeModule ? (
          <activeModule.component onHome={() => setActiveModule(null)} />
        ) : (
          <PlatformHome
            modules={TRAINING_MODULES}
            onSelectModule={setActiveModule}
          />
        )}
      </main>

      {/* Floating Tool Button */}
      <button
        onClick={() => setIsToolOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-slate-800 text-gold-400 hover:bg-slate-700 hover:text-gold-300 px-4 py-3 rounded-full shadow-lg border border-slate-700 transition-all hover:scale-105 active:scale-95 group"
      >
        <Wrench size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="font-bold text-sm tracking-wide">樂理工具箱</span>
      </button>

      <ToolModal isOpen={isToolOpen} onClose={() => setIsToolOpen(false)} />
    </div>
  );
}

