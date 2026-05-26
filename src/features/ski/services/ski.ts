import { createClient } from "@/lib/supabase/server";
import type {
  SKIIndicator, SKIProgress, OrganizationalUnit,
  UserPosition, SKICategory, SKIAnalytics, SKIStatus,
} from "../types";

// ─── User Position ────────────────────────────────────────────

export async function getCurrentUserPosition(userId: string): Promise<UserPosition | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_positions")
    .select(`
      *,
      role:ski_roles(*),
      unit:organizational_units(*)
    `)
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  return (data as unknown as UserPosition) ?? null;
}

export async function getUserRoleLevel(userId: string): Promise<number> {
  const supabase = await createClient();

  // First check SKI-specific role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: skiLevel } = await (supabase as any).rpc("get_ski_role_level", { uid: userId });
  if (skiLevel !== null && skiLevel !== undefined) {
    return skiLevel as number;
  }

  // Fallback: check main users table role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  const role = (userData as { role: string } | null)?.role;
  if (role === "super_admin")   return 1;
  if (role === "admin_jurusan") return 2;

  return 99; // no SKI role
}

// ─── Organization ─────────────────────────────────────────────

export async function getOrganizationalUnits(): Promise<OrganizationalUnit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizational_units")
    .select("*")
    .order("name");
  return (data ?? []) as OrganizationalUnit[];
}

export async function getOrganizationTree(): Promise<OrganizationalUnit[]> {
  const units = await getOrganizationalUnits();
  const map = new Map<string, OrganizationalUnit>();
  units.forEach((u) => { map.set(u.id, { ...u, children: [] }); });

  const roots: OrganizationalUnit[] = [];
  units.forEach((u) => {
    const node = map.get(u.id)!;
    if (u.parent_id && map.has(u.parent_id)) {
      map.get(u.parent_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export async function getUsersInUnit(unitId: string): Promise<UserPosition[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_positions")
    .select(`
      *,
      role:ski_roles(*),
      unit:organizational_units(*)
    `)
    .eq("unit_id", unitId)
    .eq("is_active", true);
  return (data ?? []) as unknown as UserPosition[];
}

// ─── SKI Categories ───────────────────────────────────────────

export async function getSKICategories(): Promise<SKICategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ski_categories")
    .select("*")
    .order("name");
  return (data ?? []) as SKICategory[];
}

// ─── SKI Indicators ───────────────────────────────────────────

export async function getSKIIndicators(filters?: {
  userId?: string;
  status?: SKIStatus;
  year?: number;
  unitId?: string;
}): Promise<SKIIndicator[]> {
  const supabase = await createClient();

  let query = supabase
    .from("ski_indicators")
    .select(`
      *,
      category:ski_categories(id, name),
      assignee:users!ski_indicators_assigned_to_fkey(id, email),
      assigner:users!ski_indicators_assigned_by_fkey(id, email)
    `)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.year)   query = query.eq("period_year", filters.year);
  if (filters?.userId) query = query.eq("assigned_to", filters.userId);

  const { data } = await query;
  return (data ?? []) as unknown as SKIIndicator[];
}

export async function getSKIIndicatorById(id: string): Promise<SKIIndicator | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ski_indicators")
    .select(`
      *,
      category:ski_categories(id, name),
      assignee:users!ski_indicators_assigned_to_fkey(id, email),
      assigner:users!ski_indicators_assigned_by_fkey(id, email)
    `)
    .eq("id", id)
    .single();
  return (data as unknown as SKIIndicator) ?? null;
}

export async function getMySKIIndicators(userId: string): Promise<SKIIndicator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ski_indicators")
    .select(`
      *,
      category:ski_categories(id, name)
    `)
    .eq("assigned_to", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as SKIIndicator[];
}

// ─── SKI Progress ─────────────────────────────────────────────

export async function getSKIProgress(indicatorId: string): Promise<SKIProgress[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ski_progress")
    .select("*")
    .eq("indicator_id", indicatorId)
    .order("submitted_at", { ascending: false });
  return (data ?? []) as SKIProgress[];
}

export async function getLatestProgress(indicatorId: string): Promise<SKIProgress | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ski_progress")
    .select("*")
    .eq("indicator_id", indicatorId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();
  return (data as unknown as SKIProgress | null) ?? null;
}

// ─── Analytics ────────────────────────────────────────────────

export async function getSKIAnalytics(userId: string): Promise<SKIAnalytics> {
  const supabase = await createClient();

  const { data: indicators } = await supabase
    .from("ski_indicators")
    .select("status, assigned_to");

  const rows = (indicators ?? []) as Array<{ status: SKIStatus; assigned_to: string | null }>;

  const by_status = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<SKIStatus, number>);

  const total_indicators = rows.length;
  const completed = (by_status.completed ?? 0) + (by_status.approved ?? 0);
  const completion_rate = total_indicators > 0 ? (completed / total_indicators) * 100 : 0;

  return {
    total_indicators,
    by_status,
    avg_progress: 0,
    total_users: new Set(rows.map((r) => r.assigned_to).filter(Boolean)).size,
    completion_rate,
    unit_performance: [],
  };
}

// ─── Subordinates ─────────────────────────────────────────────

export async function getSubordinateIds(managerId: string): Promise<string[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).rpc("get_subordinate_ids", { manager_uid: managerId });
  return (data ?? []) as string[];
}

export async function getAllUsers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, email")
    .order("email");
  return (data ?? []) as Array<{ id: string; email: string }>;
}

export async function getUsersWithPositions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_positions")
    .select(`
      *,
      role:ski_roles(id, name, level),
      unit:organizational_units(id, name)
    `)
    .eq("is_active", true)
    .order("created_at");
  return (data ?? []) as unknown as UserPosition[];
}
