// Utility helper functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApplicationStatus, JobStatus, InterviewRound, InterviewResult } from '../types';

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable string
export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Format date + time
export function formatDateTime(dateString?: string, timeString?: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });
  if (timeString) {
    const [h, m] = timeString.split(':');
    const t = new Date();
    t.setHours(parseInt(h), parseInt(m));
    const timeStr = t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} · ${timeStr}`;
  }
  return dateStr;
}

// Get CSS class for application status badge
export function getApplicationStatusClass(status: ApplicationStatus): string {
  const classes: Record<ApplicationStatus, string> = {
    APPLIED: 'badge badge-applied',
    SHORTLISTED: 'badge badge-shortlisted',
    INTERVIEW: 'badge badge-interview',
    SELECTED: 'badge badge-selected',
    REJECTED: 'badge badge-rejected',
  };
  return classes[status] || 'badge';
}

// Get CSS class for job status badge
export function getJobStatusClass(status: JobStatus): string {
  const classes: Record<JobStatus, string> = {
    OPEN: 'badge badge-open',
    CLOSED: 'badge badge-closed',
    DRAFT: 'badge badge-draft',
  };
  return classes[status] || 'badge';
}

// Get friendly label for interview round
export function getRoundLabel(round: InterviewRound): string {
  const labels: Record<InterviewRound, string> = {
    APTITUDE: 'Aptitude Test',
    TECHNICAL: 'Technical Round',
    HR: 'HR Interview',
  };
  return labels[round] || round;
}

// Get result badge class
export function getResultClass(result: InterviewResult): string {
  if (result === 'PASS') return 'badge bg-emerald-50 text-emerald-700';
  if (result === 'FAIL') return 'badge bg-red-50 text-red-700';
  return 'badge bg-slate-100 text-slate-600';
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Format package (LPA)
export function formatPackage(pkg?: number): string {
  if (!pkg) return '—';
  return `₹${pkg} LPA`;
}

// Get greeting based on time
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
