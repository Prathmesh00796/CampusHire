import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Pencil, Trash2, MapPin, Banknote,
  GraduationCap, Briefcase, Building2, CheckCircle2, AlertCircle,
  Calendar, Award, Sparkles, Filter
} from 'lucide-react';
import api from '../../services/api';
import type { Job, Company } from '../../types';
import { formatDate, formatPackage, getJobStatusClass } from '../../utils/helpers';

const BRANCHES = [
  'Computer Science and Engineering',
  'CSE (AI & ML)',
  'AI & Data Science',
  'Information Technology',
  'Electronics & Telecommunication',
];

const SKILLS_PRESET = [
  'Python', 'Java', 'JavaScript', 'React', 'Node.js',
  'SQL', 'Machine Learning', 'Git', 'DSA', 'Spring Boot', 'Cloud'
];

interface JobFormData {
  companyId: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  package: string;
  minimumCGPA: string;
  maximumBacklogs: string;
  eligibleBranches: string[];
  requiredSkills: string[];
  graduationYear: string;
  applicationDeadline: string;
  status: string;
}

const emptyForm: JobFormData = {
  companyId: '',
  title: '',
  description: '',
  location: 'Pune / Maharashtra',
  employmentType: 'Full-time',
  package: '6.5',
  minimumCGPA: '6.0',
  maximumBacklogs: '0',
  eligibleBranches: ['Computer Science and Engineering', 'CSE (AI & ML)', 'AI & Data Science'],
  requiredSkills: ['Python', 'SQL', 'Java'],
  graduationYear: '2027',
  applicationDeadline: '',
  status: 'OPEN',
};

const AdminJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<JobFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Delete Confirmation State
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = () => {
    setIsLoading(true);
    Promise.all([api.get('/jobs'), api.get('/companies')])
      .then(([jobsRes, companiesRes]) => {
        const jList = jobsRes.data.data || [];
        setJobs(jList);
        setCompanies(companiesRes.data.data || []);
      })
      .catch((err) => {
        console.error('Error loading jobs:', err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = jobs.filter((j) =>
      j.title.toLowerCase().includes(q) ||
      (j.company?.name || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q)
    );

    if (statusFilter !== 'ALL') {
      result = result.filter((j) => j.status === statusFilter);
    }

    setFiltered(result);
  }, [search, statusFilter, jobs]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingJob(null);
    setForm({
      ...emptyForm,
      companyId: companies.length > 0 ? String(companies[0].id) : '',
    });
    setError('');
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      companyId: String(job.companyId),
      title: job.title,
      description: job.description || '',
      location: job.location || '',
      employmentType: job.employmentType || 'Full-time',
      package: job.package !== undefined && job.package !== null ? String(job.package) : '',
      minimumCGPA: String(job.minimumCGPA ?? '6.0'),
      maximumBacklogs: String(job.maximumBacklogs ?? '0'),
      eligibleBranches: Array.isArray(job.eligibleBranches) ? job.eligibleBranches : [],
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
      graduationYear: String(job.graduationYear ?? '2027'),
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
      status: job.status || 'OPEN',
    });
    setError('');
    setShowModal(true);
  };

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

  // Save (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const payload = {
      companyId: parseInt(form.companyId),
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      employmentType: form.employmentType,
      package: form.package ? parseFloat(form.package) : null,
      minimumCGPA: parseFloat(form.minimumCGPA),
      maximumBacklogs: parseInt(form.maximumBacklogs),
      eligibleBranches: form.eligibleBranches,
      requiredSkills: form.requiredSkills,
      graduationYear: form.graduationYear ? parseInt(form.graduationYear) : 2027,
      applicationDeadline: form.applicationDeadline || null,
      status: form.status,
    };

    try {
      if (editingJob) {
        // Update existing job
        await api.put(`/jobs/${editingJob.id}`, payload);
        showToast(`Job "${form.title}" updated successfully!`);
      } else {
        // Create new job
        await api.post('/jobs', payload);
        showToast(`New placement drive for "${form.title}" created successfully!`);
      }
      setShowModal(false);
      setEditingJob(null);
      setForm(emptyForm);
      loadData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to save job. Verify details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Safe Delete with feedback
  const confirmDeleteJob = async (jobId: number) => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        showToast('Job opening deleted successfully.');
        setDeletingJobId(null);
        loadData();
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Failed to delete job.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Computed metrics
  const activeCount = jobs.filter((j) => j.status === 'OPEN').length;
  const avgPackage = jobs.length > 0
    ? (jobs.reduce((acc, j) => acc + (parseFloat(String(j.package)) || 0), 0) / jobs.length).toFixed(1)
    : '0';

  return (
    <div className="page-container max-w-7xl mx-auto py-8 px-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              DKTE TPO Operations
            </span>
            <h1 className="page-title text-2xl font-bold text-slate-900">Placement Job Drives</h1>
          </div>
          <p className="page-subtitle text-sm text-slate-500 mt-1">
            Manage company openings, minimum CGPA & backlog eligibility rules, and drive schedules
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary inline-flex items-center gap-2 shadow-md shadow-sky-500/20 px-4 py-2.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Drives</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{jobs.length}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="card p-4 border border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active & Open</p>
              <h3 className="text-2xl font-bold text-emerald-900 mt-1">{activeCount}</h3>
            </div>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="card p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average CTC</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{avgPackage} <span className="text-xs font-normal text-slate-500">LPA</span></h3>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 mb-6 border border-slate-200 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by job title, company name, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {(['ALL', 'OPEN', 'CLOSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Job Left Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0 p-1.5 shadow-xs">
                  {job.company?.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        job.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {job.status === 'OPEN' && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                      )}
                      {job.status}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-600 mt-0.5">{job.company?.name}</p>

                  {/* Criteria & Specs Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    {job.package && (
                      <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                        <Banknote className="w-3.5 h-3.5" />
                        {formatPackage(job.package)}
                      </span>
                    )}

                    <span className="inline-flex items-center font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      CGPA ≥ {job.minimumCGPA}
                    </span>

                    <span className="inline-flex items-center font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      Backlogs ≤ {job.maximumBacklogs}
                    </span>

                    <span className="inline-flex items-center font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Grad: {job.graduationYear || 2027}
                    </span>

                    {job.location && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                    )}

                    {job.applicationDeadline && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Deadline: {formatDate(job.applicationDeadline)}
                      </span>
                    )}
                  </div>

                  {/* Branches preview */}
                  {Array.isArray(job.eligibleBranches) && job.eligibleBranches.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {job.eligibleBranches.map((br) => (
                        <span key={br} className="text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                          {br}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(job)}
                  className="btn-secondary h-9 px-3.5 text-xs font-semibold inline-flex items-center gap-1.5 hover:border-sky-400 hover:text-sky-700 transition-colors shadow-2xs"
                  title="Update details of job"
                >
                  <Pencil className="w-3.5 h-3.5 text-sky-600" />
                  <span>Edit Details</span>
                </button>

                {/* Delete Button */}
                {deletingJobId === job.id ? (
                  <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-lg border border-red-200">
                    <span className="text-[11px] text-red-700 font-semibold px-1">Confirm?</span>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => confirmDeleteJob(job.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold"
                    >
                      {isDeleting ? '...' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingJobId(null)}
                      className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeletingJobId(job.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                    title="Delete job opening"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="card p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No job openings found</h3>
              <p className="text-xs text-slate-500 mt-1">Try modifying your search or click 'Post New Job' to announce a placement drive.</p>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Job Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                    {editingJob ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {editingJob ? `Edit Job Opening — ${editingJob.title}` : 'Post New Campus Job Drive'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {editingJob ? 'Update requirements, eligibility thresholds, and status' : 'Announce a new placement drive for DKTE students'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Recruiting Company *</label>
                      <select
                        className="select w-full"
                        value={form.companyId}
                        onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                        required
                      >
                        <option value="">Select Company</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Job Designation / Title *</label>
                      <input
                        className="input w-full"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Systems Engineer / Full-Stack Developer"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Job Description & Responsibilities</label>
                    <textarea
                      className="input w-full resize-none text-sm"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Outline key job roles, tech stack, and responsibilities..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Location</label>
                      <input
                        className="input w-full"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="Pune / Mumbai"
                      />
                    </div>

                    <div>
                      <label className="label">Employment Type</label>
                      <select
                        className="select w-full"
                        value={form.employmentType}
                        onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                      >
                        <option>Full-time</option>
                        <option>Internship</option>
                        <option>Internship + PPO</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Package (CTC in LPA)</label>
                      <input
                        className="input w-full"
                        type="number"
                        step="0.1"
                        value={form.package}
                        onChange={(e) => setForm({ ...form, package: e.target.value })}
                        placeholder="e.g. 7.5"
                      />
                    </div>
                  </div>

                  {/* Eligibility Constraints */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Automated Eligibility Thresholds
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">Evaluated for every student</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="label text-xs">Minimum CGPA *</label>
                        <input
                          className="input w-full"
                          type="number"
                          step="0.05"
                          min="0"
                          max="10"
                          value={form.minimumCGPA}
                          onChange={(e) => setForm({ ...form, minimumCGPA: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="label text-xs">Maximum Active Backlogs *</label>
                        <input
                          className="input w-full"
                          type="number"
                          min="0"
                          value={form.maximumBacklogs}
                          onChange={(e) => setForm({ ...form, maximumBacklogs: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="label text-xs">Graduation Year</label>
                        <input
                          className="input w-full"
                          type="number"
                          value={form.graduationYear}
                          onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label text-xs">Eligible Branches / Departments</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {BRANCHES.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => toggleBranch(b)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              form.eligibleBranches.includes(b)
                                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-sky-400'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label text-xs">Required Technical Skills</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {SKILLS_PRESET.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSkill(s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              form.requiredSkills.includes(s)
                                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-purple-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Application Deadline</label>
                      <input
                        className="input w-full"
                        type="date"
                        value={form.applicationDeadline}
                        onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="label">Drive Status</label>
                      <select
                        className="select w-full"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="OPEN">OPEN (Accepting Applications)</option>
                        <option value="CLOSED">CLOSED (Drive Finished)</option>
                        <option value="DRAFT">DRAFT (Hidden)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary px-4 py-2 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                  >
                    {isSaving ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editingJob ? 'Update Job Details' : 'Post Job Drive'}</span>
                      </>
                    )}
                  </button>
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
