import { createClient } from "@/lib/supabase/server";
import type { Account, Salon } from "@/lib/types";

export async function getSalonsByStatus(status: Salon["status"]) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("salons")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Salon[];
}

export async function getStaffAccounts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .in("role", ["admin", "owner"])
    .order("role")
    .order("email");

  if (error) throw error;
  return (data ?? []) as Account[];
}
