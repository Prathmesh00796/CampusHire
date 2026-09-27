import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Building2 } from 'lucide-react';
import api from '../../services/api';
import type { Company } from '../../types';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filtered, setFiltered] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', industry: '', website: '', location: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setIsLoading(true);
    api.get('/companies').then((res) => {
      setCompanies(res.data.data);
      setFiltered(res.data.data);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(companies.filter((c) =>
      c.name.toLowerCase().includes(q) || (c.industry || '').toLowerCase().includes(q)
    ));
  }, [search, companies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await api.post('/companies', form);
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', industry: '', website: '', location: '', description: '' });
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to create company.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">{companies.length} companies registered</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search companies..."
            value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <motion.div key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-100 p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{company.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{company.industry}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                {company.location && <p>📍 {company.location}</p>}
                {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">🌐 {company.website}</a>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Company Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="modal-content">
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-900">Add Company</h2>
                <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body space-y-4">
                  {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                  <div><label className="label">Company Name *</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Zoho Corporation" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                    <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Industry</label><input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="IT Services" /></div>
                    <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Pune, Maharashtra" /></div>
                  </div>
                  <div><label className="label">Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://company.com" /></div>
                  <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Saving…' : 'Add Company'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCompanies;
