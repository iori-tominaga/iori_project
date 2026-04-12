export interface Domain {
  id: number;
  name: string;
  description: string;
  question_count: number;
  answered_count: number;
  correct_count: number;
}

export interface QuestionSummary {
  id: number;
  domain_id: number;
  domain_name: string;
  text: string;
  difficulty: number;
}

export interface Choice {
  id: number;
  text: string;
  order_num: number;
}

export interface QuestionDetail extends QuestionSummary {
  choices: Choice[];
  explanation: string;
}

export interface AnswerResponse {
  is_correct: boolean;
  correct_choice_id: number;
  explanation: string;
}

/** ホーム画面からクイズ画面へ渡す設定 */
export interface QuizSettings {
  domainIds: number[];  // 空配列 = 全分野
  limit: number;        // 0 = 全問
}

/** クイズ1問分の結果 */
export interface QuizResult {
  questionId: number;
  questionText: string;
  domainName: string;
  selectedChoiceId: number;
  correctChoiceId: number;
  isCorrect: boolean;
}

export interface DomainStat {
  domain_id: number;
  domain_name: string;
  answered: number;
  correct: number;
  accuracy_rate: number;
}

export interface StatsResponse {
  total_answered: number;
  total_correct: number;
  accuracy_rate: number;
  domain_stats: DomainStat[];
}

export interface HistoryItem {
  id: number;
  question_id: number;
  question_text: string;
  domain_name: string;
  is_correct: number;
  answered_at: string;
}
