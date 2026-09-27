import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Pencil, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import type { Student } from '../../types';
import { getInitials, formatDate } from '../../utils/helpers';

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/students').then((res) => {
      setStudents(res.data.data);
      setFiltered(res.data.data);
    }).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(students.filter((s) =>
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q)
    ));
  }, [search, students]);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} students registered</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, branch, or student code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14" />)}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Backlogs</th>
                <th>Grad Year</th>
                <th>Skills</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                          {getInitials(student.fullName)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{student.fullName}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-slate-100 text-slate-700">{student.branch}</span>
                    </td>
                    <td>
                      <span className={`font-semibold ${parseFloat(String(student.cgpa)) >= 7.5 ? 'text-emerald-600' : parseFloat(String(student.cgpa)) >= 6.5 ? 'text-amber-600' : 'text-red-600'}`}>
                        {parseFloat(String(student.cgpa)).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={student.backlogs === 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                        {student.backlogs}
                      </span>
                    </td>
                    <td className="text-slate-600">{student.graduationYear}</td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(student.skills || []).slice(0, 3).map((skill) => (
                          <span key={skill} className="badge bg-sky-50 text-sky-700">{skill}</span>
                        ))}
                        {(student.skills || []).length > 3 && (
                          <span className="badge bg-slate-100 text-slate-500">+{student.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-slate-500 text-xs">{formatDate(student.createdAt)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
