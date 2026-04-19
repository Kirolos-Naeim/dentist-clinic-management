import { getDb } from '../db/database.js';
import { AppError } from '../utils/appError.js';
import { patientSchema, visitSchema } from '../utils/validators.js';

export const getPatients = async (_req, res) => {
  const db = await getDb();
  const patients = await db.all(`
    SELECT p.*, MAX(v.visit_date) AS last_visit, COUNT(v.id) AS total_visits
    FROM patients p
    LEFT JOIN patient_visits v ON v.patient_id = p.id
    GROUP BY p.id
    ORDER BY p.id DESC
  `);
  res.json(patients);
};

export const getPatientById = async (req, res) => {
  const db = await getDb();
  const patient = await db.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
  if (!patient) throw new AppError('Patient not found', 404);

  const history = await db.all(
    'SELECT * FROM patient_visits WHERE patient_id = ? ORDER BY visit_date DESC, id DESC',
    [req.params.id]
  );
  const invoices = await db.all(
    `SELECT id, total_price, total_cost, profit, date FROM invoices WHERE patient_id = ? ORDER BY date DESC, id DESC`,
    [req.params.id]
  );

  res.json({ ...patient, history, invoices });
};

export const createPatient = async (req, res) => {
  const payload = patientSchema.parse(req.body);
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO patients (name, phone, dob) VALUES (?, ?, ?)',
    [payload.name, payload.phone, payload.dob || null]
  );
  const patient = await db.get('SELECT * FROM patients WHERE id = ?', [result.lastID]);
  res.status(201).json(patient);
};

export const updatePatient = async (req, res) => {
  const payload = patientSchema.parse(req.body);
  const db = await getDb();
  const existing = await db.get('SELECT id FROM patients WHERE id = ?', [req.params.id]);
  if (!existing) throw new AppError('Patient not found', 404);

  await db.run(
    'UPDATE patients SET name = ?, phone = ?, dob = ? WHERE id = ?',
    [payload.name, payload.phone, payload.dob || null, req.params.id]
  );

  const patient = await db.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
  res.json(patient);
};

export const deletePatient = async (req, res) => {
  const db = await getDb();
  const result = await db.run('DELETE FROM patients WHERE id = ?', [req.params.id]);
  if (!result.changes) throw new AppError('Patient not found', 404);
  res.status(204).send();
};

export const addPatientVisit = async (req, res) => {
  const payload = visitSchema.parse(req.body);
  const db = await getDb();
  const patient = await db.get('SELECT id FROM patients WHERE id = ?', [req.params.id]);
  if (!patient) throw new AppError('Patient not found', 404);

  const result = await db.run(
    `INSERT INTO patient_visits (patient_id, visit_date, diagnosis, treatment, payment_status, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.params.id, payload.visit_date, payload.diagnosis || null, payload.treatment || null, payload.payment_status, payload.notes || null]
  );

  const visit = await db.get('SELECT * FROM patient_visits WHERE id = ?', [result.lastID]);
  res.status(201).json(visit);
};
