import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import type { Placement } from '../../types';
import { formatDate, formatPackage } from '../../utils/helpers';
import { Award, Building2, Calendar, Banknote } from 'lucide-react';

const StudentPlacement = () => {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get student's placement record by fetching all placements and filtering
    Promise.all([
      api.get('/students/me').catch(() => ({ data: { data: null } })),
      api.get('/placements'),
    ]).then(([studentRes, placementsRes]) => {
      const studentId = studentRes.data.data?.id;
      if (studentId) {
        const myPlacement = placementsRes.data.data.find((p: Placement) => p.studentId === studentId);
        setPlacement(myPlacement || null);
      }
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="page-container"><div className="skeleton h-64" /></div>;

  return (
    <div className="page-container max-w-xl">
      <div className="mb-6">
        <h1 className="page-title">Placement Status</h1>
        <p className="page-subtitle">Your final placement outcome</p>
      </div>

      {!placement ? (
        <div className="empty-state mt-16">
          <div className="empty-state-icon"><Award className="w-7 h-7" /></div>
          <p className="text-slate-500 font-medium">Not yet placed</p>
          <p className="text-slate-400 text-sm mt-1">
            Apply to jobs and clear your interviews to get placed. Keep going! 💪
          </p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Congratulations Card */}
          <div className="card p-8 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900">Congratulations! 🎉</h2>
            <p className="text-emerald-700 mt-1">You've been successfully placed!</p>
          </div>

          {/* Placement Details */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-lg">{placement.company?.name}</p>
                <p className="text-slate-500 text-sm">{placement.company?.industry}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Role</p>
                <p className="font-semibold text-slate-900">{placement.role}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Package</p>
                <p className="font-semibold text-emerald-600 text-xl">{formatPackage(placement.package)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Placement Date</p>
                <p className="font-medium text-slate-700">{formatDate(placement.placementDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Joining Date</p>
                <p className="font-medium text-slate-700">{formatDate(placement.joiningDate) || 'TBD'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentPlacement;
