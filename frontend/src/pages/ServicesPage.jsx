import { useMemo, useState } from 'react';
import { api } from '../api/client';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import EntityForm from '../components/EntityForm';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { useFetch } from '../hooks/useFetch';
import { formatCurrency } from '../utils/format';

const emptyForm = { name: '', material_cost: 0, labor_cost: 0, overhead_cost: 0, price: 0 };

export default function ServicesPage() {
  const { data, loading, error, refetch } = useFetch(() => api.get('/services'));
  const [editing, setEditing] = useState(null);

  const columns = useMemo(() => [
    { key: 'name', label: 'Service' },
    { key: 'material_cost', label: 'Material', render: (row) => formatCurrency(row.material_cost) },
    { key: 'labor_cost', label: 'Labor', render: (row) => formatCurrency(row.labor_cost) },
    { key: 'overhead_cost', label: 'Overhead', render: (row) => formatCurrency(row.overhead_cost) },
    { key: 'price', label: 'Selling Price', render: (row) => formatCurrency(row.price) },
    { key: 'total_cost', label: 'Total Cost', render: (row) => formatCurrency(row.total_cost) },
    { key: 'profit', label: 'Profit', render: (row) => formatCurrency(row.profit) },
  ], []);

  const handleSave = async (values) => {
    if (!values.name) throw new Error('Service name is required');
    const payload = {
      ...values,
      material_cost: Number(values.material_cost),
      labor_cost: Number(values.labor_cost),
      overhead_cost: Number(values.overhead_cost),
      price: Number(values.price),
    };
    if (editing?.id) {
      await api.put(`/services/${editing.id}`, payload);
    } else {
      await api.post('/services', payload);
    }
    setEditing(null);
    await refetch();
    return emptyForm;
  };

  const handleDelete = async (id) => {
    await api.delete(`/services/${id}`);
    await refetch();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="Track treatment pricing, cost, and profit by service." />
      <EntityForm
        fields={[
          { name: 'name', label: 'Service name' },
          { name: 'material_cost', label: 'Material cost', type: 'number', step: '0.01', min: '0' },
          { name: 'labor_cost', label: 'Labor cost', type: 'number', step: '0.01', min: '0' },
          { name: 'overhead_cost', label: 'Overhead cost', type: 'number', step: '0.01', min: '0' },
          { name: 'price', label: 'Selling price', type: 'number', step: '0.01', min: '0' },
        ]}
        initialValues={editing || emptyForm}
        formKey={editing ? `edit-service-${editing.id}` : 'create-service'}
        onSubmit={handleSave}
        submitLabel={editing ? 'Update Service' : 'Add Service'}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      {data.length === 0 ? (
        <EmptyState message="No services found." />
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
