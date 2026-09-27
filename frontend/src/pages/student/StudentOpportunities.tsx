import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Banknote, Clock, ChevronRight,
  CheckCircle2, XCircle, Building2, Briefcase,
} from 'lucide-react';
import api from '../../services/api';
import type { Job, EligibilityResult } from '../../types';
import { formatDate, formatPackage, getJobStatusClass } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';

const OpportunityCard = ({ job, studentId }: { job: Job; studentId?: number }) => {
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');

  const checkEligibility = async () => {
    if (!studentId) return;
    setIsCheckingEligibility(true);
    try {
      const res = await api.get(`/students/${studentId}/jobs/${job.id}/eligibility`);
      setEligibility(res.data.data.eligibilityResult);
      setShowEligibility(true);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    setApplyError('');
    try {
      await api.post(`/jobs/${job.id}/apply`);
      setApplied(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setApplyError(axiosErr.response?.data?.message || 'Application failed.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:shadow-md transition-shadow"
    >
      {/* Company & Job */}
      <div className="flex items-start gap-4 mb-4">
        {job.company?.logo ? (
          <img
            src={job.company.logo}
            alt={job.company.name}
            className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-100 p-1 flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">{job.title}</h3>
              <p className="text-sm text-slate-500">{job.company?.name}</p>
            </div>
            <span className={getJobStatusClass(job.status)}>{job.status}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
        {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
        {job.package && <span className="flex items-center gap-1"><Banknote className="w-3 h-3" />{formatPackage(job.package)}</span>}
        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.employmentType}</span>
        {job.applicationDeadline && (
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Deadline: {formatDate(job.applicationDeadline)}</span>
        )}
      </div>

      {/* Eligibility Criteria Summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="badge bg-slate-100 text-slate-600">CGPA ≥ {job.minimumCGPA}</span>
        <span className="badge bg-slate-100 text-slate-600">Backlogs ≤ {job.maximumBacklogs}</span>
        {job.eligibleBranches.slice(0, 3).map((b) => (
          <span key={b} className="badge bg-sky-50 text-sky-700">{b}</span>
        ))}
      </div>

      {/* Eligibility Result */}
      <AnimatePresence>
        {showEligibility && eligibility && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className={`p-4 rounded-xl border ${eligibility.eligible ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                {eligibility.eligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-semibold text-sm ${eligibility.eligible ? 'text-emerald-800' : 'text-red-800'}`}>
                  {eligibility.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}
                </span>
              </div>
              <div className="space-y-1.5">
                {eligibility.checks.map((check, i) => (
                  <div key={i} className={`flex items-start gap-2 text-xs ${check.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                    <span>{check.passed ? '✓' : '✗'}</span>
                    <span>{check.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Error */}
      {applyError && (
        <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg mb-3">{applyError}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link to={`/job/${job.id}`} className="btn-secondary py-2 text-sm flex-1 text-center">
          View Details
        </Link>
        {!applied ? (
          <>
            {!showEligibility && (
              <button
                onClick={checkEligibility}
                disabled={isCheckingEligibility || !studentId}
                className="btn-ghost py-2 text-sm border border-slate-200"
              >
                {isCheckingEligibility ? '…' : 'Check Eligibility'}
              </button>
            )}
            {showEligibility && eligibility?.eligible && (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="btn-primary py-2 text-sm"
              >
                {isApplying ? 'Applying…' : 'Apply Now'}
              </button>
            )}
          </>
        ) : (
          <span className="badge badge-applied px-4 py-2">Applied ✓</span>
        )}
      </div>
    </motion.div>
  );
};

const StudentOpportunities = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | undefined>();

  useEffect(() => {
    Promise.all([
      api.get('/jobs'),
      api.get('/students/me').catch(() => ({ data: { data: null } })),
    ]).then(([jobsRes, studentRes]) => {
      const openJobs = jobsRes.data.data.filter((j: Job) => j.status === 'OPEN');
      setJobs(openJobs);
      setFiltered(openJobs);
      setStudentId(studentRes.data.data?.id);
    }).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(jobs.filter((j) =>
      j.title.toLowerCase().includes(q) ||
      (j.company?.name || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q)
    ));
  }, [search, jobs]);

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Opportunities</h1>
        <p className="page-subtitle">{jobs.length} open positions available for your batch</p>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by job title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-56" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state mt-12">
          <div className="empty-state-icon"><Briefcase className="w-7 h-7" /></div>
          <p className="text-slate-500 font-medium">No opportunities found</p>
          <p className="text-slate-400 text-sm mt-1">Try a different search or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <OpportunityCard key={job.id} job={job} studentId={studentId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentOpportunities;
