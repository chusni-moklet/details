"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoleLevel } from "../services/ski";
import type { SKIStatus } from "../types";

// ─── helpers ─────────────────────────────────────────────────

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any, table: string): any {
  return supabase.from(table);
}

// ─── Organization ─────────────────────────────────────────────

export async function createOrganizationalUnit(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const level = await getUserRoleLevel(user.id);
  if (level > 2) return { error: "Tidak memiliki akses" };

  const { error } = await db(supabase, "organizational_units").insert({
    name:        formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    parent_id:   (formData.get("parent_id") as string) || null,
    created_by:  user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/organization");
  return { success: true };
}

export async function updateOrganizationalUnit(unitId: string, formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const level = await getUserRoleLevel(user.id);
  if (level > 2) return { error: "Tidak memiliki akses" };

  const { error } = await db(supabase, "organizational_units")
    .update({
      name:        formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      parent_id:   (formData.get("parent_id") as string) || null,
    })
    .eq("id", unitId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/organization");
  return { success: true };
}

export async function deleteOrganizationalUnit(unitId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const level = await getUserRoleLevel(user.id);
  if (level > 1) return { error: "Hanya Super Admin yang dapat menghapus unit" };

  const { error } = await supabase.from("organizational_units").delete().eq("id", unitId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/organization");
  return { success: true };
}

// ─── User Positions ───────────────────────────────────────────

export async function assignUserPosition(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const level = await getUserRoleLevel(user.id);
  if (level > 3) return { error: "Tidak memiliki akses" };

  const targetUserId = formData.get("user_id") as string;
  const roleId       = formData.get("role_id") as string;
  const unitId       = (formData.get("unit_id") as string) || null;
  const supervisorId = (formData.get("supervisor_id") as string) || null;

  // Deactivate existing position
  await db(supabase, "user_positions")
    .update({ is_active: false })
    .eq("user_id", targetUserId)
    .eq("is_active", true);

  // Create new position
  const { error } = await db(supabase, "user_positions").insert({
    user_id:       targetUserId,
    role_id:       roleId,
    unit_id:       unitId,
    supervisor_id: supervisorId,
    start_date:    new Date().toISOString().split("T")[0],
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/roles");
  return { success: true };
}

// ─── SKI Categories ───────────────────────────────────────────

export async function createSKICategory(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const { error } = await db(supabase, "ski_categories").insert({
    name:        formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    created_by:  user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/ski");
  return { success: true };
}

// ─── SKI Indicators ───────────────────────────────────────────

export async function createSKIIndicator(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const level = await getUserRoleLevel(user.id);
  if (level > 3) return { error: "Hanya Kepala Urusan ke atas yang dapat membuat indikator SKI" };

  const assignedTo = (formData.get("assigned_to") as string) || null;

  const { data, error } = await db(supabase, "ski_indicators").insert({
    category_id:         (formData.get("category_id") as string) || null,
    sku:                 (formData.get("sku") as string) || null,
    weight_sku:          Number(formData.get("weight_sku") ?? 0),
    program:             (formData.get("program") as string) || null,
    weight_program:      Number(formData.get("weight_program") ?? 0),
    target_time_unit:    (formData.get("target_time_unit") as string) || null,
    target_time_value:   formData.get("target_time_value") ? Number(formData.get("target_time_value")) : null,
    target_output_unit:  (formData.get("target_output_unit") as string) || null,
    target_output_value: formData.get("target_output_value") ? Number(formData.get("target_output_value")) : null,
    internal_relation:   (formData.get("internal_relation") as string) || null,
    external_relation:   (formData.get("external_relation") as string) || null,
    notes:               (formData.get("notes") as string) || null,
    title:               formData.get("title") as string,
    description:         (formData.get("description") as string) || null,
    assigned_to:         assignedTo,
    assigned_by:         assignedTo ? user.id : null,
    period_year:         Number(formData.get("period_year") ?? new Date().getFullYear()),
    period_semester:     Number(formData.get("period_semester") ?? 1),
    status:              assignedTo ? "assigned" : "draft",
    created_by:          user.id,
  }).select().single();

  if (error) return { error: error.message };

  // Log
  await db(supabase, "ski_logs").insert({
    user_id:     user.id,
    activity:    "create_indicator",
    description: `Membuat indikator SKI: ${formData.get("title")}`,
  });

  revalidatePath("/dashboard/ski");
  return { success: true, id: (data as { id: string }).id };
}

export async function updateSKIStatus(indicatorId: string, status: SKIStatus, note?: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const { error } = await db(supabase, "ski_indicators")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", indicatorId);

  if (error) return { error: error.message };

  await db(supabase, "ski_logs").insert({
    user_id:     user.id,
    activity:    `status_${status}`,
    description: note ?? `Status SKI diubah ke ${status}`,
    metadata:    { indicator_id: indicatorId },
  });

  revalidatePath("/dashboard/ski");
  revalidatePath("/dashboard/ski/monitoring");
  return { success: true };
}

export async function deleteSKIIndicator(indicatorId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const level = await getUserRoleLevel(user.id);
  if (level > 3) return { error: "Tidak memiliki akses" };

  const { error } = await supabase.from("ski_indicators").delete().eq("id", indicatorId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/ski");
  return { success: true };
}

// ─── SKI Progress ─────────────────────────────────────────────

export async function submitSKIProgress(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const indicatorId = formData.get("indicator_id") as string;
  const percentage  = Number(formData.get("progress_percentage") ?? 0);

  const { error } = await db(supabase, "ski_progress").insert({
    indicator_id:        indicatorId,
    user_id:             user.id,
    progress_percentage: percentage,
    progress_note:       (formData.get("progress_note") as string) || null,
    evidence_file:       (formData.get("evidence_file") as string) || null,
    status:              "pending",
  });

  if (error) return { error: error.message };

  // Update indicator status
  await db(supabase, "ski_indicators")
    .update({ status: percentage >= 100 ? "submitted" : "on_progress", updated_at: new Date().toISOString() })
    .eq("id", indicatorId);

  await db(supabase, "ski_logs").insert({
    user_id:     user.id,
    activity:    "submit_progress",
    description: `Submit progress ${percentage}%`,
    metadata:    { indicator_id: indicatorId, percentage },
  });

  revalidatePath("/dashboard/ski");
  return { success: true };
}

export async function approveProgress(progressId: string, note?: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const level = await getUserRoleLevel(user.id);
  if (level > 3) return { error: "Tidak memiliki akses untuk approval" };

  const { data: progress } = await supabase
    .from("ski_progress")
    .select("indicator_id, progress_percentage")
    .eq("id", progressId)
    .single();

  const { error } = await db(supabase, "ski_progress")
    .update({
      status:            "approved",
      verified_by:       user.id,
      verification_note: note ?? null,
    })
    .eq("id", progressId);

  if (error) return { error: error.message };

  // If 100%, mark indicator as completed
  if (progress && (progress as { progress_percentage: number }).progress_percentage >= 100) {
    await db(supabase, "ski_indicators")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", (progress as { indicator_id: string }).indicator_id);
  }

  revalidatePath("/dashboard/ski/monitoring");
  return { success: true };
}

export async function rejectProgress(progressId: string, note: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const level = await getUserRoleLevel(user.id);
  if (level > 3) return { error: "Tidak memiliki akses" };

  const { data: progress } = await supabase
    .from("ski_progress")
    .select("indicator_id")
    .eq("id", progressId)
    .single();

  const { error } = await db(supabase, "ski_progress")
    .update({ status: "rejected", verified_by: user.id, verification_note: note })
    .eq("id", progressId);

  if (error) return { error: error.message };

  if (progress) {
    await db(supabase, "ski_indicators")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", (progress as { indicator_id: string }).indicator_id);
  }

  revalidatePath("/dashboard/ski/monitoring");
  return { success: true };
}
