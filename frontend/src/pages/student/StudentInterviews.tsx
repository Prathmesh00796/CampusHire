import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import type { Interview } from '../../types';
import { formatDateTime, getRoundLabel, getResultClass } from '../../utils/helpers';
import { Calendar, Video } from 'lucide-react';

const StudentInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/interviews').then((res) => {
      setInterviews(res.data.data);
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="page-container"><div className="skeleton h-64" /></div>;

  const upcoming = interviews.filter((i) => i.status === 'SCHEDULED');
  const past = interviews.filter((i) => i.status !== 'SCHEDULED');

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Interviews</h1>
        <p className="page-subtitle">{upcoming.length} upcoming · {past.length} completed</p>
      </div>

      {interviews.length === 0 ? (
        <div className="empty-state mt-16">
          <div className="empty-state-icon"><Calendar className="w-7 h-7" /></div>
          <p className="text-slate-500 font-medium">No upcoming interviews</p>
          <p className="text-slate-400 text-sm mt-1">You're all caught up. Apply to jobs to get interview calls.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((interview) => (
                  <motion.div key={interview.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 border-l-4 border-l-sky-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge bg-purple-50 text-purple-700">{getRoundLabel(interview.round)}</span>
                          <span className="badge bg-blue-50 text-blue-700">Scheduled</span>
                        </div>
                        <h3 className="font-semibold text-slate-900">{interview.application?.job?.title}</h3>
                        <p className="text-sm text-slate-500">{interview.application?.job?.company?.name}</p>
                        <p className="text-sm font-medium text-sky-600 mt-2">
                          📅 {formatDateTime(interview.scheduledDate || undefined, interview.scheduledTime || undefined)}
                        </p>
                        {interview.interviewer && (
                          <p className="text-xs text-slate-400 mt-1">Interviewer: {interview.interviewer}</p>
                        )}
                      </div>
                      {interview.meetingLink && (
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-primary py-1.5 px-3 text-xs flex-shrink-0">
                          <Video className="w-3.5 h-3.5" /> Join
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Completed</h2>
              <div className="space-y-2">
                {past.map((interview) => (
                  <div key={interview.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{getRoundLabel(interview.round)} — {interview.application?.job?.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(interview.scheduledDate || undefined)}</p>
                    </div>
                    <span className={getResultClass(interview.result)}>{interview.result}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentInterviews;
