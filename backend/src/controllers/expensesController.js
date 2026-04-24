import { getDb } from '../db/database.js';
import { AppError } from '../utils/appError.js';
import { expenseSchema } from '../utils/validators.js';

export const getExpenses = async (_req, res) => {
  const db = getDb();
  const expenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC').all();
  const monthlyTotal = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM expenses
    WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
  `).get();

  res.json({ items: expenses, monthlyTotal: monthlyTotal.total });
};

export const createExpense = async (req, res) => {
  const payload = expenseSchema.parse(req.body);
  const db = getDb();
  const insert = db.prepare(
    'INSERT INTO expenses (name, amount, date, category) VALUES (?, ?, ?, ?)'
  );
  const result = insert.run(
    payload.name,
    payload.amount,
    payload.date,
    payload.category || 'general'
  );
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(expense);
};

export const updateExpense = async (req, res) => {
  const payload = expenseSchema.parse(req.body);
  const db = getDb();
  const existing = db.prepare('SELECT id FROM expenses WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('Expense not found', 404);

  const update = db.prepare(
    'UPDATE expenses SET name = ?, amount = ?, date = ?, category = ? WHERE id = ?'
  );
  update.run(
    payload.name,
    payload.amount,
    payload.date,
    payload.category || 'general',
    req.params.id
  );
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  res.json(expense);
};

export const deleteExpense = async (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  if (!result.changes) throw new AppError('Expense not found', 404);
  res.status(204).send();
};
