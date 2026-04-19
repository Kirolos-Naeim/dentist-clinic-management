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

const seed = async (db) => {
  const patientCount = await db.get('SELECT COUNT(*) as count FROM patients');
  if (patientCount.count === 0) {
    await db.exec(`
      INSERT INTO patients (name, phone, dob) VALUES
      ('Mina Adel', '+971501112233', '1991-04-14'),
      ('Sara Nabil', '+971509998877', '1988-11-03'),
      ('Peter Sameh', '+971552223344', '1996-07-22');
    `);
  }

  const serviceCount = await db.get('SELECT COUNT(*) as count FROM services');
  if (serviceCount.count === 0) {
    await db.exec(`
      INSERT INTO services (name, material_cost, labor_cost, overhead_cost, price) VALUES
      ('Dental Cleaning', 20, 25, 10, 90),
      ('Tooth Extraction', 35, 40, 15, 150),
      ('Root Canal', 60, 80, 25, 320),
      ('Teeth Whitening', 45, 35, 20, 180);
    `);
  }

  const productCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    await db.exec(`
      INSERT INTO products (name, unit_cost, quantity, reorder_level, expiry_date) VALUES
      ('Latex Gloves Box', 12, 15, 5, '2026-12-31'),
      ('Surgical Masks Pack', 8, 20, 6, '2026-10-01'),
      ('Composite Filling Kit', 55, 7, 3, '2026-08-15');
    `);
  }

  const expenseCount = await db.get('SELECT COUNT(*) as count FROM expenses');
  if (expenseCount.count === 0) {
    await db.exec(`
      INSERT INTO expenses (name, amount, date, category) VALUES
      ('Clinic Rent', 4500, '2026-04-01', 'rent'),
      ('Reception Salary', 3200, '2026-04-05', 'salary'),
      ('Sterilization Supplies', 850, '2026-04-10', 'supplies');
    `);
  }

  const visitCount = await db.get('SELECT COUNT(*) as count FROM patient_visits');
  if (visitCount.count === 0) {
    await db.exec(`
      INSERT INTO patient_visits (patient_id, visit_date, diagnosis, treatment, payment_status, notes) VALUES
      (1, '2026-04-03', 'Plaque buildup', 'Dental Cleaning', 'paid', 'Routine annual cleaning completed.'),
      (2, '2026-04-08', 'Tooth sensitivity', 'Teeth Whitening consultation', 'partial', 'Patient requested staged whitening plan.'),
      (3, '2026-04-12', 'Deep cavity', 'Root Canal', 'paid', 'Follow-up after treatment recommended in two weeks.');
    `);
  }

  const invoiceCount = await db.get('SELECT COUNT(*) as count FROM invoices');
  if (invoiceCount.count === 0) {
    await db.exec(`
      INSERT INTO invoices (patient_id, total_price, total_cost, profit, date, notes) VALUES
      (1, 90, 55, 35, '2026-04-03', 'Routine cleaning invoice'),
      (3, 320, 165, 155, '2026-04-12', 'Root canal procedure invoice');

      INSERT INTO invoice_items (invoice_id, service_id, quantity, price, cost) VALUES
      (1, 1, 1, 90, 55),
      (2, 3, 1, 320, 165);
    `);
  }
};

export const initializeDatabase = async () => {
  const db = await getDb();
  await db.exec(schema);
  await seed(db);
  return db;
};

if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialized successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize database', error);
      process.exit(1);
    });
}
