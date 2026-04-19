import { getDb } from '../db/database.js';
import { AppError } from '../utils/appError.js';
import { expenseSchema } from '../utils/validators.js';

export const getExpenses = async (_req, res) => {
  const db = await getDb();
  const expenses = await db.all('SELECT * FROM expenses ORDER BY date DESC, id DESC');
  const monthlyTotal = await db.get(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM expenses
    WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
  `);

  res.json({ items: expenses, monthlyTotal: monthlyTotal.total });
};

export const createExpense = async (req, res) => {
  const payload = expenseSchema.parse(req.body);
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO expenses (name, amount, date, category) VALUES (?, ?, ?, ?)',
    [payload.name, payload.amount, payload.date, payload.category || 'general']
  );
  const expense = await db.get('SELECT * FROM expenses WHERE id = ?', [result.lastID]);
  res.status(201).json(expense);
};

export const updateExpense = async (req, res) => {
  const payload = expenseSchema.parse(req.body);
  const db = await getDb();
  const existing = await db.get('SELECT id FROM expenses WHERE id = ?', [req.params.id]);
  if (!existing) throw new AppError('Expense not found', 404);

  await db.run(
    'UPDATE expenses SET name = ?, amount = ?, date = ?, category = ? WHERE id = ?',
    [payload.name, payload.amount, payload.date, payload.category || 'general', req.params.id]
  );
  const expense = await db.get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
  res.json(expense);
};

export const deleteExpense = async (req, res) => {
  const db = await getDb();
  const result = await db.run('DELETE FROM expenses WHERE id = ?', [req.params.id]);
  if (!result.changes) throw new AppError('Expense not found', 404);
  res.status(204).send();
};
