// Recruiter pages — reuse Admin components with appropriate permissions
// Recruiter Dashboard
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, FileText, Calendar, Users } from 'lucide-react';
import api from '../../services/api';
import type { Job, Application, Interview } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getGreeting, getApplicationStatusClass, formatDateTime } from '../../utils/helpers';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs'),
      api.get('/applications'),
      api.get('/interviews'),
    ]).then(([jobsRes, appsRes, interviewsRes]) => {
      setJobs(jobsRes.data.data);
      setApplications(appsRes.data.data);
      setInterviews(interviewsRes.data.data.filter((i: Interview) => i.status === 'SCHEDULED'));
    }).finally(() => setIsLoading(false));
  }, []);

  const stats = [
    { label: 'Active Jobs', value: jobs.filter(j => j.status === 'OPEN').length, icon: Briefcase, color: 'bg-sky-50 text-sky-500' },
    { label: 'Applications', value: applications.length, icon: FileText, color: 'bg-amber-50 text-amber-500' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'SHORTLISTED').length, icon: Users, color: 'bg-emerald-50 text-emerald-500' },
    { label: 'Upcoming Interviews', value: interviews.length, icon: Calendar, color: 'bg-purple-50 text-purple-500' },
  ];

  if (isLoading) return <div className="page-container"><div className="skeleton h-64" /></div>;

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Manage your job postings and candidate pipeline.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color.split(' ')[0]}`}>
              <s.icon className={`w-5 h-5 ${s.color.split(' ')[1]}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
            <Link to="/recruiter/applications" className="text-xs text-sky-500">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{app.student?.fullName}</p>
                  <p className="text-xs text-slate-500">{app.job?.title}</p>
                </div>
                <span className={getApplicationStatusClass(app.status)}>{app.status}</span>
              </div>
            ))}
            {applications.length === 0 && <div className="px-5 py-8 text-center text-slate-400 text-sm">No applications yet.</div>}
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Upcoming Interviews</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {interviews.slice(0, 5).map((i) => (
              <div key={i.id} className="px-5 py-3.5">
                <p className="text-sm font-medium text-slate-900">{i.application?.student?.fullName}</p>
                <p className="text-xs text-slate-500">{i.round} · {formatDateTime(i.scheduledDate || undefined, i.scheduledTime || undefined)}</p>
              </div>
            ))}
            {interviews.length === 0 && <div className="px-5 py-8 text-center text-slate-400 text-sm">No upcoming interviews.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
