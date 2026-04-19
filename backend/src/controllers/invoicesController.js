import { getDb } from '../db/database.js';
import { AppError } from '../utils/appError.js';
import { invoiceSchema } from '../utils/validators.js';

export const getInvoices = async (_req, res) => {
  const db = await getDb();
  const invoices = await db.all(`
    SELECT i.*, p.name AS patient_name
    FROM invoices i
    JOIN patients p ON p.id = i.patient_id
    ORDER BY i.date DESC, i.id DESC
  `);
  res.json(invoices);
};

export const createInvoice = async (req, res) => {
  const payload = invoiceSchema.parse(req.body);
  const db = await getDb();

  const patient = await db.get('SELECT id FROM patients WHERE id = ?', [payload.patient_id]);
  if (!patient) throw new AppError('Patient not found', 404);

  const serviceIds = payload.items.map((item) => item.service_id);
  const placeholders = serviceIds.map(() => '?').join(',');
  const services = await db.all(`SELECT * FROM services WHERE id IN (${placeholders})`, serviceIds);
  if (services.length !== serviceIds.length) throw new AppError('One or more services were not found', 404);

  const servicesMap = new Map(services.map((service) => [service.id, service]));
  const calculatedItems = payload.items.map((item) => {
    const service = servicesMap.get(item.service_id);
    const cost = Number(service.material_cost) + Number(service.labor_cost) + Number(service.overhead_cost);
    return {
      service_id: item.service_id,
      quantity: item.quantity,
      price: Number(service.price) * item.quantity,
      cost: cost * item.quantity,
    };
  });

  const totalPrice = calculatedItems.reduce((sum, item) => sum + item.price, 0);
  const totalCost = calculatedItems.reduce((sum, item) => sum + item.cost, 0);
  const profit = totalPrice - totalCost;

  await db.exec('BEGIN');
  try {
    const invoiceResult = await db.run(
      'INSERT INTO invoices (patient_id, total_price, total_cost, profit, date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [payload.patient_id, totalPrice, totalCost, profit, payload.date, payload.notes || null]
    );

    for (const item of calculatedItems) {
      await db.run(
        'INSERT INTO invoice_items (invoice_id, service_id, quantity, price, cost) VALUES (?, ?, ?, ?, ?)',
        [invoiceResult.lastID, item.service_id, item.quantity, item.price, item.cost]
      );
    }

    await db.run(
      `INSERT INTO patient_visits (patient_id, visit_date, diagnosis, treatment, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [payload.patient_id, payload.date, 'Billed visit', 'Services invoice created', 'paid', payload.notes || null]
    );

    await db.exec('COMMIT');

    const invoice = await db.get('SELECT * FROM invoices WHERE id = ?', [invoiceResult.lastID]);
    const items = await db.all(`
      SELECT ii.*, s.name AS service_name
      FROM invoice_items ii
      JOIN services s ON s.id = ii.service_id
      WHERE invoice_id = ?
    `, [invoiceResult.lastID]);

    res.status(201).json({ ...invoice, items });
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
};

export const getInvoiceById = async (req, res) => {
  const db = await getDb();
  const invoice = await db.get(`
    SELECT i.*, p.name AS patient_name
    FROM invoices i
    JOIN patients p ON p.id = i.patient_id
    WHERE i.id = ?
  `, [req.params.id]);
  if (!invoice) throw new AppError('Invoice not found', 404);

  const items = await db.all(`
    SELECT ii.*, s.name AS service_name
    FROM invoice_items ii
    JOIN services s ON s.id = ii.service_id
    WHERE ii.invoice_id = ?
  `, [req.params.id]);

  res.json({ ...invoice, items });
};
