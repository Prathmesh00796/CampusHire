import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Award, Banknote } from 'lucide-react';
import api from '../../services/api';
import type { Placement, Student, Company, Job, Application } from '../../types';
import { formatDate, formatPackage, getInitials } from '../../utils/helpers';

const AdminPlacements = () => {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedApps, setSelectedApps] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    applicationId: '', studentId: '', companyId: '', jobId: '',
    role: '', package: '', joiningDate: '',
  });

  const load = () => {
    setIsLoading(true);
    Promise.all([
      api.get('/placements'),
      api.get('/applications'),
      api.get('/companies'),
    ]).then(([placRes, appRes, compRes]) => {
      setPlacements(placRes.data.data);
      setSelectedApps(appRes.data.data.filter((a: Application) => a.status === 'SELECTED'));
      setCompanies(compRes.data.data);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAppSelect = (appId: string) => {
    const app = selectedApps.find((a) => String(a.id) === appId);
    if (app) {
      setForm({
        ...form,
        applicationId: appId,
        studentId: String(app.studentId),
        companyId: String(app.job?.companyId || ''),
        jobId: String(app.jobId),
        role: app.job?.title || '',
        package: String(app.job?.package || ''),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await api.post('/placements', {
        studentId: parseInt(form.studentId),
        companyId: parseInt(form.companyId),
        jobId: parseInt(form.jobId),
        role: form.role,
        package: form.package ? parseFloat(form.package) : undefined,
        joiningDate: form.joiningDate,
      });
      setShowModal(false);
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to create placement.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Placements</h1>
          <p className="page-subtitle">{placements.length} students placed</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Placement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-3xl font-bold text-slate-900">{placements.length}</p>
          <p className="text-sm text-slate-500 mt-1">Students Placed</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-bold text-emerald-600">
            {placements.length > 0
              ? `₹${(placements.reduce((sum, p) => sum + (parseFloat(String(p.package || 0))), 0) / placements.length).toFixed(1)}`
              : '—'}
          </p>
          <p className="text-sm text-slate-500 mt-1">Avg Package (LPA)</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-bold text-sky-600">
            {placements.length > 0
              ? `₹${Math.max(...placements.map((p) => parseFloat(String(p.package || 0)))).toFixed(1)}`
              : '—'}
          </p>
          <p className="text-sm text-slate-500 mt-1">Highest Package (LPA)</p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Company</th>
                <th>Role</th>
                <th>Package</th>
                <th>Joining Date</th>
                <th>Placed On</th>
              </tr>
            </thead>
            <tbody>
              {placements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="empty-state">
                      <div className="empty-state-icon"><Award className="w-7 h-7" /></div>
                      <p className="text-slate-500 font-medium">No placements yet</p>
                      <p className="text-slate-400 text-sm mt-1">Select candidates and add placement records.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                placements.map((p) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
                          {getInitials(p.student?.fullName || '')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{p.student?.fullName}</p>
                          <p className="text-xs text-slate-500">{p.student?.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium text-slate-800">{p.company?.name}</td>
                    <td className="text-slate-600">{p.role}</td>
                    <td>
                      <span className="font-semibold text-emerald-600">{formatPackage(p.package)}</span>
                    </td>
                    <td className="text-slate-500 text-xs">{formatDate(p.joiningDate)}</td>
                    <td className="text-slate-500 text-xs">{formatDate(p.placementDate)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-content">
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-900">Create Placement Record</h2>
                <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body space-y-4">
                  {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                  <div>
                    <label className="label">Select Selected Application *</label>
                    <select className="select" value={form.applicationId} onChange={(e) => handleAppSelect(e.target.value)} required>
                      <option value="">Choose a selected candidate…</option>
                      {selectedApps.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.student?.fullName} — {a.job?.title} @ {a.job?.company?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Role</label><input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required /></div>
                    <div><label className="label">Package (LPA)</label><input className="input" type="number" step="0.5" value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} /></div>
                  </div>
                  <div><label className="label">Joining Date</label><input className="input" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Saving…' : '🎉 Confirm Placement'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPlacements;
