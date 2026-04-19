import { useMemo, useState } from 'react';
import { api } from '../api/client';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import EntityForm from '../components/EntityForm';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { useFetch } from '../hooks/useFetch';
import { formatCurrency, formatDate } from '../utils/format';

const emptyForm = { name: '', unit_cost: 0, quantity: 0, reorder_level: 0, expiry_date: '' };

export default function InventoryPage() {
  const { data, loading, error, refetch } = useFetch(() => api.get('/products'));
  const [editing, setEditing] = useState(null);

  const columns = useMemo(() => [
    { key: 'name', label: 'Product' },
    { key: 'unit_cost', label: 'Unit Cost', render: (row) => formatCurrency(row.unit_cost) },
    { key: 'quantity', label: 'Quantity' },
    { key: 'reorder_level', label: 'Reorder Level' },
    { key: 'expiry_date', label: 'Expiry', render: (row) => formatDate(row.expiry_date) },
    { key: 'total_value', label: 'Stock Value', render: (row) => formatCurrency(row.total_value) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex gap-2">
          {row.low_stock ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Low stock</span> : null}
          {row.expiring_soon ? <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Expiring</span> : null}
        </div>
      ),
    },
  ], []);

  const handleSave = async (values) => {
    if (!values.name) throw new Error('Product name is required');
    const payload = {
      ...values,
      unit_cost: Number(values.unit_cost),
      quantity: Number(values.quantity),
      reorder_level: Number(values.reorder_level),
    };
    if (editing?.id) {
      await api.put(`/products/${editing.id}`, payload);
    } else {
      await api.post('/products', payload);
    }
    setEditing(null);
    await refetch();
    return emptyForm;
  };

  const handleDelete = async (id) => {
    await api.delete(`/products/${id}`);
    await refetch();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Monitor clinic stock, expiry dates, and reorder alerts." />
      <EntityForm
        fields={[
          { name: 'name', label: 'Product name' },
          { name: 'unit_cost', label: 'Unit cost', type: 'number', step: '0.01', min: '0' },
          { name: 'quantity', label: 'Quantity', type: 'number', min: '0' },
          { name: 'reorder_level', label: 'Reorder level', type: 'number', min: '0' },
          { name: 'expiry_date', label: 'Expiry date', type: 'date' },
        ]}
        initialValues={editing || emptyForm}
        formKey={editing ? `edit-product-${editing.id}` : 'create-product'}
        onSubmit={handleSave}
        submitLabel={editing ? 'Update Product' : 'Add Product'}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      {data.length === 0 ? (
        <EmptyState message="No products in inventory." />
      ) : (
        <DataTable
          columns={columns}
          rows={data}
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
