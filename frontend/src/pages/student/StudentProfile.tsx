import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import type { Student } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Save, Plus, X, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

const SKILLS_PRESET = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'Machine Learning', 'TensorFlow', 'Git', 'HTML/CSS', 'AutoCAD', 'MATLAB', 'Deep Learning', 'Pandas', 'NumPy', 'PHP', 'Spring Boot', 'Django', 'Flutter', 'DSA'];

const StudentProfile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', branch: '', degree: 'B.Tech',
    graduationYear: 2027, cgpa: 0, backlogs: 0, skills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    api.get('/students/me').then((res) => {
      const s = res.data.data;
      setStudent(s);
      setForm({
        fullName: s.fullName,
        phone: s.phone || '',
        branch: s.branch,
        degree: s.degree,
        graduationYear: s.graduationYear,
        cgpa: parseFloat(String(s.cgpa)),
        backlogs: s.backlogs,
        skills: s.skills || [],
      });
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const toggleSkill = (s: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
    }));
  };

  const addCustomSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm((f) => ({ ...f, skills: [...f.skills, trimmed] }));
    }
    setNewSkill('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setIsSaving(true);
    try {
      await api.put(`/students/${student.id}`, form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        setPwdSuccess('Your password has been successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setPwdError(axiosErr.response?.data?.message || 'Failed to update password. Verify your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (isLoading) return <div className="page-container"><div className="skeleton h-64" /></div>;

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-6">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your profile updated to get matched with the best opportunities</p>
      </div>

      {saveSuccess && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile updated successfully! Technical skills updated for job eligibility matching.</span>
        </motion.div>
      )}

      {/* Verified Academic Record (Read-Only) */}
      <div className="card p-6 border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-200/60">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Verified Academic Record</h2>
              <p className="text-[11px] text-slate-500">Locked & Verified by DKTE Placement Administration</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Verified DKTE Student
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 leading-relaxed">
          <p>
            Academic metrics (PRN, Department, CGPA, and Backlogs) are strictly maintained by the college Training & Placement Cell.
            <strong className="text-slate-800"> Only Administrators can modify academic records</strong> to prevent recruiter disqualifications.
          </p>
        </div>

        {/* Read-Only Academic Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Candidate Name</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{student?.fullName || form.fullName}</div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PRN / Roll Number</div>
            <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">{student?.studentCode || '—'}</div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Department / Branch</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">{student?.branch || form.branch}</div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Degree & Passing Year</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {student?.degree || 'B.Tech'} · Class of {student?.graduationYear || 2027}
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/70 rounded-xl">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Cumulative CGPA</div>
            <div className="text-lg font-extrabold text-emerald-800 mt-0.5">
              {student?.cgpa !== undefined ? parseFloat(String(student.cgpa)).toFixed(2) : '—'} <span className="text-xs font-normal text-emerald-600">/ 10.00</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Backlogs</div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {student?.backlogs === 0 ? (
                <span className="text-emerald-700 font-semibold">0 (Clear Record)</span>
              ) : (
                <span className="text-amber-700 font-semibold">{student?.backlogs} Active</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Contact Information (Editable by Student) */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Contact Information</h2>
            <span className="text-xs text-slate-400">Editable by student</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Registered Email</label>
              <input
                className="input bg-slate-50 text-slate-500 cursor-not-allowed"
                disabled
                value={student?.email || user?.email || ''}
              />
            </div>
            <div>
              <label className="label">Contact Phone *</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>
        </div>

        {/* Technical Skills (Editable by Student) */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Technical Skills & Portfolio</h2>
            <span className="text-xs text-sky-600 font-medium">Used for job eligibility matching</span>
          </div>
          <p className="text-xs text-slate-500">
            Select or add skills you are proficient in. Our system matches these skills with criteria for TCS, Hexaware, and Capgemini drives.
          </p>

          <div className="flex flex-wrap gap-2">
            {SKILLS_PRESET.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  form.skills.includes(s)
                    ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-sky-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="input flex-1 text-sm"
              placeholder="Add other skill (e.g. Next.js, Docker, OpenCV)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
            />
            <button type="button" onClick={addCustomSkill} className="btn-secondary px-3.5 text-xs font-medium">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {form.skills.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-500 mb-2">My Selected Skills ({form.skills.length}):</div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-semibold border border-sky-200"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className="text-sky-500 hover:text-sky-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={isSaving} className="btn-primary w-full h-11 text-sm font-semibold shadow-md shadow-sky-500/20">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Profile...' : 'Save Skills & Contact'}
        </button>
      </form>

      {/* Security & Password Change */}
      <div className="card p-5 mt-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Account Security</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">Update your password to keep your placement account secure.</p>

        {pwdSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        {pwdError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="input text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input text-sm"
                required
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="input text-sm"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwdLoading}
              className="btn-secondary h-9 px-4 text-xs font-medium inline-flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              {pwdLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
