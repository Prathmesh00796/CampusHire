import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DemoCredential {
  role: string;
  email: string;
  password: string;
  color: string;
}

const demoCredentials: DemoCredential[] = [
  { role: 'Student (Prathmesh)', email: 'prathmeshchopade96@gmail.com', password: 'Student@123', color: 'bg-emerald-50 border-emerald-300 hover:border-emerald-500 text-emerald-800' },
  { role: 'Placement Admin', email: 'admin@dkte.ac.in', password: 'Admin@123', color: 'bg-blue-50 border-blue-300 hover:border-blue-500 text-blue-800' },
  { role: 'Recruiter (TCS)', email: 'recruiter@tcs.com', password: 'Recruiter@123', color: 'bg-purple-50 border-purple-300 hover:border-purple-500 text-purple-800' },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect based on role stored in localStorage after login
      const savedUser = JSON.parse(localStorage.getItem('campushire_user') || '{}');
      if (savedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (savedUser.role === 'STUDENT') navigate('/student/dashboard');
      else navigate('/recruiter/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (cred: DemoCredential) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight block">DKTE Placements</span>
              <span className="text-xs text-blue-300 font-medium">Training & Placement Cell</span>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Autonomous Institute · Ichalkaranji
              </span>
              <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mt-4">
                DKTE Society's<br />Textile & Engineering Institute
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-base leading-relaxed max-w-md"
            >
              Centralized campus hiring platform managing verified student profiles, department eligibility evaluations, and placement drives for TCS, Hexaware, Capgemini, and premier recruiters.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-3 gap-6"
          >
            {[
              { value: '50+', label: 'Students' },
              { value: '10+', label: 'Companies' },
              { value: '15+', label: 'Openings' },
            ].map((stat) => (
              <div key={stat.label} className="border border-slate-700 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 text-slate-500 text-sm"
        >
          © 2025 CampusHire. Smart Placement Management.
        </motion.div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">CampusHire</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-1 text-sm">Sign in to your CampusHire account</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2 h-10"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#F8FAFC] text-xs text-slate-400">Demo credentials</span>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="space-y-2">
            {demoCredentials.map((cred) => (
              <button
                key={cred.role}
                type="button"
                onClick={() => fillDemo(cred)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cred.color}`}
              >
                <div className="font-semibold text-slate-800">{cred.role}</div>
                <div className="text-slate-500 text-xs mt-0.5">{cred.email}</div>
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center mt-5">
            Click any card above to fill credentials, then sign in.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
