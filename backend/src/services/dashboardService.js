import dayjs from 'dayjs';
import { getDb } from '../db/database.js';

export const getDashboardMetrics = async () => {
  const db = await getDb();
  const today = dayjs().format('YYYY-MM-DD');
  const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const monthEnd = dayjs().endOf('month').format('YYYY-MM-DD');

  const [dailyRevenue, monthlyRevenue, totalPatients, grossProfit, monthlyExpenses] = await Promise.all([
    db.get('SELECT COALESCE(SUM(total_price), 0) AS value FROM invoices WHERE date = ?', [today]),
    db.get('SELECT COALESCE(SUM(total_price), 0) AS value FROM invoices WHERE date BETWEEN ? AND ?', [monthStart, monthEnd]),
    db.get('SELECT COUNT(*) AS value FROM patients'),
    db.get('SELECT COALESCE(SUM(profit), 0) AS value FROM invoices WHERE date BETWEEN ? AND ?', [monthStart, monthEnd]),
    db.get('SELECT COALESCE(SUM(amount), 0) AS value FROM expenses WHERE date BETWEEN ? AND ?', [monthStart, monthEnd]),
  ]);

  const revenueTrend = await db.all(`
    SELECT date, COALESCE(SUM(total_price), 0) AS revenue, COALESCE(SUM(total_cost), 0) AS cost, COALESCE(SUM(profit), 0) AS profit
    FROM invoices
    WHERE date >= ?
    GROUP BY date
    ORDER BY date ASC
  `, [dayjs().subtract(29, 'day').format('YYYY-MM-DD')]);

  const servicesDistribution = await db.all(`
    SELECT s.name, COALESCE(SUM(ii.quantity), 0) AS count
    FROM invoice_items ii
    JOIN services s ON s.id = ii.service_id
    GROUP BY s.id
    ORDER BY count DESC
  `);

  const inventoryAlerts = await db.all(`
    SELECT id, name, quantity, reorder_level, expiry_date,
      CASE
        WHEN quantity <= reorder_level THEN 'low_stock'
        WHEN expiry_date IS NOT NULL AND expiry_date <= date('now', '+30 day') THEN 'expiring'
      END AS alert_type
    FROM products
    WHERE quantity <= reorder_level
       OR (expiry_date IS NOT NULL AND expiry_date <= date('now', '+30 day'))
    ORDER BY quantity ASC
  `);

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
  const db = await getDb();
  const [financials, patientCount, invoices] = await Promise.all([
    db.get(`
      SELECT
        COALESCE(SUM(total_price), 0) AS revenue,
        COALESCE(SUM(total_cost), 0) AS costs,
        COALESCE(SUM(profit), 0) AS gross_profit
      FROM invoices
      WHERE date BETWEEN ? AND ?
    `, [startDate, endDate]),
    db.get(`
      SELECT COUNT(DISTINCT patient_id) AS patients
      FROM invoices
      WHERE date BETWEEN ? AND ?
    `, [startDate, endDate]),
    db.all(`
      SELECT i.*, p.name AS patient_name
      FROM invoices i
      JOIN patients p ON p.id = i.patient_id
      WHERE i.date BETWEEN ? AND ?
      ORDER BY i.date DESC, i.id DESC
    `, [startDate, endDate]),
  ]);

  const expenses = await db.get(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date BETWEEN ? AND ?',
    [startDate, endDate]
  );

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
