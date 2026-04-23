import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function SeventhTutorial() {
  const intervals = [
    { name: '大七 (Maj7)', pattern: '1 3 5 7', formula: '大三度 + 完全五度 + 大七度', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { name: '屬七 (7)', pattern: '1 3 5 b7', formula: '大三度 + 完全五度 + 小七度', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { name: '小七 (m7)', pattern: '1 b3 5 b7', formula: '小三度 + 完全五度 + 小七度', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { name: '小大七 (mMaj7)', pattern: '1 b3 5 7', formula: '小三度 + 完全五度 + 大七度', color: 'bg-purple-50 text-purple-700 border-purple-100' },
    { name: '大七升五 (Maj7#5)', pattern: '1 3 #5 7', formula: '大三度 + 增五度 + 大七度', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
    { name: '半減七 (m7b5)', pattern: '1 b3 b5 b7', formula: '小三度 + 減五度 + 小七度', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { name: '減七 (dim7)', pattern: '1 b3 b5 bb7', formula: '小三度 + 減五度 + 減七度', color: 'bg-rose-50 text-rose-700 border-rose-100' },
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
        
        <div className="p-6 bg-slate-800 text-white rounded-3xl space-y-5 shadow-xl">
          <h4 className="font-bold text-lg flex items-center gap-2">
             💡 學習小撇步
          </h4>
          <p className="text-slate-300 text-sm font-medium leading-relaxed">
            和弦的狹義定義為：<strong>包含三個音以上，並且以「三度堆疊」構成。</strong><br/>
            只要依照以下口訣，就能快速推導出各種七和弦的組成音：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 p-4 bg-slate-900/50 rounded-xl text-sm font-medium text-slate-300">
            <div className="flex items-center gap-2"><span className="font-mono text-blue-400 font-bold w-16 text-right">maj7</span><span>= 主音 + 大三 + 小三 + 大三</span></div>
            <div className="flex items-center gap-2"><span className="font-mono text-blue-400 font-bold w-16 text-right">7</span><span>= 主音 + 大三 + 小三 + 小三</span></div>
            <div className="flex items-center gap-2"><span className="font-mono text-blue-400 font-bold w-16 text-right">min7</span><span>= 主音 + 小三 + 大三 + 小三</span></div>
            <div className="flex items-center gap-2"><span className="font-mono text-blue-400 font-bold w-16 text-right">mMaj7</span><span>= 主音 + 小三 + 大三 + 大三</span></div>
            <div className="flex items-center gap-2"><span className="font-mono text-blue-400 font-bold w-16 text-right">maj7#5</span><span>= 主音 + 大三 + 大三 + 小三</span></div>
            <div className="flex items-center gap-2"><span className="font-mono text-blue-400 font-bold w-16 text-right">m7b5</span><span>= 主音 + 小三 + 小三 + 大三</span></div>
            <div className="flex items-center gap-2 col-span-1 sm:col-span-2"><span className="font-mono text-blue-400 font-bold w-16 text-right">dim7</span><span>= 主音 + 小三 + 小三 + 小三</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
