import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function SeventhTutorial() {
  const intervals = [
    { name: '大七 (Maj7)', pattern: '1 3 5 7', formula: '大三 + 大七', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { name: '屬七 (7)', pattern: '1 3 5 b7', formula: '大三 + 小七', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { name: '小七 (m7)', pattern: '1 b3 5 b7', formula: '小三 + 小七', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { name: '半減七 (m7b5)', pattern: '1 b3 b5 b7', formula: '減三 + 小七', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { name: '減七 (dim7)', pattern: '1 b3 b5 bb7', formula: '減三 + 減七', color: 'bg-rose-50 text-rose-700 border-rose-100' },
    { name: '小大七 (mMaj7)', pattern: '1 b3 5 7', formula: '小三 + 大七', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  ];

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-display font-bold text-slate-800">📖 知識補給站</CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {intervals.map((chord) => (
            <div key={chord.name} className={`p-5 rounded-2xl border-2 ${chord.color} shadow-sm transition-transform hover:scale-[1.02]`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-black text-lg">{chord.name}</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/50">{chord.pattern}</span>
              </div>
              <p className="text-sm font-medium opacity-80">{chord.formula}</p>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-slate-800 text-white rounded-3xl space-y-4 shadow-xl">
          <h4 className="font-bold text-lg flex items-center gap-2">
             💡 學習小撇步
          </h4>
          <ul className="space-y-3 text-slate-300 text-sm font-medium">
            <li className="flex gap-3">
              <span className="text-blue-400">1.</span>
              <span>七和弦是在三和弦的基礎上，再往上疊加一個三度音（七度音）。</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">2.</span>
              <span>大七度與根音差 11 個半音（或是差 1 個半音就到八度）。</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">3.</span>
              <span>小七度與根音差 10 個半音（或是差 2 個半音就到八度）。</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">4.</span>
              <span>減七度（bb7）與根音差 9 個半音（跟大六度音高相同）。</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
