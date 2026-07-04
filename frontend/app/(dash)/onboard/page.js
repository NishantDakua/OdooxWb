'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { RoleGate } from '@/components/auth/RoleGate';
import {
  User, Mail, Shield, Phone, Building, Briefcase, MapPin, Calendar, Copy, Check, Loader2, UserPlus,
} from 'lucide-react';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const EMPTY_FORM = {
  company: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  jobTitle: '',
  address: '',
  role: 'EMPLOYEE',
  joiningDate: '',
};

function OnboardForm() {
  const { token } = useAuth();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [previewId, setPreviewId] = useState('');
  const [createdEmployeeId, setCreatedEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Live Employee ID preview when company + name + joiningDate are filled.
  useEffect(() => {
    let active = true;
    const fetchIdPreview = async () => {
      if (
        formData.company.trim().length >= 2 &&
        formData.name.trim().length >= 2 &&
        formData.joiningDate
      ) {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/auth/preview-id?company=${encodeURIComponent(formData.company)}&name=${encodeURIComponent(formData.name)}&joiningDate=${encodeURIComponent(formData.joiningDate)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (active) setPreviewId(data.success ? data.employeeId : '');
        } catch {
          if (active) setPreviewId('');
        }
      } else if (active) {
        setPreviewId('');
      }
    };
    fetchIdPreview();
    return () => {
      active = false;
    };
  }, [formData.company, formData.name, formData.joiningDate, token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOnboard = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTempPassword('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/create-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(`Successfully onboarded employee ${data.user.name}!`);
        setTempPassword(data.tempPassword);
        setCreatedEmployeeId(data.user.employeeId);
        setFormData(EMPTY_FORM);
        setPreviewId('');
      } else {
        setError(data.message || 'Failed to onboard employee.');
      }
    } catch {
      setError('Network error or server is down.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, setCopiedState) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Onboard Employee</h1>
            <p className="text-slate-500 text-sm">Create a new account and auto-generate credentials.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">{error}</div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-6 rounded-xl mb-8 border border-emerald-100 text-sm space-y-4">
            <div className="font-semibold text-lg flex items-center gap-2">
              <Check className="w-5 h-5 shrink-0" />
              {success}
            </div>
            <p className="text-emerald-800">
              Share the generated credentials below with the employee. The temporary password is only visible once.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-emerald-200">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Generated Employee ID</p>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                  <code className="text-sm font-mono font-bold text-slate-800">{createdEmployeeId}</code>
                  <button
                    onClick={() => copyToClipboard(createdEmployeeId, setCopiedId)}
                    className="text-slate-500 hover:text-blue-600 p-1 transition-colors"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Temporary Password</p>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                  <code className="text-sm font-mono font-bold text-slate-800">{tempPassword}</code>
                  <button
                    onClick={() => copyToClipboard(tempPassword, setCopiedPassword)}
                    className="text-slate-500 hover:text-blue-600 p-1 transition-colors"
                  >
                    {copiedPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleOnboard} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Company Name" icon={Building}>
              <input name="company" type="text" required value={formData.company} onChange={handleChange} className={inputCls} placeholder="e.g. Odoo India" />
            </Field>
            <Field label="Employee Name" icon={User}>
              <input name="name" type="text" required value={formData.name} onChange={handleChange} className={inputCls} placeholder="John Doe" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Email Address" icon={Mail}>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className={inputCls} placeholder="john.doe@company.com" />
            </Field>
            <Field label="Phone Number" icon={Phone}>
              <input name="phone" type="text" value={formData.phone} onChange={handleChange} className={inputCls} placeholder="+91 90000 00000" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Department" icon={Building}>
              <input name="department" type="text" required value={formData.department} onChange={handleChange} className={inputCls} placeholder="e.g. Engineering" />
            </Field>
            <Field label="Job Title" icon={Briefcase}>
              <input name="jobTitle" type="text" required value={formData.jobTitle} onChange={handleChange} className={inputCls} placeholder="e.g. Frontend Engineer" />
            </Field>
            <Field label="Date of Joining" icon={Calendar}>
              <input name="joiningDate" type="date" required value={formData.joiningDate} onChange={handleChange} className={`${inputCls} text-slate-700`} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Address" icon={MapPin}>
              <input name="address" type="text" value={formData.address} onChange={handleChange} className={inputCls} placeholder="Street, City, Zip" />
            </Field>
            <Field label="Role" icon={Shield}>
              <select name="role" value={formData.role} onChange={handleChange} className={`${inputCls} bg-white`}>
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR Officer</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </Field>
          </div>

          {previewId && (
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
                Generated Employee ID Preview
              </span>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono font-bold text-blue-700 bg-white px-3 py-1 rounded border border-blue-100">
                  {previewId}
                </code>
                <span className="text-xs text-slate-500">
                  Calculated from initials, joining year, and running number.
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus size={20} />}
            Onboard Employee
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all';

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        {children}
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <RoleGate
      roles={['ADMIN', 'HR']}
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-slate-500">You do not have access to this page.</p>
        </div>
      }
    >
      <OnboardForm />
    </RoleGate>
  );
}
