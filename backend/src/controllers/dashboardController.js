import dayjs from 'dayjs';
import { getDashboardMetrics, getReportData } from '../services/dashboardService.js';

export const getDashboard = async (_req, res) => {
  const data = await getDashboardMetrics();
  res.json(data);
};

export const getReports = async (req, res) => {
  const range = req.query.range || 'daily';
  const startDate = req.query.startDate || (range === 'monthly' ? dayjs().startOf('month').format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
  const endDate = req.query.endDate || (range === 'monthly' ? dayjs().endOf('month').format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));

  const data = await getReportData({ startDate, endDate });
  res.json({ range, startDate, endDate, ...data });
};
