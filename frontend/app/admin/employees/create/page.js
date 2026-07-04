'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/AuthContext';
import { User, Mail, Shield, Phone, Building, Briefcase, MapPin, Calendar, Copy, Check, Loader2, UserPlus } from 'lucide-react';

export default function OnboardEmployeePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    jobTitle: '',
    address: '',
    role: 'EMPLOYEE',
    joiningDate: '',
  });

  const [previewId, setPreviewId] = useState('');
  const [createdEmployeeId, setCreatedEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Trigger Employee ID Preview when name, company, or joiningDate change
  useEffect(() => {
    const fetchIdPreview = async () => {
      if (formData.company.trim().length >= 2 && formData.name.trim().length >= 2 && formData.joiningDate) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/auth/preview-id?company=${encodeURIComponent(formData.company)}&name=${encodeURIComponent(formData.name)}&joiningDate=${encodeURIComponent(formData.joiningDate)}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (data.success) {
            setPreviewId(data.employeeId);
          }
        } catch (err) {
          console.error('Preview error:', err);
        }
      } else {
        setPreviewId('');
      }
    };

    fetchIdPreview();
  }, [formData.company, formData.name, formData.joiningDate, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTempPassword('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/create-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Successfully onboarded employee ${data.user.name}!`);
        setTempPassword(data.tempPassword);
        setCreatedEmployeeId(data.user.employeeId);
        // Clear Form
        setFormData({
          company: '',
          name: '',
          email: '',
          phone: '',
          department: '',
          jobTitle: '',
          address: '',
          role: 'EMPLOYEE',
          joiningDate: '',
        });
      } else {
        setError(data.message || 'Failed to onboard employee.');
      }
    } catch (err) {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Prevent employees from seeing this page
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR')) {
    if (typeof window !== 'undefined') {
      router.replace('/unauthorized');
    }
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Employee Account</h1>
            <p className="text-slate-500 text-sm">Onboard new personnel and auto-generate credentials</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-6 rounded-xl mb-8 border border-emerald-100 text-sm space-y-4">
            <div className="font-semibold text-lg flex items-center gap-2">
              <Check className="w-5 h-5 shrink-0" />
              {success}
            </div>
            <p className="text-emerald-800">
              Please share the generated credentials below with the employee. **The temporary password is only visible once!**
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Odoo India"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Employee Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="john.doe@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="department"
                  type="text"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Engineering"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="jobTitle"
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Joining</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="joiningDate"
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Street name, City, Zip"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role Selection</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="HR">HR Officer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employee ID Preview Panel */}
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
                  (Calculated dynamically based on initials, joining year, and running number)
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
