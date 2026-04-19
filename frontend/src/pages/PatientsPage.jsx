import { useMemo, useState } from 'react';
import { api } from '../api/client';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import EntityForm from '../components/EntityForm';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { useFetch } from '../hooks/useFetch';
import { formatDate } from '../utils/format';

const emptyForm = { name: '', phone: '', dob: '' };

export default function PatientsPage() {
  const { data, loading, error, refetch } = useFetch(() => api.get('/patients'));
  const [editing, setEditing] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsError, setDetailsError] = useState('');
  const [search, setSearch] = useState('');
  const [visitForm, setVisitForm] = useState({ visit_date: '', diagnosis: '', treatment: '', payment_status: 'pending', notes: '' });

  const columns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'dob', label: 'DOB', render: (row) => formatDate(row.dob) },
    { key: 'last_visit', label: 'Last Visit', render: (row) => formatDate(row.last_visit) },
    { key: 'total_visits', label: 'Visits' },
  ], []);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;

    return data.filter((patient) =>
      patient.name.toLowerCase().includes(query) || String(patient.phone || '').toLowerCase().includes(query)
    );
  }, [data, search]);

  const loadDetails = async (patientId) => {
    setSelectedPatient(patientId);
    setDetailsError('');
    try {
      const result = await api.get(`/patients/${patientId}`);
      setDetails(result);
    } catch (err) {
      setDetailsError(err.message);
    }
  };

  const handleSave = async (values) => {
    if (!values.name || !values.phone) throw new Error('Name and phone are required');
    if (editing?.id) {
      await api.put(`/patients/${editing.id}`, values);
    } else {
      await api.post('/patients', values);
    }
    setEditing(null);
    await refetch();
    return emptyForm;
  };

  const handleDelete = async (id) => {
    await api.delete(`/patients/${id}`);
    if (selectedPatient === id) {
      setSelectedPatient(null);
      setDetails(null);
    }
    await refetch();
  };

  const addVisit = async (values) => {
    if (!selectedPatient) throw new Error('Select a patient first');
    if (!values.visit_date) throw new Error('Visit date is required');
    await api.post(`/patients/${selectedPatient}/visits`, values);
    const reset = { visit_date: '', diagnosis: '', treatment: '', payment_status: 'pending', notes: '' };
    setVisitForm(reset);
    await loadDetails(selectedPatient);
    await refetch();
    return reset;
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Patients" description="Manage patient records and treatment history." />

      <EntityForm
        fields={[
          { name: 'name', label: 'Name' },
          { name: 'phone', label: 'Phone' },
          { name: 'dob', label: 'Date of birth', type: 'date' },
        ]}
        initialValues={editing || emptyForm}
        formKey={editing ? `edit-${editing.id}` : 'create-patient'}
        onSubmit={handleSave}
        submitLabel={editing ? 'Update Patient' : 'Add Patient'}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      {data.length === 0 ? (
        <EmptyState message="No patients yet." />
      ) : (
        <div className="space-y-4">
          <div className="card">
            <label className="label">Search by name or phone</label>
            <input
              type="text"
              placeholder="Type patient name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredPatients.length === 0 ? (
            <EmptyState message="No matching patients found." />
          ) : (
            <DataTable
              columns={columns}
              rows={filteredPatients}
              actions={(row) => (
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => setEditing(row)}>Edit</button>
                  <button className="btn-secondary" onClick={() => loadDetails(row.id)}>History</button>
                  <button className="btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
                </div>
              )}
            />
          )}
        </div>
      )}

      {selectedPatient && details ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
          <div className="card">
            <h3 className="text-lg font-semibold">Patient History: {details.name}</h3>
            {details.history.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No visit history yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {details.history.map((visit) => (
                  <div key={visit.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{formatDate(visit.visit_date)}</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{visit.payment_status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Diagnosis: {visit.diagnosis || '—'}</p>
                    <p className="mt-1 text-sm text-slate-600">Treatment: {visit.treatment || '—'}</p>
                    <p className="mt-1 text-sm text-slate-500">{visit.notes || 'No notes'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <EntityForm
              fields={[
                { name: 'visit_date', label: 'Visit date', type: 'date' },
                { name: 'diagnosis', label: 'Diagnosis' },
                { name: 'treatment', label: 'Treatment' },
                {
                  name: 'payment_status',
                  label: 'Payment status',
                  type: 'select',
                  options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'partial', label: 'Partial' },
                    { value: 'paid', label: 'Paid' },
                  ],
                },
                { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
              ]}
              initialValues={visitForm}
              formKey={`visit-${selectedPatient || 'none'}`}
              onSubmit={addVisit}
              submitLabel="Add Visit"
            />
            {detailsError ? <ErrorState message={detailsError} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
