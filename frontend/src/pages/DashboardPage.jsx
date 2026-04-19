import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { api } from '../api/client';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useFetch } from '../hooks/useFetch';
import { formatCurrency } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const { data, loading, error } = useFetch(() => api.get('/dashboard'));

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const revenueChart = {
    labels: data.revenueTrend.map((item) => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: data.revenueTrend.map((item) => item.revenue),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Profit',
        data: data.revenueTrend.map((item) => item.profit),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.15)',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const serviceChart = {
    labels: data.servicesDistribution.map((item) => item.name),
    datasets: [
      {
        data: data.servicesDistribution.map((item) => item.count),
        backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
    ],
  };

  return (
    <div>
      <PageHeader title="Dashboard" description="Revenue, profit, patients, and inventory alerts at a glance." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Daily Revenue" value={formatCurrency(data.summary.dailyRevenue)} accent="bg-brand-500" />
        <StatCard title="Monthly Revenue" value={formatCurrency(data.summary.monthlyRevenue)} accent="bg-emerald-500" />
        <StatCard title="Total Patients" value={data.summary.totalPatients} accent="bg-amber-500" />
        <StatCard title="Net Profit" value={formatCurrency(data.summary.netProfit)} subtitle={`Expenses: ${formatCurrency(data.summary.monthlyExpenses)}`} accent="bg-rose-500" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Revenue Over Time</h3>
          <Line data={revenueChart} />
        </div>
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Services Distribution</h3>
          <Doughnut data={serviceChart} />
        </div>
      </div>

      <div className="mt-6 card">
        <h3 className="mb-4 text-lg font-semibold">Inventory Alerts</h3>
        <div className="space-y-3">
          {data.inventoryAlerts.length === 0 ? (
            <p className="text-sm text-slate-500">No alerts right now.</p>
          ) : (
            data.inventoryAlerts.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    Qty: {item.quantity}, Reorder level: {item.reorder_level}, Expiry: {item.expiry_date || 'N/A'}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.alert_type === 'low_stock' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                  {item.alert_type === 'low_stock' ? 'Low stock' : 'Expiring soon'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
