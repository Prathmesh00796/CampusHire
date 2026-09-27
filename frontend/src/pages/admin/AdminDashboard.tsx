import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Building2, Briefcase, FileText, Calendar,
  Award, TrendingUp, ChevronRight, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../../services/api';
import type { DashboardStats, Application, Interview } from '../../types';
import { formatDate, formatDateTime, getApplicationStatusClass } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { getGreeting } from '../../utils/helpers';

const STATUS_COLORS: Record<string, string> = {
  APPLIED: '#3b82f6',
  SHORTLISTED: '#f59e0b',
  INTERVIEW: '#8b5cf6',
  SELECTED: '#10b981',
  REJECTED: '#ef4444',
};

const StatCard = ({
  label, value, icon: Icon, iconBg, iconColor, suffix = '',
}: {
  label: string; value: number | string; icon: React.ElementType;
  iconBg: string; iconColor: string; suffix?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="stat-card"
  >
    <div className={`stat-icon ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 leading-none">
        {value}{suffix}
      </p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [chartData, setChartData] = useState<Array<{ status: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, appsRes, interviewsRes, chartRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-applications'),
          api.get('/dashboard/upcoming-interviews'),
          api.get('/dashboard/application-status-chart'),
        ]);
        setStats(statsRes.data.data);
        setRecentApps(appsRes.data.data);
        setUpcomingInterviews(interviewsRes.data.data);
        setChartData(chartRes.data.data);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="page-subtitle">Here's what's happening with placements today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon={Users} iconBg="bg-sky-50" iconColor="text-sky-500" />
        <StatCard label="Companies" value={stats?.totalCompanies || 0} icon={Building2} iconBg="bg-violet-50" iconColor="text-violet-500" />
        <StatCard label="Active Jobs" value={stats?.activeJobs || 0} icon={Briefcase} iconBg="bg-amber-50" iconColor="text-amber-500" />
        <StatCard label="Applications" value={stats?.totalApplications || 0} icon={FileText} iconBg="bg-emerald-50" iconColor="text-emerald-500" />
        <StatCard label="Upcoming Interviews" value={stats?.upcomingInterviews || 0} icon={Calendar} iconBg="bg-rose-50" iconColor="text-rose-500" />
        <StatCard label="Selected" value={stats?.selectedCandidates || 0} icon={Award} iconBg="bg-teal-50" iconColor="text-teal-500" />
        <StatCard label="Placements" value={stats?.totalPlacements || 0} icon={TrendingUp} iconBg="bg-indigo-50" iconColor="text-indigo-500" />
        <StatCard label="Placement Rate" value={stats?.placementRate || 0} icon={TrendingUp} iconBg="bg-lime-50" iconColor="text-lime-600" suffix="%" />
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Application Status Bar Chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Applications by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Placement Pie */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Placement Overview</h2>
          {stats && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Placed', value: stats.totalPlacements },
                    { name: 'Not Placed', value: Math.max(0, stats.totalStudents - stats.totalPlacements) },
                  ]}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex justify-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Placed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />Not Placed</span>
          </div>
        </div>
      </div>

      {/* Recent Applications + Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
            <span className="text-xs text-slate-400">Last 10</span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentApps.length === 0 ? (
              <div className="empty-state py-10">
                <p className="text-slate-400 text-sm">No applications yet.</p>
              </div>
            ) : (
              recentApps.slice(0, 6).map((app) => (
                <div key={app.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{app.student?.fullName}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{app.job?.title} · {app.job?.company?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className={getApplicationStatusClass(app.status)}>{app.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Upcoming Interviews</h2>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingInterviews.length === 0 ? (
              <div className="empty-state py-10">
                <p className="text-slate-400 text-sm">No upcoming interviews.</p>
              </div>
            ) : (
              upcomingInterviews.slice(0, 6).map((interview) => (
                <div key={interview.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {interview.application?.student?.fullName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {interview.round} · {interview.application?.job?.title}
                      </p>
                    </div>
                    <span className="text-xs text-sky-600 font-medium whitespace-nowrap ml-3">
                      {formatDateTime(interview.scheduledDate, interview.scheduledTime)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
