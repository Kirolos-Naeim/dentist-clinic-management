import { getDb } from '../db/database.js';
import { AppError } from '../utils/appError.js';
import { serviceSchema } from '../utils/validators.js';

const withCalculatedFields = (service) => ({
  ...service,
  total_cost: Number(service.material_cost) + Number(service.labor_cost) + Number(service.overhead_cost),
  profit: Number(service.price) - (Number(service.material_cost) + Number(service.labor_cost) + Number(service.overhead_cost)),
});

export const getServices = async (_req, res) => {
  const db = getDb();
  const services = db.prepare('SELECT * FROM services ORDER BY id DESC').all();
  res.json(services.map(withCalculatedFields));
};

export const createService = async (req, res) => {
  const payload = serviceSchema.parse(req.body);
  const db = getDb();
  const insert = db.prepare(
    `INSERT INTO services (name, material_cost, labor_cost, overhead_cost, price)
     VALUES (?, ?, ?, ?, ?)`
  );
  const result = insert.run(
    payload.name,
    payload.material_cost,
    payload.labor_cost,
    payload.overhead_cost,
    payload.price
  );
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(withCalculatedFields(service));
};

export const updateService = async (req, res) => {
  const payload = serviceSchema.parse(req.body);
  const db = getDb();
  const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('Service not found', 404);

  const update = db.prepare(
    `UPDATE services SET name = ?, material_cost = ?, labor_cost = ?, overhead_cost = ?, price = ? WHERE id = ?`
  );
  update.run(
    payload.name,
    payload.material_cost,
    payload.labor_cost,
    payload.overhead_cost,
    payload.price,
    req.params.id
  );

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  res.json(withCalculatedFields(service));
};

export const deleteService = async (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  if (!result.changes) throw new AppError('Service not found', 404);
  res.status(204).send();
};
