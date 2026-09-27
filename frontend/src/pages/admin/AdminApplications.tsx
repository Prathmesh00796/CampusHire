import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import type { Application, ApplicationStatus } from '../../types';
import { getApplicationStatusClass, formatDate, getInitials } from '../../utils/helpers';

const STATUS_TRANSITIONS: Record<ApplicationStatus, string[]> = {
  APPLIED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['SELECTED', 'REJECTED'],
  SELECTED: [],
  REJECTED: [],
};

const AdminApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filtered, setFiltered] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = () => {
    setIsLoading(true);
    api.get('/applications').then((res) => {
      setApplications(res.data.data);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let data = applications;
    if (statusFilter !== 'ALL') data = data.filter((a) => a.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((a) =>
        a.student?.fullName.toLowerCase().includes(q) ||
        a.job?.title.toLowerCase().includes(q) ||
        a.job?.company?.name.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [applications, search, statusFilter]);

  const updateStatus = async (appId: number, status: string) => {
    setUpdating(appId);
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(null);
    }
  };

  const statuses = ['ALL', 'APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Applications</h1>
        <p className="page-subtitle">{applications.length} total applications</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search student or job..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Job</th>
                <th>Company</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No applications found.</td></tr>
              ) : (
                filtered.map((app) => {
                  const nextStatuses = STATUS_TRANSITIONS[app.status] || [];
                  return (
                    <tr key={app.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                            {getInitials(app.student?.fullName || '')}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{app.student?.fullName}</p>
                            <p className="text-xs text-slate-500">{app.student?.branch}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-medium text-slate-800">{app.job?.title}</td>
                      <td className="text-slate-500">{app.job?.company?.name}</td>
                      <td className="text-slate-500 text-xs">{formatDate(app.appliedAt)}</td>
                      <td><span className={getApplicationStatusClass(app.status)}>{app.status}</span></td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {nextStatuses.map((next) => (
                            <button
                              key={next}
                              disabled={updating === app.id}
                              onClick={() => updateStatus(app.id, next)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${next === 'REJECTED' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}
                            >
                              {updating === app.id ? '…' : next}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
