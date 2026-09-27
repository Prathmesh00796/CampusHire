import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, FileText, Calendar, Award, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import type { Student, Application, Interview, Job } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getGreeting, formatDateTime, getApplicationStatusClass } from '../../utils/helpers';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [eligibleJobs, setEligibleJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentRes, appsRes, interviewsRes, jobsRes] = await Promise.all([
          api.get('/students/me'),
          api.get('/applications'),
          api.get('/interviews'),
          api.get('/jobs'),
        ]);
        const studentData = studentRes.data.data;
        setStudent(studentData);
        setApplications(appsRes.data.data);
        setInterviews(interviewsRes.data.data);
        setEligibleJobs(jobsRes.data.data.filter((j: Job) => j.status === 'OPEN').slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const upcomingInterview = interviews.find((i) => i.status === 'SCHEDULED');
  const selectedApp = applications.find((a) => a.status === 'SELECTED');

  if (isLoading) {
    return (
      <div className="page-container space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)}
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {eligibleJobs.length > 0
            ? `You have ${eligibleJobs.length} open opportunities to explore.`
            : 'Keep your profile updated to unlock more opportunities.'}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Applications', value: applications.length, icon: FileText, color: 'bg-sky-50 text-sky-500' },
          { label: 'Shortlisted', value: applications.filter(a => a.status === 'SHORTLISTED').length, icon: CheckCircle, color: 'bg-amber-50 text-amber-500' },
          { label: 'Interviews', value: interviews.length, icon: Calendar, color: 'bg-purple-50 text-purple-500' },
          { label: 'Placed', value: selectedApp ? 1 : 0, icon: Award, color: 'bg-emerald-50 text-emerald-500' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color.split(' ')[0]}`}>
              <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Your Profile</h2>
          {student ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Branch</span>
                <span className="font-medium text-slate-900">{student.branch}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">CGPA</span>
                <span className={`font-semibold ${parseFloat(String(student.cgpa)) >= 7.5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {parseFloat(String(student.cgpa)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Backlogs</span>
                <span className={`font-medium ${student.backlogs === 0 ? 'text-emerald-600' : 'text-red-600'}`}>{student.backlogs}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Grad Year</span>
                <span className="font-medium text-slate-900">{student.graduationYear}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(student.skills || []).map((skill) => (
                    <span key={skill} className="badge bg-sky-50 text-sky-700">{skill}</span>
                  ))}
                </div>
              </div>
              <Link to="/student/profile" className="btn-secondary w-full mt-2 text-center text-sm">
                Edit Profile
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No profile found.</p>
              <Link to="/student/profile" className="btn-primary mt-3">Complete Profile</Link>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Interview */}
          {upcomingInterview && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 border-l-4 border-l-purple-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Your Next Interview</p>
                  <h3 className="font-semibold text-slate-900">
                    {upcomingInterview.round} Round
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {upcomingInterview.application?.job?.title} · {upcomingInterview.application?.job?.company?.name}
                  </p>
                  <p className="text-sm font-medium text-purple-700 mt-2">
                    📅 {formatDateTime(upcomingInterview.scheduledDate || undefined, upcomingInterview.scheduledTime || undefined)}
                  </p>
                </div>
                <span className="badge bg-purple-50 text-purple-700">{upcomingInterview.round}</span>
              </div>
            </motion.div>
          )}

          {/* Placement Status */}
          {selectedApp && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 bg-emerald-50 border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">🎉 Congratulations! You're placed!</p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    {selectedApp.job?.title} at {selectedApp.job?.company?.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Explore Opportunities CTA */}
          <div className="card p-5 bg-slate-900 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Explore Opportunities</h3>
                <p className="text-slate-300 text-sm mt-1">
                  {eligibleJobs.length} open positions available right now
                </p>
              </div>
              <Link to="/student/opportunities" className="btn-primary flex-shrink-0">
                View Jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recent Applications */}
          {applications.length > 0 && (
            <div className="card">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
                <Link to="/student/applications" className="text-xs text-sky-500 hover:text-sky-700">View all</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 4).map((app) => (
                  <div key={app.id} className="px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{app.job?.title}</p>
                      <p className="text-xs text-slate-500">{app.job?.company?.name}</p>
                    </div>
                    <span className={getApplicationStatusClass(app.status)}>{app.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
