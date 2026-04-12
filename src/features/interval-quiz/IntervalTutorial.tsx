import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TUTORIAL_CONTENT = [
  {
    title: '什麼是音程 (Interval)？',
    content: '音程是指兩個音之間的高低距離。我們用「度數」和「性質」來描述它。例如：「大三度」、「完全五度」。'
  },
  {
    title: '度數 (Degree)',
    content: '度數是看兩個音在五線譜上的距離（包含頭尾）。例如：C 到 E，經過 C、D、E 三個音，所以是「三度」。'
  },
  {
    title: '性質 (Quality)',
    content: '性質用來精確描述半音的數量。常見的性質有：\n- 完全 (Perfect)：1、4、5、8 度\n- 大 (Major) / 小 (Minor)：2、3、6、7 度\n- 增 (Augmented)：比完全或大音程多一個半音\n- 減 (Diminished)：比完全或小音程少一個半音'
  },
  {
    title: '常見音程半音數',
    content: '小二度 (1半音)、大二度 (2半音)\n小三度 (3半音)、大三度 (4半音)\n完全四度 (5半音)、增四度/減五度 (6半音)\n完全五度 (7半音)\n小六度 (8半音)、大六度 (9半音)\n小七度 (10半音)、大七度 (11半音)\n完全八度 (12半音)'
  }
];

export function IntervalTutorial() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        📖 音程基礎樂理
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
