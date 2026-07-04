'use client';

import { useCallback, useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { api } from '../../lib/api';
import { ErrorState, EmptyState, SkeletonBlock } from '../shared/states';
import { formatCurrency, formatNumber } from '../../lib/format';

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-slate-800 font-medium mt-1">{value}</p>
    </div>
  );
}

export function SalaryInfoTab({ userId }) {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/api/salary-structure/${userId}`);
      setStructure(data); // may be null (no structure defined)
    } catch (err) {
      setError(err.message || 'Unable to load salary structure.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-12" />
          ))}
        </div>
        <SkeletonBlock className="h-40" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  if (!structure) {
    return <EmptyState message="No salary structure defined yet" icon={Wallet} />;
  }

  const components = structure.components || [];

  return (
    <div className="space-y-8">
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
                    <td className="px-6 py-3 text-slate-600">
                      {c.calculationType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700">
                      {c.calculationType === 'PERCENTAGE'
                        ? `${formatNumber(c.value)}%`
                        : formatCurrency(c.value)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(c.computedAmount)}
                    </td>
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
