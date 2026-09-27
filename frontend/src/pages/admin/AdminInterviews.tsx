import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar } from 'lucide-react';
import api from '../../services/api';
import type { Interview, Application } from '../../types';
import { formatDate, formatDateTime, getRoundLabel, getResultClass } from '../../utils/helpers';

const AdminInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    applicationId: '', round: 'TECHNICAL', scheduledDate: '',
    scheduledTime: '10:00', interviewer: '', meetingLink: '',
  });

  const load = () => {
    setIsLoading(true);
    Promise.all([
      api.get('/interviews'),
      api.get('/applications'),
    ]).then(([intRes, appRes]) => {
      setInterviews(intRes.data.data);
      // Only show shortlisted/interview-status applications
      setApplications(appRes.data.data.filter((a: Application) =>
        ['SHORTLISTED', 'INTERVIEW'].includes(a.status)
      ));
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await api.post('/interviews', { ...form, applicationId: parseInt(form.applicationId) });
      setShowModal(false);
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setIsSaving(false);
    }
  };

  const markResult = async (id: number, result: 'PASS' | 'FAIL') => {
    setUpdatingId(id);
    try {
      await api.patch(`/interviews/${id}/result`, { result });
      load();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Interviews</h1>
          <p className="page-subtitle">{interviews.filter(i => i.status === 'SCHEDULED').length} upcoming</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Schedule Interview
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16" />)}</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Job</th>
                <th>Round</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No interviews yet.</td></tr>
              ) : (
                interviews.map((interview) => (
                  <tr key={interview.id}>
                    <td className="font-medium text-slate-900">{interview.application?.student?.fullName}</td>
                    <td className="text-slate-600 text-sm">{interview.application?.job?.title}</td>
                    <td>
                      <span className="badge bg-purple-50 text-purple-700">{getRoundLabel(interview.round)}</span>
                    </td>
                    <td className="text-slate-500 text-xs">
                      {formatDateTime(interview.scheduledDate || undefined, interview.scheduledTime || undefined)}
                    </td>
                    <td>
                      <span className={`badge ${interview.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700' : interview.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {interview.status}
                      </span>
                    </td>
                    <td><span className={getResultClass(interview.result)}>{interview.result}</span></td>
                    <td>
                      {interview.status === 'SCHEDULED' && interview.result === 'PENDING' && (
                        <div className="flex gap-1.5">
                          <button disabled={updatingId === interview.id} onClick={() => markResult(interview.id, 'PASS')} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                            {updatingId === interview.id ? '…' : 'PASS'}
                          </button>
                          <button disabled={updatingId === interview.id} onClick={() => markResult(interview.id, 'FAIL')} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            FAIL
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-content">
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-900">Schedule Interview</h2>
                <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body space-y-4">
                  {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                  <div>
                    <label className="label">Application (Student) *</label>
                    <select className="select" value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: e.target.value })} required>
                      <option value="">Select application…</option>
                      {applications.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.student?.fullName} — {a.job?.title} ({a.job?.company?.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Round *</label>
                    <select className="select" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })}>
                      <option value="APTITUDE">Aptitude Test</option>
                      <option value="TECHNICAL">Technical Round</option>
                      <option value="HR">HR Interview</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Date *</label><input className="input" type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required /></div>
                    <div><label className="label">Time</label><input className="input" type="time" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} /></div>
                  </div>
                  <div><label className="label">Interviewer</label><input className="input" value={form.interviewer} onChange={(e) => setForm({ ...form, interviewer: e.target.value })} placeholder="Name of interviewer" /></div>
                  <div><label className="label">Meeting Link</label><input className="input" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Scheduling…' : 'Schedule'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminInterviews;
