import { getDb } from '../db/database.js';
import { AppError } from '../utils/appError.js';
import { productSchema } from '../utils/validators.js';

const formatProduct = (product) => ({
  ...product,
  total_value: Number(product.unit_cost) * Number(product.quantity),
  low_stock: Number(product.quantity) <= Number(product.reorder_level),
  expiring_soon: Boolean(product.expiry_date) && product.expiry_date <= new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
});

export const getProducts = async (_req, res) => {
  const db = getDb();
  const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  res.json(products.map(formatProduct));
};

export const createProduct = async (req, res) => {
  const payload = productSchema.parse(req.body);
  const db = getDb();
  const insert = db.prepare(
    'INSERT INTO products (name, unit_cost, quantity, reorder_level, expiry_date) VALUES (?, ?, ?, ?, ?)'
  );
  const result = insert.run(
    payload.name,
    payload.unit_cost,
    payload.quantity,
    payload.reorder_level,
    payload.expiry_date || null
  );
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(formatProduct(product));
};

export const updateProduct = async (req, res) => {
  const payload = productSchema.parse(req.body);
  const db = getDb();
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('Product not found', 404);

  const update = db.prepare(
    'UPDATE products SET name = ?, unit_cost = ?, quantity = ?, reorder_level = ?, expiry_date = ? WHERE id = ?'
  );
  update.run(
    payload.name,
    payload.unit_cost,
    payload.quantity,
    payload.reorder_level,
    payload.expiry_date || null,
    req.params.id
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(formatProduct(product));
};

export const deleteProduct = async (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (!result.changes) throw new AppError('Product not found', 404);
  res.status(204).send();
};
