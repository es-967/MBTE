import React from 'react';
import { ModuleProps } from '../types/TrainingModule';
import { FretboardTriadModule as AppCore } from '../features/fretboard-triad-quiz';

export function FretboardTriadModule({ onHome }: ModuleProps) {
  return (
    <div className="w-full">
      <AppCore onHome={onHome} />
    </div>
  );
}
