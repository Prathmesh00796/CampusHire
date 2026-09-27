import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import type { Student } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Save, Plus, X } from 'lucide-react';

const SKILLS_PRESET = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'Machine Learning', 'TensorFlow', 'Git', 'HTML/CSS', 'AutoCAD', 'MATLAB', 'Deep Learning', 'Pandas', 'NumPy', 'PHP', 'Spring Boot', 'Django', 'Flutter', 'DSA'];

const StudentProfile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', branch: '', degree: 'B.Tech',
    graduationYear: 2025, cgpa: 0, backlogs: 0, skills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');

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

  if (isLoading) return <div className="page-container"><div className="skeleton h-64" /></div>;

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-6">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your profile updated to get matched with the best opportunities</p>
      </div>

      {saveSuccess && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
          <span>✅</span> Profile updated successfully!
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Branch</label>
              <select className="select" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                {['CSE', 'AI & ML', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Data Science'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Degree</label>
              <select className="select" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })}>
                {['B.Tech', 'B.E.', 'MCA', 'M.Tech', 'BCA', 'B.Sc'].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="label">Grad Year</label><input className="input" type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value) })} /></div>
          </div>
        </div>

        {/* Academic */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Academic Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CGPA</label>
              <input className="input" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: parseFloat(e.target.value) })} />
              <p className="text-xs text-slate-400 mt-1">Out of 10.00</p>
            </div>
            <div>
              <label className="label">Active Backlogs</label>
              <input className="input" type="number" min="0" value={form.backlogs} onChange={(e) => setForm({ ...form, backlogs: parseInt(e.target.value) })} />
              <p className="text-xs text-slate-400 mt-1">Enter 0 if none</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Skills</h2>
          <p className="text-xs text-slate-500">Select all skills you have. These are used for eligibility matching.</p>

          <div className="flex flex-wrap gap-2">
            {SKILLS_PRESET.map((s) => (
              <button key={s} type="button" onClick={() => toggleSkill(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.skills.includes(s) ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-400'}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Add custom skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
            />
            <button type="button" onClick={addCustomSkill} className="btn-secondary px-3">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">
                  {s}
                  <button type="button" onClick={() => toggleSkill(s)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSaving} className="btn-primary w-full h-11">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default StudentProfile;
