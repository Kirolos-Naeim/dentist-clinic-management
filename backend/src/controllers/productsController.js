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
  const db = await getDb();
  const products = await db.all('SELECT * FROM products ORDER BY id DESC');
  res.json(products.map(formatProduct));
};

export const createProduct = async (req, res) => {
  const payload = productSchema.parse(req.body);
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO products (name, unit_cost, quantity, reorder_level, expiry_date) VALUES (?, ?, ?, ?, ?)',
    [payload.name, payload.unit_cost, payload.quantity, payload.reorder_level, payload.expiry_date || null]
  );
  const product = await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);
  res.status(201).json(formatProduct(product));
};

export const updateProduct = async (req, res) => {
  const payload = productSchema.parse(req.body);
  const db = await getDb();
  const existing = await db.get('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing) throw new AppError('Product not found', 404);

  await db.run(
    'UPDATE products SET name = ?, unit_cost = ?, quantity = ?, reorder_level = ?, expiry_date = ? WHERE id = ?',
    [payload.name, payload.unit_cost, payload.quantity, payload.reorder_level, payload.expiry_date || null, req.params.id]
  );

  const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(formatProduct(product));
};

export const deleteProduct = async (req, res) => {
  const db = await getDb();
  const result = await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
  if (!result.changes) throw new AppError('Product not found', 404);
  res.status(204).send();
};
