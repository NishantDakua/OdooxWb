'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Mail, Phone, Briefcase, Building2, MapPin, UserCog } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useHasRole } from '../../lib/roles';
import { initials } from '../../lib/format';
import { ErrorState, SkeletonBlock } from '../shared/states';
import { PrivateInfoTab } from './PrivateInfoTab';
import { SalaryInfoTab } from './SalaryInfoTab';

function HeaderField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-slate-800 font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}

// Reusable profile. Used by "My Profile" (owner, editable) and the Admin panel
// modal (isReadOnly). Never duplicated.
export function ProfileView({ userId, isReadOnly = false }) {
  const { user: authUser } = useAuth();
  const canViewSalary = useHasRole('ADMIN', 'HR');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('private');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/api/users/${userId}`);
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex gap-6">
            <SkeletonBlock className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <SkeletonBlock className="h-5 w-1/3" />
              <SkeletonBlock className="h-4 w-1/2" />
              <SkeletonBlock className="h-4 w-2/5" />
            </div>
          </div>
        </div>
        <SkeletonBlock className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!profile) return null;

  const isOwner = authUser?.id === profile.id;
  const canEdit = isOwner && !isReadOnly;

  const tabs = [
    { key: 'resume', label: 'Resume' },
    { key: 'private', label: 'Private Info' },
    ...(canViewSalary ? [{ key: 'salary', label: 'Salary Info' }] : []),
    { key: 'security', label: 'Security' },
  ];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative shrink-0">
            {profile.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profilePicture} alt={profile.name || 'Avatar'} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                {initials(profile.name)}
              </div>
            )}
            {canEdit && (
              <button
                type="button"
                title="Change photo"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 flex-1">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{profile.name || '—'}</h2>
                <p className="text-slate-500">{profile.jobTitle || '—'}</p>
              </div>
              <HeaderField icon={Mail} label="Email" value={profile.email} />
              <HeaderField icon={Phone} label="Mobile" value={profile.phone} />
            </div>
            <div className="space-y-4 md:pt-1">
              <HeaderField icon={Building2} label="Company" value={null} />
              <HeaderField icon={Briefcase} label="Department" value={profile.department} />
              <HeaderField icon={UserCog} label="Manager" value={null} />
              <HeaderField icon={MapPin} label="Location" value={profile.address} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex gap-1 border-b border-slate-100 px-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'resume' && (
            <div>
              <h4 className="text-sm font-bold text-slate-900">Resume</h4>
              <p className="text-slate-400 text-sm mt-2">No resume uploaded.</p>
            </div>
          )}

          {tab === 'private' && (
            <PrivateInfoTab
              user={profile}
              canEdit={canEdit}
              onSaved={(updated) => setProfile(updated)}
            />
          )}

          {tab === 'salary' && canViewSalary && <SalaryInfoTab userId={profile.id} />}

          {tab === 'security' && (
            <div>
              <h4 className="text-sm font-bold text-slate-900">Security</h4>
              <p className="text-slate-400 text-sm mt-2">Security settings are not available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
