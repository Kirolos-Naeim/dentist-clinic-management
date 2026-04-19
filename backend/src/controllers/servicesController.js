import { getDb } from '../db/database.js';
import { AppError } from '../utils/appError.js';
import { serviceSchema } from '../utils/validators.js';

const withCalculatedFields = (service) => ({
  ...service,
  total_cost: Number(service.material_cost) + Number(service.labor_cost) + Number(service.overhead_cost),
  profit: Number(service.price) - (Number(service.material_cost) + Number(service.labor_cost) + Number(service.overhead_cost)),
});

export const getServices = async (_req, res) => {
  const db = await getDb();
  const services = await db.all('SELECT * FROM services ORDER BY id DESC');
  res.json(services.map(withCalculatedFields));
};

export const createService = async (req, res) => {
  const payload = serviceSchema.parse(req.body);
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO services (name, material_cost, labor_cost, overhead_cost, price)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.name, payload.material_cost, payload.labor_cost, payload.overhead_cost, payload.price]
  );
  const service = await db.get('SELECT * FROM services WHERE id = ?', [result.lastID]);
  res.status(201).json(withCalculatedFields(service));
};

export const updateService = async (req, res) => {
  const payload = serviceSchema.parse(req.body);
  const db = await getDb();
  const existing = await db.get('SELECT id FROM services WHERE id = ?', [req.params.id]);
  if (!existing) throw new AppError('Service not found', 404);

  await db.run(
    `UPDATE services SET name = ?, material_cost = ?, labor_cost = ?, overhead_cost = ?, price = ? WHERE id = ?`,
    [payload.name, payload.material_cost, payload.labor_cost, payload.overhead_cost, payload.price, req.params.id]
  );

  const service = await db.get('SELECT * FROM services WHERE id = ?', [req.params.id]);
  res.json(withCalculatedFields(service));
};

export const deleteService = async (req, res) => {
  const db = await getDb();
  const result = await db.run('DELETE FROM services WHERE id = ?', [req.params.id]);
  if (!result.changes) throw new AppError('Service not found', 404);
  res.status(204).send();
};
