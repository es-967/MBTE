import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { Tutorial } from './Tutorial';
import { PracticeMode } from '../../lib/music/skillGraph';

interface HomeProps {
  onStartQuiz: (isChallenge: boolean, difficulty?: 'easy' | 'normal' | 'hard') => void;
}

export function Home({ onStartQuiz }: HomeProps) {
  const { level, exp, streak, bestChallengeScore, practiceMode, setPracticeMode } = useGameStore();
  const [challengeDifficulty, setChallengeDifficulty] = React.useState<'easy' | 'normal' | 'hard'>('normal');

  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const unlockInfo = [
    { label: '基礎大調', level: 1 },
    { label: '降記號調性', level: 3 },
    { label: '小調練習', level: 6 },
    { label: '重升記號調性', level: 9 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">🎵 音階樂理練習</h1>
        <p className="text-lg text-gray-600">歡迎來到音階練習系統，幫助你熟悉各種調性的音階組成。</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">等級</p>
            <p className="text-3xl font-bold text-blue-600">Lv{level}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">經驗值</p>
            <p className="text-3xl font-bold text-green-600">{exp % 100}/100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">連勝</p>
            <p className="text-3xl font-bold text-orange-500">{streak} 🔥</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">最佳挑戰</p>
            <p className="text-3xl font-bold text-purple-600">{bestChallengeScore} 題</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-gray-600">
          <span>距離下一級還需 {100 - (exp % 100)} EXP</span>
        </div>
        <Progress value={exp % 100} max={100} className="h-3" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              📚 練習模式
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">選擇調性類型：</label>
              <select
                className="w-full p-2 border rounded-md bg-white text-gray-900 disabled:bg-gray-100"
                value={practiceMode}
                onChange={(e) => setPracticeMode(e.target.value as PracticeMode)}
                disabled={level < 6}
              >
                <option value="major">大調</option>
                {level >= 6 && <option value="minor">小調</option>}
                {level >= 6 && <option value="mixed">混答</option>}
              </select>
              {level < 6 && <p className="text-xs text-gray-500">小調與混答模式將於 Lv6 解鎖</p>}
            </div>
            <Button className="w-full" size="lg" onClick={() => onStartQuiz(false)}>
              🎯 開始練習
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              ⏰ 限時挑戰
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">一分鐘內答對越多題越好！</p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">選擇難度：</label>
              <select
                className="w-full p-2 border rounded-md bg-white text-gray-900"
                value={challengeDifficulty}
                onChange={(e) => setChallengeDifficulty(e.target.value as any)}
              >
                <option value="easy">簡單 (-2級)</option>
                <option value="normal">普通</option>
                <option value="hard">困難 (+2級)</option>
              </select>
            </div>
            <Button variant="secondary" className="w-full" size="lg" onClick={() => onStartQuiz(true, challengeDifficulty)}>
              🚀 開始挑戰
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">🔓 解鎖功能</h3>
        <div className="flex flex-wrap gap-2">
          {unlockInfo.map((info) => (
            <div
              key={info.label}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                level >= info.level
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              {level >= info.level ? '✅' : '🔒'} {info.label} {level < info.level && `(Lv${info.level}解鎖)`}
            </div>
          ))}
        </div>
      </div>

      <Tutorial />

      <div className="pt-8 border-t flex justify-center">
        {showResetConfirm ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-red-600 font-medium">確定要重置所有進度嗎？</span>
            <Button variant="destructive" size="sm" onClick={() => {
              useGameStore.getState().resetProgress();
              setShowResetConfirm(false);
            }}>
              確定重置
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
              取消
            </Button>
          </div>
        ) : (
          <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setShowResetConfirm(true)}>
            🔄 重置進度
          </Button>
        )}
      </div>
    </div>
  );
}
