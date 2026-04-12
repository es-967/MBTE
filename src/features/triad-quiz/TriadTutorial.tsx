import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGameStore, defaultProgress } from '../../store/useGameStore';

const TUTORIAL_CONTENT = [
  {
    title: '什麼是三和弦 (Triad)？',
    content: '三和弦是由三個音組成的和弦，分別是「根音 (Root)」、「三音 (3rd)」和「五音 (5th)」。根音決定了和弦的名稱，三音和五音則決定了和弦的性質（大、小、增、減）。'
  },
  {
    title: '大三和弦 (Major Triad)',
    content: '大三和弦聽起來明亮、開心。結構是：根音 + 大三度 (4個半音) + 小三度 (3個半音)。\n例如 C大三和弦 (C Maj)：C - E - G。'
  },
  {
    title: '小三和弦 (Minor Triad)',
    content: '小三和弦聽起來悲傷、暗淡。結構是：根音 + 小三度 (3個半音) + 大三度 (4個半音)。\n例如 C小三和弦 (C Min)：C - Eb - G。'
  },
  {
    title: '增三和弦 (Augmented Triad)',
    content: '增三和弦聽起來懸疑、擴張。結構是：根音 + 大三度 (4個半音) + 大三度 (4個半音)。\n例如 C增三和弦 (C Aug)：C - E - G#。'
  },
  {
    title: '減三和弦 (Diminished Triad)',
    content: '減三和弦聽起來緊張、收縮。結構是：根音 + 小三度 (3個半音) + 小三度 (3個半音)。\n例如 C減三和弦 (C Dim)：C - Eb - Gb。'
  }
];

export function TriadTutorial() {
  const { progress } = useGameStore();
  const moduleProgress = progress['triad-practice'] || defaultProgress;
  const { level } = moduleProgress;
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        📖 三和弦基礎樂理
      </h3>
      <div className="space-y-2">
        {TUTORIAL_CONTENT.map((item) => (
          <div key={item.title} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button
              className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggle(item.title)}
            >
              <span className="font-medium text-gray-800">{item.title}</span>
              {expanded === item.title ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
            </button>
            {expanded === item.title && (
              <div className="px-4 py-3 text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
