import { useEffect, useRef, useState } from 'react';

export default function EntityForm({ fields, initialValues, onSubmit, submitLabel = 'Save', onCancel, formKey }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState('');
  const previousFormKey = useRef(formKey);

  useEffect(() => {
    if (previousFormKey.current !== formKey) {
      setValues(initialValues);
      setError('');
      previousFormKey.current = formKey;
    }
  }, [formKey, initialValues]);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const result = await onSubmit(values);
      if (result && typeof result === 'object') {
        setValues(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to save');
    }
  };

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
            <label className="label">{field.label}</label>
            {field.type === 'select' ? (
              <select value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)}>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea rows="4" value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} />
            ) : (
              <input
                type={field.type || 'text'}
                value={values[field.name] ?? ''}
                min={field.min}
                step={field.step}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex gap-3">
        <button className="btn-primary" type="submit">{submitLabel}</button>
        {onCancel ? (
          <button className="btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
