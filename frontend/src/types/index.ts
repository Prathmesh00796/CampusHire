// TypeScript types for the entire CampusHire application

export type UserRole = 'ADMIN' | 'STUDENT' | 'RECRUITER';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

export type InterviewRound = 'APTITUDE' | 'TECHNICAL' | 'HR';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export type InterviewResult = 'PENDING' | 'PASS' | 'FAIL';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  student?: Student | null;
}

export interface Student {
  id: number;
  userId: number;
  studentCode: string;
  fullName: string;
  email: string;
  phone?: string;
  branch: string;
  degree: string;
  graduationYear: number;
  cgpa: number;
  backlogs: number;
  skills: string[];
  resumeUrl?: string;
  profileImage?: string;
  createdAt: string;
  user?: User;
}

export interface Company {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  industry?: string;
  website?: string;
  location?: string;
  description?: string;
  logo?: string;
}

export interface Job {
  id: number;
  companyId: number;
  title: string;
  description?: string;
  location?: string;
  employmentType: string;
  package?: number;
  minimumCGPA: number;
  maximumBacklogs: number;
  eligibleBranches: string[];
  requiredSkills: string[];
  graduationYear?: number;
  applicationDeadline?: string;
  status: JobStatus;
  company?: Company;
  applicationCount?: number;
  createdAt: string;
}

export interface Application {
  id: number;
  studentId: number;
  jobId: number;
  status: ApplicationStatus;
  appliedAt: string;
  shortlistedAt?: string;
  rejectedAt?: string;
  student?: Student;
  job?: Job;
  interviews?: Interview[];
  createdAt: string;
}

export interface Interview {
  id: number;
  applicationId: number;
  round: InterviewRound;
  scheduledDate?: string;
  scheduledTime?: string;
  interviewer?: string;
  meetingLink?: string;
  location?: string;
  notes?: string;
  status: InterviewStatus;
  result: InterviewResult;
  application?: Application;
  createdAt: string;
}

export interface Placement {
  id: number;
  studentId: number;
  companyId: number;
  jobId: number;
  role: string;
  package?: number;
  joiningDate?: string;
  placementDate?: string;
  status: string;
  student?: Student;
  company?: Company;
  job?: Job;
}

export interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  activeJobs: number;
  totalApplications: number;
  upcomingInterviews: number;
  selectedCandidates: number;
  totalPlacements: number;
  placementRate: number;
}

export interface EligibilityCheck {
  name: string;
  passed: boolean;
  message: string;
}

export interface EligibilityResult {
  eligible: boolean;
  score: number;
  checks: EligibilityCheck[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
