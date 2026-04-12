/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlatformHome } from './components/platform/PlatformHome';
import { TRAINING_MODULES } from './modules/index';
import { TrainingModule } from './types/TrainingModule';

export default function App() {
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);

  if (activeModule) {
    const ModuleComponent = activeModule.component;
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <main className="container mx-auto py-8">
          <ModuleComponent onHome={() => setActiveModule(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <main className="container mx-auto py-8">
        <PlatformHome
          modules={TRAINING_MODULES}
          onSelectModule={setActiveModule}
        />
      </main>
    </div>
  );
}

