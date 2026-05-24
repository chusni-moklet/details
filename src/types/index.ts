// ============================================================
// DETAILS — Core Type Definitions
// ============================================================

export type UserRole = "teacher" | "admin_jurusan" | "super_admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  teacher_count?: number;
}

export interface Skill {
  id: string;
  teacher_id: string;
  skill_name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Certification {
  id: string;
  teacher_id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expired_date: string | null;
  credential_url: string | null;
  file_url: string | null;
  is_verified: boolean;
}

export interface Portfolio {
  id: string;
  teacher_id: string;
  title: string;
  description: string;
  media_url: string | null;
  type: "project" | "publication" | "award" | "other";
  year: number | null;
  organizer: string | null;
  level: string | null;
  certificate_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  teacher_id: string;
  title: string;
  year: number;
  description: string;
}

export interface ProfileView {
  id: string;
  teacher_id: string;
  visitor_ip: string;
  viewed_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  nickname: string | null;
  photo_url: string | null;
  bio: string | null;
  motto: string | null;
  department_id: string | null;
  subject: string | null;
  experience: number | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  instagram: string | null;
  created_at: string;
  // Relations
  department?: Department;
  skills?: Skill[];
  certifications?: Certification[];
  portfolios?: Portfolio[];
  achievements?: Achievement[];
  profile_views?: ProfileView[];
  _count?: {
    certifications: number;
    profile_views: number;
    portfolios: number;
  };
}

export interface TeacherWithStats extends Omit<Teacher, "profile_views"> {
  certification_count: number;
  view_count: number;
  portfolio_count: number;
  completion_percentage: number;
  // profile_views may be partial (id-only) when fetched for count purposes
  profile_views?: Array<Partial<ProfileView> & { id: string }>;
}

// Analytics
export interface AnalyticsData {
  total_teachers: number;
  total_certifications: number;
  total_views: number;
  active_teachers: number;
  departments: Array<{ name: string; count: number }>;
  top_teachers: TeacherWithStats[];
}

// Profile completion
export interface ProfileCompletion {
  percentage: number;
  items: Array<{
    label: string;
    completed: boolean;
    weight: number;
  }>;
}

// Search & Filter
export interface TeacherFilters {
  query?: string;
  department_id?: string;
  skill?: string;
  subject?: string;
  has_certification?: boolean;
  sort?: "name" | "views" | "certifications" | "newest";
}

// Hall of Fame
export interface HallOfFameEntry {
  teacher: TeacherWithStats;
  rank: number;
  score: number;
}
