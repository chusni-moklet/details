export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type UserRole = "teacher" | "admin_jurusan" | "super_admin";
export type PortfolioType = "project" | "publication" | "award" | "other";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          created_at?: string;
        };
      };
      teachers: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          full_name: string;
          nickname?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          motto?: string | null;
          department_id?: string | null;
          subject?: string | null;
          experience?: number | null;
          linkedin?: string | null;
          github?: string | null;
          website?: string | null;
          instagram?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          full_name?: string;
          nickname?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          motto?: string | null;
          department_id?: string | null;
          subject?: string | null;
          experience?: number | null;
          linkedin?: string | null;
          github?: string | null;
          website?: string | null;
          instagram?: string | null;
          created_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          icon: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          teacher_id: string;
          skill_name: string;
          level: SkillLevel;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          skill_name: string;
          level: SkillLevel;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          skill_name?: string;
          level?: SkillLevel;
        };
      };
      certifications: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          issuer: string;
          issue_date: string;
          expired_date: string | null;
          credential_url: string | null;
          file_url: string | null;
          is_verified: boolean;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          issuer: string;
          issue_date: string;
          expired_date?: string | null;
          credential_url?: string | null;
          file_url?: string | null;
          is_verified?: boolean;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          title?: string;
          issuer?: string;
          issue_date?: string;
          expired_date?: string | null;
          credential_url?: string | null;
          file_url?: string | null;
          is_verified?: boolean;
        };
      };
      portfolios: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          description: string;
          media_url: string | null;
          type: PortfolioType;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          description: string;
          media_url?: string | null;
          type: PortfolioType;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          title?: string;
          description?: string;
          media_url?: string | null;
          type?: PortfolioType;
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          year: number;
          description: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          year: number;
          description: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          title?: string;
          year?: number;
          description?: string;
        };
      };
      profile_views: {
        Row: {
          id: string;
          teacher_id: string;
          visitor_ip: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          visitor_ip: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          visitor_ip?: string;
          viewed_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      skill_level: SkillLevel;
      portfolio_type: PortfolioType;
    };
  };
}

// Convenience row types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
