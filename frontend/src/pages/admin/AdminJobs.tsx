import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Pencil, Trash2, ChevronRight, MapPin, Banknote } from 'lucide-react';
import api from '../../services/api';
import type { Job, Company } from '../../types';
import { formatDate, formatPackage, getJobStatusClass } from '../../utils/helpers';

const BRANCHES = ['CSE', 'AI & ML', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Data Science'];
const SKILLS_PRESET = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'Machine Learning', 'TensorFlow', 'Git', 'HTML/CSS', 'AutoCAD', 'MATLAB'];

const AdminJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = {
    companyId: '', title: '', description: '', location: '', employmentType: 'Full-time',
    package: '', minimumCGPA: '6.0', maximumBacklogs: '0',
    eligibleBranches: [] as string[], requiredSkills: [] as string[],
    graduationYear: '2025', applicationDeadline: '', status: 'OPEN',
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setIsLoading(true);
    Promise.all([api.get('/jobs'), api.get('/companies')]).then(([jobsRes, companiesRes]) => {
      setJobs(jobsRes.data.data);
      setFiltered(jobsRes.data.data);
      setCompanies(companiesRes.data.data);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(jobs.filter((j) =>
      j.title.toLowerCase().includes(q) || (j.company?.name || '').toLowerCase().includes(q)
    ));
  }, [search, jobs]);

  const toggleBranch = (b: string) => {
    setForm((f) => ({
      ...f,
      eligibleBranches: f.eligibleBranches.includes(b)
        ? f.eligibleBranches.filter((x) => x !== b)
        : [...f.eligibleBranches, b],
    }));
  };

  const toggleSkill = (s: string) => {
    setForm((f) => ({
      ...f,
      requiredSkills: f.requiredSkills.includes(s)
        ? f.requiredSkills.filter((x) => x !== s)
        : [...f.requiredSkills, s],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await api.post('/jobs', {
        ...form,
        companyId: parseInt(form.companyId),
        package: form.package ? parseFloat(form.package) : undefined,
        minimumCGPA: parseFloat(form.minimumCGPA),
        maximumBacklogs: parseInt(form.maximumBacklogs),
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
      });
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to create job.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (jobId: number) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    await api.delete(`/jobs/${jobId}`);
    load();
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">{jobs.filter(j => j.status === 'OPEN').length} open positions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Post Job
        </button>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {job.company?.logo ? (
                  <img src={job.company.logo} alt={job.company.name} className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-100 p-1 flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{job.title}</h3>
                    <span className={getJobStatusClass(job.status)}>{job.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{job.company?.name}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                    {job.package && <span className="flex items-center gap-1"><Banknote className="w-3 h-3" />{formatPackage(job.package)}</span>}
                    <span>CGPA ≥ {job.minimumCGPA}</span>
                    <span>Backlogs ≤ {job.maximumBacklogs}</span>
                    {job.applicationDeadline && <span>Deadline: {formatDate(job.applicationDeadline)}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <Link to={`/job/${job.id}`} className="btn-ghost py-1.5 px-3 text-xs">View</Link>
                <button onClick={() => handleDelete(job.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search className="w-7 h-7" /></div>
              <p className="text-slate-500 font-medium">No jobs found</p>
            </div>
          )}
        </div>
      )}

      {/* Create Job Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="modal-content w-full max-w-2xl">
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-900">Post New Job</h2>
                <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body space-y-4">
                  {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Company *</label>
                      <select className="select" value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} required>
                        <option value="">Select company</option>
                        {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Job Title *</label>
                      <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Software Developer" required />
                    </div>
                  </div>

                  <div>
                    <label className="label">Job Description</label>
                    <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the role..." />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label">Location</label>
                      <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Pune, India" />
                    </div>
                    <div>
                      <label className="label">Employment Type</label>
                      <select className="select" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                        <option>Full-time</option>
                        <option>Internship</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Package (LPA)</label>
                      <input className="input" type="number" step="0.5" value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} placeholder="7.5" />
                    </div>
                  </div>

                  {/* Eligibility Criteria */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50">
                    <h3 className="text-sm font-semibold text-slate-700">Eligibility Criteria</h3>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="label">Min CGPA *</label>
                        <input className="input" type="number" step="0.1" min="0" max="10" value={form.minimumCGPA} onChange={(e) => setForm({ ...form, minimumCGPA: e.target.value })} required />
                      </div>
                      <div>
                        <label className="label">Max Backlogs *</label>
                        <input className="input" type="number" min="0" value={form.maximumBacklogs} onChange={(e) => setForm({ ...form, maximumBacklogs: e.target.value })} required />
                      </div>
                      <div>
                        <label className="label">Graduation Year</label>
                        <input className="input" type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className="label">Eligible Branches</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {BRANCHES.map((b) => (
                          <button key={b} type="button" onClick={() => toggleBranch(b)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${form.eligibleBranches.includes(b) ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-400'}`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label">Required Skills</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {SKILLS_PRESET.map((s) => (
                          <button key={s} type="button" onClick={() => toggleSkill(s)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${form.requiredSkills.includes(s) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Application Deadline</label>
                      <input className="input" type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="OPEN">OPEN</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Posting…' : 'Post Job'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminJobs;
