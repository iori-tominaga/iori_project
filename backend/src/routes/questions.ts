import { Router, Request, Response } from 'express';
import type { SQLInputValue } from 'node:sqlite';
import db from '../db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const domainIdStr = req.query.domain_id as string | undefined;
  const difficultyStr = req.query.difficulty as string | undefined;
  const limitStr = req.query.limit as string | undefined;
  const filter = req.query.filter as string | undefined;

  let query = `
    SELECT q.id, q.domain_id, d.name AS domain_name, q.text, q.difficulty
    FROM questions q
    JOIN domains d ON d.id = q.domain_id
    WHERE 1=1
  `;
  const params: SQLInputValue[] = [];

  if (domainIdStr) {
    const ids = domainIdStr
      .split(',')
      .map(Number)
      .filter(n => !isNaN(n) && n > 0);
    if (ids.length > 0) {
      query += ` AND q.domain_id IN (${ids.map(() => '?').join(',')})`;
      params.push(...ids);
    }
  }

  if (difficultyStr) {
    const d = Number(difficultyStr);
    if (!isNaN(d)) {
      query += ' AND q.difficulty = ?';
      params.push(d);
    }
  }

  if (filter === 'unanswered') {
    query += ' AND q.id NOT IN (SELECT DISTINCT question_id FROM answer_history)';
  } else if (filter === 'wrong') {
    query += `
      AND q.id IN (
        SELECT question_id FROM answer_history
        GROUP BY question_id
        HAVING SUM(is_correct) = 0
      )
    `;
  }

  query += ' ORDER BY RANDOM()';

  const limitNum = limitStr !== undefined ? Number(limitStr) : 10;
  if (!isNaN(limitNum) && limitNum > 0) {
    query += ' LIMIT ?';
    params.push(limitNum);
  }

  try {
    const questions = db.prepare(query).all(...params);
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const question = db.prepare(`
    SELECT q.id, q.domain_id, d.name AS domain_name, q.text, q.difficulty
    FROM questions q
    JOIN domains d ON d.id = q.domain_id
    WHERE q.id = ?
  `).get(id) as Record<string, unknown> | undefined;

  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  // is_correct は返さない（カンニング防止）
  const choices = db.prepare(`
    SELECT id, text, order_num
    FROM choices
    WHERE question_id = ?
    ORDER BY order_num
  `).all(id);

  const explanation = db.prepare(`
    SELECT text FROM explanations WHERE question_id = ?
  `).get(id) as { text: string } | undefined;

  res.json({
    ...question,
    choices,
    explanation: explanation?.text ?? '',
  });
});

export default router;
