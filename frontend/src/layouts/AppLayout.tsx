import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/helpers';
import {
  LayoutDashboard, Users, Building2, Briefcase, FileText,
  Calendar, Award, BarChart3, UserCircle, LogOut, Menu, X,
  ChevronRight, GraduationCap, Search,
} from 'lucide-react';
import { cn } from '../utils/helpers';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Companies', href: '/admin/companies', icon: Building2 },
  { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Interviews', href: '/admin/interviews', icon: Calendar },
  { label: 'Placements', href: '/admin/placements', icon: Award },
];

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/student/profile', icon: UserCircle },
  { label: 'Opportunities', href: '/student/opportunities', icon: Search },
  { label: 'My Applications', href: '/student/applications', icon: FileText },
  { label: 'Interviews', href: '/student/interviews', icon: Calendar },
  { label: 'Placement', href: '/student/placement', icon: Award },
];

const recruiterNav: NavItem[] = [
  { label: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/recruiter/jobs', icon: Briefcase },
  { label: 'Applications', href: '/recruiter/applications', icon: FileText },
  { label: 'Interviews', href: '/recruiter/interviews', icon: Calendar },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isAdmin, isStudent, isRecruiter } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setMobileOpen] = useState(false);

  const navItems = isAdmin ? adminNav : isStudent ? studentNav : recruiterNav;
  const roleLabel = isAdmin ? 'Placement Officer' : isStudent ? 'Student' : 'Recruiter';
  const roleColor = isAdmin ? 'bg-violet-100 text-violet-700' : isStudent ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-500/20 flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-base font-extrabold text-slate-900 tracking-tight block">DKTE Placements</span>
            <span className="text-[11px] font-medium text-slate-500 block truncate">Training & Placement Cell</span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
            <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', roleColor)}>{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn('sidebar-link', isActive && 'sidebar-link-active')
            }
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-200 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">DKTE TEI</span>
                <span className="text-sm font-semibold text-slate-800 hidden sm:inline">DKTE Society's Textile & Engineering Institute</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">An Autonomous Institute · Training & Placement Assistance Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
