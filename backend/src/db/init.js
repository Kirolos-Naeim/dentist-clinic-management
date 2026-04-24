import { getDb } from './database.js';

const schema = `
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  dob TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  visit_date TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  material_cost REAL NOT NULL DEFAULT 0,
  labor_cost REAL NOT NULL DEFAULT 0,
  overhead_cost REAL NOT NULL DEFAULT 0,
  price REAL NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  unit_cost REAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 0,
  expiry_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  total_price REAL NOT NULL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  profit REAL NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

const seed = (db) => {
  const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get();
  if (patientCount.count === 0) {
    const insert = db.prepare(`
      INSERT INTO patients (name, phone, dob) VALUES (?, ?, ?)
    `);
    insert.run('Mina Adel', '+971501112233', '1991-04-14');
    insert.run('Sara Nabil', '+971509998877', '1988-11-03');
    insert.run('Peter Sameh', '+971552223344', '1996-07-22');
  }

  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  if (serviceCount.count === 0) {
    const insert = db.prepare(`
      INSERT INTO services (name, material_cost, labor_cost, overhead_cost, price) VALUES (?, ?, ?, ?, ?)
    `);
    insert.run('Dental Cleaning', 20, 25, 10, 90);
    insert.run('Tooth Extraction', 35, 40, 15, 150);
    insert.run('Root Canal', 60, 80, 25, 320);
    insert.run('Teeth Whitening', 45, 35, 20, 180);
  }

  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    const insert = db.prepare(`
      INSERT INTO products (name, unit_cost, quantity, reorder_level, expiry_date) VALUES (?, ?, ?, ?, ?)
    `);
    insert.run('Latex Gloves Box', 12, 15, 5, '2026-12-31');
    insert.run('Surgical Masks Pack', 8, 20, 6, '2026-10-01');
    insert.run('Composite Filling Kit', 55, 7, 3, '2026-08-15');
  }

  const expenseCount = db.prepare('SELECT COUNT(*) as count FROM expenses').get();
  if (expenseCount.count === 0) {
    const insert = db.prepare(`
      INSERT INTO expenses (name, amount, date, category) VALUES (?, ?, ?, ?)
    `);
    insert.run('Clinic Rent', 4500, '2026-04-01', 'rent');
    insert.run('Reception Salary', 3200, '2026-04-05', 'salary');
    insert.run('Sterilization Supplies', 850, '2026-04-10', 'supplies');
  }

  const visitCount = db.prepare('SELECT COUNT(*) as count FROM patient_visits').get();
  if (visitCount.count === 0) {
    const insert = db.prepare(`
      INSERT INTO patient_visits (patient_id, visit_date, diagnosis, treatment, payment_status, notes) VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(1, '2026-04-03', 'Plaque buildup', 'Dental Cleaning', 'paid', 'Routine annual cleaning completed.');
    insert.run(2, '2026-04-08', 'Tooth sensitivity', 'Teeth Whitening consultation', 'partial', 'Patient requested staged whitening plan.');
    insert.run(3, '2026-04-12', 'Deep cavity', 'Root Canal', 'paid', 'Follow-up after treatment recommended in two weeks.');
  }

  const invoiceCount = db.prepare('SELECT COUNT(*) as count FROM invoices').get();
  if (invoiceCount.count === 0) {
    const insertInvoice = db.prepare(`
      INSERT INTO invoices (patient_id, total_price, total_cost, profit, date, notes) VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertInvoice.run(1, 90, 55, 35, '2026-04-03', 'Routine cleaning invoice');
    insertInvoice.run(3, 320, 165, 155, '2026-04-12', 'Root canal procedure invoice');

    const insertItem = db.prepare(`
      INSERT INTO invoice_items (invoice_id, service_id, quantity, price, cost) VALUES (?, ?, ?, ?, ?)
    `);
    insertItem.run(1, 1, 1, 90, 55);
    insertItem.run(2, 3, 1, 320, 165);
  }
};

export const initializeDatabase = () => {
  const db = getDb();
  db.exec(schema);
  seed(db);
  return db;
};

if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  try {
    initializeDatabase();
    console.log('Database initialized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database', error);
    process.exit(1);
  }
}
