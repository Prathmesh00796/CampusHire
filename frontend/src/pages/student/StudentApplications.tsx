import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import type { Application } from '../../types';
import { getApplicationStatusClass, formatDate } from '../../utils/helpers';
import { FileText, Briefcase } from 'lucide-react';

const StudentApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/applications').then((res) => {
      setApplications(res.data.data);
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="page-container"><div className="skeleton h-64" /></div>;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">{applications.length} applications submitted</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state mt-16">
          <div className="empty-state-icon"><FileText className="w-7 h-7" /></div>
          <p className="text-slate-500 font-medium">No applications yet</p>
          <p className="text-slate-400 text-sm mt-1">Explore open opportunities to start your placement journey.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{app.job?.title}</h3>
                    <p className="text-sm text-slate-500">{app.job?.company?.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Applied {formatDate(app.appliedAt)}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={getApplicationStatusClass(app.status)}>{app.status}</span>
                </div>
              </div>

              {/* Application Timeline */}
              <div className="mt-4 flex items-center gap-1">
                {['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'].map((step, i) => {
                  const statuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];
                  const currentIdx = statuses.indexOf(app.status);
                  const stepIdx = statuses.indexOf(step);
                  const isCompleted = stepIdx <= currentIdx && app.status !== 'REJECTED';
                  const isCurrent = stepIdx === currentIdx && app.status !== 'REJECTED';
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-sky-500' : 'bg-slate-200'}`} />
                        <span className={`text-xs mt-1 ${isCurrent ? 'text-sky-600 font-medium' : 'text-slate-400'}`}>{step}</span>
                      </div>
                      {i < 3 && <div className={`flex-1 h-0.5 mb-4 ${stepIdx < currentIdx && app.status !== 'REJECTED' ? 'bg-sky-500' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>

              {app.status === 'REJECTED' && (
                <p className="mt-2 text-sm text-red-500 font-medium">❌ Application rejected</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
