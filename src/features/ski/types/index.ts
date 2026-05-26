// ============================================================
// DETAILS SKI — TypeScript Types
// ============================================================

export type SKIRoleLevel = 1 | 2 | 3 | 4 | 5;

export type SKIRoleName =
  | "super_admin"
  | "management"
  | "kepala_urusan"
  | "pic"
  | "staff";

export type SKIStatus =
  | "draft"
  | "assigned"
  | "on_progress"
  | "submitted"
  | "approved"
  | "rejected"
  | "completed";

export type SKIProgressStatus = "pending" | "approved" | "rejected";

export interface SKIRole {
  id: string;
  name: SKIRoleName;
  level: SKIRoleLevel;
  description: string | null;
  created_at: string;
}

export interface OrganizationalUnit {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_by: string | null;
  created_at: string;
  // Relations
  parent?: OrganizationalUnit;
  children?: OrganizationalUnit[];
  member_count?: number;
}

export interface UserPosition {
  id: string;
  user_id: string;
  role_id: string;
  unit_id: string | null;
  supervisor_id: string | null;
  start_date: string;
  is_active: boolean;
  created_at: string;
  // Relations
  role?: SKIRole;
  unit?: OrganizationalUnit;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    photo_url?: string;
  };
  supervisor?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface SKICategory {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface SKIIndicator {
  id: string;
  category_id: string | null;
  sku: string | null;
  weight_sku: number;
  program: string | null;
  weight_program: number;
  target_time_unit: string | null;
  target_time_value: number | null;
  target_output_unit: string | null;
  target_output_value: number | null;
  internal_relation: string | null;
  external_relation: string | null;
  notes: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  period_year: number;
  period_semester: number;
  status: SKIStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  category?: SKICategory;
  assignee?: {
    id: string;
    email: string;
    full_name?: string;
    photo_url?: string;
  };
  assigner?: {
    id: string;
    email: string;
    full_name?: string;
  };
  latest_progress?: SKIProgress;
  progress_percentage?: number;
}

export interface SKIProgress {
  id: string;
  indicator_id: string;
  user_id: string;
  progress_percentage: number;
  progress_note: string | null;
  evidence_file: string | null;
  submitted_at: string;
  verified_by: string | null;
  verification_note: string | null;
  status: SKIProgressStatus;
  // Relations
  user?: { id: string; email: string; full_name?: string };
  verifier?: { id: string; email: string; full_name?: string };
}

export interface SKILog {
  id: string;
  user_id: string | null;
  activity: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SKIAttachment {
  id: string;
  indicator_id: string;
  file_url: string;
  file_type: string | null;
  file_name: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// Dashboard analytics
export interface SKIAnalytics {
  total_indicators: number;
  by_status: Record<SKIStatus, number>;
  avg_progress: number;
  total_users: number;
  completion_rate: number;
  unit_performance: Array<{
    unit_name: string;
    avg_progress: number;
    total: number;
  }>;
}

// Form types
export interface CreateSKIIndicatorInput {
  category_id?: string;
  sku?: string;
  weight_sku?: number;
  program?: string;
  weight_program?: number;
  target_time_unit?: string;
  target_time_value?: number;
  target_output_unit?: string;
  target_output_value?: number;
  internal_relation?: string;
  external_relation?: string;
  notes?: string;
  title: string;
  description?: string;
  assigned_to?: string;
  period_year: number;
  period_semester: number;
}

export interface UpdateProgressInput {
  indicator_id: string;
  progress_percentage: number;
  progress_note?: string;
  evidence_file?: string;
}

// Status config
export const SKI_STATUS_CONFIG: Record<SKIStatus, { label: string; color: string; bg: string }> = {
  draft:       { label: "Draft",       color: "text-gray-400",   bg: "bg-gray-500/15 border-gray-500/30"   },
  assigned:    { label: "Ditugaskan",  color: "text-blue-400",   bg: "bg-blue-500/15 border-blue-500/30"   },
  on_progress: { label: "Berjalan",    color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30"},
  submitted:   { label: "Disubmit",    color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30"},
  approved:    { label: "Disetujui",   color: "text-green-400",  bg: "bg-green-500/15 border-green-500/30" },
  rejected:    { label: "Ditolak",     color: "text-red-400",    bg: "bg-red-500/15 border-red-500/30"     },
  completed:   { label: "Selesai",     color: "text-emerald-400",bg: "bg-emerald-500/15 border-emerald-500/30"},
};

export const ROLE_LABELS: Record<SKIRoleName, string> = {
  super_admin:   "Super Admin",
  management:    "Manajemen",
  kepala_urusan: "Kepala Urusan",
  pic:           "PIC",
  staff:         "Staff/Guru",
};
