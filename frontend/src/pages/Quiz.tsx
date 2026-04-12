import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getQuestions, getQuestion, submitAnswer } from '../api/client'
import type {
  QuizSettings,
  QuestionSummary,
  QuestionDetail,
  AnswerResponse,
  QuizResult,
} from '../types'

const CHOICE_LABELS = ['A', 'B', 'C', 'D']

const DIFFICULTY_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: '易',  cls: 'bg-green-100 text-green-700' },
  2: { label: '普通', cls: 'bg-yellow-100 text-yellow-700' },
  3: { label: '難',  cls: 'bg-red-100 text-red-700' },
}

export default function Quiz() {
  const location = useLocation()
  const navigate  = useNavigate()
  const settings  = location.state as QuizSettings | null

  const [questionList,    setQuestionList]    = useState<QuestionSummary[]>([])
  const [currentIndex,    setCurrentIndex]    = useState(0)
  const [detail,          setDetail]          = useState<QuestionDetail | null>(null)
  const [selectedId,      setSelectedId]      = useState<number | null>(null)
  const [answered,        setAnswered]        = useState(false)
  const [answerResult,    setAnswerResult]    = useState<AnswerResponse | null>(null)
  const [sessionResults,  setSessionResults]  = useState<QuizResult[]>([])
  const [isLoadingList,   setIsLoadingList]   = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  // 設定なしで直接アクセスした場合はホームへ
  useEffect(() => {
    if (!settings) navigate('/', { replace: true })
  }, [settings, navigate])

  // 問題リストをロード
  useEffect(() => {
    if (!settings) return
    setIsLoadingList(true)
    getQuestions({
      domain_id: settings.domainIds.length > 0 ? settings.domainIds.join(',') : undefined,
      limit: settings.limit,
    })
      .then(list => {
        if (list.length === 0) {
          setError('該当する問題がありません。設定を変えてお試しください。')
        }
        setQuestionList(list)
      })
      .catch(() => setError('問題の取得に失敗しました。'))
      .finally(() => setIsLoadingList(false))
  }, [settings])

  // 現在の問題の詳細をロード
  const loadDetail = useCallback((id: number) => {
    setIsLoadingDetail(true)
    setDetail(null)
    setSelectedId(null)
    setAnswered(false)
    setAnswerResult(null)
    getQuestion(id)
      .then(setDetail)
      .catch(() => setError('問題の詳細取得に失敗しました。'))
      .finally(() => setIsLoadingDetail(false))
  }, [])

  useEffect(() => {
    if (questionList.length > 0 && currentIndex < questionList.length) {
      loadDetail(questionList[currentIndex].id)
    }
  }, [currentIndex, questionList, loadDetail])

  // 回答送信
  const handleSubmit = async () => {
    if (!detail || selectedId === null) return
    try {
      const result = await submitAnswer(detail.id, selectedId)
      setAnswerResult(result)
      setAnswered(true)
      setSessionResults(prev => [
        ...prev,
        {
          questionId:      detail.id,
          questionText:    detail.text,
          domainName:      detail.domain_name,
          selectedChoiceId: selectedId,
          correctChoiceId: result.correct_choice_id,
          isCorrect:       result.is_correct,
        },
      ])
    } catch {
      setError('回答の送信に失敗しました。')
    }
  }

  // 次の問題 / 結果へ
  const handleNext = () => {
    if (currentIndex + 1 >= questionList.length) {
      navigate('/results', {
        state: { results: sessionResults, settings },
      })
    } else {
      setCurrentIndex(i => i + 1)
    }
  }

  const isLast = currentIndex + 1 >= questionList.length

  /* -------------------- ローディング / エラー -------------------- */
  if (isLoadingList) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        問題を読み込んでいます...
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm"
        >
          ホームへ戻る
        </button>
      </div>
    )
  }

  /* -------------------- メイン画面 -------------------- */
  const progress = questionList.length > 0
    ? ((currentIndex + (answered ? 1 : 0)) / questionList.length) * 100
    : 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-xl">

        {/* ── ヘッダー（進捗） ── */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>問題 {currentIndex + 1} / {questionList.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── 問題カード ── */}
        {isLoadingDetail ? (
          <div className="text-center text-gray-400 py-20">読み込み中...</div>
        ) : detail && (
          <div className="space-y-4">

            {/* バッジ */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                {detail.domain_name}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_BADGE[detail.difficulty]?.cls ?? ''}`}>
                {DIFFICULTY_BADGE[detail.difficulty]?.label}
              </span>
            </div>

            {/* 問題文 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-base font-medium text-gray-800 leading-relaxed">
                {detail.text}
              </p>
            </div>

            {/* 選択肢 */}
            <div className="space-y-2.5">
              {detail.choices.map((c, i) => {
                const isSelected = selectedId === c.id
                const isCorrect  = answered && c.id === answerResult?.correct_choice_id
                const isWrong    = answered && isSelected && !isCorrect

                let borderCls = 'border-gray-200 bg-white hover:border-gray-300'
                let badgeCls  = 'bg-gray-100 text-gray-500'

                if (!answered && isSelected) {
                  borderCls = 'border-indigo-400 bg-indigo-50'
                  badgeCls  = 'bg-indigo-500 text-white'
                } else if (isCorrect) {
                  borderCls = 'border-green-400 bg-green-50'
                  badgeCls  = 'bg-green-500 text-white'
                } else if (isWrong) {
                  borderCls = 'border-red-400 bg-red-50'
                  badgeCls  = 'bg-red-500 text-white'
                }

                return (
                  <button
                    key={c.id}
                    onClick={() => !answered && setSelectedId(c.id)}
                    disabled={answered}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${borderCls} disabled:cursor-default`}
                  >
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 ${badgeCls}`}>
                      {CHOICE_LABELS[i]}
                    </span>
                    <span className="text-sm text-gray-800 leading-relaxed pt-0.5">
                      {c.text}
                    </span>
                    {isCorrect && (
                      <span className="ml-auto text-green-500 text-lg flex-shrink-0">○</span>
                    )}
                    {isWrong && (
                      <span className="ml-auto text-red-500 text-lg flex-shrink-0">✕</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 結果バナー */}
            {answered && answerResult && (
              <div className={`rounded-xl p-4 flex items-center gap-3 ${
                answerResult.is_correct
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <span className={`text-3xl ${answerResult.is_correct ? 'text-green-500' : 'text-red-500'}`}>
                  {answerResult.is_correct ? '○' : '✕'}
                </span>
                <span className={`font-bold text-lg ${answerResult.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                  {answerResult.is_correct ? '正解！' : '不正解'}
                </span>
              </div>
            )}

            {/* 解説 */}
            {answered && answerResult && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  解説
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {answerResult.explanation}
                </p>
              </div>
            )}

            {/* アクションボタン */}
            {!answered ? (
              <button
                onClick={handleSubmit}
                disabled={selectedId === null}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                  selectedId !== null
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl font-bold text-base bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md transition-all"
              >
                {isLast ? '結果を見る →' : '次の問題へ →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
