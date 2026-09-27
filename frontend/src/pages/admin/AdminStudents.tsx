import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, Award, Filter } from 'lucide-react';
import api from '../../services/api';
import type { Student } from '../../types';
import { getInitials } from '../../utils/helpers';

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/students').then((res) => {
      setStudents(res.data.data);
      setFiltered(res.data.data);
    }).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = students.filter((s) =>
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q)
    );

    if (selectedBranch !== 'ALL') {
      result = result.filter((s) => s.branch === selectedBranch);
    }

    setFiltered(result);
  }, [search, selectedBranch, students]);

  const branches = [
    'ALL',
    'Computer Science and Engineering',
    'CSE (AI & ML)',
    'AI & Data Science',
  ];

  return (
    <div className="page-container max-w-7xl mx-auto py-8 px-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">DKTE Registry</span>
            <h1 className="page-title text-2xl font-bold text-slate-900">Student Placement Directory</h1>
          </div>
          <p className="page-subtitle text-sm text-slate-500 mt-1">
            Displaying {filtered.length} of {students.length} verified candidate profiles for campus recruitment
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            Eligible for TCS (≥ 6.0): {students.filter(s => Number(s.cgpa) >= 6.0).length}
          </div>
          <div className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Hexaware (≥ 7.5): {students.filter(s => Number(s.cgpa) >= 7.5).length}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="card p-4 mb-6 bg-white border border-slate-200 shadow-sm rounded-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name, PRN (e.g. 24UAM302), or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-full text-sm"
            />
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 px-1">
              <Filter className="w-3.5 h-3.5" /> Dept:
            </span>
            {branches.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  selectedBranch === b
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b === 'ALL' ? 'All Depts' : b === 'Computer Science and Engineering' ? 'CSE' : b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">PRN No.</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Department / Branch</th>
                <th className="py-3.5 px-4 text-center">CGPA</th>
                <th className="py-3.5 px-4 text-center">Backlogs</th>
                <th className="py-3.5 px-4">Drives Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 font-medium">
                    No matching students found.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const cgpaNum = Number(student.cgpa);
                  const isHexawareEligible = cgpaNum >= 7.5;
                  const isTcsEligible = cgpaNum >= 6.0;

                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">
                          {student.studentCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {getInitials(student.fullName)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{student.fullName}</p>
                            <p className="text-xs text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                          student.branch.includes('AI & ML')
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : student.branch.includes('Data Science')
                            ? 'bg-teal-50 text-teal-700 border border-teal-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {student.branch}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          cgpaNum >= 8.5
                            ? 'bg-emerald-100 text-emerald-800'
                            : cgpaNum >= 7.5
                            ? 'bg-blue-100 text-blue-800'
                            : cgpaNum >= 6.0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {cgpaNum.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          student.backlogs === 0
                            ? 'text-slate-600 bg-slate-100'
                            : 'text-rose-700 bg-rose-50 border border-rose-200'
                        }`}>
                          {student.backlogs}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isHexawareEligible && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Hexaware
                            </span>
                          )}
                          {isTcsEligible && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              TCS
                            </span>
                          )}
                          {isTcsEligible && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Capgemini
                            </span>
                          )}
                          {!isTcsEligible && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              Needs Improvement
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
