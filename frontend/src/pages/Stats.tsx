import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats, getHistory, getSessions } from '../api/client'
import type { StatsResponse, HistoryItem, SessionRecord } from '../types'

const PASS_LINE = 65

function AccuracyGraph({ sessions }: { sessions: SessionRecord[] }) {
  if (sessions.length < 2) {
    return (
      <p className="text-xs text-gray-400 text-center py-6">
        グラフはセッション2回以上で表示されます
      </p>
    )
  }

  const W = 320, H = 160, PX = 32, PY = 16
  const innerW = W - PX * 2
  const innerH = H - PY * 2

  const pts = sessions.map((s, i) => ({
    x: PX + (i / (sessions.length - 1)) * innerW,
    y: PY + innerH - (s.accuracy / 100) * innerH,
    s,
  }))

  const passY = PY + innerH - (PASS_LINE / 100) * innerH
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* 目盛り線 */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = PY + innerH - (v / 100) * innerH
        return (
          <g key={v}>
            <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PX - 4} y={y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{v}%</text>
          </g>
        )
      })}

      {/* 合格ライン */}
      <line x1={PX} y1={passY} x2={W - PX} y2={passY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={W - PX + 2} y={passY + 4} fontSize="9" fill="#f59e0b">65%</text>

      {/* 折れ線 */}
      <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />

      {/* ドット＆ラベル */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={p.s.accuracy >= PASS_LINE ? '#6366f1' : '#ef4444'} />
          <text x={p.x} y={H - 2} fontSize="9" fill="#9ca3af" textAnchor="middle">{p.s.label}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Stats() {
  const navigate = useNavigate()
  const [stats,     setStats]     = useState<StatsResponse | null>(null)
  const [history,   setHistory]   = useState<HistoryItem[]>([])
  const [sessions,  setSessions]  = useState<SessionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getHistory(20), getSessions()])
      .then(([s, h, ss]) => { setStats(s); setHistory(h); setSessions(ss) })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">

        {/* ヘッダー */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← ホーム
          </button>
          <h1 className="text-xl font-bold text-gray-800">学習統計</h1>
        </div>

        {/* サマリーカード */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{stats.total_answered}</p>
              <p className="text-xs text-gray-500 mt-1">総回答数</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.accuracy_rate}<span className="text-sm">%</span></p>
              <p className="text-xs text-gray-500 mt-1">全体正答率</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.domain_stats.filter(d => d.answered > 0).length}
                <span className="text-sm">/{stats.domain_stats.length}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">挑戦済み分野</p>
            </div>
          </div>
        )}

        {/* 正答率の推移グラフ */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-700 mb-1">正答率の推移</h2>
          <p className="text-xs text-gray-400 mb-4">セッションごとの正答率（点線：合格ライン65%）</p>
          <AccuracyGraph sessions={sessions} />
          {sessions.length >= 2 && (
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>計 {sessions.length} セッション</span>
              <span>最新: {sessions[sessions.length - 1].accuracy}%</span>
            </div>
          )}
        </div>

        {/* 分野別正答率 */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-700 mb-4">分野別正答率</h2>
            <div className="space-y-4">
              {stats.domain_stats.map(d => (
                <div key={d.domain_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium truncate mr-2">{d.domain_name}</span>
                    <span className="text-gray-500 whitespace-nowrap text-xs">
                      {d.answered > 0 ? `${d.correct}/${d.answered}問` : '未挑戦'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        d.accuracy_rate >= 80 ? 'bg-green-500' :
                        d.accuracy_rate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${d.accuracy_rate}%` }}
                    />
                  </div>
                  {d.answered > 0 && (
                    <p className="text-xs text-right text-gray-400 mt-0.5">{d.accuracy_rate}%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最近の履歴 */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">最近の回答履歴</h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {history.map(h => (
                <li key={h.id} className="flex items-start gap-3 px-6 py-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                    h.is_correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                  }`}>
                    {h.is_correct ? '○' : '✕'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">
                      {h.domain_name} · {h.answered_at}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-1">{h.question_text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {history.length === 0 && stats?.total_answered === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
            まだ回答履歴がありません。<br />問題を解いてみましょう！
          </div>
        )}

      </div>
    </div>
  )
}
