import { useState } from 'react';
import { api } from '../api/client';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useFetch } from '../hooks/useFetch';
import { formatCurrency } from '../utils/format';

export default function ReportsPage() {
  const [filters, setFilters] = useState({ range: 'daily', startDate: '', endDate: '' });
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value)
  ).toString();
  const { data, loading, error, refetch } = useFetch(() => api.get(`/dashboard/reports${query ? `?${query}` : ''}`), true);

  const applyFilters = async (event) => {
    event.preventDefault();
    await refetch();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Daily and monthly clinic performance reports." />

      <form className="card grid gap-4 md:grid-cols-4" onSubmit={applyFilters}>
        <div>
          <label className="label">Range</label>
          <select value={filters.range} onChange={(e) => setFilters((prev) => ({ ...prev, range: e.target.value }))}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="label">Start date</label>
          <input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
        </div>
        <div>
          <label className="label">End date</label>
          <input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full" type="submit">Run Report</button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Revenue" value={formatCurrency(data.revenue)} accent="bg-brand-500" />
        <StatCard title="Costs" value={formatCurrency(data.costs)} accent="bg-amber-500" />
        <StatCard title="Gross Profit" value={formatCurrency(data.grossProfit)} accent="bg-emerald-500" />
        <StatCard title="Expenses" value={formatCurrency(data.expenses)} accent="bg-rose-500" />
        <StatCard title="Net Profit" value={formatCurrency(data.netProfit)} subtitle={`${data.patients} patients`} accent="bg-violet-500" />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold">Invoices in Report Range</h3>
        <div className="mt-4 space-y-3">
          {data.invoices.length === 0 ? (
            <p className="text-sm text-slate-500">No invoices in this range.</p>
          ) : (
            data.invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">#{invoice.id} · {invoice.patient_name}</p>
                  <span className="text-sm text-slate-500">{invoice.date}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>Revenue: {formatCurrency(invoice.total_price)}</span>
                  <span>Costs: {formatCurrency(invoice.total_cost)}</span>
                  <span>Profit: {formatCurrency(invoice.profit)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
