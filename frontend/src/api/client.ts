import type {
  Domain,
  QuestionSummary,
  QuestionDetail,
  AnswerResponse,
  StatsResponse,
  HistoryItem,
} from '../types';
import { DOMAINS, ALL_QUESTIONS } from '../data/questions';

// ── localStorage ──────────────────────────────────────────────────────────
const STORAGE_KEY = 'jstqb_answer_history';

interface StoredAnswer {
  id: number;
  question_id: number;
  selected_choice_id: number;
  is_correct: boolean;
  answered_at: string;
}

function loadHistory(): StoredAnswer[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as StoredAnswer[];
  } catch {
    return [];
  }
}

function saveAnswer(answer: Omit<StoredAnswer, 'id'>): void {
  const history = loadHistory();
  history.unshift({ ...answer, id: Date.now() }); // 新しい順
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// ── API 関数（バックエンドと同じシグネチャ） ─────────────────────────────

export const getDomains = (): Promise<Domain[]> => {
  const history = loadHistory();
  const domains: Domain[] = DOMAINS.map(d => {
    const qIds = new Set(d.questions.map(q => q.id));
    const domainAnswers = history.filter(h => qIds.has(h.question_id));
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      question_count: d.questions.length,
      answered_count: domainAnswers.length,
      correct_count: domainAnswers.filter(h => h.is_correct).length,
    };
  });
  return Promise.resolve(domains);
};

export const getQuestions = (params: {
  domain_id?: string;
  limit?: number;
  filter?: 'unanswered' | 'wrong';
}): Promise<QuestionSummary[]> => {
  let questions = [...ALL_QUESTIONS];

  if (params.domain_id) {
    const ids = params.domain_id.split(',').map(Number);
    questions = questions.filter(q => ids.includes(q.domain_id));
  }

  if (params.filter) {
    const history = loadHistory();
    if (params.filter === 'unanswered') {
      const answeredIds = new Set(history.map(h => h.question_id));
      questions = questions.filter(q => !answeredIds.has(q.id));
    } else if (params.filter === 'wrong') {
      const latestByQuestion = new Map<number, StoredAnswer>();
      for (const h of history) {
        if (!latestByQuestion.has(h.question_id)) latestByQuestion.set(h.question_id, h);
      }
      questions = questions.filter(q => {
        const latest = latestByQuestion.get(q.id);
        return latest !== undefined && !latest.is_correct;
      });
    }
  }

  // ランダムシャッフル
  questions.sort(() => Math.random() - 0.5);

  const limit = params.limit ?? 0;
  const result = limit > 0 ? questions.slice(0, limit) : questions;

  return Promise.resolve(result.map(q => ({
    id: q.id,
    domain_id: q.domain_id,
    domain_name: q.domain_name,
    text: q.text,
    difficulty: q.difficulty,
  })));
};

export const getQuestion = (id: number): Promise<QuestionDetail> => {
  const q = ALL_QUESTIONS.find(q => q.id === id);
  if (!q) return Promise.reject(new Error(`Question ${id} not found`));

  return Promise.resolve({
    id: q.id,
    domain_id: q.domain_id,
    domain_name: q.domain_name,
    text: q.text,
    difficulty: q.difficulty,
    // is_correct はクライアントに渡さない（回答前に正解を隠す）
    choices: q.choices.map(c => ({ id: c.id, text: c.text, order_num: c.order_num })),
    explanation: q.explanation,
  });
};

export const submitAnswer = (
  question_id: number,
  choice_id: number,
): Promise<AnswerResponse> => {
  const q = ALL_QUESTIONS.find(q => q.id === question_id);
  if (!q) return Promise.reject(new Error(`Question ${question_id} not found`));

  const correctChoice = q.choices.find(c => c.is_correct);
  if (!correctChoice) return Promise.reject(new Error('No correct choice found'));

  const is_correct = choice_id === correctChoice.id;

  saveAnswer({
    question_id,
    selected_choice_id: choice_id,
    is_correct,
    answered_at: new Date().toLocaleString('ja-JP'),
  });

  return Promise.resolve({
    is_correct,
    correct_choice_id: correctChoice.id,
    explanation: q.explanation,
  });
};

export const getStats = (): Promise<StatsResponse> => {
  const history = loadHistory();
  const total_answered = history.length;
  const total_correct = history.filter(h => h.is_correct).length;
  const accuracy_rate = total_answered > 0
    ? Math.round((total_correct / total_answered) * 100)
    : 0;

  const domain_stats = DOMAINS.map(d => {
    const qIds = new Set(d.questions.map(q => q.id));
    const domainAnswers = history.filter(h => qIds.has(h.question_id));
    const answered = domainAnswers.length;
    const correct = domainAnswers.filter(h => h.is_correct).length;
    return {
      domain_id: d.id,
      domain_name: d.name,
      answered,
      correct,
      accuracy_rate: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    };
  });

  return Promise.resolve({ total_answered, total_correct, accuracy_rate, domain_stats });
};

export const getHistory = (limit = 20): Promise<HistoryItem[]> => {
  const history = loadHistory().slice(0, limit);
  return Promise.resolve(history.map(h => {
    const q = ALL_QUESTIONS.find(q => q.id === h.question_id);
    return {
      id: h.id,
      question_id: h.question_id,
      question_text: q?.text ?? '削除された問題',
      domain_name: q?.domain_name ?? '-',
      is_correct: h.is_correct ? 1 : 0,
      answered_at: h.answered_at,
    };
  }));
};
