'use client';

import { useState } from 'react';
import { Pencil, Save, X, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate, toDateInputValue } from '../../lib/format';

// Fields rendered in Private Info. `type` drives the editor + display formatting.
const LEFT = [
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { key: 'residingAddress', label: 'Residing Address', type: 'text' },
  { key: 'nationality', label: 'Nationality', type: 'text' },
  { key: 'personalEmail', label: 'Personal Email', type: 'email' },
  { key: 'gender', label: 'Gender', type: 'text' },
  { key: 'maritalStatus', label: 'Marital Status', type: 'text' },
  { key: 'joiningDate', label: 'Joining Date', type: 'date' },
];
const RIGHT = [
  { key: 'bankAccountNumber', label: 'Bank Account Number', type: 'text' },
  { key: 'bankName', label: 'Bank Name', type: 'text' },
  { key: 'ifscCode', label: 'IFSC Code', type: 'text' },
  { key: 'panNumber', label: 'PAN Number', type: 'text' },
  { key: 'uanNumber', label: 'UAN Number', type: 'text' },
  { key: 'employeeId', label: 'Employee ID', type: 'text', readOnly: true },
];

function displayValue(field, user) {
  const raw = user[field.key];
  if (field.type === 'date') return formatDate(raw);
  return raw || '—';
}

function ReadRow({ field, user }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{field.label}</p>
      <p className="text-slate-800 font-medium mt-1 break-words">{displayValue(field, user)}</p>
    </div>
  );
}

function EditRow({ field, value, onChange }) {
  const editable = !field.readOnly;
  return (
    <div>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{field.label}</label>
      <input
        type={field.type === 'date' ? 'date' : field.type}
        value={field.type === 'date' ? toDateInputValue(value) : value ?? ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        disabled={!editable}
        className={`mt-1 w-full rounded-xl px-3 py-2 text-sm text-slate-800 outline-none transition-colors ${
          editable
            ? 'border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'
            : 'border border-transparent bg-slate-50 text-slate-500 cursor-not-allowed'
        }`}
      />
    </div>
  );
}

export function PrivateInfoTab({ user, canEdit, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});

  const fields = [...LEFT, ...RIGHT];

  const startEdit = () => {
    const initial = {};
    fields.forEach((f) => {
      initial[f.key] = f.type === 'date' ? toDateInputValue(user[f.key]) : (user[f.key] ?? '');
    });
    setForm(initial);
    setError('');
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError('');
  };

  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      // Only send editable fields (never employeeId).
      const payload = {};
      fields.filter((f) => !f.readOnly).forEach((f) => {
        payload[f.key] = form[f.key] === '' ? null : form[f.key];
      });
      const updated = await api.put(`/api/users/${user.id}/private-info`, payload);
      setEditing(false);
      onSaved?.(updated);
    } catch (err) {
      setError(err.message || 'Unable to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">Private Information</h4>
        {canEdit && !editing && (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
        {canEdit && editing && (
          <div className="flex items-center gap-2">
            <button
              onClick={cancel}
              disabled={saving}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-2 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
        <div className="space-y-5">
          {LEFT.map((f) =>
            editing ? (
              <EditRow key={f.key} field={f} value={form[f.key]} onChange={change} />
            ) : (
              <ReadRow key={f.key} field={f} user={user} />
            )
          )}
        </div>
        <div className="space-y-5">
          {RIGHT.map((f) =>
            editing ? (
              <EditRow key={f.key} field={f} value={form[f.key]} onChange={change} />
            ) : (
              <ReadRow key={f.key} field={f} user={user} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
