import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { question_id, choice_id } = req.body as {
    question_id?: number;
    choice_id?: number;
  };

  if (!question_id || !choice_id) {
    return res.status(400).json({ error: 'question_id と choice_id は必須です' });
  }

  const choice = db.prepare(`
    SELECT id, is_correct FROM choices WHERE id = ? AND question_id = ?
  `).get(Number(choice_id), Number(question_id)) as
    | { id: number; is_correct: number }
    | undefined;

  if (!choice) {
    return res.status(404).json({ error: 'Choice not found' });
  }

  const is_correct = choice.is_correct === 1 ? 1 : 0;

  db.prepare(`
    INSERT INTO answer_history (question_id, selected_choice_id, is_correct)
    VALUES (?, ?, ?)
  `).run(Number(question_id), Number(choice_id), is_correct);

  const correct_choice = db.prepare(`
    SELECT id FROM choices WHERE question_id = ? AND is_correct = 1
  `).get(Number(question_id)) as { id: number } | undefined;

  const explanation = db.prepare(`
    SELECT text FROM explanations WHERE question_id = ?
  `).get(Number(question_id)) as { text: string } | undefined;

  res.json({
    is_correct: is_correct === 1,
    correct_choice_id: correct_choice?.id,
    explanation: explanation?.text ?? '',
  });
});

export default router;
