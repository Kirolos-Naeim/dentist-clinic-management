import dayjs from 'dayjs';
import { getDb } from '../db/database.js';

export const getDashboardMetrics = async () => {
  const db = getDb();
  const today = dayjs().format('YYYY-MM-DD');
  const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const monthEnd = dayjs().endOf('month').format('YYYY-MM-DD');

  const dailyRevenueStmt = db.prepare('SELECT COALESCE(SUM(total_price), 0) AS value FROM invoices WHERE date = ?');
  const monthlyRevenueStmt = db.prepare('SELECT COALESCE(SUM(total_price), 0) AS value FROM invoices WHERE date BETWEEN ? AND ?');
  const totalPatientsStmt = db.prepare('SELECT COUNT(*) AS value FROM patients');
  const grossProfitStmt = db.prepare('SELECT COALESCE(SUM(profit), 0) AS value FROM invoices WHERE date BETWEEN ? AND ?');
  const monthlyExpensesStmt = db.prepare('SELECT COALESCE(SUM(amount), 0) AS value FROM expenses WHERE date BETWEEN ? AND ?');

  const [dailyRevenue, monthlyRevenue, totalPatients, grossProfit, monthlyExpenses] = [
    dailyRevenueStmt.get(today),
    monthlyRevenueStmt.get(monthStart, monthEnd),
    totalPatientsStmt.get(),
    grossProfitStmt.get(monthStart, monthEnd),
    monthlyExpensesStmt.get(monthStart, monthEnd),
  ];

  const revenueTrend = db.prepare(`
    SELECT date, COALESCE(SUM(total_price), 0) AS revenue, COALESCE(SUM(total_cost), 0) AS cost, COALESCE(SUM(profit), 0) AS profit
    FROM invoices
    WHERE date >= ?
    GROUP BY date
    ORDER BY date ASC
  `).all(dayjs().subtract(29, 'day').format('YYYY-MM-DD'));

  const servicesDistribution = db.prepare(`
    SELECT s.name, COALESCE(SUM(ii.quantity), 0) AS count
    FROM invoice_items ii
    JOIN services s ON s.id = ii.service_id
    GROUP BY s.id
    ORDER BY count DESC
  `).all();

  const inventoryAlerts = db.prepare(`
    SELECT id, name, quantity, reorder_level, expiry_date,
      CASE
        WHEN quantity <= reorder_level THEN 'low_stock'
        WHEN expiry_date IS NOT NULL AND expiry_date <= date('now', '+30 day') THEN 'expiring'
      END AS alert_type
    FROM products
    WHERE quantity <= reorder_level
       OR (expiry_date IS NOT NULL AND expiry_date <= date('now', '+30 day'))
    ORDER BY quantity ASC
  `).all();

  return {
    summary: {
      dailyRevenue: dailyRevenue.value,
      monthlyRevenue: monthlyRevenue.value,
      totalPatients: totalPatients.value,
      netProfit: grossProfit.value - monthlyExpenses.value,
      grossProfit: grossProfit.value,
      monthlyExpenses: monthlyExpenses.value,
    },
    revenueTrend,
    servicesDistribution,
    inventoryAlerts,
  };
};

export const getReportData = async ({ startDate, endDate }) => {
  const db = getDb();
  const financialsStmt = db.prepare(`
    SELECT
      COALESCE(SUM(total_price), 0) AS revenue,
      COALESCE(SUM(total_cost), 0) AS costs,
      COALESCE(SUM(profit), 0) AS gross_profit
    FROM invoices
    WHERE date BETWEEN ? AND ?
  `);
  const patientCountStmt = db.prepare(`
    SELECT COUNT(DISTINCT patient_id) AS patients
    FROM invoices
    WHERE date BETWEEN ? AND ?
  `);
  const invoicesStmt = db.prepare(`
    SELECT i.*, p.name AS patient_name
    FROM invoices i
    JOIN patients p ON p.id = i.patient_id
    WHERE i.date BETWEEN ? AND ?
    ORDER BY i.date DESC, i.id DESC
  `);

  const [financials, patientCount, invoices] = [
    financialsStmt.get(startDate, endDate),
    patientCountStmt.get(startDate, endDate),
    invoicesStmt.all(startDate, endDate),
  ];

  const expenses = db.prepare(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date BETWEEN ? AND ?'
  ).get(startDate, endDate);

  return {
    revenue: financials.revenue,
    costs: financials.costs,
    grossProfit: financials.gross_profit,
    expenses: expenses.total,
    netProfit: financials.gross_profit - expenses.total,
    patients: patientCount.patients,
    invoices,
  };
};
