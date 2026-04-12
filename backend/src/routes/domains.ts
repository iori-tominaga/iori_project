import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const domains = db.prepare(`
    SELECT
      d.id,
      d.name,
      d.description,
      COUNT(DISTINCT q.id)  AS question_count,
      COUNT(DISTINCT ah.id) AS answered_count,
      COALESCE(SUM(ah.is_correct), 0) AS correct_count
    FROM domains d
    LEFT JOIN questions     q  ON q.domain_id    = d.id
    LEFT JOIN answer_history ah ON ah.question_id = q.id
    GROUP BY d.id
    ORDER BY d.id
  `).all();

  res.json(domains);
});

export default router;
