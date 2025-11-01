'use client';

import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const [minutes, setMinutes] = useState<number>(5);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [inputMinutes, setInputMinutes] = useState<string>('5');
  // ブラウザの setInterval は number を返す（Next.jsのTS設定ならこれでOK）
  const intervalRef = useRef<number | null>(null);

  // タブタイトル更新（お好み）
  useEffect(() => {
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    document.title = isRunning ? `${mm}:${ss} ⏱️ Timer` : 'Timer';
  }, [minutes, seconds, isRunning]);

  useEffect(() => {
    // 二重起動防止
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            // 分の借りを処理
            return setMinutes(prevMin => {
              if (prevMin === 0) {
                setIsRunning(false);
                playSound();
                return 0;
              }
              // 分を1減らし、秒は59へ
              setSeconds(59);
              return prevMin - 1;
            }), 0 as unknown as number; // 上の setMinutes と整合させるためのダミー（実際はすぐ59に置き換わる）
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const playSound = () => {
    // ブラウザの自動再生制限で鳴らないケースあり
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTO');
    audio.play().catch(() => {});
  };

  const handleStart = () => {
    // まだ時間がセットされていない/0になっている場合、入力値から再セット
    if (minutes === 0 && seconds === 0) {
      const mins = clampMinutes(parseInt(inputMinutes, 10));
      setMinutes(mins);
      setSeconds(0);
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    const mins = clampMinutes(parseInt(inputMinutes, 10));
    setMinutes(mins);
    setSeconds(0);
  };

  const handleSetTime = () => {
    const mins = clampMinutes(parseInt(inputMinutes, 10));
    setMinutes(mins);
    setSeconds(0);
    setIsRunning(false);
  };

  const isFinished = minutes === 0 && seconds === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">
          タイマー
        </h1>

        <div
          className={`text-7xl font-mono font-bold text-center mb-8 transition-colors ${
            isFinished ? 'text-red-500 animate-pulse' : 'text-gray-800'
          }`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {isFinished && (
          <div className="text-center text-red-500 font-bold text-xl mb-6 animate-bounce">
            時間です！
          </div>
        )}

        <div className="flex gap-3 mb-6">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg"
            >
              スタート
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg"
            >
              一時停止
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg"
          >
            リセット
          </button>
        </div>

        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            時間設定（分）
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min={1}
              max={99}
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500"
              disabled={isRunning}
            />
            <button
              onClick={handleSetTime}
              disabled={isRunning}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              設定
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {[1, 3, 5, 10, 15].map((min) => (
            <button
              key={min}
              onClick={() => {
                setInputMinutes(String(min));
                setMinutes(min);
                setSeconds(0);
                setIsRunning(false);
              }}
              disabled={isRunning}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
            >
              {min}分
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function clampMinutes(n: number | undefined) {
  const v = Number.isFinite(n) ? (n as number) : 5;
  return Math.min(Math.max(v, 1), 99);
}
