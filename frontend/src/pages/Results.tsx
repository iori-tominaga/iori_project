import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { saveSession } from '../api/client'
import type { QuizResult, QuizSettings } from '../types'

interface ResultsState {
  results:  QuizResult[]
  settings: QuizSettings
}

function scoreComment(pct: number): string {
  if (pct === 100) return '完璧です！素晴らしい結果！'
  if (pct >= 80)   return 'とても良い結果です！'
  if (pct >= 60)   return 'あと少し！苦手分野を復習しましょう。'
  if (pct >= 40)   return 'もう一息！繰り返し挑戦しましょう。'
  return '基礎をもう一度見直してみましょう。'
}

function scoreColor(pct: number): string {
  if (pct >= 80) return 'text-green-600'
  if (pct >= 60) return 'text-yellow-600'
  return 'text-red-500'
}

export default function Results() {
  const location = useLocation()
  const navigate  = useNavigate()
  const state     = location.state as ResultsState | null

  const saved = useRef(false)

  useEffect(() => {
    if (!state) { navigate('/', { replace: true }); return }
    if (!saved.current && state.results.length > 0) {
      saved.current = true
      const correct = state.results.filter(r => r.isCorrect).length
      saveSession(state.results.length, correct)
    }
  }, [state, navigate])

  if (!state) return null

  const { results, settings } = state
  const correct = results.filter(r => r.isCorrect).length
  const total   = results.length
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">

        {/* ── スコアカード ── */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400 mb-1">クイズ終了</p>
          <div className={`text-7xl font-bold my-4 ${scoreColor(pct)}`}>
            {pct}<span className="text-3xl">%</span>
          </div>
          <p className="text-2xl font-bold text-gray-700 mb-2">
            {correct} <span className="text-lg font-normal text-gray-400">/ {total}問 正解</span>
          </p>
          <p className="text-sm text-gray-500">{scoreComment(pct)}</p>
        </div>

        {/* ── ボタン群 ── */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/quiz', { state: settings })}
            className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
          >
            もう一度挑戦
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            ホームへ戻る
          </button>
        </div>

        {/* ── 問題別振り返り ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">問題の振り返り</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {results.map((r, i) => (
              <li key={r.questionId} className="flex items-start gap-3 px-6 py-4">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                  r.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                }`}>
                  {r.isCorrect ? '○' : '✕'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">
                    Q{i + 1} · {r.domainName}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {r.questionText}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 統計へ */}
        <div className="text-center">
          <button
            onClick={() => navigate('/stats')}
            className="text-sm text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
          >
            学習統計を見る
          </button>
        </div>
      </div>
    </div>
  )
}
