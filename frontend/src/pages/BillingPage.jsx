import { useMemo, useState } from 'react';
import { api } from '../api/client';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { useFetch } from '../hooks/useFetch';
import { formatCurrency } from '../utils/format';

const createInitialItem = () => ({ service_id: '', quantity: 1 });

export default function BillingPage() {
  const patientsQuery = useFetch(() => api.get('/patients'));
  const servicesQuery = useFetch(() => api.get('/services'));
  const invoicesQuery = useFetch(() => api.get('/invoices'));
  const [form, setForm] = useState({ patient_id: '', date: '', notes: '', items: [createInitialItem()] });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const invoicePreview = useMemo(() => {
    if (!servicesQuery.data) return { total: 0, cost: 0, profit: 0 };
    return form.items.reduce(
      (acc, item) => {
        const service = servicesQuery.data.find((entry) => String(entry.id) === String(item.service_id));
        if (!service) return acc;
        acc.total += Number(service.price) * Number(item.quantity || 0);
        acc.cost += Number(service.total_cost) * Number(item.quantity || 0);
        acc.profit = acc.total - acc.cost;
        return acc;
      },
      { total: 0, cost: 0, profit: 0 }
    );
  }, [form.items, servicesQuery.data]);

  const handleItemChange = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };

  const addRow = () => setForm((prev) => ({ ...prev, items: [...prev.items, createInitialItem()] }));

  const removeRow = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? [createInitialItem()] : prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const submitInvoice = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (!form.patient_id || !form.date) throw new Error('Patient and date are required');

      const items = form.items
        .filter((item) => String(item.service_id).trim() !== '')
        .map((item) => ({ service_id: Number(item.service_id), quantity: Number(item.quantity) }));

      if (!items.length) throw new Error('Add at least one service');

      await api.post('/invoices', {
        ...form,
        patient_id: Number(form.patient_id),
        items,
      });
      setMessage('Invoice saved successfully.');
      setForm({ patient_id: '', date: '', notes: '', items: [createInitialItem()] });
      await invoicesQuery.refetch();
    } catch (err) {
      setError(err.message || 'Failed to save invoice');
    }
  };

  if (patientsQuery.loading || servicesQuery.loading || invoicesQuery.loading) return <LoadingState />;
  if (patientsQuery.error || servicesQuery.error || invoicesQuery.error) {
    return <ErrorState message={patientsQuery.error || servicesQuery.error || invoicesQuery.error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Create invoices with multiple services and automatic profit calculation." />

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <form className="card space-y-4" onSubmit={submitInvoice}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Patient</label>
              <select value={form.patient_id} onChange={(e) => setForm((prev) => ({ ...prev, patient_id: e.target.value }))}>
                <option value="">Select patient</option>
                {patientsQuery.data.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Invoice date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[2fr,1fr,auto] md:items-end">
                <div>
                  <label className="label">Service</label>
                  <select value={item.service_id} onChange={(e) => handleItemChange(index, 'service_id', e.target.value)}>
                    <option value="">Select service</option>
                    {servicesQuery.data.map((service) => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                </div>
                <button className="btn-secondary" type="button" onClick={() => removeRow(index)}>
                  Delete
                </button>
              </div>
            ))}
            <button className="btn-secondary" type="button" onClick={addRow}>Add Service Row</button>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea rows="4" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

          <button className="btn-primary" type="submit">Save Invoice</button>
        </form>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold">Invoice Preview</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Total Bill: <span className="font-semibold text-slate-900">{formatCurrency(invoicePreview.total)}</span></p>
              <p>Total Cost: <span className="font-semibold text-slate-900">{formatCurrency(invoicePreview.cost)}</span></p>
              <p>Profit: <span className="font-semibold text-emerald-600">{formatCurrency(invoicePreview.profit)}</span></p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold">Recent Invoices</h3>
            <div className="mt-4 space-y-3">
              {invoicesQuery.data.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">#{invoice.id} · {invoice.patient_name}</p>
                    <p className="text-sm text-slate-500">{invoice.date}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span>Revenue: {formatCurrency(invoice.total_price)}</span>
                    <span>Cost: {formatCurrency(invoice.total_cost)}</span>
                    <span>Profit: {formatCurrency(invoice.profit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
