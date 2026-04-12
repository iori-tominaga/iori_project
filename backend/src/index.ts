import express from 'express';
import cors from 'cors';
import domainsRouter   from './routes/domains';
import questionsRouter from './routes/questions';
import answersRouter   from './routes/answers';
import statsRouter     from './routes/stats';

const app  = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS ?? 'http://localhost:5173').split(',');

app.use(cors({ origin: FRONTEND_ORIGINS }));
app.use(express.json());

app.use('/api/domains',   domainsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers',   answersRouter);
app.use('/api/stats',     statsRouter);

app.listen(PORT, () => {
  console.log(`✅  Backend running → http://localhost:${PORT}`);
});
