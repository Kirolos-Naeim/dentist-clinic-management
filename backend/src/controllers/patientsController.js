import { getDb } from '../db/database.js';
import { AppError } from '../utils/appError.js';
import { patientSchema, visitSchema } from '../utils/validators.js';

export const getPatients = async (_req, res) => {
  const db = getDb();
  const patients = db.prepare(`
    SELECT p.*, MAX(v.visit_date) AS last_visit, COUNT(v.id) AS total_visits
    FROM patients p
    LEFT JOIN patient_visits v ON v.patient_id = p.id
    GROUP BY p.id
    ORDER BY p.id DESC
  `).all();
  res.json(patients);
};

export const getPatientById = async (req, res) => {
  const db = getDb();
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) throw new AppError('Patient not found', 404);

  const history = db.prepare(
    'SELECT * FROM patient_visits WHERE patient_id = ? ORDER BY visit_date DESC, id DESC'
  ).all(req.params.id);
  const invoices = db.prepare(
    `SELECT id, total_price, total_cost, profit, date FROM invoices WHERE patient_id = ? ORDER BY date DESC, id DESC`
  ).all(req.params.id);

  res.json({ ...patient, history, invoices });
};

export const createPatient = async (req, res) => {
  const payload = patientSchema.parse(req.body);
  const db = getDb();
  const insert = db.prepare('INSERT INTO patients (name, phone, dob) VALUES (?, ?, ?)');
  const result = insert.run(payload.name, payload.phone, payload.dob || null);
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(patient);
};

export const updatePatient = async (req, res) => {
  const payload = patientSchema.parse(req.body);
  const db = getDb();
  const existing = db.prepare('SELECT id FROM patients WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('Patient not found', 404);

  const update = db.prepare('UPDATE patients SET name = ?, phone = ?, dob = ? WHERE id = ?');
  update.run(payload.name, payload.phone, payload.dob || null, req.params.id);

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  res.json(patient);
};

export const deletePatient = async (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
  if (!result.changes) throw new AppError('Patient not found', 404);
  res.status(204).send();
};

export const addPatientVisit = async (req, res) => {
  const payload = visitSchema.parse(req.body);
  const db = getDb();
  const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) throw new AppError('Patient not found', 404);

  const insert = db.prepare(
    `INSERT INTO patient_visits (patient_id, visit_date, diagnosis, treatment, payment_status, notes)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const result = insert.run(
    req.params.id,
    payload.visit_date,
    payload.diagnosis || null,
    payload.treatment || null,
    payload.payment_status,
    payload.notes || null
  );

  const visit = db.prepare('SELECT * FROM patient_visits WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(visit);
};
