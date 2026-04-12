import axios from 'axios';
import type {
  Domain,
  QuestionSummary,
  QuestionDetail,
  AnswerResponse,
  StatsResponse,
  HistoryItem,
} from '../types';

const api = axios.create({ baseURL: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api' });

export const getDomains = (): Promise<Domain[]> =>
  api.get<Domain[]>('/domains').then(r => r.data);

export const getQuestions = (params: {
  domain_id?: string;
  limit?: number;
  filter?: 'unanswered' | 'wrong';
}): Promise<QuestionSummary[]> =>
  api.get<QuestionSummary[]>('/questions', { params }).then(r => r.data);

export const getQuestion = (id: number): Promise<QuestionDetail> =>
  api.get<QuestionDetail>(`/questions/${id}`).then(r => r.data);

export const submitAnswer = (
  question_id: number,
  choice_id: number,
): Promise<AnswerResponse> =>
  api.post<AnswerResponse>('/answers', { question_id, choice_id }).then(r => r.data);

export const getStats = (): Promise<StatsResponse> =>
  api.get<StatsResponse>('/stats').then(r => r.data);

export const getHistory = (limit = 20): Promise<HistoryItem[]> =>
  api.get<HistoryItem[]>('/stats/history', { params: { limit } }).then(r => r.data);
