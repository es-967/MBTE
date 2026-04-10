import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TUTORIAL_CONTENT } from '../../lib/music/data';
import { useGameStore } from '../../store/useGameStore';

export function Tutorial() {
  const { level } = useGameStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  const tutorials = [
    { key: 'basic_major', unlockLevel: 1 },
    { key: 'sharps_flats', unlockLevel: 3 },
    { key: 'minor_scales', unlockLevel: 6 },
    { key: 'advanced_scales', unlockLevel: 9 },
  ];

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-bold text-gray-900">📚 不會嗎?那先看這裡</h3>
      <div className="space-y-2">
        {tutorials.map(({ key, unlockLevel }) => {
          if (level < unlockLevel) return null;
          const content = TUTORIAL_CONTENT[key];
          const isExpanded = expanded === key;

          return (
            <div key={key} className="border rounded-lg bg-white overflow-hidden">
              <button
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggle(key)}
              >
                <span className="font-medium text-gray-900">❓ {content.title}</span>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {isExpanded && (
                <div className="p-4 text-gray-700 prose prose-sm max-w-none">
                  {content.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <strong key={i} className="block mt-2">{line.replace(/\*\*/g, '')}</strong>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                    }
                    return <p key={i} className="my-1">{line}</p>;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
