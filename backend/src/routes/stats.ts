import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const overall = db.prepare(`
    SELECT
      COUNT(*)        AS total_answered,
      SUM(is_correct) AS total_correct
    FROM answer_history
  `).get() as { total_answered: number; total_correct: number };

  const accuracy =
    overall.total_answered > 0
      ? Math.round((overall.total_correct / overall.total_answered) * 1000) / 10
      : 0;

  const domainStats = (
    db.prepare(`
      SELECT
        d.id   AS domain_id,
        d.name AS domain_name,
        COUNT(ah.id)        AS answered,
        COALESCE(SUM(ah.is_correct), 0) AS correct
      FROM domains d
      LEFT JOIN questions     q  ON q.domain_id    = d.id
      LEFT JOIN answer_history ah ON ah.question_id = q.id
      GROUP BY d.id
      ORDER BY d.id
    `).all() as { domain_id: number; domain_name: string; answered: number; correct: number }[]
  ).map(d => ({
    ...d,
    accuracy_rate:
      d.answered > 0
        ? Math.round((d.correct / d.answered) * 1000) / 10
        : 0,
  }));

  res.json({
    total_answered: overall.total_answered,
    total_correct: overall.total_correct,
    accuracy_rate: accuracy,
    domain_stats: domainStats,
  });
});

router.get('/history', (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 20;

  const history = db.prepare(`
    SELECT
      ah.id,
      ah.question_id,
      q.text  AS question_text,
      d.name  AS domain_name,
      ah.is_correct,
      ah.answered_at
    FROM answer_history ah
    JOIN questions q ON q.id   = ah.question_id
    JOIN domains   d ON d.id   = q.domain_id
    ORDER BY ah.answered_at DESC
    LIMIT ?
  `).all(limit);

  res.json(history);
});

export default router;
