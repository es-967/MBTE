import React from 'react';
import { ModuleProps } from '../types/TrainingModule';
import { FretboardSeventhModule as AppCore } from '../features/fretboard-seventh-quiz';

export function FretboardSeventhModule({ onHome }: ModuleProps) {
  return (
    <div className="w-full">
      <AppCore onHome={onHome} />
    </div>
  );
}
