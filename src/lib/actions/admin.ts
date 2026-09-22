"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertStaff() {
  await requireRole(["admin", "owner"]);
}

export async function approveSalon(formData: FormData) {
  await assertStaff();
  const salonId = String(formData.get("salonId") ?? "");
  const admin = createAdminClient();
  await admin.from("salons").update({ status: "approved" }).eq("id", salonId);
  revalidatePath("/pro/admin");
}

export async function rejectSalon(formData: FormData) {
  await assertStaff();
  const salonId = String(formData.get("salonId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const admin = createAdminClient();
  await admin.from("salons").update({ status: "rejected", admin_note: note }).eq("id", salonId);
  revalidatePath("/pro/admin");
}

export async function suspendSalon(formData: FormData) {
  await assertStaff();
  const salonId = String(formData.get("salonId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const admin = createAdminClient();
  await admin.from("salons").update({ status: "suspended", admin_note: note }).eq("id", salonId);
  revalidatePath("/pro/admin");
}

function failAdmins(message: string): never {
  redirect(`/pro/admin/administrateurs?erreur=${encodeURIComponent(message)}`);
}

/** Réservé au rôle "owner" : promeut un compte au rôle admin. */
export async function addAdmin(formData: FormData) {
  const account = await requireRole(["owner"]);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) failAdmins("Adresse e-mail invalide.");

  const admin = createAdminClient();
  const { data: existing } = await admin.from("accounts").select("*").eq("email", email).maybeSingle();

  if (existing) {
    if (existing.role === "owner") failAdmins("Ce compte est déjà propriétaire.");
    await admin.from("accounts").update({ role: "admin" }).eq("id", existing.id);
  } else {
    await admin.from("accounts").insert({ email, role: "admin" });
  }

  void account;
  revalidatePath("/pro/admin/administrateurs");
}

/** Réservé au rôle "owner" : rétrograde un administrateur en compte pro. */
export async function removeAdmin(formData: FormData) {
  await requireRole(["owner"]);
  const accountId = String(formData.get("accountId") ?? "");

  const admin = createAdminClient();
  const { error } = await admin.from("accounts").update({ role: "pro" }).eq("id", accountId);
  if (error) failAdmins(error.message);

  revalidatePath("/pro/admin/administrateurs");
}
