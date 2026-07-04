'use client';

import { useCallback, useEffect, useState } from 'react';
import { Wallet, Pencil, Save, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useHasRole } from '../../lib/roles';
import { ErrorState, EmptyState, SkeletonBlock } from '../shared/states';
import { formatCurrency, formatNumber, toDateInputValue } from '../../lib/format';

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-slate-800 font-medium mt-1">{value}</p>
    </div>
  );
}

const inputCls =
  'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white';

function EditField({ label, type = 'number', value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}

const emptyComponent = () => ({ name: '', calculationType: 'FIXED_AMOUNT', value: '' });

function toForm(structure) {
  return {
    wageType: structure?.wageType || 'MONTHLY',
    monthlyWage: structure?.monthlyWage ?? '',
    yearlyWage: structure?.yearlyWage ?? '',
    workingHoursPerWeek: structure?.workingHoursPerWeek ?? '',
    breakTimeMinutes: structure?.breakTimeMinutes ?? '',
    employeePfPercent: structure?.employeePfPercent ?? '',
    employerPfPercent: structure?.employerPfPercent ?? '',
    professionalTax: structure?.professionalTax ?? '',
    effectiveDate: toDateInputValue(structure?.effectiveDate) || '',
    components: (structure?.components || []).map((c) => ({
      name: c.name,
      calculationType: c.calculationType,
      value: c.value,
    })),
  };
}

export function SalaryInfoTab({ userId }) {
  const canEdit = useHasRole('ADMIN', 'HR');

  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/api/salary-structure/${userId}`);
      setStructure(data);
    } catch (err) {
      setError(err.message || 'Unable to load salary structure.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = () => {
    setForm(toForm(structure));
    setSaveError('');
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setSaveError('');
  };
  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const setComp = (i, key, value) =>
    setForm((p) => ({ ...p, components: p.components.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)) }));
  const addComp = () => setForm((p) => ({ ...p, components: [...p.components, emptyComponent()] }));
  const removeComp = (i) => setForm((p) => ({ ...p, components: p.components.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const updated = await api.put(`/api/salary-structure/${userId}`, form);
      setStructure(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || 'Unable to save salary structure.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonBlock key={i} className="h-12" />)}
        </div>
        <SkeletonBlock className="h-40" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  // ---- Edit mode ----
  if (editing && form) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Edit Salary Structure</h4>
          <div className="flex items-center gap-2">
            <button onClick={cancel} disabled={saving} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>

        {saveError && <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-2 text-sm">{saveError}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Wage Type</label>
            <select value={form.wageType} onChange={(e) => set('wageType', e.target.value)} className={inputCls}>
              <option value="MONTHLY">MONTHLY</option>
              <option value="YEARLY">YEARLY</option>
            </select>
          </div>
          <EditField label="Monthly Wage" value={form.monthlyWage} onChange={(v) => set('monthlyWage', v)} />
          <EditField label="Yearly Wage" value={form.yearlyWage} onChange={(v) => set('yearlyWage', v)} />
          <EditField label="Working Hours / Week" value={form.workingHoursPerWeek} onChange={(v) => set('workingHoursPerWeek', v)} />
          <EditField label="Break Time (min)" value={form.breakTimeMinutes} onChange={(v) => set('breakTimeMinutes', v)} />
          <EditField label="Employee PF %" value={form.employeePfPercent} onChange={(v) => set('employeePfPercent', v)} />
          <EditField label="Employer PF %" value={form.employerPfPercent} onChange={(v) => set('employerPfPercent', v)} />
          <EditField label="Professional Tax" value={form.professionalTax} onChange={(v) => set('professionalTax', v)} />
          <EditField label="Effective Date" type="date" value={form.effectiveDate} onChange={(v) => set('effectiveDate', v)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900">Salary Components</h4>
            <button onClick={addComp} className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">Computed amount is calculated on the server on save.</p>
          <div className="space-y-2">
            {form.components.map((c, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input value={c.name} onChange={(e) => setComp(i, 'name', e.target.value)} placeholder="Name" className="col-span-5 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                <select value={c.calculationType} onChange={(e) => setComp(i, 'calculationType', e.target.value)} className="col-span-4 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white">
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                  <option value="PERCENTAGE">Percentage</option>
                </select>
                <input type="number" value={c.value} onChange={(e) => setComp(i, 'value', e.target.value)} placeholder="Value" className="col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                <button onClick={() => removeComp(i)} className="col-span-1 h-9 w-9 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {form.components.length === 0 && <p className="text-sm text-slate-400">No components. Click “Add”.</p>}
          </div>
        </div>
      </div>
    );
  }

  // ---- View mode ----
  if (!structure) {
    return (
      <div className="space-y-4">
        <EmptyState message="No salary structure defined yet" icon={Wallet} />
        {canEdit && (
          <div className="text-center">
            <button onClick={startEdit} className="inline-flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Define Salary Structure
            </button>
          </div>
        )}
      </div>
    );
  }

  const components = structure.components || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">Salary Structure</h4>
        {canEdit && (
          <button onClick={startEdit} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors">
            <Pencil className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Field label="Wage Type" value={structure.wageType} />
        <Field label="Monthly Wage" value={formatCurrency(structure.monthlyWage)} />
        <Field label="Yearly Wage" value={formatCurrency(structure.yearlyWage)} />
        <Field label="Working Hours / Week" value={`${formatNumber(structure.workingHoursPerWeek)} hrs`} />
        <Field label="Break Time" value={structure.breakTimeMinutes != null ? `${structure.breakTimeMinutes} min` : '—'} />
        <Field label="Employee PF %" value={`${formatNumber(structure.employeePfPercent)}%`} />
        <Field label="Employer PF %" value={`${formatNumber(structure.employerPfPercent)}%`} />
        <Field label="Professional Tax" value={formatCurrency(structure.professionalTax)} />
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">Salary Components</h4>
        {components.length === 0 ? (
          <EmptyState message="No components in this structure." icon={Wallet} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Value</th>
                  <th className="px-6 py-3 text-right">Computed Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {components.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-6 py-3 text-slate-600">{c.calculationType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}</td>
                    <td className="px-6 py-3 text-right text-slate-700">
                      {c.calculationType === 'PERCENTAGE' ? `${formatNumber(c.value)}%` : formatCurrency(c.value)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">{formatCurrency(c.computedAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
