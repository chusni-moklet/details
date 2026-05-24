"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export async function updateUserRole(userId: string, newRole: UserRole) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Only super_admin can change roles
  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const myRole = (me as { role: string } | null)?.role;
  if (myRole !== "super_admin") {
    return { error: "Hanya Super Admin yang dapat mengubah role" };
  }

  // Prevent changing own role
  if (userId === user.id) {
    return { error: "Tidak dapat mengubah role sendiri" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("users")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}
