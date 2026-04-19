import { useMemo, useState } from 'react';
import { api } from '../api/client';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import EntityForm from '../components/EntityForm';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useFetch } from '../hooks/useFetch';
import { formatCurrency, formatDate } from '../utils/format';

const emptyForm = { name: '', amount: 0, date: '', category: 'general' };

export default function ExpensesPage() {
  const { data, loading, error, refetch } = useFetch(() => api.get('/expenses'));
  const [editing, setEditing] = useState(null);

  const columns = useMemo(() => [
    { key: 'name', label: 'Expense' },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
  ], []);

  const handleSave = async (values) => {
    if (!values.name || !values.date) throw new Error('Name and date are required');
    const payload = { ...values, amount: Number(values.amount) };
    if (editing?.id) {
      await api.put(`/expenses/${editing.id}`, payload);
    } else {
      await api.post('/expenses', payload);
    }
    setEditing(null);
    await refetch();
    return emptyForm;
  };

  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}`);
    await refetch();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" description="Track fixed monthly costs like rent, salaries, and utilities." />
      <StatCard title="Monthly Expense Total" value={formatCurrency(data.monthlyTotal)} accent="bg-rose-500" />
      <EntityForm
        fields={[
          { name: 'name', label: 'Expense name' },
          { name: 'amount', label: 'Amount', type: 'number', step: '0.01', min: '0' },
          { name: 'date', label: 'Date', type: 'date' },
          { name: 'category', label: 'Category' },
        ]}
        initialValues={editing || emptyForm}
        formKey={editing ? `edit-expense-${editing.id}` : 'create-expense'}
        onSubmit={handleSave}
        submitLabel={editing ? 'Update Expense' : 'Add Expense'}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      {data.items.length === 0 ? (
        <EmptyState message="No expenses recorded." />
      ) : (
        <DataTable
          columns={columns}
          rows={data.items}
          actions={(row) => (
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => setEditing(row)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
            </div>
          )}
        />
      )}
    </div>
  );
}
