import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDomains } from '../api/client'
import type { Domain, QuizSettings } from '../types'

const LIMIT_OPTIONS = [
  { label: '5問',  value: 5  },
  { label: '10問', value: 10 },
  { label: '20問', value: 20 },
  { label: '全問', value: 0  },
]

const DIFFICULTY_LABEL: Record<number, string> = { 1: '易', 2: '普通', 3: '難' }

function accuracyText(domain: Domain): string {
  if (domain.answered_count === 0) return '未挑戦'
  const pct = Math.round((domain.correct_count / domain.answered_count) * 100)
  return `正答率 ${pct}%`
}

function accuracyColor(domain: Domain): string {
  if (domain.answered_count === 0) return 'text-gray-400'
  const pct = (domain.correct_count / domain.answered_count) * 100
  if (pct >= 80) return 'text-green-600'
  if (pct >= 50) return 'text-yellow-600'
  return 'text-red-500'
}

export default function Home() {
  const navigate = useNavigate()
  const [domains,         setDomains]         = useState<Domain[]>([])
  const [isLoading,       setIsLoading]       = useState(true)
  const [error,           setError]           = useState<string | null>(null)
  const [rangeMode,       setRangeMode]       = useState<'all' | 'select'>('all')
  const [selectedIds,     setSelectedIds]     = useState<number[]>([])
  const [limit,           setLimit]           = useState(10)

  useEffect(() => {
    getDomains()
      .then(setDomains)
      .catch(() => setError('サーバーに接続できません。バックエンドが起動しているか確認してください。'))
      .finally(() => setIsLoading(false))
  }, [])

  const toggleDomain = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleStart = () => {
    const settings: QuizSettings = {
      domainIds: rangeMode === 'all' ? [] : selectedIds,
      limit,
    }
    navigate('/quiz', { state: settings })
  }

  const canStart =
    !isLoading &&
    !error &&
    (rangeMode === 'all' || selectedIds.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl">

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-indigo-500 tracking-widest uppercase mb-1">
            JSTQB Advanced Level
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Test Manager 問題集</h1>
          <p className="mt-2 text-sm text-gray-500">
            模擬問題を解いて合格力を高めよう
          </p>
        </div>

        {/* ローディング / エラー */}
        {isLoading && (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-6">

            {/* ── 出題範囲 ── */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                出題範囲
              </h2>

              {/* 全分野 / 分野を選ぶ */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-4">
                {(['all', 'select'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setRangeMode(mode)}
                    className={[
                      'flex-1 py-2.5 text-sm font-medium transition-colors',
                      rangeMode === mode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {mode === 'all' ? '全分野' : '分野を選ぶ'}
                  </button>
                ))}
              </div>

              {/* 分野チェックボックス */}
              {rangeMode === 'select' && (
                <div className="space-y-2">
                  {domains.map(d => (
                    <label
                      key={d.id}
                      className={[
                        'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                        selectedIds.includes(d.id)
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-300',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(d.id)}
                        onChange={() => toggleDomain(d.id)}
                        className="accent-indigo-600 w-4 h-4"
                      />
                      <span className="flex-1 text-sm font-medium text-gray-800">
                        {d.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {d.question_count}問
                      </span>
                      <span className={`text-xs font-medium ${accuracyColor(d)}`}>
                        {accuracyText(d)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* 全分野時: サマリー表示 */}
              {rangeMode === 'all' && (
                <div className="grid grid-cols-2 gap-2">
                  {domains.map(d => (
                    <div key={d.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600 truncate mr-2">{d.name}</span>
                      <span className={`text-xs font-medium whitespace-nowrap ${accuracyColor(d)}`}>
                        {accuracyText(d)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── 出題数 ── */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                出題数
              </h2>
              <div className="flex gap-2">
                {LIMIT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLimit(opt.value)}
                    className={[
                      'flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all',
                      limit === opt.value
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            {/* ── スタートボタン ── */}
            <button
              onClick={handleStart}
              disabled={!canStart}
              className={[
                'w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-md',
                canStart
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed',
              ].join(' ')}
            >
              問題をはじめる →
            </button>

            {/* 統計ページへ */}
            <div className="text-center">
              <button
                onClick={() => navigate('/stats')}
                className="text-sm text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
              >
                学習統計を見る
              </button>
            </div>
          </div>
        )}

        {/* 難易度凡例 */}
        {!isLoading && !error && (
          <div className="mt-8 flex justify-center gap-4 text-xs text-gray-400">
            {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => (
              <span key={k}>難易度{k}: {v}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
